
log = console.log;
DB = null;
var env = process.env.NODE_ENV || 'dev';
var sessions = {};
console.log('ENVIRONMENT:', env);

var express = require('express');
var proxy = require('http-proxy-middleware');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var reload = require('reload');
var fs = require('fs');

var request = require('request');
var UUID = require('uuid/v1');
var bodyParser  = require('body-parser');
var fileUpload = require('express-fileupload');

var excel2Json = require('node-excel-to-json');



var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.urlencoded());

app.use(bodyParser.json());

app.use(fileUpload());

var MongoClient = require('mongodb').MongoClient
, assert = require('assert');

var insertDocuments = function(db, callback, col)
{
	// Get the documents collection
	var collection = db.collection(col.name);
	// Insert some documents
	if(col.rec)
	{
		collection.insert(
			[
				col.rec
			], function(err, result)
			{
			  callback(result);
			});
	}
}
var deleteDocument = function(db, callback, col) {
	// Get the documents collection
	var collection = db.collection(col.name);
	// Insert some documents
	collection.deleteOne({uuid: col.rec.uuid}, function(err, result) {

	// console.log("Removed the document with result", result.ok);
	callback(result);
	});
}
var updateDocument = function(db, callback, col) {
	// Get the documents collection
	var collection = db.collection(col.name);
	console.log('STPRF REQ',col.filter, col.rec)

	// Update document where a ir col filter, set b to col rec
	collection.updateOne(col.filter, col.rec, function(err, result) {
		callback(result);
	});
}
var findDocuments = function(db, callback, col) {
	// Get the documents collection
	var collection = db.collection(col.name);
	// Find some documents
	collection.find(col.rec).toArray(function(err, docs) {

	// console.log("Found the following records");
	console.dir(docs);
	callback(docs);
	});
}
var url = 'mongodb://localhost:27017/fight_tree';
// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db)
{
	assert.equal(null, err);
	console.log("Connected correctly to MONGO server");
	DB = db
});

// app.use('/db/*', proxy({target: 'http://127.0.0.1:8081', changeOrigin: true}));

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));//
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, './')));

app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.get('/', function (req, res) {

	var is_loged = false;
  	is_loged ? res.render('index') : res.render('login');
});
var loged = function(user, pass, req, res)
{
	console.log('loin magic', req.body)
	if (req.body)
	{

		log('conection new');
		var session_uuid = UUID();
		sessions[req.body.username] = { session_uuid: session_uuid, is_loged: true, username: user, req: req, res: res };
		var params = JSON.stringify({ session_uuid: session_uuid, user: user })
		sessions[req.body.username].res.render('index', { params: params });
	}
	else
	{
		res.render('login');
	}
	for ( var key in sessions) {
		if( sessions && sessions[key]) console.log('SESSIONS', sessions[key].session_uuid);
	}
}
app.post('/login', function (req, res) {
	var req_pass = req.body.password || 'nopass';
	var req_user = req.body.username || 'noname';

	var col = { name: 'users', rec: {"email" : req_user} }
	findDocuments (DB,
	function(result)
	{
		var rs = result
		if( req_pass && rs && rs[0] && rs[0].password == req_pass )
		{
			console.log('USER EXIST BY EMAIL: ', rs[0].password , req_pass)
			loged(req_user, req_pass, req, res);
		}
		else
		{
			col = { name: 'users', rec: {"username" : req_user} }
			findDocuments (DB,
			function(result)
			{
				var rs = result
				console.log('RESULT USER: ', result)
				if( req_pass && rs && rs[0] && rs[0].password == req_pass )
				{
					console.log('USER EXISTBY USERNAME: ', rs[0].password , req_pass)
					// res.render('index')
					loged(req_user, req_pass, req, res);

				}
				else
				{
					console.log('ZERO RECORDS ON USER: ', req.email)
					res.render('login')
				}
			}, col)
		}
	}, col)

});
var sendres = function(colection, req, res, filter)
{
	var col = { name: colection, rec: filter || {"user" : req.body.username} }
	findDocuments (DB,
	function(result)
	{
		log(colection + ' RESULT: ', result, req.body.username);
		req.body = result;
		res.send(req.body);
	}, col)
}

app.get('/recover', function (req, res) {
	var is_loged = true;
  	is_loged ? res.render('index') : res.render('login');
});
app.post('/register', function (req, res) {
	console.log(req.body.usernaame)
	var col = { name: 'users', rec: req.body }
	insertDocuments(DB, function()
	{
		res.render('login');
	},col  )

});

app.post('/getprf', function (req, res)
{
	log('PROFILE GET:: ', req.body)
	for (var key in sessions)
	{
		if (sessions[key].session_uuid == req.body.session_uuid)
		{
			//log('foundL ', sessions[key].username)
			req.body.username = sessions[key].username;
			sendres('profiles', req, res)
		}
	}
});

