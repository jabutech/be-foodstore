// (1) import `router` dan `multer`
const router = require("express").Router();
const multer = require("multer");

// (2) import `addressController`
const addressController = require("./controller");

// (3) definisikan Route
// Router get data address
router.get("/delivery-addresses", addressController.index);
// Router create new address
router.post("/delivery-addresses", multer().none(), addressController.store);
// Route update address
router.put("/delivery-address/:id", multer().none(), addressController.update);
// Route delete address
router.delete(
  "/delivery-address/:id",
  multer().none(),
  addressController.destroy
);

// (4) export `router`
module.exports = router;
