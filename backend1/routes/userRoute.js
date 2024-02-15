const express = require("express");
const moment = require('moment-timezone');
const {
  registerUser,
  loginUser,
  logout,
  getUserDetails,
  updatePassword,
  updateProfile,
  sendOtp,
  verifyOtp,
  signUpWithPhoneNumber,
  resetPassword,
  getUpi,
  updateUpi,
  uploadData,
  renderRegister,
  paymentMode,
  changeStatus,
  collect,
  webLogin,
  renderWebLogin,
  renderBulkupload,
  acceptAll,
  orderStatus,
  acceptOrder,
  rejectStatus,
  rejectAll,
  openCloseShop,
  changeTiming,
  orderData,
  avgRating,
  addDiscount,
  genratePin,
  verifyPin,
  editPin,
  deletePin,
  getPinStatus,
  addGuest,
  hotelbill,
  reports,
  kotaGet,
  kotPush,
  kotaGetAll,
  getReport
} = require("../controllers/userController");
const cntlr = require("../controllers/userController");
const { isAuthenticatedUser, isSubscribed } = require("../middleware/auth");
//
const router = express.Router();

router.route("/registration").post(registerUser);

router.route("/login").post(loginUser);

router.route("/logout").get(logout);

router.route("/me").get(isAuthenticatedUser, getUserDetails);

router.route("/get-token").get(cntlr.refreshJwtToken);

router.route("/password/update").put(isAuthenticatedUser, updatePassword);

router.route("/me/update").put(isAuthenticatedUser, updateProfile);

router.route("/signup/verifyotp").post(verifyOtp);

router.route("/signup/otp").post(signUpWithPhoneNumber);

router.route("/password/reset").put(resetPassword);

router.route("/getupi/:userId").get(getUpi);

router.route("/upi/updateupi").put(isAuthenticatedUser, updateUpi);

router.route("/registerpage").get(renderRegister);

// router.route("/collect").post(collect);

router.route("/renderweblogin").get(renderWebLogin);

router.route("/weblogin").post(webLogin);

router.route("/renderbnulk").get(renderBulkupload);

router.route("/myorders").get(isAuthenticatedUser, orderStatus);

// router.route('/myorders').get(isAuthenticatedUser,orderStatus)

// router.route('/myorders/accept/:productId').get(isAuthenticatedUser,acceptOrder)

// router.route('/myorders/reject/:productId').get(rejectStatus)

router.route("/myorders/acceptall/:orderId").get(acceptAll);

router.route("/myorders/rejectall/:orderId").get(rejectAll);

const multer = require("multer");

router.route("/shop-time").post(isAuthenticatedUser, changeTiming);

router.route("/update/order/:orderId/:status").get(changeStatus);

router.route("/change/shop-status").get(isAuthenticatedUser, openCloseShop);

router.route("/order/details/:orderId").get(orderData);

router.route("/rating/:productId").get(avgRating);
router.route("/discount/add/:userId").post(addDiscount)

router.route("/getpin").post(isAuthenticatedUser,genratePin)
router.route('/deletepin').post(isAuthenticatedUser,deletePin)

router.route('/verifypin').post(isAuthenticatedUser,verifyPin)

router.route("/editpin").post(isAuthenticatedUser, editPin)

router.route("/pinstatus").get(isAuthenticatedUser,getPinStatus)



router.route("/hoteldata").post(isAuthenticatedUser,addGuest)

router.route("/hotelbill/:id").get(isAuthenticatedUser,hotelbill)

router.route("/reports/:id").get(isAuthenticatedUser,reports)

// router.route('/get-report').post(isAuthenticatedUser,getReport)


router.route('/kot/push').post(isAuthenticatedUser, kotPush)

router.route('/kot/get/:kotId').get(isAuthenticatedUser, kotaGet)

router.route('/kot/get').get(isAuthenticatedUser, kotaGetAll)





//multerconnection
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

router
  .route("/upload")
  .post(isAuthenticatedUser, upload.single("file"), uploadData);

module.exports = router;
router.route("/payment-status/:orderId/:status").get(paymentMode)


router.route("/test").get(async(req,res)=>{
 
const indiaTime = moment.tz('Asia/Kolkata');

// Get the current date and time in the India timezone
const currentDateTimeInIndia = indiaTime.format('YYYY-MM-DD HH:mm:ss');
res.send(currentDateTimeInIndia);
})


