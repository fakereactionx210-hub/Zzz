const os = require("os");
const axios = require("axios");
const fs = require("fs-extra");
const execSync = require("child_process").execSync;
const dirBootLogTemp = `${__dirname}/tmp/rebootUpdated.txt`;

module.exports = {
	config: {
		name: "update",
		version: "1.5",
		author: "NTKhang | Azadx69x",
		role: 2,
		description: {
			en: "Check for and install updates for the chatbot.",
			vi: "Kiểm tra và cài đặt phiên bản mới nhất của chatbot trên GitHub."
		},
		category: "owner",
		guide: {
			en: "   {pn}",
			vi: "   {pn}"
		}
	},

	langs: {
		vi: {
			noUpdates: "✅ | Bạn đang sử dụng phiên bản mới nhất của X69X BOT V2 (v%1).",
			updatePrompt: "💫 | Bạn đang sử dụng phiên bản %1. Hiện tại đã có phiên bản %2. Bạn có muốn cập nhật chatbot lên phiên bản mới nhất không?"
				+ "\n\n⬆️ | Các tệp sau sẽ được cập nhật:"
				+ "\n%3%4"
				+ "\n\nℹ️ | Xem chi tiết tại https://github.com/ntkhang03/Goat-Bot-V2/commits/main"
				+ "\n💡 | Thả cảm xúc bất kỳ vào tin nhắn này để xác nhận",
			fileWillDelete: "\n🗑️ | Các tệp/thư mục sau sẽ bị xóa:\n%1",
			andMore: " ...và %1 tệp khác",
			updateConfirmed: "🚀 | Đã xác nhận, đang cập nhật...",
			updateComplete: "✅ | Cập nhật thành công, bạn có muốn khởi động lại chatbot ngay bây giờ không (phản hồi tin nhắn với nội dung \"yes\" hoặc \"y\" để xác nhận).",
			updateTooFast: "⭕ Vì bản cập nhật gần nhất được thực phát hành cách đây %1 phút %2 giây nên không thể cập nhật. Vui lòng thử lại sau %3 phút %4 giây nữa để cập nhật không bị lỗi.",
			botWillRestart: "🔄 | Bot sẽ khởi động lại ngay!"
		},
		en: {
			noUpdates: "┌─❖\n│ 𝗫𝟲𝟵𝗫 𝗕𝗢𝗧 𝗩𝟮 𝗨𝗣𝗗𝗔𝗧𝗘𝗦\n├─•\n│ ✅ 𝗔𝗹𝗿𝗲𝗮𝗱𝘆 𝗨𝗽-𝘁𝗼-𝗱𝗮𝘁𝗲!\n│ 𝗩𝗲𝗿𝘀𝗶𝗼𝗻: v%1\n│ 𝗖𝗵𝗲𝗰𝗸𝗲𝗱: %2\n├─•\n│ 📊 𝗦𝘆𝘀𝘁𝗲𝗺 𝗦𝘁𝗮𝘁𝘀:\n│ • 𝗣𝗲𝗿𝗳𝗼𝗿𝗺𝗮𝗻𝗰𝗲: %3\n│ • 𝗠𝗲𝗺𝗼𝗿𝘆: %4\n│ • 𝗖𝗣𝗨: %5\n│ • 𝗨𝗽𝘁𝗶𝗺𝗲: %6\n└─❖",
			updatePrompt: "┌─❖\n│ 𝗫𝟲𝟵𝗫 𝗕𝗢𝗧 𝗩𝟮 𝗨𝗣𝗗𝗔𝗧𝗘𝗦\n├─•\n│ 💫 𝗡𝗲𝘄 𝗨𝗽𝗱𝗮𝘁𝗲 𝗔𝘃𝗮𝗶𝗹𝗮𝗯𝗹𝗲!\n│ 𝗖𝘂𝗿𝗿𝗲𝗻𝘁: v%1 → 𝗡𝗲𝘄: v%2\n├─•\n│ 📁 𝗙𝗶𝗹𝗲𝘀 𝘁𝗼 𝗨𝗽𝗱𝗮𝘁𝗲:\n%3%4\n├─•\n│ ℹ️ 𝗗𝗲𝘁𝗮𝗶𝗹𝘀: https://github.com/ntkhang03/Goat-Bot-V2/commits\n│ 💡 𝗥𝗲𝗮𝗰𝘁 𝘁𝗼 𝘁𝗵𝗶𝘀 𝗺𝗲𝘀𝘀𝗮𝗴𝗲 𝘁𝗼 𝗰𝗼𝗻𝗳𝗶𝗿𝗺 𝗨𝗽𝗱𝗮𝘁𝗲\n└─❖",
			fileWillDelete: "\n│ 📁 𝗙𝗶𝗹𝗲𝘀 𝘁𝗼 𝗗𝗲𝗹𝗲𝘁𝗲:\n%1",
			andMore: "\n│ ...and %1 more files",
			updateConfirmed: "┌─❖\n│ 𝗫𝟲𝟵𝗫 𝗕𝗢𝗧 𝗩𝟮\n├─•\n│ 🚀 𝗨𝗽𝗱𝗮𝘁𝗶𝗻𝗴 𝗕𝗼𝘁...\n│ ⏳ 𝗣𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁...\n└─❖",
			updateComplete: "┌─❖\n│ 𝗫𝟲𝟵𝗫 𝗕𝗢𝗧 𝗩𝟮\n├─•\n│ ✅ 𝗨𝗽𝗱𝗮𝘁𝗲 𝗖𝗼𝗺𝗽𝗹𝗲𝘁𝗲!\n│ 🔄 𝗥𝗲𝘀𝘁𝗮𝗿𝘁 𝗡𝗼𝘄?\n│ 📝 𝗥𝗲𝗽𝗹𝘆 '𝘆𝗲𝘀' 𝗼𝗿 '𝘆' 𝘁𝗼 𝗰𝗼𝗻𝗳𝗶𝗿𝗺\n└─❖",
			updateTooFast: "┌─❖\n│ 𝗫𝟲𝟵𝗫 𝗕𝗢𝗧 𝗩𝟮\n├─•\n│ ⭕ 𝗨𝗽𝗱𝗮𝘁𝗲 𝗧𝗼𝗼 𝗦𝗼𝗼𝗻!\n│ 🕐 𝗟𝗮𝘀𝘁 𝗰𝗼𝗺𝗺𝗶𝘁: %1𝗺 %2𝘀 𝗮𝗴𝗼\n│ ⏳ 𝗧𝗿𝘆 𝗮𝗴𝗮𝗶𝗻 𝗶𝗻: %3𝗺 %4𝘀\n└─❖",
			botWillRestart: "┌─❖\n│ 𝗫𝟲𝟵𝗫 𝗕𝗢𝗧 𝗩𝟮\n├─•\n│ 🔄 𝗥𝗲𝘀𝘁𝗮𝗿𝘁𝗶𝗻𝗴 𝗕𝗼𝘁...\n│ ⏳ 𝗣𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁...\n└─❖"
		}
	},

	onLoad: async function ({ api }) {
		if (fs.existsSync(dirBootLogTemp)) {
			const threadID = fs.readFileSync(dirBootLogTemp, "utf-8");
			fs.removeSync(dirBootLogTemp);
			api.sendMessage("┌─❖\n│ 𝗫𝟲𝟵𝗫 𝗕𝗢𝗧 𝗩𝟮\n├─•\n│ ✅ 𝗕𝗼𝘁 𝗥𝗲𝘀𝘁𝗮𝗿𝘁𝗲𝗱!\n│ 🚀 𝗕𝗼𝘁 𝗶𝘀 𝗻𝗼𝘄 𝗼𝗻𝗹𝗶𝗻𝗲\n└─❖", threadID);
		}
	},

	onStart: async function ({ message, getLang, commandName, event }) {
		try {
			const { data: { version } } = await axios.get("https://raw.githubusercontent.com/ntkhang03/Goat-Bot-V2/main/package.json", {
				timeout: 10000
			});
			const { data: versions } = await axios.get("https://raw.githubusercontent.com/ntkhang03/Goat-Bot-V2/main/versions.json", {
				timeout: 10000
			});

			const currentVersion = require("../../package.json").version;
			if (compareVersion(version, currentVersion) < 1) {
				const currentTime = getCurrentDateTime();
				const performanceStats = getPerformanceStats();
				
				return message.reply(getLang("noUpdates", 
					currentVersion,
					currentTime,
					performanceStats.performance,
					performanceStats.memory,
					performanceStats.cpu,
					performanceStats.uptime
				));
			}

			const newVersions = versions.slice(versions.findIndex(v => v.version == currentVersion) + 1);

			let fileWillUpdate = [...new Set(newVersions.map(v => Object.keys(v.files || {})).flat())]
				.sort()
				.filter(f => f?.length);
			const totalUpdate = fileWillUpdate.length;
			fileWillUpdate = fileWillUpdate
				.slice(0, 10)
				.map(file => `│ • ${file}`).join("\n");

			let fileWillDelete = [...new Set(newVersions.map(v => Object.keys(v.deleteFiles || {}).flat()))]
				.sort()
				.filter(f => f?.length);
			const totalDelete = fileWillDelete.length;
			fileWillDelete = fileWillDelete
				.slice(0, 10)
				.map(file => `│ • ${file}`).join("\n");
		  
			message.reply(
				getLang(
					"updatePrompt",
					currentVersion,
					version,
					fileWillUpdate + (totalUpdate > 10 ? getLang("andMore", totalUpdate - 10) : ""),
					totalDelete > 0 ? getLang(
						"fileWillDelete",
						fileWillDelete + (totalDelete > 10 ? getLang("andMore", totalDelete - 10) : "")
					) : ""
				), (err, info) => {
					if (err)
						return console.error("Error sending message:", err);

					global.GoatBot.onReaction.set(info.messageID, {
						messageID: info.messageID,
						threadID: info.threadID,
						authorID: event.senderID,
						commandName
					});
				});
		} catch (error) {
			console.error("Update check error:", error);
			message.reply("┌─❖\n│ 𝗫𝟲𝟵𝗫 𝗕𝗢𝗧 𝗩𝟮\n├─•\n│ ❌ 𝗨𝗽𝗱𝗮𝘁𝗲 𝗖𝗵𝗲𝗰𝗸 𝗙𝗮𝗶𝗹𝗲𝗱!\n│ 🔧 𝗖𝗵𝗲𝗰𝗸 𝗰𝗼𝗻𝗻𝗲𝗰𝘁𝗶𝗼𝗻/𝗹𝗼𝗴𝘀\n└─❖");
		}
	},

	onReaction: async function ({ message, getLang, Reaction, event, commandName }) {
		const { userID } = event;
		if (userID != Reaction.authorID)
			return;

		try {
			const { data: lastCommit } = await axios.get('https://api.github.com/repos/ntkhang03/Goat-Bot-V2/commits/main');
			const lastCommitDate = new Date(lastCommit.commit.committer.date);
			if (new Date().getTime() - lastCommitDate.getTime() < 5 * 60 * 1000) {
				const minutes = Math.floor((new Date().getTime() - lastCommitDate.getTime()) / 1000 / 60);
				const seconds = Math.floor((new Date().getTime() - lastCommitDate.getTime()) / 1000 % 60);
				const minutesCooldown = Math.floor((5 * 60 * 1000 - (new Date().getTime() - lastCommitDate.getTime())) / 1000 / 60);
				const secondsCooldown = Math.floor((5 * 60 * 1000 - (new Date().getTime() - lastCommitDate.getTime())) / 1000 % 60);
				return message.reply(getLang("updateTooFast", minutes, seconds, minutesCooldown, secondsCooldown));
			}

			await message.reply(getLang("updateConfirmed"));
			execSync("node update", {
				stdio: "inherit"
			});
			fs.writeFileSync(dirBootLogTemp, event.threadID);

			message.reply(getLang("updateComplete"), (err, info) => {
				if (err)
					return console.error(err);

				global.GoatBot.onReply.set(info.messageID, {
					messageID: info.messageID,
					threadID: info.threadID,
					authorID: event.senderID,
					commandName
				});
			});
		} catch (error) {
			console.error("Update error:", error);
			message.reply("┌─❖\n│ 𝗫𝟲𝟵𝗫 𝗕𝗢𝗧 𝗩𝟮\n├─•\n│ ❌ 𝗨𝗽𝗱𝗮𝘁𝗲 𝗙𝗮𝗶𝗹𝗲𝗱!\n│ 🔧 𝗖𝗵𝗲𝗰𝗸 𝗰𝗼𝗻𝗻𝗲𝗰𝘁𝗶𝗼𝗻/𝗹𝗼𝗴𝘀\n└─❖");
		}
	},

	onReply: async function ({ message, getLang, event }) {
		const response = event.body?.toLowerCase().trim();
		if (['yes', 'y'].includes(response)) {
			await message.reply(getLang("botWillRestart"));
			setTimeout(() => {
				process.exit(2);
			}, 2000);
		}
	}
};

