import mongoose, { Schema, model } from 'mongoose';

const CategorySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    ageRestriction: {
        type: Boolean,
        required: true,
    }
}, {
    timestamps: true
});

export const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);