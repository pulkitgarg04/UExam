const mongoose = require("mongoose");

const teacherSchema = mongoose.Schema({
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
    staffID: {
        type: Number,
        required: true,
        unique: true
    },
    subject: {
        type: String,
        required: true
    },
    exams: [{ // Will think about this later
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam'
    }]
});

module.exports = mongoose.model('Teacher', teacherSchema);