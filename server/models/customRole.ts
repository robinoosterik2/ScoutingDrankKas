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
        required: true,
    },
    roleCreatedAt: {
        type: Date,
        default: Date.now,
    },
    roleUpdatedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true
});

export const CustomRole = mongoose.models.CustomRole || mongoose.model('CustomRole', CustomRoleSchema);