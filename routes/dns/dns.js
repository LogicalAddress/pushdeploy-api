

	/*
	* NAME SERVERS with atomiadns
	*/
	
	
module.exports = function (app) {

	/*
	* All DNS Root zone (Admin)
	*/
	
	app.get('/v1/dns/zone', (req, res, next) => {
		res.status(200).json({});
	});
	
	/*
	* User Owned Root zone
	*/
	
	app.get('/v1/dns/user/zone', (req, res, next) => {
		res.status(200).json({});
	});
	
	/*
	* Create Zone
	*/
	
	app.post('/v1/dns/user/zone', (req, res, next) => {
		res.status(200).json({});
	});
	
	/*
	*  Update Zone
	*/
	
	app.put('/v1/dns/user/zone/:id', (req, res, next) => {
		res.status(200).json({});
	});
	
	
	/*
	* Delete Zone
	*/
	
	app.delete('/v1/dns/user/zone/:id', (req, res, next) => {
		res.status(200).json({});
	});
};