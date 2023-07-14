import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as KakaoStrategy } from 'passport-kakao';
import { Strategy as NaverStrategy } from 'passport-naver-v2';
import { NaverProfile } from '../types/NaverProfile';
import User from '../models/User';
import generateToken from '../utils/generateToken';
import generateRandomPassword from '../utils/generateRandomPassword';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: 'http://localhost:8080/users/auth/google/callback',
    },
    async (_accessToken, _refreshToken, profile, done) => {
      const existingUser = await User.findOne({ googleId: profile.id });

      if (existingUser) {
        const token = generateToken(existingUser.userSeq, existingUser.name);
        const userObject = existingUser.toObject();

        done(null, { ...userObject, token });
      } else {
        const newUser = new User({
          googleId: profile.id,
          id: profile.emails![0].value,
          name: profile.displayName,
          password: await generateRandomPassword(),
        });

        const savedUser = await newUser.save();

        if (savedUser) {
          const token = generateToken(savedUser.userSeq, savedUser.name);
          const userObject = savedUser.toObject();

          done(null, { ...userObject, token });
        } else {
          done(new Error('사용자 저장에 실패하였습니다.'));
        }
      }
    }
  )
);

passport.use(
  new KakaoStrategy(
    {
      clientID: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
      callbackURL: 'http://localhost:8080/users/auth/kakao/callback',
    },
    async (_accessToken, _refreshToken, profile, done) => {
      const existingUser = await User.findOne({ kakaoId: profile.id });

      if (existingUser) {
        const token = generateToken(existingUser.userSeq, existingUser.name);
        const userObject = existingUser.toObject();

        done(null, { ...userObject, token });
      } else {
        if (!profile._json.kakao_account.email) {
          done(new Error('프로필에 이메일이 존재하지 않습니다.'));
          return;
        }

        const newUser = new User({
          kakaoId: profile.id,
          id: profile._json.kakao_account.email,
          name: profile.displayName,
          password: await generateRandomPassword(),
        });

        const savedUser = await newUser.save();

        if (savedUser) {
          const token = generateToken(savedUser.userSeq, savedUser.name);
          const userObject = savedUser.toObject();

          done(null, { ...userObject, token });
        } else {
          done(new Error('사용자 저장에 실패하였습니다.'));
        }
      }
    }
  )
);

passport.use(
  new NaverStrategy(
    {
      clientID: process.env.NAVER_CLIENT_ID!,
      clientSecret: process.env.NAVER_CLIENT_SECRET!,
      callbackURL: 'http://localhost:8080/users/auth/naver/callback',
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: NaverProfile,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      done: (error: any, user?: any) => void
    ) => {
      // console.log(profile);
      const existingUser = await User.findOne({ naverId: profile.id });

      if (existingUser) {
        const token = generateToken(existingUser.userSeq, existingUser.name);
        const userObject = existingUser.toObject();

        done(null, { ...userObject, token });
      } else {
        const newUser = new User({
          naverId: profile.id,
          id: profile._json.response.email,
          name: profile._json.response.name,
          password: await generateRandomPassword(),
        });

        const savedUser = await newUser.save();

        if (savedUser) {
          const token = generateToken(savedUser.userSeq, savedUser.name);
          const userObject = savedUser.toObject();

          done(null, { ...userObject, token });
        } else {
          done(new Error('사용자 저장에 실패하였습니다.'));
        }
      }
    }
  )
);
