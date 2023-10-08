const mysql = require('mysql');				// permet gestionar bases de dades mysql
let connexio;

try{
    connexio = mysql.createConnection({
        host: '35.171.167.46',
        port:'3306',
        user: 'dam2',
        password: 'dam2',
        database: 'bdm9uf1'
    });

    connexio.connect((err) => {
        if(err){
            console.log(err);
        }else{
            console.log("CONEXION CON DB ESTABLECIDA");
        }
    })
}catch(err){
    console.log(err);

}

module.exports = connexio;