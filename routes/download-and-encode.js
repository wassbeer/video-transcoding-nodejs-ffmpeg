const express = require('express'),
	router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
	res.send("GET '/download-and-encode' working");
});

module.exports = router;
