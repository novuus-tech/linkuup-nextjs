import mongoose from 'mongoose';

const RoleSchema = new mongoose.Schema({ name: String });
const Role = mongoose.models.Role || mongoose.model('Role', RoleSchema);

export default Role;
