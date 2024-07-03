const axios = require('axios');

// Initial data for two cars
let carData = [
  {
    carId: 45,
    latitude: 12.102234,
    longitude: 76.9659512
  },
  {
    carId: 46,
    latitude: 12.102500,
    longitude: 76.9660000
  }
];

// Endpoint URL
const endpoint = 'https://blueband-backend.onrender.com/track';

// Function to send data
const sendData = async (car) => {
  try {
    const response = await axios.post(endpoint, car);
    console.log(`Car ${car.carId}: Data sent successfully - Lat: ${car.latitude}, Long: ${car.longitude}`);
  } catch (error) {
    console.error(`Car ${car.carId}: Error sending data:`, error.message);
  }
};

// Function to slightly change car location
const updateLocation = (car) => {
  car.latitude += (Math.random() - 0.5) * 0.0001; // Small change in latitude
  car.longitude += (Math.random() - 0.5) * 0.0001; // Small change in longitude
};

// Send data for each car every half second
setInterval(() => {
  carData.forEach(car => {
    updateLocation(car);
    sendData(car);
  });
}, 500); // 500 milliseconds = 0.5 seconds
