const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Consumer = require("../models/consumerModel");
const OrderedItem = require("../models/orderedItem");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/userModel");
const Inventory = require("../models/inventoryModel");
const ApiFeatures = require("../utils/apiFeatures");
// const Product = require("../models/inventoryModel");
const { unsubscribe } = require("../routes/consumerRoute");
const Rating = require("../models/ratingModel");

// variable for global clicks counter
let allClicksProducts = 0;
let allClicksSeller = 0;
// registering consumer
exports.registerConsumer = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password, phoneNumber } = req.body;
  if (!name || !email || !password || !phoneNumber) {
    return next(new ErrorHandler("Please provide all the details", 400));
  }
  const consumer = await Consumer.create({
    name,
    email,
    password,
    phoneNumber,
  });
  const token = consumer.getJWTToken();
  sendToken(consumer, 201, res);
});

// consumer login
exports.loginConsumer = catchAsyncErrors(async (req, res, next) => {
  // console.log('hi');
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Please provide all the details", 400));
  }
  const consumer = await Consumer.findOne({ email }).select("+password");
  if (!consumer) {
    return next(new ErrorHandler("Invalid credentials", 400));
  }
  const isMatch = await consumer.comparePassword(password);
  if (!isMatch) {
    return next(new ErrorHandler("Invalid credentials", 400));
  }
  sendToken(consumer, 200, res);
});

// consumer logout
exports.consumerLogout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

// get contact number of seller
exports.getContactNumber = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  res.status(200).json({
    success: true,
    data: user.phoneNumber,
  });
});

// get sellers and search according to location
exports.getSellersAndSearch = catchAsyncErrors(async (req, res, next) => {
  // const { city, state, country } = req.body;

  const apiFeature = new ApiFeatures(
    User.find({
      address: {
        $regex: req.query.keyword,
        $options: "i",
      },
    }).sort("-createdAt"),
    req.query
  ).pagination(50);
  const sellers = await apiFeature.query;
  if (!sellers) {
    return next(new ErrorHandler("No sellers found", 404));
  }
  res.status(200).json({
    success: true,
    data: sellers,
  });
});

// get all sellers from inventory where category is matched
exports.getSellers = catchAsyncErrors(async (req, res, next) => {
  const { category, page = 1 } = req.query; // Added default page value

  if (!category) {
    return next(new ErrorHandler("Please provide category", 400));
  }

  const skip = (page - 1) * 12; // Calculate the number of documents to skip

  const apiFeature = new ApiFeatures(
    User.find({
      businessType: {
        $regex: category,
        $options: "i",
      },
    }).skip(skip).limit(12), // Added skip and limit for pagination
    req.query
  ).pagination(12); // Updated to 12 items per page

  const sellers = await apiFeature.query;
  if (!sellers) {
    return next(new ErrorHandler("No sellers found", 404));
  }
  res.status(200).json({
    success: true,
    data: sellers,
  });
});


// get all products from a user
exports.getProductsOfUser = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    return next(new ErrorHandler("Please provide id as query param", 400));
  }
  const seller = await User.findById(id);
  if (!seller) {
    return next(new ErrorHandler("User not found", 404));
  }
  const apiFeature = new ApiFeatures(
    Inventory.find({
      user: id,
    }),
    req.query
  ).pagination(10);
  const products = await apiFeature.query;
  if (!products) {
    return next(new ErrorHandler("No products found", 404));
  }
  res.status(200).json({
    success: true,
    data: products,
  });
});

// get all sellers and search by name :
exports.getSellersByName = catchAsyncErrors(async (req, res, next) => {
  const key = req.query.keyword
    ? {
        businessName: {
          $regex: req.query.keyword,
          $options: "i",
        },
      }
    : {};
  const apiFeature = new ApiFeatures(User.find(key), req.query).pagination(10);
  const sellers = await apiFeature.query;
  res.status(200).json({
    success: true,
    sellers,
  });
});

// get all names of products
exports.getProductNamesandSearch = catchAsyncErrors(async (req, res, next) => {
  const key = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: "i",
        },
      }
    : {};
  const products = await Inventory.find(key).select("name");
  res.status(200).json({
    success: true,
    products,
  });
});

// tracker
exports.addClickProduct = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const product = await Inventory.findById(id);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  product.clicks = product.clicks + 1;
  allClicksProducts = allClicksProducts + 1;
  await product.save();
  const updProduct = await Inventory.findById(id);
  res.status(200).json({
    success: true,
    message: "Click added",
    data: updProduct,
  });
});

