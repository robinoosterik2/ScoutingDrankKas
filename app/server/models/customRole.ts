import mongoose, { Schema, model } from 'mongoose';


const CustomRoleSchema = new Schema({
    roleName: {
        type: String,
        required: true,
        unique: true,
    },
    roleDescription: {
        type: String,
        required: true,
    },
    rolePermissions: {
        type: [String],
        required: false,
    },
}, {
    timestamps: true
});

export const CustomRole = mongoose.models.CustomRole || mongoose.model('CustomRole', CustomRoleSchema);