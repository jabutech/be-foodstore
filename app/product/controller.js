// Import model product
const config = require("../config");
const Product = require("./model");
// Import Model Category
const Category = require("../category/model");
// Import model Tags
const Tag = require("../tag/model");
// Import policyFor
const { policyFor } = require("../policy");

const fs = require("fs");
const path = require("path");

// Function index
async function index(req, res, next) {
  try {
    // Get query 'limit' dan skip from client untuk membuat pagination / menerima berapa data yang ingin ditampilkan oleh client
    // dan memberikan nilai default jika client tidak memberikan nilai pada query
    // 'q' adalah variable untuk memfilter data berdasarlan keyword
    // 'category' adalah variable untuk memfilter data berdasarkan category
    // 'tags' adalah variable dengan nilai array kosong untuk memfilter data berdasarkan tags
    let { limit = 10, skip = 0, q = "", category = "", tags = [] } = req.query;

    // Object kosong untuk menampung data filter
    let criteria = {};

    // Cek apakah variable 'q' memiliki nilai / dilakukan pencarian
    if (q.length) {
      // Jika ada masukkan ke variable 'criteria'
      criteria = {
        ...criteria,
        // Gunakan regex, dan variable '$option' untuk membuat uncasesensitive / atau tidak sensitif huruf besar dan kecil
        name: q,
      };
    }

    // Cek apakah variable 'category' memiliki nilai / dilakukan pencarioan
    if (category.length) {
      // Cari dulu nama kategori yang cocok yang dikirim dari client,
      // Untuk mendapatkan idnya
      category = await Category.findOne({
        name: {
          $regex: `${category}`,
          $options: "i",
        },
      });

      // Cek apakah ada
      if (category) {
        // Jika ada masukkan ke variable 'criteria'
        criteria = {
          ...criteria,
          // Ganti kategori nama dengan id
          category: category._id,
        };
      }
    }

    // Cek apakah variable 'tags' memiliki nilai / dilakukan pencarian
    if (tags.length) {
      // Jika ada
      // Cari dulu nama tags yang cocok yang dikirimkan dari client,
      // untuk mendapatkan idnya
      tags = await Tag.find({
        // Cari semua tags didalam array dengan operator '$in'
        name: {
          $in: tags,
        },
      });

      // Jika sudah dapat gabungkan ke didalam criteria
      criteria = {
        ...criteria,
        tags: {
          $in: tags.map((tag) => tag._id),
        },
      };
    }

    // Count total product for total data of paginate
    let count = await Product.find(criteria).countDocuments();

    // Get all data product with model Product with method chaining
    // Property 'criteria' digunakan untuk mencari data
    let products = await Product.find(criteria)
      // Change type data query from string to integer with parseInt
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate("category")
      .populate("tags");

    // Return response
    return res.json({
      data: products,
      count,
    });
  } catch (err) {
    next(err);
  }
}

