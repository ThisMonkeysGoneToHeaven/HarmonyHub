import mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Number,
        required: true
    }
});

const ResetPasswordToken = mongoose.model('ResetPasswordToken', tokenSchema);
export default ResetPasswordToken;
// An email which does not exist in the user's db, should never be allowed here!