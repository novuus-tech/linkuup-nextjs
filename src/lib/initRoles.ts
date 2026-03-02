import connectDB from './db';
import Role from './models/Role';

const REQUIRED_ROLES = ['user', 'moderator', 'admin', 'commercial'];

export async function initRoles() {
  await connectDB();
  for (const name of REQUIRED_ROLES) {
    const exists = await Role.findOne({ name }).exec();
    if (!exists) {
      await new Role({ name }).save();
    }
  }
}
