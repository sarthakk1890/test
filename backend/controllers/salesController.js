const SalesOrder = require("../models/salesModel");
const Inventory = require("../models/inventoryModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const inventoryController = require("./inventoryController");
const User = require("../models/userModel");
const moment = require('moment-timezone');

function concatenateValues(obj) {
  const arrNew = Object.values(JSON.parse((JSON.stringify(obj))));
  const word = arrNew.slice(0, -1).join('');
  return word;
}

// Create new sales Order
exports.newSalesOrder = catchAsyncErrors(async (req, res, next) => {
  const { orderItems, modeOfPayment, party, invoiceNum, reciverName, gst, businessName, businessAddress, kotId } = req.body;
  const indiaTime = moment.tz('Asia/Kolkata');
  const currentDateTimeInIndia = indiaTime.format('YYYY-MM-DD HH:mm:ss');

  for (const item of orderItems) {
    const product = await Inventory.findById(item.product);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    // Reduce subproduct quantities
    if (product.subProducts && product.subProducts.length > 0) {
      for (const subProduct of product.subProducts) {
        const subProductItem = await Inventory.findById(subProduct.inventoryId);

        if (subProductItem) {
          // Calculate the quantity to reduce for the subProduct
          const subProductReduction = item.quantity * subProduct.quantity;

          if (subProductReduction > subProductItem.quantity) {
            console.error(`Insufficient quantity for ${subProductItem.name}`);
          } else {
            // Reduce the quantity of the subProduct
            subProductItem.quantity -= subProductReduction;
            await subProductItem.save();
          }
        }
      }
    }

    // Check if there is enough quantity for the main product
    if (item.quantity > product.quantity) {
      return next(new ErrorHandler(`Insufficient quantity for ${product.name}`, 400));
    }

    // Reduce main product quantity
    product.quantity -= item.quantity;
    await product.save();

  }

  try {
    const total = calcTotalAmount(orderItems);

    // Convert modeOfPayment to an array if it is a string
    const paymentArray = typeof modeOfPayment === 'string'
      ? [{ mode: modeOfPayment, amount: total }]
      : modeOfPayment;


    const salesOrder = await SalesOrder.create({
      orderItems,
      party,
      modeOfPayment: paymentArray,
      total,
      user: req.user._id,
      createdAt: currentDateTimeInIndia,
      invoiceNum,
      reciverName,
      businessName,
      businessAddress,
      gst,
      kotId
    });

    // Increment numSales in User model
    await User.findByIdAndUpdate(req.user._id, { $inc: { numSales: 1 } });

    res.status(201).json({
      success: true,
      salesOrder,
    });
  } catch (err) {
    return next(new ErrorHandler("Could not create order", 403));
  }
});

const calcTotalAmount = (orderItems) => {
  let total = 0;
  for (const item of orderItems) {
    total += item.price * item.quantity;
  }
  return total;
};

// // get Single sales Order
// exports.getSingleSalesOrder = catchAsyncErrors(async (req, res, next) => {
//   const { invoiceNum } = req.params;
//   const salesOrder = await SalesOrder.findOne({ invoiceNum })
//     .populate("user", "name email")
//     .populate({
//       path: 'orderItems.product',
//       model: 'inventory',
//     })
//     .exec();;

//   if (!salesOrder) {
//     return next(new ErrorHandler("Order not found with this Id", 404));
//   }

//   res.status(200).json({
//     success: true,
//     salesOrder,
//   });
// });
exports.getSingleSalesOrder = catchAsyncErrors(async (req, res, next) => {
  const { invoiceNum } = req.params;
  const userId = req.user._id;
  // console.log(req.user);

  const salesOrder = await SalesOrder.findOne({ invoiceNum, 'user': userId })
    .populate("user", "name email")
    .populate({
      path: 'orderItems.product',
      model: 'inventory',
    })
    .populate({
      path: 'orderItems.membership',
      model: 'MembershipPlans',
    })
    .exec();

  if (!salesOrder) {
    return next(new ErrorHandler("Order not found with this Id", 404));
  }

  res.status(200).json({
    success: true,
    salesOrder,
  });
});

// get logged in user  Orders
exports.mySalesOrders = catchAsyncErrors(async (req, res, next) => {
  const pageSize = 10;
  const page = req.query.page || 1;

  const offset = page * pageSize;
  const salesOrders = await SalesOrder.find({ user: req.user._id })
    .limit(10)
    .skip(offset)
    .sort({ createdAt: -1 })
    .populate("party");

  const meta = {
    currentPage: Number(page),
    nextPage: salesOrders.length === 10 ? Number(page) + 1 : null,
    count: salesOrders.length,
  };

  res.status(200).json({
    success: true,
    salesOrders,
    meta,
  });
});

// get all Orders
exports.getAllSalesOrders = catchAsyncErrors(async (req, res, next) => {
  const salesOrders = await SalesOrder.find();
  let totalAmount = 0;

  salesOrders.forEach((salesOrder) => {
    totalAmount += salesOrder.totalPrice;
  });

  res.status(200).json({
    success: true,
    totalAmount,
    salesOrders,
  });
});

async function updateStock(id, quantity) {
  const inventory = await Inventory.findById(id);

  if (inventory.Stock !== null) {
    inventory.Stock -= quantity;
  }

  await inventory.save({ validateBeforeSave: false });
}


// delete Order -- Admin
exports.deleteSalesOrder = catchAsyncErrors(async (req, res, next) => {
  const salesOrder = await SalesOrder.findById(req.params.id);

  if (!salesOrder) {
    return next(new ErrorHandler("Order not found with this Id", 404));
  }

  await salesOrder.remove();

  res.status(200).json({
    success: true,
  });
});

exports.getCreditSaleOrders = catchAsyncErrors(async (req, res, next) => {
  const user = req.user._id;
  const data = await SalesOrder.aggregate([
    {
      $match: {
        user: user,
        $or: [
          { modeOfPayment: { $elemMatch: { mode: "Credit" } } },
          { modeOfPayment: "Credit" }
        ]
      },
    },
  ]);

  data.map((value, idx) => {
    if (!Array.isArray(value.modeOfPayment)) {
      const mode = value.modeOfPayment;
      const amount = value.total;
      value.modeOfPayment = { mode, amount };
    }
  })

  if (!data) {
    return next(new ErrorHandler("Orders not found", 404));
  }
  res.status(200).json({
    success: true,
    data,
  });
});

exports.addCreditSettleTransaction = catchAsyncErrors(
  async (req, res, next) => {
    const partyId = req.params.id;
    const indiaTime = moment.tz('Asia/Kolkata');
    const currentDateTimeInIndia = indiaTime.format('YYYY-MM-DD HH:mm:ss');
    const { amount } = req.body;
    let modeOfPayment = req.body.modeOfPayment;

    if (!Array.isArray(modeOfPayment)) {
      const mode = modeOfPayment;

      modeOfPayment = [{ mode, amount }]
    }

    const order = {
      party: partyId,
      total: amount,
      user: req.user._id,
      createdAt: currentDateTimeInIndia,
      modeOfPayment: modeOfPayment,
      orderItems: [],
    };
    const data = await SalesOrder.create(order);
    res.status(201).json({
      success: true,
      data,
    });
  }
);

exports.partyCreditHistory = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  const data = await SalesOrder.find({
    party: id
  }).populate('party');

  data.map((value, idx) => {
    if (!value.modeOfPayment[0].mode) {
      const mode = concatenateValues(value.modeOfPayment[0]);
      const amount = value.total;
      value.modeOfPayment[0] = { mode, amount };
    }
  })

  const elementsWithCredit = data.filter(item => {
    return item.modeOfPayment.some(payment => ["Credit", "Settle"].includes(payment.mode));
  });


  // Print the retrieved data for debugging
  console.log("Retrieved Sales Order Data:", elementsWithCredit);

  if (!elementsWithCredit) {
    return next(new ErrorHandler("Order not found with this Id", 404));
  }

  res.status(200).json({
    success: true,
    data: elementsWithCredit,
  });
});


