/**
 * Module dependencies.
 */
var express = require('express')
	, mailer = require('express-mailer')
	, io = require('socket.io')
	, http = require('http')
	, twitter = require('twitter')
	, _ = require('underscore')
	, path = require('path')
	, util = require('util')
	, mongo = require('mongodb').MongoClient
	, jwt = require('jwt-simple')
	, geoip = require("geoip-lite")
	, portfolioList = [];


//Create an express app
var app = express();

mailer.extend(app, {
	from: 'site@gcardoso.pt',
	host: 'smtp.gcardoso.pt', // hostname
	secureConnection: false, // use SSL
	port: 25, // port for secure SMTP
	transportMethod: 'SMTP', // default is SMTP. Accepts anything that nodemailer accepts
	auth: {
		user: 'site@gcardoso.pt',
		pass: 'timesUP32'
	}
});

//Create the HTTP server with the express app as an argument
var server = http.createServer(app);

// Twitter symbols array
var watchSymbols = ['#gcardoso','@goncalocardo_o','#angularjs','#nodejs','#javascript','#mongodb','#html','#css','#frontend'];

//This structure will keep the total number of tweets received and a map of all the symbols and how many tweets received of that symbol
var watchList = {
	total: 0,
	symbols: {}
};

//Set the watch symbols to zero.
_.each(watchSymbols, function (v) {
	watchList.symbols[v] = 0;
});

//Generic Express setup
app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 8080);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.set('layout', 'layout');
app.set('partials', {
	header : 'includes/header',
	banner : 'pages/banner',
	me : 'pages/me',
	profile : 'pages/profile',
	skills : 'pages/skills',
	workeducation : 'pages/workeducation',
	portfolio : 'pages/portfolio',
	twitterwall : 'pages/twitterwall',
	contact : 'pages/contact',
	footer : 'includes/footer'
});
//app.enable('view cache');
app.engine('html', require('hogan-express'));
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

//We're using bower components so add it to the path to make things easier
app.use('/components', express.static(path.join(__dirname, 'components')));

//Start a Socket.IO listen
var sockets = io.listen(server);


//Set the sockets.io configuration.
//THIS IS NECESSARY ONLY FOR HEROKU!
sockets.configure(function () {
	sockets.set('transports', ['xhr-polling']);
	//sockets.set('polling duration', 3600);
});

//Instantiate the twitter component
//You will need to get your own key. Don't worry, it's free. But I cannot provide you one
//since it will instantiate a connection on my behalf and will drop all other streaming connections.
//Check out: https://dev.twitter.com/
var t = new twitter({
	consumer_key: 'XHHh0St57xEb0uZ6zlVxAzgFv',           // <--- FILL ME IN
	consumer_secret: 'qxbmnjQau0W6ofQsJeByRuIi2iGMFLW2aJMNd5aXjnTZ4Ic8tU',        // <--- FILL ME IN
	access_token_key: '93891411-DtXySlEpuTNnM09dUEjb0aHnoj6mBrXb0gPQAgz87',       // <--- FILL ME IN
	access_token_secret: 'mEegi29Ivz0eZJHDxwxURk32wMqbWf0CxgUJvBqWimf2g'     // <--- FILL ME IN
});

var arr = [];


//Tell the twitter API to filter on the watchSymbols
t.stream('statuses/filter', { track: watchSymbols }, function (stream) {

	//We have a connection. Now watch the 'data' event for incomming tweets.
	stream.on('data', function (tweet) {
		//Make sure it was a valid tweet
		if (tweet.text !== undefined) {
			sockets.sockets.emit('data', [tweet]);
		}
	});
});

var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

var mongoUrl = 'mongodb://admin:VPSH3mpQp6fH@'+process.env.OPENSHIFT_MONGODB_DB_HOST+':'+process.env.OPENSHIFT_MONGODB_DB_PORT +'/gcardoso';

var enviromnent = app.get('env');

// development only
if ('development' == enviromnent) {
	app.use(express.errorHandler());
	mongoUrl = 'mongodb://localhost:27017/gcardoso';
}


//Our only route! Render it with the current watchList
app.get('/', express.basicAuth('gcardoso89', 'timesUP32'), function (req, res) {

	var token = jwt.encode({
		ip : req.headers["x-forwarded-for"] || req.connection.remoteAddress
	}, 'timesUP32');

	var ip = geoip.lookup(req.headers["x-forwarded-for"] || req.connection.remoteAddress);

	mongo.connect(mongoUrl, function (err, db) {

		 var collection = db.collection('portfolio');
		 collection.find({}).toArray(function (err, docs) {
			 portfolioList = docs;
			 res.render('homepage', { portfolio: portfolioList, portfolioString: JSON.stringify(portfolioList), token: token, country : ip.country });
			 db.close();
		 });

	 });

});

app.post('/getFirstTweets', function(req, res){

	var token = jwt.encode({
		ip : req.headers["x-forwarded-for"] || req.connection.remoteAddress
	}, 'timesUP32');

	if (req.body.token == token){
		t.search('#gcardoso', function(data) {
			var newData = _.sortBy(data.statuses, function(o){ return new Date(o.created_at) });
			res.json({success:true, tweets: newData})
		});
	}

	else {
		res.status(403).end();
	}

});

app.get('/teste', function (req, res) {
	res.status(200).end();
});

app.post('/sendEmail', function(req, res){

	var token = jwt.encode({
		ip : req.headers["x-forwarded-for"] || req.connection.remoteAddress
	}, 'timesUP32');

	if ( req.body.token == token){

		app.mailer.send('emails/email',{
			from: 'gcardoso',
			to: 'goncalo.cb.ferreira@gmail.com', // REQUIRED. This can be a comma delimited string just like a normal email to field.
			subject: 'Portfolio', // REQUIRED.
			emailobject: req.body, // All additional properties are also passed to the template as local variables.
			layout : null
		}, function (err) {
			if (err) {
				res.status(403).end();
				return;
			}
			res.json(200, { success : true });
		});

	}

	else {
		res.status(403).end();
	}

});

// Handle 404
app.use(function(req, res) {
	res.render('error/404.html', {error: "404 error page", layout : null});
});

// Handle 500
app.use(function(error, req, res, next) {
	res.render('error/500.html', {error: "500 error page", layout : null});
});

//Create the server
server.listen(app.get('port'), server_ip_address, function () {
	console.log('Express server listening on port ' + app.get('port'));
});