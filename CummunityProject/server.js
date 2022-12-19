const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}));
const MongoClient = require('mongodb').MongoClient;
app.set('view engine', 'ejs');
app.use('/public', express.static('public'));
const methodOverride = require('method-override')
app.use(methodOverride('_method'))
require('dotenv').config()
const {ObjectId} = require('mongodb');
var db;

const http = require('http').createServer(app);
const { Server } = require("socket.io");
const io = new Server(http);

MongoClient.connect(process.env.DB_URL, function(에러, client){
    if(에러) return console.log(에러)

    db = client.db('todoapp');

    http.listen(8090, function(){
        console.log('listening on 8090')
    });

});



app.get('/', function(요청, 응답){
    응답.render('index.ejs')
});

app.get('/write', function(요청, 응답){
    응답.render('write.ejs')
});


app.get('/upload', function(요청, 응답){
    응답.render('upload.ejs')
});

// 이미지 하드에 저장하기
let multer = require('multer');
var storage = multer.diskStorage({

  destination : function(req, file, cb){
    cb(null, './public/image')
  },
  filename : function(req, file, cb){
    cb(null, file.originalname ) // + '날짜' + newDate()하면 날짜도 들어감
  },
  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if(ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
        return callback(new Error('PNG, JPG만 업로드하세요'))
    }
    callback(null, true)
  },
  // limits : 파일사이즈

});

var upload = multer({storage : storage});
                        //여러장 최대 10장 upload.array('프로필', 10)
app.post('/upload', upload.single('프로필'), function(요청, 응답){
    응답.send('업로드완료')
  }); 


app.get('/image/:imageName', function(요청, 응답){
    응답.sendFile( __dirname + '/public/image' + 요청.params.이미지이름)
})



app.get('/list', function(요청, 응답){ //모든 데이터 가져오기
    db.collection('post').find().toArray(function(에러, 결과){
        console.log(결과);
        응답.render('list.ejs', { posts : 결과 });
    }); 
});
/*
app.get('/search', (요청, 응답)=>{
    console.log(요청.query);
    db.collection('post').find({$text : {제목:요청.query.value}}).toArray((에러, 결과)=>{
        console.log(결과)
        응답.render('search.ejs', {posts : 결과})
    })
})
*/
app.get('/search', (요청, 응답)=>{
    var 검색조건 = [
        {
          $search: {
            index: 'titleSearch',
            text: {
              query: 요청.query.value,
              path: '제목'  // 제목날짜 둘다 찾고 싶으면 ['제목', '날짜']
            }
          }
        },
        //{ $sort : { _id : 1}},
        //{ $limit : 10}
        { $project : { 제목: 1, _id: 0, score: { $meta: "searchScore"}}}
      ] 
    console.log(요청.query);
    db.collection('post').aggregate(검색조건).toArray((에러, 결과)=>{
        console.log(결과);
        응답.render('search.ejs', { posts : 결과})
    })
});






app.get('/detail/:id', function(요청, 응답){
    db.collection('post').findOne({ _id : parseInt(요청.params.id) }, function(에러, 결과){
      응답.render('detail.ejs', {data : 결과} )
    })
  });

app.get('/edit/:id', function(요청, 응답){
    db.collection('post').findOne({_id : parseInt(요청.params.id)}, function(에러, 결과){
        응답.render('edit.ejs', {post : 결과})
    })
  });

app.put('/edit', function(요청, 응답){
db.collection('post').updateOne({ _id : parseInt(요청.body.id) }, { $set : { 제목 : 요청.body.title, 날짜 : 요청.body.date }}, function(에러, 결과){ 
    console.log('수정완료')
    응답.redirect('/list')
})

});















// 로그인기능
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const e = require('express');

app.use(session({secret : '비밀코드', resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());


app.get('/login', function(요청, 응답){
    응답.render('login.ejs')
});

app.get('/regist', function(요청, 응답){
  응답.render('regist.ejs')
});

app.post('/login', passport.authenticate('local', {
    failureRedirect : '/fail'
}), function(요청, 응답){
    응답.redirect('/')
});

// 미들웨어 : 서로다른 애플리케이션끼리 통신을 도와주는
app.get('/mypage', 로그인했니, function(요청, 응답){
    console.log(요청.user);
    응답.render('mypage.ejs', {사용자 : 요청.user})
});

app.get('/write', 로그인했니, function(요청, 응답){ 
    console.log(요청.user);
    응답.render('write.ejs')
}); 


function 로그인했니(요청, 응답, next){
    if (요청.user){
        next()
    } else {
        //응답.send('로그인 안하셨는데요?')
        응답.write("<script>alert('please login')</script>")
        응답.write("<script>window.location=\"/login\"</script>");
    }
}



// 아이디 비번 검증
passport.use(new LocalStrategy({
    usernameField: 'id',    //유저가 입력한 아이디/비번 항목이 뭔지 정의(name 속성)
    passwordField: 'pw',
    session: true,
    passReqToCallback: false,
  }, function (입력한아이디, 입력한비번, done) {
    console.log(입력한아이디, 입력한비번);
    db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
      if (에러) return done(에러)
  
      if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })
      if (입력한비번 == 결과.pw) {
        return done(null, 결과)
      } else {
        return done(null, false, { message: '비번틀렸어요' })
      }
    })
  }));


