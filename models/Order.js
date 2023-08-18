import mongoose from 'mongoose';

const orderSchema = mongoose.Schema(
    {
        userId: {
            type: String,
            required: true
        },
        productId: {
            type: String,
            required: true
        },
        paymentId: {
            type: String,
            required: true
        },
        paymentStatus: {
            type: String,
            required: true,
            enum: ['Confirmed', 'Pending'],
        }
    },
    { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;