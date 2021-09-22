const router = require("express").Router();
const multer = require("multer");
const cartController = require("./controller");
router.put("/carts", multer().none(), cartController.update);
// (3) route untuk `update` cart
router.get("/carts", cartController.index);
module.exports = router;
