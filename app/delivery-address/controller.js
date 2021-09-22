// Import model Delivery address
const DeliveryAddress = require("./model");
// Use policy untuk otorisasi
const { policyFor } = require("../policy");
// Import function `subject` dari @casl/ability untuk melakukan proteksi
const { subject } = require("@casl/ability");
const { find } = require("./model");

// Function index
async function index(req, res, next) {
  // (1) Gunakan policy untuk mengambil hak akses user yang login memelalui file './policy/index'
  let policy = policyFor(req.user);

  //   (2) Gunakan policy untuk mengecek, apakah user yang login bisa melihat daftar alamat
  if (!policy.can("view", "DeliveryAddress")) {
    //   Berikan respon error
    return res.json({
      error: 1,
      message: `You're not allowed to perform this action.`,
    });
  }

  try {
    //  (3) Ambil query limit dan skip untuk pagination dari client,
    // dan jika client tidak ada memberikan request set nilai devfaulnya
    let { limit = 10, skip = 0 } = req.query;

    // (4) Count total jumlah data address
    const count = await DeliveryAddress.find({
      user: req.user._id,
    }).countDocuments();

    // (5) Get data address
    const deliveryAddress = await DeliveryAddress
      // Cari berdasarkan user yang login
      .find({ user: req.user._id })
      // Limit, dan rubah query limit from string to integer
      .limit(parseInt(limit))
      // Skip, dan rubah query skip from string to integer
      .skip(parseInt(skip))
      // Dan sorting berdasarkan descending dari filed 'createdAt'
      .sort("-createdAt");

    // (6) respon `data` dan `count`, `count` digunakan untuk pagination client
    return res.json({ data: deliveryAddress, count: count });
  } catch (err) {
    //   (1) Handle error jika berasal dari validation
    if (err && err.name == "ValidationError") {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }

    // (2) Handle error selain dari validation
    next(err);
  }
}

// Function create new delivery address
async function store(req, res, next) {
  // (1) Gunakan policy untuk mengambil hak akses user yang login melalui file './policy/index'
  let policy = policyFor(req.user);

  //   Cek jika policy tidak memiliki hak untuk membuat delivery address
  if (!policy.can("create", "DeliveryAddress")) {
    // Beri respon ke clien
    return res.json({
      error: 1,
      messsage: `You're not allowed to perform this action`,
    });
  }

  //   (2) Process create delivery address
  try {
    //  (1) Get data payload from client
    let payload = req.body;

    // (2) Get data user
    let user = req.user;

    // (3) Buat instance 'DeliveryAddress' berdasarkan payload dan data 'user'
    let address = new DeliveryAddress({
      // data yang dikirim dari cleint
      ...payload,
      // User yang memproses
      user: user._id,
    });

    // (4) Simpan instance diatas ke mongodb
    await address.save();

    // (5) Respon ke client dengan mengembalikan data address yang berhasil dibuat
    return res.json(address);
  } catch (err) {
    //   Tangani error

    // (1) Tangani Jika error dari validasi
    if (err & (err.name === "ValidationError")) {
      // return
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }

    // (2) Tangani error jika diluar kondisi diatas
    next(err);
  }
}

// Function update
async function update(req, res, next) {
  // (1) Gunakan policy untuk mengambil hak akses user yang login melalui file './policy/index'
  let policy = policyFor(req.user);

  //   (2) Process Update
  try {
    // (1) Ambil 'id' yang akan di update dari 'req.params'
    let { id } = req.params;

    // (2) buat `payload` dan keluarkan `_id` agark tidak terjadi kegagalan saat update
    let { _id, ...payload } = req.body;

    // (3) Get address berdasarkan id yang dicari
    let address = await DeliveryAddress.findOne({ _id: id });

    // (4) Cek policy
    // (1) Cek menggunakan package '@casl/ability'
    // apakah address benar punya user yang mau ngupdate,
    // dicocokan dengan user yang login dan id user yang diinput pada data address saat create data
    let subjectAddress = subject("DeliveryAddress", {
      ...address,
      //   Cek apakah user_id login sama dengan
      user_id: address.user,
    });

    // (2) Cek apakah user role dapat melakukan edit data address ini,
    // dan sebelumnya sudah dicek di atas apakah user sama dengan user_id pada data ini
    if (!policy.can("update", subjectAddress)) {
      return res.json({
        error: 1,
        message: `You're not allower to modify this resource`,
      });
    }

    // (5) Proses update ke MongoDb
    address = await DeliveryAddress.findOneAndUpdate(
      // Cari data address berdasarkan id
      { _id: id },
      // Masukkan data update terbaru
      payload,
      // Info ke MongoDB untuk mengembalikan data terbaru
      { new: true }
    );

    // (6) return response to client
    return res.json(address);
  } catch (err) {
    // (1) Handle kemungkinan dari validasi
    if (err && err.name == "ValidationError") {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }

    // (2) Handle error selain validasi
    next(err);
  }
}

// Function destroy
async function destroy(req, res, next) {
  // (1) Gunakan policy untuk mengambil hak akses user yang login melalui file './policy/index'
  let policy = policyFor(req.user);

  try {
    //   (2) Ambil id address yang ingin dihapus
    let { id } = req.params;

    // (3) Cari address yang ingin dihapus dengan id
    let address = await DeliveryAddress.findOne({ _id: id });

    // (4) Buat subject address
    let subjectAddress = subject({
      // Ambil data address, dan pecah dengan spread
      ...address,
      // Ambil user_id didalam address
      user: address.user,
    });

    // (5) Cek policy
    if (!policy.can("delete", subjectAddress)) {
      return res.json({
        error: 1,
        message: `You're not allowed to delete this resource`,
      });
    }

    // (6) Hapus address
    await DeliveryAddress.findOneAndDelete({ _id: id });

    // (7) Return respon ke user
    return res.json(address);
  } catch (err) {
    // (1) Handle error jika berasal dari validation
    if (err && err.name == "ValidationError") {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }

    // (2) Handle error jika bukan berasal dari validation
    next(err);
  }
}

// Export function
module.exports = {
  index,
  store,
  update,
  destroy,
};
