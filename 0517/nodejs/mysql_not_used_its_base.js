
var mysql = require('mysql')
var connection = mysql.createConnection({
    host: 'localhost',
	user: 'farmer',
	authentication_string: 'smart',
	database: 'farming'
})

connection.connect();

connection.query('SELECT * FROM crop', function (error, results, fields) {
    if (error) {
        console.log(error);
    }
    console.log(results);
}); 

function getAllMemos(callback){
    connection.query(`SELECT * FROM crop`, (err, rows, fields) => {
        if(err) throw err;
        callback(rows);
    });
}

module.exports = {
    getAllMemos
}

connection.end();



/* const mysqlConnection = {
	init: function(){
		return mysql.createConnection({
	
	host: 'localhost',
	user: 'farmer',
	authentication_string: 'smart',
	database: 'farming'
	});
},


    open: function(con) {       // #3
        con.connect(err => {
            if(err) {
                console.log("MySQL 연결 실패 : ", err);
            } else {
                console.log("MySQL Connected!!!");
            }
        });
    },
    close: function(con) {      // #4
        con.end(err => {
            if(err) {
                console.log("MySQL 종료 실패 : ", err);
            } else {
                console.log("MySQL Terminated...");
            }
        })
    }
}

module.exports = mysqlConnection; // #5

mysqlConnection.init();

mysqlConnection.open.connect.query('SELECT * FROM crop', function (error, results, fields) {
    if (error) {
        console.log(error);
    }
    console.log(results);
}); */