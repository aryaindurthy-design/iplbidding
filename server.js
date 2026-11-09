const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const os = require('os');

const analyzer = require('./analyzer');
const teamsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'teams.json'), 'utf8'));
const allPlayersData = JSON.parse(fs.readFileSync(path.join(__dirname, 'players.json'), 'utf8'));

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

// Forward Socket.IO polling & handshake requests to Engine.IO for Vercel/serverless environments
app.use((req, res, next) => {
  if (req.url && req.url.startsWith('/socket.io/socket.io.js')) {
    return res.sendFile(path.join(__dirname, 'public', 'socket-client.js'));
  }
  if (req.url && (req.url === '/socket.io' || req.url.startsWith('/socket.io/'))) {
    return io.engine.handleRequest(req, res);
  }
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

// Detect local IPv4 address
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name in interfaces) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const LOCAL_IP = getLocalIp();
const PORT = process.env.PORT || 3000;
const CLOUDFLARE_TUNNEL_URL = 'https://roads-dirt-servers-aus.trycloudflare.com';

// API route to get live persistent backend URL
app.get('/api/server-url', (req, res) => {
  res.json({
    url: process.env.LIVE_BACKEND_URL || CLOUDFLARE_TUNNEL_URL,
    localIp: LOCAL_IP,
    port: PORT
  });
});

// Image Proxy Endpoint to bypass browser ORB/CORS/Hotlinking restrictions
app.get('/api/proxy-image', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl || typeof targetUrl !== 'string') {
    return res.status(400).send('Missing url query parameter');
  }

  const allowed = [
    'documents.iplt20.com',
    'upload.wikimedia.org',
    'static.iplt20.com',
    'images.unsplash.com',
    'img1.hscicdn.com',
    'search.cricinfo.com',
    'www.lucknowsupergiants.in',
    'api.dicebear.com',
    'documents.bcci.tv'
  ];
  try {
    const parsed = new URL(targetUrl);
    if (!allowed.some(domain => parsed.hostname === domain || parsed.hostname.endsWith('.' + domain))) {
      return res.status(403).send('Domain not allowed');
    }

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
    };
    if (parsed.hostname.includes('wikimedia.org')) {
      headers['Referer'] = 'https://en.wikipedia.org/';
    }

    let upstream = await fetch(targetUrl, { headers });

    // If an IPL headshot returns 403 or 404, fallback through other years (2026, 2025, 2024, 2023)
    if (!upstream.ok && targetUrl.includes('IPLHeadshot')) {
      const yearMatch = targetUrl.match(/IPLHeadshot(\d{4})/);
      if (yearMatch) {
        const currentYear = yearMatch[1];
        const altYears = ['2026', '2025', '2024', '2023'].filter(y => y !== currentYear);
        for (const altYear of altYears) {
          const altUrl = targetUrl.replace(`IPLHeadshot${currentYear}`, `IPLHeadshot${altYear}`);
          try {
            const altRes = await fetch(altUrl, { headers });
            if (altRes.ok) {
              upstream = altRes;
              break;
            }
          } catch (e) {}
        }
      }
    }

    if (!upstream.ok) {
      return res.status(upstream.status).send('Upstream error');
    }

    const contentType = upstream.headers.get('content-type') || 'image/png';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.send(buffer);
  } catch (err) {
    res.status(500).send('Proxy error');
  }
});

// In-Memory Rooms State
const rooms = new Map();

