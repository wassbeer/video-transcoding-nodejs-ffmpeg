var express = require('express');
var router = express.Router();
var request = require('request');
var progress = require('request-progress');
const ffmpeg = require('fluent-ffmpeg');
var downloadfile = "video.mkv";
var fs = require('fs');

// Get download page
router.get('/', (req, res) => { 
	// request the video for downloading
	progress(request('https://s3.eu-central-1.amazonaws.com/flipbase-coding-challenge/elysium.mkv'), {})
		// on progress return state
		.on('progress', (state) => {
			// render the state on download.jade
			console.log("Download in progress: " + state.percent + "%")
			res.render('download', { state: state.percent * 100 }, function(err, html) {
				if (err) {
					console.log(err)
				}
				res.write(html)
			});
		})
		.on('error', (err) => {
			console.log(err)
		})
		.on('end', function () {
console.log("download done!")})
.pipe(fs.createWriteStream(`${downloadfile}`));
});

module.exports = router;
