const db = require('../utils/db');

exports.createUser = (username, email, password, api_token, cnpj, cb) => {
  db.run(
    `INSERT INTO users (username, email, password, api_token, cnpj) VALUES (?, ?, ?, ?, ?)`,
    [username, email, password, api_token, cnpj],
    cb
  );
};

exports.findUserByEmail = (email, cb) => {
  db.get(`SELECT * FROM users WHERE email = ?`, [email], cb);
};

exports.findUserById = (id, cb) => {
  db.get(`SELECT * FROM users WHERE id = ?`, [id], cb);
};
