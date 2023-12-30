const express = require("express");
const {
  getAllUserDetails,
  getSingleUserDetail,
} = require("../controllers/adminController");
const {
  registerConsumer,
  loginConsumer,
  consumerLogout,
  getContactNumber,
  getSellersAndSearch,
  getSellers,
  getProductsOfUser,
  getSellersByName,
  getProductNamesandSearch,
  addClick,
  addClickProduct,
  addClickSeller,
  getTopClickedProducts,
  getTopClickedSellers,
  getConsumerDetails,
  updateConsumerDetails,
  addToCart,
  searchLocation,
  searchProduct,
  filterProduct,
  viewAll,
  policyPage,
  showCart,
  placeOrder,
  recentOrders,
  viewShop,
  removeItem,
  rating,
  addAddress,
  deleteAccountPage,
} = require("../controllers/consumerController");
const {
  getAllInventoriesAndSearch,
  getInventoryDetails,
  getAllInventorieswithSearch,
} = require("../controllers/inventoryController");
const { isAuthenticatedConsumer } = require("../middleware/auth");

const router = express.Router();

router.route("/register").post(registerConsumer);

router.route("/login").post(loginConsumer);

router.route("/logout").get(consumerLogout);

router.route("/detail/:id").get(isAuthenticatedConsumer, getConsumerDetails);

router.route("/upd/:id").put(isAuthenticatedConsumer, updateConsumerDetails);

router.route("/sellers/all").get(isAuthenticatedConsumer, getAllUserDetails);

router.route("/seller/:id").get(isAuthenticatedConsumer, getSingleUserDetail);

router.route("/product/:id").get(isAuthenticatedConsumer, getInventoryDetails);

router
  .route("/products/all")
  .get(isAuthenticatedConsumer, getAllInventorieswithSearch);

router
  .route("/sellercontact/:id")
  .get(isAuthenticatedConsumer, getContactNumber);

router
  .route("/getSellersAndSearch")
  .get(isAuthenticatedConsumer, getSellersAndSearch);

router.route("/sellers").get(isAuthenticatedConsumer, getSellers);

router
  .route("/sellerProduct/:id")
  .get(isAuthenticatedConsumer, getProductsOfUser);

router.route("/sellers/search").get(isAuthenticatedConsumer, getSellersByName);

router
  .route("/productname/search")
  .get(isAuthenticatedConsumer, getProductNamesandSearch);

router
  .route("/product/click/:id")
  .get(isAuthenticatedConsumer, addClickProduct);

router.route("/seller/click/:id").get(isAuthenticatedConsumer, addClickSeller);

router
  .route("/products/popular")
  .get(isAuthenticatedConsumer, getTopClickedProducts);

router
  .route("/popular/seller")
  .get(isAuthenticatedConsumer, getTopClickedSellers);

router
  .route("/popular/seller")
  .get(isAuthenticatedConsumer, getTopClickedSellers);

router
  .route("/cart/add/product/:productId")
  .post(isAuthenticatedConsumer, addToCart);

router
  .route("/cart/delete/:productId")
  .get(isAuthenticatedConsumer, removeItem);

router.route("/showcart").get(isAuthenticatedConsumer, showCart);

// search Location Todo add Auth middleware later
router.route("/search/location").post(searchLocation);

// search Location Todo add Auth middleware later
router.route("/search/location/viewall/:location").get(viewAll);

// Search Product Todo add Auth middleware later

// todo edit search route with city
router.route("/search/product/:location").post(searchProduct);

router
  .route("/category/:productCategory/location/:location")
  .get(filterProduct);

router.route("/view/viewshop/:shopId").get(viewShop);

router.route("/order/placeorder").post(isAuthenticatedConsumer, placeOrder);

router.route("/orders/history").get(isAuthenticatedConsumer, recentOrders);

router.route("/add/address").post(isAuthenticatedConsumer, addAddress);

router.route("/delete").get(deleteAccountPage);
router.route("/rate/:productId").post(isAuthenticatedConsumer, rating);

router.route("/policy").get(policyPage);
module.exports = router;
const { getAllProductsFromSeller } = require('../controllers/consumerController');

router.route('/seller/:sellerName/products').get(getAllProductsFromSeller);
