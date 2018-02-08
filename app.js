// dependencies
const express = require('express'),
	path = require('path'),
	logger = require('morgan'),
	port = 5000,

	// app & server
	app = express(),
	http = require('http'),
	server = http.createServer(app),
	io = require('./lib/io').initialize(server),

	// importing router
	index = require('./routes/index'),
	downloadAndEncode = require('./routes/download-and-encode').router;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// middleware setup
app.use(logger('dev'));

// routes configuration
app.use('/', index);
app.use('/download-and-encode', downloadAndEncode);

// server configuration
server.listen(port, (err) => {
	err ? console.error(err) :
		console.log('server listening on port ' + port);
});
