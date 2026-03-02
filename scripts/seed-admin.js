/**
 * Script pour créer un utilisateur admin initial.
 * Usage: node scripts/seed-admin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/linkuup_nextjs';

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }],
  isActive: Boolean,
}, { timestamps: true });

const roleSchema = new mongoose.Schema({ name: String });

const User = mongoose.model('User', userSchema);
const Role = mongoose.model('Role', roleSchema);

async function seed() {
  await mongoose.connect(MONGODB_URI);

  let adminRole = await Role.findOne({ name: 'admin' });
  if (!adminRole) {
    adminRole = await Role.create({ name: 'admin' });
  }

  const existing = await User.findOne({ email: 'admin@linkuup.com' });
  if (existing) {
    console.log('Admin user already exists');
    process.exit(0);
  }

  await User.create({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@linkuup.com',
    password: bcrypt.hashSync('admin123', 10),
    roles: [adminRole._id],
    isActive: true,
  });

  console.log('Admin user created: admin@linkuup.com / admin123');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
