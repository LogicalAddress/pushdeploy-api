
module.exports = function (app) {
    app.use(function (err, req, res, next) {
		if (err.code === 'EBADCSRFTOKEN'){
			 // handle CSRF token errors here
			res.status(500);
			return res.render('505', {message: 'Martian Packet!'});
		}else{
			console.log(err);
			return next(err);
		}
	});
};