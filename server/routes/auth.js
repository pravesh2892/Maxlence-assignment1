const router = require("express").Router();
const { User } = require("../models/user");
const Token = require("../models/token");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const connection = require("../db");

router.post("/", async (req, res) => {
    try {
        const { error } = validate(req.body);
        if (error)
            return res.status(400).send({ message: error.details[0].message });

        const { email, password } = req.body;

       
        const user = await getUserByEmail(email);
        if (!user)
            return res.status(401).send({ message: "Invalid Email" });

        
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword)
            return res.status(401).send({ message: "Invalid Password" });

        
        if (!user.verified) {
            let token = await getTokenByUserId(user.id);
            if (!token) {
                const newToken = crypto.randomBytes(32).toString("hex");
                await createToken(user.id, newToken);
                const url = `${process.env.BASE_URL}users/${user.id}/verify/${newToken}`;
                await sendEmail(user.email, "Verify Email", url);
            }

            return res.status(400).send({ message: "An Email has been sent to your account, please verify" });
        }

     
        const authToken = user.generateAuthToken();

        res.status(200).send({
            user: {
                name: user.firstName,
                surname: user.lastName,
                email: user.email,
                profileImage: user.profileImage
            },
            token: authToken,
            message: "Logged in successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

router.post("/reset-password", async (req, res) => {
    try {
        const { error } = validateResetPassword(req.body);
        if (error) return res.status(400).send({ message: error.details[0].message });

        const { email } = req.body;

        const user = await getUserByEmail(email);
        if (!user) return res.status(400).send({ message: "Invalid email address" });

      
        const token = Math.floor(100000 + Math.random() * 900000).toString();

      
        await createOrUpdateToken(user.id, token);

      
        await sendEmail(user.email, "Password Reset", `Your password reset token is: ${token}`);

        res.status(200).send({ message: "Password reset token sent to your email" });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

router.post("/reset-password-update", async (req, res) => {
    try {
        const { error } = validatePasswordResetUpdate(req.body);
        if (error) return res.status(400).send({ message: error.details[0].message });

        const { token, password } = req.body;

      
        const tokenData = await getTokenByToken(token);
        if (!tokenData) return res.status(400).send({ message: "Invalid or expired token" });

      
        const user = await getUserById(tokenData.userId);
        if (!user) return res.status(400).send({ message: "User not found" });

        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashedPassword = await bcrypt.hash(password, salt);
        await updateUserPassword(user.id, hashedPassword);

     
        await removeToken(tokenData.id);

        res.status(200).send({ message: "Password reset successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});



const getUserByEmail = async (email) => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results[0]);
            }
        });
    });
};

const getUserById = async (userId) => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM users WHERE id = ?', [userId], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results[0]);
            }
        });
    });
};

const createOrUpdateToken = async (userId, token) => {
    return new Promise((resolve, reject) => {
        connection.query('INSERT INTO tokens (userId, token) VALUES (?, ?) ON DUPLICATE KEY UPDATE token = ?', [userId, token, token], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

const getTokenByToken = async (token) => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM tokens WHERE token = ?', [token], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results[0]);
            }
        });
    });
};

const updateUserPassword = async (userId, password) => {
    return new Promise((resolve, reject) => {
        connection.query('UPDATE users SET password = ? WHERE id = ?', [password, userId], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

const removeToken = async (tokenId) => {
    return new Promise((resolve, reject) => {
        connection.query('DELETE FROM tokens WHERE id = ?', [tokenId], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

const validateResetPassword = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required().label("Email"),
    });
    return schema.validate(data);
};

const validatePasswordResetUpdate = (data) => {
    const schema = Joi.object({
        token: Joi.string().required().label("Token"),
        password: Joi.string().required().label("Password"),
    });
    return schema.validate(data);
};

const validate = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required().label("Email"),
        password: Joi.string().required().label("Password"),
    });
    return schema.validate(data);
};

module.exports = router;
