// backend/services/rotationService.js
import { User, Job, isDbConnected, localDb } from '../db.js';

let rotationPointer = 0;

/**
 * Automatic Operator Rotation Service
 * Finds the next eligible operator based on availability, schedule overlap, and persistent rotation index.
 */
export async function findNextEligibleOperator({ equipment, startDate, durationDays, district, taluk, hubId, equipmentType }) {
  const start = new Date(startDate || Date.now());
  const end = new Date(start);
  end.setDate(end.getDate() + parseInt(durationDays || 1));

  const targetTaluk = taluk || equipment?.taluk || '';
  const targetDistrict = district || equipment?.district || '';
  const targetHub = hubId || equipment?.cooperativeHub || '';

  let operators = [];
  let existingJobs = [];

  if (isDbConnected()) {
    let locationFilter = {};

    if (targetTaluk) {
      const talukRegex = new RegExp(targetTaluk.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');
      locationFilter = {
        $or: [
          { taluk: talukRegex },
          { cooperativeHub: talukRegex }
        ]
      };
    } else if (targetHub) {
      const hubClean = targetHub.replace(/ (Cooperative )?Hub$/i, '').trim();
      const hubRegex = new RegExp(hubClean.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');
      locationFilter = {
        $or: [
          { cooperativeHub: hubRegex },
          { taluk: hubRegex }
        ]
      };
    } else if (targetDistrict) {
      const distRegex = new RegExp(`^${targetDistrict.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i');
      locationFilter = { district: distRegex };
    }

    operators = await User.find({
      role: { $in: ['Equipment Operator', 'Operator'] },
      ...locationFilter
    });

    // Fallback to district if no operators found for specific taluk/hub
    if (operators.length === 0 && targetDistrict) {
      operators = await User.find({
        role: { $in: ['Equipment Operator', 'Operator'] },
        district: new RegExp(`^${targetDistrict.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i')
      });
    }

    // Global fallback if still no operators found
    if (operators.length === 0) {
      operators = await User.find({ role: { $in: ['Equipment Operator', 'Operator'] } });
    }

    existingJobs = await Job.find({
      status: { $in: ['ASSIGNED', 'ACCEPTED', 'PRECHECK', 'READY', 'IN_PROGRESS', 'PAUSED', 'Assigned', 'Started', 'CANCELLATION_REQUESTED'] }
    });
  } else {
    const users = localDb.read('users') || [];
    let allOps = users.filter(u => 
      (u.role === 'Equipment Operator' || u.role === 'Operator')
    );

    if (targetTaluk) {
      const tNorm = targetTaluk.toLowerCase();
      operators = allOps.filter(u => 
        (u.taluk && u.taluk.toLowerCase() === tNorm) ||
        (u.cooperativeHub && u.cooperativeHub.toLowerCase().includes(tNorm))
      );
    } else if (targetHub) {
      const hNorm = targetHub.toLowerCase().replace(/ (cooperative )?hub$/, '').trim();
      operators = allOps.filter(u => 
        (u.cooperativeHub && u.cooperativeHub.toLowerCase().includes(hNorm)) ||
        (u.taluk && u.taluk.toLowerCase().includes(hNorm))
      );
    } else if (targetDistrict) {
      const dNorm = targetDistrict.toLowerCase();
      operators = allOps.filter(u => u.district && u.district.toLowerCase() === dNorm);
    }

    if (operators.length === 0 && targetDistrict) {
      const dNorm = targetDistrict.toLowerCase();
      operators = allOps.filter(u => u.district && u.district.toLowerCase() === dNorm);
    }

    if (operators.length === 0) {
      operators = allOps;
    }

    const jobs = localDb.read('jobs') || [];
    existingJobs = jobs.filter(j => 
      ['ASSIGNED', 'ACCEPTED', 'PRECHECK', 'READY', 'IN_PROGRESS', 'PAUSED', 'Assigned', 'Started', 'CANCELLATION_REQUESTED'].includes(j.status)
    );
  }

  if (!operators || operators.length === 0) {
    return null;
  }

  // Filter operators by no overlapping jobs for the requested start -> end window
  const eligibleOperators = operators.filter(op => {
    const opIdStr = (op._id || op.id)?.toString();
    
    // Check overlapping active jobs for this operator
    const hasOverlap = existingJobs.some(j => {
      const jOpIdStr = (j.operator?._id || j.operator?.id || j.operator)?.toString();
      if (jOpIdStr !== opIdStr) return false;

      const jStart = new Date(j.startDate || j.scheduledDate || j.createdAt);
      const duration = j.durationDays || j.expectedDuration || 1;
      const jEnd = new Date(jStart.getTime() + duration * 24 * 60 * 60 * 1000);

      return (jStart <= end && jEnd >= start);
    });

    return !hasOverlap;
  });

  const pool = eligibleOperators.length > 0 ? eligibleOperators : operators;

  // Rotation selection
  const selectedIndex = rotationPointer % pool.length;
  const selectedOperator = pool[selectedIndex];
  rotationPointer++;

  return selectedOperator;
}
