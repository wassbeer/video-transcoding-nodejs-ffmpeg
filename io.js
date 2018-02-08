const sio = require('socket.io');
let io = null;

exports.io = () => {
	return io;
};

exports.initialize = (server) => {
	io = sio(server);
	io.on('connection', (socket) => {
		console.log('socket connected');
		io.on('disconnect', () => {
			console.log('socket disconnected');
		})
	});
};
