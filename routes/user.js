var DB = require('../model/DB.js');

var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
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

router.post('/sign', function(req, res, next) {

    DB.User.findOne({
        '_id': req.body.id
    }, function(err, user) {
        if (err) return res.send(400, err);

        if (user) { //exists

            if (bcrypt.compareSync(req.body.passwd, user.passwd)) {
                req.session.user = user;
                return res.toJSON(user);
            } else {
                res.send(400, {
                    RM: 'user avaiable'
                });
            }
        } else { //sign up

            var salt = bcrypt.genSaltSync(10);
            var hashedPassword = bcrypt.hashSync(req.body.passwd, salt);

            DB.User.create({
                '_id': req.body.id,
                passwd: hashedPassword,
                thumbnailURL: req.body.thumbnailURL,
                userName: req.body.userName,
                token: createToken()
            }, function(err, user) {
                if (err) res.send(400, {
                    RM: 'error creating user',
                    err: err
                });

                req.session.user = user;

                return res.toJSON(user);
            });
        }
    });
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
