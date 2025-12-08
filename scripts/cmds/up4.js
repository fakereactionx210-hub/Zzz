const os = require("os");
const fs = require("fs");
const pidusage = require("pidusage");
const si = require("systeminformation");

module.exports = {
  config: {
    name: "up4",
    aliases: ["4", "upt4"],
    version: "2.0-premium",
    author: "Azadx69x",
    countDown: 5,
    role: 0,
    shortDescription: "nezuko bot uptime",
    longDescription: "Animated loader → system panel",
    category: "system"
  },

  onStart: async function({ api, event }) {
    const delay = ms => new Promise(res => setTimeout(res, ms));
    
    const loadStages = [
      "[ █⚡░░░░░░░░░░░░░░ ] 10%",
      "[ █████🔁░░░░░░░░░ ] 30%",
      "[ █████████⏳░░░░ ] 60%",
      "[ █████████████✅ ] 80%",
      "[ ███████████████ ] 90%"
    ];
    
    const loading = await api.sendMessage("🔁 nezuko_loading...\n" + loadStages[0], event.threadID);
    const msgID = loading.messageID;
    
    for (let i = 1; i < loadStages.length; i++) {
      await delay(400);
      try {
        await api.editMessage(`✅ nezuko-uptime...\n${loadStages[i]}`, msgID, event.threadID);
      } catch (e) {
        console.log("Loader edit failed:", e.message);
      }
    }

    await delay(500);
    
    const folders = ["cmds","commands","command","modules","plugins","cmd"];
    const cmdFolder = folders.find(f => fs.existsSync(f)) || "None";
    const files = cmdFolder !== "None" ? fs.readdirSync(cmdFolder).length : 0;

    const uptime = process.uptime();
    const d = Math.floor(uptime / 86400);
    const h = Math.floor((uptime % 86400) / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    const s = Math.floor(uptime % 60);

    const cpu = await si.cpu();
    const mem = await si.mem();
    const disk = await si.fsSize();
    const net = await si.networkStats();
    const load = await pidusage(process.pid);
    const netInt = await si.networkInterfaces();
    const cpuTemp = await si.cpuTemperature();
    const boot = await si.time();
    const latency = Date.now() - loading.timestamp;

    const panel = `
══════════════════════
  ✅ SYSTEM ONLINE
══════════════════════

📌 CORE STATUS
⏳ Uptime: ${d}d ${h}h ${m}m ${s}s
⚡ Latency: ${latency}ms
📦 Commands Loaded: ${files} (Detected: ${cmdFolder})

──────────────────────
🔥 CPU
🔧 Model: ${cpu.manufacturer} ${cpu.brand}
🧩 Cores: ${cpu.cores}
🧵 Threads: ${cpu.processors}
🚀 Speed: ${cpu.speed} GHz
📊 Load: ${load.cpu.toFixed(2)}%
🌡 Temp: ${cpuTemp.main || 44}°C

──────────────────────
💾 MEMORY
📘 RAM Used: ${(mem.used/1e9).toFixed(2)} GB
📗 RAM Total: ${(mem.total/1e9).toFixed(2)} GB
💨 Swap: ${(mem.swapused/1e9).toFixed(2)}GB / ${(mem.swaptotal/1e9).toFixed(2)}GB

──────────────────────
📂 STORAGE
💿 Disk Total: ${(disk[0].size/1e9).toFixed(2)} GB
📀 Used: ${(disk[0].used/1e9).toFixed(2)} GB
📁 Free: ${(disk[0].available/1e9).toFixed(2)} GB

──────────────────────
🌐 NETWORK
📡 Interface: ${netInt[0]?.iface || "Unknown"}
🔗 IPv4: ${netInt[0]?.ip4 || "N/A"}
🌀 IPv6: ${netInt[0]?.ip6 || "N/A"}
⬆ Upload: ${(net[0]?.tx_sec/1024 || 0).toFixed(2)} KB/s
⬇ Download: ${(net[0]?.rx_sec/1024 || 0).toFixed(2)} KB/s
📶 Status: Connected

──────────────────────
⚙️ BOT PROCESS
🧩 PID: ${process.pid}
🛠 Node.js: ${process.version}
📦 Modules: ${Object.keys(require.cache).length}
📘 RAM Used: ${(load.memory/1024/1024).toFixed(2)} MB
📂 Active Dir: ${cmdFolder}

──────────────────────
⏱ BOOT TIME
🕒 System Boot: ${boot.current}
🔁 Boot Uptime: ${boot.uptime} seconds

📅 ${new Date().toLocaleDateString("en-US")}
🕒 ${new Date().toLocaleTimeString("en-US",{hour12:false})} (Asia/Dhaka)
    
    🔁SYSTEM RUNNING
══════════════════════`;
    
    await api.editMessage(panel, msgID, event.threadID);
  }
};
