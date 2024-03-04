const Inventory = require("../models/inventoryModel");
const XLSX = require("xlsx");
const path = require("path");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const lodash = require("lodash");
const upload = require("../services/upload");
const ApiFeatures = require("../utils/apiFeatures");
const { uploadImage } = require("../services/upload");
const User = require("../models/userModel");
const processModel = require("../models/processModel");

// Find Inventory by Barcode
exports.findInventoryByBarcode = catchAsyncErrors(async (req, res, next) => {
  const barcode = req.params.code;
  const user = req.user._id;
  const inventory = await Inventory.findOne({ barCode: barcode, user });
  res.status(200).json({
    success: true,
    inventory,
  });
});

// Create Inventory
exports.createInventory = catchAsyncErrors(async (req, res, next) => {
  const { barCode, quantity } = req.body;

  const userDetail = req.user._id;

  // Check if quantity is undefined
  if (quantity === undefined || quantity === null || quantity === "") {
    console.log("Undefined quantity, setting it to 99999");
    req.body.quantity = 99999;
  }

  // Check if quantity exceeds 99999
  if (quantity > 99999) {
    return res.status(400).json({
      success: false,
      msg: "Quantity cannot be 99999 or more",
    });
  }

  const seller = await User.findById(userDetail);
  let discount = 0;
  if (seller.discount || seller.discount >= 0) {
    discount = seller.discount;
  }

  if (
    req.body.quantity == undefined ||
    req.body.quantity === null ||
    req.body.quantity == ""
  ) {
    console.log("undefined qty");
    req.body.quantity = 99999;
  }

  req.body.user = userDetail;

  if (barCode !== undefined && barCode !== "" && barCode !== null) {
    const existingInventory = await Inventory.findOne({
      barCode: barCode,
      user: req.user._id,
    });

    if (existingInventory) {
      return res.status(400).json({
        success: false,
        msg: "Product with this barcode already exists",
      });
    }
  }

  const inventory = await Inventory.create({
    ...req.body,
    sellerName: seller.businessName,
    discount
  });

  res.status(201).json({
    success: true,
    inventory
  });
});

//Uploading Image
exports.addInventoryImage = catchAsyncErrors(async (req, res, next) => {
  const { inventoryId } = req.body;
  if (!req.files || !req.files.image) {
    return res.status(400).json({
      success: false,
      msg: "No image found",
    });
  }

  if (req.files && req.files.image) {
    const result = await uploadImage(req.files.image);
    req.body.image = result.url;
  }
  else {
    return res.status(400).json({
      success: false,
      msg: "No image found",
    });
  }

  const updatedInventory = await Inventory.findByIdAndUpdate(inventoryId, { image: req.body.image }, { new: true, runValidators: true });

  if (!updatedInventory) {
    return res.status(400).json({
      success: false,
      msg: "Product with this ID not found",
    });
  }

  res.status(201).json({
    success: true,
    updatedInventory
  });
})

// Get All Inventory count and search
exports.getAllInventoriesAndSearch1 = catchAsyncErrors(async (req, res, next) => {
  console.log('rrr');
  const { keyword } = req.query;

  const findInventories = await Inventory.find({ ...keyword });

  console.log(findInventories);
});

exports.getAllInventoriesAndSearch = catchAsyncErrors(async (req, res, next) => {
  console.log('oooo');
  const resultPerPage = 8;
  const inventoriesCount = await Inventory.countDocuments();
  const key = req.query.keyword
    ? {
      name: {
        $regex: req.query.keyword,
        $options: "i",
      },
    }
    : {};

  const InventoriesRes = await Inventory.find({ ...key });

  const queryCopy = { ...req.query };

  const removeFields = ["keyword", "page", "limit"];

  removeFields.forEach((key) => delete queryCopy[key]);

  let queryStr = JSON.stringify(queryCopy);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);

  let filteredInventories = await Inventory.find(JSON.parse(queryStr));

  let filteredInventoriesCount = InventoriesRes.length;
  const currentPage = Number(req.query.page) || 1;
  const skip = resultPerPage * (currentPage - 1);
  let InventoriesPage = await Inventory.find()
    .limit(resultPerPage)
    .skip(skip);

  res.status(200).json({
    success: true,
    InventoriesRes,
    inventoriesCount,
    resultPerPage,
    filteredInventoriesCount,
    filteredInventories,
    InventoriesPage,
  });
});

// get all inventories and search
exports.getAllInventorieswithSearch = catchAsyncErrors(async (req, res, next) => {
  const ApiFeature = new ApiFeatures(
    Inventory.find().populate("user", [
      "phoneNumber",
      "email",
      "address",
      "businessName",
    ]),
    req.query
  )
    .pagination(10)
    .search();
  const inventories = await ApiFeature.query;
  res.status(200).json({
    success: true,
    inventories,
  });
});