exports.UpdateSalesOrder = catchAsyncErrors(async (req, res, next) => {
  const { total } = req.body;

  const salesOrder = await SalesOrder.findById(req.params.id);

  salesOrder.modeOfPayment[0].amount = total;
  salesOrder.total = total;

  const updatedSalesOrder = await salesOrder.save();

  res.status(200).json({
    success: true,
    data: updatedSalesOrder,
  });
});



const SalesReturn = require("../models/SalesReturnModel"); // Import the SalesReturn model

exports.salesReturn = catchAsyncErrors(async (req, res, next) => {
  console.log('Sales Return');
  // const { orderItems, modeOfPayment, party, invoiceNum, reciverName, gst, businessName } = req.body;
  const { orderItems, party, invoiceNum, reciverName, gst, businessName } = req.body;

  const indiaTime = moment.tz('Asia/Kolkata');
  const currentDateTimeInIndia = indiaTime.format('YYYY-MM-DD HH:mm:ss');

  for (const item of orderItems) {
    const product = await Inventory.findById(item.product);
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    // Increase main product quantity
    product.quantity += item.quantity;

    // Increase subproduct quantities
    if (product.subProducts && product.subProducts.length > 0) {
      for (const subProduct of product.subProducts) {
        const subProductItem = await Inventory.findById(subProduct.inventoryId);
        if (subProductItem) {
          subProductItem.quantity += subProduct.quantity;
          await subProductItem.save();
        }
      }
    }

    await product.save();
  }

  try {
    const total = calcTotalAmount(orderItems);

    const salesReturn = await SalesReturn.create({
      orderItems,
      party,
      // modeOfPayment,
      total,
      user: req.user._id,
      createdAt: currentDateTimeInIndia,
      invoiceNum,
      reciverName,
      businessName,
      gst
    });

    console.log(salesReturn);
    res.status(201).json({
      success: true,
      salesReturn,
    });
  } catch (err) {
    return next(new ErrorHandler("Could not process return", 403));
  }
});

