const express = require('express'),
	router = express.Router(),
	request = require('request'),
	progress = require('request-progress'),
	downloadfile = 'video.mkv',
	fs = require('fs');

/* GET home page. */
router.get('/', (req, res, next) => {
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
		})
		.pipe(fs.createWriteStream(`${downloadfile}`));
});

module.exports = router;