// Get All Inventory
exports.getAllInventories = catchAsyncErrors(async (req, res, next) => {
  const Inventories = await Inventory.find();
  res.status(200).json({
    success: true,
    Inventories,
  });
});

exports.getInventoryForUser = catchAsyncErrors(async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Current page number
  const limit = parseInt(req.query.limit) || 20; // Number of results per page
  const startIndex = (page - 1) * limit;
  console.log(req.query);
  // Use a regular expression for a flexible search
  const keywordRegex = new RegExp(req.query.keyword, 'i');

  // Use the find method with a regular expression for a flexible search and chaining for pagination
  const inventories = await Inventory.find({ user: req.user._id, name: keywordRegex })
    .skip(startIndex)
    .limit(limit);

  // You might want to separately query for the total count without pagination
  const totalCount = await Inventory.countDocuments({ user: req.user._id, name: keywordRegex });

  res.status(200).json({
    success: true,
    page,
    count: inventories.length,
    totalCount,
    inventories,
  });
});

exports.getInventoryForUser0 = catchAsyncErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1; // Current page number
  const limit = parseInt(req.query.limit) || 20; // Number of results per page

  const startIndex = (page - 1) * limit;

  const query = Inventory.find({ user: req.user._id });

  console.log(req.query);
  // Apply search filters if required
  const ApiFeature = new ApiFeatures(query, req.query).search();

  // Apply pagination
  ApiFeature.query = ApiFeature.query.skip(startIndex).limit(limit);

  const inventories = await ApiFeature.query;

  res.status(200).json({
    success: true,
    page,
    count: inventories.length,
    inventories,
  });
});

// Get Single Inventory Details
exports.getInventoryDetails = catchAsyncErrors(async (req, res, next) => {
  const inventory = await Inventory.findById(req.params.id);

  if (!inventory) {
    return next(new ErrorHandler("Inventory not found", 404));
  }

  res.status(200).json({
    success: true,
    inventory,
  });
});

exports.decrementQuantity = catchAsyncErrors(async (id, quantity) => {
  if (quantity == null) {
    return;
  }
  const inventory = await Inventory.findById(id);
  const newQty = inventory.quantity - quantity;
  if (newQty < 0) {
    throw new ErrorHandler("Cannot purchase more than existing quantity", 400);
  }
  inventory.quantity -= quantity;
  await inventory.save();
});

exports.incrementQuantity = catchAsyncErrors(async (id, quantity) => {
  if (quantity == null) {
    return;
  }
  const inventory = await Inventory.findById(id);
  inventory.quantity += quantity;
  await inventory.save();
});

// Update Inventory
exports.updateInventory = catchAsyncErrors(async (req, res, next) => {
  const {
    name,
    purchasePrice,
    sellingPrice,
    barCode,
    quantity,
    subProducts,
    GSTincluded,
    GSTRate,
    saleSGST,
    saleCGST,
    saleIGST,
    purchaseSGST,
    purchaseCGST,
    purchaseIGST,
    condition,
    baseSellingPrice,
    basePurchasePrice,
    sellerName,
    available,
    expiryDate,
    hsn,
    mrp,
    batchNumber,
    unit
  } = req.body;

  if (quantity < 1) {
    return res.send({
      success: false,
      msg: "QTY cant be 0 or less"
    });
  }

  if (quantity > 99999) {
    return res.send({
      success: false,
      msg: "qty cant be 99999 or more"
    });
  }

  let inventory = await Inventory.findById(req.params.id);
  if (!inventory) {
    return next(new ErrorHandler("Inventory not found", 404));
  }

  if (inventory.barCode && barCode != inventory.barCode) {
    if (barCode !== undefined && barCode !== "" && barCode.length !== 0) {
      const existingInventory = await Inventory.findOne({
        barCode: req.body.barCode,
        user: req.user._id,
      });
      if (!lodash.isEmpty(existingInventory)) {
        return next(
          new ErrorHandler("Product with this barcode already exists ", 400)
        );
      }
    }
  }

  // Update properties only if they are provided in the request
  const fieldsToUpdate = {
    name,
    purchasePrice,
    sellingPrice,
    barCode,
    quantity,
    subProducts,
    GSTRate,
    saleSGST,
    saleCGST,
    saleIGST,
    purchaseSGST,
    purchaseCGST,
    purchaseIGST,
    condition,
    baseSellingPrice,
    basePurchasePrice,
    sellerName,
    available,
    expiryDate,
    hsn,
    GSTincluded,
    batchNumber,
    mrp,
    unit
  };

  Object.keys(fieldsToUpdate).forEach(key => {
    if (fieldsToUpdate[key] !== undefined) {
      inventory[key] = fieldsToUpdate[key];
    }
  });

  // Save the updated inventory
  inventory = await inventory.save();

  res.status(200).json({
    success: true,
    inventory,
  });
});



