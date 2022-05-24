const express = require("express");
const fs = require("fs");
const app = express();
var http = require("http");
var mysql = require("mysql");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const sql = require("./nodejs/mysql");

var db = mysql.createConnection({
  host: "localhost",
  port: "3306", //외부 연결 허용 -> 서버 작업자 리퀘스트
  user: "root",
  password: "smartfarm",
  database: "farming",
});

db.connect();

app.use(express.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

/*const mysqlConObj = require('./mysql')

  const db = mysqlConObj.init()

  db.connect();
  mysqlConObj.open(db)
  */
const { response, Router } = require("express");
const template = require("./lib/template");

app.set("view engine", "ejs");

const api = [
  {
    topics: [
      {
        id: 1,
        title: "fetch",
        body: "fetch is...",
      },
    ],

    comments: [
      {
        id: 1,
        body: "first commnet is ...",
        topicID: 1,
      },
      {
        id: 2,
        body: "second commnet is ...",
        topicID: 1,
      },
    ],
  },
];

app.get("/api/api", (req, res) => {
  res.json(api);
});

app.get("/", function (req, ack) {
  fs.readFile("./smartfarm/index.HTML", function (error, data) {
    ack.writeHead(200, { "Content-Type": "text/html" });
    ack.end(data);
  });
});

app.get("/api", function (req, ack) {
  fs.readFile("apiBasic.HTML", function (error, data) {
    ack.writeHead(200, { "Content-Type": "text/html" });
    ack.end(data);
  });
});

// SQL get post

// 읽기

app.get("/sql", function (req, res) {
  fs.readFile("./lib/list.ejs", "utf8", function (err, data) {
    db.query("select * from crop", function (err, results) {
      if (err) {
        res.send(err);
      } else {
        res.send(
          ejs.render(data, {
            data: results,
          })
        );
      }
    });
  });
});

app.get("/sql/:crop", function (req, res) {
  fs.readFile("./lib/selectedList.ejs", "utf8", function (err, data) {
    db.query(
      "select * from crop where 작물=?",
      req.body.작물,
      function (err, results) {
        if (err) res.send(err);
        else {
          res.send(
            ejs.render(data, {
              data: results,
            })
          );
        }
      }
    );
  });
});

// 팝업 백그라운드 get
/*
    app.get('/sql/realtime/:id', function (req, res) {
      const sqlselect = "select * from crop where 작물=?"

    db.query(sqlselect,req.body,function(err, result, fields){
      if (err) throw err;
      console.log(result);
      res.send('등록이 완료 되었습니다');
    })


    */

// realtime 업데이트 요청 form arudino
/* 
    app.post('/sql/realtime/:id', function (req, res) {
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
    */

// 장치 신호 주는 기능 전송 필요

app.get("/sql/meka", function (req, res) {
  fs.readFile("./lib/mekalist.ejs", "utf8", function (err, data) {
    db.query("select * from meka1", function (err, results) {
      if (err) {
        res.send(err);
      } else {
        res.send(
          ejs.render(data, {
            data: results,
          })
        );
      }
    });
  });
});

app.post("/sql/meka/insert", function (req, res) {
  const body = req.body;
  const sql =
    "insert into meka1 (temperature,	humi,	co2,	waterLevel,	StatTime,	relay1,	relay2,	relay3) values (?, ?, ?, ?, NOW(), ?, ?, ?)";
  db.query(
    sql,
    [
      body.temperature,
      body.humi,
      body.co2,
      body.waterLevel,
      body.relay1,
      body.relay2,
      body.relay3,
    ],
    function (err, result, fields) {
      if (err) {
        console.log(err);
      }
      console.log(result);
      res.redirect("/sql/meka");
    }
  );
});

app.get("/sql/meka/insert", function (req, res) {
  fs.readFile("./lib/meka_insert.html", "utf8", function (err, data) {
    res.send(data);
  });
});

app.get("/sql/meka/delete/:id", function (req, res) {
  const sql = "delete from meka1 where _id=?";
  var id = [req.params.id];

  db.query(sql, id, function (err, result, fields) {
    if (err) {
      console.log(err);
    }
    console.log(result);
    res.redirect("/sql/meka");
  });
});

app.get("/sql/meka/table", (req, res) => {
  const sqlselect = "SELECT * FROM meka1";

  db.query(sqlselect, function (err, result, field) {
    if (err) throw err;
    res.send(result);
  });
});

app.get("/sql/meka/table/final", (req, res) => {
  const sqlselect = "SELECT * FROM meka1 order by _id desc LIMIT 1";

  db.query(sqlselect, function (err, result, field) {
    if (err) throw err;
    res.send(result);
  });
});

// ----------------------------------------------------------- 작물과 장치의 경계선 -------------------------------------------

// insert HTML 파일

app.get("/sql/insert", function (req, res) {
  fs.readFile("./lib/insert.html", "utf8", function (err, data) {
    res.send(data);
  });
});

// insert HTML POST 구현

app.post("/sql/insert", function (req, res) {
  const body = req.body;
  const sql =
    "insert into crop (작물, 온도, 습도, 수위, 심은날짜, 갱신시각, 자동모드) values (?, ?, ?, ?, NOW(), NOW(), ?)";
  db.query(
    sql,
    [body.작물, body.온도, body.습도, body.수위, body.자동모드],
    function (err, result, fields) {
      if (err) {
        console.log(err);
      }
      console.log(result);
      res.redirect("/sql");
    }
  );
});

//삭제
app.get("/sql/delete/:id", function (req, res) {
  const sql = "delete from crop where 작물=?";
  var id = [req.params.id];

  db.query(sql, id, function (err, result, fields) {
    if (err) {
      console.log(err);
    }
    console.log(result);
    res.redirect("/sql");
  });
});

//수정
app.get("/sql/edit/:id", function (req, res) {
  var id = req.params.id;
  const sql = "select * from crop where 작물=?";

  fs.readFile("./lib/edit.ejs", "utf8", function (err, data) {
    db.query(sql, id, function (err, result) {
      res.send(
        ejs.render(data, {
          data: result[0],
        })
      );
      if (err) {
        console.log(err);
      }

      console.log(result);
    });
    if (err) {
      console.log(err);
    }
  });
});

app.post("/sql/edit/:id", function (req, res) {
  const body = req.body;
  var idf = req.params.id;

  const sql =
    "update crop SET 온도=?, 습도=?, 수위=?, 갱신시각=NOW() where 작물=?";
  db.query(
    sql,
    [body.온도, body.습도, body.수위, req.params.id],
    function (error, result) {
      if (error) {
        console.log(error);
      }
      console.log(result);
      console.log("update SQL");
      res.redirect("/sql");
    }
  );
});

// post방식으로 automate 작동 여부 T/F 로

// DB 라인 추가해야함
/* app.post('/sql/auto/:id', function (req, res) {
    const body = req.body
    var idf = req.params.id;

    const sql = 'update crop SET automate=? 갱신시각=NOW() where 작물=?';
    db.query(sql,[
      body.automate, 
      req.params.id
    ], function (error, result) {
      if(error){console.log(error);}
        console.log(result)
      console.log('update SQL')
      res.redirect('/sql')
    })
  })
  */

// raw DB table 읽기

app.get("/sql/table", (req, res) => {
  const sqlselect = "SELECT * FROM crop";

  db.query(sqlselect, function (err, result, field) {
    if (err) throw err;
    res.send(result);
  });
});

// json 전체 DB 값 가져오기

app.post("/sql/table", (req, res) => {
  const sqlselect = "INSERT INTO crop SET ?";

  db.query(sqlselect, req.body, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.send("등록이 완료 되었습니다");
  });
});

// CSS JS ASSETS db는 안쓸수도 있음

app.use("/css", express.static(__dirname + "/smartfarm/css"));
app.use("/js", express.static(__dirname + "/smartfarm/js"));
app.use("/assets", express.static(__dirname + "/smartfarm/assets"));
app.use("/db", express.static(__dirname + "/smartfarm/DB"));

app.listen(80, function () {
  console.log("listening on 80");
});
