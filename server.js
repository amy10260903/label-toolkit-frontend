const path = require('path');
const express = require('express');
const app = express();
const router = express.Router();

const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT || 8080;

// View engine setup
app.set('views', path.join(__dirname,'/views'));
app.set("view options", {layout: false});
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

// Router setup
router.get('/',function(req,res){
  res.render('index');
});

router.get('/demo',function(req,res){
  res.render('demo', { APP_API_BASE_URL: process.env.APP_API_BASE_URL});
});

app.use(express.static(__dirname), router);
app.listen(PORT, function() {
	console.log('Label Toolkit listening on port ' + PORT);
});
