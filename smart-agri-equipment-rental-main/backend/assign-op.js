import mongoose from 'mongoose';

async function updateDB() {
  await mongoose.connect('mongodb+srv://bharanidharansdev_db_user:ePFrgzZVuMyhWVHo@cluster0.pvqcqnv.mongodb.net/agrirent');
  const db = mongoose.connection.db;
  const eqCol = db.collection('equipment');
  
  const opId = new mongoose.Types.ObjectId('6a8f0f658fc56f32918cda30');
  await eqCol.updateMany(
    { assignedOperator: { $ne: null } },
    { $set: { assignedOperator: opId } }
  );
  
  console.log('Fixed assignedOperator');
  process.exit(0);
}

updateDB().catch(console.error);
