const mongoose = require("mongoose");

const studentSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    username: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    rollNo: {
        type: Number,
        required: true,
        unique: true
    },
    avatar: {
        type: String,
        default: "",
        trim: true
    },
    gender: {
        type: String,
        enum: ['male', 'female']
    },
    course: {
        type: String,
        required: true
    },
    batch: {
        type: Number,
        required: true
    },
    exams: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam'
    }],
    createdAt: {
        type: Date,
        default: Date.now(),
    },
});

module.exports = mongoose.model('Student', studentSchema);