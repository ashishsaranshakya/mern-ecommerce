import mongoose from 'mongoose';

const AdminSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 2,
        max: 50
    },
    email: {
        type: String,
        required: true,
        max: 50,
        unique: true,
        index: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['Super-admin', 'Admin', 'Vendor', 'Dispatcher']
    }
}, { timestamps: true });

const Admin = mongoose.model('Admin', AdminSchema);

export default Admin;