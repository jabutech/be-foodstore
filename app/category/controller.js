// Import model category
const Category = require("./model");

// import policyFor
const { policyFor } = require("../policy");

// Function index
async function index(req, res, next) {
  try {
    // Get query 'limit' dan skip from client untuk membuat pagination / menerima berapa data yang ingin ditampilkan oleh client
    // dan memberikan nilai default jika client tidak memberikan nilai pada query
    let { limit = 10, skip = 0 } = req.query;

    // Get all data category with paginate
    const categories = await Category.find()
      // Change type data query from string to integer with parseInt
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    // return response
    return res.json(categories);
  } catch (err) {
    next(err);
  }
}

// Function store
async function store(req, res, next) {
  try {
    // Cek policy
    let policy = policyFor(req.user);
    // Cek apakah user pada variable policy tidak bisa membuat category
    if (!policy.can("create", "Category")) {
      // <-- can create Category
      return res.json({
        error: 1,
        message: `Anda tidak memiliki akses untuk membuat kategori`,
      });
    }

    // Tangkap data (payload) yang dikirimkan dari client
    let payload = req.body;

    // Create data with model Category
    let category = new Category(payload);

    // Save
    await category.save();

    // Return response with send new data
    return res.json(category);
  } catch (err) {
    // Check error apakah karena validasi
    if (err && err.name === "ValidatorError") {
      // Kembalikan error
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }

    // Kirim error yang bukan karena validasi
    next(err);
  }
}

// Function update
async function update(req, res, next) {
  try {
    // Cek policy
    let policy = policyFor(req.user);

    // Cek apakah user pada variable policy tidak bisa membuat category
    if (!policy.can("update", "Category")) {
      // <-- can create Category
      return res.json({
        error: 1,
        message: `Anda tidak memiliki akses untuk mengupdate
        kategori`,
      });
    }

    // Tangkap data (payload) yang dikirimkan dari client
    let payload = req.body;

    // Cari data category by id dan langsung update
    let category = await Category.findOneAndUpdate(
      // Get id category
      { _id: req.params.id },
      // Get data terbaru
      payload,
      {
        // 'new' adalah instruksi untuk MongoDB agar mengembalikan data category yang paling baru
        new: true,
        // Jalankan validation, karena pada proses update validasion tidak otomatis berjalan
        runValidators: true,
      }
    );

    // Save
    await category.save();

    // Return response with send new data
    return res.json(category);
  } catch (err) {
    // Check error apakah karena validasi
    if (err && err.name === "ValidatorError") {
      // Kembalikan error
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }

    // Kirim error yang bukan karena validasi
    next(err);
  }
}

// Function destroy
async function destroy(req, res, next) {
  try {
    // Cek policy
    let policy = policyFor(req.user);

    // Cek apakah user pada variable policy tidak bisa membuat category
    if (!policy.can("delete", "Category")) {
      // <-- can create Category
      return res.json({
        error: 1,
        message: `Anda tidak memiliki akses untuk menghapus
        kategori`,
      });
    }
    // Get category and delete
    let deleted = await Category.findOneAndDelete({ _id: req.params.id });

    // return category successfuly deleted
    return res.json(deleted);
  } catch (err) {
    next(err);
  }
}

// Export
module.exports = { index, store, update, destroy };
