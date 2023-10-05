const session = require('express-session');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.set('view engine', 'ejs');
app.use(session({
	secret: 'clausecreta',			// aquesta clau serveix per a signar les cookies (obligatori)	
	resave: true,					// força que es torni a sobreescriure la sessió encara que pugui estar oberta (obligatori)
	saveUninitialized: true,		// força que es guardi la sessió encara que no s'hagi inicialitzat (obligatori)
	cookie: { expires: new Date(Date.now() + 900000) }		// podem afegir cookies, en aquest cas caduca avui+900 mil milisegons (opcional)
}));
app.use(bodyParser.urlencoded({ extended: true }));	// extended : true fa que es puguin utilitzar URL complexes en les peticions http
app.use(bodyParser.json());							// permet la utilització de JSON		
app.use(express.static(__dirname + '/../weblogin/'));  // assignem la carpeta arrel del servidor on posarem els ejs - si no posem aquesta sentència no es localitzen les imatges a l'html	
console.log("CONFIGURACIONES CARGADAS");
module.exports = app;