import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as KakaoStrategy } from 'passport-kakao';
import { Strategy as NaverStrategy } from 'passport-naver-v2';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
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
    async (accessToken, refreshToken, profile, done) => {
      const existingUser = await User.findOne({ googleId: profile.id });

      if (existingUser) {
        const token = generateToken(existingUser.userSeq, existingUser.name);
        const userObject = existingUser.toObject(); // .toObject() 사용

        done(null, { ...userObject, token });
      } else {
        if (!profile.emails) {
          done(new Error('프로필에 이메일이 존재하지 않습니다.'));
          return;
        }

        const newUser = new User({
          googleId: profile.id,
          id: profile.emails[0].value,
          name: profile.displayName,
          password: await generateRandomPassword(),
        });

        const savedUser = await newUser.save();

        if (savedUser) {
          const token = generateToken(savedUser.userSeq, savedUser.name);
          const userObject = savedUser.toObject(); // .toObject() 사용

          done(null, { ...userObject, token });
        } else {
          done(new Error('사용자 저장에 실패하였습니다.'));
        }
      }
    }
  )
);
