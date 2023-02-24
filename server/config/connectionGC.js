import { Storage } from '@google-cloud/storage';


const path ='./config/react-ecommerce-377703-ba30d4c2432a.json'



export const storage = new Storage({
  projectId: 'react-ecommerce-377703',
  keyFilename: path
});

export const bucketName = 'ecommerceproducts';

