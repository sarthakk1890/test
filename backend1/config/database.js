const mongoose = require("mongoose");
require("dotenv").config();

const connectDatabase = () => {
  mongoose.set("strictQuery", false);

  mongoose
    .connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((data) => {
      console.log(`Mongodb connected with server : ${data.connection.host}`);
    });
};

module.exports = connectDatabase;