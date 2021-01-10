var DB = require('../model/DB.js');

var express = require('express');
var router = express.Router();
var crypto = require('crypto');


/* GET users listing. */
router.use('*', function(req, res, next) {

    delete req.body.isAdmin;
    console.log(req.body);
    next();
});

router.post('*', function(req, res, next) {
    if (!req.body.passwd) {
        return res.send(400, {
            RM: 'passwd required'
        });
    };

    next();
});

router.get('/session', function(req, res, next) {
    return res.send(req.session);
});



/////////////// private method ///////////////

function createToken() {
    var current_date = (new Date()).valueOf().toString();
    var random = Math.random().toString();
    return crypto.createHash('sha1').update(current_date + random).digest('hex');
}


express.response.toJSON = function(obj) {
    obj = obj.toObject();
    delete obj.passwd;
    delete obj.__v;
    return this.send(obj);
};


module.exports = router;
