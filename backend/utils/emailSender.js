const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendInvitationEmail = async (recipient, link) => {
  try {
    const mailOptions = {
      from: `"BHP System" <${process.env.SMTP_USER}>`,
      to: recipient,
      subject: "Zaproszenie na test BHP",
      text: `Zostałeś zaproszony do wykonania testu BHP. Kliknij w link, aby rozpocząć: ${link}`,
      html: `<p>Zostałeś zaproszony do wykonania testu BHP.</p>
                   <p>Kliknij w link, aby rozpocząć:</p>
                   <a href="${link}">${link}</a>`,
    };

    await transporter.sendMail(mailOptions);
    console.log("E-mail został wysłany do:", recipient);
  } catch (error) {
    console.error("Błąd podczas wysyłania e-maila:", error);
    throw error;
  }
};

const sendCompletionEmail = async (recipient, accessCode) => {
  try {
    const mailOptions = {
      from: `"BHP System" <${process.env.SMTP_USER}>`,
      to: recipient,
      subject: "Gratulacje! Zdałeś test BHP",
      text: `Gratulacje! Twój kod dostępu do obiektu: ${accessCode}. Pokaż go na wejściu.`,
      html: `<p>Gratulacje! Twój kod dostępu do obiektu:</p>
                   <h2>${accessCode}</h2>
                   <p>Pokaż ten kod na wejściu do obiektu.</p>`,
    };

    await transporter.sendMail(mailOptions);
    console.log("E-mail z kodem dostępu wysłany do:", recipient);
  } catch (error) {
    console.error("Błąd podczas wysyłania e-maila:", error);
    throw error;
  }
};

module.exports = { sendInvitationEmail, sendCompletionEmail };
