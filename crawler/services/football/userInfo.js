"use strict";

const UserInfoSeason = require("../../models/football_user_info_season");
const UserInfo = require("../../models/football_user_info");

function _updateRegex(regex) {
  if (!regex) {
    regex = "##";
  }

  regex = regex.slice(0, -1); // remove the last character "#"

  regex += "!"; //close game partition

  return regex + "#"; //close regex
}

exports.updateRecommendationRegex = function(user_info, cb) {
  const query = { _id: user_info._id };

  const update = {
    $set: {
      actions_regex: _updateRegex(user_info.actions_regex)
    }
  };

  UserInfo.findOneAndUpdate(query, update, { upsert: true }, cb);
};

exports.getMatchUserInfos = function(homeTeam, awayTeam, cb) {
  let query = [
    {
      $facet: {
        home_team: [
          {
            $match: {
              _id: { $in: homeTeam.main_lineup }
            }
          }
        ],
        home_team_reserves: [
          {
            $match: {
              _id: { $in: homeTeam.reserves }
            }
          }
        ],
        home_team_staff: [
          {
            $match: {
              _id: { $in: homeTeam.staff }
            }
          }
        ],
        away_team: [
          {
            $match: {
              _id: { $in: awayTeam.main_lineup }
            }
          }
        ],
        away_team_reserves: [
          {
            $match: {
              _id: { $in: awayTeam.reserves }
            }
          }
        ],
        away_team_staff: [
          {
            $match: {
              _id: { $in: awayTeam.staff }
            }
          }
        ]
      }
    }
  ];

  UserInfo.aggregate(query, cb);
};

exports.getUserInfosByUpdatedAt = function(updated_at, cb) {
  const query = {
    updated_at: { $gt: updated_at }
  };

  UserInfo.find(query)
    .populate("current_season")
    .populate("user_id")
    .exec(cb);
};

exports.updateByZeroZeroId = function(zerozero_id, user_info, cb) {
  const query = { "external_ids.zerozero": zerozero_id };

  UserInfo.findOneAndUpdate(
    query,
    user_info,
    { upsert: true, new: true, setDefaultsOnInsert: true },
    cb
  );
};

exports.updateUserInfosCurrentSeason = function(seasons, cb) {
  let operations = [];

  seasons.forEach(function(season) {
    let user_info_season = season._doc;

    operations.push({
      updateOne: {
        filter: {
          _id: user_info_season.user_info_id
        },
        update: {
          $set: {
            current_season: user_info_season._id
          },
          $push: {
            previous_seasons: user_info_season._id
          }
        }
      }
    });
  });
  UserInfo.bulkWrite(operations, {}, cb);
};

exports.addRecommendation = function(recommendation, user_info_id, cb) {
  let recommendation_id = recommendation._id;

  const query = {
    _id: user_info_id
  };

  const update = {
    $push: {
      "recommendations.list": recommendation_id,
      "recommendations.top_5": recommendation
    }
  };

  UserInfo.findOneAndUpdate(query, update, cb);
};

exports.editRecommendation = function(recommendation, user_info_id, cb) {};

exports.deleteRecommendation = function(recommendation, user_info_id, cb) {};

exports.addSkillVote = function(skill_name, author_user_id, user_info_id, cb) {
  const query = {
    _id: user_info_id,
    "skill_set.name": { $ne: skill_name }
  };

  const update = {
    $addToSet: {
      skill_set: {
        name: skill_name
      }
    }
  };

  UserInfo.update(query, update, (err, result) => {
    if (err) cb(err);

    const query = {
      _id: user_info_id,
      "skill_set.name": skill_name
    };

    const update = {
      $push: {
        "skill_set.$.endorsements": author_user_id
      }
    };

    UserInfo.findOneAndUpdate(query, update, { new: true }, cb);
  });
};

exports.setAllSkillVotes = function(cb) {
  let start_up_arrays = [
    {
      name: "Goleador",
      avatar: "/assets/scorer.png",
      endorsements: []
    },
    {
      name: "Drible",
      avatar: "/assets/dribble.png",
      endorsements: []
    },
    {
      name: "Rapidez",
      avatar: "/assets/fast.png",
      endorsements: []
    },
    {
      name: "Passador",
      avatar: "/assets/passer.png",
      endorsements: []
    },
    {
      name: "Força",
      avatar: "/assets/strong.png",
      endorsements: []
    },
    {
      name: "Muralha defensiva",
      avatar: "/assets/defender.png",
      endorsements: []
    }
  ];

  let conditions = { type: 1 };
  let update = {
    $set: {
      skill_set: start_up_arrays
    }
  };
  let options = { multi: true };

  UserInfo.update(conditions, update, options, cb);
};

exports.follow = function(follower_id, user_info_id, cb) {
  let operations = [];

  operations.push({
    updateOne: {
      filter: {
        _id: user_info_id
      },
      update: {
        $push: {
          followers: follower_id
        }
      }
    }
  });

  operations.push({
    updateOne: {
      filter: {
        _id: follower_id
      },
      update: {
        $push: {
          following: user_info_id
        }
      }
    }
  });

  UserInfo.bulkWrite(operations, {}, cb);
};

exports.unfollow = function(unfollower_id, user_info_id, cb) {
  let operations = [];

  operations.push({
    updateOne: {
      filter: {
        _id: user_info_id
      },
      update: {
        $pull: {
          followers: unfollower_id
        }
      }
    }
  });

  operations.push({
    updateOne: {
      filter: {
        _id: unfollower_id
      },
      update: {
        $pull: {
          following: user_info_id
        }
      }
    }
  });

  UserInfo.bulkWrite(operations, {}, cb);
};

exports.updateRegexNewMatch = function(regexes, cb) {
  let operations = [];

  Object.keys(regexes).forEach(function(user_info_id) {
    operations.push({
      updateOne: {
        filter: {
          _id: user_info_id
        },
        update: {
          $set: {
            actions_regex: regexes[user_info_id]
          }
        }
      }
    });
  });

  UserInfo.bulkWrite(operations, {}, cb);
};

exports.addAchievementToUserInfo = function(achievement, user_info, cb) {
  const query = {
    _id: user_info._id,
    "achievements.id": { $ne: achievement._id }
  };

  const update = {
    $push: {
      achievements: {
        id: achievement._id,
        name: achievement.name,
        avatar: achievement.avatar
      }
    }
  };

  UserInfo.findOneAndUpdate(query, update, cb);
};

exports.addMedia = function(id, media, cb) {
  /*
    * This is not yet implemented because the DB structure is not well done.
    *
    * We should have something like this "media" field in the document
    * And then add here like this
    *
    * let update = {
        $addToSet: {
            "media": {

            }
        }
    };

    But for now, we'll just insert the media in the user's current season object.
    * */

  UserInfo.findOne({ _id: id }, (err, userInfo) => {
    let userInfoSeasonId = userInfo.current_season._id;

    UserInfoSeason.addMedia(media, userInfoSeasonId, (err, userInfoSeason) => {
      if (err) {
        cb(err);
      }
      cb(userInfoSeason);
    });
  });
};