// id를 이용해서 세션을 저장시키는 코드 (로그인 성공시 발동)
passport.serializeUser(function (user, done) {
    done(null, user.id)
});

// 이 세션 데이터를 가진 사람을 DB에서 찾아줘라
passport.deserializeUser(function (아이디, done) {
    db.collection('login').findOne({ id: 아이디 }, function (에러, 결과) {
      done(null, 결과)
    })
  }); 


app.post('/register', function(요청, 응답){
    db.collection('login').insertOne({ id : 요청.body.id, pw : 요청.body.pw}, function(에러, 결과){
        응답.redirect('/')
    } )
})



// 글쓰기

// 누가 폼에 /add로 POST 요청을 하면
app.post('/add', function(요청, 응답){
  응답.send('접속됨?')
    db.collection('counter').findOne({name : '게시물갯수'}, function(에러, 결과){
        console.log(결과.totalPost) // 총게시물갯수를 변수에 저장 
        var 총게시물갯수 = 결과.totalPost;

        var 저장할거 = { _id : 총게시물갯수 + 1, 작성자 : 요청.user._id, 제목 : 요청.body.title, 날짜 : 요청.body.date}
        //이제 db.post에 새게시물 기록함, 총게시물갯수에 +1을 해준다
        db.collection('post').insertOne(저장할거, function(에러, 결과){
            console.log('저장완료');
            // counter라는 콜렉션에 있는 totalPost 라는 항목도 1 증가시켜야한다.
            db.collection('counter').updateOne({name:'게시물갯수'},{ $inc : {totalPost:1}})
                                                                    //opertaor 연산자 $set = 바꿀 값
                                                                    // $inc = 기존값에 더해줄 값 음수도 가능
        });

    });
    
});





// 삭제기능
app.delete('/delete', function(요청, 응답){
    console.log(요청.body);
    요청.body._id = parseInt(요청.body._id);
    //요청.body에 담겨온 게시물번호를 가진 글을 db에서 찾아서 삭제해주세요

    var 삭제할데이터 = { _id : 요청.body._id, 작성자 :  요청.user._id}

    db.collection('post').deleteOne(삭제할데이터, function(에러, 결과){ //삭제가 되었으면 실행해주세요
        console.log('삭제완료');
        if (에러) {console.log(에러)}
        응답.status(200).send({ message : '성공했습니다.'});
    })
});





app.post('/chatroom', function(요청, 응답){

  var 저장할거 = {
    title : '무슨무슨채팅방',
    member : [ObjectId(요청.body.당한사람id), 요청.user._id],
    date : new Date()
  }

  db.collection('chatroom').insertOne(저장할거).then(function(결과){
    응답.send('저장완료')
  });
});



app.get('/cummu', 로그인했니, function(요청, 응답){ 

  db.collection('chatroom').find({ member : 요청.user._id }).toArray().then((결과)=>{
    console.log(결과);
    응답.render('cummu.ejs', {data : 결과})
  })

}); 


app.post('/message', 로그인했니, function(요청, 응답){
  var 저장할거 = {
    parent : 요청.body.parent,
    userid : 요청.user._id,
    content : 요청.body.content,
    date : new Date()
  }
  db.collection('message').insertOne(저장할거)
  .then((결과)=>{
    응답.send(결과);
  })
}); 

app.get('/message/:parentid', 로그인했니, function(요청, 응답){

  응답.writeHead(200, {
    "Connection": "keep-alive",
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
  });

  db.collection('message').find({ parent: 요청.params.parentid }).toArray()
  .then((결과)=>{
    console.log(결과);
    응답.write('event: test\n');
    응답.write(`data: ${JSON.stringify(결과)}\n\n`);
  });


  const 찾을문서 = [
    { $match: { 'fullDocument.parent': 요청.params.parentid } }
  ];

  const changeStream = db.collection('message').watch(찾을문서);
  changeStream.on('change', result => {
    console.log(result.fullDocument);
    var 추가된문서 = [result.fullDocument];
    응답.write(`data: ${JSON.stringify(추가된문서)}\n\n`);
  });

});



app.get('/socket', function(요청, 응답){
  응답.render('socket.ejs')
})

app.get('/cummu', function(요청, 응답){
  응답.render('cummu.ejs')
})

// 누가 웹소켓 접속하면 내부 코드를 실행해줘라

io.on('connection', function(socket){
  console.log('유저접속됨');


  socket.on('user-send', function(data){
    io.emit('broadcast', data)
  });
})

app.get('/list', function(요청, 응답){ //모든 데이터 가져오기
    db.collection('post').find().toArray(function(에러, 결과){
        console.log(결과);
        응답.render('list.ejs', { posts : 결과 });
    }); 
});




/*
io.on('connection', function(socket){
  console.log(socket.id);
  socket.on('user-send', function(data){
    io.to(socket.id).emit('broadcast', data)
  });

})
*/