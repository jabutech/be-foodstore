// Require mongoose
const mongoose = require("mongoose");
// Get module 'model' and 'Schema' from package 'mongoose'
const { model, Schema } = mongoose;

// Create Schema
const tagSchema = Schema({
  name: {
    type: String,
    minLength: [3, "Panjang nama tag minimal 3 karakter."],
    maxLength: [20, "Panjang nama tag maksimal 20 karakter."],
    required: [true, "Nama tag harus diisi."],
  },
});

// Create and export model
module.exports = model("Tag", tagSchema);
