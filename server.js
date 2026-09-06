const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Connect DB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(()=> console.log('MongoDB Connected')).catch(err=> {
  console.log('MongoDB Error', err.message);
});

// Load routes safely - fixes the Object bug
function loadRoute(path, routePath){
  try{
    const mod = require(routePath);
    const router = mod.router || mod.default || mod;
    if(typeof router === 'function' || (router && typeof router.stack !== 'undefined')){
      app.use(path, router);
      console.log('Loaded '+path);
    } else {
      console.log('Skipped '+path+' - not a router, got: '+typeof router);
    }
  }catch(e){
    console.log('Failed '+path+': '+e.message);
  }
}

loadRoute('/api/auth', './routes/auth');
loadRoute('/api/games', './routes/games');
loadRoute('/api/codes', './routes/codes');
loadRoute('/api/payment', './routes/payment');
loadRoute('/api/user', './routes/user');

app.get('/api/health', (req,res)=> res.json({status:'Server is running', site:'Spinit'}));

app.get('*', (req,res)=>{
  res.sendFile(__dirname+'/public/index.html', err=>{
    if(err) res.json({message:'Spinit API running'});
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', ()=> console.log('Server running on '+PORT));
