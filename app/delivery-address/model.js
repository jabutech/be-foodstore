// Import package moongoose
const moongoose = require("mongoose");
// Import modul 'model' dan 'Schema' dari mongoose
const { model, Schema } = moongoose;

// Create Schema for delivery address document
const deliveryAddressSchema = Schema(
  {
    nama: {
      type: String,
      required: [true, "Nama alamat harus diisi"],
      maxLength: [255, "Panjang maksimal nama alamat adalah 255 karakter"],
    },

    kelurahan: {
      type: String,
      required: [true, "Kelurahan harus diisi"],
      maxlength: [255, "Panjang maksimal kelurahan adalah 255 karakter"],
    },
    kecamatan: {
      type: String,
      required: [true, "Kecamatan harus diisi"],
      maxlength: [255, "Panjang maksimal kecamatan adalah 255"],
    },

    kabupaten: {
      type: String,
      required: [true, "Kabupaten harus diisi"],
      maxlength: [255, "Panjang maksimal kabupaten adalah 255 karakter"],
    },
    provinsi: {
      type: String,
      required: [true, "Provinsi harus diisi"],
      maxlength: [255, "Panjang maksimal provinsi adalah 255 karakter"],
    },
    detail: {
      type: String,
      required: [true, "Detail alamat harus diisi"],
      maxlength: [1000, "Panjang maksimal detail alamat adalah 1000 karakter"],
    },

    // relation to user
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Create model dan export
module.exports = model("DeliveryAddress", deliveryAddressSchema);
