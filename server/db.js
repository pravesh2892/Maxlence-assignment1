require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql");

const app = express();

// MySQL Database connection
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
        return;
    }
    console.log('Connected to MySQL database successfully');
});

// Middlewares
app.use(express.json());
app.use(cors());

// Routes
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
});
