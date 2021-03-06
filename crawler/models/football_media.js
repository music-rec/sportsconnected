const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const USER_TYPES = require("../constants/values.js").footballUserTypes;

const FootballMediaSchema = new Schema({
  _id: String,
  user_type: { type: String, enum: USER_TYPES },
  season_id: { type: Schema.Types.ObjectId, ref: "football_season" },
  title: { type: String, required: true },
  author: String,
  date: Date,
  image: String,
  text: { type: String, required: true },
  references: {
    leagues: [
      {
        name: String,
        id: { type: Schema.Types.ObjectId, ref: "football_competition" }
      }
    ],
    team: [
      {
        name: String,
        id: { type: Schema.Types.ObjectId, ref: "football_team" }
      }
    ],
    user: [
      {
        name: String,
        id: { type: Schema.Types.ObjectId, ref: "football_user_info" }
      }
    ]
  }
});

module.exports = mongoose.model("football_media", FootballMediaSchema);
