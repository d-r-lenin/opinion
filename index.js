require('dotenv').config();
const express = require('express');
const cookieSession = require('cookie-session');
const mongoose = require('mongoose');

const Name = require('./models/Names')

const PORT = process.env.PORT || 3000;

const app = express();

mongoose.connect(process.env.DB_STRING, (e) => {
    app.listen(PORT, () => {
        console.log("on port::" + PORT);
    })
})

app.set('view engine','ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({ extended:true}))
app.use(cookieSession({
    name: 'session',
    keys: ['mykeyysjsjsj'],
    maxAge: 2000 * 60 * 60 * 1000
}))

app.get('/',(req,res)=>{
    res.render("index");
})

app.get('/create',(req,res)=>{
    res.render('create')
})

app.post('/create',(req,res)=>{
    const name = new Name({
        name:req.body.name
    });
    const id = name.save();
    req.session.id = name.id;
    res.redirect('/profile/'+name.id)
})

app.get('/profile/:id',async(req,res)=>{
    if(!req.session.id){
        res.redirect('/create');
    }
    if(req.session.id !== req.params.id){
        res.redirect('/comment/'+req.params.id);
    }
    const obj = {
        name: "",
        link: "",
        results: []
    }
    try{
        const data = await Name.findById(req.session.id);
        obj.name = data.name;
        obj.link = process.env.HOST_URL+'/comment/'+ data.id,
        obj.results = data.texts || [];
    }catch(e){
        console.log(e);
        res.redirect('/create')
    }
    res.render('view',obj);
})

app.get('/comment/:id',async(req,res)=>{
    const obj = {
        name: "",
        id: ''
    }
    try {
        const data = await Name.findById(req.params.id);
        obj.name = data.name;
        obj.id = data.id;
        res.render('write', obj);
    } catch (error) {
        res.send('faield');
        console.log(error);
    }
})


app.post('/comment',async(req,res)=>{
    try {
        const oldData = await Name.findById(req.body.id);
        const texts = oldData.texts;
        texts.push(req.body.text)
        const data = await Name.findByIdAndUpdate(req.body.id, { $set: { texts:texts } });
        res.redirect('/');
    } catch (error) {
        console.log(error)
        res.redirect('comment');
    }
})