// backend/cron.js
import cron from 'node-cron';
import { Booking, Equipment, Invoice, isDbConnected, localDb, logAudit } from './db.js';

// Setup background tasks
export function setupCronJobs() {
  console.log('⏰ Scheduling background tasks...');

  // 1. Return Overdue and Late Penalty Calculation (Every hour or daily - let's set to every minute for simulation/testing, and daily for prod)
  cron.schedule('*/30 * * * * *', async () => {
    // console.log('🔄 Checking for overdue rentals and calculating penalties...');
    const now = new Date();

    if (isDbConnected()) {
      try {
        const activeBookings = await Booking.find({
          status: 'Issued',
          endDate: { $lt: now }
        }).populate('equipment');

        for (const booking of activeBookings) {
          const overdueTimeMs = now - new Date(booking.endDate);
          const overdueDays = Math.ceil(overdueTimeMs / (1000 * 60 * 60 * 24));
          if (overdueDays > 0) {
            const dailyRate = booking.rentalRate;
            // 1.5x penalty rate for overdue
            const penalty = Math.round(overdueDays * dailyRate * 1.5);
            
            if (booking.penalty !== penalty) {
              const oldPenalty = booking.penalty;
              booking.penalty = penalty;
              await booking.save();

              // Update invoice
              const invoice = await Invoice.findOne({ booking: booking._id });
              if (invoice) {
                invoice.penalty = penalty;
                invoice.totalAmount = invoice.amount + invoice.tax + penalty;
                await invoice.save();
              }

              console.log(`⚠️ Applied late penalty of ₹${penalty} on Booking ID ${booking._id}`);
              await logAudit(null, null, 'Late Fee Penalty', oldPenalty, penalty, `System calculated auto late fee for booking ${booking._id}`);
            }
          }
        }
      } catch (err) {
        console.error('Error running overdue cron:', err);
      }
    } else {
      // Memory fallback overdue check
      const bookings = localDb.read('bookings');
      const invoices = localDb.read('invoices');
      let changed = false;

      bookings.forEach(booking => {
        if (booking.status === 'Issued' && new Date(booking.endDate) < now) {
          const overdueTimeMs = now - new Date(booking.endDate);
          const overdueDays = Math.ceil(overdueTimeMs / (1000 * 60 * 60 * 24));
          if (overdueDays > 0) {
            const penalty = Math.round(overdueDays * booking.dailyPrice * 1.5);
            if (booking.penalty !== penalty) {
              const oldPenalty = booking.penalty || 0;
              booking.penalty = penalty;
              changed = true;

              const invoice = invoices.find(inv => inv.booking === booking.id);
              if (invoice) {
                invoice.penalty = penalty;
                invoice.totalAmount = invoice.amount + invoice.tax + penalty;
              }
              console.log(`⚠️ Memory-fallback: Applied late penalty of ₹${penalty} on Booking ID ${booking.id}`);
              logAudit(null, null, 'Late Fee Penalty', oldPenalty, penalty, `System calculated auto late fee for booking ${booking.id}`);
            }
          }
        }
      });

      if (changed) {
        localDb.write('bookings', bookings);
        localDb.write('invoices', invoices);
      }
    }
  });

  // 2. Automated Maintenance threshold check — auto-send individual units to maintenance at >= 350 usage hours
  cron.schedule('*/45 * * * * *', async () => {
    // console.log('⚙️ Scanning individual fleet units for preventative maintenance...');
    
    if (isDbConnected()) {
      try {
        const equipments = await Equipment.find({});

        for (const eq of equipments) {
          let updated = false;
          const oldStatus = eq.status;

          if (eq.units && eq.units.length > 0) {
            eq.units.forEach(unit => {
              if (unit.hours >= 350 && unit.status !== 'Under Maintenance') {
                unit.status = 'Under Maintenance';
                updated = true;
                console.log(`🔧 Unit #${unit.unitNum} of ${eq.name} auto-sent to Under Maintenance (reached ${unit.hours} hours)`);
              }
            });
          }

          if (updated) {
            // Check if there is still at least one available unit
            const hasAvailable = eq.units.some(u => u.status === 'Available' || u.status === 'Rented' || u.status === 'Reserved');
            eq.status = hasAvailable ? 'Available' : 'Under Maintenance';
            await eq.save();
            await logAudit(null, null, 'Unit Auto Maintenance', oldStatus, eq.status, `${eq.name} units processed for preventative maintenance`);
          }
        }
      } catch (err) {
        console.error('Error running maintenance cron:', err);
      }
    } else {
      const equipment = localDb.read('equipment');
      let changed = false;

      equipment.forEach(eq => {
        let updated = false;
        const oldStatus = eq.status;

        if (eq.units && eq.units.length > 0) {
          eq.units.forEach(unit => {
            if (unit.hours >= 350 && unit.status !== 'Under Maintenance') {
              unit.status = 'Under Maintenance';
              updated = true;
              console.log(`🔧 Memory-fallback: Unit #${unit.unitNum} of ${eq.name} auto-sent to Under Maintenance (reached ${unit.hours} hours)`);
            }
          });
        }

        if (updated) {
          const hasAvailable = eq.units.some(u => u.status === 'Available' || u.status === 'Rented' || u.status === 'Reserved');
          eq.status = hasAvailable ? 'Available' : 'Under Maintenance';
          changed = true;
          logAudit(null, null, 'Unit Auto Maintenance', oldStatus, eq.status, `${eq.name} units processed for preventative maintenance`);
        }
      });

      if (changed) {
        localDb.write('equipment', equipment);
      }
    }
  });
}