// clicks for sellers
exports.addClickSeller = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const seller = await User.findById(id);
  if (!seller) {
    return next(new ErrorHandler("Seller not found", 404));
  }
  seller.clicks = seller.clicks + 1;
  allClicksSeller = allClicksSeller + 1;
  await seller.save();
  const updSeller = await User.findById(id);
  res.status(200).json({
    success: true,
    message: "Click added",
    data: updSeller,
  });
});

// get top clicked products of specific seller
exports.getTopClickedProducts = catchAsyncErrors(async (req, res, next) => {
  const { page = 1 } = req.query;
  const limit = 10;
  let popularProducts = [];
  // check if req.query.keyword is present
  if (!req.query.keyword) {
    return next(new ErrorHandler("Please provide keyword", 400));
  }
  const seller = await User.find({
    address: {
      $regex: req.query.keyword,
      $options: "i",
    },
  });
  if (!seller) {
    return next(new ErrorHandler("Sellers not found", 404));
  }
  for (let i = 0; i < seller.length; i++) {
    const product = await Inventory.find({
      user: seller[i]._id,
    })
      .sort("-clicks")
      .limit(1)
      .populate("user")
      .limit(limit)
      .skip((page - 1) * limit);
    if (product.length > 0) {
      popularProducts.push(product[0]);
    }
  }
  res.status(200).json({
    success: true,
    popularProducts,
  });
});

// get top clicked sellers
exports.getTopClickedSellers = catchAsyncErrors(async (req, res, next) => {
  const sellers = await User.find().sort("-clicks");
  res.status(200).json({
    success: true,
    sellers,
  });
});

// get consumer details from id
exports.getConsumerDetails = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const consumer = await Consumer.findById(id);
  if (!consumer) {
    return next(new ErrorHandler("Consumer not found", 404));
  }
  res.status(200).json({
    success: true,
    consumer,
  });
});

// update consumer details
exports.updateConsumerDetails = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const consumer = await Consumer.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  if (!consumer) {
    return next(new ErrorHandler("consumer not found", 404));
  }
  res.status(200).json({
    success: true,
    consumer,
  });
});

const calculateDiscountedPrice = async (productId) => {
  const product = await Inventory.findById(productId);
  const sellerId = product.user;
  const seller = await User.findById(sellerId);

  let discountPer = 0;
  let originalPrice = product.sellingPrice;
  let price = originalPrice;

  if (seller.discount || seller.discount > 0) {
    discountPer = seller.discount;
    price = originalPrice - (originalPrice * discountPer / 100);
  }

  return { originalPrice, price, discountPer };
};

exports.addToCart = async (req, res, next) => {
  try {
    console.log("inside cart");
    const userId = req.user._id;
    const productId = req.params.productId;
    const qty = parseInt(req.body.qty);

    const consumer = await Consumer.findById(userId);
    const product = await Inventory.findById(productId);
    const sellerId = product.user;
    const seller = await User.findById(sellerId);
    console.log(seller.discount);
    
    let discountPer=0
    let originalPrice=product.sellingPrice
    let price = product.sellingPrice
    if(seller.discount || seller.discount>0){
      
      discountPer=seller.discount
       price = product.sellingPrice -(product.sellingPrice * seller.discount /100);
    }


    const productName = product.name;
    const image = product.image || "unavailable";
    console.log(sellerId);
    const sellerName = seller.businessName;
    let latitude = seller?.latitude || "unavailable";
    let longitude = seller?.longitude || "unavailable";

    if (!consumer) {
      console.log("User not found");
      return res.json({
        status: false,
        msg: "User not found",
      });
    }

    if (
      !consumer.cart.sellerId ||
      consumer.cart.sellerId.toString() !== sellerId.toString()
    ) {
      consumer.cart = {
        sellerId: sellerId,
        longitude: longitude,
        latitude: latitude,
        product: [], // Initialize product array as empty
      };
    }

    const existingProduct = consumer.cart.product.find(
      (product) => product.productId == productId
    );

    if (existingProduct) {
      // If the product already exists, update its quantity
      existingProduct.qty += qty;
    } else {
      // If the product doesn't exist, add a new entry to the cart
      consumer.cart.product.push({
        productId: productId,
        qty: qty,
        sellerName,
        productName,
        price,
        image,
      });
    }

    // Save the updated consumer object
    await consumer.save();

    return res.json({
      status: true,
      msg: "Product added to cart successfully",
      cart: consumer.cart,
      discountPer,
      originalPrice
       // Return the updated cart
    });
  } catch (err) {
    console.log(err);
  }
};

