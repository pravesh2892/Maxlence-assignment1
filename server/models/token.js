const connection = require("../db");


const createTokenTable = `
    CREATE TABLE IF NOT EXISTS tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        token VARCHAR(255) NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
`;

connection.query(createTokenTable, (err, results) => {
    if (err) {
        console.error('Error creating token table:', err);
    } else {
        console.log('Token table created successfully');
    }
});

const Token = {};

Token.create = (userId, token, callback) => {
    connection.query('INSERT INTO tokens (userId, token) VALUES (?, ?)', [userId, token], callback);
};

Token.findByToken = (token, callback) => {
    connection.query('SELECT * FROM tokens WHERE token = ?', [token], (err, results) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results[0]);
        }
    });
};

Token.delete = (token, callback) => {
    connection.query('DELETE FROM tokens WHERE token = ?', [token], callback);
};

module.exports = Token;
