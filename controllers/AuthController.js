const UserModel = require("../models/UserModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");

//helper file to prepare responses.
const apiResponse = require("../helpers/apiResponse");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/**
 * User registration.
 *
 * @param {string}      userId
 * @param {string}      email
 * @param {string}      firstName
 * @param {string}      lastName
 * @param {string}      city
 * @param {string}      country
 * @param {string}      phone
 * @param {string}      password
 * @param {Date}      	lastLogin
 * @param {string}      lastSeenIp
 *
 * @returns {Object}
 */
exports.register = [
	// Validate fields.
	body("userId").isLength({ min: 1 }).trim().withMessage("UserId must be specified.")
		.isAlphanumeric().withMessage("UserId has non-alphanumeric characters.").custom((value) => {
			return UserModel.findOne({userId : value}).then((user) => {
				if (user) {
					return Promise.reject("UserId already in use");
				}
			});
		}),
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
		.isEmail().withMessage("Email must be a valid email address.").custom((value) => {
			return UserModel.findOne({email : value}).then((user) => {
				if (user) {
					return Promise.reject("E-mail already in use");
				}
			});
		}),
	body("firstName").isLength({ min: 1 }).trim().withMessage("First name must be specified.")
		.isAlphanumeric().withMessage("First name has non-alphanumeric characters."),
	body("lastName").isLength({ min: 1 }).trim().withMessage("Last name must be specified.")
		.isAlphanumeric().withMessage("Last name has non-alphanumeric characters."),
	body("city").isLength({ min: 1 }).trim().withMessage("City must be specified.")
		.isAlphanumeric().withMessage("City has non-alphanumeric characters."),
	body("country").isLength({ min: 1 }).trim().withMessage("Country must be specified.")
		.isAlphanumeric().withMessage("Country has non-alphanumeric characters."),
	body("phone").isLength({ min: 1 }).trim().withMessage("phone number must be speicified")
		.isMobilePhone().withMessage("Phone number is not valid"),
	// lastLogin: it will be extracted form the request
	// lastSeenIp: it will be extracted from the request
	body("password").isLength({ min: 8 }).trim().withMessage("Password must be 8 characters or greater."),

	// Sanitize fields.
	sanitizeBody("userId").escape(),
	sanitizeBody("email").escape(),
	sanitizeBody("firstName").escape(),
	sanitizeBody("lastName").escape(),
	sanitizeBody("city").escape(),
	sanitizeBody("country").escape(),
	sanitizeBody("phone").escape(),
	sanitizeBody("password").escape(),
	// Process request after validation and sanitization.
	(req, res) => {
		
		body();
		try {
			// Extract the validation errors from a request.
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Display sanitized values/errors messages.
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {
				//hash input password
				bcrypt.hash(req.body.password,10,function(err, hash) {
					// Create User object with escaped and trimmed data
					var user = new UserModel(
						{
							userId: req.body.userId,
							email: req.body.email,
							firstName: req.body.firstName,
							lastName: req.body.lastName,
							city: req.body.city,
							country: req.body.country,
							phone: req.body.phone,
							password: hash,
							lastSeenIp: req.connection.remoteAddress			}
					);

					user.save(function (err) {
						if (err) { return apiResponse.ErrorResponse(res, err); }
						let userData = {
							_id: user._id,
							userId: user.userId,
							email: user.email,
							firstName: user.firstName,
							lastName: user.lastName,
							city: user.city,
							country: user.country,
							phone: user.phone,
							lastSeenIp: user.lastSeenIp
						};
						return apiResponse.successResponseWithData(res,"Registration Success.", userData);
					});
				});
			}
		} catch (err) {
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, err);
		}
	}];

/**
 * User login.
 *
 * @param {string}      email
 * @param {string}      password
 *
 * @returns {Object}
 */
exports.login = [
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
		.isEmail().withMessage("Email must be a valid email address."),
	body("password").isLength({ min: 1 }).trim().withMessage("Password must be specified."),
	
	// Sanitize fields.
	sanitizeBody("email").escape(),
	sanitizeBody("password").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {
				UserModel.findOne({email : req.body.email}).then(user => {
					if (user) {
						//Compare given password with db's hash.
						bcrypt.compare(req.body.password,user.password,function (err,same) {
							if(same){
								let userData = {
									_id: user._id,
									userId: user.userId,
									firstName: user.firstName,
									lastName: user.lastName,
									email: user.email,
								};
								//Prepare JWT token for authentication
								const jwtPayload = userData;
								const jwtData = {
									expiresIn: process.env.JWT_TIMEOUT_DURATION,
								};
								const secret = process.env.JWT_SECRET;
								//Generated JWT token with Payload and secret.
								userData.token = jwt.sign(jwtPayload, secret, jwtData);
								try {
									UserModel.findOneAndUpdate({_id: user._id},{$set:{lastSeenIp: req.connection.remoteAddress, 
										lastLogin: new Date()}},{new:true}).then((userToUpdate)=>{
										if(userToUpdate) {
											// user records has been updated
											return apiResponse.successResponseWithData(res,"Login Success.", userData);
										} else {
											// unable to update user
											return apiResponse.ErrorResponse(res, "Unable to retrive user object");
										}
									}).catch((err)=>{
										console.log(err);
										return apiResponse.ErrorResponse(res, "Error while updating user information");
									});
								} catch (err) {
									console.log(err);
									return apiResponse.ErrorResponse(res, "Unable to process the update use information");
								}
							} 
							else {
								return apiResponse.unauthorizedResponse(res, "Email or Password wrong.");
							}
						});
					}else{
						return apiResponse.unauthorizedResponse(res, "Email or Password wrong.");
					}
				});
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}];