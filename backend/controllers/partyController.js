const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Party = require("../models/partyModel");
const SalesModel = require("../models/salesModel");
const PurchaseModel = require("../models/purchaseModel");
// const sendToken = require("../utils/jwtToken");
const mongoose = require("mongoose");
const isEmpty = require("lodash").isEmpty;

function concatenateValues(obj) {
  const arrNew = Object.values(JSON.parse((JSON.stringify(obj))));
  const word = arrNew.slice(0, -1).join('');
  return word;
}

// create new party
exports.registerParty = catchAsyncErrors(async (req, res, next) => {
  const { name, address, type, phoneNumber, guardianName } = req.body;
  const party = await Party.create({
    name,
    address,
    phoneNumber,
    type,
    guardianName,
    user: req.user._id,
  });

  res.status(201).json({
    success: true,
    party,
  });
});

exports.searchParty = catchAsyncErrors(async (req, res, next) => {
  const { searchQuery, type, limit } = req.query;
  const user = req.user._id;
  const allParty = await Party.find({
    name: {
      $regex: searchQuery,
      $options: "i",
    },
    user: user,
    type: type,
  }).limit(limit);
  res.status(200).json({
    success: true,
    allParty,
  });
});

exports.getAllParty = catchAsyncErrors(async (req, res, next) => {
  const allParty = await Party.find();
  res.status(200).json({
    success: true,
    allParty,
  });
});

exports.getMyParties = catchAsyncErrors(async (req, res, next) => {
  const allParty = await Party.find({ user: req.user._id });
  res.status(200).json({
    success: true,
    allParty,
  });
});

exports.getSingleParty = catchAsyncErrors(async (req, res, next) => {
  const party = await Party.findById(req.params.id);

  if (!party) {
    return next(new ErrorHandler("party not found", 404));
  }

  res.status(200).json({
    success: true,
    party,
  });
});

exports.updateParty = catchAsyncErrors(async (req, res, next) => {
  let party = await Party.findById(req.params.id);

  if (!party) {
    return next(new ErrorHandler("party not found", 404));
  }

  party = await Party.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    party,
  });
});

exports.deleteParty = catchAsyncErrors(async (req, res, next) => {
  const party = await Party.findById(req.params.id);

  if (!party) {
    return next(new ErrorHandler("party not found", 404));
  }

  await party.remove();

  res.status(200).json({
    success: true,
    message: "party Deleted Successfully",
  });
});

/**
 * Get party credit orders
 */

/**
 * Get the sum of all the party's total credit amount
 * Returns only parties whose amounts are greater than zero
 */

// exports.getCreditPurchaseParties = catchAsyncErrors(async (req, res, next) => {
//   const user = req.user._id;
//   const data = await Party.aggregate([
//     {
//       $match: { user: user, type: "supplier" },
//     },
//   ]);
//   if (!data) {
//     return next(new ErrorHandler("Orders not found", 404));
//   }
//   const parties = await Promise.all(
//     data.map(async (e) => {
//       e.totalCreditAmount =
//         (await partyCreditPurchaseHistoryTotal(e._id, "Credit")) ?? 0;
//       e.totalSettleAmount =
//         (await partyCreditPurchaseHistoryTotal(e._id, "Settle")) ?? 0;
//       e.balance = e.totalCreditAmount - e.totalSettleAmount;
//       return e;
//     })
//   );

//   res.status(200).json({
//     success: true,
//     data: parties,
//   });
// });

