import mongoose from 'mongoose';
import paginate from 'mongoose-paginate-v2';

const OrderSchema = mongoose.Schema(
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

OrderSchema.plugin(paginate);

const Order = mongoose.model('Order', OrderSchema);

export default Order;