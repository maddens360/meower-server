const express = require('express');
const cors = require('cors');
const Datastore = require('nedb');
const Filter = require('bad-words');
const rateLimit = require("express-rate-limit");
// require('dotenv').config();
const app = express();


const mews = new Datastore("database.db");
mews.loadDatabase();
const filter = new Filter();


app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.json({
        message: 'Meower!'
    });
});

app.get('/mews', (req, res) => {
    mews.find({}, (err, data)=>{
        if(err){
            res.end();
            return;
        }
        res.json(data);
    });
});

function isValidMew(mew){
    return mew.name && mew.name.toString().trim() !== '' &&
    mew.content && mew.content.toString().trim() !== '';
}

app.use(
  rateLimit({
    windowMs: 30 * 1000, // every 30 seconds
    max: 1 // limit each IP to 100 requests per windowMs
  })
);

app.post('/mews',(req,res) =>{
    console.log(req.body);
    if(isValidMew(req.body)){
        const mew = {
            name:filter.clean(req.body.name.toString()),
            content:filter.clean(req.body.content.toString()),
            created:new Date()
        };

        mews
            .insert(mew)
            .then(createdMew => {
                res.json(createdMew);
            });

    } else {
        res.status(422);
        res.json({
            message: 'hey,name and content are required'
        });
    }
});

app.listen(5000, () => {
    console.log('Listening on http://localhost:5000');
});