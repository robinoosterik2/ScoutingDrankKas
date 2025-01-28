import mongoose, { Schema, model } from 'mongoose';

const SettingsSchema = new Schema({
    language: {
        type: String,
        required: true,
        default: "en"
    },
    darkMode: {
        type: Boolean,
        required: true,
        default: true
    },
    speedMode: {
        type: Boolean,
        required: true,
        default: false
    }
}, {
    timestamps: false
});

export const Settings = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);