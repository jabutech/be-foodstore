// Require mongoose
const mongoose = require("mongoose");
// Get module 'model' and 'Schema' from package 'mongoose'
const { model, Schema } = mongoose;

// Create schema
const categorySchema = Schema(
  {
    // Attribute and validation for name
    name: {
      type: String,
      minLength: [3, "Panjang nama kategori minimal 3 karakter."],
      maxLength: [20, "Panjang nama kategori maksimal 20 karakter."],
      required: [true, "Nama kategori harus diisi."],
    },
  },
  //  Create timestamps
  { timestamps: true }
);

// Create and export model
module.exports = model("Category", categorySchema);
