const Express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require('cors');

const app = Express();
const server = http.createServer(app);

const corsOptions = {
  origin: [
    // 'http://localhost:3000',
    // 'https://blueband-frontend.vercel.app',
    // "https://adya-flix.vercel.app",
    // "http://localhost:5173",
    // "http://localhost:4173",
    "*"
  ], // Allow only your frontend origin
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};

app.use(cors(corsOptions)); // Use CORS middleware
app.use(Express.json()); // Middleware to parse JSON bodies

const io = socketIo(server, {
  cors: {
    origin: [
      // 'http://localhost:3000',
      // 'https://blueband-frontend.vercel.app',
      // "https://adya-flix.vercel.app",
      // "http://localhost:5173",
      // "http://localhost:4173",
      "*",
    ], // Allow only your frontend origin
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.post('/track', (request, response) => {
  try {
    const { carId, latitude, longitude } = request.body;
    // console.log(carId)
    const record = { carId, latitude, longitude };

    if (typeof (carId) == 'undefined') { // when the /track endpoint is not on focus
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

app.post("/test",(req,res)=>{
  console.log(`DATA FROM HW--->>>>>>>>${JSON.stringify(req.body)}<<<<<<<<<----`)
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

server.listen(5000, () => {
  console.log("Listening at :5000");
});
