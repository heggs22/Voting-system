const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session setup to track logged-in users
app.use(
    session({
        secret: 'voting-secret-key',
        resave: false,
        saveUninitialized: true,
    })
);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/votingSystem', { useNewUrlParser: true, useUnifiedTopology: true });

// User Schema
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    hasVoted: { type: Boolean, default: false }, // To track if a user has already voted
});

const User = mongoose.model('User', userSchema);

// Vote Schema
const voteSchema = new mongoose.Schema({
    option: String,
    candidate: String,
    votes: { type: Number, default: 0 },
});

const Vote = mongoose.model('Vote', voteSchema);

// Seed voting options and candidates (only needs to be run once)
const initializeVotes = async () => {
    const candidates = [
        { option: 'Option 1', candidate: 'Candidate A' },
        { option: 'Option 1', candidate: 'Candidate B' },
        { option: 'Option 1', candidate: 'Candidate C' },
        { option: 'Option 2', candidate: 'Candidate D' },
        { option: 'Option 2', candidate: 'Candidate E' },
        { option: 'Option 2', candidate: 'Candidate F' },
    ];

    for (const candidate of candidates) {
        const existing = await Vote.findOne({ option: candidate.option, candidate: candidate.candidate });
        if (!existing) {
            await new Vote(candidate).save();
        }
    }
};

initializeVotes();

// Routes
// Render login page
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});

// Render voting page
app.get('/voting', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login'); // Ensure the user is logged in
    }
    res.sendFile(__dirname + '/voting.html');
});

// Handle login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });

    if (user) {
        req.session.user = user;
        return res.redirect('/voting');
    }

    res.send('Invalid credentials. <a href="/login">Try again</a>');
});

// Handle voting
app.post('/vote', async (req, res) => {
    const user = req.session.user;

    if (!user) {
        return res.status(401).send('Unauthorized. Please log in first.');
    }

    // Check if the user has already voted
    if (user.hasVoted) {
        return res.send('You have already voted. Thank you!');
    }

    const { option, candidate } = req.body;

    // Find the candidate and increment their vote count
    const vote = await Vote.findOne({ option, candidate });
    if (vote) {
        vote.votes += 1;
        await vote.save();

        // Mark the user as having voted
        await User.updateOne({ _id: user._id }, { hasVoted: true });
        req.session.user.hasVoted = true;

        return res.send('Vote submitted successfully! Thank you for voting.');
    }

    res.status(404).send('Candidate not found.');
});

// Retrieve results (Admin or summary endpoint)
app.get('/results', async (req, res) => {
    const results = await Vote.find();
    res.json(results);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
