// module.exports.profile = function (req, res) {
//   res.end("<h1> users profile </h1>");
// };

module.exports.profile = function (req, res) {
  return res.render("user_profile", {
    title: "profile",
  });
};
