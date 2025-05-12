import mongoose, { Schema, model } from 'mongoose';
import { User } from '@/server/models/user'
import { Log } from './log';

const RaiseSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    amount: {
        type: Number,
        required: true,
    },
    raiser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

RaiseSchema.pre('save', async function (next) {
    if (this.isNew) {
        try {
            const user = await User.findById(this.user);
            if (!user) {
                throw new Error("User cannot be found");
            }
            await user.raise(this.amount);

            const log = new Log({
                executor: this.raiser,
                action: "Raise",
                objectType: "User",
                objectId: this.user,
                newValue: JSON.stringify({ amount: this.amount }),
                description: `User raised by ${this.amount}`
            });
            await log.save();

            next();
        } catch (error) {
            console.log(error);
            next(error);
        }
    } else {
        next();
    }
});

export const Raise = mongoose.models.Raise || mongoose.model('Raise', RaiseSchema);