exports.getCreditPurchaseParties = catchAsyncErrors(async (req, res, next) => {
  const user = req.user._id;
  const data = await Party.aggregate([
    {
      $match: { user: user, type: "supplier" },
    },
  ]);
  if (!data) {
    return next(new ErrorHandler("Orders not found", 404));
  }

  const parties = await Promise.all(
    data.map(async (e) => {
      const creditHistory = await PurchaseModel.find({
        party: e._id,
      });

      creditHistory.map((value, idx) => {
        if (!value.modeOfPayment[0].mode) {
          const mode = concatenateValues(value.modeOfPayment[0]);
          const amount = value.total;
          value.modeOfPayment[0] = { mode, amount };
        }
      });

      const totalCreditAmount = creditHistory.reduce((total, order) => {
        return total + (Array.isArray(order.modeOfPayment)
          ? order.modeOfPayment.reduce((amount, obj) => {
            return amount + (obj.mode === 'Credit' ? obj.amount : 0);
          }, 0)
          : (order.modeOfPayment === 'Credit' ? order.total : 0));
      }, 0);

      const totalSettleAmount = creditHistory.reduce((total, order) => {
        return total + (Array.isArray(order.modeOfPayment)
          ? order.modeOfPayment.reduce((amount, obj) => {
            return amount + (obj.mode === 'Settle' ? obj.amount : 0);
          }, 0)
          : (order.modeOfPayment === 'Settle' ? order.total : 0));
      }, 0);

      e.totalCreditAmount = totalCreditAmount;
      e.totalSettleAmount = totalSettleAmount;
      e.balance = totalCreditAmount - totalSettleAmount;

      return e;
    })
  );

  res.status(200).json({
    success: true,
    data: parties,
  });
});


// exports.getCreditPurchaseParty = catchAsyncErrors(async (req, res, next) => {
//   const user = req.user._id;
//   const partyId = req.params.id;
//   const id = mongoose.Types.ObjectId(partyId);
//   const parties = await Party.aggregate([
//     {
//       $match: { user, _id: id },
//     },
//     { $limit: 1 },
//     {
//       $lookup: {
//         from: "purchasemodels",
//         localField: "_id",
//         foreignField: "party",
//         as: "purchase",
//       },
//     },
//     {
//       $addFields: {
//         totalCreditAmount: { $sum: "$purchase.total" },
//       },
//     },
//     {
//       $unset: ["purchase"],
//     },
//   ]);
//   const party = parties[0];
//   const totalCreditAmount = await partyCreditPurchaseHistoryTotal(
//     partyId,
//     "Credit"
//   );
//   const totalSettleAmount = await partyCreditPurchaseHistoryTotal(
//     partyId,
//     "Settle"
//   );

//   const data = {
//     ...party,
//     totalCreditAmount,
//     totalSettleAmount,
//     balance: totalCreditAmount - totalSettleAmount,
//   };
//   if (!data) {
//     return next(new ErrorHandler("Orders not found", 404));
//   }
//   res.status(200).json({
//     success: true,
//     data: data,
//   });
// });

exports.getCreditPurchaseParty = catchAsyncErrors(async (req, res, next) => {
  const user = req.user._id;
  const partyId = req.params.id;

  const creditHistory = await PurchaseModel.find({
    party: partyId,
  });

  creditHistory.map((value, idx) => {
    if (!value.modeOfPayment[0].mode) {
      const mode = concatenateValues(value.modeOfPayment[0]);
      const amount = value.total;
      value.modeOfPayment[0] = { mode, amount };
    }
  });

  const parties = await Party.aggregate([
    {
      $match: { user, _id: mongoose.Types.ObjectId(partyId) },
    },
    { $limit: 1 },
    {
      $addFields: {
        totalCreditAmount: {
          $sum: {
            $map: {
              input: "$purchase",
              as: "purchase",
              in: "$$purchase.total",
            },
          },
        },
      },
    },
  ]);

  const party = parties[0];

  const totalCreditAmount = creditHistory.reduce((total, order) => {
    return total + (Array.isArray(order.modeOfPayment)
      ? order.modeOfPayment.reduce((amount, obj) => {
        return amount + (obj.mode === 'Credit' ? obj.amount : 0);
      }, 0)
      : (order.modeOfPayment === 'Credit' ? order.total : 0));
  }, 0);

  const totalSettleAmount = creditHistory.reduce((total, order) => {
    return total + (Array.isArray(order.modeOfPayment)
      ? order.modeOfPayment.reduce((amount, obj) => {
        return amount + (obj.mode === 'Settle' ? obj.amount : 0);
      }, 0)
      : (order.modeOfPayment === 'Settle' ? order.total : 0));
  }, 0);

  const data = {
    ...party,
    totalCreditAmount,
    totalSettleAmount,
    balance: totalCreditAmount - totalSettleAmount,
  };

  if (!data) {
    return next(new ErrorHandler("Orders not found", 404));
  }

  res.status(200).json({
    success: true,
    data: data,
  });
});


