const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const methodOverride = require('method-override')
const redis = require('redis')

// Redis
let client = redis.createClient()
client.on('connect',()=>console.log('connected to redis'))

// Init app
const app = express()

// View Engine
app.set('view engine','pug')
app.set('views',path.join(__dirname,'views'))

// BodyParser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

// For public files
app.use(express.static(path.join(__dirname,'/public')))

// MethodOverride
app.use(methodOverride('_method'))

// Routes
app.get('/',(req,res)=>{
    res.render('searchUsers')
})

app.get('/user/add',(req,res)=>{
    res.render('addUser')
})

app.post('/user/add',(req,res)=>{
    let id = req.body.id,
        first_name = req.body.first_name,
        last_name = req.body.last_name,
        email = req.body.email,
        phone = req.body.phone

    client.hmset(id,[
        'first_name', first_name,
        'last_name', last_name,
        'email', email,
        'phone', phone
    ],(err,reply)=>{
        if(err) throw err
        console.log(reply)
        res.redirect('/')
    })

})

app.delete('/user/delete/:id',(req,res)=>{
    client.del(req.params.id)
    res.redirect('/')
})

app.post('/user/search',(req,res)=>{
    let id = req.body.id
    client.hgetall(id,(err,obj)=>{
        if(!obj){
            res.render('searchUsers',{
                error: 'User does not exist'
            })
        }else{
            obj.id = id
            res.render('details',{
                user: obj
            })
        }
    })
})
// Listening for server
app.listen(1000,()=>console.log('Listening on 1000'))