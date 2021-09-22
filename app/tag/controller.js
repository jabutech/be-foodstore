// Import model Tag
const Tag = require("./model");

// import policyFor
const { policyFor } = require("../policy");

// Function index
async function index(req, res, next) {
  try {
    // Get query 'limit' dan skip from client untuk membuat pagination / menerima berapa data yang ingin ditampilkan oleh client
    // dan memberikan nilai default jika client tidak memberikan nilai pada query
    let { limit = 10, skip = 0 } = req.query;

    // Get all data tag with paginate
    const tag = await Tag.find()
      // Change type data query from string to integer with parseInt
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    // return response
    return res.json(tag);
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
    if (!policy.can("create", "Tag")) {
      // <-- can create Tag
      return res.json({
        error: 1,
        message: `Anda tidak memiliki akses untuk membuat tag`,
      });
    }

    // Tangkap data (payload) yang dikirimkan dari client
    let payload = req.body;

    // Create data with model Tag
    let tag = new Tag(payload);

    // Save
    await tag.save();

    // Return response with send new data
    return res.json(tag);
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
    // Cek apakah user pada variable policy tidak bisa update tag
    if (!policy.can("update", "Tag")) {
      return res.json({
        error: 1,
        message: `Anda tidak memiliki akses untuk mengupdate tag`,
      });
    }

    // Tangkap data (payload) yang dikirimkan dari client
    let payload = req.body;

    // Cari data tag by id dan langsung update
    let tag = await Tag.findOneAndUpdate(
      // Get id tag
      { _id: req.params.id },
      // Get data terbaru
      payload,
      {
        // 'new' adalah instruksi untuk MongoDB agar mengembalikan data tag yang paling baru
        new: true,
        // Jalankan validation, karena pada proses update validasion tidak otomatis berjalan
        runValidators: true,
      }
    );

    // Save
    await tag.save();

    // Return response with send new data
    return res.json(tag);
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
    // Cek apakah user pada variable policy tidak bisa delete tag
    if (!policy.can("delete", "Tag")) {
      return res.json({
        error: 1,
        message: `Anda tidak memiliki akses untuk mendelete tag`,
      });
    }

    // Get Tag and delete
    let deleted = await Tag.findOneAndDelete({ _id: req.params.id });

    // return Tag successfuly deleted
    return res.json(deleted);
  } catch (err) {
    next(err);
  }
}

// Export
module.exports = { index, store, update, destroy };
