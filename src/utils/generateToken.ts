import jwt from 'jsonwebtoken';

const generateToken = (userSeq: number, name: string) => {
  return jwt.sign({ userSeq, name }, process.env.JWT_SECRET!, {
    expiresIn: '30d',
  });
};

export default generateToken;
