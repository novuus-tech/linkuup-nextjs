/**
 * Active le compte admin existant.
 * Usage: node scripts/activate-admin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/linkuup';

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  roles: Array,
  isActive: Boolean,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function activate() {
  await mongoose.connect(MONGODB_URI);

  const result = await User.updateOne(
    { email: 'admin@linkuup.com' },
    { $set: { isActive: true } }
  );

  if (result.matchedCount === 0) {
    console.log('Aucun admin trouvé avec cet email.');
  } else {
    console.log('Compte admin activé avec succès.');
  }
  process.exit(0);
}

activate().catch((err) => {
  console.error(err);
  process.exit(1);
});
