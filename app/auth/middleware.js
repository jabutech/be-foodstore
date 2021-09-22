// Import get token
const { getToken } = require("./utils/get-token");
// Import jwt
const jwt = require("jsonwebtoken");
// Import config
const config = require("../config");
// Import model user
const User = require("../user/model");

// Merubah token menjadi object user kembali (decode Token)
function decodeToken() {
  return async function (req, res, next) {
    try {
      // (1) Ambil token dari file get-token yang mengirimkan bearer token
      let token = getToken(req);

      // (2) Jika ternyata token request tidak memiliki token, arahkan ke middleware selanjutnya
      if (!token) return next();

      // (3) Jika token ada, lakukan proses 'decode' dengan modul jwt.verify
      // Dan simpan didalam 'req.user' bukan variable user
      req.user = jwt.verify(token, config.secretKey);

      // (4) Cek token apakah belum expired atau masih ada di collection User
      let user = await User.findOne({
        token: {
          $in: [token],
        },
      });

      // (5) Jika user tidak ditemukan kirim respon ke client
      if (!user) {
        return res.json({
          error: 1,
          message: "Token expired",
        });
      }
    } catch (err) {
      // (1) tangani error yang terkait JsonWebTokenError
      if (err && err.name === "JsonWebTokenError") {
        return res.json({
          error: 1,
          message: err.message,
        });
      }
      // (2) tangani error lainnya
      next(err);
    }

    // Return next
    return next();
  };
}

// Export function
module.exports = {
  decodeToken,
};
