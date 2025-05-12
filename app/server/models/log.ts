import mongoose, { Schema } from 'mongoose';

const actions = ["Create", "Update", "Delete", "Sold", "Raise"];
const LogSchema = new Schema({
    executor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    action: {
        type: String,
        required: true,
    },
    objectType: {
        type: String,
        enum: ['User', 'Product', 'Order', 'Log'],
        required: true,
    },
    objectId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    oldValue: {
        type: String,
    },
    newValue: {
        type: String,
    },
    description: {
        type: String,
    },
}, {
    timestamps: true
}); 

export const Log = mongoose.models.Log || mongoose.model('Log', LogSchema);