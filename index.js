// --------------------------------------------------------------------------------------------------------------------------
//  servidorLogin.js  
//
//          Servidor per a fer Login a una BD amb MySQL
//			Cal instal·lar express-session, ejs, mysql, body-parser i path
//			La documentació de cada paquet la podem trobar a https://www.npmjs.com/
//
// --------------------------------------------------------------------------------------------------------------------------
//   declaracions globals
// --------------------------------------------------------------------------------------------------------------------------
const NPORT = 4444;
var express = require('express');			// web framework per a NodeJS
var session = require('express-session');	// permet la gestió de sessions amb express, també es pot fer servir cookie-sesion
var bodyParser = require('body-parser');	// permet gestionar les peticions http que arriben al servidor
var path = require('path');					// permet treballar amb les rutes de fitxers i directoris

var mysql = require('mysql');				// permet gestionar bases de dades mysql
var connexio = mysql.createConnection({
	host: '54.166.218.121',
	port:'3306',
	user: 'dam2',
	password: 'dam2',
	database: 'bdm9uf1'
});
// --------------------------------------------------------------------------------------------------------------------------
//   establim la sessió que s'emmagatzema al costat del servidor incloses les cookies si en té
// --------------------------------------------------------------------------------------------------------------------------
var app = express();
app.use(session({
	secret: 'clausecreta',			// aquesta clau serveix per a signar les cookies (obligatori)	
	resave: true,					// força que es torni a sobreescriure la sessió encara que pugui estar oberta (obligatori)
	saveUninitialized: true,		// força que es guardi la sessió encara que no s'hagi inicialitzat (obligatori)
	cookie: { expires: new Date(Date.now() + 900000) }		// podem afegir cookies, en aquest cas caduca avui+900 mil milisegons (opcional)
}));
app.use(bodyParser.urlencoded({ extended: true }));	// extended : true fa que es puguin utilitzar URL complexes en les peticions http
app.use(bodyParser.json());							// permet la utilització de JSON		
app.use(express.static(__dirname + '/weblogin/'));  // assignem la carpeta arrel del servidor on posarem els ejs - si no posem aquesta sentència no es localitzen les imatges a l'html	
// --------------------------------------------------------------------------------------------------------------------------
//  gestionem les peticions a l'arrel /
// --------------------------------------------------------------------------------------------------------------------------
app.get('/', function (req, res) {
	res.render(path.join(__dirname + '/weblogin/index.ejs'));
});
// --------------------------------------------------------------------------------------------------------------------------
//  gestionem les peticions a /entrar
// --------------------------------------------------------------------------------------------------------------------------
app.post('/entrar', function (req, res) {

	// obtenim el valors dels camps que vénen del formulari HTML
	var username = req.body.username;
	var password = req.body.password;
	var xsql = 'SELECT * FROM tbusuaris WHERE username = ? AND password = ?';		// aquesta sentència sql té vulnerabilitats però no m'ho tingueu en compte xD
	if (username && password) {
		connexio.query(xsql, [username, password], function (err, results, fields) {
			//if (err) { console.log(err); }
			if ((results) && (results.length > 0)) {
				req.session.loginOK = true;						// creem una variable de sessió per indicar que el login ha estat correcte
				req.session.username = username;				// guardem el nom d'usuari en variables de sessió
				req.session.nomcomplet = results[0].nomcomplet;	// guardem el nom complet que hem obtingut del SELECT
				req.session.email = results[0].email;			// guardem l'email que hem obtingut del SELECT
				res.redirect('/home');
			} else {
				req.session.loginOK = false;
				res.redirect('/');				// redirigim a l'arrel del web en cas d'usuari no autoritzat
			}
		});
	} else {
		console.log("Això no ha barrufat")
		res.redirect('/error');	// redirigim a l'arrel del web en cas d'error
	}
});
// --------------------------------------------------------------------------------------------------------------------------
//  gestionem les peticions a /home fetes directament des del navegador
// --------------------------------------------------------------------------------------------------------------------------
app.get('/home', function (req, res) {
	if (req.session.loginOK) {
		var xsql = 'SELECT * FROM tbusuaris WHERE username != ?';		// aquesta sentència sql té vulnerabilitats però no m'ho tingueu en compte xD
		
		connexio.query(xsql, [req.session.username], function (err, results, fields){
			console.log(results);
			res.render(path.join(__dirname + '/weblogin/createChat.ejs'), { user: req.session.nomcomplet,results:results});
		})
		
	} else {
		res.redirect('/');		// redirigim a l'arrel del web si es vol arribar a aquí sense fer login
	}
});

