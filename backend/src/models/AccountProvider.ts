import mongoose, { Document, Schema } from 'mongoose';

export interface IAccountProvider extends Document {
  userId: mongoose.Types.ObjectId;
  provider: 'google' | 'apple' | 'facebook';
  providerId: string;
  accessToken?: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AccountProviderSchema = new Schema<IAccountProvider>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    provider: {
      type: String,
      enum: ['google', 'apple', 'facebook'],
      required: true,
    },
    providerId: {
      type: String,
      required: true,
    },
    accessToken: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique provider-user combinations
AccountProviderSchema.index({ userId: 1, provider: 1 }, { unique: true });
AccountProviderSchema.index({ provider: 1, providerId: 1 }, { unique: true });

export default mongoose.model<IAccountProvider>('AccountProvider', AccountProviderSchema);
