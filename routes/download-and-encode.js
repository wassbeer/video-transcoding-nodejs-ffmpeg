// dependencies
const express = require('express'),
	router = express.Router(),
	request = require('request'),
	progress = require('request-progress'),
	ffmpeg = require('fluent-ffmpeg'),
	fs = require('fs'),

	// files
	videoUrl = 'https://s3.eu-central-1.amazonaws.com/flipbase-coding-challenge/elysium.mkv',
	downloadFile = 'video.mkv',
	newFile = 'video.mp4';

// GET download-and-encode
router.get('/', (req, res, next) => { // GET download-and-encode
	if (!fs.existsSync(`./${newFile}`)) { // if there is no transcoded download yet
		progress(request(videoUrl), {}) // download file
			.on('progress', (state) => { // on progress return state
				res.render('download', { state: state.percent * 100 }, (err, html) => { // render the state on download.jade
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
				res.render('download', { state: 'download completed' }, (err, html) => { // notify user on download completion
					if (err) {
						console.log(err);
					}
					res.write(html);
				});
				fs.readFile(`${downloadFile}`, (err, data) => { // read and transcode the downloaded file
					if (err) {
						throw err;
					}
					if (!process.env.FFMPEG_PATH) {
						throw new Error('Whoops! You need to send the FFMPEG_PATH environment ' +
							'variable before you run this test');
					}

					ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);

					ffmpeg(`./${downloadFile}`) // Transcoding MKV to MP4
						.outputOptions([
							'-acodec libmp3lame',
							'-vcodec libx264',
							'-preset slow',
							'-profile:v baseline',
							'-level 3.0',
							'-pix_fmt yuv420p',
							'-movflags +faststart'
						])
						.output(`${newFile}`)
						.on('start', () => {
							console.log('Relax! FFMPEG is doing all the hard work');
						})
						.on('progress', (progress) => { // on progress return progress
							res.render('transcode', { state: progress.timemark }, (err, html) => { // render progress of transcoding
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
							res.render('transcode', { state: 'completed, please refresh the page' }, (err, html) => { // render the completed state of transcoding
								if (err) {
									console.log(err);
								}
								res.write(html);
								return res.end();
							});
						})
						.run();
				});
			})
			.pipe(fs.createWriteStream(`${downloadFile}`));
	} else {
		let path = `./${newFile}`,
			stat = fs.statSync(path),
			fileSize = stat.size,
			range = req.headers.range;
		if (range) {
			let parts = range.replace(/bytes=/, '').split('-'),
				start = parseInt(parts[0], 10),
				end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1,
				chunksize = (end - start) + 1,
				file = fs.createReadStream(path, { start, end }),
				head = {
					'Content-Range': `bytes ${start}-${end}/${fileSize}`,
					'Accept-Ranges': 'bytes',
					'Content-Length': chunksize,
					'Content-Type': 'video/mp4'
				};
			res.writeHead(206, head);
			file.pipe(res);
		} else {
			let head = {
				'Content-Length': fileSize,
				'Content-Type': 'video/mp4'
			};
			res.writeHead(200, head);
			fs.createReadStream(path).pipe(res); // Streaming video
		}
	}
});

module.exports = router;
