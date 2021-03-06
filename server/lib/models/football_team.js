const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FootballTeamSchema = new Schema({
  user_id: String,
  acronym: String,
  avatar: String,
  name: String,
  full_name: String,
  current_season: { type: Schema.Types.ObjectId, ref: "football_team_season" },
  previous_seasons: [
    { type: Schema.Types.ObjectId, ref: "football_team_season" }
  ],
  tryouts: [
    {
      address: String,
      age_group: String,
      days: String,
      time: String,
      requirements: String
    }
  ],
  additional_info: {
    site: String,
    email: String,
    phone_Number: String,
    address: String,
    president: String,
    vice_president: String,
    sports_director: String,
    number_of_teams: Number,
    number_of_athletes: Number,
    number_of_coaches: Number,
    number_of_physiotherapists: Number,
    number_of_grass_fields: Number,
    number_of_synthetic_fields: Number,
    number_of_locker_rooms: Number,
    sponsors: [
      {
        link: String,
        name: String
      }
    ],
    other_sports: [String]
  },
  followers: [{ type: Schema.Types.ObjectId, ref: "football_user_info" }],
  following: [{ type: Schema.Types.ObjectId, ref: "football_user_info" }],
  recommendations: {
    list: [{ type: Schema.Types.ObjectId, ref: "football_recommendations" }],
    top_5: [
      {
        author: {
          name: String,
          info_id: { type: Schema.Types.ObjectId, ref: "football_user_info" },
          avatar: String,
          team: {
            id: { type: Schema.Types.ObjectId, ref: "football_team" },
            acronym: String,
            avatar: String,
            name: String
          }
        },
        text: String
      }
    ]
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  external_ids: {
    zerozero: { type: Number, required: true, unique: true, index: true }
  }
});

module.exports = mongoose.model("football_team", FootballTeamSchema);
