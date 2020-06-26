const Device = require("../models/DeviceModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);



/**
 * Device List.
 * 
 * @returns {Object}
 */
exports.deviceList = [
	auth,
	function (req, res) {
		try {
			Device.find({assignedUser: req.user._id},"deviceId type name batch addedBy assignedUser active createdAt").then((devices)=>{
				if(devices.length > 0){
					return apiResponse.successResponseWithData(res, "Operation success", devices);
				}else{
					return apiResponse.successResponseWithData(res, "Operation success", []);
				}
			});
		} catch (err) {
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Device store.
 * 
 * @param {string}      deviceId 
 * @param {string}      type
 * @param {string}      name
 * @param {string}      batch
 * @param {string}      addedBy
 * @param {UserObject}  assignedUser
 * @param {Boolean}     active
 * 
 * @returns {Object}
 */

exports.deviceStore = [
	auth,
	body("deviceId").isLength({ min: 1 }).trim().withMessage("Device Id must be specified").custom((value,{req}) => {
		return Device.findOne({deviceId: req.body.deviceId}).then(device => {
			if (device) {
				return Promise.reject("Device already exist");
			}
		});
	}),
	body("type").isLength({ min: 1 }).trim().withMessage("Type must be specified"),
	body("name").isLength({ min: 1 }).trim().withMessage("Name must be specified"),
	body("batch").isLength({ min: 1 }).trim().withMessage("Batch must be specified"),
	body("addedBy").isLength({ min: 1 }).trim().withMessage("User that added this device must be specified"),
	body("active", "State must not be empty.").isBoolean().trim(),

	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			var device = new Device(
				{ deviceId: req.body.deviceId,
					type: req.body.type,
					name: req.body.name,
					batch: req.body.batch,
					addedBy: req.body.addedBy,
					active: req.body.active,
					assignedUser: req.user._id
				});
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				//Save device.
				device.save(function (err) {
					if (err) { return apiResponse.ErrorResponse(res, err); }
					// let deviceData = new DeviceData(device);
					return apiResponse.successResponseWithData(res,"Device has been added.", device);
				});
			}
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Device Detail.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */
exports.deviceDetail = [
	auth,
	function (req, res) {
		try {
			Device.findOne({deviceId: req.params.id, assignedUser: req.user._id},"deviceId type name batch addedBy assignedUser active createdAt").then((device)=>{                
				if(device !== null){
					return apiResponse.successResponseWithData(res, "Operation success", device);
				}else{
					return apiResponse.successResponseWithData(res, "Operation success, no device found", {});
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Device update.
 * 
 * @param {string}      title 
 * @param {string}      description
 * @param {string}      isbn
 * 
 * @returns {Object}
 */
exports.deviceUpdate = [
	auth,
	function (req, res) {
		try {
			Device.findOne({deviceId: req.params.id, assignedUser: req.user._id}, function (err, device) {
				if(device === null){
					return apiResponse.notFoundResponse(res,"Device not exists with this id");
				} else {
					//update Device.
					let deviceUpdatedInfo = req.body;
					let newObject = {};
					for (let item of Object.keys(deviceUpdatedInfo)) {
						newObject[item] = deviceUpdatedInfo[item];
					}
					Device.findOneAndUpdate({_id : device._id}, {$set: newObject},{new:true}).then((updatedDevice)=>{
						if(updatedDevice) {
							// device record has been updated
							return apiResponse.successResponseWithData(res,"Device Updated.", updatedDevice);
						} else {
							// unable to update device record
							return apiResponse.ErrorResponse(res, "Unable to update user data");
						}
					}).catch((err)=>{
						console.log(err);
						return apiResponse.ErrorResponse(res, "Unable to update user data");
					});
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Device Delete.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */
exports.deviceDelete = [
	auth,
	function (req, res) {
		
		try {
			Device.findOne({deviceId: req.params.id, assignedUser: req.user._id}, function (err, foundDevice) {
				if(foundDevice === null){
					return apiResponse.notFoundResponse(res,"Device not exists with this id");
				}else{
					//delete device.
					Device.findOneAndRemove({_id : foundDevice._id},function (err) {
						if (err) { 
							return apiResponse.ErrorResponse(res, err); 
						}else{
							return apiResponse.successResponse(res,"Device has been deleted.");
						}
					});
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];