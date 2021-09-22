// Import mongo
const mongoose = require("mongoose");

// Get module 'model' and 'Schema' from package 'mongoose';
const { model, Schema } = mongoose;

// Create Schema
const productSchema = Schema(
  {
    name: {
      type: String,
      minlength: [5, "Panjang nama makanan minimal 3 karakter"],
      required: [true, "Nama product harus diisi."],
    },

    description: {
      type: String,

      maxlength: [1000, "Panjang deskripsi maksimal 1000 karakter"],
    },

    price: {
      type: Number,
      default: 0,
    },

    image_url: String,

    // Relation one to one to model Category
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category id harus ada"],
    },

    // Relation one to many to model Tags
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: "Tag",
        required: [true, "Tags id harus ada"],
      },
    ],
  },
  { timestamps: true }
);

// Create model and export
module.exports = model("Product", productSchema);