function compareVersion(version1, version2) {
	const v1 = version1.split(".");
	const v2 = version2.split(".");
	for (let i = 0; i < 3; i++) {
		if (parseInt(v1[i]) > parseInt(v2[i]))
			return 1;
		if (parseInt(v1[i]) < parseInt(v2[i]))
			return -1;
	}
	return 0;
}

function getCurrentDateTime() {
	const now = new Date();
  
	const date = now.toLocaleDateString('en-GB', {
		day: '2-digit',
		month: 'short',
		year: 'numeric'
	});
	
	const time = now.toLocaleTimeString('en-US', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: true
	});
	
	return `${date}, ${time}`;
}

function getPerformanceStats() {
	try {
		const usedMemory = process.memoryUsage().heapUsed / 1024 / 1024;
		const totalMemory = os.totalmem() / 1024 / 1024;
		const memoryUsage = (usedMemory / totalMemory) * 100;
	  
		const loadAvg = os.loadavg();
		const cpuLoad = loadAvg[0];
		const cpuCores = os.cpus()?.length || 1;
		const cpuUsage = Math.min((cpuLoad / cpuCores) * 100, 100);
	  
		const uptimeSeconds = process.uptime();
		const uptime = formatUptime(uptimeSeconds);
	  
		let performanceStatus;
		let performanceEmoji;
		
		if (memoryUsage < 40 && cpuUsage < 40) {
			performanceStatus = "Excellent";
			performanceEmoji = "🚀";
		} else if (memoryUsage < 60 && cpuUsage < 60) {
			performanceStatus = "Good";
			performanceEmoji = "✅";
		} else if (memoryUsage < 80 && cpuUsage < 80) {
			performanceStatus = "Moderate";
			performanceEmoji = "⚠️";
		} else {
			performanceStatus = "High Load";
			performanceEmoji = "🚨";
		}
		
		return {
			performance: `${performanceStatus} ${performanceEmoji}`,
			memory: `${usedMemory.toFixed(1)}MB (${memoryUsage.toFixed(1)}%)`,
			cpu: `${cpuUsage.toFixed(1)}%`,
			uptime: uptime
		};
	} catch (error) {
		console.error("Performance stats error:", error);
		return {
			performance: "Unknown",
			memory: "N/A",
			cpu: "N/A",
			uptime: "N/A"
		};
	}
}

function formatUptime(seconds) {
	const days = Math.floor(seconds / (3600 * 24));
	const hours = Math.floor((seconds % (3600 * 24)) / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	
	if (days > 0) {
		return `${days}d ${hours}h`;
	} else if (hours > 0) {
		return `${hours}h ${minutes}m`;
	} else if (minutes > 0) {
		return `${minutes}m`;
	} else {
		return `${Math.floor(seconds)}s`;
	}
}
