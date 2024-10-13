const nodemailer = require('nodemailer');

// Configuración del transporte de correo
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.sendOTP = (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Tu código OTP',
    text: `Tu código OTP es: ${otp}`,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) console.error('Error al enviar correo:', err);
    else console.log('Correo enviado:', info.response);
  });
};
