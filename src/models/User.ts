import mongoose, { Schema, Document } from 'mongoose';
import { autoIncrement } from '../middleware/autoIncrement';
import bcrypt from 'bcryptjs';

interface IUser extends Document {
  userSeq: number;
  id: string;
  googleId?: string;
  kakaoId?: string;
  naverId?: string;
  password: string;
  name: string;
  matchPassword: (enteredPassword: string) => Promise<boolean>;
}

const userSchema: Schema<IUser> = new Schema(
  {
    userSeq: { type: Number, unique: true, required: true, default: 1 },
    id: {
      type: String,
      unique: true,
      required: true,
      match: [/^([\w-.]+@([\w-]+\.)+[\w-]{2,4})?$/, '올바른 이메일 형식을 입력해 주세요.'],
    },
    googleId: String,
    kakaoId: String,
    naverId: String,
    password: {
      type: String,
      required: true,
      validate: {
        validator: function (v: string) {
          return /^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(v);
        },
        message: (props) => `${props.value} 는 문자, 숫자를 포함해 6글자 이상이어야 합니다.`,
      },
    },
    name: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  }
);

userSchema.pre('save', autoIncrement('userSeq'));

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;
