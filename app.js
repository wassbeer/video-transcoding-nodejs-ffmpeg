const express = require('express'),
	path = require('path'),
	logger = require('morgan'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	request = require('request'),
	progress = require('request-progress'),
	ffmpeg = require('fluent-ffmpeg'),
	fs = require('fs'),
	port = 5000;

let app = express(),
	http = require('http'),
	server = http.createServer(app),
	io = require('socket.io').listen(server); // creates a new socket.io instance attached to the http server.

// files
videoUrl = 'http://mirrors.standaloneinstaller.com/video-sample/TRA3106.mkv',
	downloadFile = 'video.mkv',
	newFile = 'video.mp4';

const index = require('./routes/index'),
	downloadAndEncode = require('./routes/download-and-encode');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/download-and-encode', downloadAndEncode);

// catch 404 and forward to error handler
app.use((req, res, next) => {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use((err, req, res, next) => {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};
	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

io.on('connection', (socket) => { // The io.on event handler handles connection, disconnection, etc., events in it, using the socket object.
	console.log('Connected on server side: ' + socket.id);
	progress(request(videoUrl), {}) // download file
		.on('progress', (state) => { // on progress return state
			socket.emit('message', JSON.stringify({ title: 'Download in progress', progress: state.percent * 100 + "%" }));
		})
		.on('error', (err) => {
			console.log(err);
		})
		.on('end', () => {
			socket.emit('message', JSON.stringify({ title: 'Download completed', progress: "100%" }));
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
						socket.emit('message', JSON.stringify({ title: 'Encoding file', progress: progress.timemark + 'hh:mm:ss' }));
					})
					.on('error', (err) => {
						console.error(err);
					})
					.on('end', () => {
						socket.emit('message', JSON.stringify({ title: 'Encoding completed', progress: "100%" }));
					})
					.run();
			});
		})
		.pipe(fs.createWriteStream(`${downloadFile}`));
	// } else {
	// }
	socket.on('disconnect', () => {
		console.log('Socket disconnected');
	})
});


server.listen(port, (err) => {
	if (err) { console.log(err) };
	console.log('server listening on port ' + port);
});

module.exports = { app: app, newFile: newFile }
