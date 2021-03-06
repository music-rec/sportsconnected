"use strict";

const _ = require("underscore");
const Match = require("./../../../models/football_match");

exports.getLastPlayedMatchesByTeamId = function(teamId, nMatches, cb) {
  Match.find({
    $or: [{ "home_team.team_id": teamId }, { "away_team.team_id": teamId }]
  })
    .and({ played: true })
    .select(
      "date " +
        "duration " +
        "stadium " +
        "referee " +
        "competition_season.name " +
        "competition_season.avatar competition_season.phase" +
        "home_team.name" +
        "home_team.avatar" +
        "home_team.goals" +
        "away_team.name" +
        "away_team.avatar" +
        "away_team.goals"
    )
    .limit(parseInt(nMatches))
    .sort({ date: "desc" })
    .exec((err, matches) => {
      cb(err, matches);
    });
};

exports.getNextMatchesByTeamId = function(teamId, nMatches, cb) {
  Match.find({
    $or: [
      { "home_team.team_id": { team_id: teamId } },
      { "away_team.team_id": { team_id: teamId } }
    ]
  })
    .and({ played: false })
    .select(
      "date " +
        "duration " +
        "stadium " +
        "referee " +
        "competition_season.name " +
        "competition_season.avatar competition_season.phase" +
        "home_team.name" +
        "home_team.avatar" +
        "home_team.goals" +
        "away_team.name" +
        "away_team.avatar" +
        "away_team.goals"
    )
    .limit(parseInt(nMatches))
    .sort({ date: "asc" })
    .exec((err, matches) => {
      cb(err, matches);
    });
};

exports.getMissingMatches = function(matchIds, cb) {
  Match.find({ "external_ids.zerozero": { $in: matchIds } }, function(
    err,
    matches
  ) {
    if (matches && !err) {
      matches = _.difference(
        matchIds,
        matches.map(match => match.external_ids.zerozero)
      );
    }
    cb(err, matches);
  });
};

exports.updateByZeroZeroId = function(zerozero_id, match, cb) {
  const query = { "external_ids.zerozero": zerozero_id };
  Match.findOneAndUpdate(
    query,
    match,
    { upsert: true, new: true, setDefaultsOnInsert: true },
    cb
  );
};

exports.insertFutureMatches = function(matches, cb) {
  Match.insertMany(matches, cb);
};
