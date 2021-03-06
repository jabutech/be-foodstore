// use mongoose
const mongoose = require("mongoose");
const { model, Schema } = mongoose;
// Import package `mongoose-sequence` package pendukung untuk mongoose untuk membuat auto increment
const AutoIncrement = require("mongoose-sequence")(mongoose);
// Import model invoice
const Invoice = require("../invoice/model");

// Create schema order
const orderSchema = Schema(
  {
    status: {
      type: String,
      enum: ["waiting_payment", "processing", "in_delivery", "delivered"],
      default: "waiting_payment",
    },

    delivery_fee: {
      type: Number,
      default: 0,
    },

    delivery_address: {
      provinsi: {
        type: String,
        required: [true, "Provinsi harus diisi."],
      },

      kabupaten: {
        type: String,
        required: [true, "Kabupaten harus diisi."],
      },

      kecamatan: {
        type: String,
        required: [true, "Kecamatan harus diisi"],
      },

      kelurahan: {
        type: String,
        required: [true, "Kelurahan haris diisi."],
      },

      detail: {
        type: String,
      },
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    order_items: [
      {
        type: Schema.Types.ObjectId,
        ref: "OrderedItem",
      },
    ],
  },
  { timestamps: true }
);

// Membuat auto increment / nomer berurut meninggat
orderSchema.plugin(AutoIncrement, { inc_field: "order_number" });

// 'Field virtual' untuk menghitung total item
orderSchema.virtual("items_count").get(function () {
  return this.order_items.reduce((total, item) => {
    return total + parseInt(item.qty);
  }, 0);
});

// Menggunakan 'mongoose hook' untuk membuat invoice ketika order selesai dibuat
orderSchema.post("save", async function () {
  // (1) Buat total price dengan mengakses property didalam schema menggunakan keyword 'this'
  let sub_total = this.order_items.reduce(
    (sum, item) => (sum += item.price * item.qty),
    0
  );

  // (2) Buat object baru untuk Invoice
  let invoice = new Invoice({
    // Get data user dari schema
    user: this.user,
    // Get data order id dari schema
    order: this._id,
    // Input sub total
    sub_total: sub_total,
    // Get data delivery fee dari schema, dan convert ke integer
    delivery_fee: parseInt(this.delivery_fee),
    // Get total Price ditambah delivery fee
    total: parseInt(sub_total + this.delivery_fee),
    // get address
    delivery_address: this.delivery_address,
  });

  // (3) Simpan ke MongoDb
  await invoice.save();
});

// Create dan export model
module.exports = model("Order", orderSchema);
