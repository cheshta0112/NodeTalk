const nodemailer = require("../config/nodemailer");

// this is another way of exporting a method
exports.resetPassword = (user) => {
  let htmlString = nodemailer.renderTemplate(
    { user: user },
    "/users/password_reset.ejs"
  );
  console.log("Inside resetPassword Mailer");

  nodemailer.transporter.sendMail(
    {
      from: "cheshtapal07@gmail.com",
      to: user.email,
      subject: "Reset Your Password",
      html: htmlString,
    },
    (err, info) => {
      if (err) {
        console.log("Error in sending mail", err);
        return;
      }
      //console.log('Message sent', info);
      return;
    }
  );
};