//Get number of sales
exports.getNumberofSales = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return next(new ErrorHandler("User not found", 400));
    }

    const numSales = user.numSales;

    res.status(200).json({
      success: true,
      numSales,
    });
  } catch (err) {
    return next(new ErrorHandler("Error fetching number of sales", 500));
  }
});


//Reset number of sales
exports.resetSalesCount = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user._id;
  const { numSales = 0 } = req.body;

  try {
    await User.findByIdAndUpdate(userId, { $set: { numSales } }, { upsert: true });

    res.status(200).json({
      success: true,
      message: "Sales count reset successfully",
    });
  } catch (err) {
    return next(new ErrorHandler("Error resetting sales count", 500));
  }
});

//----Delete Sales using Invoice number-----------
exports.deleteUsingInvoiceNum = catchAsyncErrors(async (req, res, next) => {
  const invoiceNumToDelete = req.params.invoiceNum;
  const userId = req.user;

  try {
    await SalesOrder.deleteOne({ invoiceNum: invoiceNumToDelete, user: userId });

    const salesToUpdate = await SalesOrder.find({ invoiceNum: { $gt: invoiceNumToDelete }, user: userId });

    for (const sale of salesToUpdate) {
      const currentInvoiceNum = parseInt(sale.invoiceNum, 10);
      if (parseInt(invoiceNumToDelete, 10) < currentInvoiceNum) {
        sale.invoiceNum = (currentInvoiceNum - 1).toString();
        await sale.save();
      }
    }

    res.status(200).json({ message: `Sale with invoice number ${invoiceNumToDelete} deleted successfully.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});