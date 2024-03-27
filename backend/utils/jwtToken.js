

// Create Token and saving in cookie

const sendToken = (user, statusCode, res, subUser = null) => {
  const token = user.getJWTToken();
  let token_subuser = null;

  // options for cookie
  const options = {
    // expires: new Date(
    //   Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    // ),
    httpOnly: true,
  };

  if (subUser) {
    token_subuser = subUser.getJWTToken();

    res.status(statusCode)
      .cookie("token", token, options)
      .cookie("token_subuser", token_subuser, options)
      .json({
        success: true,
        user: user,
        subUser: subUser,
        token: token,
        token_subuser: token_subuser
      });
  } else {
    res.status(statusCode)
      .cookie("token", token, options)
      .json({
        success: true,
        user: user,
        token: token
      });
  }
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

module.exports = sendTokenlogin;
module.exports = sendToken;