"use strict";

const _ = require("underscore");
const TeamSeason = require("./../../models/football_team_season");

exports.addMedia = function(id, media, cb) {
  let update = {
    $addToSet: {
      media: media
    }
  };
  TeamSeason.findOneAndUpdate(
    { _id: id },
    update,
    { setDefaultsOnInsert: true },
    cb
  );
};

exports.getMissingTeams = function(teamIds, cb) {
  return TeamSeason.find(
    { "external_ids.zerozero": { $in: teamIds } },
    function(err, teams) {
      if (teams && !err) {
        teams = _.difference(
          teamIds,
          teams.map(team => team.external_ids.zerozero)
        );
      }
      cb(err, teams);
    }
  );
};

exports.addCompetitionToTeam = function(id, competition_season, cb) {
  let query = {
    _id: id,
    "standings.id": { $ne: competition_season._id }
  };

  let update = {
    $addToSet: {
      standings: {
        id: competition_season._id,
        competition_id: competition_season.competition_id,
        name: competition_season.name,
        avatar: competition_season.avatar
      }
    }
  };

  TeamSeason.findOneAndUpdate(query, update, { setDefaultsOnInsert: true }, cb);
};

exports.addPlayerToTeam = function(id, user_info_season, cb) {
  let query = {
    _id: id,
    "players.id": { $ne: user_info_season._id }
  };

  let update = {
    $addToSet: {
      players: {
        id: user_info_season._id,
        user_info_id: user_info_season.user_info_id,
        age: user_info_season.age,
        name: user_info_season.personal_info.name,
        number: user_info_season.personal_info.number,
        avatar: user_info_season.personal_info.avatar,
        nationality: user_info_season.personal_info.nationality,
        positions: user_info_season.personal_info.positions
      }
    }
  };

  TeamSeason.findOneAndUpdate(query, update, { setDefaultsOnInsert: true }, cb);
};

exports.getMatchTeamsByZeroZeroId = function(
  season_id,
  homeTeam,
  awayTeam,
  cb
) {
  let query = [
    {
      $facet: {
        home_team: [
          {
            $match: {
              season_id: season_id,
              "external_ids.zerozero": +homeTeam
            }
          }
        ],
        away_team: [
          {
            $match: {
              season_id: season_id,
              "external_ids.zerozero": +awayTeam
            }
          }
        ]
      }
    }
  ];

  TeamSeason.aggregate(query, cb);
};

exports.updateTeamsStandings = function(match, nestedMatch, cb) {
  const home_goals = match.home_team.goals.length;
  const away_goals = match.away_team.goals.length;

  TeamSeason.bulkWrite(
    [
      {
        updateOne: {
          filter: {
            _id: match.home_team.id,
            "standings.id": match.competition_season.id,
            "matches.id": { $ne: match._id }
          },
          update: {
            $inc: {
              "standings.$.matches": 1,
              "standings.$.wins": home_goals > away_goals ? 1 : 0,
              "standings.$.draws": home_goals == away_goals ? 1 : 0,
              "standings.$.losses": home_goals < away_goals ? 1 : 0,
              "standings.$.goals": home_goals,
              "standings.$.goals_taken": away_goals
            },
            $push: {
              matches: nestedMatch
            }
          }
        }
      },
      {
        updateOne: {
          filter: {
            _id: match.home_team.id,
            "standings.id": match.competition_season.id,
            "matches.id": { $ne: match._id }
          },
          update: {
            $inc: {
              "standings.$.matches": 1,
              "standings.$.wins": away_goals > home_goals ? 1 : 0,
              "standings.$.draws": away_goals == home_goals ? 1 : 0,
              "standings.$.losses": away_goals < home_goals ? 1 : 0,
              "standings.$.goals": away_goals,
              "standings.$.goals_taken": home_goals
            },
            $push: {
              matches: nestedMatch
            }
          }
        }
      }
    ],
    {},
    cb
  );
};

exports.updateByZeroZeroId = function(zerozero_id, season_id, team_season, cb) {
  const query = {
    "external_ids.zerozero": zerozero_id,
    season_id: season_id
  };

  TeamSeason.findOneAndUpdate(
    query,
    team_season,
    { upsert: true, new: true, setDefaultsOnInsert: true },
    cb
  );
};

exports.getByIds = function(ids, cb) {
  const query = {
    _id: { $in: ids }
  };

  TeamSeason.find(query, cb);
};

exports.updateTeamsPositions = function(competition_season, seasons, cb) {
  let operations = [];

  let placements = {};

  competition_season.standings.forEach(function(team, index) {
    placements[team.id] = index + 1;
  });

  seasons.forEach(function(season) {
    let team_season = season._doc;

    operations.push({
      updateOne: {
        filter: {
          _id: team_season._id,
          "standings.id": competition_season._id
        },
        update: {
          $set: {
            "standings.$.position": placements[team_season._id]
          }
        }
      }
    });
  });

  TeamSeason.bulkWrite(operations, {}, cb);
};
