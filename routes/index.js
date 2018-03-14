var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');


router.use(bodyParser.json()); // support json encoded bodies
router.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

/* GET home page. */
router.get('/', function(req, res, next) {
  var qs = require('../quickstart');
  qs.init(function(guests){

    res.render('index', { title: 'RSVP', guests: guests });
  });
});
router.get('/hello', function(req, res){
  res.send('hello world');
});

router.get('/leads', function(req, res, next) {
    var qs = require('../leads');
    qs.init(function(leads){

        res.render('leads', { title: 'Leads', guests: leads });
    });
});
router.post('/post', function(req, res){
  if(req.body){
    console.log('req.body:', req.body);
  }
  var qs = require('../quickstart');
  qs.writeGuest(req.body, function(){
    qs.init(function(guests){
      res.render('index', { title: 'RSVP', guests: guests });
    });
  });

});

module.exports = router;
