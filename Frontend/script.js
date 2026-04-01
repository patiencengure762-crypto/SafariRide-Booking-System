// DATA SETUP
const counties = [
    "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet", "Embu", "Garissa", "Homa Bay",
    "Isiolo", "Kajiado", "Kakamega", "Kericho", "Kiambu", "Kilifi", "Kirinyaga", "Kisii",
    "Kisumu", "Kitui", "Kwale", "Laikipia", "Lamu", "Machakos", "Makueni", "Mandera",
    "Marsabit", "Meru", "Migori", "Mombasa", "Murang'a", "Nairobi", "Nakuru", "Nandi",
    "Narok", "Nyamira", "Nyandarua", "Nyeri", "Samburu", "Siaya", "Taita-Taveta", "Tana River",
    "Tharaka-Nithi", "Trans Nzoia", "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot"
];

const busNames = [
    "Safari Express I", "Safari Express II", "Savannah Cruiser A", "Savannah Cruiser B",
    "Highland Voyager 1", "Highland Voyager 2", "Coastal Drift", "Wildlife Wonder",
    "Kenya Explorer 01", "Kenya Explorer 02", "Rift Valley Runner", "Capital Connect",
    "Sunset Rider", "Dawn Patrol", "The Zebra", "The Lion King", "Simba Express",
    "Nairobi Star", "Mombasa Dream", "Western Wind"
];

// DOM ELEMENTS
const homeSection = document.getElementById('home-section');
const bookingSection = document.getElementById('booking-section');
const bookNowBtn = document.getElementById('book-now-btn');
const backBtn = document.getElementById('back-btn');
const fromSelect = document.getElementById('fromCounty');
const toSelect = document.getElementById('toCounty');
const busSelect = document.getElementById('busSelect');
const timeSelect = document.getElementById('travelTime');
const seatGrid = document.getElementById('seat-grid');
const numSeatsInput = document.getElementById('numSeats');
const selectedSeatsDisplay = document.getElementById('selected-seats-display');
const bookingForm = document.getElementById('booking-form');

// STATE
let selectedSeats = [];
let maxSeatsAllowed = 1;

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    populateDropdowns();
    generateSeats();
    setupEventListeners();
    
    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('travelDate').setAttribute('min', today);
});

function populateDropdowns() {
    // Populate Counties
    counties.forEach(county => {
        fromSelect.innerHTML += `<option value="${county}">${county}</option>`;
        toSelect.innerHTML += `<option value="${county}">${county}</option>`;
    });

    // Populate Buses
    busNames.forEach(bus => {
        busSelect.innerHTML += `<option value="${bus}">${bus}</option>`;
    });

    // Populate Time (24h format)
    for(let i = 6; i <= 22; i++) { // 6am to 10pm
        let hour = i < 10 ? '0' + i : i;
        timeSelect.innerHTML += `<option value="${hour}:00">${hour}:00 Hours</option>`;
    }
}

function generateSeats() {
    seatGrid.innerHTML = '';
    for (let i = 1; i <= 72; i++) {
        const seat = document.createElement('div');
        seat.classList.add('seat');
        seat.innerText = i;
        seat.dataset.seatNumber = i;
        
        // Randomly occupy some seats for simulation
        if (Math.random() < 0.2) {
            seat.classList.add('occupied');
        }
        
        seatGrid.appendChild(seat);
    }
}

function setupEventListeners() {
    // Navigation
    bookNowBtn.addEventListener('click', () => {
        homeSection.classList.remove('active-section');
        homeSection.style.display = 'none';
        bookingSection.style.display = 'block';
    });

    backBtn.addEventListener('click', () => {
        bookingSection.style.display = 'none';
        homeSection.style.display = 'flex';
        homeSection.classList.add('active-section');
    });

    // Number of seats logic
    numSeatsInput.addEventListener('change', (e) => {
        maxSeatsAllowed = parseInt(e.target.value);
        // Reset selection if new max is lower than current selection
        if (selectedSeats.length > maxSeatsAllowed) {
            alert(`You selected a maximum of ${maxSeatsAllowed} seats. Resetting selection.`);
            clearSeatSelection();
        }
    });

    // Seat Click Logic
    seatGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('seat') && !e.target.classList.contains('occupied')) {
            const seatNumber = e.target.dataset.seatNumber;
            
            if (e.target.classList.contains('selected')) {
                // Deselect
                e.target.classList.remove('selected');
                selectedSeats = selectedSeats.filter(s => s !== seatNumber);
            } else {
                // Select
                if (selectedSeats.length < maxSeatsAllowed) {
                    e.target.classList.add('selected');
                    selectedSeats.push(seatNumber);
                } else {
                    alert(`You can only select ${maxSeatsAllowed} seat(s).`);
                }
            }
            updateSeatDisplay();
        }
    });

    // Form Submission
    bookingForm.addEventListener('submit', handleBooking);
}

function clearSeatSelection() {
    selectedSeats = [];
    document.querySelectorAll('.seat.selected').forEach(seat => {
        seat.classList.remove('selected');
    });
    updateSeatDisplay();
}

function updateSeatDisplay() {
    selectedSeatsDisplay.innerText = selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None';
}

async function handleBooking(e) {
    e.preventDefault();

    if (selectedSeats.length === 0) {
        return alert("Please select at least one seat.");
    }

    const formData = {
        passengerName: document.getElementById('passengerName').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        from: fromSelect.value,
        to: toSelect.value,
        travelDate: document.getElementById('travelDate').value,
        travelTime: timeSelect.value,
        busName: busSelect.value,
        numberOfSeats: numSeatsInput.value,
        seatNumbers: selectedSeats,
        paymentMode: document.getElementById('paymentMode').value
    };

    console.log("Sending Data:", formData);

    // Send to backend
    try {
        const response = await fetch('http://localhost:3000/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            alert(`Booking Successful! \nBooking ID: ${result._id}\nSeats: ${selectedSeats.join(', ')}\nBus: ${formData.busName}\nTotal Amount: KES ${selectedSeats.length * 1500}`);
            bookingForm.reset();
            clearSeatSelection();
        } else {
            alert('Booking failed: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Could not connect to server. Please check if backend is running.');
    }
}