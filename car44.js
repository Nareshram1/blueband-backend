const Express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require('cors');
const fs = require('fs');
const csv = require('csv-parser');

const app = Express();
const server = http.createServer(app);

const corsOptions = {
  origin: ['http://localhost:3000', 'https://blueband-frontend.vercel.app',"https://adya-flix.vercel.app","http://localhost:5173"], // Allow only your frontend origin
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};

app.use(cors(corsOptions)); // Use CORS middleware
app.use(Express.json()); // Middleware to parse JSON bodies

const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:3000', 'https://blueband-frontend.vercel.app',"https://adya-flix.vercel.app","http://localhost:5173"], // Allow only your frontend origin
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const carsData = {}; // To store the data of all cars
const carIndexes = {}; // To keep track of the current index for each car

// Function to load data from CSV for a given carID and update carsData
async function loadDataFromCSVCar(carID) {
  const results = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream('race.csv')
      .pipe(csv({ separator: '\t' }))
      .on('data', (data) => results.push(data))
      .on('end', () => {
        carsData[carID] = results;
        carIndexes[carID] = 0; // Initialize the index for each car
        resolve();
      })
      .on('error', reject);
  });
}

// Function to emit location updates for all cars with a delay
function startEmittingLocationUpdates() {
  const emitNextUpdate = () => {
    const updates = [];

    Object.keys(carsData).forEach(carID => {
      const data = carsData[carID];
      const index = carIndexes[carID];
      const entry = data[index];
      const [latitude, longitude] = entry['latitude,longitude'].split(',').map(coord => parseFloat(coord));

      if (!isNaN(latitude) && !isNaN(longitude)) {
        // Introduce a slight variation in the coordinates for different cars
        const latitudeVariation = (Math.random() - 0.5) * 0.0001; // Variation within +/- 0.00005
        const longitudeVariation = (Math.random() - 0.5) * 0.0001; // Variation within +/- 0.00005

        const newEntry = {
          carId: carID,
          latitude: (latitude + latitudeVariation).toFixed(6),
          longitude: (longitude + longitudeVariation).toFixed(6),
          timestamp: new Date()
        };
        updates.push(newEntry);
      }

      // Update the index for the next iteration
      carIndexes[carID] = (index + 1) % data.length;
    });

    if (updates.length > 0) {
      io.emit('locationUpdate', updates);
    }

    setTimeout(emitNextUpdate, 2000); // Delay before emitting the next update
  };

  emitNextUpdate();
}

app.post('/track',(request,response)=>{
   try{
    const {carId,latitude,longitude} = request.body;
    const record = {carId,latitude,longitude}
    io.emit('locationUpdate', [record]);
    console.log(record)
    response.status(200).json({msg:"Location updated successfully"})
   }
   catch(err){
      response.status(400).json({msg:"Internal Server Error"})
   }
})

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
