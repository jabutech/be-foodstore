var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");

// Import middleware cek token
const { decodeToken } = require("./app/auth/middleware");

// Router
// Router products
const productRouter = require("./app/product/router");
// Router Categories
const categoryRouter = require("./app/category/router");
// Router Tags
const tagRouter = require("./app/tag/router");
// User router for auth
const authRouter = require("./app/auth/router");
// Router wilayah
const wilayahRouter = require("./app/wilayah/router");
// Router delivery address
const deliveryAddressRouter = require("./app/delivery-address/router");
// Router cart router
const cartRouter = require("./app/cart/router");
// Router Order
const orderRouter = require("./app/order/router");
// Router view invoice
const invoiceRouter = require("./app/invoice/router");

var app = express();

// Menghindari cors
app.use(cors());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Gunakan decodeToken
app.use(decodeToken());

// Declaration router
// User authRouter
app.use("/auth", authRouter);
// Use productRouter
app.use("/api", productRouter);
// Use categoryRouter
app.use("/api", categoryRouter);
// Use tagRouter
app.use("/api", tagRouter);
// Use wilayah router
app.use("/api", wilayahRouter);
// Use delivery address router
app.use("/api", deliveryAddressRouter);
// use cartRouter
app.use("/api", cartRouter);
// use orderRouter
app.use("/api", orderRouter);
// use InvoiceRouter
app.use("/api", invoiceRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
