var express = require("express");
const FeedController = require("../controllers/FeedController");

var router = express.Router();

router.get("/:id", FeedController.feedDetail);
router.post("/", FeedController.feedStore);
router.put("/:id", FeedController.feedUpdate);
router.delete("/:id", FeedController.feedDelete);

module.exports = router;