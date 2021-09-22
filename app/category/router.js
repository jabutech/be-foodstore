// require module router from expres
const router = require("express").Router();
// Import multer for handle request form
const multer = require("multer");
// Import controller
const categoryController = require("./controller");

// Route get all data categories
router.get("/categories", categoryController.index);

// Route create new category
router.post("/categories", multer().none(), categoryController.store);

// Route update category
router.put("/categories/:id", multer().none(), categoryController.update);

// Route destroy category
router.delete("/categories/:id", categoryController.destroy);

// Export
module.exports = router;
