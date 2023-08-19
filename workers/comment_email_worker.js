const queue = require("../config/kue");

const commentsMailer = require("../mailers/comments_mailer");

queue.process("emails", function (job, done) {
  console.log("emails worker is processing a job ", job.data);

  commentsMailer.newComment(job.data);

  done();
});

//created a worker who is going to send those email for us instead of sending it via controller.
