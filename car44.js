const Express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require('cors');
const fs = require('fs');
const csv = require('csv-parser');

const app = Express();
const server = http.createServer(app);

const corsOptions = {
  origin: ['http://localhost:3000', 'https://blueband-frontend.vercel.app/'], // Allow only your frontend origin
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};

app.use(cors(corsOptions)); // Use CORS middleware
app.use(Express.json()); // Middleware to parse JSON bodies

const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:3000', 'https://blueband-frontend.vercel.app/'], // Allow only your frontend origin
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const carsData = {}; // To store the data of all cars

// Function to load data from CSV for a given carID and update carsData
async function loadDataFromCSVCar(carID) {
  const results = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream('race.csv')
      .pipe(csv({ separator: '\t' }))
      .on('data', (data) => results.push(data))
      .on('end', () => {
        carsData[carID] = results;
        resolve();
      })
      .on('error', reject);
  });
}

// Emit location updates for all cars every 5 seconds
function startEmittingLocationUpdates() {
  setInterval(() => {
    const updates = [];

    Object.keys(carsData).forEach(carID => {
      const data = carsData[carID];
      const index = Math.floor(Math.random() * data.length); // Random index for demonstration
      const entry = data[index];
      const ass = entry['latitude,longitude'].split(',');
      const latitude = parseFloat(ass[0]);
      const longitude = parseFloat(ass[1]);

      if (!isNaN(latitude) && !isNaN(longitude)) {
        const newEntry = {
          carId: carID,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
          timestamp: new Date()
        };
        updates.push(newEntry);
      }
    });

    if (updates.length > 0) {
      io.emit('locationUpdate', updates);
      console.log('Emitted data:', updates);
    }
  }, 2000); // Emit data every 5 seconds
}

app.post('/sos', (request, response) => {
  const { carId, message } = request.body;
  const sosMessage = { carId, message, timestamp: new Date() };

  io.emit('sos', sosMessage);
  response.status(200).send({ message: 'SOS alert sent successfully' });
});

app.post('/okmsg', (request, response) => {
  const { carId, message } = request.body;
  const okMessage = { carId, message, timeStamp: new Date() };
  response.status(200).send({ message: 'OK message received successfully' });
});

server.listen(5000, async () => {
  try {
    console.log("Listening at :5000");
    
    await loadDataFromCSVCar(1);
    await loadDataFromCSVCar(7);
    await loadDataFromCSVCar(27);
    await loadDataFromCSVCar(44);
    await loadDataFromCSVCar(63);
    await loadDataFromCSVCar(4);
    
    startEmittingLocationUpdates();
  } catch (error) {
    console.error(error);
  }
});
