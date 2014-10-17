var express = require('express');
var app = express();
var handlebars = require('express-handlebars');
var bodyParser = require('body-parser');
var session = require('express-session');

var birdList = [{name:"Bald Eagle", seen:3}, {name:"Yellow Billed Duck", seen:7}, {name:"Great Cormorant", seen:4}];
var filterSession;
var currentSession;

var sessionOptions = {
	secret: 'iWishIHadSomeCookiesRightNow',
	resave: true,
	saveUninitialized: true
};

app.use(session(sessionOptions));

app.engine('handlebars', handlebars({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use('/public', express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(function(req, res, next){
	console.log(req.method, req.path);
	console.log("req.body:",req.body);
	console.log("req.session.minVal:",filterSession);
	next();
})

app.get('/', function(req, res){
	res.render('index');
});

app.get('/birds', function(req, res){
	if(currentSession != req.headers['user-agent']){
		filterSession = undefined;
	}

	currentSession = req.headers['user-agent'];

	if(filterSession !== undefined && (currentSession == req.headers['user-agent'])){
		req.session.birdList = birdList.filter(function(bird){
			return bird.seen >= filterSession;
		});
		res.render('birds', {'birdList':req.session.birdList});
	} else{
		res.render('birds', {'birdList':birdList});
	}
	
});

app.post('/birds', function(req, res){
	var temp = {name: req.body.birdList, seen:1};
	console.log(temp);

	for(var i = 0; i < birdList.length; i++){
		if(birdList[i].name === temp.name){
			birdList[i].seen += 1;
			break;
		} else if(i + 1 === birdList.length){
			birdList.push(temp);
			break;
		}
	}
	res.redirect('/birds');
});

app.get('/settings', function(req, res){
	res.render('settings');
});

app.post('/settings', function(req, res){
	console.log("showing:", filterSession);
	filterSession = req.body.birdSettings;
	console.log("showing:", filterSession);
	res.redirect('/birds');

});

var port = 3000;
app.listen(port);
console.log('Starting server on port', port);