var save = function ( colection, req, res, callback)
{
	var body = req.body;

	// log('DO PROFILE EXIS:: ', body)
	var col = { name: colection, rec: {uuid : body.info.uuid} }
	findDocuments (DB,
	function(result)
	{
		// log('profile RESULT: ', result.length);
		if (result.length)
		{
			var col = { name: colection, rec: body.info, filter: { uuid: body.info.uuid } };

			updateDocument(DB, function (response)
			{
				callback(response)
			}, col)
		}
		else
		{
			body.info.uuid = UUID();
			var col = { name: colection, rec: body.info };
			insertDocuments(DB, function (response)
			{
				callback(response)
			}, col)
		}
	}, col)
}

var del = function ( colection, req, res, callback)
{
	var body = req.body;

	// log('DO PROFILE EXIS:: ', body)
	var col = { name: colection, rec: {uuid : body.info.uuid} }
	findDocuments (DB,
	function(result)
	{
		// log('profile RESULT: ', result.length);
		if (result.length)
		{
			var col = { name: colection, rec: body.info, filter: { uuid: body.info.uuid } };

			deleteDocument(DB, function (response)
			{
				callback(response)
			}, col)
		}
		else
		{
			callback('no club to delete')
		}
	}, col)
}

app.post('/setprf', function (req, res)
{
	for (var key in sessions)
	{
		if (sessions[key].session_uuid == req.body.session_uuid)
		{
			save('profiles', req, res, function (response)
			{
				console.log('save fired');
				res.send(response);
			})
		}
	}
});

app.post('/getclubs', function (req, res)
{
	log('CLUBS GET:: ', req.body)
	for (var key in sessions)
	{
		if (sessions[key].session_uuid == req.body.session_uuid)
		{
			log('foundL ', sessions[key].username)
			req.body.username = sessions[key].username;
			sendres('clubs', req, res, {} )
		}
	}
});
app.post('/gettournament', function (req, res)
{
	log('CLUBS GET:: ', req.body)
	for (var key in sessions)
	{
		if (sessions[key].session_uuid == req.body.session_uuid)
		{
			log('tournament', sessions[key].username)
			req.body.username = sessions[key].username;
			sendres('tournament', req, res, {} )
		}
	}
});
app.post('/getplayers', function (req, res)
{
	log('PLAYERS GET:: ', req.body)
	for (var key in sessions)
	{
		if (sessions[key].session_uuid == req.body.session_uuid)
		{
			log('profiles', sessions[key].username)
			req.body.username = sessions[key].username;
			sendres('profiles', req, res, {} )
		}
	}
});
app.post('/setclubs', function (req, res)
{
	for (var key in sessions)
	{
		if (sessions[key].session_uuid == req.body.session_uuid)
		{
			save('clubs', req, res, function (response)
			{
				console.log('save fired');
				res.send(response);
			})
		}
	}
});
app.post('/settournament', function (req, res)
{
	for (var key in sessions)
	{
		if (sessions[key].session_uuid == req.body.session_uuid)
		{
			save('tournament', req, res, function (response)
			{
				console.log('save fired');
				res.send(response);
			})
		}
	}
});
app.post('/deltournament', function (req, res)
{
	for (var key in sessions)
	{
		if (sessions[key].session_uuid == req.body.session_uuid)
		{
			del('tournament', req, res, function (response)
			{
				console.log('del fired');
				res.send(response);
			})
		}
	}
});
app.post('/delclubs', function (req, res)
{
	for (var key in sessions)
	{
		if (sessions[key].session_uuid == req.body.session_uuid)
		{
			del('clubs', req, res, function (response)
			{
				console.log('del fired');
				res.send(response);
			})
		}
	}
});
app.post('/openclubs', function (req, res)
{
	for (var key in sessions)
	{
		if (sessions[key].session_uuid == req.body.session_uuid)
		{
			console.log('open sesion found');

			var body = req.body;
			var colection = 'profiles'

				log('DO PROFILE EXIS:: ', body)
				var col = { name: colection, rec: {club : body.info.clubName} }
				findDocuments (DB,
				function(result)
				{
					log('profile RESULT: ', result.length);
					if (result.length > 0)
					{
						res.send(result)
					}
					else
					{
						res.send({status:'no club participants found', err: 400})
					}
				}, col)


		}
	}
});


app.post('/upXls', function(req, res) {
	if (!req.files)
	{
		return res.status(400).send({ status: 'No files were uploaded.', err: 400 });
	}
	else
	{
		var sampleFile = req.files[0];
		var path = 'public/uploads/' + sampleFile.name;
		log('SAMPLE FILE', sampleFile);

		var result = sampleFile.data;

		fs.writeFile( path, result, 'binary', function (err)
		{
			excel2Json('../../../' + path, function(errXls, output) {
				log('OUTPUT: ', err, output)
				res.send({status:'OK get file: ' + sampleFile.name, err: err, result: output})
			});

		});
	}
});










var uglify = function(req, res )
{
	var dir  = 'runtime';
	var path = req.path;
	var url = dir + path;
	fs.readFile( url , 'utf8', function( err, data )
	{
		res.send( data || err );
	});
};
app.use('/runtime', uglify);

// Reload code here
env == 'dev' && reload(app, {verbose: true, port: 3000} );

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');

	next && console.log('nextfires');
});



module.exports = app;
