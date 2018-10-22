const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const path = require('path')
const mongoose = require('mongoose')
const flash = require('express-flash')
const session = require('express-session')
const validate = require('mongoose-validator')

app.use(bodyParser.urlencoded({ extended: true}))
app.use(express.static(path.join(__dirname, './static')))
app.use(session({secret: 'keyboardkitteh', name: 'session_id', saveUninitialized: true, cookie: {maxAge: 60000}}))
app.use(flash())

app.set('views', path.join(__dirname, './views'))
app.set('view engine', 'ejs')

mongoose.connect('mongodb://localhost/quoting-dojo')






let nameValidator = [
  validate({
    validator: 'isLength',
    arguments: [2, 50],
    message: 'Name should be between {ARGS[0]} and {ARGS[1]} characters, idiot',
  }),
  validate({
    validator: 'isAlphanumeric',
    passIfEmpty: true,
    message: 'Name should contain alpha-numeric characters only',
  }),
]

let quoteValidator = [
  validate({
    validator: 'isLength',
    arguments: [3, 50],
    message: 'Age should be between {ARGS[0]} and {ARGS[1]} characters',
  }),
  validate({
    validator: 'isAlphanumeric',
    passIfEmpty: true,
    message: 'Quote should contain alpha-numeric characters only',
  }),
]
let QuoteSchema = new mongoose.Schema({
  name: {type: String, required: true},
  quote: {type: String, required: true}
}, {timestamps: true})

mongoose.model('Quote', QuoteSchema)
let Quote = mongoose.model('Quote')

app.get('/', function(req, res){
  res.render('index')
})


app.get('/quotes', function(req, res){
  Quote.find({}, function(err, quotes){
    if (err) {
      console.log('Loading Database Error', err)
      for(let key in err.errors){
        req.flash('No quotes found', err.errors[key].message)
      }
    } else {
      console.log('Loading Database Success')
      console.log(quotes)
      res.render('quotes', {quotes:quotes})
    }
  })
})



app.post('/quotes', function(req, res){

  let quote = new Quote({
    name: req.body.name,
    quote: req.body.quote
  })
  quote.save(function(err){
    if(err){
      console.log('Saving Error', err)
      for(let key in err.errors){
        req.flash('registration', err.errors[key].message)
      }
      res.redirect('/')
    } else {
      console.log('Quote added')
      res.redirect('/quotes')
    }
  })
})

app.listen(3791, function(){
  console.log('***************************')
  console.log('One Ring to Rule the Server')
  console.log('********** 3791 ***********')
})