// Helper to generate 5-letter Room Code
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Create a new Room instance
function createRoomInstance(roomId, hostSocketId, hostName, selectedTeamId, options = {}) {
  const purse = options.purse || 90; // Default: 90 Cr for 11 players
  const squadLimit = options.squadLimit || 11;
  const overseasLimit = options.overseasLimit || 4;
  const timerDuration = options.timerDuration || 12;
  // By default, fillWithBots is false so room is 100% private for friends only
  const fillWithBots = options.fillWithBots === true;

  // Initialize all 10 IPL teams for this room
  const teams = {};
  teamsData.forEach(t => {
    const isHostTeam = t.id === selectedTeamId;
    teams[t.id] = {
      ...t,
      ownerSocketId: isHostTeam ? hostSocketId : null,
      ownerName: isHostTeam ? hostName : (fillWithBots ? `${t.shortName} AI Bot` : null),
      isBot: isHostTeam ? false : fillWithBots,
      purse: purse,
      totalSpent: 0,
      squad: []
    };
  });

  // Filter and prepare player pool
  const playersPool = JSON.parse(JSON.stringify(allPlayersData));
  // Fisher-Yates Shuffle so every auction has a completely fresh, exciting player order!
  for (let i = playersPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [playersPool[i], playersPool[j]] = [playersPool[j], playersPool[i]];
  }

  return {
    roomId,
    hostSocketId,
    hostName,
    status: 'LOBBY', // LOBBY, BIDDING, SOLD, UNSOLD, PAUSED, COMPLETED
    options: {
      purse,
      squadLimit,
      overseasLimit,
      timerDuration,
      fillWithBots
    },
    teams,
    players: playersPool,
    currentPlayerIndex: 0,
    currentBid: 0,
    leadingTeamId: null,
    timer: timerDuration,
    timerInterval: null,
    bidHistory: [],
    chatMessages: [],
    botTimeouts: []
  };
}

// Calculate minimum reserve purse needed to fill remaining squad spots
function getMinimumReservePurse(team, targetSquadSize = 11) {
  const remainingSpots = Math.max(0, targetSquadSize - team.squad.length - 1);
  return remainingSpots * 0.20; // 20 Lakhs per spot
}

// Validate if team can bid
function canTeamBid(room, teamId, bidAmount) {
  const team = room.teams[teamId];
  if (!team) return { ok: false, reason: 'Team not found' };

  if (room.leadingTeamId === teamId) {
    return { ok: false, reason: 'You are already the highest bidder' };
  }

  if (team.squad.length >= room.options.squadLimit) {
    return { ok: false, reason: `Squad limit of ${room.options.squadLimit} reached` };
  }

  const currentPlayer = room.players[room.currentPlayerIndex];
  if (!currentPlayer) return { ok: false, reason: 'No active player' };

  if (currentPlayer.type === 'Overseas') {
    const overseasCount = team.squad.filter(p => p.type === 'Overseas').length;
    if (overseasCount >= room.options.overseasLimit) {
      return { ok: false, reason: `Max ${room.options.overseasLimit} overseas players reached` };
    }
  }

  const reserveNeeded = getMinimumReservePurse(team, room.options.squadLimit);
  if (team.purse - bidAmount < reserveNeeded) {
    return { ok: false, reason: `Insufficient purse (need reserve of ₹${reserveNeeded.toFixed(2)} Cr for remaining players)` };
  }

  return { ok: true };
}

// Determine next bid increment
function getNextBidAmount(currentBid, basePrice) {
  if (currentBid === 0) return basePrice || 2.0;
  if (currentBid < 1.0) return parseFloat((currentBid + 0.10).toFixed(2));
  if (currentBid < 2.0) return parseFloat((currentBid + 0.20).toFixed(2));
  if (currentBid < 5.0) return parseFloat((currentBid + 0.25).toFixed(2));
  if (currentBid < 10.0) return parseFloat((currentBid + 0.50).toFixed(2));
  if (currentBid < 20.0) return parseFloat((currentBid + 1.00).toFixed(2));
  return parseFloat((currentBid + 1.50).toFixed(2));
}

// Start auction timer for current player
function startAuctionClock(room) {
  stopAuctionClock(room);
  clearBotTimeouts(room);

  room.status = 'BIDDING';
  room.timer = room.options.timerDuration;

  io.to(room.roomId).emit('auctionUpdate', getPublicRoomState(room));

  room.timerInterval = setInterval(() => {
    if (room.status !== 'BIDDING') return;

    room.timer--;

    io.to(room.roomId).emit('timerTick', {
      timer: room.timer,
      status: room.status
    });

    if (room.timer <= 0) {
      resolveCurrentAuction(room);
    }
  }, 1000);

  // Trigger AI Bot evaluation
  triggerBotBidding(room);
}

function stopAuctionClock(room) {
  if (room.timerInterval) {
    clearInterval(room.timerInterval);
    room.timerInterval = null;
  }
}

