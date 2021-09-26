const nodeMailer = require('nodemailer');

const sendEmail = async({from, to, subject, text, html}) => {
    let transporter = nodeMailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: true,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASSWORD,
        },
    });
    const options = {from, to, subject, text, html};
    const result = await transporter.sendMail(options, (error, info) => {
       if (error) {
           console.log(`Error while sending an email : ${error}`);
           return error;
       } else {
           console.log(info.response)
          return {success:true};
       } 
    });
    return result;
}

module.exports = sendEmail;
