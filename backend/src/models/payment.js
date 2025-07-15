const db = require('../utils/db');

exports.createPayment = (user_id, pix_id, value, description, status, pix_code, cb) => {
  db.run(
    `INSERT INTO payments (user_id, pix_id, value, description, status, pix_code) VALUES (?, ?, ?, ?, ?, ?)`,
    [user_id, pix_id, value, description, status, pix_code],
    cb
  );
};

exports.listPaymentsByUser = (user_id, cb) => {
  db.all(
    `SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
    [user_id],
    cb
  );
};
