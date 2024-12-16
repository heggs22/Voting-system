// models/vote.js
const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
    option: { type: String, required: true },
    candidate: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vote', voteSchema);
