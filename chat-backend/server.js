require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 5000;
const connectDb = require("./dbConfig/DbConfig");

// Connect to Db
connectDb();

// Import Routes
const authRoute = require("./routes/authRoute");


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 


// Routes
app.use("/api/auth", authRoute);

app.listen(PORT, () => {
  console.log(`✅ Server is running at ${PORT}`);
});
