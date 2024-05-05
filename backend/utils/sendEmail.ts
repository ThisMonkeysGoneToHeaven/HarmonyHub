import nodemailer from 'nodemailer';

const sendEmail = async (email: string, body: string, subject: string) => {

    const transporter = nodemailer.createTransport({
        host: 'smtp.mail.yahoo.com',
        port: 465,
        secure: true, // Use SSL for secure connection
        auth: {
          user: process.env.YAHOO_EMAIL,
          pass: process.env.YAHOO_PASSWORD
        }
      });

    const info = await transporter.sendMail({
        from: process.env.YAHOO_EMAIL,
        to: email,
        subject: subject,
        text: body,
    });

    return info;
};

export default sendEmail;