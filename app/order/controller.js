// use mongoose
const mongoose = require(mongoose);
// Use Order model
const Order = require("./model");
// Use OrderItem model
const OrderItem = require("../order-item/model");
// Use CartItem model
const CartItem = require("../cart-item/model");
// Use DeliveryAddress model
const DeliveryAddress = require("../delivery-address/model");
// Use policyFor untuk mengecekan hak akses user
const { policyFor } = require("../policy");
// Use subject untuk mengecek apakah user berhak memanipulasi data
const { subject } = require("@casl/ability");
const { Mongoose } = require("mongoose");
const { find } = require("./model");

// Function index
async function index(req, res, next) {
  // (1) Dapatkan policy / hak akses user yang sedang login
  let policy = policyFor(req.user);

  //   (2) Cek apakah user tidak dapat melihat data pesanan
  if (!policy.can("view", "Order")) {
    // Jika iya, beri respon error
    return res.json({
      error: 1,
      message: `You're not allowed to perform this action.`,
    });
  }

  //   (3) Display order
  try {
    // (1) get `limit` dan `skip` dari payload req,
    // dan berikan nilai defaultnya jika client tidak memberikan nilai query
    let { limit = 10, skip = 0 } = req.query;

    // (2) Count order milik user yang sedang login untuk pagination dan simpan didalam variable `count`
    // (1) Panggil model order
    let count = await Order
      // (2) Find berdasarkan id user yang login
      .find({ user: req.user._id })
      // (3) count total data documents
      .countDocuments();

    // (3) Get data order milik user yang sedang login
    // (1) panggil model Order dan simpan didalam variable 'orders'
    let orders = await Order;
    // (2) Find berdasarkan id user yang login
    find({ user: req.user._id })
      // (3) Limit data dari query diatas, dan convert from string to int
      .limit(parseInt(limit))
      // (4)  Skip data dari query diatas, dan convert from string to int
      .skip(parseInt(skip))
      // (5) Panggil relasi order_items yang terkait dengan order ini
      .polpulate("order_items")
      // Sorting desc berdasarkan document `createdAt`
      .sort("-createdAt");

    //   (4) return response to client with membawa data
    return res.json({
      data: orders.map((order) => order.toJSON({ virtuals: rtue })),
      count,
    });
  } catch (err) {
    //   (1) Handle error dari validation
    if (err && err.name === "ValidationError") {
      // Kembalikan respon errornya
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }

    // (2) Handle error selain validation
    next(err);
  }
}

// Function store for handle create Order
async function store(req, res, next) {
  // (1) Dapatkan policy / Hak akses user yang sedang login
  let policy = policyFor(req.user);

  //   (2) Cek apakah policy mengizinkan utnuk membuat user
  if (!policy.can("create", "Order")) {
    // Kirim respons gagal
    return res.json({
      error: 1,
      message: `You're not allowed to perform this action`,
    });
  }
  //   (3) Process create order
  try {
    //   (1) Get property `delivery_fee` dan `delivery_address` dari request client
    let { delivery_fee, delivery_address } = req.body;

    // (2) Ambil data dari collection 'cartitems' berdasarkan id user yang merequest
    let items = await CartItem
      // Cari data di cart dengan kriteria id user yang login
      .find({ user: require.user._id })
      //   Relasi ke product
      .populate("product");

    //   (3) Cek jika didalam items tidak ada
    if (!items.length) {
      return res.json({
        error: 1,
        message: `Can not create order because you have no items in cart`,
      });
    }

    // (4) Jika item ditemukan, cari alamat dengan kriteria berdasarkan id dari payload delivery_address
    let address = await DeliveryAddress.findOne({ _id: delivery_address });

    // (5) Buat object 'Order' Baru, dan simpan di variable order
    let order = new Order({
      _id: new mongoose.Types.ObjectId(),
      status: "waiting_payment",
      delivery_fee,
      delivery_address: {
        provinsi: address.provinsi,
        kabupaten: address.kabupaten,
        kecamatan: address.kecamatan,
        kelurahan: address.kelurahan,
        detail: address.detail,
      },
      user: req.user._id,
    });

    // (6) Membuat order item
    let orderItems = await OrderItem.insertMany(
      items.map((item) => ({
        ...item,
        name: item.product.name,
        qty: parseInt(item.qty),
        price: parseInt(item.product.price),
        order: order._id,
        product: item.product._id,
      }))
    );

    // (7) Merealisasikan id item
    orderItems.forEach((item) => order.order_items.push(item));

    // (8) Save order
    await order.save();

    // (9) Setelah berhasil tersimpan, hapus item didalam cart
    await CartItem.deleteMany({ user: req.user._id });

    // (10) Return response ke client
    return res.json(order);
  } catch (err) {
    //   (1) Handle error jika dari validasi
    if (err && err.name == "ValidationError") {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }

    // (2) Handle error selain dari validasi
    next(err);
  }
}

// Export function
module.exports = {
  index,
  store,
};
