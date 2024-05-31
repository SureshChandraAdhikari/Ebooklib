import {v2 as cloudinary} from 'cloudinary';
import { config } from './config';
          
cloudinary.config({ 
  cloud_name: config.cloudinaryCloud, 
  api_key: config.cloudinaryCloudApikey, 
  api_secret: config.cloudinaryCloudApisecret 
});

export default cloudinary;