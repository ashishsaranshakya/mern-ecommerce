import mongoose from 'mongoose';
import paginate from 'mongoose-paginate-v2';

const ProductSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 4,
        max: 50,
        index: true
    },
    description: {
        type: String,
        required: true,
        min: 10,
        max: 500
    },
    cost: {
        type: Number,
        required: true,
        index: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    ratings: {
        type: Array,
        default: []
    },
    rating: {
        type: Number,
        default: 0
    },
    vendorId: {
        type: String,
        required: true,
        index: true
    },
    quantity: {
        type: Number,
        required: true
    }
}, { timestamps: true });

ProductSchema.plugin(paginate);

const Product = mongoose.model('Product', ProductSchema);

export default Product;