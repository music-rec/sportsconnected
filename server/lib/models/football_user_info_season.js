const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { footballUserTypes } = require("../constants/values.js");

const FootballUserSeasonSchema = new Schema({
  user_info_id: { type: Schema.Types.ObjectId, ref: "football_user_info" },
  season_id: { type: Schema.Types.ObjectId, ref: "football_season" },
  personal_info: {
    name: String,
    avatar: {
      type: String
    },
    age: Number,
    number: String,
    full_name: String,
    positions: [String],
    height: Number,
    weight: Number,
    date_of_birth: Date,
    foot: String,
    nationality: String,
    residence: String,
    updated_at: { type: Date, default: Date.now }
  },
  team: {
    id: { type: Schema.Types.ObjectId, ref: "football_team_season" },
    team_id: { type: Schema.Types.ObjectId, ref: "football_team" },
    acronym: String,
    avatar: String,
    name: String
  },
  stats: [
    {
      id: { type: Schema.Types.ObjectId, ref: "football_competition_season" },
      competition_id: {
        type: Schema.Types.ObjectId,
        ref: "football_competition"
      },
      season_id: { type: Schema.Types.ObjectId, ref: "football_season" },
      name: String,
      avatar: String,
      games: { type: Number, default: 0 },
      wins: { type: Number, default: 0 },
      draws: { type: Number, default: 0 },
      losses: { type: Number, default: 0 },
      goals: { type: Number, default: 0 },
      assists: { type: Number, default: 0 },
      yellow_cards: { type: Number, default: 0 },
      red_cards: { type: Number, default: 0 },
      minutes_played: { type: Number, default: 0 }
    }
  ],
  matches: [
    {
      id: { type: Schema.Types.ObjectId, ref: "football_match" },
      date: Date,
      competition_season: {
        id: { type: Schema.Types.ObjectId, ref: "football_competition_season" },
        competition_id: {
          type: Schema.Types.ObjectId,
          ref: "football_competition"
        },
        name: String,
        avatar: String
      },
      home_team: {
        id: { type: Schema.Types.ObjectId, ref: "football_team_season" },
        team_id: { type: Schema.Types.ObjectId, ref: "football_team" },
        name: String,
        avatar: String,
        goals: Number
      },
      away_team: {
        id: { type: Schema.Types.ObjectId, ref: "football_team_season" },
        team_id: { type: Schema.Types.ObjectId, ref: "football_team" },
        name: String,
        avatar: String,
        goals: Number
      }
    }
  ],
  media: [
    {
      _id: String,
      user_type: { type: String, enum: footballUserTypes },
      season_id: { type: Schema.Types.ObjectId, ref: "football_season" },
      title: { type: String },
      author: {
        name: String,
        id: String,
        user_type: { type: String, enum: footballUserTypes },
        avatar: String,
        team: {
          id: { type: Schema.Types.ObjectId, ref: "football_team" },
          acronym: String,
          avatar: String,
          name: String
        }
      },
      date: Date,
      image: String,
      text: { type: String },
      tags: [String]
    }
  ],
  external_ids: {
    zerozero: { type: Number, index: true }
  }
});

module.exports = mongoose.model(
  "football_user_info_season",
  FootballUserSeasonSchema
);
