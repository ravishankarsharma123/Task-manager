import Mailgen from "mailgen";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();






const sendMail = async(options) => {
    const mailGenerator = new Mailgen({
        theme: 'default',
        product: {
            name: 'Task Manager',
            link: 'https://mailgen.js/'
            
        }
    });

    const emailText = mailGenerator.generatePlaintext(options.mailGenContent)
    const emailHtml = mailGenerator.generate(options.mailGenContent)


    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAILTRAP_SMTP_PASS
        }
    });
console.log(emailText)
// console.log(emailHtml)
    console.log(options.email)

    const mail = {
        from: process.env.MAIL_FROM,
        to: options.email,
        subject: options.subject,
        text: emailText,
        html: emailHtml
    };
    try {
        await transporter.sendMail(mail)
        console.log('Email sent successfully')
        
    } catch (error) {
        console.error('Error sending email:', error)
        throw new Error('Unable to send email')
        
    }
};


const emailVerificationMailGenContent = (username,verificationUrl) => {
    return {
        body: {
            name: username,
            intro: 'Welcome to Task Manager!',
            action: {
                instructions: 'To get started with Task Manager, please verify your email address by clicking the button below:',
                button: {
                    color: '#22BC66', // Optional action button color
                    text: 'Verify your email',
                    link: verificationUrl,
                },
            },
            outro: 'If you did not create an account, no further action is required.',


        }
    }
}

const forgotPasswordMailGenContent = (username, passwordResetUrl) => {
    return {
        body: {
            name: username,
            intro: 'You have requested to reset your password.',
            action: {
                instructions: 'To reset your password, please click the button below:',
                button: {
                    color: '#22BC66', // Optional action button color
                    text: 'Reset your password',
                    link: passwordResetUrl,
                },
            },
            outro: 'If you did not request a password reset, no further action is required.',
        }
    }
}


export { sendMail, emailVerificationMailGenContent, forgotPasswordMailGenContent }




