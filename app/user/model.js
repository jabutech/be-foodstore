// Require mongoose
const mongoose = require("mongoose");
// Gunakan modul 'model' dan 'Schema'
const { model, Schema } = mongoose;
// Modul untuk hashing password 'bcrypt'
const bcrypt = require("bcrypt");
// 'mongoose-sequence' untuk membuat autoincrement / nomer urut
const AutoIncrement = require("mongoose-sequence")(mongoose);

// Init const HAS_ROUND with default value = 10
const HAS_ROUND = 10;

let userSchema = Schema(
  {
    full_name: {
      type: String,
      required: [true, "Nama harus diisi"],
      maxlength: [255, "Panjang nama harus antara 3 - 255 karakter"],
      minlength: [3, "Panjang nama harus antara 3 - 255 karakter"],
    },

    customer_id: {
      type: Number,
    },
    email: {
      type: String,
      required: [true, "Email harus diisi"],
      maxlength: [255, "Panjang email maksimal 255 karakter"],
    },

    password: {
      type: String,
      required: [true, "Password harus diisi"],
      maxlength: [255, "Panjang password maksimal 255 karakter"],
    },

    role: {
      type: String,
      enum: ["user", "admin", "guest"],
      default: "user",
    },
    token: [String],
  },
  { timestamps: true }
);

// Membuat validasi untuk email
// ini dilakukan secara manual, karena mongoose belum ada verivikasi untuk email secara otomatis
userSchema
  // Mengambil property 'email'
  .path("email")
  // Membuat validasi untuk email
  //   Parameter value digunakan untuk menangkap nilai email
  .validate(
    function (value) {
      //   Membuat pengecekan format email dengan regex
      // (1) email regular expression
      const EMAIL_RE = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
      // (2) test email, hasilnya adalah `true` atau `false`
      // jika ternyata `true` maka validasi berhasil
      // jika ternyata `false` maka validasi gagal
      return EMAIL_RE.test(value);
    },
    // Berikan pesan error ketika format email tidak sesuai
    (attr) => `${attr.value} harus merupakan email yang valid!`
  );

// Membuat validasi pengecekan apakah user sudah terdaftar
// ini dilakukan secara manual, karena mongoose belum ada verivikasi untuk email secara otomatis
userSchema
  // Mengambil property 'email'
  .path("email")
  // Membuat validasi untuk email
  //   Parameter value digunakan untuk menangkap nilai email
  .validate(
    async function (value) {
      try {
        // (1) lakukan pencarian ke _collection_ User berdasarkan `email`
        const count = await this.model("User").count({ email: value });
        // (2) kode ini mengindikasikan bahwa jika user ditemukan akan
        // mengembalikan `false` jika tidak ditemukan mengembalikan `true`
        // jika `false` maka validasi gagal
        // jika `true` maka validasi berhasil
        return !count;
      } catch (err) {
        throw err;
      }
    },
    // Berikan pesan error ketika format email tidak sesuai
    (attr) => `${attr.value} sudah terdaftar!`
  );

//   Hashing password
userSchema.pre("save", function (next) {
  // Tangkap password dengan 'this' dan lakukan hashing dengan hash_round = 10 diatas
  this.password = bcrypt.hashSync(this.password, HAS_ROUND);
  // Lanjutkan proses
  next();
});

// Membuat auto increment
userSchema.plugin(AutoIncrement, { inc_field: "customer_id" });

// Export model
module.exports = model("User", userSchema);
