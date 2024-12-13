import mongoose, { Schema, model } from 'mongoose';

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
    object: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    oldValue: {
        type: String,
    },
    newValue: {
        type: String,
    },
}, {
    timestamps: true
}); 

export const Log = mongoose.models.Log || mongoose.model('Log', LogSchema);