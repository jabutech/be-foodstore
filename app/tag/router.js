// require module router from expres
const router = require("express").Router();
// Import multer for handle request form
const multer = require("multer");
// Import controller
const tagContoller = require("./controller");

// Route get all data tags
router.get("/tags", tagContoller.index);

// Route create new category
router.post("/tags", multer().none(), tagContoller.store);

// Route update category
router.put("/tags/:id", multer().none(), tagContoller.update);

// Route destroy category
router.delete("/tags/:id", tagContoller.destroy);

// Export
module.exports = router;
