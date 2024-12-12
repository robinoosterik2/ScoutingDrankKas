import mongoose, { Schema, model } from 'mongoose';


const OrderSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Reference to the User model
    },
    products: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Product' // Reference to the Product model
    },
    total: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    bartender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Reference to the User model
    }
}, {
    timestamps: true
});

export const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);