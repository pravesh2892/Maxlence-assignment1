const router = require("express").Router();
const { User, validate } = require("../models/user");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const Token = require("../models/token");
const sendEmail = require("../utils/sendEmail");
const connection = require("../db");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const Joi = require('joi');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Set up Multer storage with Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "profile_images", 
    allowed_formats: ["jpg", "jpeg", "png"]
  }
});
const upload = multer({ storage: storage })

// POST /api/users - Create a new user with profile image upload
router.post("/", upload.single("profileImage"), async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    const { firstName, lastName, email, password } = req.body;

   
    const existingUser = await getUserByEmail(email);
    if (existingUser)
      return res.status(409).send({ message: "User with given email already exists!" });

  
    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(password, salt);

  
    const newUser = {
      firstName,
      lastName,
      email,
      password: hashPassword,
      profileImage: req.file.path 
    };
    await createUser(newUser);

    // Create verification token and send email
    const tokenValue = crypto.randomBytes(32).toString("hex");
    await createVerificationToken(newUser.email, tokenValue);

    const url = `${process.env.BASE_URL}users/${newUser.id}/verify/${tokenValue}`;
    await sendEmail(newUser.email, "Verify Email", url);

    res.status(201).send({ message: "An Email has been sent to your account, please verify" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Route for verifying email
router.get("/:id/verify/:token/", async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(400).send({ message: "Invalid link" });

    const token = await getTokenByUserId(user.id);
    if (!token || token.token !== req.params.token)
      return res.status(400).send({ message: "Invalid link" });

    await updateUserVerification(user.id);

    await deleteToken(token.id);

    res.status(200).send({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// GET /api/users - Get all users
router.get("/", async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// DELETE /api/users/:id - Delete a user
router.delete("/:id", async (req, res) => {
  try {
    const user = await deleteUserById(req.params.id);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    res.status(200).send({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { error } = validateUpdate(req.body);
    if (error) {
      return res.status(400).send({ message: error.details[0].message });
    }

    const updatedUser = await updateUserById(req.params.id, req.body);

    if (!updatedUser) {
      return res.status(404).send({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Helper functions

const createUser = async (user) => {
  return new Promise((resolve, reject) => {
    connection.query('INSERT INTO users SET ?', user, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

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

const getAllUsers = async () => {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM users', (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

const deleteUserById = async (userId) => {
  return new Promise((resolve, reject) => {
    connection.query('DELETE FROM users WHERE id = ?', [userId], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

const updateUserById = async (userId, userData) => {
  return new Promise((resolve, reject) => {
    connection.query('UPDATE users SET ? WHERE id = ?', [userData, userId], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

const createVerificationToken = async (userId, tokenValue) => {
  return new Promise((resolve, reject) => {
    connection.query('INSERT INTO tokens (userId, token) VALUES (?, ?)', [userId, tokenValue], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

const getTokenByUserId = async (userId) => {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM tokens WHERE userId = ?', [userId], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results[0]);
      }
    });
  });
};

const deleteToken = async (tokenId) => {
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

const updateUserVerification = async (userId) => {
  return new Promise((resolve, reject) => {
    connection.query('UPDATE users SET verified = true WHERE id = ?', [userId], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

const validateUpdate = (data) => {
  const schema = Joi.object({
    firstName: Joi.string().required().label("First Name"),
    lastName: Joi.string().required().label("Last Name"),
    email: Joi.string().email().required().label("Email"),
  });
  return schema.validate(data);
};

module.exports = router;
