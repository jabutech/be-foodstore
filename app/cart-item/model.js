// use mongoose
const mongoose = require("mongoose");
// use modul 'model' dan 'Schema'
const { model, Schema } = mongoose;

// Create Schema cart-item
const cartItemSchema = Schema({
  name: {
    type: String,
    minlength: [5, "Panjang nama makanan minimal 50 karakter"],
    required: [true, "name must be filled"],
  },

  qty: {
    type: Number,
    required: [true, "qty harus diisi"],
    min: [1, "minimal qty adalah 1"],
  },

  price: {
    type: Number,
    default: 0,
  },
  image_url: String,
  //   Relation to user
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  //   Relation to product
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
  },
});

// Export
module.exports = model("CartItem", cartItemSchema);
