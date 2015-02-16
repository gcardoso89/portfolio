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
	, Slack = require("node-slack")
	, portfolioList = [];



/**
 * ---------------
 * ----- APP -----
 * ---------------
 * */
//Create an express app!
var app = express();

//Create the HTTP server with the express app as an argument
var server = http.createServer(app);

//Generic Express setup
app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 8083);
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
app.use(express.compress());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

//We're using bower components so add it to the path to make things easier
app.use('/components', express.static(path.join(__dirname, 'components')));

var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || 'localhost';

/**
 * --------------------
 * ----- MONGO DB -----
 * --------------------
 * */

var mongoUrl = 'mongodb://admin:' + process.env.GCARDOSO_MONGODB_PASSWORD + '@' + process.env.OPENSHIFT_MONGODB_DB_HOST+':'+ process.env.OPENSHIFT_MONGODB_DB_PORT +'/gcardoso';

var enviromnent = app.get('env');
var production = (enviromnent != 'development');

// development only
if (enviromnent == 'development') {
	app.use(express.errorHandler());
	mongoUrl = 'mongodb://localhost:27017/gcardoso';
	require("./gcardoso/env-variables")();
}


/**
 * -----------------------------
 * ----- SLACK INTEGRATION -----
 * -----------------------------
 * */

var slack = new Slack('gcardoso', process.env.GCARDOSO_INWEBOOK_TOKEN);




/**
 * ------------------------
 * ----- TWITTER WALL -----
 * ------------------------
 * */
// Twitter symbols array
var watchSymbols = ['#gcardoso','@goncalocardo_o','#angularjs','#nodejs','#javascript','#mongodb','#html','#css','#frontend'];
//var watchSymbols = ['#gcardoso','@goncalocardo_o'];
//This structure will keep the total number of tweets received and a map of all the symbols and how many tweets received of that symbol
var watchList = {
	total: 0,
	symbols: {}
};
//Set the watch symbols to zero.
_.each(watchSymbols, function (v) {
	watchList.symbols[v] = 0;
});

