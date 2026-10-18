import mongoose from 'mongoose';

async function updateDB() {
  await mongoose.connect('mongodb+srv://bharanidharansdev_db_user:ePFrgzZVuMyhWVHo@cluster0.pvqcqnv.mongodb.net/agrirent');
  const db = mongoose.connection.db;
  const usersCol = db.collection('users');
  const eqCol = db.collection('equipment');
  
  const ops = await usersCol.find({ role: /operator/i }).toArray();
  console.log('All Operators:', ops.map(o => ({ _id: o._id, email: o.email, name: o.name })));
  
  const eqs = await eqCol.find({}).limit(3).toArray();
  console.log('Sample Equipments:', eqs.map(e => ({ _id: e._id, id: e.id, assignedOperator: e.assignedOperator })));
  
  process.exit(0);
}

updateDB().catch(console.error);
