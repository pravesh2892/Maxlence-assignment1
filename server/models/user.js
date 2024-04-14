const connection = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const User = {};

User.create = (userData, callback) => {
    const { firstName, lastName, email, password } = userData;
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            return callback(err, null);
        }
        const sql = 'INSERT INTO users (firstName, lastName, email, password) VALUES (?, ?, ?, ?)';
        connection.query(sql, [firstName, lastName, email, hash], (err, result) => {
            if (err) {
                return callback(err, null);
            }
            const userId = result.insertId;
            callback(null, userId);
        });
    });
};

User.findByEmail = (email, callback) => {
    const sql = 'SELECT * FROM users WHERE email = ?';
    connection.query(sql, [email], (err, rows) => {
        if (err) {
            return callback(err, null);
        }
        if (rows.length === 0) {
            return callback(null, null);
        }
        const user = rows[0];
        callback(null, user);
    });
};

User.generateAuthToken = (userId, callback) => {
    const token = jwt.sign({ _id: userId }, process.env.JWTPRIVATEKEY, { expiresIn: "7d" });
    callback(null, token);
};

const validate = (data) => {
    const schema = Joi.object({
        firstName: Joi.string().required().label("First Name"),
        lastName: Joi.string().required().label("Last Name"),
        email: Joi.string().email().required().label("Email"),
        password: passwordComplexity().required().label("Password"),
    });
    return schema.validate(data);
};

module.exports = { User, validate };