// Delete Inventory
exports.deleteInventory = catchAsyncErrors(async (req, res, next) => {
  const inventory = await Inventory.findById(req.params.id);

  if (!inventory) {
    return next(new ErrorHandler("Inventory not found", 404));
  }
  await inventory.remove();
  res.status(200).json({
    success: true,
    message: "Inventory Delete Successfully",
  });
});

exports.bulkUpload = catchAsyncErrors(async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file found" });
    }
    const filePath = req.file.path;

    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    const fieldNames = Object.keys(jsonData[0]);
    const inventoryData = jsonData.map((data) => {
      const user = {};
      fieldNames.forEach((fieldName) => {
        if (data[fieldName] !== undefined) {
          user[fieldName] = data[fieldName];
        }
      });
      return user;
    });

    await Inventory.insertMany(users, { timeout: 30000 });

    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      inventoryData,
      message: "Data uploaded successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred" });
  }
});

exports.updateExistingInventories = catchAsyncErrors(async (req, res, next) => {
  const inventoriesToUpdate = await Inventory.find({ quantity: 1 });

  for (const inventory of inventoriesToUpdate) {
    inventory.quantity = null;
    await inventory.save();
  }

  res.status(200).json({
    success: true,
    message: "Existing inventories updated successfully",

  });
});

exports.availablility = catchAsyncErrors(async (req, res, next) => {
  const { status, productId } = req.params;
  console.log(productId);
  const product = await Inventory.findById(productId);
  if (!product) {
    return res.status(404).json({
      status: "error",
      message: "Product not found",
    });
  }

  if (status === "active") {
    if (product.available === true) {
      return res.send({
        status: "Already Active",
      });
    }

    product.available = true;
    await product.save();
  } else if (status === "disable") {
    if (product.available === false) {
      return res.send({
        status: "Already disable",
      });
    }
    product.available = false;
    await product.save();
  }

  res.send({
    status: "success",
    data: product,
  });
});

exports.getExpiringItemsForUser = async (req, res, next) => {
  const { days, userId } = req.params;  // Get the user ID from the parameters
  const page = parseInt(req.query.page) || 1; // Current page number
  const limit = parseInt(req.query.limit) || 20; // Number of results per page
  const startIndex = (page - 1) * limit;

  // Calculate the date range
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); // set the time to 00:00:00
  const expiryDateRange = new Date();
  expiryDateRange.setDate(currentDate.getDate() + parseInt(days));
  expiryDateRange.setHours(23, 59, 59, 999); // set the time to 23:59:59

  try {
    // Find items for the specific user with expiry dates within the range
    const expiringItems = await Inventory.find({
      user: userId,
      expiryDate: {
        $gte: currentDate,
        $lte: expiryDateRange,
      },
    })
      .skip(startIndex)
      .limit(limit);

    // If no items found, send a message to the user
    if (!expiringItems.length) {
      return res.status(200).json({
        success: true,
        message: 'No items expiring within the specified days.',
      });
    }

    // If items found, send them to the user along with pagination details
    res.status(200).json({
      success: true,
      page,
      count: expiringItems.length,
      expiringItems,
    });
  } catch (error) {
    // Handle any errors that might occur during the database query
    console.error("Error fetching expiring items:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.processInventory = async (req, res, next) => {
  const { inventoryId, quantity } = req.body;

  if (!inventoryId || !quantity) {
    return res.status(404).json({
      status: "error",
      message: "Inventory Id and Quantity are mandatory",
    });
  }

  try {
    const inventory = await Inventory.findById(inventoryId);

    if (!inventory) {
      return res.status(404).json({
        status: "error",
        message: "Product not found",
      });
    }

    if (inventory.subProducts && inventory.subProducts.length > 0) {
      inventory.subProducts.forEach(async (subProduct) => {

        const subInventory = await Inventory.findById(subProduct.inventoryId)

        if (!subInventory) {
          throw new Error(`No product named: ${subProduct.name} found`);
        }

        if (quantity * subProduct.quantity > subInventory.quantity) {
          throw new Error(`Insufficient quantity for ${subProduct.name}`);
        }

        subInventory.quantity -= quantity * subProduct.quantity;
        await subInventory.save();
      })
    }

    inventory.quantity += quantity;

    await inventory.save();

    const processEntry = new processModel({
      inventory: inventoryId,
      subProducts: inventory.subProducts,
    });

    await processEntry.save();

    return res.status(200).json({
      status: "success",
      message: "Inventory quantity and subProducts updated successfully",
      updatedInventory: inventory,
    });

  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message || "Internal Server Error",
      error: error.message,
    });
  }
};