// Function store data product
async function store(req, res, next) {
  try {
    // Cek policy
    let policy = policyFor(req.user);

    // Cek apakah user pada variable policy tidak bisa membuat product
    if (!policy.can("create", "Product")) {
      return res.json({
        error: 1,
        message: `Anda tidak memiliki akses untuk membuat produk.`,
      });
    }

    // Tangkap data yang dikirim oleh client
    let payload = req.body;

    // Membuat relasi one to one dengan category
    // Cek apakah ada request insert category
    if (payload.category) {
      // Jika ada
      // Cari kategori di collection category
      let category = await Category.findOne({
        // Gunakan regex untuk mencari dengan option 'i' artinya incasesensitive) tidak sensistif,
        // contoh "minuman" sama aja dengan "Minuman"
        name: { $regex: payload.category, $options: "i" },
      });

      // Check apakah category yang dicari ditemukan
      if (category) {
        // Jika ditemukan,
        // revisi ini payload dengan masukkan id kategori ke variable payload
        payload = { ...payload, category: category._id };
      } else {
        // Jika tidak ditemukan, hapus category dari payload
        delete payload.category;
      }
    }

    // Membuat relasi one to Many dengan tags
    // Cek apakah
    // payload.tags ada,
    // dan cek apakah payload.tags.length bukan array kosong
    if (payload.tags && payload.tags.length) {
      // Jika pas,
      // Cari tags yang sesuai di collection tags
      let tags = await Tag
        // function "find" mencari lebih dari saty
        .find({
          name:
            // Operator $in digunakan untuk mencari data yang cocok didadlam collection
            { $in: payload.tags },
        });

      // Cek apakah tag yang dicari ditemukan,
      // Karena mengembalikan array maka itu menggunakan length untuk pengecekan
      if (tags.length) {
        // Jika ditemukan
        // revisi ini payload dengan masukkan id tags ke variable payload
        payload = {
          ...payload,
          // loop semua tags
          tags: tags.map((tag) => tag._id),
        };
      }
    }

    // Check apakah ada request file upload
    if (req.file) {
      // Jika iya
      // Ambil lokasi sementara file yang diupload
      let tmp_path = req.file.path;

      // Ambil extensi file yang diupload
      let originalExt =
        req.file.originalname.split(".")[
          req.file.originalname.split(".").length - 1
        ];

      // Buat nama file baru
      // Note: 'req.file.filename' adalah nama baru yang digenerate dari package 'multer' pada file router
      let filename = req.file.filename + "." + originalExt;

      // Set tempat penyimpanan file
      let target_path = path.resolve(
        config.rootPath,
        `public/upload/product/${filename}`
      );

      // Baca file yang masih dilokasi sementara
      const src = fs.createReadStream(tmp_path);
      // Pindahkan file ke folder upload
      const dest = fs.createWriteStream(target_path);
      // Mulai pindahkan proses file dari 'src' ke 'dest'
      src.pipe(dest);

      // Deteksi apakah proses perpindahan sudah selesai dan berhasil
      src.on("end", async () => {
        // Jika sudah
        try {
          // Create new product data untuk disimpan
          let product = new Product({ ...payload, image_url: filename });
          // Simpan data ke mongo
          await product.save();
          // Kirim respon data ke client
          return res.json(product);
        } catch (err) {
          // Jika error hapus file yang sudah terupload pada direktori
          fs.unlinkSync(target_path);

          // cek apakah error dari validasi mongodb
          if (err && err.name === "ValidatorError") {
            return res.json({
              // Set type error (oposional)
              error: 1,
              // Send message error from validation
              message: err.message,
              // Show display detail error
              fields: err.errors,
            });
          }
          // Jika bukan dari validasi kirim error lainnya
          next(err);
        }
      });

      // Deteksi jika proses perpindahan gagal
      src.on("error", async () => {
        // Kirim errornya
        next(err);
      });
    } else {
      // Jika tidak

      // Create new product data with model product
      let product = new Product(payload);

      // Save product to db mongo
      await product.save();

      // Return product for response to client
      return res.json(product);
    }
  } catch (err) {
    // Check tipe error apakah berasal dari error validasi
    if (err && err.name == "ValidationError") {
      // Jika iya kirim error ke client
      return res.json({
        // Set type error (oposional)
        error: 1,
        // Send message error from validation
        message: err.message,
        // Show display detail error
        fields: err.errors,
      });
    }

    //  Jika bukan error daro validasi kirim error lainnya

    next(err);
  }
}

