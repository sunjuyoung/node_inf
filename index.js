const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const {auth} = require('./middleware/auth');
const {User} = require('./models/User');

const config = require('./config/dev');

//application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended:true}));
//application/json
app.use(bodyParser.json());

//cookieparser
app.use(cookieParser());


//mongoDB 연결  
const mongoose = require('mongoose')
mongoose.connect(config.mongoURI,
{useNewUrlParser : true,useUnifiedTopology:true,useCreateIndex:true,useFindAndModify:false}
).then(()=> console.log('MongoDb Connected..')).catch(err=>console.log(err));




app.get('/',(req,res)=>{
    res.send('Hello World \n 안녕하세요!!!!')
})

app.post('/api/user/register',(req,res)=>{
    //회원 가입할때 필요한 정보들을 client에서 가져와서 DB에 넣어준다
    const user = new User(req.body)

    user.save((err,userInfo)=>{
        if(err) return res.json({success:false,err})

        return res.status(200).json({success:true})
    })
})

app.post('/api/user/login',(req,res)=>{
    //요청된 이메일을 데이터베이스에서 있는지 찾는다
    //mongoDB 제공하는 메소드 findOne

    User.findOne({email:req.body.email},(err,user)=>{
        if(!user){return res.json({loginSuccess:false,message:"제공된 이메일에 해당하는 유저가 없습니다."})}
        
        //요청된 이메링이 데이터 베이스에 있다면 비밀번호가 같은지 확인
        user.comparePassword(req.body.password,(err,isMatch)=>{
            if(!isMatch)
            return res.json({loginSuccess:false,message:"비밀번호가 틀렸습니다."})

            //jsonwebtoken  //비밀번호가 맞다면 토큰을 생성하기
            user.generateToken((err,user)=>{
                if(err)return res.status(400).send(err);

                //토큰을 저장한다. 쿠키,로컬
                res.cookie("x_auth",user.token)
                .status(200)
                .json({loginSuccess:true,userId:user._id})
            })
        })
    })   
         
       app.get('/api/user/auth', auth, (req,res)=>{

        //미들웨어 통과했다면 authentication 이 true
        res.status(200).json({_id:req.user._id,isAdmin:req.user.role ===0 ? false:true,isAuth:true,
        email:req.user.email,name:req.user.name,role:req.user.role})

       })

       
       app.get('/api/user/logout',auth,(req,res)=>{
           User.findOneAndUpdate({_id:req.user._id},
            
            {token:""},
            (err,user)=>{
                if(err)return res.json({success:false,err});
                return res.status(200).json({success:true})
            })
       })
   

   
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))