function clearBotTimeouts(room) {
  if (room.botTimeouts) {
    room.botTimeouts.forEach(t => clearTimeout(t));
    room.botTimeouts = [];
  }
}

// Bot Decision Logic
function triggerBotBidding(room) {
  if (room.status !== 'BIDDING') return;
  const player = room.players[room.currentPlayerIndex];
  if (!player) return;

  const activeBotTeams = Object.values(room.teams).filter(t => t.isBot && t.squad.length < room.options.squadLimit);

  activeBotTeams.forEach(botTeam => {
    // Check overseas limit
    if (player.type === 'Overseas') {
      const overseasCount = botTeam.squad.filter(p => p.type === 'Overseas').length;
      if (overseasCount >= room.options.overseasLimit) return;
    }

    // Role demand
    const roleCount = botTeam.squad.filter(p => p.role === player.role).length;
    let interestMultiplier = 1.0;
    if (botTeam.botProfile && botTeam.botProfile.favoredRoles.includes(player.role)) {
      interestMultiplier += 0.25;
    }
    if (roleCount >= 4) interestMultiplier -= 0.35;

    // Calculate maximum valuation for bot
    const rating = player.rating || 65;
    const aggression = (botTeam.botProfile && botTeam.botProfile.aggression) || 0.75;
    const maxPurseShare = (botTeam.botProfile && botTeam.botProfile.maxBidShare) || 0.25;

    let maxValuation = (player.basePrice || 2.0) * (rating / 50) * aggression * interestMultiplier;
    maxValuation = Math.min(maxValuation, botTeam.purse * maxPurseShare);

    // Minimum sanity cap
    maxValuation = Math.max(player.basePrice || 2.0, maxValuation);

    // Schedule bid with realistic hesitation (1.5s - 5.0s)
    const delay = Math.floor(Math.random() * 3200) + 1500;
    const timeout = setTimeout(() => {
      if (room.status !== 'BIDDING') return;
      if (room.leadingTeamId === botTeam.id) return;

      const nextBid = getNextBidAmount(room.currentBid, player.basePrice);
      if (nextBid <= maxValuation) {
        const check = canTeamBid(room, botTeam.id, nextBid);
        if (check.ok) {
          executeBid(room, botTeam.id, nextBid, botTeam.name);
          // Recursively trigger bot reaction again
          triggerBotBidding(room);
        }
      }
    }, delay);

    room.botTimeouts.push(timeout);
  });
}

// Execute a validated bid
function executeBid(room, teamId, amount, bidderName) {
  if (room.status !== 'BIDDING') return;

  room.currentBid = amount;
  room.leadingTeamId = teamId;

  // Anti-sniping rule: if bid placed under 4s, reset timer to 7s
  if (room.timer < 4) {
    room.timer = 7;
  }

  const bidEntry = {
    teamId,
    teamName: room.teams[teamId].name,
    bidderName: bidderName || room.teams[teamId].ownerName,
    amount,
    timestamp: new Date().toLocaleTimeString()
  };

  room.bidHistory.unshift(bidEntry);
  if (room.bidHistory.length > 30) room.bidHistory.pop();

  io.to(room.roomId).emit('bidPlaced', {
    currentBid: room.currentBid,
    leadingTeamId: room.leadingTeamId,
    leadingTeamName: room.teams[teamId].name,
    leadingTeamColor: room.teams[teamId].primaryColor,
    timer: room.timer,
    bidEntry
  });
}

