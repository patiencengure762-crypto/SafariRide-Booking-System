const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the root directory (where index.html is)
// This allows the backend to serve your frontend
app.use(express.static(path.join(__dirname, '..')));

// MongoDB Connection
// Make sure you have MongoDB installed locally or use MongoDB Atlas URI
const MONGO_URI = 'mongodb://127.0.0.1:27017/safariRideDB';

mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB:', err));

// Define Schema
const bookingSchema = new mongoose.Schema({
    passengerName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    travelDate: { type: String, required: true },
    travelTime: { type: String, required: true },
    busName: { type: String, required: true },
    numberOfSeats: { type: Number, required: true },
    seatNumbers: [Number],
    paymentMode: { type: String, required: true },
    bookedAt: { type: Date, default: Date.now }
});

const Booking = mongoose.model('Booking', bookingSchema);

// Routes

// POST: Create a new booking
app.post('/api/bookings', async (req, res) => {
    try {
        const booking = new Booking(req.body);
        const savedBooking = await booking.save();
        res.status(201).json(savedBooking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// GET: Retrieve all bookings (for admin/testing)
app.get('/api/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find();
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});