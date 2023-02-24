import { makeExecutableSchema } from '@graphql-tools/schema';
import { join } from 'path';
import { gql } from 'apollo-server-express';
import { storage } from './config/connectionGC.js';
import { bucketName } from './config/connectionGC.js';
import GraphQLUpload from "graphql-upload/GraphQLUpload.mjs";
import PhotoCollection from './models/PhotoCollection.js';

const typeDefs = gql`
scalar Upload

type PhotoCollection {
  _id: ID!
  name: String!
  photos: [String!]
}

type Query {
  photoCollection(name: String!): PhotoCollection
}

type Mutation {
  createPhotoCollection(name: String!): PhotoCollection!
  addPhotosToCollection(name: String!, files: [Upload!]!): PhotoCollection!
  deletePhotoFromCollection(name: String!, photoUrl: String!): PhotoCollection!
}
`;

const resolvers = {
    Upload: GraphQLUpload,


  Query: {
    photoCollection: async (_, { name }) => {
      const collection = await PhotoCollection.findOne({ name });
      return collection;
    },
  },

  Mutation: {
    createPhotoCollection: async (_, { name }) => {
      const collection = new PhotoCollection({ name, photos: [] });
      await collection.save();
      return collection;
    },

    addPhotosToCollection: async (_, { name, files }) => {
      const bucket = storage.bucket(bucketName);
      const fileUrls = [];

      for (let file of files) {
        const { createReadStream, filename, mimetype } = await file;
        const stream = createReadStream();
        const path = join('photos', filename);
        const blob = bucket.file(path);

        await new Promise((resolve, reject) => {
          const writeStream = blob.createWriteStream({
            metadata: { contentType: mimetype },
            resumable: false,
          });

          writeStream.on('finish', () => {
            const url = `https://storage.googleapis.com/${bucketName}/photos%5C${filename}`;
            fileUrls.push(url);
            resolve();
          });

          writeStream.on('error', reject);

          stream.pipe(writeStream);
        });
      }

      const collection = await PhotoCollection.findOneAndUpdate(
        { name },
        { $addToSet: { photos: fileUrls } },
        { new: true }
      );

      return collection;
    },

    deletePhotoFromCollection: async (_, { name, photoUrl }) => {
      const bucket = storage.bucket(bucketName);
      const fileName = photoUrl.split('%5C').pop();

      // Delete the file from the bucket
      await bucket.file(`photos\\${fileName}`).delete();

      // Remove the photo from the photo collection
      const collection = await PhotoCollection.findOneAndUpdate(
        { name },
        { $pull: { photos: photoUrl } },
        { new: true }
      );

      return collection;
    },
  },
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});




export default schema