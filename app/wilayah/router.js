// Use router
const router = require("express").Router();

// use controller wilayah
const wilayahController = require("./controller");

// Route propinsi
router.get("/wilayah/provinsi", wilayahController.getProvisi);
// Route kabupaten
router.get("/wilayah/kabupaten", wilayahController.getKabupaten);
// Route kecamatan
router.get("/wilayah/kecamatan", wilayahController.getKecamatan);
// Route desa
router.get("/wilayah/desa", wilayahController.getDesa);

// Export router
module.exports = router;
