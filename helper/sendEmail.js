import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';

import transporter from '../config/transporter.js';

const sendEmail = async (email) => {
    const info = await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Your Notification',
        text: 'Your order has been processed.',
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
};

export default sendEmail;