// exports.getCreditSaleParty = catchAsyncErrors(async (req, res, next) => {
//   const user = req.user._id;
//   const partyId = req.params.id;
//   const id = mongoose.Types.ObjectId(partyId);
//   const parties = await Party.aggregate([
//     {
//       $match: { user, _id: id },
//     },
//     { $limit: 1 },
//     {
//       $lookup: {
//         from: SalesModel.collection.name,
//         localField: "_id",
//         foreignField: "party",
//         as: "sale",
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $in: ["$modeOfPayment", ["Settle", "Credit"]],
//               },
//             },
//           },
//         ],
//       },
//     },
//     {
//       $addFields: {
//         totalCreditAmount: { $sum: "$sale.total" },
//       },
//     },
//     {
//       $unset: ["sale"],
//     },
//   ]);
//   const party = parties[0];
//   const totalCreditAmount = await partyCreditSaleHistoryTotal(
//     partyId,
//     "Credit"
//   );
//   const totalSettledAmount = await partyCreditSaleHistoryTotal(
//     partyId,
//     "Settle"
//   );
//   const data = {
//     ...party,
//     totalCreditAmount,
//     totalSettledAmount,
//     balance: totalCreditAmount - totalSettledAmount,
//   };
//   if (!data) {
//     return next(new ErrorHandler("Orders not found", 404));
//   }
//   res.status(200).json({
//     success: true,
//     data: data,
//   });
// });



//--------------------------------------------------------------------------------------
// /**
//  *
//   * @param {Number} partyId
//   * @param {Number} modeOfPayment
//   * @returns {Promise<{total: Number, totalCredit: Number, totalSettled: Number}>}
// */

// const partyCreditSaleHistoryTotal = async (partyId, modeOfPayment) => {
//   const data = await SalesModel.aggregate([
//     {
//       $match: {
//         modeOfPayment: { $in: [modeOfPayment] },
//         party: mongoose.Types.ObjectId(partyId),
//       },
//     },

//     {
//       $group: {
//         _id: "$itemNumber",
//         total: {
//           $sum: "$total",
//         },
//       },
//     },
//   ]);
//   let total = 0;
//   if (!isEmpty(data)) {
//     total = data[0].total ?? 0;
//   }
//   return total;
// };
// /**
//  *
//  * @param {Number} partyId
//  * @param {Number} modeOfPayment
//  * @returns {Promise<{total: Number, totalCredit: Number, totalSettled: Number}>}
//  */
// const partyCreditPurchaseHistoryTotal = async (partyId, modeOfPayment) => {
//   const data = await PurchaseModel.aggregate([
//     {
//       $match: {
//         modeOfPayment: { $in: [modeOfPayment] },
//         party: mongoose.Types.ObjectId(partyId),
//       },
//     },

//     {
//       $group: {
//         _id: "$itemNumber",
//         total: {
//           $sum: "$total",
//         },
//       },
//     },
//   ]);
//   let total = 0;
//   if (!isEmpty(data)) {
//     total = data[0].total ?? 0;
//   }
//   return total;
// };

//-----------------------------------------------------------------------------------

// exports.getCreditSaleParties = catchAsyncErrors(async (req, res, next) => {
//   const user = req.user._id;
//   const data = await Party.aggregate([
//     {
//       $match: { user: user, type: "customer" },
//     },
//   ]);
//   if (!data) {
//     return next(new ErrorHandler("Orders not found", 404));
//   }


