var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var DeviceSchema = new Schema({
	deviceId: {type: String, required: true},
	type: {type: String, required: true},
	name: {type: String, required: true},
	batch: {type: String, required: true},
	// added not required here as it will be by mongodb
	addedBy: {type: String, required: true},
	assignedUser: { type: Schema.ObjectId, ref: "User", required: true },
	active: {type: Boolean, required: true, status: 0}, 
}, {timestamps: true});

module.exports = mongoose.model("Device", DeviceSchema);