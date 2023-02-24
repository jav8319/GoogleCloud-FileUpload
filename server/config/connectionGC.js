import { Storage } from '@google-cloud/storage';


const path ='./config/myjsonfile.json'



export const storage = new Storage({
  projectId: 'myprojectId',
  keyFilename: path
});

export const bucketName = 'mybucketname';

