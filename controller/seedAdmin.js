import User from '../model/user/user.model.js'
import bcrypt from 'bcrypt'

async function seedAdmin() {
    const adminExists = await User.findOne({ email: 'admin@super.com' });

    if (adminExists) {
        console.log("admin exists")
        return;
    }

    const hashedPwd = await bcrypt.hash('admin_password', 10)

    const admin = new User({
        firstName: 'Admin',
        lastName: 'User',
        phone: '0904684256',
        email: 'admin@super.com',
        password: hashedPwd,
    });

    try {
        await admin.save();
        console.log('admin created');
    } catch (error) {
        console.error('Error creating admin:', error);
    }
}

export default seedAdmin
