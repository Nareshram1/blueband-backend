const Express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require('cors');
const axios = require('axios');

const app = Express();
const server = http.createServer(app);

const corsOptions = {
  origin: "*",
  methods: ['GET', 'POST']
};

app.use(cors(corsOptions)); // Use CORS middleware
app.use(Express.json()); // Middleware to parse JSON bodies


const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ['GET', 'POST']
  },
});

// Endpoint to receive data from SIM7600E-H module
app.post('/test', async (req, res) => {
  try {
    // Log received data from SIM7600E-H
    console.log('Received data from SIM7600E-H:', req.body);
    // const {carId,latitude,longitude} = req.body
    // // just temp have to work on it
    // const otherEndpoint = 'https://blueband-backend.onrender.com/track';
    // const dataToSend = {"carId":carId,"latitude":latitude,"longitude":longitude}; // Assuming you want to send the same data

    // // Make a POST request to another endpoint
    // const response = await axios.post(otherEndpoint, dataToSend);

    // // Log response from the other endpoint
    // console.log('Response from other endpoint:', response.data);

    // Respond to the SIM7600E-H module with a success message
    res.status(200).send('Data received and forwarded successfully.');
  } catch (err) {
    console.error('Error handling data:', err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

// app.get('/test', (req, res) => {
//   const { latitude, longitude } = req.query;
//   console.log(latitude, longitude);
//   res.send('Data received board.');
// });

app.post('/track', (request, response) => {
  try {
    const { carId, latitude, longitude } = request.body;
    const record = { carId, latitude, longitude };

    if (typeof carId === 'undefined') {
      response.status(300).json({ msg: "CarID Undefined" });
      return;
    }
    io.emit('locationUpdate', [record]);
    console.log(record);
    response.status(200).json({ msg: "Location updated successfully" });
  } catch (err) {
    response.status(400).json({ msg: "Internal Server Error" });
  }
});

app.get('/track', (request, response) => {
  try {
    const { carId, latitude, longitude } = request.query;
    const record = { carId, latitude, longitude };

    if (typeof carId === 'undefined') {
      response.status(300).json({ msg: "CarID Undefined" });
      return;
    }
    io.emit('locationUpdate', [record]);
    console.log(record);
    response.status(200).json({ msg: "Location updated successfully" });
  } catch (err) {
    response.status(400).json({ msg: "Internal Server Error" });
  }
});

app.post("/test", (req, res) => {
  console.log(`DATA FROM HW--->>>>>>>>${JSON.stringify(req.body)}<<<<<<<<<----`);
  res.status(200).send('Data received.');
});

app.post('/sos', (request, response) => {
  const { carId, message } = request.body;
  const sosMessage = { carId, message, timestamp: new Date() };
  
  io.emit('sos', sosMessage);
  response.status(200).send({ message: 'SOS alert sent successfully' });
});

app.post('/ok', (request, response) => {
  const { carId, message } = request.body;
  const okMessage = { carId, message, timeStamp: new Date() };
  io.emit("ok", [okMessage]);
  console.log("OK status updated", carId);
  response.status(200).send([{ okMessage, message: `OK status updated ${carId}` }]);
});

server.listen(443, () => {
  console.log("Listening at :443");
});
