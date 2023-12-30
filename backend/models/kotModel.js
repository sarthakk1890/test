const mongoose = require("mongoose");

const kotSchema = mongoose.Schema({
 item:{
    type:String
 },
 date:{
    type:String
 },
 qty:{
    type:Number
 },
 user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
 }
});

module.exports = mongoose.model("kotModel", kotSchema);


// sample data
// {
//     "invoiceNum":"B257",
//     "guestName":"Raj",
//     "nuberOfGuest":2,
//     "address":{
//         "city":"Mandla",
//         "state":"MP",
//         "country": "INDIA",
//         "streetAddress":"Mandla"
//     },
//     "number":700061754,
//     "company":"MagicStep Solution",
//     "gst":"BI7987985",
//     "checkIn":"08/08/2023",
//     "checkOut":"10/08/2023",
//     "days":2,
//     "roomNo":"102A",
//     "otherCharges":50,
//     "adv":500,
//     "dis":200
// }
