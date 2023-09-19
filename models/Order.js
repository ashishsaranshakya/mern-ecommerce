import mongoose from 'mongoose';
import paginate from 'mongoose-paginate-v2';

const OrderSchema = mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            index: true
        },
        products: {
            type: Array,
            required: true
        },
        paymentId: {
            type: String,
            required: true,
            unique: true
        },
        paymentStatus: {
            type: String,
            required: true,
            default: 'Pending',
            enum: ['Confirmed', 'Pending']
        },
        totalCost: {
            type: Number,
            required: true
        },
        address: {
            type: String,
            required: true,
            max: 50
        },
        deliveryStatus: {
            type: String,
            required: true,
            default: 'Pending',
            enum: ['Delivered', 'Pending']
        }
    },
    { timestamps: true }
);

OrderSchema.plugin(paginate);

const Order = mongoose.model('Order', OrderSchema);

export default Order;