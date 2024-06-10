// const { MongoClient, ServerApiVersion } = require("mongodb");
const Express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require('cors');
const fs = require('fs');
const csv = require('csv-parser');
const { timeStamp } = require("console");

const app = Express();
const server = http.createServer(app);

// Set up CORS options for Express
const corsOptions = {
  origin: 'http://localhost:3000', // Allow only your frontend origin
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};

app.use(cors(corsOptions)); // Use CORS middleware
app.use(Express.json()); // Middleware to parse JSON bodies

// Configure CORS for Socket.IO
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000', // Allow only your frontend origin
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// sos
app.post('/sos',(request,response)=>{
    const {carId,message} = request.body;
    const sosMessage = { carId, message, timestamp: new Date() };
  
    io.emit('sos', sosMessage);
    response.status(200).send({ message: 'SOS alert sent successfully' });
})
// ok msg
app.post('/okmsg',(request,response)=>{
    const {carId,message} = request.body;
    const okMessage = {carId,message,timeStamp:new Date()}
})
server.listen(5000, async () => {
    try {
    //   await mongoClient.connect();
    //   database = mongoClient.db("myapp");
    //   collection = database.collection("mycollection");
      console.log("Listening at :5000");
      await loadDataFromCSVCar1();
     
      await loadDataFromCSVCar2();
     
      await loadDataFromCSVCar3();

    } catch (error) {
      console.error(error);
    }
  });

async function delay() {
    return new Promise(resolve => { 
        setTimeout(() => { resolve('') }, 500); 
    }) 
}
// Load data from CSV and emit via Socket.IO
async function loadDataFromCSVCar1() {
    const results = [];
  
    fs.createReadStream('race.csv')
      .pipe(csv({ separator: '\t' })) // Specify tab as the delimiter
      .on('data', (data) => results.push(data))
      .on('end', () => {
        let index = 1; // Start from the second row
  
        setInterval(async () => {
          if (index >= results.length) index = 1; // Loop back to the start of the data
  
          const entry = results[index];
          const ass = entry['latitude,longitude'].split(',');
          const latitude = parseFloat(ass[0]);
          const longitude = parseFloat(ass[1]);
  
          // Check if latitude and longitude are valid numbers
          if (!isNaN(latitude) && !isNaN(longitude)) {
            const carId = 44; // Generate a car ID based on the index
            const newEntry = { carId, latitude: latitude.toFixed(6), longitude: longitude.toFixed(6), timestamp: new Date() };
  
            try {
            //   await collection.insertOne(newEntry);
               io.emit('locationUpdate', newEntry);
              console.log(`Emitted data: Car ID ${carId}, Lat ${latitude}, Long ${longitude}`);
            } catch (error) {
              console.error('Error saving data to MongoDB', error);
            }
          } else {
            console.error('Invalid latitude or longitude value');
          }
  
          index++;
        }, 1000); // Emit data every second
      });
  }
// Load data from CSV and emit via Socket.IO
async function loadDataFromCSVCar2() {
    const results = [];
  
    fs.createReadStream('race.csv')
      .pipe(csv({ separator: '\t' })) // Specify tab as the delimiter
      .on('data', (data) => results.push(data))
      .on('end', () => {
        let index = 1; // Start from the second row
  
        setInterval(async () => {
          if (index >= results.length) index = 1; // Loop back to the start of the data
  
          const entry = results[index];
          const ass = entry['latitude,longitude'].split(',');
          const latitude = parseFloat(ass[0]);
          const longitude = parseFloat(ass[1]);
  
          // Check if latitude and longitude are valid numbers
          if (!isNaN(latitude) && !isNaN(longitude)) {
            const carId = 2; // Generate a car ID based on the index
            const newEntry = { carId, latitude: latitude.toFixed(6), longitude: longitude.toFixed(6), timestamp: new Date() };
  
            try {
            //   await collection.insertOne(newEntry);
               io.emit('locationUpdate', newEntry);
              console.log(`Emitted data: Car ID ${carId}, Lat ${latitude}, Long ${longitude}`);
            } catch (error) {
              console.error('Error saving data to MongoDB', error);
            }
          } else {
            console.error('Invalid latitude or longitude value');
          }
  
          index++;
        }, 10000); // Emit data every second
      });
  }


  async function loadDataFromCSVCar3() {
    const results = [];
  
    fs.createReadStream('race.csv')
      .pipe(csv({ separator: '\t' })) // Specify tab as the delimiter
      .on('data', (data) => results.push(data))
      .on('end', () => {
        let index = 1; // Start from the second row
  
        setInterval(async () => {
          if (index >= results.length) index = 1; // Loop back to the start of the data
  
          const entry = results[index];
          const ass = entry['latitude,longitude'].split(',');
          const latitude = parseFloat(ass[0]);
          const longitude = parseFloat(ass[1]);
  
          // Check if latitude and longitude are valid numbers
          if (!isNaN(latitude) && !isNaN(longitude)) {
            const carId = 3; // Generate a car ID based on the index
            const newEntry = { carId, latitude: latitude.toFixed(6), longitude: longitude.toFixed(6), timestamp: new Date() };
            
            try {
            //   await collection.insertOne(newEntry);
               io.emit('locationUpdate', newEntry);
              console.log(`Emitted data: Car ID ${carId}, Lat ${latitude}, Long ${longitude}`);
            } catch (error) {
              console.error('Error saving data to MongoDB', error);
            }
          } else {
            console.error('Invalid latitude or longitude value');
          }
  
          index++;
        }, 10000); // Emit data every second
      });
  }