// Resolve current player (SOLD or UNSOLD)
function resolveCurrentAuction(room) {
  stopAuctionClock(room);
  clearBotTimeouts(room);

  const player = room.players[room.currentPlayerIndex];
  if (!player) return;

  if (room.leadingTeamId && room.currentBid > 0) {
    // SOLD
    room.status = 'SOLD';
    const winningTeam = room.teams[room.leadingTeamId];
    winningTeam.purse = parseFloat((winningTeam.purse - room.currentBid).toFixed(2));
    winningTeam.totalSpent = parseFloat((winningTeam.totalSpent + room.currentBid).toFixed(2));

    const soldRecord = {
      ...player,
      soldPrice: room.currentBid,
      soldToTeamId: winningTeam.id,
      soldToTeamName: winningTeam.name
    };
    winningTeam.squad.push(soldRecord);

    io.to(room.roomId).emit('playerSold', {
      player: soldRecord,
      winningTeam: {
        id: winningTeam.id,
        name: winningTeam.name,
        color: winningTeam.primaryColor,
        logo: winningTeam.logo,
        badgeEmoji: winningTeam.badgeEmoji,
        slogan: winningTeam.slogan,
        songTitle: winningTeam.songTitle,
        synthStyle: winningTeam.synthStyle,
        newPurse: winningTeam.purse,
        squadCount: winningTeam.squad.length
      },
      soldPrice: room.currentBid,
      isSquadFull: winningTeam.squad.length >= room.options.squadLimit
    });
  } else {
    // UNSOLD
    room.status = 'UNSOLD';
    io.to(room.roomId).emit('playerUnsold', {
      player
    });
  }

  // Dynamic delay: 6.0s on SOLD (show player for 5s, let song continue playing during game), 3.0s on UNSOLD
  const delayMs = (room.status === 'SOLD') ? 6000 : 3000;
  setTimeout(() => {
    advanceToNextPlayer(room);
  }, delayMs);
}

// Advance to next player or finish auction
function advanceToNextPlayer(room) {
  // Check if all human/active teams have full 11-player squads
  const activeTeams = Object.values(room.teams).filter(t => !t.isBot || t.ownerName);
  const allFull = Object.values(room.teams).every(t => t.squad.length >= room.options.squadLimit);

  room.currentPlayerIndex++;
  room.currentBid = 0;
  room.leadingTeamId = null;
  room.bidHistory = [];

  if (room.currentPlayerIndex >= room.players.length || allFull) {
    completeAuction(room);
    return;
  }

  startAuctionClock(room);
}

// Complete Auction and Trigger Pro AI Analysis
function completeAuction(room) {
  stopAuctionClock(room);
  clearBotTimeouts(room);

  room.status = 'COMPLETED';

  // Run comprehensive squad analysis for all teams
  const teamAnalyses = {};
  Object.values(room.teams).forEach(team => {
    teamAnalyses[team.id] = analyzer.analyzeSquad(team, team.squad, Object.values(room.teams));
  });

  // Run full tournament simulation
  const tournamentResult = analyzer.simulateTournament(Object.values(room.teams));

  io.to(room.roomId).emit('auctionCompleted', {
    teams: room.teams,
    teamAnalyses,
    tournamentResult
  });
}

// Public state representation sent to clients
function getPublicRoomState(room) {
  const currentPlayer = room.players[room.currentPlayerIndex] || null;
  return {
    roomId: room.roomId,
    hostSocketId: room.hostSocketId,
    hostName: room.hostName,
    status: room.status,
    options: room.options,
    teams: room.teams,
    currentPlayerIndex: room.currentPlayerIndex,
    totalPlayers: room.players.length,
    currentPlayer,
    currentBid: room.currentBid,
    leadingTeamId: room.leadingTeamId,
    leadingTeamName: room.leadingTeamId ? room.teams[room.leadingTeamId].name : null,
    leadingTeamColor: room.leadingTeamId ? room.teams[room.leadingTeamId].primaryColor : null,
    nextBidAmount: currentPlayer ? getNextBidAmount(room.currentBid, currentPlayer.basePrice) : 2.0,
    timer: room.timer,
    bidHistory: room.bidHistory,
    serverIp: LOCAL_IP,
    serverPort: PORT
  };
}

