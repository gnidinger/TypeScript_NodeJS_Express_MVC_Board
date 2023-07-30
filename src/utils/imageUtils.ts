import multer from 'multer';
import sharp from 'sharp';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

const s3 = new S3Client({ region: process.env.AWS_REGION });

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
  const { width, height } = await sharp(file.buffer).metadata();

  if (!width || !height) {
    throw new Error('이미지 데이터를 가져올 수 없습니다.');
  }

  // 이미지의 가로와 세로 길이가 500 미만인 경우 에러 발생.
  if (width < 500 && height < 500) {
    throw new Error('이미지의 크기가 너무 작습니다. 크기가 500x500 이상인 이미지를 업로드해 주세요.');
  }

  // 이미지의 가로 또는 세로 길이가 1024 이상인 경우에만 크기를 조정.
  if (width > 1024 || height > 1024) {
    const resizedBuffer = await sharp(file.buffer)
      .resize(1024, 1024, {
        fit: sharp.fit.inside,
        withoutEnlargement: true,
      })
      .toBuffer();

    return resizedBuffer;
  }

  // 그 외의 경우 (가로 또는 세로 길이가 500 이상 1024 이하인 경우) 원본 이미지를 그대로 반환.
  return file.buffer;
};

// 가장 큰 정사각형을 찾아서 500x500으로 리사이징
const extractThumbnail = async (buffer: Buffer): Promise<Buffer> => {
  const { width, height } = await sharp(buffer).metadata();

  if (!width || !height) {
    throw new Error('이미지 데이터를 가져올 수 없습니다.');
  }

  // 이미지의 가로 또는 세로 길이가 500 미만인 경우 에러 발생.
  if (width < 500 || height < 500) {
    throw new Error('이미지의 크기가 너무 작습니다. 크기가 500x500 이상인 이미지를 업로드해 주세요.');
  }

  const smallestDimension = Math.min(width, height);
  const left = (width - smallestDimension) / 2;
  const top = (height - smallestDimension) / 2;

  return await sharp(buffer)
    .extract({ left, top, width: smallestDimension, height: smallestDimension })
    .resize(500, 500)
    .toBuffer();
};

// 이미지를 S3에 업로드
const uploadToS3 = async (buffer: Buffer, fileName: string, folder: string): Promise<string> => {
  console.log('업로드 시작');
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${folder}/${fileName}.png`,
    Body: buffer,
    ContentType: 'image/png',
  };

  try {
    const command = new PutObjectCommand(params);
    await s3.send(command);
    return `https://${process.env.AWS_BUCKET_NAME}.s3.${s3.config.region}.amazonaws.com/${folder}/${fileName}.png`;
  } catch (error) {
    console.error(error);
    throw new Error('S3에 업로드하는 데 실패했습니다.');
  }
};

// 이미지를 S3에서 삭제
export const deleteFromS3 = async (filePath: string): Promise<void> => {
  const fileName = filePath.split('/').pop();

  if (!fileName) {
    throw new Error('S3에서 삭제할 파일 이름을 추출하는데 실패하였습니다.');
  }

  const folder = filePath.includes('thumbnails') ? 'thumbnails' : 'feed-images';

  const params = {
    Bucket: `${process.env.AWS_BUCKET_NAME}/${folder}`,
    Key: fileName,
  };

  try {
    const command = new DeleteObjectCommand(params);
    await s3.send(command);
  } catch (error) {
    throw new Error('S3에서 삭제하는 데 실패했습니다.');
  }
};

export const resizeAndUploadToS3 = async (file: Express.Multer.File) => {
  const fileName = `feed-${uuidv4()}`;

  const resizedBuffer = await resizeImage(file);
  const resizedImageUrl = await uploadToS3(resizedBuffer, fileName, 'feed-images');

  const thumbnailBuffer = await extractThumbnail(resizedBuffer);
  const thumbnailImageUrl = await uploadToS3(thumbnailBuffer, `${fileName}-thumbnail`, 'thumbnails');

  return {
    resizedImageUrl,
    thumbnailImageUrl,
  };
};
