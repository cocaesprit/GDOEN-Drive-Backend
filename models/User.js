const { mongoose, Schema } = require('mongoose');

const userSchema = new Schema({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, default: 'guest' },
    registrationDate: { type: Date, required: true, default: Date.now() },
})

const User = mongoose.model('User', userSchema);

module.exports = User;
