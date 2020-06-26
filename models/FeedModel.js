var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var FeedSchema = new mongoose.Schema({
	userId: { type: Schema.ObjectId, ref: "User", required: true },
	deviceId: { type: Schema.ObjectId, ref: "Device", required: true },
	temperature: {type: Number, required: true},
	rh: {type: Number, required: true},
	osVer: {type: String, required: true},
	heatingStatus: {type: Boolean, required: true, status: 0},

}, {timestamps: true});

module.exports = mongoose.model("Feed", FeedSchema);