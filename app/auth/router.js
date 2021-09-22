// Import router
const router = require("express").Router();
// Import multer untuk menangani respon form
const multer = require("multer");
// Import controller for auth
const authController = require("./controller");
// Import passport
const passport = require("passport");
// Import local strategy
const strategyLocal = require("passport-local").Strategy;

// gunakan passport
// usernameField untuk membuat login menggunakan 'email', karena default adalag 'username'
passport.use(
  new strategyLocal({ usernameField: "email" }, authController.localStrategy)
);

// Route register
router.post("/register", multer().none(), authController.register);
// Router login
router.post("/login", multer().none(), authController.login);
// Router login
router.post("/logout", authController.logout);
// Router me
router.get("/me", authController.me);

// Export router
module.exports = router;
