

// Create Token and saving in cookie

const sendToken = (user, statusCode, res) => {
  const token = user.getJWTToken();

  // options for cookie
  const options = {
    // expires: new Date(
    //   Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    // ),
    httpOnly: true,
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user,
    token,
  });
};

const sendTokenlogin = (user, statusCode, res) => {
  const token = user.getJWTToken();

  // options for cookie
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  const responseData = {
    success: true,
    user,
    token,
  };

  res.redirect('bulkupload', { data: responseData });
};

module.exports=sendTokenlogin;
module.exports = sendToken;
