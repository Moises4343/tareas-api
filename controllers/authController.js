const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { generateOTP, sendOTP } = require('../services/otpService');

exports.register = (req, res) => {
  const { username, password, phone } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  const query = 'INSERT INTO usuarios (username, password, phone) VALUES (?, ?, ?)';
  db.query(query, [username, hashedPassword, phone], (err) => {
    if (err) return res.status(500).send('Error al registrar usuario');
    res.status(201).send('Usuario registrado con éxito');
  });
};

exports.login = (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM usuarios WHERE username = ?', [username], (err, results) => {
    if (err || results.length === 0) return res.status(401).send('Usuario o contraseña incorrectos');
    
    const user = results[0];
    const validPassword = bcrypt.compareSync(password, user.password);

    if (!validPassword) return res.status(401).send('Usuario o contraseña incorrectos');

    const otp = generateOTP();
    const expiration = new Date(Date.now() + 5 * 60000); // 5 minutos

    db.query('UPDATE usuarios SET otp_code = ?, otp_expiration = ? WHERE id = ?', 
      [otp, expiration, user.id], async (err) => {
        if (err) return res.status(500).send('Error al generar OTP');
        await sendOTP(user.phone, otp);
        res.status(200).send('OTP enviado, verifica tu teléfono');
      });
  });
};

exports.verifyOTP = (req, res) => {
  const { username, otp } = req.body;

  db.query('SELECT * FROM usuarios WHERE username = ?', [username], (err, results) => {
    if (err || results.length === 0) return res.status(401).send('Usuario no encontrado');

    const user = results[0];
    const validOTP = user.otp_code === otp && new Date() < new Date(user.otp_expiration);

    if (!validOTP) return res.status(400).send('OTP inválido o expirado');

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
  });
};
