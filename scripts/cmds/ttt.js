const fs = require("fs");
const path = require("path");
const { createCanvas } = require("canvas");

// Use a Map instead of object for better management
const games = new Map();

// Simple theme
const theme = {
  primary: "#0f0f1a",
  grid: "#9b59b6",
  xColor: "#3498db",
  oColor: "#e67e22",
  titleBg: "#8e44ad"
};

// 🖼️ Board Render Function
function renderBoard(board, playerXName, playerOName) {
  const canvas = createCanvas(400, 460);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = theme.primary;
  ctx.fillRect(0, 0, 400, 460);

  // Title bar
  ctx.fillStyle = theme.titleBg;
  ctx.fillRect(0, 0, 400, 60);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 22px Arial";
  ctx.textAlign = "center";
  ctx.fillText(`${playerXName} (X) 🆚 ${playerOName} (O)`, 200, 35);

  // Grid lines
  ctx.strokeStyle = theme.grid;
  ctx.shadowColor = theme.grid;
  ctx.shadowBlur = 15;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(133, 70);
  ctx.lineTo(133, 430);
  ctx.moveTo(266, 70);
  ctx.lineTo(266, 430);
  ctx.moveTo(0, 170);
  ctx.lineTo(400, 170);
  ctx.moveTo(0, 300);
  ctx.lineTo(400, 300);
  ctx.stroke();

  // Reset shadow
  ctx.shadowBlur = 0;

  // Draw X and O
  ctx.font = "bold 80px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let i = 0; i < 9; i++) {
    const x = (i % 3) * 133 + 67;
    const y = Math.floor(i / 3) * 130 + 120;

    if (board[i] === "X") {
      ctx.fillStyle = theme.xColor;
      ctx.shadowColor = theme.xColor;
      ctx.shadowBlur = 20;
      ctx.fillText("X", x, y);
      ctx.shadowBlur = 0;
    } else if (board[i] === "O") {
      ctx.fillStyle = theme.oColor;
      ctx.shadowColor = theme.oColor;
      ctx.shadowBlur = 20;
      ctx.fillText("O", x, y);
      ctx.shadowBlur = 0;
    }
  }

  return canvas.toBuffer();
}

