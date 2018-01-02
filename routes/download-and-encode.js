// dependencies
const express = require('express'),
	router = express.Router(),
	request = require('request'),
	progress = require('request-progress'),
	ffmpeg = require('fluent-ffmpeg'),
	fs = require('fs'),

	// files
	downloadfile = 'video.mkv',
	newfile = 'video.mp4';

// GET download-and-encode
router.get('/', (req, res, next) => {
	// download video
	progress(request('https://s3.eu-central-1.amazonaws.com/flipbase-coding-challenge/elysium.mkv'), {})
		// on progress return state
		.on('progress', (state) => {
			// render the state on download.jade
			console.log('Download in progress: ' + state.percent * 100 + '%');
			res.render('download', { state: state.percent * 100 }, (err, html) => {
				if (err) {
					console.log(err);
				}
				res.write(html);
			});
		})
		.on('error', (err) => {
			console.log(err);
		})
		.on('end', () => {
			console.log('download done!');
			// notify user on download completion
			res.render('download', { state: 'download completed' }, (err, html) => {
				if (err) {
					console.log(err);
				}
				res.write(html);
			});
			// read and transcode the downloaded file
			fs.readFile(`${downloadfile}`, (err, data) => {
				if (err) {
					throw err;
				}
				if (!process.env.FFMPEG_PATH) {
					throw new Error('Whoops! You need to send the FFMPEG_PATH environment ' +
						'variable before you run this test');
				}

				ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);

				// Transcoding MKV to MP4
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
						console.log('Relax! FFMPEG is doing all the hard work');
					})
					// render progress of transcoding
					.on('progress', (progress) => {
						console.log('Transcoding progress: ' + progress.timemark);
						res.render('transcode', { state: progress.timemark }, (err, html) => {
							if (err) {
								console.log(err);
							}
							res.write(html);
						});
					})
					.on('error', (err) => {
						console.error(err);
					})
					.on('end', () => {
						// render the completed state of transcoding
						res.render('transcode', { state: 'completed' }, (err, html) => {
							if (err) {
								console.log(err);
							}
							res.write(html);
						});
						if (fs.existsSync(`./${newfile}`)) {
							return console.log('Yeah! You are good to go!');
						}
						res.end();
						console.error('Whoopsie daisies; please check if you 1) downloaded FFMPEG ' +
							'to your computer and 2) if the FFMPEG_PATH is set accordingly.');
					})
					.run();
			});
		})
		.pipe(fs.createWriteStream(`${downloadfile}`));
});

module.exports = router;
