import multer from 'multer';
import sharp from 'sharp';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const s3 = new AWS.S3();

const multerStorage = multer.memoryStorage();

// 이미지 파일인지 체크
// eslint-disable-next-line @typescript-eslint/no-explicit-any,
const multerFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/jpeg') || file.mimetype.startsWith('image/png')) {
    cb(null, true);
  } else {
    cb(new Error('jpg, jpeg, png 형식의 이미지 파일이 아닙니다.'));
  }
};

export const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// 최대 1024x1024로 이미지를 리사이징하되, 가로 세로 비율은 유지
const resizeImage = async (file: Express.Multer.File): Promise<Buffer> => {
  const resizedBuffer = await sharp(file.buffer)
    .resize(1024, 1024, {
      fit: sharp.fit.inside,
      withoutEnlargement: true,
    })
    // .png()
    .toBuffer();

  const { width, height } = await sharp(resizedBuffer).metadata();

  if (!width || !height) {
    throw new Error('이미지 데이터를 가져올 수 없습니다.');
  }

  if (width < 500 || height < 500) {
    throw new Error('이미지의 크기가 너무 작습니다. 크기가 500x500 이상인 이미지를 업로드해 주세요.');
  }

  return resizedBuffer;
};

// 가장 큰 정사각형을 찾아서 500x500으로 리사이징
const extractThumbnail = async (buffer: Buffer): Promise<Buffer> => {
  const { width, height } = await sharp(buffer).metadata();

  if (!width || !height) {
    throw new Error('이미지 데이터를 가져올 수 없습니다.');
  }

  const smallestDimension = Math.min(width, height);
  const left = (width - smallestDimension) / 2;
  const top = (height - smallestDimension) / 2;

  return await sharp(buffer)
    .extract({ left, top, width: smallestDimension, height: smallestDimension })
    .resize(500, 500)
    // .png()
    .toBuffer();
};

// 이미지를 S3에 업로드
const uploadToS3 = async (buffer: Buffer, fileName: string, folder: string): Promise<AWS.S3.ManagedUpload.SendData> => {
  const params = {
    Bucket: `${process.env.AWS_BUCKET_NAME}/${folder}`,
    Key: `${fileName}.png`,
    Body: buffer,
    ACL: 'public-read',
    ContentType: 'image/png',
  };

  try {
    const data = await s3.upload(params).promise();
    return data;
  } catch (error) {
    throw new Error('S3에 업로드하는 데 실패했습니다.');
  }
};

// 이미지를 S3에서 삭제

export const resizeAndUploadToS3 = async (file: Express.Multer.File) => {
  const fileName = `feed-${uuidv4()}`;

  const resizedBuffer = await resizeImage(file);
  const resizeData = await uploadToS3(resizedBuffer, fileName, 'feed-images');

  const thumbnailBuffer = await extractThumbnail(resizedBuffer);
  const thumbnailData = await uploadToS3(thumbnailBuffer, `${fileName}-thumbnail`, 'thumbnails');

  return {
    resizedImageUrl: resizeData.Location,
    thumbnailImageUrl: thumbnailData.Location,
  };
};