// 🏆 Check Winner
function checkWinner(board) {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (let line of wins) {
    const [a,b,c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  if (board.every(cell => cell)) return "draw";
  return null;
}

module.exports = {
  config: {
    name: "ttt",
    aliases: ["tictactoe", "xoxo"],
    version: "2.0",
    author: "Azadx69x",
    countDown: 5,
    role: 0,
    shortDescription: "Play Tic Tac Toe",
    longDescription: "Play Tic Tac Toe game",
    category: "game",
    guide: {
      en: "{pn} @mention → start game\nThen reply with 1-9"
    }
  },

  onStart: async function ({ message, event, usersData, args }) {
    try {
      console.log("Event data:", JSON.stringify(event, null, 2));
      console.log("Args:", args);
      
      // Check if there's a mention in the message
      let mentionedUser = null;
      
      // Method 1: Check event.mentions
      if (event.mentions && typeof event.mentions === 'object') {
        const mentionKeys = Object.keys(event.mentions);
        if (mentionKeys.length > 0) {
          mentionedUser = mentionKeys[0];
        }
      }
      
      // Method 2: Check message text for @mention pattern
      if (!mentionedUser && event.body) {
        const mentionMatch = event.body.match(/@(\d+)/);
        if (mentionMatch) {
          mentionedUser = mentionMatch[1];
        }
      }
      
      // Method 3: Check args for user ID
      if (!mentionedUser && args && args.length > 0) {
        // Check if any arg looks like a user ID (all numbers)
        for (const arg of args) {
          if (/^\d+$/.test(arg)) {
            mentionedUser = arg;
            break;
          }
        }
      }
      
      if (!mentionedUser) {
        return message.reply("❌ Please mention someone to start the game!\nExample: /ttt @friend");
      }

      const playerX = event.senderID;
      const playerO = mentionedUser;

      // Get player names
      const playerXName = await usersData.getName(playerX);
      const playerOName = await usersData.getName(playerO) || "Player O";

      const gameId = event.threadID;
      
      // Check if game exists using Map
      if (games.has(gameId)) {
        return message.reply("⚠️ A game is already running in this group!");
      }

      // Create game object
      const game = {
        board: Array(9).fill(null),
        players: { X: playerX, O: playerO },
        names: { X: playerXName, O: playerOName },
        turn: "X",
        timeout: null
      };

      // Store game in Map
      games.set(gameId, game);

      // Set timeout
      game.timeout = setTimeout(() => {
        if (games.has(gameId)) {
          games.delete(gameId);
          message.reply("⏰ Time's up! Game cancelled.");
        }
      }, 60000);

      // Render and send board
      const img = renderBoard(game.board, playerXName, playerOName);
      const filePath = path.join(__dirname, "ttt_board.png");
      
      fs.writeFile(filePath, img, (err) => {
        if (err) {
          console.error("Error saving image:", err);
          games.delete(gameId);
          return message.reply("❌ Error creating game board.");
        }
        
        const replyMessage = `🎮 Tic Tac Toe Started!\n\n${playerXName} (X) vs ${playerOName} (O)\n\nFirst turn: X (${playerXName})\n\nReply with numbers 1-9 to play:\n1 2 3\n4 5 6\n7 8 9`;
        
        message.reply({
          body: replyMessage,
          attachment: fs.createReadStream(filePath)
        });
      });

    } catch (error) {
      console.error("Error in ttt onStart:", error);
      message.reply("❌ An error occurred while starting the game.");
    }
  },

  onChat: async function ({ message, event }) {
    try {
      const gameId = event.threadID;
      
      // Check if game exists
      if (!games.has(gameId)) {
        return;
      }

      const game = games.get(gameId);
      
      // Parse the move
      const body = String(event.body || "").trim();
      const move = parseInt(body);
      
      // Check if it's a valid move number
      if (isNaN(move) || move < 1 || move > 9) {
        return;
      }

      // Check if sender is a player
      const player = event.senderID === game.players.X ? "X" : 
                     event.senderID === game.players.O ? "O" : null;
      
      if (!player) {
        return message.reply("❌ You are not a player in this game!");
      }

      // Check if it's player's turn
      if (game.turn !== player) {
        const currentPlayerName = game.names[game.turn];
        return message.reply(`⏳ It's ${currentPlayerName}'s turn (${game.turn})!`);
      }

      const index = move - 1;
      
      // Check if cell is empty
      if (game.board[index]) {
        return message.reply("❌ This cell is already filled!");
      }

      // Make move
      game.board[index] = player;
      game.turn = player === "X" ? "O" : "X";

      // Reset timeout
      if (game.timeout) {
        clearTimeout(game.timeout);
      }
      
      game.timeout = setTimeout(() => {
        if (games.has(gameId)) {
          games.delete(gameId);
          message.reply("⏰ Time's up! Game cancelled.");
        }
      }, 60000);

      // Check for winner
      const winner = checkWinner(game.board);
      
      // Render board
      const img = renderBoard(game.board, game.names.X, game.names.O);
      const filePath = path.join(__dirname, "ttt_current.png");
      
      fs.writeFile(filePath, img, (err) => {
        if (err) {
          console.error("Error saving image:", err);
          return message.reply("❌ Error updating game board.");
        }

        if (winner) {
          // Clear timeout
          if (game.timeout) {
            clearTimeout(game.timeout);
          }
          
          // Remove game
          games.delete(gameId);

          if (winner === "draw") {
            message.reply({
              body: "🤝 Game ended in a draw!",
              attachment: fs.createReadStream(filePath)
            });
          } else {
            const winnerName = game.names[winner];
            message.reply({
              body: `🏆 ${winnerName} (${winner}) wins!`,
              attachment: fs.createReadStream(filePath)
            });
          }
        } else {
          const currentPlayerName = game.names[game.turn];
          message.reply({
            body: `👉 Now it's ${currentPlayerName}'s turn (${game.turn})\nReply with numbers 1-9`,
            attachment: fs.createReadStream(filePath)
          });
        }
      });

    } catch (error) {
      console.error("Error in ttt onChat:", error);
    }
  }
};
