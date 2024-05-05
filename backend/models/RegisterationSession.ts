import mongoose from 'mongoose';

const registerationSessionSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    token:{
        type: String,
        required: true
    },
    expiry_time:{
        type: Number,
        required: true
    }
});

const RegisterationSession = mongoose.model('RegisterationSession', registerationSessionSchema);

export default RegisterationSession;