// Socket.io Real-time Event Handlers
io.on('connection', (socket) => {
  let currentRoomId = null;
  let currentTeamId = null;

  // 1. Create Room
  socket.on('createRoom', ({ hostName, selectedTeamId, options }, callback) => {
    const roomId = generateRoomCode();
    const room = createRoomInstance(roomId, socket.id, hostName || 'Host', selectedTeamId || 'CSK', options);
    rooms.set(roomId, room);

    currentRoomId = roomId;
    currentTeamId = selectedTeamId;
    socket.join(roomId);

    console.log(`[Room Created] ${roomId} by ${hostName} (${selectedTeamId})`);
    callback({ success: true, roomId, state: getPublicRoomState(room) });
  });

  // 1b. Query Room Info & Available Franchises
  socket.on('getRoomInfo', ({ roomId }, callback) => {
    const upperCode = (roomId || '').trim().toUpperCase();
    const room = rooms.get(upperCode);
    if (!room) {
      if (callback) callback({ success: false, message: 'Room code not found' });
      return;
    }
    const teamsList = Object.values(room.teams).map(t => ({
      id: t.id,
      name: t.name,
      shortName: t.shortName,
      logo: t.logo,
      primaryColor: t.primaryColor,
      isTaken: !!t.ownerSocketId,
      ownerName: t.ownerName,
      isBot: t.isBot
    }));
    if (callback) {
      callback({
        success: true,
        roomId: upperCode,
        hostName: room.hostName,
        status: room.status,
        options: room.options,
        teams: teamsList
      });
    }
  });

  // 2. Join Room
  socket.on('joinRoom', ({ roomId, playerName, selectedTeamId }, callback) => {
    const upperCode = (roomId || '').trim().toUpperCase();
    const room = rooms.get(upperCode);

    if (!room) {
      return callback({ success: false, message: 'Room code not found' });
    }

    const team = room.teams[selectedTeamId];
    if (!team) {
      return callback({ success: false, message: 'Invalid team selected' });
    }

    if (team.ownerSocketId && team.ownerSocketId !== socket.id) {
      return callback({ success: false, message: `${team.name} is already taken by another player!` });
    }

    team.ownerSocketId = socket.id;
    team.ownerName = playerName || 'Manager';
    team.isBot = false;

    currentRoomId = upperCode;
    currentTeamId = selectedTeamId;
    socket.join(upperCode);

    io.to(upperCode).emit('roomUpdated', getPublicRoomState(room));
    callback({ success: true, roomId: upperCode, state: getPublicRoomState(room) });
  });

  // 2b. Switch Team in Waiting Lobby ONLY (Locked once match starts)
  socket.on('switchTeam', ({ roomId, newTeamId }, callback) => {
    const room = rooms.get(roomId);
    if (!room) {
      if (callback) callback({ success: false, message: 'Room not found' });
      return;
    }

    if (room.status !== 'LOBBY') {
      if (callback) callback({ success: false, message: 'Franchises are locked! You can only pick or switch before the auction starts.' });
      return;
    }

    const newTeam = room.teams[newTeamId];
    if (!newTeam) {
      if (callback) callback({ success: false, message: 'Invalid team' });
      return;
    }

    if (newTeam.ownerSocketId && newTeam.ownerSocketId !== socket.id) {
      if (callback) callback({ success: false, message: `${newTeam.name} is already taken!` });
      return;
    }

    // Find player's current name
    let playerName = 'Manager';
    Object.values(room.teams).forEach(t => {
      if (t.ownerSocketId === socket.id) {
        playerName = t.ownerName || playerName;
        t.ownerSocketId = null;
        t.ownerName = null;
        t.isBot = room.options.fillWithBots !== false;
      }
    });

    // Assign new team
    newTeam.ownerSocketId = socket.id;
    newTeam.ownerName = playerName;
    newTeam.isBot = false;
    currentTeamId = newTeamId;

    const publicState = getPublicRoomState(room);
    io.to(roomId).emit('roomUpdated', publicState);
    io.to(roomId).emit('auctionUpdate', publicState);
    if (callback) callback({ success: true, newTeamId, state: publicState });
  });

  // 2c. Host Kick Player from Franchise
  socket.on('kickPlayer', ({ roomId, targetTeamId }, callback) => {
    const room = rooms.get(roomId);
    if (!room || room.hostSocketId !== socket.id) {
      if (callback) callback({ success: false, message: 'Only the room host can remove players' });
      return;
    }

    const team = room.teams[targetTeamId];
    if (!team) {
      if (callback) callback({ success: false, message: 'Team not found' });
      return;
    }

    const targetSocketId = team.ownerSocketId;
    team.ownerSocketId = null;
    team.ownerName = null;
    team.isBot = room.options.fillWithBots !== false;

    if (targetSocketId && io.sockets.sockets.get(targetSocketId)) {
      io.to(targetSocketId).emit('kickedFromRoom', { reason: 'You were removed from this franchise by the room host.' });
    }

    const publicState = getPublicRoomState(room);
    io.to(roomId).emit('roomUpdated', publicState);
    io.to(roomId).emit('auctionUpdate', publicState);
    if (callback) callback({ success: true, state: publicState });
  });

  // 3. Start Auction
  socket.on('startAuction', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room || room.hostSocketId !== socket.id) return;
    startAuctionClock(room);
  });

  // 4. Place Bid
  socket.on('placeBid', ({ roomId, teamId, amount }) => {
    const room = rooms.get(roomId);
    if (!room || room.status !== 'BIDDING') return;

    const team = room.teams[teamId];
    if (!team) return;

    // Verify ownership: player can only bid for their own team
    if (team.ownerSocketId !== socket.id) {
      return socket.emit('bidRejected', { reason: 'You can only place bids for your own franchise!' });
    }

    const currentPlayer = room.players[room.currentPlayerIndex];
    if (!currentPlayer) return;

    const bidToPlace = amount || getNextBidAmount(room.currentBid, currentPlayer.basePrice);
    const check = canTeamBid(room, teamId, bidToPlace);

    if (!check.ok) {
      return socket.emit('bidRejected', { reason: check.reason });
    }

    executeBid(room, teamId, bidToPlace, team.ownerName);
  });

  // 5. Host Controls: Skip, Pause, Resume, End
  socket.on('skipPlayer', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room || room.hostSocketId !== socket.id) return;
    resolveCurrentAuction(room);
  });

  socket.on('togglePause', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room || room.hostSocketId !== socket.id) return;
    if (room.status === 'BIDDING') {
      stopAuctionClock(room);
      room.status = 'PAUSED';
      io.to(roomId).emit('auctionPaused');
    } else if (room.status === 'PAUSED') {
      startAuctionClock(room);
    }
  });

  socket.on('endAuctionNow', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room || room.hostSocketId !== socket.id) return;
    completeAuction(room);
  });

  // 6. Live Chat & Taunts
  socket.on('sendChat', ({ roomId, message, teamId, senderName }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const chatItem = {
      teamId,
      senderName,
      message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    io.to(roomId).emit('newChat', chatItem);
  });

  // 7. Request Squad Analysis on Demand
  socket.on('requestAnalysis', ({ roomId, teamId }, callback) => {
    const room = rooms.get(roomId);
    if (!room) return callback({ error: 'Room not found' });
    const team = room.teams[teamId];
    if (!team) return callback({ error: 'Team not found' });

    const analysis = analyzer.analyzeSquad(team, team.squad, Object.values(room.teams));
    callback({ analysis });
  });

  // 8. Run / Re-simulate Tournament on Demand
  socket.on('runTournamentSim', ({ roomId }, callback) => {
    const room = rooms.get(roomId);
    if (!room) return callback({ error: 'Room not found' });
    const simResult = analyzer.simulateTournament(Object.values(room.teams));
    callback({ simResult });
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    if (currentRoomId && rooms.has(currentRoomId)) {
      const room = rooms.get(currentRoomId);
      if (currentTeamId && room.teams[currentTeamId]) {
        // Keep team data intact, mark as disconnected or convert to bot
        console.log(`[Disconnect] ${socket.id} left ${currentRoomId}`);
      }
    }
  });
});

// REST Endpoints
app.get('/api/info', (req, res) => {
  res.json({
    localIp: LOCAL_IP,
    port: PORT,
    totalPlayers: allPlayersData.length,
    teams: teamsData
  });
});

app.get('/api/teams', (req, res) => {
  res.json(teamsData);
});

app.get('/api/players', (req, res) => {
  res.json(allPlayersData);
});

// Support both standalone Node server and Vercel serverless deployment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n========================================================`);
    console.log(`🏏 IPL MEGA AUCTION ARENA & PRO SQUAD ANALYZER IS LIVE!`);
    console.log(`⚡ Local URL:   http://localhost:${PORT}`);
    console.log(`📱 Wi-Fi URL:   http://${LOCAL_IP}:${PORT}`);
    console.log(`========================================================\n`);
  });
}

module.exports = app;

