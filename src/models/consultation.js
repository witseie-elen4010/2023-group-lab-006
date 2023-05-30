const mongoose = require('mongoose');
const consultSchema = new mongoose.Schema({
    lecturer: {
        type: String,
        required: true
    },
    organiser: {
        type: String,
        required: true
    },
    consultDay: {
        type: Date,
        required: true
    },
    consultLength: {
        type: Number,
        default: 1,
        required: true
    },
    consultStart: {
        type: String,
        required: true
    },
    consultEnd: {
        type: String,
        required: true
    }
});
const consultation = mongoose.model('consultation', consultSchema);

module.exports = consultation;