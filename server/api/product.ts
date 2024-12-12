import mongoose, { Schema, model } from 'mongoose';


const ProductSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    categories: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Category' // Reference to the Catagory model
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
    },
}, {
    timestamps: true
});

export const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);