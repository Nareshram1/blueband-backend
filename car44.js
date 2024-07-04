const Express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require('cors');

const app = Express();
const server = http.createServer(app);

const corsOptions = {
  origin: "*",
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false, // Set to false because credentials can't be true with wildcard origin
};

app.use(cors(corsOptions)); // Use CORS middleware
app.use(Express.json()); // Middleware to parse JSON bodies

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ['GET', 'POST'],
    credentials: false, // Set to false because credentials can't be true with wildcard origin
  },
});

// Endpoint to receive data from SIM7600E-H module
app.post('/test', (req, res) => {
  try {
    console.log('Received data from SIM7600E-H:', req.body);
    res.status(200).send('Data received board.');
  } catch (err) {
    console.error('Error handling data:', err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

app.get('/test', (req, res) => {
  const { latitude, longitude } = req.query;
  console.log(latitude, longitude);
  res.send('Data received board.');
});

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
