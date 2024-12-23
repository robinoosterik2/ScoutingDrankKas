import mongoose, { Schema, model } from 'mongoose';

const RaiseSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    amount: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true
});

export const Raise = mongoose.models.Raise || mongoose.model('Raise', RaiseSchema);