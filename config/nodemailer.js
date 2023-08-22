const nodemailer = require("nodemailer"); //import nordmailer
const ejs = require("ejs");
const path = require("path");

const env = require("./environment");
//the part which sends the email
//defining  transporter
let transporter = nodemailer.createTransport(env.smtp);

//defines whenever i am going to send an html email where the file would be placed inside the views
let renderTemplate = (data, relativePath) => {
  //relativePath is from where the mail is being send
  let mailHTML; //to store the html we have to sent
  ejs.renderFile(
    path.join(__dirname, "../views/mailers", relativePath),
    data,
    function (err, template) {
      //callback
      if (err) {
        console.log("error in rendering template");
        return;
      }

      mailHTML = template;
    }
  );

  return mailHTML;
};

module.exports = {
  transporter: transporter,
  renderTemplate: renderTemplate,
};
