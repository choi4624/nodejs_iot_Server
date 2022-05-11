const express = require('express');
const fs = require('fs');
const app = express();
var http = require('http');
var mysql = require('mysql');
const bodyParser = require('body-parser');
const ejs = require('ejs')
const sql = require('./nodejs/mysql')

var db = mysql.createConnection({
    host: 'localhost',
	port: '3306',
	user: 'root',
	password: 'smartfarm',
	database: 'farming' 
});

db.connect();

app.use(express.json())
app.use(bodyParser.urlencoded({
    extended: false
  }))
  
/*const mysqlConObj = require('./mysql')

const db = mysqlConObj.init()

db.connect();
mysqlConObj.open(db)
*/
const { response, Router } = require('express');
const template = require('./lib/template');

app.set('view engine', 'ejs');

const api = [
    {
        "topics": [
            {
                "id": 1,
                "title": "fetch",
                "body": "fetch is..."
            }
        ],
    
        "comments": [
            {
                "id":1,
                "body":"first commnet is ...",
                "topicID":1
            },
            {
                "id":2,
                "body":"second commnet is ...",
                "topicID":1
            }
        ]
    }
]

app.get("/api/api",(req,res)=>{
    res.json(api);
})

app.get('/', function(req, ack){
	fs.readFile('./smartfarm/index.HTML', function(error, data){
	ack.writeHead(200, { 'Content-Type': 'text/html'});
	ack.end(data);
	});
});



app.get('/api', function(req, ack){
	fs.readFile('apiBasic.HTML', function(error, data){
	ack.writeHead(200, { 'Content-Type': 'text/html'});
	ack.end(data);
	});
});

// SQL get post 

// 읽기 

app.get('/sql', function (req, res) {
    fs.readFile('./lib/list.ejs', 'utf8', function (err, data) {
      db.query('select * from crop', function (err, results) {
        if (err) {
          res.send(err)
        } else {
          res.send(ejs.render(data, {
            data: results
          }))
        }
      })
    })
  })


  // insert HTML 파일 

app.get('/sql/insert', function (req, res) {
    fs.readFile('./lib/insert.html', 'utf8', function (err, data) {
        res.send(data)
      })
})

// insert HTML POST 구현 

app.post('/sql/insert', function (req, res) {
    const body = req.body;
    const sql = 'insert into crop (작물, 온도, 습도, 수위, 심은날짜, 갱신시각) values (?, ?, ?, ?, NOW(), NOW())';
    db.query(sql, [
        body.작물,
        body.온도,
        body.습도,
        body.수위
      ], function(err, result, fields) {
          if(err){console.log(err);}
      console.log(result);
          res.redirect('/sql')
    })
  })


//삭제 
  app.get('/sql/delete/:id', function (req, res) {
    const sql = 'delete from crop where 작물=?';
    var id = [req.params.id];


    db.query(sql, id, function(err, result, fields) {
      if(err){console.log(err);}
  console.log(result);
      res.redirect('/sql')
      })
})


//수정 
app.get('/sql/edit/:id', function (req, res) {
  var id = req.params.id;
  const sql = 'select * from crop where 작물=?';


  fs.readFile('./lib/edit.ejs', 'utf8', function (err, data) {
    db.query(sql, id, function (err, result) {
      res.send(ejs.render(data, {
        data: result[0]
      }))
      if(err){console.log(err);}
      
  console.log(result);
    })
    if(err){console.log(err);}
  })
})

app.post('/sql/edit/:id', function (req, res) {
  const body = req.body
  var idf = req.params.id;

  const sql = 'update crop SET 온도=?, 습도=?, 수위=?, 갱신시각=NOW() where 작물=?';
  db.query(sql,[
    body.온도, 
    body.습도, 
    body.수위, 
    req.params.id
  ], function (error, result) {
    if(error){console.log(error);}
      console.log(result)
    console.log('update SQL')
    res.redirect('/sql')
  })
})


// raw DB table 읽기 

app.get('/sql/table', (req,res) => {

    const sqlselect = 'SELECT * FROM crop'

    db.query(sqlselect, function(err, result,field){
        if(err) throw err;
        res.send(result)
    })
});

// 작동 안하는 코드일꺼임 

app.post('/sql/table', (req, res) =>  
{
    const sqlselect = "INSERT INTO crop SET ?"

  db.query(sqlselect,req.body,function(err, result, fields){
    if (err) throw err;
    console.log(result);
    res.send('등록이 완료 되었습니다');

  });
})


// CSS JS ASSETS db는 안쓸수도 있음 

app.use('/css',express.static(__dirname+"/smartfarm/css"));
app.use('/js',express.static(__dirname+"/smartfarm/js"));
app.use('/assets',express.static(__dirname+"/smartfarm/assets"));
app.use('/db',express.static(__dirname+"/smartfarm/DB"));




app.listen(80, function(){
	console.log('listening on 80')
});
