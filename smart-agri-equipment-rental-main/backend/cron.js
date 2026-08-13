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

  // 2. Automated Maintenance threshold check (Cross-reference hours to put equipment under maintenance if threshold >= 100 hrs)
  cron.schedule('*/45 * * * * *', async () => {
    // console.log('⚙️ Scanning equipment usage hours for preventative maintenance...');
    
    if (isDbConnected()) {
      try {
        const equipments = await Equipment.find({
          status: { $in: ['Available', 'Reserved'] },
          totalUsageHours: { $gte: 100 } // Maintenance threshold
        });

        for (const eq of equipments) {
          const oldStatus = eq.status;
          eq.status = 'Under Maintenance';
          await eq.save();

          console.log(`🔧 Equipment ${eq.name} status updated to Under Maintenance (Crossed 100 usage hours threshold)`);
          await logAudit(null, null, 'Maintenance Status Update', oldStatus, 'Under Maintenance', `${eq.name} reached 100 usage hours`);
        }
      } catch (err) {
        console.error('Error running maintenance cron:', err);
      }
    } else {
      const equipment = localDb.read('equipment');
      let changed = false;

      equipment.forEach(eq => {
        if (['Available', 'Reserved'].includes(eq.status) && (eq.totalUsageHours || 0) >= 100) {
          const oldStatus = eq.status;
          eq.status = 'Under Maintenance';
          changed = true;

          console.log(`🔧 Memory-fallback: Equipment ${eq.name} status updated to Under Maintenance (Crossed 100 usage hours threshold)`);
          logAudit(null, null, 'Maintenance Status Update', oldStatus, 'Under Maintenance', `${eq.name} reached 100 usage hours`);
        }
      });

      if (changed) {
        localDb.write('equipment', equipment);
      }
    }
  });
}