//   const parties = await Promise.all(
//     data.map(async (e) => {
//       e.totalCreditAmount =
//         (await partyCreditSaleHistoryTotal(e._id, "Credit")) ?? 0;
//       e.totalSettleAmount =
//         (await partyCreditSaleHistoryTotal(e._id, "Settle")) ?? 0;
//       e.balance = e.totalCreditAmount - e.totalSettleAmount;
//       return e;
//     })
//   );

//   res.status(200).json({
//     success: true,
//     data: parties,
//   });
// });


//-----------------------------------------------------------------------------------

exports.getCreditSaleParties = catchAsyncErrors(async (req, res, next) => {
  const user = req.user._id;
  const data = await Party.aggregate([
    {
      $match: { user: user, type: "customer" },
    },
  ]);
  if (!data) {
    return next(new ErrorHandler("Orders not found", 404));
  }

  const parties = await Promise.all(
    data.map(async (e) => {
      const creditHistory = await SalesModel.find({
        party: e._id,
      });

      creditHistory.map((value, idx) => {
        if (!value.modeOfPayment[0].mode) {
          const mode = concatenateValues(value.modeOfPayment[0]);
          const amount = value.total;
          value.modeOfPayment[0] = { mode, amount };
        }
      })

      const totalCreditAmount = creditHistory.reduce((total, order) => {
        return total + (Array.isArray(order.modeOfPayment)
          ? order.modeOfPayment.reduce((amount, obj) => {
            return amount + (obj.mode === 'Credit' ? obj.amount : 0);
          }, 0)
          : (order.modeOfPayment === 'Credit' ? order.total : 0));
      }, 0);

      const totalSettleAmount = creditHistory.reduce((total, order) => {
        return total + (Array.isArray(order.modeOfPayment)
          ? order.modeOfPayment.reduce((amount, obj) => {
            return amount + (obj.mode === 'Settle' ? obj.amount : 0);
          }, 0)
          : (order.modeOfPayment === 'Settle' ? order.total : 0));
      }, 0);

      e.totalCreditAmount = totalCreditAmount;
      e.totalSettleAmount = totalSettleAmount;
      e.balance = totalCreditAmount - totalSettleAmount;

      return e;
    })
  );

  res.status(200).json({
    success: true,
    data: parties,
  });
});


exports.getCreditSaleParty = catchAsyncErrors(async (req, res, next) => {
  const user = req.user._id;
  const partyId = req.params.id;

  const creditHistory = await SalesModel.find({
    party: partyId,
  });

  creditHistory.map((value, idx) => {
    if (!value.modeOfPayment[0].mode) {
      const mode = concatenateValues(value.modeOfPayment[0]);
      const amount = value.total;
      value.modeOfPayment[0] = { mode, amount };
    }
    console.log(value.modeOfPayment);
  })


  const party = await Party.findById(partyId);

  if (!party) {
    return next(new ErrorHandler("Party not found", 404));
  }

  const totalCreditAmount = creditHistory.reduce((total, order) => {
    return total + (Array.isArray(order.modeOfPayment)
      ? order.modeOfPayment.reduce((amount, obj) => {
        return amount + (obj.mode === 'Credit' ? obj.amount : 0);
      }, 0)
      : (order.modeOfPayment === 'Credit' ? order.total : 0));
  }, 0);

  const totalSettleAmount = creditHistory.reduce((total, order) => {
    return total + (Array.isArray(order.modeOfPayment)
      ? order.modeOfPayment.reduce((amount, obj) => {
        return amount + (obj.mode === 'Settle' ? obj.amount : 0);
      }, 0)
      : (order.modeOfPayment === 'Settle' ? order.total : 0));
  }, 0);

  const data = {
    ...party.toObject(),
    totalCreditAmount,
    totalSettleAmount,
    balance: totalCreditAmount - totalSettleAmount,
  };

  res.status(200).json({
    success: true,
    data: data,
  });
});
