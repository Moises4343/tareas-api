const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const otpService = require('../services/otpService');

// Inicio de sesión
exports.login = (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM usuarios WHERE username = ?', [username], async (err, results) => {
    if (err) return res.status(500).send('Error en el servidor');
    if (results.length === 0) return res.status(404).send('Usuario no encontrado');

    const user = results[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).send('Contraseña incorrecta');

    // Generar OTP y enviarlo
    const otp = otpService.generateOTP();
    const otpExpiration = new Date(Date.now() + 5 * 60000); // 5 minutos de validez

    db.query('UPDATE usuarios SET otp_code = ?, otp_expiration = ? WHERE id = ?', 
      [otp, otpExpiration, user.id], (err) => {
        if (err) return res.status(500).send('Error al generar OTP');
        otpService.sendOTP(user.email, otp); // Enviar OTP por correo
        res.status(200).send('OTP enviado, por favor verifica tu correo.');
      }
    );
  });
};

// Validar OTP
exports.verifyOTP = (req, res) => {
  const { username, otp } = req.body;

  db.query('SELECT * FROM usuarios WHERE username = ?', [username], (err, results) => {
    if (err) return res.status(500).send('Error en el servidor');
    if (results.length === 0) return res.status(404).send('Usuario no encontrado');

    const user = results[0];
    if (user.otp_code !== otp || new Date() > new Date(user.otp_expiration)) {
      return res.status(400).send('OTP inválido o expirado');
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
  });
};
