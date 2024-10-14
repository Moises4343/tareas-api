const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

exports.sendOTP = async (phoneNumber, otp) => {
  try {
    await client.messages.create({
      body: `Tu código OTP es: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
    console.log(`OTP enviado: ${otp}`);
  } catch (error) {
    console.error('Error al enviar OTP:', error);
    throw new Error('Error al enviar OTP');
  }
};

exports.generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
