const crypto = require('crypto');
const connexio = require('../db/connDB.js')
const path = require('path');	
const session = require('express-session');
let hasdMD5;

class chatController{
    static login(req,res,algorisme){
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
    }

    static logout(req,res){
        let active = 'UPDATE tbusuaris SET conectado=0 WHERE id = ?  ';

        connexio.query(active,[req.session.userId],(err,results) => {
            req.session.loginOK = false;
            res.redirect('/');
        })
    }

    static getUsers(req,res){
        if (req.session.loginOK) {
            //console.log(req.session);
            var xsql = 'SELECT * FROM tbusuaris WHERE username != ?';		// aquesta sentència sql té vulnerabilitats però no m'ho tingueu en compte xD
            
            connexio.query(xsql, [req.session.username], function (err, results, fields){
                //console.log(results);
                res.render(path.join(__dirname + '/../weblogin/createChat.ejs'), { user: req.session.nomcomplet,results:results});
            })
            
        } else {
            res.redirect('/');		// redirigim a l'arrel del web si es vol arribar a aquí sense fer login
        }
    }

    static getChatById(req,res){
        const xsql = 'SELECT * FROM tbmensajes WHERE (emisorId = ? OR receptor = ?) AND (emisorId = ? OR receptor = ?) ';
	    const saberNombre = 'SELECT username FROM tbusuaris WHERE id = ?'

	    connexio.query(xsql,[req.session.userId, req.session.userId, req.params.id, req.params.id], (err,results,fields) => {
		    connexio.query(saberNombre,[req.params.id], (err, results2, fields)=>{
			    // console.log("------> " + results2[0].username)
			    //console.log(results);
			    res.render(path.join(__dirname + '/../weblogin/chatUser.ejs'),{receptor:req.params.id,results:results, id:req.session.userId, receptorName: results2[0].username})
		    })
	    })  
    }

    static postMessages(req,res){
        const xsql = 'INSERT INTO tbmensajes (id,emisorId,receptor,mensaje,fecha) VALUES(null,?,?,?,NOW())';
	    
		connexio.query(xsql,[req.session.userId, req.params.id, req.body.msg], (err,results,fields) =>{
		// console.log(results)
		    res.redirect("/chat/" + req.params.id)
	    })
    }

    static getGeneralGroupChat(req,res){
        const xsql = 'SELECT * FROM tbmensajes WHERE codgrupo = ? AND codgrupo IS NOT NULL'
	    const innerJoin = "SELECT tbmensajes.emisorId AS id_emisor, tbusuaris.username, tbmensajes.mensaje, tbgrupo.nombre AS nombre_grupo FROM tbmensajes INNER JOIN tbusuaris ON tbmensajes.emisorId = tbusuaris.id INNER JOIN tbgrupo ON tbmensajes.codgrupo = tbgrupo.cod WHERE tbmensajes.codgrupo = ?;";
	    // SELECT tbmensajes.emisorId AS id_emisor, tbusuaris.username, tbmensajes.mensaje FROM tbmensajes INNER JOIN tbusuaris ON tbmensajes.emisorId = tbusuaris.id WHERE tbmensajes.codgrupo = "AAAAA";

	    connexio.query(innerJoin,[req.params.cod], (err, results, fields)=>{
		    res.render(path.join(__dirname + '/../weblogin/grupo.ejs'), {results:results, codgrupo:req.params.cod, id:req.session.userId})
	    })
    }

    static postGroupMessage(req,res){
        const xsql = 'INSERT INTO tbmensajes (id, emisorId, receptor, mensaje, fecha, codgrupo) VALUES(null,?, null, ?, NOW(), ?)'

	    connexio.query(xsql, [req.session.userId, req.body.msg, req.params.cod], (err, results, fields) =>{
		    // console.log(results)
		    res.redirect("/grupo/" + req.params.cod)
	    })
    }

    static postNewGroup(req,res){
        const xsql = 'INSERT INTO tbgrupo (cod, nombre) VALUES(?, ?)';

        connexio.query(xsql,[req.body.codGrupo, req.body.nombreGrupo], (err, reults, fields)=>{
            //console.log("Codigo introducido: " + req.body.codGrupo)
            //console.log("Nombre introducido: " + req.body.nombreGrupo)
            res.redirect("/")
        })
    }

    static getGroups(req,res){
        const xsql = 'SELECT grp.* FROM tbgrupo AS grp WHERE grp.cod NOT IN ( SELECT tbmiembros.groupcod FROM tbmiembros WHERE tbmiembros.userId = ?);'
		connexio.query(xsql,[req.session.userId], (err, results, fields)=>{
			res.render(path.join(__dirname + '/../weblogin/listadoGrupos.ejs'),{results:results})
        })
    }

    static postMemberGroup(req,res){
        const xsql = 'INSERT INTO tbmiembros VALUES(?,?)'

        connexio.query(xsql, [req.params.cod,req.session.userId],(err,resutls) => {
            res.redirect('/createChatGroup');
        })
        
    }

    static postCreateAccount(req,res){
        const xsql = "INSERT INTO tbusuaris (id, username, password, nomcomplet, email, conectado, imagenUser) VALUES(null, ?, ?, ? , ?, 0, ?)"
	    var password = req.body.password

	    hasdMD5 = crypto.createHash('RSA-MD5').update(password).digest('hex');

	    password = hasdMD5;
	    // sesion se guarda en la sesion "cokie"
	    // params cuando le pasas un valor a la ruta
	    // body cuando del html o de algun lado le llega la request

	    connexio.query(xsql,[req.body.username, password, req.body.completedUsername, req.body.mail, req.body.imagen], (err, results, fields)=>{
		    // console.log(req.body.imagen)
		    res.redirect("/")
	    })
    }

	static chargeGroups(req, res){
		const xsql = "SELECT grp.* FROM tbgrupo AS grp INNER JOIN tbmiembros AS mb ON grp.cod = mb.groupcod WHERE mb.userId = ?;"

		connexio.query(xsql,[req.session.userId], (err, results, fields)=>{
			// console.log(results)
			res.render(path.join(__dirname + '/../weblogin/createChatGroup.ejs'), {results:results})
		})
	}
}

module.exports = chatController;