// --------------------------------------------------------------------------------------------------------------------------
//  mostrem la llista d'usuaris
// --------------------------------------------------------------------------------------------------------------------------
app.post('/usuaris', function (req, res) {
	if (req.session.loginOK) {
		getUsuaris(req,res);
	} else {
		res.redirect('/');		// redirigim a l'arrel del web si es vol arribar a aquí sense fer login
	}
});
// --------------------------------------------------------------------------------------------------------------------------
//  gestionem les peticions a /home fetes directament des del navegador
// --------------------------------------------------------------------------------------------------------------------------
app.get('/llusuaris', function (req, res) {
	if (req.session.loginOK) {
		res.render(path.join(__dirname + '/weblogin/usuaris.ejs'), { titol: 'Llista d\'usuaris', itemList: req.session.itemList });
	} else {
		res.redirect('/');		// redirigim a l'arrel del web si es vol arribar a aquí sense fer login
	}
});
// --------------------------------------------------------------------------------------------------------------------------
//  mostrem pàgina d'error
// --------------------------------------------------------------------------------------------------------------------------
app.get('/error', function (req, res) {
	if (req.session.loginOK) {
		res.render(path.join(__dirname + '/weblogin/error.ejs'));
	} else {
		res.redirect('/');		// redirigim a l'arrel del web si es vol arribar a aquí sense fer login
	}
});
// --------------------------------------------------------------------------------------------------------------------------
//  inserim nou usuari
// --------------------------------------------------------------------------------------------------------------------------
app.post('/addusuari', function (req, res) {
	// obtenim el valors dels camps que vénen del formulari HTML
	var username = req.body.username;
	var password = req.body.password;
	var nomcomplet = req.body.nomcomplet;
	var email = req.body.email;

	if (req.session.loginOK) {
		var xsql = 'INSERT INTO tbusuaris VALUES(null,?,?,?,?)'
		connexio.query(xsql, [username, password, nomcomplet, email], function (err, results, fields) {
			if (err) {
				console.log(err);
				res.redirect('/error');				// redirigim a una pàgina d'error

			} else {
				getUsuaris(req,res);
			}
		});
	} else {
		res.redirect('/');		// redirigim a l'arrel del web si es vol arribar a aquí sense fer login
	}
});
// --------------------------------------------------------------------------------------------------------------------------
//  obtenim la llista d'usuaris
// --------------------------------------------------------------------------------------------------------------------------
function getUsuaris(req,res) {
	var xsql = 'SELECT * FROM tbusuaris ORDER BY username';
	connexio.query(xsql, null, function (err, results, fields) {
		if (err) {
			console.log(err);
			res.redirect('/error');				// redirigim a una pàgina d'error
		} else {
			if ((results) && (results.length > 0)) {
				req.session.itemList = results;		// guardem la llista d'usuaris en una variable de sessió
				res.redirect('/llusuaris');
			}
		}
	});
}

app.get("/chat/:id", (req, res) =>{
	res.send("Hola")
})

// --------------------------------------------------------------------------------------------------------------------------
//  activem el servidor
// --------------------------------------------------------------------------------------------------------------------------
app.listen(NPORT, function () {
	console.log('***Escoltant pel port ' + NPORT);
});
// --------------------------------------------------------------------------------------------------------------------------

