// Gunakan modul policyFor untuk mengecek hak akses
const { policyFor } = require("../policy");
// Use model products
const Product = require("../product/model");
// use model cartItem
const CartItem = require("../cart-item/model");

// Function index
async function index(req, res, next) {
  let policy = policyFor(req.user);
  if (!policy.can("read", "Cart")) {
    return res.json({
      error: 1,
      message: `You're not allowed to perform this action`,
    });
  }
  try {
    let items = await CartItem.find({ user: req.user._id }).populate("product");
    return res.json(items);
  } catch (err) {
    if (err && err.name == "ValidationError") {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }
  }
}

// Function update
async function update(req, res, next) {
  // (1) Ambil hak akses yang didapat oleh user yang login
  let policy = policyFor(req.user);

  //   Cek policy, apakah user yang login tidak memiliki akses update pada 'Cart'
  if (!policy.can("update", "Cart")) {
    return res.json({
      error: 1,
      message: `You're not allowed to perfom this action`,
    });
  }

  try {
    //   (2) Tangkap 'payload' dari client
    const { items } = req.body;

    // (3) ekstrak `_id` dari masing - masing `item` dari client dengan looping
    const productsIds = items.map((item) => item.product._id);

    // (4) Cari product berdasarkan id diatas,
    // dan di initialisasi ke const `products`
    const products = await productsIds.find({ _id: { $in: productsIds } });

    // (5) Siapkan data cartItems, dan looping dengan map
    let cartItems = items.map((item) => {
      // (1) Cari product dari document product yang sama dengan products yang direquest dari client
      let relatedProduct = products.find(
        (product) => product._id.toString() == item.product._id
      );

      //   (2) Setelah ketemu productnya,
      // Masukkan ke masing-masing key untuk dimasukkan ke MongoDB
      return {
        product: relatedProduct._id,
        price: relatedProduct.price,
        image_url: relatedProduct.image_url,
        name: relatedProduct.name,
        user: req.user._id,
        qty: item.qty,
      };
    });

    // (6) Hapus data cart didalam cartItem,
    // jika sebelumnya ada data cart item yang sudah diinput user
    await CartItem.deleteMany({ user: req.user._id });

    // (7) Lakukkan update ke document cartitem dengan function `bulkWrite`
    // 'bulkWrite' digunakan untuk memasukkan data secara serentak / Banyak
    await CartItem.bulkWrite(
      // (1) Looping cartItem, untuk mengambil semua data cart dari client
      cartItems.map((item) => {
        return {
          // (2) Lakukkan update sekali
          updateOne: {
            // (3) Filter data berdasarkan user yang login, dan product
            filter: { user: req.user_id, product: item.product },
            // Process update
            update: item,
            // Info ke MongoDB untuk membuat record baru jika data tidak ditemukan
            upsert: true,
          },
        };
      })
    );

    // (8) return respon ke client, dengan mengembalikan data yang berhasil masuk
    return res.json(cartItems);
  } catch (err) {
    // (1) Handle error yang berasal dari validation
    if (err && err.name == "ValidationError") {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }

    // (2) Handle error selain dari variable
    next(err);
  }
}

// Export function
module.exports = {
  index,
  update,
};