var t = new twitter({
	consumer_key: process.env.TWITTER_CONSUMER_KEY,
	consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
	access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
	access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

var arr = [];

function processTweetData(tweets){

	var newArr = [];

	for (var i = 0; i < tweets.length; i++) {

		var data = tweets[i];

		if(data.user.screen_name == "seedupio") continue;

		newArr.push({

			name : data.user.name,
			username : '@' + data.user.screen_name,
			image : data.user.profile_image_url.replace("_normal", "_bigger"),
			text : data.text,
			imageVisible : true,
			created_at : new Date(data.created_at).getTime(),
			date : data.created_at,
			tweeturl : 'http://www.twitter.com/' + data.user.screen_name + '/status/' + data.id_str

		});

	}

	return newArr;

}



//Tell the twitter API to filter on the watchSymbols
t.stream('statuses/filter', { track: watchSymbols }, function (stream) {

	//We have a connection. Now watch the 'data' event for incomming tweets.
	stream.on('data', function (data) {

		//Make sure it was a valid tweet
		if (data.text !== undefined) {
			sockets.sockets.emit('data', processTweetData([data]));
		}
	});

	stream.on('error', function(error) {
		console.log(error);
	});

});

//Start a Socket.IO listen
var sockets = io.listen(server);
sockets.configure(function () {
	sockets.set('transports', ['xhr-polling']);
	//sockets.set('polling duration', 3600);
});

sockets.on('disconnect', function(){
	slack.send({
		text: "@gcardoso Os sockets estão em baixo. Reconnectar pff",
		channel: '#gcardoso-portfolio',
		username: 'Portfolio',
		link_names: 1
	});
});



/**
 * -----------------------------
 * ----- EMAIL INTEGRATION -----
 * -----------------------------
 * */

mailer.extend(app, {
	from: 'portfolio@gcardoso.pt',
	host: 'smtp.gcardoso.pt', // hostname
	secureConnection: false, // use SSL
	port: 25, // port for secure SMTP
	transportMethod: 'SMTP', // default is SMTP. Accepts anything that nodemailer accepts
	auth: {
		user: 'portfolio@gcardoso.pt',
		pass: process.env.GCARDOSO_EMAIL_PASSWORD
	}
});





/**
 * --------------------
 * ----- ROUTES -------
 * --------------------
 * */


var isOffline = false;

/*-- Redirect --*/
app.all(/.*/, function(req, res, next) {
	var host = req.header("host");
	if (host.match(/^www\..*/i)) {
		next();
	} else {
		res.redirect(301, "http://www." + host);
	}
});

//Our only route! Render it with the current watchList
app.get('/', function (req, res) {

	if ( isOffline ) {
		res.status(200);
		res.render('error.html', {error: "500", layout : null, production : production});
		res.end();
		return true;
	}

	var token = jwt.encode({
		ip : req.headers["x-forwarded-for"] || req.connection.remoteAddress
	}, process.env.GCARDOSO_EMAIL_PASSWORD);

	var ip = geoip.lookup(req.headers["x-forwarded-for"] || req.connection.remoteAddress);

	mongo.connect(mongoUrl, function (err, db) {
		if (err!=null ) {
			if ( enviromnent != 'development' ){
				slack.send({
					text: "@gcardoso Erro no acesso à BD - " + err,
					channel: '#gcardoso-portfolio',
					username: 'Portfolio',
					link_names: 1
				});
			}
			res.render('homepage', { portfolio: [], portfolioString: JSON.stringify([]), token: token, country : (ip != null ) ? ip.country : "No country", production : production });
			return false;
		}
		 var collection = db.collection('portfolio');
		 collection.find({}).toArray(function (err, docs) {
			 portfolioList = docs.reverse();
			 res.render('homepage', { portfolio: portfolioList, portfolioString: JSON.stringify(portfolioList), token: token, country : (ip != null ) ? ip.country : "No country", production : production });
			 db.close();
		 });

	 });

});

app.post('/getFirstTweets', function(req, res){

	var token = jwt.encode({
		ip : req.headers["x-forwarded-for"] || req.connection.remoteAddress
	}, process.env.GCARDOSO_EMAIL_PASSWORD);

	if (req.body.token == token){
		t.search('#gcardoso', function(data) {
			var newData = _.sortBy(data.statuses, function(o){ return new Date(o.created_at) });
			res.json({success:true, tweets: processTweetData(newData) });
		});
	}

	else {
		res.status(403).end();
	}

});

app.post('/sendEmail', function(req, res){

	var token = jwt.encode({
		ip : req.headers["x-forwarded-for"] || req.connection.remoteAddress
	}, process.env.GCARDOSO_EMAIL_PASSWORD);

	if ( req.body.token == token){

		slack.send({
			text: "@gcardoso " + req.body.name + " (" + req.body.email + ") enviou email com o seguinte texto: " + req.body.message,
			channel: '#gcardoso-portfolio',
			username: 'Portfolio',
			link_names: 1
		});

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

app.post('/outwebook', function(req, res){

	if (req.body.token == process.env.GCARDOSO_OUTWEBOOK_TOKEN){

		switch ( req.body.trigger_word.toLocaleLowerCase() ){

			case 'socket':
				switch (req.body.text.toLocaleLowerCase()){
					case 'socket reconnect':
						sockets.socket.connect();
						break;

					case 'socket disconnect':
						sockets.socket.disconnect();
						break;
				}

				break;

			case 'offline':
				switch (req.body.text.toLocaleLowerCase()){

					case 'offline yes':
						isOffline = true;
						break;

					case 'offline no':
						isOffline = false;
						break;

					default:
						isOffline = true;
						break;

				}

		}
		res.status(200).end();
	}

	else {
		res.status(403).end();
	}

});

// Handle 404
app.use(function(req, res) {
	res.render('error.html', {error: "404", layout : null, production : production});
});

// Handle 500
app.use(function(error, req, res, next) {
	res.render('error.html', {error: "500", layout : null, production : production});
});

//Create the server
server.listen(app.get('port'), server_ip_address, function () {
	console.log('Express server listening on port ' + app.get('port'));
});