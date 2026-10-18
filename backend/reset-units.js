import mongoose from 'mongoose';

async function updateDB() {
  await mongoose.connect('mongodb+srv://bharanidharansdev_db_user:ePFrgzZVuMyhWVHo@cluster0.pvqcqnv.mongodb.net/agrirent');
  const db = mongoose.connection.db;
  const collection = db.collection('equipment');
  const eqs = await collection.find({}).toArray();
  for (const eq of eqs) {
    let changed = false;
    if (eq.units) {
      eq.units.forEach(u => {
        if (u.status !== 'Available' || u.hours > 0) {
          u.status = 'Available';
          u.hours = 0;
          changed = true;
        }
      });
    }
    if (eq.status !== 'Available' || eq.currentCycleHours > 0 || eq.totalUsageHours > 0) {
      eq.status = 'Available';
      eq.currentCycleHours = 0;
      eq.totalUsageHours = 0;
      changed = true;
    }
    if (changed) {
      await collection.updateOne(
        { _id: eq._id }, 
        { $set: { 
            units: eq.units,
            status: eq.status,
            currentCycleHours: eq.currentCycleHours,
            totalUsageHours: eq.totalUsageHours
          } 
        }
      );
    }
  }
  console.log('Finished deep cleaning MongoDB Atlas units');
  process.exit(0);
}

updateDB().catch(console.error);