exports.removeItem = catchAsyncErrors(async (req, res, next) => {
  try {
    const userId = req.user._id;
    const productId = req.params.productId;
    console.log(productId);
    // find user
    const user = await Consumer.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find the index of the cart item to be deleted
    const cartItemIndex = user.cart.product.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (cartItemIndex !== -1) {
      user.cart.product.splice(cartItemIndex, 1);
      const savedUser = await user.save();

      res.send({
        success: true,
        msg: "deleted",
      });
    }
  } catch (err) {
    console.log(err);
  }
});

exports.showCart = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user._id;
  const consumer = await Consumer.findById(userId);
  const cart = consumer.cart;
  const productId = cart.product.map((item) => item.productId);
  const products = await Inventory.find({ _id: { $in: productId } });

  const cartWithProductNames = await Promise.all(cart.product.map(async (item) => {
    const product = products.find(
      (prod) => prod._id.toString() === item.productId.toString()
    );
    const { originalPrice, price, discountPer } = await calculateDiscountedPrice(item.productId);
    return {
      productId: item.productId,
      sellerName: product.sellerName,
      sellerId: product.user,
      originalPrice: originalPrice, // Original price without discount
      discountedPrice: price, // Price after applying discount
      discountPercentage: discountPer, // Discount percentage
      qty: item.qty,
      image: product.image || "unavailable",
      name: product ? product.name : "Product Not Found",
    };
  }));
  res.send(cartWithProductNames);
});


exports.checloutCart = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;
  // send cart data to orderDB
  const user = await User.findById(userId);
  console.log(user.cart);
});

