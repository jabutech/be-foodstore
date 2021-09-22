// (1) import `router` dan `multer`
const router = require("express").Router();
const multer = require("multer");

// (2) import `orderController`
const orderController = require("./controller");

// (3) Route
// Route get data order
router.get("/orders", orderController.index);
// Route create order
router.post("/orders", multer().none(), orderController.store);

// (4) export `router`
module.exports = router;
