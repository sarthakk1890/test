const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const path = require("path");
const cloudinary = require("cloudinary");
const fs = require("fs");
const cors = require("cors");
const multer = require("multer");
var busboy = require("connect-busboy");
const Inventory = require("./models/inventoryModel");
// const passport = require('passport');
// const passportLocal = require('./config/passport-local-strategy');
// const fs=require("fs");

const XLSX = require("xlsx");
const { isAuthenticatedUser, isSubscribed } = require("./middleware/auth");

const errorMiddleware = require("./middleware/error");
const logFile = fs.createWriteStream("./logfile.log", { flags: "w" }); //use {flags: 'w'} to open in write mode
app.use(cookieParser());
//multerconnection
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

app.use(cookieParser());
const upload = multer({ storage: storage });

// app.use(passport.initialize());
// app.use(passport.session());
const User = require("./models/userModel");

app.get("/privacy-policies", async (req, res) => {
  res.render("privacypolicies");
});

app.post(
  "/api/v1/bulkupload",
  isAuthenticatedUser,
  upload.single("file"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file.path;
    const userDetail = req.user._id;

    // console.log(userDetail);
    const seller = await User.findById(userDetail);

    // Convert the data according to their index number
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert into JSON format
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Remove the header row
    const headers = jsonData.shift();

    try {
      for (const row of jsonData) {
        const itemData = {};
        headers.forEach((header, index) => {
          const value = row[index] !== "" ? row[index] : undefined;
          itemData[header] = value;
        });

        itemData.user = userDetail;

        // Check if barcode is unique to that particular user
        if (itemData.barcode) {
          const existingInventory = await Inventory.findOne({
            barcode: itemData.barcode,
            user: userDetail,
          });
          if (existingInventory) {
            console.error("Product with this barcode already exists");
            continue;
          }
        }

        // Create and save the inventory item
        // const inventory = new Inventory(itemData);
        const inventory = new Inventory({
          ...itemData,
          sellerName: seller.businessName,
        });

        await inventory.save();
        console.log("Item saved:", inventory);
      }

      fs.unlinkSync(filePath);

      // Success message
      res.json({ message: "File uploaded successfully" });
    } catch (error) {
      console.error("Failed to save items:", error);
      res.status(500).json({ message: "Failed to save items" });
    }
  }
);

// Config
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({ path: "backend/config/config.env" });
}
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(express.json());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(bodyParser.json());
app.use(busboy());
app.use(cors());

// Set EJS as templating engine
app.set("view engine", "ejs");

/*
app.post('/api/v1/bulkupload',isAuthenticatedUser, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const filePath = req.file.path;
  const userDetail = req.user._id;

  // Convert the data according to their index number
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convert into JSON format
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  // Remove the header row
  const headers = jsonData.shift();

  try {
    for (const row of jsonData) {
      const itemData = {};
      headers.forEach((header, index) => {
        const value = row[index] !== '' ? row[index] : undefined;
        itemData[header] = value;
      });

      itemData.user = userDetail;

      // Check if barcode is unique to that particular user
      if (itemData.barcode) {
        const existingInventory = await Inventory.findOne({
          barcode: itemData.barcode,
          user: userDetail,
        });
        if (existingInventory) {
          console.error('Product with this barcode already exists');
          continue;
        }
      }

      // Create and save the inventory item
      const inventory = new Inventory(itemData);
      await inventory.save();
      console.log('Item saved:', inventory);
    }

    fs.unlinkSync(filePath);

    // Success message
    res.json({ message: 'File uploaded successfully' });
  } catch (error) {
    console.error('Failed to save items:', error);
    res.status(500).json({ message: 'Failed to save items' });
  }
});

*/
// Route Imports
const product = require("./routes/inventoryRoute");
const user = require("./routes/userRoute");
const admin = require("./routes/adminRoute");
const party = require("./routes/partyRoute");
const income = require("./routes/incomeRoute");
const purchase = require("./routes/purchaseRoute");
const sales = require("./routes/salesRoute");
const expense = require("./routes/expenseRoute");
const report = require("./routes/reportRoute");
const table = require("./routes/tableRoute");
const invoice = require("./routes/invoice")

const consumer = require("./routes/consumerRoute");

const payment = require("./routes/paymentRoutes");
const subscribedUsersModel = require("./models/subscribedUsersModel");
const agent = require("./routes/agentRoutes");
const bulk = require("./routes/bulkUploads");
const getShopRating = require("./routes/getShopRatingRoute");
const forceUpdate = require("./routes/forceUpdateRoute");

const estimate = require("./routes/estimateRoute");

const corsConfig = {
  origin: "http://localhost:5500",
  credentials: true,
};
app.use(cors(corsConfig));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", req.header("origin"));
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Content-Length, X-Requested-With"
  );
  next();
});
app.get("/privacy-policy", (req, res) => {
  res.sendFile(path.join(__dirname, "templates", "privacy-policy.html"));
});
app.get("/terms-and-condition", (req, res) => {
  res.sendFile(path.join(__dirname, "templates", "terms_and_conditions.html"));
});
// this is webhook for razorpay.
app.post("/verification", (req, res) => {
  console.log(req.body);
  const secret = "8432451555";
  const crypto = require("crypto");

  const shasum = crypto.createHmac("sha256", secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");
  if (digest === req.headers["x-razorpay-signature"]) {
    console.log("request is legit");
    const email1 = req.body.payload.payment.entity.email;
    const phoneNumber1 = req.body.payload.payment.entity.contact;
    const amount1 = Number(req.body.payload.payment.entity.amount) / 100;
    // console.log("email1", email1);
    // console.log("phoneNumber1", phoneNumber1);
    // console.log("amount1", amount1);
    // expireAt: new Date(Date.now() + 2419200000),
    const trimPhone = Number(phoneNumber1.substring(3));
    subscribedUsersModel.create({
      email: email1,
      phoneNumber: trimPhone,
      expireAt: new Date(Date.now() + 2419200000),
    });
    res.json({
      status: "ok",
    });
    // require('fs').writeFileSync('payment1.json', JSON.stringify(req.body, null, 4))
  } else {
    res.json({
      status: "error",
    });
  }
});

app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", admin);
app.use("/api/v1", party);
app.use("/api/v1", income);
app.use("/api/v1", sales);
app.use("/api/v1", purchase);
app.use("/api/v1", expense);
app.use("/api/v1", report);
app.use("/api/v1/agent", agent);
app.use("/api/v1/consumer", consumer);
app.use("/api/v1/payment", payment);
app.use("/api/v1", bulk);
app.use("/api/v1", table);
app.use("/api/v1", getShopRating);
app.use("/api/v1", forceUpdate);
app.use("/api/v1",invoice);
app.use("/api/v1", estimate);

app.use(express.static(path.join(__dirname, "build")));

app.get("*", (req, res) => {
  // res.send("connected");
  res.render("index.ejs");
});

// Middleware for Errors
app.use(errorMiddleware);
// const forceUpdate = require("./routes/forceUpdateRoute");



module.exports = app;