// Function update data product
async function update(req, res, next) {
  try {
    // Cek policy
    let policy = policyFor(req.user);

    // Cek apakah user pada variable policy tidak bisa membuat product
    if (!policy.can("update", "Product")) {
      return res.json({
        error: 1,
        message: `Anda tidak memiliki akses untuk  mengupdate produk.`,
      });
    }

    // Tangkap data (payload) yang dikirim dari client
    let payload = req.body;

    // Membuat relasi one to one dengan categori
    // Cek apakah ada request insert category
    if (payload.category) {
      // Jika ada
      // Cari kategori di model kategori
      let category = await Category.findOne({
        // Gunakan regex untuk mencari dengan option 'i' artinya incasesensitive) tidak sensistif,
        // contoh "minuman" sama aja dengan "Minuman"
        name: { $regex: payload.category, $options: "i" },
      });

      // Membuat relasi one to Many dengan tags
      // Cek apakah
      // payload.tags ada,
      // dan cek apakah payload.tags.length bukan array kosong
      if (payload.tags && payload.tags.length) {
        // Jika pas,
        // Cari tags yang sesuai di collection tags
        let tags = await Tag
          // function "find" mencari lebih dari saty
          .find({
            name:
              // Operator $in digunakan untuk mencari data yang cocok didadlam collection
              { $in: payload.tags },
          });

        // Cek apakah tag yang dicari ditemukan,
        // Karena mengembalikan array maka itu menggunakan length untuk pengecekan
        if (tags.length) {
          // Jika ditemukan
          // revisi ini payload dengan masukkan id tags ke variable payload
          payload = {
            ...payload,
            // loop semua tags
            tags: tags.map((tag) => tag._id),
          };
        }
      }

      // Check apakah categori yang dicari ditemukan
      if (category) {
        // Jika ditemukan, masukkan id kategori ke variable payload
        payload = { ...payload, category: category._id };
      } else {
        // Jika tidak ditemukan, hapus category dari payload
        delete payload.category;
      }
    }

    // Check apakah ada request file upload
    if (req.file) {
      // Jika iya
      // Ambil lokasi sementara file yang diupload
      let tmp_path = req.file.path;

      // Ambil extensi file yang diupload
      let originalExt =
        req.file.originalname.split(".")[
          req.file.originalname.split(".").length - 1
        ];

      // Buat nama file baru
      // Note: 'req.file.filename' adalah nama baru yang digenerate dari package 'multer' pada file router
      let filename = req.file.filename + "." + originalExt;

      // Set tempat penyimpanan file
      let target_path = path.resolve(
        config.rootPath,
        `public/upload/product/${filename}`
      );

      // Baca file yang masih dilokasi sementara
      const src = fs.createReadStream(tmp_path);
      // Pindahkan file ke folder upload
      const dest = fs.createWriteStream(target_path);
      // Mulai pindahkan proses file dari 'src' ke 'dest'
      src.pipe(dest);

      // Deteksi apakah proses perpindahan sudah selesai dan berhasil
      src.on("end", async () => {
        // Jika sudah
        try {
          // Cari product yang ingin diupdate
          let product = await Product.findOne({ _id: req.params.id });

          // Ambil data lengkap path penyimpanan gambar berdasarkan data 'product.image_url'
          let currentImage = `${config.rootPath}/public/upload/product/${product.image_url}`;

          // Cek apakah 'file' benar ada di file system
          if (fs.existsSync(currentImage)) {
            // Jika ada hapus file lama
            fs.unlinkSync(currentImage);
          }

          // Update data product terbaru dengan gambar yang baru juga
          product = await Product
            // Cari dan update
            .findOneAndUpdate(
              // Get id product yang ingin di update
              { _id: req.params.id },
              // Ambil data terbaru yang ingin di update
              { ...payload, image_url: filename },
              {
                // 'new' adalah instruksi untuk MongoDB agar mengembalikan data product yang paling baru
                new: true,
                // Jalankan validator, karena jika proses update validator tidak otomatis berjalan
                runValidators: true,
              }
            );

          // Simpan data ke mongo
          await product.save();
          // Kirim respon data ke client
          return res.json(product);
        } catch (err) {
          // Jika error hapus file yang sudah terupload pada direktori
          fs.unlinkSync(target_path);

          // cek apakah error dari validasi mongodb
          if (err && err.name === "ValidatorError") {
            return res.json({
              // Set type error (oposional)
              error: 1,
              // Send message error from validation
              message: err.message,
              // Show display detail error
              fields: err.errors,
            });
          }
          // Jika bukan dari validasi kirim error lainnya
          next(err);
        }
      });

      // Deteksi jika proses perpindahan gagal
      src.on("error", async () => {
        // Kirim errornya
        next(err);
      });
    } else {
      // Jika tidak

      // Cari data product dan langsung update
      let product = await Product.findOneAndUpdate(
        // Get id product yang ingin di update
        { _id: req.params.id },
        // Ambil data terbaru yang ingin diupdaye
        payload,
        {
          // 'new' adalah instruksi untuk MongoDB agar mengembalikan data product yang paling baru
          new: true,
          // Jalankan validator, karena jika proses update validator tidak otomatis berjalan
          runValidators: true,
        }
      );

      // Save product to db mongo
      await product.save();

      // Return product for response to client
      return res.json(product);
    }
  } catch (err) {
    // Check tipe error apakah berasal dari error validasi
    if (err && err.name == "ValidationError") {
      // Jika iya kirim error ke client
      return res.json({
        // Set type error (oposional)
        error: 1,
        // Send message error from validation
        message: err.message,
        // Show display detail error
        fields: err.errors,
      });
    }

    //  Jika bukan error daro validasi kirim error lainnya

    next(err);
  }
}

// Function for delete data
async function destroy(req, res, next) {
  try {
    // Cek policy
    let policy = policyFor(req.user);

    // Cek apakah user pada variable policy tidak bisa membuat product
    if (!policy.can("delete", "Product")) {
      return res.json({
        error: 1,
        message: `Anda tidak memiliki akses untuk menghapus produk.`,
      });
    }
    // Cari data yang sesuai
    let product = await Product.findOneAndDelete({ _id: req.params.id });

    // Cari gambar
    let currentImage = `${config.rootPath}/public/upload/product/${product.image_url}`;

    // Check apakah ada gambar
    if (fs.existsSync(currentImage)) {
      // Jika ada hapus
      fs.unlinkSync(currentImage);
    }

    // Kembalikan data product yang dihapus
    return res.json(product);
  } catch (err) {
    next(err);
  }
}

// Export function store
module.exports = { index, store, update, destroy };
