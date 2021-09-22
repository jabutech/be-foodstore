// Use package csv to json untuk membaca data dari file xls
const csv = require("csvtojson");
// Gunakan module path untuk mengakses file
const path = require("path");

// Function get data provinsi
async function getProvisi(req, res, next) {
  // Get path provinsi.csv
  const db_provinsi = path.resolve(__dirname, "./data/provinces.csv");

  try {
    // get data dari path db_provinsi menggunakan package csv
    const data = await csv().fromFile(db_provinsi);
    // kembalikan respon json
    return res.json(data);
  } catch (err) {
    return res.json({
      error: 1,
      message: "Tidak bisa mengambil data provinsi.",
    });
  }
}

// Function get data kabupaten
async function getKabupaten(req, res, next) {
  try {
    // Get path regencies.csv
    const db_kabupaten = path.resolve(__dirname, "./data/regencies.csv");

    // Get kode provinsi dari request client
    let { kode_provinsi_from_client } = req.query;

    // Get data kabupaten dari csv menggunakan packahe csv
    const data = await csv().fromFile(db_kabupaten);

    // Cek jika kode provinsi tidak ditemukan return seluruh data
    if (!kode_provinsi_from_client) return res.json(data);

    // Jika kode_provinsi ada, filter data kabupaten berdasarkan kode provinsi yang dikirim dari clien
    return res.json(
      data.filter(
        (kabupaten) => kabupaten.kode_provinsi === kode_provinsi_from_client
      )
    );
  } catch (e) {
    //   Kirim error
    return res.json({
      error: 1,
      message: "Tidak bisa mengambil data kabupaten, hubungi administrator",
    });
  }
}

// Function get data kecamatan
async function getKecamatan(req, res, next) {
  try {
    // Get path districts.csv
    const db_kecamatan = path.resolve(__dirname, "./data/districts.csv");

    // Get kode kabupaten from request client
    let { kode_kabupaten_from_client } = req.query;

    // Get data from path csv use package csv
    const data = await csv().fromFile(db_kecamatan);

    // Jika kode_kabupaten_from_client tidak ada kirim semua data kecamatan
    if (!kode_kabupaten_from_client) return res.json(data);

    // Jika kode kode_kabupaten_from_client lakukan filter bedasarkan kode_kabupaten yang sama dengan kode_kabupaten_from_client dari client
    return res.json(
      data.filter(
        (kecamatan) => kecamatan.kode_kabupaten === kode_kabupaten_from_client
      )
    );
  } catch (e) {
    return res.json({
      error: 1,
      message: "Tidak bisa mengambil data kecamatan, hubungi administrator",
    });
  }
}

// Function get desa
async function getDesa(req, res, next) {
  try {
    //   Get path villages.csv
    const db_desa = path.resolve(__dirname, "./data/villages.csv");

    // Get kode kecamatan from rwquest client
    let { kode_kecamatan_from_client } = req.query;

    // Get data from path csv use package csv
    const data = await csv().fromFile(db_desa);
    // Jika kode_kecamatan_from_client tidak ada kirim semua data desa
    if (!kode_kecamatan_from_client) return res.json(data);

    // Jika kode kode_kecamatan_from_client lakukan filter bedasarkan kode_kecamatan yang sama dengan kode_kabupaten_from_client dari client
    return res.json(
      data.filter((desa) => desa.kode_kecamatan === kode_kecamatan_from_client)
    );
  } catch (err) {
    return res.json({
      error: 1,
      message: "Tidak bisa mengambil data desa, hubungi administrator",
    });
  }
}

// Export function provinsi
module.exports = {
  getProvisi,
  getKabupaten,
  getKecamatan,
  getDesa,
};
