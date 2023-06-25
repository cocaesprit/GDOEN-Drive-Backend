const { mongoose, Schema } = require('mongoose');

const fileSchema = new Schema({
    originalName: { type: String, required: true },
    destination: { type: String, required: true },
    fileName: { type: String, required: true, unique: true },
    path: { type: String, required: true, unique: true },
    size: { type: Number, required: true }
})

const File = mongoose.model('File', fileSchema);

module.exports = File;
