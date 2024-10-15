const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const connectDB = require("./config/db");
const PORT = process.env.PORT || 8000;


const AdminRoute = require("./Routes/AdminRoute");
const UserRoute = require("./Routes/UserRoute");
const SettingRoutes = require("./Routes/SettingRoutes");
const ClientRoutes = require("./Routes/ClientRoutes");


// Connect to the database
connectDB();
const server = http.createServer(app);
const corsOptions = {
  origin: "http://localhost:3000",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  credentials: true,
  allowedHeaders: "Content-Type,Authorization",
  optionsSuccessStatus: 204,
};
// Apply CORS middleware to the app
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Use your routes
// app.use('/api', GameRoutes(io));
app.use("/api", UserRoute);
app.use("/api", AdminRoute);
app.use("/api", SettingRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Hello World !");
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


