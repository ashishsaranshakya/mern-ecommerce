import mongoose from 'mongoose';

const UserSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        min: 2,
        max: 50
    },
    lastName: {
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
        required: true,
        min: 8
    },
    cart: {
        type: Array,
        default: []
    },
    address: {
        type: String,
        required: true,
        max: 50,
    },
    occupation: {
        type: String,
        default: null
    }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

export default User;