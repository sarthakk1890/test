const mongoose = require("mongoose");

const hotelSchema = mongoose.Schema({
 invoiceNum:{
    type: String
 },
 guestName:{
    type: String
 },
 numberOfGuest:{
    type: Number
 },
 address: {
    city: {
        type: String
    },
    state: {
        type: String
    },
    country: {
        type: String
    },
    streetAddress: {
        type: String
    }
},
number:{
    type:Number
},
company:{
    type: String
 },
 gst:{
    type: String
 },
 checkIn:{
    type: String
 },
 checkOut:{
    type: String
 },
 days:{
    type: Number
 },
 roomNo:{
    type: String
 },
 otherCharges:{
    type: Number
 },
 adv:{
    type: Number
 },
 roomId: [{
   type: mongoose.Schema.Types.ObjectId,
   ref: "inventory",
}],
 owner:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
 },
 invoiceDate:{
    type:String
 },
 checkOutStatus:{
    type:Boolean,
    default: true
 },
 paidAmt:{
   type:String
 }
},{
   timestamps: true

});

module.exports = mongoose.model("hotelModel", hotelSchema);


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
