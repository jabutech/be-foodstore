// Require model user
const User = require("../user/model");
const bcrypt = require("bcrypt");
const passport = require("passport");
const jwt = require("jsonwebtoken");
// Import get -token
const { getToken } = require("../auth/utils/get-token");

// Import config
const config = require("../config");

// Function register user
async function register(req, res, next) {
  try {
    // Tangkap request dari client
    const payload = req.body;

    // Buat object baru
    let user = new User(payload);

    // Simpan user
    await user.save();

    // return respon
    return res.json(user);
  } catch (err) {
    // Cek error dari validation
    if (err && err.name === "ValiadtionError") {
      return res.json({
        error: 1,
        message: err.message,
        field: err.errors,
      });
    }

    // Return etc errors
    next(err);
  }
}

// Function for handle login
async function localStrategy(email, password, done) {
  try {
    // (1) Cari user dengan menggunakan model user
    let user = await User
      // Cari berdasarkan email
      .findOne({ email })
      // Tampilkan data user selain field yang dibawah ini
      .select("-__v -createdAt -updatedAt -cart_items -token");

    // (2) Cek jika user tidak ada panggil argumen done, dan kirim informasi 'invalid username or password'
    if (!user) return done;

    // (3) Lanjut jika user ditemukan, cek password apakah sama didatabase dengan yang dikirim dari client ?
    // 'compareSync' untuk mencompare hashing dengan data yang dikirim dari client
    if (bcrypt.compareSync(password, user.password)) {
      // Jika sesuai

      //(1) Keluarkan password dari variable user
      // Karena saat mengirim data dengan JWT pada bagian payload bisa di decrypt kembali ke json
      ({ password, ...userWithoutPassword } = user.toJSON());

      // (2) Kembalikan data user ke client
      return done(null, userWithoutPassword);
    }
  } catch (err) {
    done(err, null);
  }
  // Jalankan done
  done();
}

// Function untuk login
async function login(req, res, next) {
  passport.authenticate("local", async function (err, user) {
    // (1) Jika error return errornya ke client
    if (err) return next(err);

    // (2) Cek apakah return data user dari function 'localStrategy' diatas
    // Jika tidak kembalikan respons info ke client
    if (!user)
      return res.json({
        error: 1,
        message: "email or password incorrect",
      });

    // (3) Jika function 'localStrategy' diatas berhasil mengembalikan data user
    // (1) Buat JSON Web Token
    let signed = jwt.sign(
      // Ambil yang dikirim dari 'localStrategy'
      user,
      // Input secret key dari .env
      config.secretKey
    );

    // (2) Update dan Simpan token ke user terkait
    await User.findOneAndUpdate(
      // (1) Cari user berdasarkan id user terkait
      { _id: user._id },
      {
        // (2) Masukkan token ke document user
        $push: { token: signed },
      },
      {
        // (3) Instruksi ke MongoDb untuk mengembalikan data terbaru
        new: true,
      }
    );

    // (3) Kembalikan respon ke client
    return res.json({
      // Tampilkan pesan
      message: "Logged in successfully",
      // Kembalikan data user yang berhasil login
      user: user,
      // kembalikan tokennya
      token: signed,
    });
  })(req, res, next);
}

// Function logout
async function logout(req, res, next) {
  // (1) Dapatkan token dari request
  let token = getToken(req);

  // (2) hapus 'token' dari Collection 'users'
  // Dengan cara, cari user
  let user = await User.findOneAndUpdate(
    {
      //  Berdasarkan token yang diterima dari request
      token: {
        $in: [token],
      },
    },
    // Removing token with operator $pull
    {
      $pull: { token },
    },
    {
      useFindAndModify: false,
    }
  );

  // (3) Cek jika user dan token tidak ada
  // --- cek user atau token ---//
  if (!user || !token) {
    // Kembalikan response ke client
    return res.json({
      error: 1,
      message: "No user found",
    });
  }

  // (4) Jika token berhasil di hapus. kirim respon berhasil
  return res.json({
    error: 0,
    message: "Logout berhasil.",
  });
}

// Function me
function me(req, res, next) {
  // Cek apakah req.user memiliki nilai
  if (!req.user) {
    return res.json({
      error: 1,
      message: `You're not login or token expired`,
    });
  }

  // Jika ada kirim data user
  return res.json(req.user);
}

// Export function
module.exports = {
  register,
  localStrategy,
  login,
  logout,
  me,
};
