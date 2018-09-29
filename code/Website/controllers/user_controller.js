var UserModel = require('../models/football_user.js');

/**
 * user_controller.js
 *
 * @description :: Server-side logic for managing Users.
 */
let Service = {};

/**
 *
 * @param req
 * @param res
 * @returns {*}
 */
Service.signup = function (req, res) {
    return res.json({message: "Signed UP!"});
};

/**
 * UserController.list()
 */
Service.list = function (req, res) {
    UserModel.find(function (err, Users) {
        if (err) {
            return res.status(500).json({
                message: 'Error when getting User.',
                error: err
            });
        }
        return res.json(Users);
    });
};

/**
 * UserController.show()
 */
Service.show = function (req, res) {
    var id = req.params.id;
    UserModel.findOne({_id: id}, function (err, User) {
        if (err) {
            return res.status(500).json({
                message: 'Error when getting User.',
                error: err
            });
        }
        if (!User) {
            return res.status(404).json({
                message: 'No such User'
            });
        }
        return res.json(User);
    });
};

/**
 * UserController.create()
 */
Service.create = function (req, res) {
    var User = new UserModel({
        email: req.body.email,
        password: req.body.password,
        last_login: req.body.last_login,
        subscription_expiration: req.body.subscription_expiration,
        teams: req.body.teams,
        player: req.body.player,
        coach: req.body.coach
    });

    User.save(function (err, User) {
        if (err) {
            return res.status(500).json({
                message: 'Error when creating User',
                error: err
            });
        }
        return res.status(201).json(User);
    });
};

/**
 * UserController.update()
 */
Service.update = function (req, res) {
    var id = req.params.id;
    UserModel.findOne({_id: id}, function (err, User) {
        if (err) {
            return res.status(500).json({
                message: 'Error when getting User',
                error: err
            });
        }
        if (!User) {
            return res.status(404).json({
                message: 'No such User'
            });
        }

        User.email = req.body.email ? req.body.email : User.email;
        User.password = req.body.password ? req.body.password : User.password;
        User.last_login = req.body.last_login ? req.body.last_login : User.last_login;
        User.subscription_expiration = req.body.subscription_expiration ? req.body.subscription_expiration : User.subscription_expiration;
        User.teams = req.body.teams ? req.body.teams : User.teams;
        User.player = req.body.player ? req.body.player : User.player;
        User.coach = req.body.coach ? req.body.coach : User.coach;

        User.save(function (err, User) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when updating User.',
                    error: err
                });
            }

            return res.json(User);
        });
    });
};

/**
 * UserController.remove()
 */
Service.remove = function (req, res) {
    var id = req.params.id;
    UserModel.findByIdAndRemove(id, function (err, User) {
        if (err) {
            return res.status(500).json({
                message: 'Error when deleting the User.',
                error: err
            });
        }
        return res.status(204).json();
    });
};

/**
 * UserController.remove()
 */
Service.aggregate_profile = function (req, res) {
    let id = req.params.id;
    let profile_id = req.body.id;

    UserModel.aggregateProfile(profile_id, id, (err, user_info) => {
        if (err) {
            return res.status(500).json({
                message: 'Error when aggregating user_info',
                error: err
            });
        }
        if (!user_info) {
            return res.status(404).json({
                message: 'No such user_info'
            });
        }
        return res.json(user_info);
    })
};



module.exports = Service;