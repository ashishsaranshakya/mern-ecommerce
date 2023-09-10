import mongoose from 'mongoose';
import paginate from 'mongoose-paginate-v2';

const ProductSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 4,
        max: 50
    },
    description: {
        type: String,
        required: true,
        min: 10,
        max: 500
    },
    cost: {
        type: Number,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    ratings: {
        type:Array,
        default: []
    },
    rating: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

ProductSchema.plugin(paginate);

const Product = mongoose.model('Product', ProductSchema);

export default Product;