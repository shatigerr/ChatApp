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
// * Poner el usuario para ver quien manda el mensaje
// * Refactorizar y asegurar
// * Poner imagen de perfil

const NPORT = 4444;
var express = require('express');			// web framework per a NodeJS
const crypto = require('crypto');
const path = require('path');					// permet treballar amb les rutes de fitxers i directoris
const connexio = require('./db/connDB.js')
const config = require("./config/config.js")
const chatController = require("./controllers/chatController.js");
const session = require('express-session');
const app = express();

app.use(config);

app.get('/', function (req, res) {
	res.render(path.join(__dirname + '/weblogin/index.ejs'));
});

let hasdMD5;
const algorisme = 'RSA-MD5';
app.post('/entrar', (req, res) => {
	chatController.login(req,res,algorisme);
});

app.get('/home', function (req, res) {
	chatController.getUsers(req,res);
});

// Chats
app.get("/chat/:id", (req, res) =>{
	chatController.getChatById(req,res);
})

app.post("/chat/:id",(req, res) => {
	chatController.postMessages(req,res);
})

// Grupos
app.get("/grupo/:cod", (req, res) =>{
	chatController.getGeneralGroupChat(req,res);
})

app.post("/grupo/:cod", (req, res)=>{
	chatController.postGroupMessage(req,res);	
})

// Crear cuenta
app.get("/crearCuenta", (req, res) =>{
	res.render(path.join(__dirname + '/weblogin/crearCuenta.ejs'))
})


app.post("/crearCuenta", (req, res) =>{
	chatController.postCreateAccount(req,res);
})

// Logout
app.post('/logout',(req,res) => {
	chatController.logout(req,res);
})


// Crear grupo
app.get("/crearGrupo", (req, res)=>{
	if(req.session.loginOK){
		res.render(path.join(__dirname + '/weblogin/crearGrupo.ejs'))
	}else{
		res.redirect("/");
	}
	
})

app.post("/anadirGrupo", (req, res) =>{
	if(req.session.loginOK){
		chatController.postNewGroup(req,res);
	}else{
		res.redirect("/")
	}
	
})


// Acceder al listado de grupos
app.get("/listadoGrupos", (req, res)=>{
	if(req.session.loginOK){
		chatController.getGroups(req,res);
	}else{
		res.redirect("/")
	}
	
})

app.get("/entrarGrupo/:cod",(req,res) => {
	res.send("Hola " + req.params.cod)
})

app.post("/entrarGrupo/:cod", (req, res)=>{
	if(req.session.loginOK){
		chatController.postMemberGroup(req,res);
	}else{
		res.redirect("/")
	}
	
})
  
app.get('/chatWait', (req, res) => {
	if(req.session.loginOK){
		res.render(path.join(__dirname + '/weblogin/chatWait.ejs'))	
	}else{
		res.redirect("/")
	}
	
  });
  
app.get('/createChatGroup', (req, res)=>{		
	if(req.session.loginOK){
		chatController.chargeGroups(req, res);
	}else{
		res.redirect("/")
	}
})

app.listen(NPORT, function () {
	// console.log('***Escoltant pel port ' + NPORT);
	console.log("http://localhost:" + NPORT)
});