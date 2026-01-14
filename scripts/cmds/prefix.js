const fs = require("fs-extra");
const { utils } = global;

function formatTime(date) {
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  return `${formattedHours}:${minutes} ${ampm}`;
}

function formatDate(date) {
  const months = ["January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"];
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  return {
    day: date.getDate(),
    month: months[date.getMonth()],
    year: date.getFullYear(),
    dayName: days[date.getDay()],
    formatted: `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
  };
}

async function getUserFirstName(api, userID) {
  try {
    const userInfo = await api.getUserInfo(userID);
    if (userInfo[userID]?.name) {
      return userInfo[userID].name.split(" ")[0] || userInfo[userID].name;
    }
  } catch (err) {
    console.error("[prefix.js - getUserFirstName]", err);
  }
  return "User";
}

function getBDDate() {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" })
  );
}

const BOT_NAME = "X69X BOT V2"; // Don't Change 
const PREFIX_CHECK_GIF = "https://files.catbox.moe/ddo1rt.gif";

module.exports = {
  config: {
    name: "prefix",
    version: "2.3",
    author: "Azadx69x",
    countDown: 5,
    role: 0,
    description: "Change or check bot prefix in your chat or globally group",
    category: "config",
    guide: {
      en: "   {pn} <new prefix>: change prefix in your chat\n"
        + "   Example: {pn} #\n"
        + "   {pn} <new prefix> -g: change prefix globally (admin only)\n"
        + "   Example: {pn} # -g\n"
        + "   {pn} reset: reset prefix in your chat\n"
        + "   {pn} or just type 'prefix' to check current prefix",
      vi: "   {pn} <new prefix>: change prefix in your chat\n"
        + "   Example: {pn} #\n"
        + "   {pn} <new prefix> -g: change prefix globally (admin only)\n"
        + "   Example: {pn} # -g\n"
        + "   {pn} reset: reset prefix in your chat\n"
        + "   {pn} or just type 'prefix' to check current prefix"
    }
  },

  langs: {
    en: {
      reset: "✅ Prefix has been reset to default: %1",
      onlyAdmin: "⛔ Only admin can change system-wide prefix",
      confirmGlobal: "Please react to confirm system-wide prefix change",
      confirmThisThread: "Please react to confirm thread prefix change",
      successGlobal: "✅ System-wide prefix changed to: %1",
      successThisThread: "✅ Thread prefix changed to: %1",
      myPrefix: "🌐 System prefix: %1\n🛸 Thread prefix: %2"
    },
    vi: {
      reset: "Đã reset prefix về mặc định: %1",
      onlyAdmin: "Chỉ admin mới có thể thay đổi prefix toàn hệ thống",
      confirmGlobal: "Vui lòng react để xác nhận thay đổi prefix toàn hệ thống",
      confirmThisThread: "Vui lòng react để xác nhận thay đổi prefix nhóm chat",
      successGlobal: "Đã thay đổi prefix toàn hệ thống: %1",
      successThisThread: "Đã thay đổi prefix nhóm chat: %1",
      myPrefix: "🌐 System prefix: %1\n🛸 Thread prefix: %2"
    }
  },

  onStart: async function (ctx) {
    try {
      const { message, role, args, commandName, event, threadsData, getLang, api } = ctx;
        
      if (!args[0]) {
        return message.SyntaxError?.();
      }
        
      if (args[0] === "reset") {
        await threadsData.set(event.threadID, null, "data.prefix");
        return message.reply(getLang("reset", global.GoatBot.config.prefix));
      }

      const newPrefix = args[0];
      const formSet = { 
        commandName, 
        author: event.senderID, 
        newPrefix,
        timestamp: Date.now()
      };

      let confirmText = "";
      if (args[1] === "-g") {
        if (role < 2) return message.reply(getLang("onlyAdmin"));
        formSet.setGlobal = true;
        confirmText = getLang("confirmGlobal");
      } else {
        formSet.setGlobal = false;
        confirmText = getLang("confirmThisThread");
      }
        
      const userName = await getUserFirstName(api, event.senderID);
        
      const now = new Date();
      const currentTime = formatTime(now);
      const currentDate = formatDate(now);

      const boxConfirm = `
┌─❖
│➥🤖 ${BOT_NAME}
├─•
│➥⏰ Time : ${currentTime}
│➥📅 Date : ${currentDate.formatted}
│➥🗓️ Day : ${currentDate.dayName}
├─•
│➥👋 Hey ${userName}
├─•
│➥🔧 PREFIX CONFIRMATION
│➥📝 Action: ${confirmText}
│➥🔧 New Prefix: ${newPrefix}
│➥🎯 Type: ${formSet.setGlobal ? "Global" : "Thread"}
├─•
│➥📊 SYSTEM STATS
│➥⏳ Status: Waiting
│➥👍 React to confirm
│➥😊 ${BOT_NAME} AT YOUR SERVICE
└─❖
`.trim();

      return message.reply(boxConfirm, (err, info) => {
        if (err) {
          console.error("[prefix.js - reply error]", err);
          return;
        }
        
        if (!global.GoatBot.onReaction) {
          global.GoatBot.onReaction = new Map();
        }
        
        formSet.messageID = info.messageID;
        formSet.userName = userName;
        global.GoatBot.onReaction.set(info.messageID, formSet);
          
        setTimeout(() => {
          if (global.GoatBot.onReaction?.has(info.messageID)) {
            global.GoatBot.onReaction.delete(info.messageID);
          }
        }, 30 * 60 * 1000);
      });
    } catch (err) {
      console.error("[prefix.js - onStart]", err);
      
      const now = new Date();
      const currentTime = formatTime(now);
      
      const errorBox = `
┌─❖
│➥🤖 ${BOT_NAME}
├─•
│➥⏰ Time : ${currentTime}
├─•
│➥⚠️ ERROR OCCURRED
│➥📝 Message: ${err.message || "Unknown error"}
│➥🎯 Command: prefix
├─•
│➥📊 SYSTEM STATS
│➥❌ Status: Failed
│➥😊 ${BOT_NAME} AT YOUR SERVICE
└─❖
`.trim();
      
      ctx.message.reply(errorBox);
    }
  },

  onReaction: async function (ctx) {
    try {
      const { message, threadsData, event, Reaction, getLang, api } = ctx;
        
      if (!Reaction || event.userID !== Reaction.author) {
        return;
      }

      const { author, newPrefix, setGlobal, messageID, userName } = Reaction;
        
      let changedByName = userName || await getUserFirstName(api, event.userID);
        
      const now = new Date();
      const currentTime = formatTime(now);
      const currentDate = formatDate(now);

      if (setGlobal) {
        global.GoatBot.config.prefix = newPrefix;
        try {
          fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
        } catch (err) {
          console.error("[prefix.js - write config]", err);
          throw new Error("Failed to save global configuration");
        }
        
        const successBox = `
┌─❖
│➥🤖 ${BOT_NAME}
├─•
│➥⏰ Time : ${currentTime}
│➥📅 Date : ${currentDate.formatted}
│➥🗓️ Day : ${currentDate.dayName}
├─•
│➥👋 Hey ${changedByName}
├─•
│➥✅ PREFIX CHANGED
│➥🌐 Global Prefix Updated
│➥🔧 New Prefix: ${newPrefix}
│➥🎯 Type: Global
├─•
│➥📊 SYSTEM STATS
│➥✅ Status: Success
│➥😊 ${BOT_NAME} AT YOUR SERVICE
└─❖
`.trim();
        
        await message.reply(successBox);
      } else {
        await threadsData.set(event.threadID, newPrefix, "data.prefix");
        
        const successBox = `
┌─❖
│➥🤖 ${BOT_NAME}
├─•
│➥⏰ Time : ${currentTime}
│➥📅 Date : ${currentDate.formatted}
│➥🗓️ Day : ${currentDate.dayName}
├─•
│➥👋 Hey ${changedByName}
├─•
│➥✅ PREFIX CHANGED
│➥💬 Thread Prefix Updated
│➥🔧 New Prefix: ${newPrefix}
│➥🎯 Type: Thread
├─•
│➥📊 SYSTEM STATS
│➥✅ Status: Success
│➥😊 ${BOT_NAME} AT YOUR SERVICE
└─❖
`.trim();
        
        await message.reply(successBox);
      }
        
      try {
        await message.unsend(messageID);
      } catch (unsendErr) {
        console.error("[prefix.js - unsend error]", unsendErr);
      }

      if (global.GoatBot.onReaction?.has(messageID)) {
        global.GoatBot.onReaction.delete(messageID);
      }

    } catch (err) {
      console.error("[prefix.js - onReaction]", err);
      
      const now = new Date();
      const currentTime = formatTime(now);
      
      const errorBox = `
┌─❖
│➥🤖 ${BOT_NAME}
├─•
│➥⏰ Time : ${currentTime}
├─•
│➥⚠️ REACTION ERROR
│➥📝 Message: ${err.message || "Unknown error"}
├─•
│➥📊 SYSTEM STATS
│➥❌ Status: Failed
│➥😊 ${BOT_NAME} AT YOUR SERVICE
└─❖
`.trim();
      
      ctx.message.reply(errorBox);
    }
  },

  onChat: async function (ctx) {
    try {
      const { event, message, api, threadsData } = ctx;
        
      const msgBody = event.body ? event.body.trim().toLowerCase() : '';
      if (msgBody !== "prefix") return;
        
      const userName = await getUserFirstName(api, event.senderID);
        
      let memberCount = "Unknown";
      try {
        const threadInfo = await api.getThreadInfo(event.threadID);
        memberCount = threadInfo.participantIDs.length.toString();
      } catch (err) {
        console.error("[prefix.js - getThreadInfo]", err);
      }
        
      let threadPrefix;
      try {
        threadPrefix = await threadsData.get(event.threadID, "data.prefix");
      } catch (err) {
        console.error("[prefix.js - get thread prefix]", err);
        threadPrefix = null;
      }
      
      const systemPrefix = global.GoatBot.config.prefix;
      const globalPrefix = systemPrefix;
      const chatPrefix = threadPrefix || systemPrefix;
        
      const uptime = process.uptime();
      const hoursUptime = Math.floor(uptime / 3600);
      const minutesUptime = Math.floor((uptime % 3600) / 60);
      const secondsUptime = Math.floor(uptime % 60);
      const uptimeText = `${hoursUptime}h ${minutesUptime}m ${secondsUptime}s`;
        
      const now = new Date();
      const currentTime = formatTime(now);
      const currentDate = formatDate(now);
        
      const boxMessage = `
┌─❖
│➥🤖 ${BOT_NAME}
├─•
│➥⏰ Time : ${currentTime}
│➥📅 Date : ${currentDate.formatted}
│➥🗓️ Day : ${currentDate.dayName}
├─•
│➥👋 Hey ${userName}
├─•
│➥📋 PREFIX INFO
├─•
│➥🌐 Global Prefix: ${globalPrefix}
│➥🛸 Chat Prefix: ${chatPrefix}
├─•
│➥📊 SYSTEM STATS
│➥🕰️ Uptime: ${uptimeText}
│➥📝 GC Members: ${memberCount}
│➥😊 ${BOT_NAME} AT YOUR SERVICE
└─❖
`.trim();
        
      let stream;
      try {
        stream = await global.utils.getStreamFromURL(PREFIX_CHECK_GIF);
      } catch (gifErr) {
        console.error("[prefix.js - GIF error]", gifErr);
        stream = null;
      }
      
      if (stream) {
        return message.reply({
          body: boxMessage,
          attachment: stream
        });
      } else {
        return message.reply(boxMessage);
      }
      
    } catch (err) {
      console.error("[prefix.js - onChat]", err);
      
      const now = new Date();
      const currentTime = formatTime(now);
      
      const errorBox = `
┌─❖
│➥🤖 ${BOT_NAME}
├─•
│➥⏰ Time : ${currentTime}
├─•
│➥⚠️ CHAT TRIGGER ERROR
│➥📝 Message: ${err.message || "Unknown error"}
├─•
│➥📊 SYSTEM STATS
│➥❌ Status: Failed
│➥😊 ${BOT_NAME} AT YOUR SERVICE
└─❖
`.trim();
      
      ctx.message.reply(errorBox);
    }
  },
    
  onLoad: function() {
    if (global.prefixCleanupInterval) {
      clearInterval(global.prefixCleanupInterval);
    }
    
    global.prefixCleanupInterval = setInterval(() => {
      if (global.GoatBot.onReaction) {
        const now = Date.now();
        let cleaned = 0;
        
        for (const [messageID, data] of global.GoatBot.onReaction.entries()) {
          if (now - (data.timestamp || 0) > 30 * 60 * 1000) {
            global.GoatBot.onReaction.delete(messageID);
            cleaned++;
          }
        }
        
        if (cleaned > 0) {
          console.log(`[prefix.js] Cleaned up ${cleaned} stale reactions`);
        }
      }
    }, 10 * 60 * 1000);
  },
    
  onUnload: function() {
    if (global.prefixCleanupInterval) {
      clearInterval(global.prefixCleanupInterval);
      delete global.prefixCleanupInterval;
    }
  }
};
