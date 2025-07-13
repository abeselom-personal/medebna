import System from '../model/system/systemModel.js';
import bcrypt from 'bcrypt';

async function seedAdmin() {
    const adminExists = await System.findOne({ email: 'admin@example.com', type: 'admin' });

    if (adminExists) {
        return;
    }
    const hashedPwd = await bcrypt.hash('admin_password', 10)

    const admin = new System({
        name: 'Admin',
        phone: '0904684256',
        email: 'admin@example.com',
        password: hashedPwd,
        type: 'admin'
    });

    try {
        await admin.save();
    } catch (error) {
        console.error('Error creating admin:', error);
    }
}

export default seedAdmin;
