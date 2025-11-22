import nodemailer from 'nodemailer';
import { WELCOME_EMAIL_TEMPLATE } from './template';

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.NODEMAILER_EMAIL!,
        pass: process.env.NODEMAILER_PASSWORD!,
    }
})


export const sendWelcomeEmail = async ({ email, name, intro }: WelcomeEmailData) => {
    const htmlTemplate = WELCOME_EMAIL_TEMPLATE
    .replace('{{name}}', name)
    .replace('{{intro}}', intro);

    const mailOptions = {
        from: `"MG Solutions" <mingjia.guan@gmail.com>`,
        to: email, 
        subject: `Welcome to you Financial Dashboard - your stock market toolkit is ready!`,
        text: 'Thanks for signing up today!',
        html: htmlTemplate
    }

    await transporter.sendMail(mailOptions)
}