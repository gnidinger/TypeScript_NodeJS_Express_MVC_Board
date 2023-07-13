import { Profile } from 'passport';

export interface NaverProfile extends Omit<Profile, 'emails'> {
  id: string;
  displayName: string;
  email: string;
  _json: {
    response: {
      id: string;
      profile_image: string;
      email: string;
      name: string;
    };
  };
}

export type VerifyCallback = (
  accessToken: string,
  refreshToken: string,
  profile: NaverProfile,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  done: (error: any, user?: any) => void
) => void;
