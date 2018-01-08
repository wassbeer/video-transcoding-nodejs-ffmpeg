// dependencies
const express = require('express'),
	router = express.Router(),
	fs = require('fs'),
	newFile = 'video.mp4';

router.get('/', (req, res, next) => {
	if (fs.existsSync(`./${newFile}`)) { // if there is no transcoded download yet
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
	} else {
		res.render('homepage');
	}
});

module.exports = router;
