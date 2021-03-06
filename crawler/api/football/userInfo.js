"use strict";

const utf8 = require("utf8");
const logger = require("../../logging");
const Entities = require("html-entities").AllHtmlEntities;
const entities = new Entities();
const {
  updateByZeroZeroId: updateUserInfoByZeroZeroId,
  updateUserInfosCurrentSeason
} = require("../../services/football/userInfo");
const {
  addCompetitionToUserInfo,
  updateByZeroZeroId: updateUserInfoSeasonByZeroZeroId,
  getByTeamSeasonId
} = require("../../services/football/userInfoSeason");
const {
  addUserInfoToCompetition
} = require("../../services/football/competitionSeason");
const { addPlayerToTeam } = require("../../services/football/teamSeason");

let { failBack } = require("../../index");

const cascadeUserInfoSeasonUpdates = function(res, done) {
  addPlayerToTeam(
    res.options.team_season._id,
    res.options.user_info_season,
    function(err, result) {
      if (err) {
        logger.error("Error when adding player to team:", err);
        failBack(res, done);
      } else {
        logger.info(
          "Successfully added player " +
            res.options.user_info_season.personal_info.name +
            " to team " +
            res.options.team_season.name
        );
        addCompetitionToUserInfo(
          res.options.user_info_season._id,
          res.options.competition_season,
          function(err, result) {
            if (err) {
              logger.error(
                "Error when adding competition_season to user info:",
                err
              );
              failBack(res, done);
            } else {
              logger.info(
                "Successfully added competition_season " +
                  res.options.competition_season.name +
                  " to user info " +
                  res.options.user_info_season.personal_info.name
              );

              addUserInfoToCompetition(
                res.options.competition_season._id,
                res.options.user_info_season,
                function(err, result) {
                  if (err) {
                    logger.error(
                      "Error when adding user info to competition_season:",
                      err
                    );
                    failBack(res, done);
                  } else {
                    logger.info(
                      "Successfully added user info " +
                        res.options.user_info_season.personal_info.name +
                        " to competition_season " +
                        res.options.competition_season.name
                    );
                    done();
                  }
                }
              );
            }
          }
        );
      }
    }
  );
};

const updateUserInfoSeason = function(err, res, done) {
  const user_info_season = {
    user_info_id: res.options.user_info._id,
    season_id: res.options.team_season.season_id,
    personal_info: {
      name: "",
      avatar: "",
      age: 0,
      full_name: "",
      positions: [],
      number: res.options.player_number,
      height: 0,
      weight: 0,
      date_of_birth: "",
      foot: "",
      nationality: "",
      residence: "",
      updated_at: Date.now()
    },
    team: {
      id: res.options.team_season ? res.options.team_season._id : 0,
      team_id: res.options.team_season ? res.options.team_season.team_id : 0,
      acronym: res.options.team_season ? res.options.team_season.acronym : "",
      avatar: res.options.team_season ? res.options.team_season.avatar : "",
      name: res.options.team_season ? res.options.team_season.name : ""
    },
    external_ids: {
      zerozero: res.options.zerozeroId
    }
  };

  user_info_season.personal_info.avatar = res.$("#page_header .logo img")
    ? "https://www.zerozero.pt" +
      res.$("#page_header .logo img")[0].attribs["data-cfsrc"]
    : "";

  res.$("#entity_bio .bio").each(function() {
    let parsedData = res
      .$(this)
      .html()
      .split("<span>");
    if (parsedData.length < 2) {
      //logger.error("Can't parse player info due to html misformation");
    } else {
      parsedData = parsedData[1].split("</span>");
    }
    let attribute = entities.decode(parsedData[0]);
    let value = parsedData[1];
    switch (attribute) {
      case "Nome":
        user_info_season.personal_info.name = utf8.encode(value);
        break;
      case "Posição":
        value = value.split("<td>")[1].split("</td>")[0];
        user_info_season.personal_info.positions = value.split(" / ");
        break;
      default:
    }
  });

  res.$("#entity_bio .bio_half").each(function() {
    let parsedData = res
      .$(this)
      .html()
      .split("<span>");
    if (parsedData.length < 2) {
      logger.error("Can't parse player info due to html misformation");
    } else {
      parsedData = parsedData[1].split("</span>");
    }
    let attribute = entities.decode(parsedData[0]);
    let value = parsedData[1];
    switch (attribute) {
      case "Nacionalidade":
        value = value.split('<div class="text">')[1].split("</div>")[0];
        user_info_season.personal_info.nationality = value;
        break;
      case "Nascimento":
        user_info_season.personal_info.date_of_birth = new Date(
          value.match(/\d+-\d+-\d+/g)[0]
        );
        // Updating user's age based on his or her date of birth
        let birth_date = new Date(user_info_season.personal_info.date_of_birth);
        let ageDifMs = Date.now() - birth_date.getTime();
        let ageDate = new Date(ageDifMs);
        user_info_season.personal_info.age = Math.abs(
          ageDate.getUTCFullYear() - 1970
        );
        break;
      case "Pé preferencial":
        user_info_season.personal_info.foot = utf8.encode(value);
        break;
      case "Altura":
        user_info_season.personal_info.height = value.match(/\d+/g)[0];
        break;
      case "Peso":
        user_info_season.personal_info.weight = value.match(/\d+/g)[0];
        break;
      default:
    }
  });

  updateUserInfoSeasonByZeroZeroId(
    res.options.zerozeroId,
    res.options.competition_season.season_id,
    user_info_season,
    function(err, result) {
      if (err) {
        logger.error(err);
        failBack(res, done);
      } else {
        res.options.user_info_season = result._doc;

        cascadeUserInfoSeasonUpdates(res, done);
      }
    }
  );
};

exports.updateUserInfo = function(err, res, done) {
  failBack = require("../../index").failBack;

  const user_info = {
    type: 1,
    external_ids: {
      zerozero: res.options.zerozeroId
    }
  };

  logger.info("User Info:", user_info);

  updateUserInfoByZeroZeroId(res.options.zerozeroId, user_info, function(
    err,
    result
  ) {
    if (err) {
      logger.error(err);
      failBack(res, done);
    } else {
      logger.info("Successfully updated user info ", res.options.zerozeroId);

      res.options.user_info = result._doc;

      updateUserInfoSeason(err, res, done);
    }
  });
};

exports.updateUserInfoCurrentSeasons = function(err, res, done) {
  getByTeamSeasonId(res.options.team_season._id, function(err, result) {
    if (err) {
      logger.error(err);
      failBack(res, done);
    } else {
      updateUserInfosCurrentSeason(result, function(err, result) {
        if (err) {
          logger.error(err);
          failBack(res, done);
        } else {
          done();
        }
      });
    }
  });
};
