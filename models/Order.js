import mongoose from 'mongoose';

const orderSchema = mongoose.Schema(
    {
        userId: {
            type: String,
            required: true
        },
        products: {
            type: Array,
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
        },
        totalCost: {
            type: Number,
            required: true
        }
    },
    { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;