const Device = require("../models/DeviceModel");
const Feed = require("../models/FeedModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);


/**
 * Feed Detail.
 * 
 * @param {string}      deviceId
 * 
 * @returns {Object}
 */
exports.feedDetail = [
	auth,
	function (req, res) {
		try {
			Device.findOne({deviceId: req.params.id, assignedUser: req.user._id}).then(device => {
				if (!device) {
					return Promise.reject("Device doesn't exist");
				} else {
					Feed.findOne({userId: req.user._id, deviceId: device._id}, "userId deviceId temperature rh osVer heatingStatus createdAt").then((feed)=>{                
						if(!feed){
							return apiResponse.successResponseWithData(res, "Operation success, no feed found", {});
						}else{
							return apiResponse.successResponseWithData(res, "Operation success", feed);
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

/**
 * Feed store.
 * 
 * @param {UserObject}      userId 
 * @param {DeviceObject}      deviceId
 * @param {Number}      temperature
 * @param {Number}      rh
 * @param {string}      osVer
 * @param {Boolean}     heatingStatus
 * 
 * @returns {Object}
 */
var selectedDevice = null;
exports.feedStore = [
	auth,
	// usedId will be refered via the auth
	body("deviceId").isLength({ min: 1 }).trim().withMessage("Device Id must be specified").custom((value,{req}) => {
		return Device.findOne({deviceId: req.body.deviceId, assignedUser: req.user._id}).then(device => {
			if (!device) {
				return Promise.reject("Device doesn't exist");
			} else {
				selectedDevice = device;
			}
		});
	}),
	body("temperature").isNumeric().trim().withMessage("Temperature must be specified"),
	body("rh").isNumeric().trim().withMessage("rh must be specified"),
	body("osVer").isLength({ min: 1 }).trim().withMessage("OS version must be specified"),
	body("heatingStatus").isBoolean().withMessage("Heating Status must be specified"),

	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.ErrorResponse(res, "Device doesn't exist");
			} else {
				var feed = new Feed(
					{   userId: req.user._id,
						deviceId: selectedDevice._id,
						temperature: req.body.temperature,
						rh: req.body.rh,
						osVer: req.body.osVer,
						heatingStatus: req.body.heatingStatus
					});
                
				feed.save(function (err) {
					if (err) { return apiResponse.ErrorResponse(res, err); }
					return apiResponse.successResponseWithData(res, "Feed has been added.", feed);
				});
			}
		} catch (err) {
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Feed update.
 * 
 * @param {string}      * all fields except deviceId and userId
 * 
 * @returns {Object}
 */
exports.feedUpdate = [
	auth,
	function (req, res) {
		try {
			Device.findOne({deviceId: req.params.id, assignedUser: req.user._id}, function (err, device) {
				if(device === null){
					return apiResponse.notFoundResponse(res,"DeviceId doesn't exist");
				} else {
					//update Device.
					let feedUpdatedInfo = req.body;
					let newObject = {};
					for (let item of Object.keys(feedUpdatedInfo)) {
						newObject[item] = feedUpdatedInfo[item];
					}
					Feed.findOneAndUpdate({deviceId : device._id, userId : req.user._id}, {$set: newObject},{new:true}).then((updatedFeed)=>{
						if(updatedFeed) {
							// feed has been updated
							return apiResponse.successResponseWithData(res,"Feed Updated.", updatedFeed);
						} else {
							// unable to update feed
							return apiResponse.ErrorResponse(res, "Unable to update feed data");
						}
					}).catch((err)=>{
						console.log(err);
						return apiResponse.ErrorResponse(res, "Unable to update feed data");
					});
				}
			});
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}
];


/**
 * Device Delete.
 * 
 * @param {string}      deviceId
 * 
 * @returns {Object}
 */
exports.feedDelete = [
	auth,
	function (req, res) {
		try {
			Device.findOne({deviceId: req.params.id, assignedUser: req.user._id}, function (err, foundDevice) {
				if(foundDevice === null){
					return apiResponse.notFoundResponse(res,"Device not exists with this id");
				}else{
					//delete device.
					Feed.findOneAndRemove({deviceId : foundDevice._id, userId : req.user._id},function (err) {
						if (err) { 
							return apiResponse.ErrorResponse(res, err); 
						}else{
							return apiResponse.successResponse(res,"Feed has been deleted.");
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