const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser');
const {User} = require('./models/User');

const config = require('./config/dev');

//application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended:true}));
//application/json
app.use(bodyParser.json());

//mongoDB
const mongoose = require('mongoose')
mongoose.connect(config.mongoURI,
{useNewUrlParser : true,useUnifiedTopology:true,useCreateIndex:true,useFindAndModify:false}
).then(()=> console.log('MongoDb Connected..')).catch(err=>console.log(err));




app.get('/',(req,res)=>{
    res.send('Hello World \n 안녕하세요!!!!')
})

app.post('/register',(req,res)=>{
    //회원 가입할때 필요한 정보들을 client에서 가져와서 DB에 넣어준다


    const user = new User(req.body)
    user.save((err,userInfo)=>{
        if(err) return res.json({success:false,err})

        return res.status(200).json({success:true})
    })
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))