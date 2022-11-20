import { Request } from 'express';
import aws from 'aws-sdk';
import { env } from '../../config';
import { formatLog } from '../logger';
import logger from '../logger';
import multer from 'multer';
import multers3 from 'multer-s3';

const { ACCESS_KEY_ID, BUCKET_NAME, SECRET_ACCESS_KEY } = env;
const s3 = new aws.S3({
  secretAccessKey: SECRET_ACCESS_KEY,
  accessKeyId: ACCESS_KEY_ID,
});

const validFileTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  //   'text/csv',
  //   'text/plain',
  //   'application/pdf',
  //   'application/mspowerpoint',
  //   'application/msword',
  //   'application/excel',
  //   'audio/mpeg',
  //   'audio/mp4',
  //   'audio/mp3',
  //   'audio/ogg',
  //   'audio/vnd.wav',
  //   'audio/wave',
  //   'video/mp4',
  //   'video/3gpp',
  //   'video/quicktime',
  //   'video/x-ms-wmv',
  //   'video/x-msvideo',
  //   'video/x-flv',
];

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (validFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, JPG files are allowed'));
  }
};

export const upload = multer({
  fileFilter,
  limits: {
    parts: Infinity,
    fileSize: 1024 * 1024 * 250, //Maximum of 200Mb file size
  },
  storage: multers3({
    acl: 'public-read',
    s3,
    bucket: BUCKET_NAME,
    contentType: multers3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req: Request, file, cb) {
      try {
        let key = `${Date.now()}-${file.originalname.toLowerCase()}`;

        //Create sub folders in S3 bucket
        if (file.fieldname == 'profileImageUrl') {
          key = `profile-image/${key}`;
        }

        logger.info(formatLog(req, `Saving file ${file.originalname} as ${key} in AWS bucket`));
        cb(null, key);
      } catch (err) {
        cb(new Error('An Error occured while uploading files'));
      }
    },
  }),
});

export const deleteSingleFile = async (filepath: string): Promise<void> => {
  //DO NOT RUN IN UNIT TEST MODE
  const isUnitTest = process.env.NODE_ENV === 'test' && process.env.TEST_TYPE === 'unit';
  if (!isUnitTest) {
    logger.info(`Deleting file with key "${filepath}"`);

    const params = { Bucket: BUCKET_NAME, Key: filepath };

    await s3.deleteObject(params, (err) => {
      if (err) throw new Error(err.message);
      else logger.info(`Deleted file with key "${filepath}"`);
    });
  }
};

export const deleteSingleFileFromS3 = async (filepath: string): Promise<void> => {
  //DO NOT RUN IN UNIT TEST MODE
  const isUnitTest = process.env.NODE_ENV === 'test' && process.env.TEST_TYPE === 'unit';
  if (!isUnitTest) {
    logger.info(`Deleting file with key "${filepath}"`);

    const params = { Bucket: BUCKET_NAME, Key: filepath };

    await s3.deleteObject(params, (err) => {
      if (err) throw new Error(err.message);
      else logger.info(`Deleted file with key "${filepath}"`);
    });
  }
};

export const deleteMultipleFiles = async (filepaths: { Key: string }[]): Promise<void> => {
  //DO NOT RUN IN UNIT TEST MODE
  const isUnitTest = process.env.NODE_ENV === 'test' && process.env.TEST_TYPE === 'unit';
  if (!isUnitTest) {
    logger.info(`Deleting files with filepaths "${JSON.stringify(filepaths)}"`);

    const params = { Bucket: BUCKET_NAME, Delete: { Objects: filepaths } };

    await s3.deleteObjects(params, (err) => {
      if (err) throw new Error(err.message);
      else logger.info(`Deleted files with filepaths "${JSON.stringify(filepaths)}`);
    });
  }
};
