var express = require('express');
var router = express.Router();
var request = require('request');
var progress = require('request-progress');
const ffmpeg = require('fluent-ffmpeg');
var downloadfile = "video.mkv";
var newfile = "video.mp4"
var fs = require('fs');

// Get homepage
router.get('/', (req, res) => {
	// read and transcode the downloaded file
	fs.readFile(`${downloadfile}`, (err, data) => {
		if (err) {
			throw err
		}
		if (!process.env.FFMPEG_PATH)
			throw new Error('Whoops! You need to send the FFMPEG_PATH environment ' +
				'variable before you run this test');

		ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);

		// Transcoding MP4 to WEBM
		ffmpeg(`./${downloadfile}`)
	  .outputOptions([
    '-acodec libmp3lame',
    '-vcodec libx264',
    '-preset slow',
    '-profile:v baseline',
    '-level 3.0',
    '-pix_fmt yuv420p',
    '-movflags +faststart'
  ])
			.output(`${newfile}`)
			.on('start', () => {
				console.log('Relax! FFMPEG is doing all the hard work')
			})
			// render progress of transcoding
			.on('progress', (progress) => {
				console.log("Transcoding progress: " + progress.timemark)
				res.render('transcode', { state: progress.timemark }, function(err, html) {
					if (err) {
						console.log(err)
					}
					res.write(html)
				});
			})
			.on('error', (err) => {
				console.error(err)
			})
			.on('end', () => {
				// render the completed state of transcoding
				res.render('transcode', { state: "completed" }, function(err, html) {
					if (err) {
						console.log(err)
					}
					res.write(html)
				});
				if (fs.existsSync(`./${newfile}`)) {
					console.log('Yeah! You are good to go!')
				}
				res.end()
				console.error('Whoopsie daisies; please check if you 1) downloaded FFMPEG ' +
					'to your computer and 2) if the FFMPEG_PATH is set accordingly.')
			})
			.run();
	});
});
// .pipe(fs.createWriteStream(`${downloadfile}`));

module.exports = router;
