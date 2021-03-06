"use strict";

const io = require("socket.io-client");
const socket = io.connect("http://localhost:5000");

exports.newAchievement = (user_info, achievement) => {
  const notification_text =
    user_info.current_season.personal_info.name +
    " conquistou o achievement " +
    achievement.name +
    "!!";

  socket.emit("recommendation", {
    author: {
      name: user_info.current_season.personal_info.name,
      avatar: user_info.current_season.personal_info.avatar
    },
    target: {
      name: achievement.name,
      avatar: achievement.avatar
    },
    link: "/user-info/" + user_info._id,
    text: notification_text,
    date: new Date()
  });
};
