// Import package
const router = require("express").Router();
const controller = require("./controller");

// Router show invoice
router.get("/invoices/:order_id", controller.show);

// Export
module.exports = router;
