import mongoose from 'mongoose'; 
// import { v4 as uuidV4 } from 'uuid';


const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  gender: { type: String },
  telephone: { type: String, required: true },
  password: { type: String, required: true },
});


export default mongoose.model('User', userSchema);