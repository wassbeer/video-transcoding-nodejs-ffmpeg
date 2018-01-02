// dependencies
const express = require('express'),
	router = express.Router(),
	request = require('request'),
	progress = require('request-progress'),
	ffmpeg = require('fluent-ffmpeg'),
	fs = require('fs'),

	// files
	videoUrl = 'http://mirrors.standaloneinstaller.com/video-sample/small.mkv',
	downloadFile = 'video.mkv',
	newFile = 'video.mp4';

// GET download-and-encode
router.get('/', (req, res, next) => {
	// if there is no transcoded download yet
	if (!fs.existsSync(`./${downloadFile}`)) {
		// download file
		progress(request(videoUrl), {})
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
				fs.readFile(`${downloadFile}`, (err, data) => {
					if (err) {
						throw err;
					}
					if (!process.env.FFMPEG_PATH) {
						throw new Error('Whoops! You need to send the FFMPEG_PATH environment ' +
							'variable before you run this test');
					}

					ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);

					// Transcoding MKV to MP4
					ffmpeg(`./${downloadFile}`)
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
							res.render('transcode', { state: 'completed, please refresh the page' }, (err, html) => {
								if (err) {
									console.log(err);
								}
								res.write(html);
							});
							res.end();
							// res.redirect('/');
							console.error('Whoopsie daisies; please check if you 1) downloaded FFMPEG ' +
								'to your computer and 2) if the FFMPEG_PATH is set accordingly.');
						})
						.run();
				});
			})
			.pipe(fs.createWriteStream(`${downloadFile}`));
	} else {
		console.log('about to render video');
		// Rendering video
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
			fs.createReadStream(path).pipe(res);
		}
	}
});

module.exports = router;
