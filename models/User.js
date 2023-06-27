const { mongoose, Schema } = require('mongoose');

const userSchema = new Schema({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false },
    registrationDate: { type: Date, required: true, default: Date.now() },
})

const User = mongoose.model('User', userSchema);

module.exports = User;