// search Location ** TODO send only nearby shops **
exports.searchLocation = catchAsyncErrors(async (req, res, next) => {
  const searchedLocation = req.body.location;
  const location = searchedLocation.toLowerCase();
  console.log(location);

  try {
    const users = await User.find({
      $or: [{ "address.city": location }, { "address.state": location }],
    });

    console.log(users);
    if (users.length === 0) {
      return res.send("Sorry, no sellers found at that location.");
    }

    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Vie all
exports.viewAll = catchAsyncErrors(async (req, res, next) => {
  const searchedLocation = req.params.location;
  const location = searchedLocation.toLowerCase();
  const page = parseInt(req.query.page) || 1; // Default page is 1
  const limit = parseInt(req.query.limit) || 10; // Default limit is 10 items per page

  try {
    const userCount = await User.countDocuments({
      $or: [{ "address.city": location }, { "address.state": location }],
    });

    const totalPages = Math.ceil(userCount / limit);
    const skip = (page - 1) * limit;

    const users = await User.find({
      $or: [{ "address.city": location }, { "address.state": location }],
    })
      .skip(skip)
      .limit(limit);

    if (users.length === 0) {
      return res.send("Sorry, no sellers found at that location.");
    }

    res.status(200).json({
      users,
      currentPage: page,
      totalPages,
      totalUsers: userCount,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Search Product
// Search Product top reults  todo add pginations
exports.searchProduct = catchAsyncErrors(async (req, res, next) => {
  try {
    const location = req.params.location;

    const sellers = await User.find({
      $or: [{ "address.city": location }, { "address.state": location }],
    });
    let discount = 0;
    if (sellers.discount || sellers.discount > 0) {
      discount = sellers.discount;
    }
    const sid = sellers.map((seller) => seller._id);
    const productName = req.body.productName;

    // Pagination
    const page = parseInt(req.query.page, 10) || 1; // Default to page 1 if not provided
    const limit = 20; // 20 products per page
    const startIndex = (page - 1) * limit;

    const productData = await Inventory.find({
      name: { $regex: ".*" + productName + ".*", $options: "i" },
      user: {
        $in: sid,
      },
    })
    .skip(startIndex)
    .limit(limit);

    if (productData.length > 0) {
      res.status(200).send({
        success: true,
        msg: "Products",
        data: productData,
        discount,
      });
    } else {
      res.status(200).send({ success: true, msg: "Products not found" });
    }
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
});

exports.searchProduct9 = catchAsyncErrors(async (req, res, next) => {
  const productName = req.body.productName;
  const page = parseInt(req.query.page) || 1; // Default page is 1
  const limit = parseInt(req.query.limit) || 10; // Default limit is 10 items per page

  const nameVariations = [];
  const nameWords = productName.split(" ");

  for (let i = 0; i < nameWords.length; i++) {
    const variation = nameWords.slice(0, i + 1).join(" ");
    nameVariations.push(variation);
  }

  try {
    const productCount = await Product.countDocuments({
      $or: nameVariations.map((variation) => ({
        $or: [
          { name: { $regex: new RegExp(variation, "i") } },
          { category: { $regex: new RegExp(variation, "i") } },
        ],
      })),
    });

    const totalPages = Math.ceil(productCount / limit);
    const skip = (page - 1) * limit;

    const products = await Product.find({
      $or: nameVariations.map((variation) => ({
        $or: [
          { name: { $regex: new RegExp(variation, "i") } },
          { category: { $regex: new RegExp(variation, "i") } },
        ],
      })),
    })
      .skip(skip)
      .limit(limit);

    if (products.length === 0) {
      return res.send("Sorry, no products found matching your search.");
    }

    res.status(200).json({
      products,
      currentPage: page,
      totalPages,
      totalProducts: productCount,
    });
  } catch (err) {
    res.send(err);
  }
});

exports.searchProduct0 = catchAsyncErrors(async (req, res, next) => {
  const productName = req.body.productName;

  const nameVariations = [];
  const nameWords = productName.split(" ");

  for (let i = 0; i < nameWords.length; i++) {
    const variation = nameWords.slice(0, i + 1).join(" ");
    nameVariations.push(variation);
  }

  try {
    const product = await Product.find({
      $or: nameVariations.map((variation) => ({
        $or: [
          { name: { $regex: new RegExp(variation, "i") } },
          { category: { $regex: new RegExp(variation, "i") } },
        ],
      })),
    });

    console.log(product.user);
    if (product.length === 0) {
      return res.send("Sorry, no products found matching your search.");
    }

    // const sellerName=await User.findById(product.user);

    // console.log(sellerName.businessName);

    res.status(200).json({ product });
  } catch (err) {
    res.send(err);
  }
});

// route for open shop (single)
exports.viewShop = catchAsyncErrors(async (req, res) => {
  const shopId = req.params.shopId;
  const page = parseInt(req.query.page) || 1; // Default page is 1
  const limit = parseInt(req.query.limit) || 10; // Default limit is 10 items per page

  try {
    const inventoryCount = await Inventory.countDocuments({ user: shopId });
    const totalPages = Math.ceil(inventoryCount / limit);
    const skip = (page - 1) * limit;

    const inventory = await Inventory.find({ user: shopId })
      .skip(skip)
      .limit(limit);

    if (inventory.length === 0) {
      return res.send("Sorry, no inventory found for this shop.");
    }

    res.status(200).json({
      inventory,
      currentPage: page,
      totalPages,
      totalItems: inventoryCount,
    });
  } catch (err) {
    res.send(err);
  }
});

exports.viewShop0 = catchAsyncErrors(async (req, res) => {
  const shopId = req.params.shopId;

  const inventory = await Inventory.find({ user: shopId });
  console.log(inventory);
  res.send(inventory);
});

// flter Product by category

exports.filterProduct = catchAsyncErrors(async (req, res, next) => {
  const category = req.params.productCategory;
  const location = req.params.location;
  const user = await User.find({
    businessType: category,
    $or: [{ "address.city": location }, { "address.state": location }],
  });

  if (user.length === 0) {
    return res.send("Sorry, NO seller Available");
  }

  res.send(user);
});





exports.placeOrder = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user._id;
  const user = await Consumer.findById(userId);
  console.log(user.cart);
  const sellerid = user.cart.sellerId;
  const seller = await User.findById(sellerid)
  console.log(seller);
  const sellerUpi=seller.upi_id 
  // const address= user.addresses

  const orderedItems = user.cart.product.map((item) => {
    return {
      productId: item.productId,
      productName: item.productName,
      productPrice: item.price,
      productImage: item.image,
      quantity: item.qty,
      sellerId: sellerid,
      sellerName: item.sellerName,
    };
  });

  const address = {
    // country: req.body.country,
    name: req.body.name,
    state: req.body.state,
    city: req.body.city,
    phoneNumber: req.body.phoneNumber,
    pinCode: req.body.pinCode,
    streetAddress: req.body.streetAddress,
    additionalInfo: req.body.additionalInfo,
    landmark: req.body.landmark,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
  };

  

  const newOrder = new OrderedItem({
    items: orderedItems,
    consumerId: userId,
    consumerName: user.name,
    seller: sellerid,
    addresses: address,
    sellerNum:seller.phoneNumber,
    sellerUpi,
    
    
  });
  user.cart = [];
  await user.save();
  await newOrder.save();

  res.send({orderedItems});
});
exports.recentOrders = catchAsyncErrors(async (req, res, next) => {
  try {
    const userId = req.user._id;
    console.log(userId);
    const recentOrders = await OrderedItem.find({ consumerId: userId })
    // const seller=await User.findById(recentOrders.seller)
    // const sellerNumber=seller.phoneNumber
    // const sellerUpi = seller.sellerUpi || "demoUpi@magicstep"
    // console.log(seller);
     
    res.send({
      recentOrders,
      // sellerNumber,
      // sellerUpi
      
    });
  } catch (err) {
    console.log(err);
  }
});

exports.addAddress = catchAsyncErrors(async (req, res, next) => {
  try {
    const consumerId = req.user._id;
    const {
      name,
      state,
      city,
      phoneNumber,
      pinCode,
      streetAddress,
      additionalInfo,
      landmark,
      latitude,
      longitude,
    } = req.body;
    const consumer = await Consumer.findById(consumerId);
    if (!consumer) {
      return res.status(404).json({ message: "Consumer not found" });
    }

    const newAddress = {};

    if (name) newAddress.name = name;
    if (state) newAddress.state = state.toLowerCase();
    if (city) newAddress.city = city;
    if (phoneNumber) newAddress.phoneNumber = phoneNumber;
    if (pinCode) newAddress.pinCode = pinCode;
    if (streetAddress) newAddress.streetAddress = streetAddress;
    if (additionalInfo) newAddress.additionalInfo = additionalInfo;
    if (landmark) newAddress.landmark = landmark;
    if (latitude) newAddress.latitude = latitude;
    if (longitude) newAddress.longitude = longitude;

    consumer.addresses.push(newAddress);
    await consumer.save();

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      address: newAddress,
    });
  } catch (err) {
    console.log(err);
  }
});

exports.deleteAccountPage = catchAsyncErrors(async (req, res, next) => {
  try {
    return res.render("deletePage");
  } catch (err) {
    console.log(err);
  }
});

//  const Consumer = require('../models/Consumer'); // Import the Consumer model

exports.deleteAccount = catchAsyncErrors(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find the consumer by email
    const consumer = await Consumer.findOne({ email });

    if (!consumer) {
      return res.status(404).json({ message: "Consumer not found" });
    }

    // Check if the provided password matches the consumer's password
    const isPasswordMatched = await consumer.comparePassword(password);

    if (!isPasswordMatched) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Delete the consumer account
    await Consumer.findByIdAndDelete(consumer._id);

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

exports.policyPage = catchAsyncErrors(async (req, res, next) => {
  try {
    return res.render("consumerprivacy");
  } catch (err) {
    console.log(err);
  }
});

exports.rating = catchAsyncErrors(async (req, res, next) => {
  const { rating } = req.body;
  const userId = req.user._id;
  const { productId } = req.params;

  const product = await Inventory.findById(productId);
  const sellerId = product.user;
  if (!product) {
    return res.send("Product Not found");
  }

  const checkRating = await Rating.findOne({
    consumer: userId,
    product: productId,
    sellerId,
  });
  if (checkRating) {
    return res.send("You can Only rate Once");
  }

  const addRating = new Rating({
    consumer: userId,
    product: productId,
    rating: rating,
    sellerId: sellerId,
  });
  product.rating.push(userId);
  await product.save();
  await addRating.save();

  return res.send({
    success: true,
    msg: "Rated Successfully",
  });
});
const InventoryModel = require('../models/inventoryModel');

exports.getAllProductsFromSeller = async (req, res) => {
  try {
    const sellerId = req.params.sellerId;
    const page = req.query.page || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const products = await InventoryModel.find({ sellerId: sellerId })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: 'success',
      results: products.length,
      data: {
        products,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
