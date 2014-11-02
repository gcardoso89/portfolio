/**
 * Module dependencies.
 */
var express = require('express')
	, mailer = require('express-mailer')
	, io = require('socket.io')
	, http = require('http')
	, twitter = require('ntwitter')
	, _ = require('underscore')
	, path = require('path')
	, mongo = require('mongodb').MongoClient;

var portfolioList = [];

//Create an express app
var app = express();

mailer.extend(app, {
	from: 'site@gcardoso.pt',
	host: 'smtp.gcardoso.pt', // hostname
	secureConnection: true, // use SSL
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
var watchSymbols = ['#gcardoso'];

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
app.engine('html', require('hogan-express'));
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

//We're using bower components so add it to the path to make things easier
app.use('/components', express.static(path.join(__dirname, 'components')));

var mongoUrl = 'mongodb://admin:VPSH3mpQp6fH@'+process.env.OPENSHIFT_MONGODB_DB_HOST+':'+process.env.OPENSHIFT_MONGODB_DB_PORT +'/gcardoso';

var enviromnent = app.get('env');

// development only
if ('development' == enviromnent) {
	app.use(express.errorHandler());
	mongoUrl = 'mongodb://localhost:27017/gcardoso';
}


//Our only route! Render it with the current watchList
app.get('/', express.basicAuth('gcardoso89', 'timesUP32'), function (req, res) {

	mongo.connect(mongoUrl, function (err, db) {

		//if(('development' != enviromnent)) db.auth('admin', 'VPSH3mpQp6fH');

		var collection = db.collection('portfolio');

		collection.find({}).toArray(function (err, docs) {
			//assert.equal(err, null);
			//assert.equal(4, docs.length);
			portfolioList = docs;

			for (var i = 0; i < portfolioList.length; i++) {
				var obj = portfolioList[i];
				for (var prop in obj) {
					var col = obj[prop];
					if (col == "null" || col == 'null' || col == null) portfolioList[i][prop] = null;
				}
			}

			res.render('index.html', {portfolio: portfolioList});
			db.close();
		});

	});

});

app.get('/teste', function (req, res) {
	res.render('teste.html');
});

app.post('/sendEmail', function(req, res){

	app.mailer.send('email',{
		to: 'goncalo.cb.ferreira@gmail.com', // REQUIRED. This can be a comma delimited string just like a normal email to field.
		subject: 'Portfolio', // REQUIRED.
		otherProperty: 'Other Property' // All additional properties are also passed to the template as local variables.
	}, function (err) {
		if (err) {
			// handle error
			console.log(err);
			res.json(200, { success : false });
			return;
		}
		res.json(200, { success : true });
	});

});

//Start a Socket.IO listen
var sockets = io.listen(server);

//Set the sockets.io configuration.
//THIS IS NECESSARY ONLY FOR HEROKU!
sockets.configure(function () {
	sockets.set('transports', ['xhr-polling']);
	sockets.set('polling duration', 3600);
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

var arr = new Array();

//Tell the twitter API to filter on the watchSymbols
t.stream('statuses/filter', { track: watchSymbols }, function (stream) {

	//We have a connection. Now watch the 'data' event for incomming tweets.
	stream.on('data', function (tweet) {
		//Make sure it was a valid tweet
		if (tweet.text !== undefined) {
			arr.push(tweet);
			sockets.sockets.emit('data', arr);
		}
	});
});

var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

//Create the server
server.listen(app.get('port'), server_ip_address, function () {
	console.log('Express server listening on port ' + app.get('port'));
});


