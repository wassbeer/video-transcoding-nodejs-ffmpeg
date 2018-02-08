// dependencies
const express = require('express'),
	router = express.Router(),
	fs = require('fs'),
	request = require('request'),
	progress = require('request-progress'),
	ffmpeg = require('fluent-ffmpeg'),
	socket = require('../lib/io').io(),

	// files
	videoUrl = process.argv[2],
	downloadFile = 'video.mkv',
	newFile = 'video.mp4';

// download-and-encode route
router.get('/', (req, res, next) => {
	if (fs.existsSync(`./${newFile}`)) { // if there is a transcoded download
		console.log('transcoded download existsS');
		let path = `./${newFile}`,
			stat = fs.statSync(path),
			fileSize = stat.size,
			head = {
				'Content-Length': fileSize,
				'Content-Type': 'video/mp4'
			};
		res.writeHead(200, head);
		fs.createReadStream(path).pipe(res); // Streaming video
	} else { // if there is no transcoded download yet
		res.render('homepage');
		progress(request(videoUrl), {}) // download file
			.on('progress', (state) => { // on progress return state
				socket.emit('message', JSON.stringify({ title: 'Download in progress', progress: state.percent * 100 + '%' }));
			})
			.on('error', (err) => {
				console.log(err);
			})
			.on('end', () => {
				socket.emit('message', JSON.stringify({ title: 'Download completed', progress: '100%' }));
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
							socket.emit('message', JSON.stringify({ title: 'Encoding file', progress: progress.percent + '%' }));
						})
						.on('error', (err) => {
							console.error(err);
						})
						.on('end', () => {
							socket.emit('message', JSON.stringify({ title: 'Encoding completed', progress: '100%' }));
						})
						.run();
				});
			})
			.pipe(fs.createWriteStream(`${downloadFile}`));
	}
});

// exports
module.exports = {
	router: router
};
