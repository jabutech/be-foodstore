// Import router
const router = require("express").Router();
// Import multer for handle form request and middleware
const multer = require("multer");
// import os for access os data
const os = require("os");

// Import product controller
const productController = require("./controller");

// Route untuk mengambil seluruh data
router.get("/products", productController.index);

// Create route for insert data with user function store on controller product
// Pada package multer set untuk menyimpan file upload sementara ke lokasi 'temp'
// dan memerintahkan agar route ini bisa menerima file upload dengan nama 'image'
router.post(
  "/products",
  multer({ dest: os.tmpdir() }).single("image"),
  productController.store
);

// Route update
// Penjelasan konfigurasi lainnya sama seperti diatas
router.put(
  "/products/:id",
  multer({ dest: os.tmpdir() }).single("image"),
  productController.update
);

// Route delete
router.delete("/product/:id", productController.destroy);

// export router
module.exports = router;
