const nodeMailer = require("nodemailer");

async function sendMail(to, subject, text, html) {
  let from = process.env.USER;

  let transport = nodeMailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.USER,
      pass: process.env.PASS,
    },
  });

  console.log(from, to, subject, text, html);

  let mail = transport.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });

  console.log(mail);

  return await mail.messageId;
}

module.exports = sendMail;
