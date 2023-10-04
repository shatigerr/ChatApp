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

// TODO
// * Crear grupos y unirse
// * Encriptar contraseñas
// * Poner el usuario para ver quien manda el mensaje
// * Que el chat sea vivo (web socket)
// * Refactorizar y asegurar
// * Poner imagen de perfil

const NPORT = 4444;
var express = require('express');			// web framework per a NodeJS
var session = require('express-session');	// permet la gestió de sessions amb express, també es pot fer servir cookie-sesion
var bodyParser = require('body-parser');	// permet gestionar les peticions http que arriben al servidor
var path = require('path');					// permet treballar amb les rutes de fitxers i directoris
var crypto = require('crypto');

var mysql = require('mysql');				// permet gestionar bases de dades mysql
const { log } = require('console');
var connexio = mysql.createConnection({
	host: '3.94.130.181',
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
let hasdMD5;
const algorisme = 'RSA-MD5';
app.post('/entrar', function (req, res) {
	// obtenim el valors dels camps que vénen del formulari HTML
	var username = req.body.username;
	var password = req.body.password;

	// Enviamos la contraseña encriptada a hashMD5
	hasdMD5 = crypto.createHash(algorisme).update(password).digest('hex');
	// 4a7d1ed414474e4033ac29ccb8653d9b


	password = hasdMD5;
	
	
	var xsql = 'SELECT * FROM tbusuaris WHERE username = ? AND password = ?';		// aquesta sentència sql té vulnerabilitats però no m'ho tingueu en compte xD
	let active = 'UPDATE tbusuaris SET conectado=1 WHERE id = ?  '
	if (username && password) {
		connexio.query(xsql, [username, password], function (err, results, fields) {
			//if (err) { console.log(err); }
			if ((results) && (results.length > 0)) {
				req.session.loginOK = true;						// creem una variable de sessió per indicar que el login ha estat correcte
				req.session.username = username;
				req.session.userId = results[0].id;				// guardem el nom d'usuari en variables de sessió
				req.session.nomcomplet = results[0].nomcomplet;	// guardem el nom complet que hem obtingut del SELECT
				req.session.email = results[0].email;			// guardem l'email que hem obtingut del SELECT
				connexio.query(active, [req.session.userId], function (err, results, fields){

					res.redirect('/home');
				})
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
		console.log(req.session);
		var xsql = 'SELECT * FROM tbusuaris WHERE username != ?';		// aquesta sentència sql té vulnerabilitats però no m'ho tingueu en compte xD
		
		connexio.query(xsql, [req.session.username], function (err, results, fields){
			//console.log(results);
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

// Chats
app.get("/chat/:id", (req, res) =>{
	const xsql = 'SELECT * FROM tbmensajes WHERE (emisorId = ? OR receptor = ?) AND (emisorId = ? OR receptor = ?) ';
	const saberNombre = 'SELECT username FROM tbusuaris WHERE id = ?'

	connexio.query(xsql,[req.session.userId, req.session.userId, req.params.id, req.params.id], (err,results,fields) => {
	
		connexio.query(saberNombre,[req.params.id], (err, results2, fields)=>{
			// console.log("------> " + results2[0].username)
			//console.log(results);
			res.render(path.join(__dirname + '/weblogin/chatUser.ejs'),{receptor:req.params.id,results:results, id:req.session.userId, receptorName: results2[0].username})
		})
	})
})

app.post("/chat/:id",(req, res) => {
	const xsql = 'INSERT INTO tbmensajes (id,emisorId,receptor,mensaje,fecha) VALUES(null,?,?,?,NOW())';
	connexio.query(xsql,[req.session.userId, req.params.id, req.body.msg], (err,results,fields) =>{
		// console.log(results)
		res.redirect("/chat/" + req.params.id)
	})
})

// Grupos
app.get("/grupo/:cod", (req, res) =>{
	const xsql = 'SELECT * FROM tbmensajes WHERE codgrupo = ? AND codgrupo IS NOT NULL'

	connexio.query(xsql,[req.params.cod], (err, results, fields)=>{
		//console.log(results);
		res.render(path.join(__dirname + '/weblogin/grupo.ejs'), {results:results, codgrupo:req.params.cod, id:req.session.userId})
	})
})

app.post("/grupo/:cod", (req, res)=>{
	const xsql = 'INSERT INTO tbmensajes (id, emisorId, receptor, mensaje, fecha, codgrupo) VALUES(null,?, null, ?, NOW(), ?)'

	connexio.query(xsql, [req.session.userId, req.body.msg, req.params.cod], (err, results, fields) =>{
		//console.log(results)
		res.redirect("/grupo/" + req.params.cod)
	})	
})

// Crear cuenta
app.get("/crearCuenta", (req, res) =>{
	res.render(path.join(__dirname + '/weblogin/crearCuenta.ejs'))
})


app.post("/crearCuenta", (req, res) =>{
	const xsql = "INSERT INTO tbusuaris (id, username, password, nomcomplet, email, conectado) VALUES(null, ?, ?, ? , ?, 0)"

	password = req.body.password

	hasdMD5 = crypto.createHash(algorisme).update(password).digest('hex');

	password = hasdMD5;

	// sesion se guarda en la sesion "cokie"
	// params cuando le pasas un valor a la ruta
	// body cuando del html o de algun lado le llega la request

	connexio.query(xsql,[req.body.username, password, req.body.completedUsername, req.body.mail], (err, results, fields)=>{
		// console.log(results)
		res.redirect("/")
	})
})


// Logout
app.post('/logout',(req,res) => {
	let active = 'UPDATE tbusuaris SET conectado=0 WHERE id = ?  ';

	connexio.query(active,[req.session.userId],(err,results) => {
		req.session.loginOK = false;
		res.redirect('/');
	})
})


// Crear grupo
app.get("/crearGrupo", (req, res)=>{
	res.render(path.join(__dirname + '/weblogin/crearGrupo.ejs'))
})

app.post("/anadirGrupo", (req, res) =>{
	const xsql = 'INSERT INTO tbgrupo (cod, nombre) VALUES(?, ?)';

	
	connexio.query(xsql,[req.body.codGrupo, req.body.nombreGrupo], (err, reults, fields)=>{
		console.log("Codigo introducido: " + req.body.codGrupo)
		console.log("Nombre introducido: " + req.body.nombreGrupo)
		res.redirect("/")
	})
})

// app.post("/grupo/:cod", (req, res) => {
// 	const xsql = 'INSERT INTO tbmensajes (id, emisorId, receptor, mensaje, fecha, codgrupo) VALUES (null, ?, null, ?, NOW(), ?)';
  
// 	const values = [req.session.id, req.body.msg, req.params.cod];
  
// 	connexio.query(xsql, values, (err, results, fields) => {
// 	  if (err) {
// 		console.error(err);
// 		// Manejo de errores aquí, por ejemplo, enviar una respuesta de error al cliente.
// 		res.status(500).send("Error interno del servidor");
// 	  } else {
// 		console.log(results);
// 		res.redirect("/grupo/" + req.params.cod);
// 	  }
// 	});
//   });
  

// --------------------------------------------------------------------------------------------------------------------------
//  activem el servidor
// --------------------------------------------------------------------------------------------------------------------------
app.listen(NPORT, function () {
	// console.log('***Escoltant pel port ' + NPORT);
	console.log("http://localhost:" + NPORT)
});
// --------------------------------------------------------------------------------------------------------------------------