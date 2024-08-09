// Will think about that later

const resultSchema = mongoose.Schema({
    exam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    marksObtained: {
        type: Number,
        required: true
    },
    grade: {
        type: String
    },
    feedback: {
        type: String
    }
});

module.exports = mongoose.model('Result', resultSchema);