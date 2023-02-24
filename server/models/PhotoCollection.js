import { Schema, model } from 'mongoose';


const photoSchema = new Schema(
  {
    name:{
      type: String
    },
    photos: [
      {
        type: String,
      },
    ],


  }

);



const PhotoCollection  = model('PhotoCollection', photoSchema);

export default PhotoCollection



