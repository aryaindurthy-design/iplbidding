// Mobile-First IPL Auction Client & Pro AI Squad Judge
// 24/7 Permanent Unstoppable Cloud Backend
const CLOUD_BACKEND_URL = 'https://iplbidding-backend.onrender.com';

const urlParams = new URLSearchParams(window.location.search);
const customBackendParam = urlParams.get('backend');

const isLocalEnv = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isRenderEnv = window.location.hostname.includes('onrender.com');

const SOCKET_URL = customBackendParam || ((isLocalEnv || isRenderEnv) ? '' : CLOUD_BACKEND_URL);

// Persistent Player Token & Session Management
function getOrCreatePlayerToken() {
  let tok = localStorage.getItem('ipl_player_token');
  if (!tok) {
    tok = 'tok_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    localStorage.setItem('ipl_player_token', tok);
  }
  return tok;
}
const myPlayerToken = getOrCreatePlayerToken();

function saveSession(roomId, teamId, managerName, isHost) {
  if (!roomId) return;
  localStorage.setItem('ipl_session', JSON.stringify({
    roomId,
    teamId,
    managerName,
    isHost,
    token: myPlayerToken,
    savedAt: Date.now()
  }));
}

function clearSession() {
  localStorage.removeItem('ipl_session');
}

function loadSession() {
  try {
    const raw = localStorage.getItem('ipl_session');
    if (!raw) return null;
    const sess = JSON.parse(raw);
    if (Date.now() - (sess.savedAt || 0) > 8 * 3600 * 1000) {
      clearSession();
      return null;
    }
    return sess;
  } catch (e) {
    return null;
  }
}

// Live Notification Toast Banner
function showNotificationToast(message, color = '#22c55e') {
  let toast = document.getElementById('ipl-live-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'ipl-live-toast';
    toast.style.position = 'fixed';
    toast.style.top = '65px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.zIndex = '9999';
    toast.style.padding = '12px 22px';
    toast.style.borderRadius = '9999px';
    toast.style.fontWeight = '800';
    toast.style.fontSize = '0.92rem';
    toast.style.boxShadow = '0 10px 35px rgba(0,0,0,0.7)';
    toast.style.transition = 'all 0.3s ease';
    toast.style.backdropFilter = 'blur(16px)';
    toast.style.webkitBackdropFilter = 'blur(16px)';
    toast.style.maxWidth = '90vw';
    toast.style.textAlign = 'center';
    document.body.appendChild(toast);
  }
  toast.style.background = `${color}30`;
  toast.style.border = `2px solid ${color}`;
  toast.style.color = '#fff';
  toast.innerHTML = message;
  toast.style.display = 'block';
  toast.style.opacity = '1';

  if (window.toastTimeout) clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => { toast.style.display = 'none'; }, 300);
  }, 4500);
}

const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1500,
  reconnectionDelayMax: 6000,
  timeout: 10000
});

let sessionRestored = false;
function attemptSessionRestore() {
  if (sessionRestored) return;
  const savedSession = loadSession();
  if (!savedSession || !savedSession.roomId) return;

  console.log('🔄 Reconnecting to saved session for room:', savedSession.roomId);
  socket.emit('reconnectSession', {
    roomId: savedSession.roomId,
    playerToken: myPlayerToken
  }, (res) => {
    if (res && res.success) {
      sessionRestored = true;
      myRoomId = res.roomId;
      myTeamId = res.teamId || savedSession.teamId;
      myManagerName = res.managerName || savedSession.managerName || 'Manager';
      isHost = res.isHost;
      roomState = res.state;

      saveSession(myRoomId, myTeamId, myManagerName, isHost);
      updateNavRoomMeta();

      if (roomState.status === 'LOBBY') {
        showWaitingLobby();
      } else if (roomState.status === 'COMPLETED') {
        showView('analyzer');
        renderAnalyzerView();
      } else {
        views.waitingLobby.style.display = 'none';
        showView('arena');
        renderPlayerSpotlight(roomState.currentPlayer);
        renderArenaTeams();
        updateBiddingPanel(roomState);
      }

      showNotificationToast(`✅ Welcome back, <strong>${myManagerName}</strong>! Restored room <strong>${myRoomId}</strong>!`, '#22c55e');
    } else {
      console.warn('Saved room has closed or expired:', res?.message);
      clearSession();
    }
  });
}

// Update top navbar connection indicator
socket.on('connect', () => {
  console.log('✅ Connected to Real-Time Auction Server! Socket ID:', socket.id);
  const pill = document.getElementById('connection-status-pill');
  if (pill) {
    pill.textContent = '🟢 Online';
    pill.style.color = '#22c55e';
    pill.title = 'Real-time WebSocket connected';
  }
  attemptSessionRestore();
});

socket.on('connect_error', (err) => {
  console.warn('⚠️ Server connecting notice:', err.message);
  const pill = document.getElementById('connection-status-pill');
  if (pill) {
    pill.textContent = '🟡 Connecting...';
    pill.style.color = '#f59e0b';
  }
});

socket.on('disconnect', (reason) => {
  console.warn('Disconnected from server:', reason);
  const pill = document.getElementById('connection-status-pill');
  if (pill) {
    pill.textContent = '🟡 Reconnecting...';
    pill.style.color = '#f59e0b';
  }
});

// Official Roster for Instant Zero-Delay Rendering
const OFFICIAL_IPL_TEAMS = [
  { id: 'RCB', name: 'Royal Challengers Bengaluru', shortName: 'RCB', primaryColor: '#EC1C24', logo: 'https://documents.iplt20.com/ipl/RCB/Logos/Logooutline/RCBoutline.png', slogan: 'Play Bold! 👑' },
  { id: 'CSK', name: 'Chennai Super Kings', shortName: 'CSK', primaryColor: '#FDB913', logo: 'https://documents.iplt20.com/ipl/CSK/logos/Logooutline/CSKoutline.png', slogan: 'Whistle Podu! 🦁' },
  { id: 'MI', name: 'Mumbai Indians', shortName: 'MI', primaryColor: '#004BA0', logo: 'https://documents.iplt20.com/ipl/MI/Logos/Logooutline/MIoutline.png', slogan: 'Duniya Hila Denge! ⚡' },
  { id: 'SRH', name: 'Sunrisers Hyderabad', shortName: 'SRH', primaryColor: '#F26522', logo: 'https://documents.iplt20.com/ipl/SRH/Logos/Logooutline/SRHoutline.png', slogan: 'Orange Army! 🦅' },
  { id: 'KKR', name: 'Kolkata Knight Riders', shortName: 'KKR', primaryColor: '#3A225D', logo: 'https://documents.iplt20.com/ipl/KKR/Logos/Logooutline/KKRoutline.png', slogan: 'Korbo Lorbo Jeetbo! 💜' },
  { id: 'RR', name: 'Rajasthan Royals', shortName: 'RR', primaryColor: '#EA1A85', logo: 'https://documents.iplt20.com/ipl/RR/Logos/Logooutline/RRoutline.png', slogan: 'Halla Bol! ⚔️' },
  { id: 'DC', name: 'Delhi Capitals', shortName: 'DC', primaryColor: '#0078BC', logo: 'https://documents.iplt20.com/ipl/DC/Logos/LogoOutline/DCoutline.png', slogan: 'Roar Macha! 🐯' },
  { id: 'PBKS', name: 'Punjab Kings', shortName: 'PBKS', primaryColor: '#DD1F2D', logo: 'https://documents.iplt20.com/ipl/PBKS/Logos/Logooutline/PBKSoutline.png', slogan: 'Sadda Punjab! 🥁' },
  { id: 'LSG', name: 'Lucknow Super Giants', shortName: 'LSG', primaryColor: '#0057E7', logo: 'https://documents.iplt20.com/ipl/LSG/Logos/Logooutline/LSGoutline.png', slogan: 'Gazab Andaz! 🏹' },
  { id: 'GT', name: 'Gujarat Titans', shortName: 'GT', primaryColor: '#1B2133', logo: 'https://documents.iplt20.com/ipl/GT/Logos/Logooutline/GToutline.png', slogan: 'Aava De! ⚡' }
];

// Helper to route images through same-origin proxy to eliminate ORB/CORS/hotlinking restrictions
function getProxyOrDirectImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('/')) {
    return url;
  }
  return `/api/proxy-image?url=${encodeURIComponent(url)}`;
}

// State
let myRoomId = null;
let myTeamId = null;
let myManagerName = 'Manager';
let isHost = false;
let allTeams = OFFICIAL_IPL_TEAMS;
let selectedHostTeamId = 'RCB';
let selectedJoinTeamId = 'CSK';
let roomState = null;
let activeCritiqueTeamId = 'RCB';

// DOM Elements
const views = {
  lobby: document.getElementById('view-lobby'),
  waitingLobby: document.getElementById('modal-waiting-lobby'),
  arena: document.getElementById('view-arena'),
  franchises: document.getElementById('view-franchises'),
  chat: document.getElementById('view-chat'),
  analyzer: document.getElementById('view-analyzer')
};

const nav = {
  roomMeta: document.getElementById('nav-room-meta'),
  roomCode: document.getElementById('nav-room-code'),
  copyCodePill: document.getElementById('btn-copy-code-pill'),
  myTeamName: document.getElementById('nav-my-team-name'),
  myTeamLogo: document.getElementById('nav-my-team-logo'),
  hostControls: document.getElementById('host-controls'),
  btnPause: document.getElementById('btn-host-pause'),
  btnSkip: document.getElementById('btn-host-skip'),
  btnEnd: document.getElementById('btn-host-end'),
  btnToggleAudio: document.getElementById('btn-toggle-audio'),
  segmentedBar: document.getElementById('mobile-segmented-bar')
};

// --- INITIALIZATION ---
window.addEventListener('DOMContentLoaded', async () => {
  setupConfetti();

  // Instant render of team pickers
  renderTeamPickers();

  // Background refresh of teams metadata
  fetch('/api/teams').then(r => r.json()).then(data => {
    if (Array.isArray(data) && data.length > 0) {
      allTeams = data;
      renderTeamPickers();
    }
  }).catch(e => console.log('Using pre-bundled teams'));

  // Check URL query for room code (?room=AURA9)
  const urlParams = new URLSearchParams(window.location.search);
  const roomParam = urlParams.get('room');
  if (roomParam) {
    const joinInput = document.getElementById('join-code-input');
    const joinBtn = document.getElementById('btn-join-room');
    if (joinInput) {
      joinInput.value = roomParam.toUpperCase();
      checkRoomCodeAvailability(roomParam.toUpperCase());
      setTimeout(() => {
        joinInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        joinInput.focus();
        if (joinBtn) {
          joinBtn.style.boxShadow = '0 0 25px rgba(56, 189, 248, 0.7)';
          joinBtn.innerHTML = 'Enter Auction Room 🚪 (Tap to Join!)';
        }
      }, 400);
    }
  }

  setupEventListeners();
});

// View Switcher (Supports mobile tabs)
function showView(viewKey) {
  Object.keys(views).forEach(k => {
    if (k === 'waitingLobby') {
      views[k].style.display = viewKey === k ? 'flex' : 'none';
      if (viewKey === k) {
        views[k].style.opacity = '1';
        views[k].classList.add('active');
      }
    } else {
      views[k].classList.remove('active');
      views[k].style.display = viewKey === k ? 'block' : 'none';
      if (viewKey === k) views[k].classList.add('active');
    }
  });

  document.querySelectorAll('.mobile-nav-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === viewKey);
  });
}

// Select Host Team
function selectHostTeam(team) {
  selectedHostTeamId = team.id;
  const hostPicker = document.getElementById('host-teams-picker');
  if (hostPicker) {
    hostPicker.querySelectorAll('.team-tile').forEach(el => {
      el.classList.remove('selected');
      el.style.borderColor = 'rgba(255,255,255,0.1)';
      el.style.boxShadow = 'none';
    });
    const tile = hostPicker.querySelector(`[data-team-id="${team.id}"]`);
    if (tile) {
      tile.classList.add('selected');
      tile.style.borderColor = team.primaryColor;
      tile.style.boxShadow = `0 0 16px ${team.primaryColor}88`;
    }
  }

  const hostSelect = document.getElementById('host-team-select');
  if (hostSelect && hostSelect.value !== team.id) {
    hostSelect.value = team.id;
  }

  const quickLabel = document.getElementById('quick-play-team-label');
  if (quickLabel) {
    quickLabel.textContent = team.name;
    quickLabel.style.color = team.primaryColor;
  }

  const badge = document.getElementById('host-selected-badge');
  if (badge) {
    badge.textContent = `Selected: ${team.name}`;
    badge.style.color = team.primaryColor;
  }
  if (window.audioEngine) window.audioEngine.playBidSound();
}

// Select Join Team
function selectJoinTeam(team) {
  selectedJoinTeamId = team.id;
  const joinPicker = document.getElementById('join-teams-picker');
  if (joinPicker) {
    joinPicker.querySelectorAll('.team-tile').forEach(el => {
      el.classList.remove('selected');
      el.style.borderColor = 'rgba(255,255,255,0.1)';
      el.style.boxShadow = 'none';
    });
    const tile = joinPicker.querySelector(`[data-team-id="${team.id}"]`);
    if (tile) {
      tile.classList.add('selected');
      tile.style.borderColor = team.primaryColor;
      tile.style.boxShadow = `0 0 16px ${team.primaryColor}88`;
    }
  }

  const joinSelect = document.getElementById('join-team-select');
  if (joinSelect && joinSelect.value !== team.id) {
    joinSelect.value = team.id;
  }

  const badge = document.getElementById('join-selected-badge');
  if (badge) {
    badge.textContent = `Selected: ${team.name}`;
    badge.style.color = team.primaryColor;
  }
  if (window.audioEngine) window.audioEngine.playBidSound();
}

// Render Team Picker Tiles in Lobby with Official Logos
function renderTeamPickers() {
  const hostPicker = document.getElementById('host-teams-picker');
  const joinPicker = document.getElementById('join-teams-picker');
  if (!hostPicker || !joinPicker) return;

  hostPicker.innerHTML = '';
  joinPicker.innerHTML = '';

  allTeams.forEach((t) => {
    // 1. Host Tile
    const hTile = document.createElement('div');
    const isHostSelected = t.id === selectedHostTeamId;
    hTile.className = `team-tile ${isHostSelected ? 'selected' : ''}`;
    hTile.dataset.teamId = t.id;
    if (isHostSelected) {
      hTile.style.borderColor = t.primaryColor;
      hTile.style.boxShadow = `0 0 16px ${t.primaryColor}88`;
    }
    hTile.innerHTML = `
      <img class="tile-logo-img" src="${getProxyOrDirectImageUrl(t.logo)}" alt="${t.shortName}">
      <div class="tile-name">${t.shortName}</div>
    `;
    hTile.onclick = () => selectHostTeam(t);
    hostPicker.appendChild(hTile);

    // 2. Join Tile
    const jTile = document.createElement('div');
    const isJoinSelected = t.id === selectedJoinTeamId;
    jTile.className = `team-tile ${isJoinSelected ? 'selected' : ''}`;
    jTile.dataset.teamId = t.id;
    if (isJoinSelected) {
      jTile.style.borderColor = t.primaryColor;
      jTile.style.boxShadow = `0 0 16px ${t.primaryColor}88`;
    }
    jTile.innerHTML = `
      <img class="tile-logo-img" src="${getProxyOrDirectImageUrl(t.logo)}" alt="${t.shortName}">
      <div class="tile-name">${t.shortName}</div>
    `;
    jTile.onclick = () => selectJoinTeam(t);
    joinPicker.appendChild(jTile);
  });

  // Update initial badges
  const hostTeam = allTeams.find(t => t.id === selectedHostTeamId);
  if (hostTeam) selectHostTeam(hostTeam);
  const joinTeam = allTeams.find(t => t.id === selectedJoinTeamId);
  if (joinTeam) selectJoinTeam(joinTeam);
}

// Live Room Availability Checker for Friends
let roomCheckTimeout = null;
function checkRoomCodeAvailability(code) {
  if (roomCheckTimeout) clearTimeout(roomCheckTimeout);
  const statusBox = document.getElementById('join-room-status-box');

  if (!code || code.length < 3) {
    if (statusBox) statusBox.style.display = 'none';
    renderTeamPickers();
    return;
  }

  roomCheckTimeout = setTimeout(() => {
    socket.emit('getRoomInfo', { roomId: code }, (res) => {
      if (!statusBox) return;
      if (res && res.success) {
        statusBox.style.display = 'block';
        statusBox.style.background = 'rgba(34,197,94,0.12)';
        statusBox.style.border = '1px solid rgba(34,197,94,0.4)';
        statusBox.style.color = '#4ade80';
        const claimed = res.teams.filter(t => t.isTaken).length;
        statusBox.innerHTML = `✅ <strong>Room Found!</strong> Host: <strong>${res.hostName}</strong> • ${claimed}/10 Franchises Claimed.<br><span style="color:#f59e0b;font-weight:700;">👇 Select any open franchise below to claim it:</span>`;
        updateJoinPickerWithRoomData(res.teams);
      } else {
        statusBox.style.display = 'block';
        statusBox.style.background = 'rgba(239,68,68,0.12)';
        statusBox.style.border = '1px solid rgba(239,68,68,0.4)';
        statusBox.style.color = '#f87171';
        statusBox.innerHTML = `⚠️ Room code <strong>${code}</strong> not found. Ask your friend for the active 5-letter code!`;
        renderTeamPickers();
      }
    });
  }, 250);
}

// Update Join Picker with real-time room availability
function updateJoinPickerWithRoomData(teamsList) {
  const joinPicker = document.getElementById('join-teams-picker');
  const joinSelect = document.getElementById('join-team-select');
  if (!joinPicker || !joinSelect) return;

  joinPicker.innerHTML = '';
  joinSelect.innerHTML = '';

  let firstAvailableTeam = null;

  teamsList.forEach(t => {
    const isTaken = t.isTaken;
    if (!isTaken && !firstAvailableTeam) {
      firstAvailableTeam = t;
    }

    if (!isTaken) {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = `${t.name} (${t.shortName})`;
      joinSelect.appendChild(opt);
    }

    const jTile = document.createElement('div');
    jTile.className = `team-tile ${t.id === selectedJoinTeamId ? 'selected' : ''}`;
    jTile.dataset.teamId = t.id;

    if (isTaken) {
      jTile.style.opacity = '0.38';
      jTile.style.cursor = 'not-allowed';
      jTile.style.borderColor = 'rgba(239,68,68,0.3)';
      jTile.innerHTML = `
        <img class="tile-logo-img" src="${getProxyOrDirectImageUrl(t.logo)}" alt="${t.shortName}" style="filter: grayscale(85%);">
        <div class="tile-name" style="color: #94a3b8;">${t.shortName}</div>
        <div style="font-size: 0.58rem; color: #ef4444; font-weight: 800; text-transform: uppercase;">TAKEN (${t.ownerName || 'Friend'})</div>
      `;
      jTile.onclick = () => {
        alert(`❌ ${t.name} is already claimed by ${t.ownerName || 'another player'}! Please choose one of the available franchises.`);
      };
    } else {
      jTile.style.opacity = '1.0';
      jTile.style.cursor = 'pointer';
      const isSelected = t.id === selectedJoinTeamId;
      if (isSelected) {
        jTile.style.borderColor = t.primaryColor;
        jTile.style.boxShadow = `0 0 16px ${t.primaryColor}88`;
      }
      jTile.innerHTML = `
        <img class="tile-logo-img" src="${getProxyOrDirectImageUrl(t.logo)}" alt="${t.shortName}">
        <div class="tile-name">${t.shortName}</div>
        <div style="font-size: 0.6rem; color: #22c55e; font-weight: 800; text-transform: uppercase;">AVAILABLE</div>
      `;
      jTile.onclick = () => selectJoinTeam(t);
    }

    joinPicker.appendChild(jTile);
  });

  // If current join team is taken, auto-switch to first open team
  const currentIsTaken = teamsList.find(t => t.id === selectedJoinTeamId && t.isTaken);
  if (currentIsTaken && firstAvailableTeam) {
    selectJoinTeam(firstAvailableTeam);
  }
}

// Setup Event Handlers
function setupEventListeners() {
  // Mobile Segmented Bar Clicks
  document.querySelectorAll('.mobile-nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      if (tabName === 'franchises') renderFranchisesTab();
      if (tabName === 'analyzer') renderAnalyzerView();
      showView(tabName);
    });
  });

  // Tap to Copy Room Code Pill (copies full invite link)
  nav.copyCodePill.addEventListener('click', () => {
    if (!myRoomId) return;
    const shareUrl = `${window.location.origin}/?room=${myRoomId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert(`✅ Room Link Copied!\n\n${shareUrl}\n\nSend this to your friends on WhatsApp!`);
    }).catch(() => {
      alert(`Room Code: ${myRoomId}`);
    });
  });

  // Audio Toggle
  nav.btnToggleAudio.addEventListener('click', () => {
    const isMuted = window.audioEngine.toggleMute();
    nav.btnToggleAudio.textContent = isMuted ? '🔇 OFF' : '🔊 ON';
  });

  // Host Pause, Skip & End Controls
  if (nav.btnPause) {
    nav.btnPause.addEventListener('click', () => {
      if (myRoomId) socket.emit('togglePause', { roomId: myRoomId });
    });
  }

  nav.btnSkip.addEventListener('click', () => {
    if (myRoomId) socket.emit('skipPlayer', { roomId: myRoomId });
  });

  nav.btnEnd.addEventListener('click', () => {
    if (confirm('End the auction and jump straight to the Pro AI Squad Analyzer?')) {
      if (myRoomId) socket.emit('endAuctionNow', { roomId: myRoomId });
    }
  });

  // Host & Join Team Dropdown Sync
  const hostSelect = document.getElementById('host-team-select');
  if (hostSelect) {
    hostSelect.addEventListener('change', () => {
      const team = allTeams.find(t => t.id === hostSelect.value);
      if (team) selectHostTeam(team);
    });
  }

  const joinSelect = document.getElementById('join-team-select');
  if (joinSelect) {
    joinSelect.addEventListener('change', () => {
      const team = allTeams.find(t => t.id === joinSelect.value);
      if (team) selectJoinTeam(team);
    });
  }

  // Live Room Code Typing Listener
  const joinInput = document.getElementById('join-code-input');
  if (joinInput) {
    joinInput.addEventListener('input', () => {
      const upper = joinInput.value.trim().toUpperCase();
      joinInput.value = upper;
      checkRoomCodeAvailability(upper);
    });
  }

  // Live Franchise Switcher Modal Elements & Logic
  const teamPill = document.getElementById('nav-my-team-pill');
  const switchModal = document.getElementById('modal-switch-team');
  const closeSwitchBtn = document.getElementById('btn-close-switch-modal');
  const switchGrid = document.getElementById('switch-team-grid');

  function renderSwitchTeamModal() {
    if (!switchGrid || !roomState || !roomState.teams) return;
    switchGrid.innerHTML = '';
    allTeams.forEach(t => {
      const roomTeam = roomState.teams[t.id];
      const isMyTeam = t.id === myTeamId;
      const isAvailable = !roomTeam || !roomTeam.ownerSocketId || roomTeam.ownerSocketId === socket.id;

      const tile = document.createElement('div');
      tile.className = `team-tile ${isMyTeam ? 'selected' : ''}`;
      if (isMyTeam) {
        tile.style.borderColor = t.primaryColor;
        tile.style.boxShadow = `0 0 16px ${t.primaryColor}88`;
      }
      tile.style.opacity = isAvailable ? '1.0' : '0.4';
      tile.innerHTML = `
        <img class="tile-logo-img" src="${getProxyOrDirectImageUrl(t.logo)}" alt="${t.shortName}">
        <div class="tile-name">${t.shortName}</div>
        <div style="font-size: 0.65rem; color: ${isMyTeam ? '#f59e0b' : (isAvailable ? '#22c55e' : '#ef4444')}; font-weight: 800;">
          ${isMyTeam ? 'CURRENT' : (isAvailable ? 'AVAILABLE' : 'TAKEN')}
        </div>
      `;

      if (isAvailable && !isMyTeam) {
        tile.onclick = () => {
          socket.emit('switchTeam', { roomId: myRoomId, newTeamId: t.id, playerToken: myPlayerToken }, (res) => {
            if (res && res.success) {
              myTeamId = t.id;
              saveSession(myRoomId, myTeamId, myManagerName, isHost);
              updateNavRoomMeta();
              updateLobbyMembers();
              if (switchModal) switchModal.style.display = 'none';
              if (window.audioEngine) window.audioEngine.playBidSound();
              showNotificationToast(`Switched franchise to ${t.name}! 🏏`, t.primaryColor);
            } else {
              alert(res?.message || 'Could not switch team');
            }
          });
        };
      }
      switchGrid.appendChild(tile);
    });
  }

  if (teamPill && switchModal) {
    teamPill.addEventListener('click', () => {
      if (!myRoomId || !roomState) {
        alert('You can switch your franchise anytime once inside a room!');
        return;
      }
      if (roomState.status !== 'LOBBY') {
        alert('🔒 Franchises are locked once the auction begins! Teams can only be switched in the waiting lobby before the match begins.');
        return;
      }
      renderSwitchTeamModal();
      switchModal.style.display = 'flex';
    });
  }

  if (closeSwitchBtn && switchModal) {
    closeSwitchBtn.addEventListener('click', () => {
      switchModal.style.display = 'none';
    });
  }

  // Lobby Switch Team Button
  const lobbySwitchBtn = document.getElementById('btn-lobby-switch-team');
  if (lobbySwitchBtn && switchModal) {
    lobbySwitchBtn.addEventListener('click', () => {
      renderSwitchTeamModal();
      switchModal.style.display = 'flex';
    });
  }

  // Create Room
  document.getElementById('btn-create-room').addEventListener('click', () => {
    window.audioEngine.init();
    const btn = document.getElementById('btn-create-room');
    const origText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '⏳ Creating Room...';

    if (!socket.connected) {
      showNotificationToast('⚡ Connecting to 24/7 Cloud Auction Server...', '#f59e0b');
    }

    const hostName = document.getElementById('host-name-input').value.trim() || 'Captain Cool';
    const selectedTeamId = selectedHostTeamId || 'RCB';
    const purse = parseFloat(document.getElementById('setting-purse').value);
    const timer = parseInt(document.getElementById('setting-timer').value);
    const fillWithBots = document.getElementById('setting-bots').checked;

    const timeout = setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = origText;
      alert('Connecting to the 24/7 cloud server took longer than expected. Please check your internet connection and tap again!');
    }, 25000);

    socket.emit('createRoom', {
      hostName,
      selectedTeamId,
      options: { purse, squadLimit: 11, overseasLimit: 4, timerDuration: timer, fillWithBots },
      playerToken: myPlayerToken
    }, (res) => {
      clearTimeout(timeout);
      btn.disabled = false;
      btn.innerHTML = origText;

      if (res && res.success) {
        myRoomId = res.roomId;
        myTeamId = selectedTeamId;
        myManagerName = hostName;
        isHost = true;
        roomState = res.state;
        saveSession(myRoomId, myTeamId, myManagerName, isHost);
        updateNavRoomMeta();
        showWaitingLobby();
      } else {
        alert(res?.message || 'Error creating room. Please try again!');
      }
    });
  });

  // Join Room
  document.getElementById('btn-join-room').addEventListener('click', () => {
    window.audioEngine.init();
    const roomCode = document.getElementById('join-code-input').value.trim().toUpperCase();
    const playerName = document.getElementById('join-name-input').value.trim() || 'Strategist';
    const selectedTeamId = selectedJoinTeamId || 'CSK';

    if (!roomCode) {
      alert('Please enter a 5-letter Room Code');
      return;
    }

    const btn = document.getElementById('btn-join-room');
    const origText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '⏳ Entering Room...';

    if (!socket.connected) {
      showNotificationToast('⚡ Connecting to 24/7 Cloud Auction Server...', '#f59e0b');
    }

    const timeout = setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = origText;
      alert('Connecting to the room timed out. Please verify the room code and tap again!');
    }, 25000);

    socket.emit('joinRoom', {
      roomId: roomCode,
      playerName,
      selectedTeamId,
      playerToken: myPlayerToken
    }, (res) => {
      clearTimeout(timeout);
      btn.disabled = false;
      btn.innerHTML = origText;

      if (res && res.success) {
        myRoomId = res.roomId;
        myTeamId = selectedTeamId;
        myManagerName = playerName;
        isHost = false;
        roomState = res.state;
        saveSession(myRoomId, myTeamId, myManagerName, isHost);
        updateNavRoomMeta();

        if (roomState.status === 'LOBBY') {
          showWaitingLobby();
        } else if (roomState.status === 'COMPLETED') {
          showView('analyzer');
          renderAnalyzerView();
        } else {
          views.waitingLobby.style.display = 'none';
          showView('arena');
          renderPlayerSpotlight(roomState.currentPlayer);
          renderArenaTeams();
          updateBiddingPanel(roomState);
        }
      } else {
        alert(res?.message || 'Could not join room');
      }
    });
  });

  // Quick Solo Play vs AI Bots
  const quickPlayBtn = document.getElementById('btn-quick-play');
  if (quickPlayBtn) {
    quickPlayBtn.addEventListener('click', () => {
      window.audioEngine.init();
      quickPlayBtn.disabled = true;
      quickPlayBtn.innerHTML = '⏳ Launching Solo Auction...';

      if (!socket.connected) {
        showNotificationToast('⚡ Connecting to 24/7 Cloud Auction Server...', '#f59e0b');
      }

      const hostName = document.getElementById('host-name-input').value.trim() || 'Boss Manager';
      const selectedTeamId = selectedHostTeamId || 'RCB';
      const purse = parseFloat(document.getElementById('setting-purse').value) || 90;
      const timer = parseInt(document.getElementById('setting-timer').value) || 12;

      socket.emit('createRoom', {
        hostName,
        selectedTeamId,
        options: { purse, squadLimit: 11, overseasLimit: 4, timerDuration: timer, fillWithBots: true },
        playerToken: myPlayerToken
      }, (res) => {
        if (res && res.success) {
          myRoomId = res.roomId;
          myTeamId = selectedTeamId;
          myManagerName = hostName;
          isHost = true;
          roomState = res.state;
          saveSession(myRoomId, myTeamId, myManagerName, isHost);

          socket.emit('startAuction', { roomId: myRoomId, playerToken: myPlayerToken }, (startRes) => {
            quickPlayBtn.disabled = false;
            quickPlayBtn.innerHTML = '🤖 Play Solo as Royal Challengers Bengaluru vs 9 AI Bots';
            if (startRes && startRes.state) roomState = startRes.state;
            views.waitingLobby.style.display = 'none';
            showView('arena');
            updateNavRoomMeta();
            if (roomState && roomState.currentPlayer) {
              renderPlayerSpotlight(roomState.currentPlayer);
              renderArenaTeams();
              updateBiddingPanel(roomState);
            }
            if (window.audioEngine) window.audioEngine.playGavel();
          });
        } else {
          quickPlayBtn.disabled = false;
          quickPlayBtn.innerHTML = '🤖 Play Solo as Royal Challengers Bengaluru vs 9 AI Bots';
          alert(res?.message || 'Could not launch solo auction. Please try again!');
        }
      });
    });
  }

  // Copy Link Button in Waiting Lobby
  document.getElementById('btn-copy-room-link').addEventListener('click', () => {
    const url = `${window.location.origin}/?room=${myRoomId}`;
    navigator.clipboard.writeText(url).then(() => {
      alert(`✅ Room Link Copied!\n\n${url}\n\nSend this to your friends on WhatsApp or Instagram!`);
    }).catch(() => {
      alert(`Room Link: ${url}`);
    });
  });

  // Start Auction Trigger (Attached to both Top and Bottom buttons)
  function triggerStartAuction() {
    if (!myRoomId) return;
    window.audioEngine.init();

    const topBtn = document.getElementById('btn-start-auction-top');
    const btmBtn = document.getElementById('btn-start-auction-now');
    if (topBtn) { topBtn.disabled = true; topBtn.innerHTML = '⏳ Starting Auction...'; }
    if (btmBtn) { btmBtn.disabled = true; btmBtn.innerHTML = '⏳ Starting Auction...'; }

    const botsCheckbox = document.getElementById('lobby-setting-bots');
    const fillWithBots = botsCheckbox ? botsCheckbox.checked : true;

    const startTimeout = setTimeout(() => {
      if (topBtn) { topBtn.disabled = false; topBtn.innerHTML = isHost ? 'START LIVE AUCTION NOW 🔨 (Host)' : 'START LIVE AUCTION NOW 🔨 (Ready!)'; }
      if (btmBtn) { btmBtn.disabled = false; btmBtn.innerHTML = 'START AUCTION 🔨'; }
      showNotificationToast('⚠️ Starting auction took longer than expected. Please tap again.', '#f59e0b');
    }, 15000);

    socket.emit('startAuction', {
      roomId: myRoomId,
      playerToken: myPlayerToken,
      fillWithBots
    }, (res) => {
      clearTimeout(startTimeout);
      if (topBtn) { topBtn.disabled = false; topBtn.innerHTML = isHost ? 'START LIVE AUCTION NOW 🔨 (Host)' : 'START LIVE AUCTION NOW 🔨 (Ready!)'; }
      if (btmBtn) { btmBtn.disabled = false; btmBtn.innerHTML = 'START AUCTION 🔨'; }

      if (res && res.success) {
        if (res.state) roomState = res.state;
        views.waitingLobby.style.display = 'none';
        showView('arena');
        updateNavRoomMeta();
        if (roomState && roomState.currentPlayer) {
          renderPlayerSpotlight(roomState.currentPlayer);
          renderArenaTeams();
          updateBiddingPanel(roomState);
        }
        if (window.audioEngine) window.audioEngine.playGavel();
      } else if (res && !res.success) {
        alert(res.message || 'Could not start auction. Make sure you are in the room.');
      }
    });
  }

  const topStartBtn = document.getElementById('btn-start-auction-top');
  if (topStartBtn) topStartBtn.addEventListener('click', triggerStartAuction);

  const btmStartBtn = document.getElementById('btn-start-auction-now');
  if (btmStartBtn) btmStartBtn.addEventListener('click', triggerStartAuction);

  document.getElementById('btn-leave-lobby').addEventListener('click', () => {
    clearSession();
    window.location.reload();
  });

  // Desktop Paddle Button
  document.getElementById('btn-raise-bid').addEventListener('click', handleRaiseBid);
  // Mobile Paddle Button
  document.getElementById('btn-raise-bid-mobile').addEventListener('click', handleRaiseBid);

  // Quick Increments
  document.querySelectorAll('.quick-inc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!myRoomId || !myTeamId || !roomState) return;
      const inc = parseFloat(btn.dataset.inc);
      const customAmount = parseFloat((roomState.currentBid + inc).toFixed(2));
      window.audioEngine.playBidSound();
      socket.emit('placeBid', { roomId: myRoomId, teamId: myTeamId, amount: customAmount });
    });
  });

  // Chat senders
  document.getElementById('btn-send-chat').addEventListener('click', () => sendChat('chat-input'));
  document.getElementById('btn-mobile-send-chat').addEventListener('click', () => sendChat('mobile-chat-input'));

  // Taunt pills
  document.querySelectorAll('.taunt-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!myRoomId) return;
      socket.emit('sendChat', {
        roomId: myRoomId,
        message: btn.dataset.taunt,
        teamId: myTeamId,
        senderName: myManagerName
      });
    });
  });

  // Copy Squad Card for WhatsApp Flexing
  const copySquadBtn = document.getElementById('btn-copy-squad-card');
  if (copySquadBtn) {
    copySquadBtn.addEventListener('click', copySquadAuraCard);
  }
}

function handleRaiseBid() {
  if (!myRoomId || !myTeamId || !roomState) return;
  window.audioEngine.playBidSound();
  socket.emit('placeBid', {
    roomId: myRoomId,
    teamId: myTeamId,
    amount: roomState.nextBidAmount
  });
}

function sendChat(inputId) {
  const input = document.getElementById(inputId);
  const msg = input.value.trim();
  if (!msg || !myRoomId) return;

  socket.emit('sendChat', {
    roomId: myRoomId,
    message: msg,
    teamId: myTeamId,
    senderName: myManagerName
  });
  input.value = '';
}

// Update Top App Bar
function updateNavRoomMeta() {
  nav.roomMeta.style.display = 'flex';
  nav.segmentedBar.style.display = 'flex';
  nav.roomCode.textContent = myRoomId;

  const myTeam = allTeams.find(t => t.id === myTeamId);
  const pill = document.getElementById('nav-my-team-pill');
  if (myTeam) {
    nav.myTeamName.textContent = myTeam.shortName;
    nav.myTeamLogo.src = getProxyOrDirectImageUrl(myTeam.logo);
    if (pill) pill.style.borderColor = myTeam.primaryColor;
  }

  const changeBadge = document.querySelector('#nav-my-team-pill span:last-child');
  if (changeBadge) {
    if (roomState && roomState.status !== 'LOBBY') {
      changeBadge.textContent = 'Locked 🔒';
      changeBadge.style.color = '#94a3b8';
      changeBadge.style.background = 'rgba(255,255,255,0.08)';
      if (pill) pill.title = 'Franchises locked during active auction';
    } else {
      changeBadge.textContent = 'Change 🔄';
      changeBadge.style.color = '#f59e0b';
      changeBadge.style.background = 'rgba(255,255,255,0.18)';
      if (pill) pill.title = 'Tap to switch your franchise anytime!';
    }
  }

  if (isHost) {
    nav.hostControls.style.display = 'flex';
  }
}

// Show Waiting Lobby
function showWaitingLobby() {
  showView('waitingLobby');
  document.getElementById('lobby-code-display').textContent = myRoomId;
  const shareUrl = `${window.location.origin}/?room=${myRoomId}`;
  
  const displayEl = document.getElementById('lobby-ip-display');
  if (displayEl) {
    displayEl.textContent = shareUrl;
  }

  const waBtn = document.getElementById('btn-whatsapp-share');
  if (waBtn) {
    const waText = encodeURIComponent(`🏏 Join my Private IPL Mega Auction room!\nCode: ${myRoomId}\n👉 ${shareUrl}`);
    waBtn.href = `https://api.whatsapp.com/send?text=${waText}`;
  }

  const topStartBtn = document.getElementById('btn-start-auction-top');
  const btmStartBtn = document.getElementById('btn-start-auction-now');
  const waitingNotice = document.getElementById('lobby-waiting-notice');

  if (topStartBtn) topStartBtn.style.display = 'block';
  if (btmStartBtn) btmStartBtn.style.display = 'block';

  if (isHost) {
    if (topStartBtn) topStartBtn.innerHTML = 'START LIVE AUCTION NOW 🔨 (Host)';
    if (btmStartBtn) btmStartBtn.innerHTML = 'START AUCTION 🔨';
    if (waitingNotice) {
      waitingNotice.style.display = 'block';
      waitingNotice.style.color = '#a7f3d0';
      waitingNotice.style.background = 'rgba(34,197,94,0.1)';
      waitingNotice.style.borderColor = 'rgba(34,197,94,0.3)';
      waitingNotice.innerHTML = `👑 You are the <strong>Host</strong>! Share the code <strong>${myRoomId}</strong> with friends. Tap above to start anytime!`;
    }
  } else {
    const hostName = (roomState && roomState.hostName) ? roomState.hostName : 'Host';
    if (topStartBtn) topStartBtn.innerHTML = 'START LIVE AUCTION NOW 🔨 (Ready!)';
    if (btmStartBtn) btmStartBtn.innerHTML = 'START AUCTION 🔨';
    if (waitingNotice) {
      waitingNotice.style.display = 'block';
      waitingNotice.style.color = '#38bdf8';
      waitingNotice.style.background = 'rgba(56,189,248,0.1)';
      waitingNotice.style.borderColor = 'rgba(56,189,248,0.3)';
      waitingNotice.innerHTML = `👥 Connected with <strong>${hostName}</strong>! Both you and the host can tap <strong>START AUCTION</strong> above when ready!`;
    }
  }

  updateLobbyMembers();
}

function updateLobbyMembers() {
  if (!roomState || !roomState.teams) return;
  const list = document.getElementById('lobby-members-list');
  list.innerHTML = '';

  const claimedTeams = Object.values(roomState.teams).filter(t => t.ownerSocketId);
  document.getElementById('lobby-member-count').textContent = claimedTeams.length;

  Object.values(roomState.teams).forEach(t => {
    const isMyTeam = t.id === myTeamId;
    const isAvailable = !t.ownerSocketId || t.ownerSocketId === socket.id;

    const isOccupiedByOther = t.ownerSocketId && t.ownerSocketId !== socket.id;

    const el = document.createElement('div');
    el.className = 'glass';
    el.style.padding = '8px 10px';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'space-between';
    el.style.gap = '8px';
    el.style.fontSize = '0.8rem';
    el.style.borderLeft = `4px solid ${t.primaryColor}`;
    el.style.borderRadius = '8px';

    if (isMyTeam) {
      el.style.background = `${t.primaryColor}22`;
      el.style.borderColor = t.primaryColor;
      el.style.boxShadow = `0 0 10px ${t.primaryColor}55`;
    }

    let actionButtons = '';
    if (!isMyTeam && isAvailable && roomState.status === 'LOBBY') {
      actionButtons += `<button class="btn btn-secondary switch-team-btn" data-team="${t.id}" style="padding: 4px 8px; font-size: 0.7rem; min-height: 24px; font-weight: 800; color: #22c55e;">Claim</button>`;
    }
    if (isHost && isOccupiedByOther) {
      actionButtons += `<button class="btn btn-secondary kick-team-btn" data-team="${t.id}" style="padding: 4px 8px; font-size: 0.7rem; min-height: 24px; font-weight: 800; color: #ef4444; border-color: rgba(239,68,68,0.4);">❌ Kick</button>`;
    }

    el.innerHTML = `
      <div style="display: flex; align-items: center; gap: 6px; overflow: hidden;">
        <img src="${getProxyOrDirectImageUrl(t.logo)}" style="width: 22px; height: 22px; object-fit: contain;">
        <strong>${t.shortName}:</strong>
        <span style="color: ${isMyTeam ? '#f59e0b' : (t.ownerName ? '#22c55e' : '#94a3b8')}; font-weight: 700; white-space: nowrap;">
          ${isMyTeam ? 'YOU 👑' : (t.ownerName || 'Available')}
        </span>
      </div>
      <div style="display: flex; align-items: center; gap: 6px;">
        ${actionButtons}
      </div>
    `;

    const switchBtn = el.querySelector('.switch-team-btn');
    if (switchBtn) {
      switchBtn.onclick = (e) => {
        e.stopPropagation();
        socket.emit('switchTeam', { roomId: myRoomId, newTeamId: t.id, playerToken: myPlayerToken }, (res) => {
          if (res && res.success) {
            myTeamId = t.id;
            saveSession(myRoomId, myTeamId, myManagerName, isHost);
            updateNavRoomMeta();
            updateLobbyMembers();
            if (window.audioEngine) window.audioEngine.playBidSound();
            showNotificationToast(`Claimed ${t.name}! 🏏`, t.primaryColor);
          } else {
            alert(res?.message || 'Could not switch team');
          }
        });
      };
    }

    const kickBtn = el.querySelector('.kick-team-btn');
    if (kickBtn) {
      kickBtn.onclick = (e) => {
        e.stopPropagation();
        if (confirm(`Kick ${t.ownerName || 'this player'} (${t.shortName}) out of the room?`)) {
          socket.emit('kickPlayer', { roomId: myRoomId, targetTeamId: t.id }, (res) => {
            if (res && !res.success) {
              alert(res.message || 'Could not kick player');
            }
          });
        }
      };
    }

    list.appendChild(el);
  });
}

// --- SOCKET.IO EVENTS ---

socket.on('roomUpdated', (state) => {
  roomState = state;
  updateLobbyMembers();
  renderArenaTeams();
});

socket.on('auctionPaused', () => {
  if (roomState) roomState.status = 'PAUSED';
  const hammerStatus = document.getElementById('hammer-status');
  if (hammerStatus) {
    hammerStatus.textContent = 'AUCTION PAUSED ⏸️';
    hammerStatus.style.color = '#38bdf8';
  }
  const btnPause = document.getElementById('btn-host-pause');
  if (btnPause) {
    btnPause.textContent = '▶️ Resume';
    btnPause.style.color = '#22c55e';
  }
});

socket.on('kickedFromRoom', (data) => {
  clearSession();
  alert(data?.reason || 'You were removed from the room by the Host.');
  window.location.reload();
});

socket.on('playerJoinedLobby', (data) => {
  if (window.audioEngine) window.audioEngine.playBidSound();
  showNotificationToast(`🎉 <strong>${data.playerName}</strong> joined & claimed <strong>${data.teamName}</strong>! 🏏`, data.teamColor || '#22c55e');
  updateLobbyMembers();
});

socket.on('auctionUpdate', (state) => {
  roomState = state;
  views.waitingLobby.style.display = 'none';
  showView('arena');
  updateNavRoomMeta();

  const btnPause = document.getElementById('btn-host-pause');
  if (btnPause) {
    if (state.status === 'PAUSED') {
      btnPause.textContent = '▶️ Resume';
      btnPause.style.color = '#22c55e';
    } else {
      btnPause.textContent = '⏸️ Pause';
      btnPause.style.color = '#38bdf8';
    }
  }

  renderPlayerSpotlight(state.currentPlayer);
  renderArenaTeams();
  updateBiddingPanel(state);
});

socket.on('timerTick', ({ timer, status }) => {
  if (!roomState) return;
  roomState.timer = timer;

  const btnPause = document.getElementById('btn-host-pause');
  if (btnPause && roomState.status === 'BIDDING') {
    btnPause.textContent = '⏸️ Pause';
    btnPause.style.color = '#38bdf8';
  }

  const timerCircle = document.getElementById('auction-timer-circle');
  timerCircle.textContent = timer;

  if (timer <= 5) {
    timerCircle.classList.add('danger');
    window.audioEngine.playTick(timer * 110 + 220);

    const hammerStatus = document.getElementById('hammer-status');
    if (timer <= 2) {
      hammerStatus.textContent = 'GOING TWICE... 🔨';
      hammerStatus.style.color = '#ef4444';
    } else {
      hammerStatus.textContent = 'GOING ONCE... 🔨';
      hammerStatus.style.color = '#f59e0b';
    }
  } else {
    timerCircle.classList.remove('danger');
    const hammerStatus = document.getElementById('hammer-status');
    hammerStatus.textContent = 'LIVE BIDDING';
    hammerStatus.style.color = '#22c55e';
  }
});

socket.on('bidPlaced', (data) => {
  if (!roomState) return;
  roomState.currentBid = data.currentBid;
  roomState.leadingTeamId = data.leadingTeamId;
  roomState.timer = data.timer;

  window.audioEngine.playBidSound();
  updateBiddingPanel(roomState);

  // Add to desktop bid feed
  const historyList = document.getElementById('bid-history-list');
  const item = document.createElement('div');
  item.style.padding = '4px 6px';
  item.style.borderRadius = '6px';
  item.style.background = 'rgba(255,255,255,0.06)';
  item.style.fontSize = '0.75rem';
  item.style.display = 'flex';
  item.style.justifyContent = 'space-between';
  item.innerHTML = `
    <span style="color: ${data.leadingTeamColor}; font-weight: 800;">${data.leadingTeamName}</span>
    <span style="font-weight: 900; color: #f59e0b;">₹${data.currentBid.toFixed(2)} Cr</span>
  `;
  historyList.prepend(item);
});

// BROADCAST CELEBRATION MODAL ON SOLD
socket.on('playerSold', (data) => {
  // 1. Gavel Strike
  window.audioEngine.playGavel();

  // 2. Play exact peak drop audio (plays for 7.6s with 0.8s fade out!)
  const playedTrack = window.audioEngine.playTeamAnthem(data.winningTeam.id);

  // 3. Modal Elements
  const modal = document.getElementById('sold-modal');
  const card = document.getElementById('sold-card-body');
  const teamLogo = document.getElementById('sold-team-logo');
  const teamTitle = document.getElementById('sold-team-title');
  const playerPhoto = document.getElementById('sold-player-photo');
  const playerName = document.getElementById('sold-player-name');
  const playerRole = document.getElementById('sold-player-role');
  const playerCountry = document.getElementById('sold-player-country');
  const bannerPrice = document.getElementById('sold-banner-price');
  const songBadge = document.getElementById('sold-song-badge');
  const songArtist = document.getElementById('sold-song-artist');
  const dismissBtn = document.getElementById('btn-dismiss-sold');
  const headerText = document.getElementById('sold-header-text');

  const teamData = allTeams.find(t => t.id === (data.winningTeam?.id || data.winningTeam)) || data.winningTeam || {};
  const teamColor = teamData.primaryColor || data.winningTeam.color || '#f59e0b';

  card.style.background = `linear-gradient(145deg, ${teamColor}33 0%, #0b0f19 100%)`;
  card.style.borderColor = teamColor;
  card.style.boxShadow = `0 15px 45px ${teamColor}40`;

  headerText.textContent = 'HAMMER DOWN — OFFICIAL SIGNING! 🔨';

  // Resilient Franchise Logo with Fallback Emoji Badge
  const fallbackBadge = document.getElementById('sold-team-fallback-badge');
  if (fallbackBadge) {
    fallbackBadge.style.display = 'none';
    fallbackBadge.textContent = teamData.badgeEmoji || data.winningTeam.badgeEmoji || '🏆';
  }

  const teamLogoUrl = teamData.logo || data.winningTeam.logo || teamData.logoUrl || `https://documents.iplt20.com/ipl/${teamData.id || data.winningTeam.id}/logos/Logooutline/${teamData.id || data.winningTeam.id}outline.png`;
  teamLogo.style.display = 'block';
  teamLogo.onerror = function() {
    this.style.display = 'none';
    if (fallbackBadge) fallbackBadge.style.display = 'block';
  };
  teamLogo.src = getProxyOrDirectImageUrl(teamLogoUrl);

  teamTitle.textContent = (data.winningTeam.name || teamData.name || 'FRANCHISE').toUpperCase();
  teamTitle.style.color = teamColor;

  // Resilient Player Photo - NEVER hardcode Virat Kohli!
  const defaultPlayerAvatar = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%2394a3b8"><circle cx="50" cy="35" r="24"/><path d="M18 90c0-18 14-32 32-32s32 14 32 32z"/></svg>';
  playerPhoto.onerror = function() {
    this.onerror = null;
    this.src = defaultPlayerAvatar;
  };
  playerPhoto.src = getProxyOrDirectImageUrl(data.player.image || data.player.photoUrl) || defaultPlayerAvatar;

  playerName.textContent = data.player.name;
  playerRole.textContent = data.player.role || 'Player';
  playerCountry.textContent = data.player.type === 'Overseas' ? '✈️ OVERSEAS' : 'IND 🇮🇳';
  bannerPrice.textContent = `₹${data.soldPrice.toFixed(2)} Crores`;

  if (playedTrack) {
    songBadge.textContent = `${playedTrack.tag || '🔥'} ${playedTrack.title}`;
    songArtist.textContent = `${playedTrack.artist} • Peak Drop Playing`;
  } else {
    songBadge.textContent = '🔥 Peak BGM Drop';
    songArtist.textContent = 'Franchise Viral Anthem';
  }

  modal.classList.add('active');

  // 4. Confetti Eruption
  triggerConfetti();

  // 5. Voice Commentary
  window.audioEngine.announceSold(data.player.name, data.winningTeam.name, data.soldPrice.toFixed(2));

  // Dismiss button handler
  const closeModal = () => {
    modal.classList.remove('active');
  };
  if (dismissBtn) dismissBtn.onclick = closeModal;

  // Auto-dismiss modal after 4.8 seconds to return to the arena
  // (While the background music continues pumping smoothly through seconds 6, 7, 8!)
  if (window.soldModalTimeout) clearTimeout(window.soldModalTimeout);
  window.soldModalTimeout = setTimeout(closeModal, 4800);
});

socket.on('playerUnsold', (data) => {
  window.audioEngine.playTick(180);
  const modal = document.getElementById('sold-modal');
  const card = document.getElementById('sold-card-body');
  const headerText = document.getElementById('sold-header-text');
  const teamLogo = document.getElementById('sold-team-logo');
  const teamTitle = document.getElementById('sold-team-title');
  const playerPhoto = document.getElementById('sold-player-photo');
  const playerName = document.getElementById('sold-player-name');
  const playerRole = document.getElementById('sold-player-role');
  const playerCountry = document.getElementById('sold-player-country');
  const bannerPrice = document.getElementById('sold-banner-price');
  const songBadge = document.getElementById('sold-song-badge');
  const songArtist = document.getElementById('sold-song-artist');

  card.style.background = 'linear-gradient(145deg, rgba(239, 68, 68, 0.25) 0%, #0b0f19 100%)';
  card.style.borderColor = '#ef4444';
  card.style.boxShadow = '0 15px 45px rgba(239, 68, 68, 0.3)';

  headerText.textContent = 'HAMMER DOWN — UNSOLD! ❌';
  teamLogo.style.display = 'none';
  const fallbackBadge = document.getElementById('sold-team-fallback-badge');
  if (fallbackBadge) fallbackBadge.style.display = 'none';
  teamTitle.textContent = 'PASSED TO ACCELERATED ROUND';
  teamTitle.style.color = '#ef4444';

  const defaultPlayerAvatar = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%2394a3b8"><circle cx="50" cy="35" r="24"/><path d="M18 90c0-18 14-32 32-32s32 14 32 32z"/></svg>';
  playerPhoto.onerror = function() {
    this.onerror = null;
    this.src = defaultPlayerAvatar;
  };
  playerPhoto.src = getProxyOrDirectImageUrl(data.player.image || data.player.photoUrl) || defaultPlayerAvatar;

  playerName.textContent = data.player.name;
  playerRole.textContent = data.player.role || 'Player';
  playerCountry.textContent = data.player.type === 'Overseas' ? '✈️ OVERSEAS' : 'IND 🇮🇳';
  bannerPrice.textContent = `Base: ₹${data.player.basePrice} Cr`;

  songBadge.textContent = 'No Bids Placed';
  songArtist.textContent = 'Passed to accelerated auction';

  modal.classList.add('active');
  if (window.soldModalTimeout) clearTimeout(window.soldModalTimeout);
  window.soldModalTimeout = setTimeout(() => {
    modal.classList.remove('active');
  }, 3000);
});

socket.on('auctionCompleted', (data) => {
  roomState.teams = data.teams;
  roomState.teamAnalyses = data.teamAnalyses;
  roomState.tournamentResult = data.tournamentResult;

  showView('analyzer');
  renderAnalyzerView();
});

socket.on('newChat', (chat) => {
  // Desktop chat
  const deskBox = document.getElementById('chat-messages-box');
  if (deskBox) {
    const el = document.createElement('div');
    el.innerHTML = `<strong>${chat.senderName}:</strong> ${chat.message}`;
    deskBox.appendChild(el);
    deskBox.scrollTop = deskBox.scrollHeight;
  }

  // Mobile chat tab
  const mobBox = document.getElementById('mobile-chat-messages');
  if (mobBox) {
    const el = document.createElement('div');
    el.style.padding = '6px 10px';
    el.style.borderRadius = '8px';
    el.style.background = 'rgba(255,255,255,0.06)';
    el.innerHTML = `<strong style="color: #f59e0b;">${chat.senderName}:</strong> ${chat.message}`;
    mobBox.appendChild(el);
    mobBox.scrollTop = mobBox.scrollHeight;
  }
});

socket.on('bidRejected', (data) => {
  alert(`Bid Notice: ${data.reason}`);
});

// --- UI HELPERS ---

function renderPlayerSpotlight(player) {
  if (!player) return;
  document.getElementById('player-name').textContent = player.name;
  document.getElementById('player-set-tag').textContent = player.set || 'Marquee Set 1';
  document.getElementById('player-role-badge').textContent = player.role || 'Player';
  document.getElementById('player-type-badge').textContent = `${player.type === 'Overseas' ? '✈️' : '🇮🇳'} ${player.country || 'IND'}`;
  document.getElementById('player-base-price').textContent = `₹${(player.basePrice || 2.0).toFixed(2)} Cr`;
  document.getElementById('player-aura-rating').textContent = player.rating || 75;

  document.getElementById('player-seq-num').textContent = (roomState.currentPlayerIndex || 0) + 1;
  document.getElementById('player-total-num').textContent = roomState.totalPlayers || 275;

  const defaultSpotlightAvatar = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%2394a3b8"><circle cx="50" cy="35" r="24"/><path d="M18 90c0-18 14-32 32-32s32 14 32 32z"/></svg>';
  const photo = document.getElementById('player-photo');
  photo.onerror = function() {
    this.onerror = null;
    this.src = defaultSpotlightAvatar;
  };
  photo.src = getProxyOrDirectImageUrl(player.image) || defaultSpotlightAvatar;

  document.getElementById('stat-matches').textContent = (player.stats && player.stats.matches) || '-';
  document.getElementById('stat-runs').textContent = (player.stats && player.stats.runs) || '0';
  document.getElementById('stat-sr').textContent = (player.stats && player.stats.sr) ? player.stats.sr.toFixed(1) : '-';
  
  if (player.role === 'Bowler' || (player.stats && player.stats.wickets > 0)) {
    document.getElementById('stat-wickets').textContent = `${player.stats.wickets || 0}w (${player.stats.econ || '-'}e)`;
  } else {
    document.getElementById('stat-wickets').textContent = `HS: ${(player.stats && player.stats.hs) || '-'}`;
  }
}

function updateBiddingPanel(state) {
  const currentBidStr = state.currentBid > 0 ? `₹${state.currentBid.toFixed(2)} Cr` : '₹0.00 Cr';
  const nextBidStr = `₹${state.nextBidAmount.toFixed(2)} Cr`;

  document.getElementById('current-bid-val').textContent = currentBidStr;
  document.getElementById('next-bid-val').textContent = nextBidStr;

  // Desktop & Mobile Paddle Amounts
  document.getElementById('btn-paddle-amount').textContent = nextBidStr;
  document.getElementById('btn-paddle-amount-mobile').textContent = nextBidStr;

  // Leading Bidder Badge with Official Logo
  const leadingName = document.getElementById('leading-team-name');
  const leadingLogo = document.getElementById('leading-team-logo');
  if (state.leadingTeamId && state.teams[state.leadingTeamId]) {
    const lt = state.teams[state.leadingTeamId];
    leadingName.textContent = lt.name;
    leadingName.style.color = lt.primaryColor;
    leadingLogo.src = getProxyOrDirectImageUrl(lt.logo);
    leadingLogo.style.display = 'block';
  } else {
    leadingName.textContent = 'No bids yet';
    leadingName.style.color = '#fff';
    leadingLogo.style.display = 'none';
  }

  // Update My Purse & Squad Counts (Desktop & Mobile)
  if (myTeamId && state.teams && state.teams[myTeamId]) {
    const mt = state.teams[myTeamId];
    const overseasCount = mt.squad.filter(p => p.type === 'Overseas').length;

    document.getElementById('my-purse-val').textContent = `₹${mt.purse.toFixed(2)} Cr`;
    document.getElementById('my-squad-count').textContent = `${mt.squad.length}/11`;
    document.getElementById('my-overseas-count').textContent = `${overseasCount}/4 ✈️`;

    // Mobile dock purse
    document.getElementById('my-purse-val-mobile').textContent = `₹${mt.purse.toFixed(1)} Cr`;
    document.getElementById('my-squad-count-mobile').textContent = `${mt.squad.length}/11`;
    document.getElementById('my-overseas-count-mobile').textContent = `${overseasCount}/4`;

    // Disable paddles if already leading
    const isLeading = state.leadingTeamId === myTeamId;
    const deskPaddle = document.getElementById('btn-raise-bid');
    const mobPaddle = document.getElementById('btn-raise-bid-mobile');

    [deskPaddle, mobPaddle].forEach(p => {
      if (p) {
        p.disabled = isLeading;
        p.querySelector('span:first-child').textContent = isLeading ? '✅ YOU ARE HIGHEST' : '🏏 RAISE:';
      }
    });
  }
}

function renderArenaTeams() {
  if (!roomState || !roomState.teams) return;
  const container = document.getElementById('arena-teams-list-desktop');
  if (!container) return;
  container.innerHTML = '';

  Object.values(roomState.teams).forEach(t => {
    const el = document.createElement('div');
    el.className = 'franchise-row';
    el.style.borderLeft = `3px solid ${t.primaryColor}`;
    el.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <img class="f-logo-img" src="${getProxyOrDirectImageUrl(t.logo)}">
        <div>
          <div style="font-weight: 800; font-size: 0.85rem;">${t.shortName}</div>
          <div style="font-size: 0.7rem; color: var(--text-muted);">${t.ownerName || 'AI Bot'}</div>
        </div>
      </div>
      <div style="text-align: right;">
        <div style="font-weight: 800; font-size: 0.85rem; color: #22c55e;">₹${t.purse.toFixed(1)} Cr</div>
        <div style="font-size: 0.7rem; color: var(--text-muted);">${t.squad.length}/11</div>
      </div>
    `;
    container.appendChild(el);
  });
}

// Mobile Tab: Franchises List
function renderFranchisesTab() {
  if (!roomState || !roomState.teams) return;
  const container = document.getElementById('mobile-franchises-list');
  container.innerHTML = '';

  Object.values(roomState.teams).forEach(t => {
    const card = document.createElement('div');
    card.className = 'glass';
    card.style.padding = '14px';
    card.style.marginBottom = '10px';
    card.style.borderLeft = `4px solid ${t.primaryColor}`;

    const isOccupiedByOther = t.ownerSocketId && t.ownerSocketId !== socket.id;
    let kickHtml = '';
    if (isHost && isOccupiedByOther) {
      kickHtml = `<button class="btn btn-secondary kick-tab-btn" data-team="${t.id}" style="padding: 3px 8px; font-size: 0.7rem; font-weight: 800; color: #ef4444; border-color: rgba(239,68,68,0.4); margin-left: 8px;">❌ Kick</button>`;
    }

    const playersHtml = t.squad.length > 0
      ? t.squad.map((p, i) => `<span style="display: inline-block; background: rgba(255,255,255,0.06); padding: 2px 8px; border-radius: 6px; font-size: 0.75rem; margin: 2px;">#${i+1} ${p.name} (₹${(p.soldPrice||p.basePrice).toFixed(1)}Cr)</span>`).join(' ')
      : '<span style="color: var(--text-muted); font-size: 0.8rem;">No players bought yet.</span>';

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <img src="${getProxyOrDirectImageUrl(t.logo)}" style="width: 32px; height: 32px; object-fit: contain;">
          <div>
            <div style="font-weight: 900; font-size: 1rem; display: flex; align-items: center;">
              ${t.name} ${kickHtml}
            </div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${t.ownerName || 'AI Bot'}</div>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 1.1rem; font-weight: 900; color: #22c55e;">₹${t.purse.toFixed(1)} Cr</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${t.squad.length}/11 (✈️${t.squad.filter(p=>p.type==='Overseas').length})</div>
        </div>
      </div>
      <div style="margin-top: 6px;">${playersHtml}</div>
    `;

    const kickBtn = card.querySelector('.kick-tab-btn');
    if (kickBtn) {
      kickBtn.onclick = (e) => {
        e.stopPropagation();
        if (confirm(`Kick ${t.ownerName || 'this player'} (${t.shortName}) out of the room?`)) {
          socket.emit('kickPlayer', { roomId: myRoomId, targetTeamId: t.id }, (res) => {
            if (res && !res.success) alert(res.message || 'Could not kick player');
          });
        }
      };
    }

    container.appendChild(card);
  });
}

// --- PRO AI SQUAD ANALYZER RENDERING ---
function renderAnalyzerView() {
  if (!roomState || !roomState.teams) return;

  const leaderboardBody = document.getElementById('aura-leaderboard-body');
  leaderboardBody.innerHTML = '';

  const analyses = roomState.teamAnalyses || {};
  const teamList = Object.values(roomState.teams).map(t => {
    const a = analyses[t.id] || {
      auraPoints: 7500,
      tier: 'A',
      battingScore: 80,
      bowlingScore: 80,
      balanceScore: 80
    };
    return { ...t, analysis: a };
  });

  teamList.sort((a,b) => b.analysis.auraPoints - a.analysis.auraPoints);

  // 1ST PLACE WINNER CARD POPULATION
  const winner = teamList[0];
  const winnerCard = document.getElementById('first-place-winner-card');
  if (winner && winnerCard) {
    winnerCard.style.display = 'block';
    const logoEl = document.getElementById('champ-winner-logo');
    if (logoEl) logoEl.src = getProxyOrDirectImageUrl(winner.logo);

    const nameEl = document.getElementById('champ-winner-name');
    if (nameEl) nameEl.textContent = `${winner.name} 👑 (${winner.ownerName || 'Manager'})`;

    const scorePill = document.getElementById('champ-score-pill');
    if (scorePill) scorePill.textContent = `🏆 #1 AURA: +${winner.analysis.auraPoints} PTS`;

    const spentPill = document.getElementById('champ-spent-pill');
    if (spentPill) spentPill.textContent = `💰 SPENT: ₹${(winner.totalSpent || 0).toFixed(1)} Cr`;

    const squadPill = document.getElementById('champ-squad-count');
    if (squadPill) squadPill.textContent = `👥 SQUAD: ${winner.squad.length}/11 PLAYERS`;

    const reasonEl = document.getElementById('champ-winner-reason');
    if (reasonEl) {
      const topStars = winner.squad.slice(0, 3).map(p => p.name).join(', ');
      const starsFragment = topStars ? ` anchored by key match-winners ${topStars}` : '';
      reasonEl.textContent = `${winner.name} finished at #1 with an exceptional tactical build${starsFragment}! They assembled an elite batting lineup (Rating: ${winner.analysis.battingScore}/100) alongside a high-caliber bowling unit (Rating: ${winner.analysis.bowlingScore}/100) and outstanding overall synergy (Rating: ${winner.analysis.balanceScore}/100) while maximizing their ₹90 Cr purse.`;
    }

    if (!activeCritiqueTeamId) activeCritiqueTeamId = winner.id;
  }

  teamList.forEach((t, rank) => {
    const tr = document.createElement('tr');
    tr.style.cursor = 'pointer';
    tr.innerHTML = `
      <td><strong>#${rank + 1}</strong></td>
      <td>
        <div style="display: flex; align-items: center; gap: 8px;">
          <img src="${getProxyOrDirectImageUrl(t.logo)}" style="width: 24px; height: 24px; object-fit: contain;">
          <strong style="color: ${t.primaryColor}">${t.shortName}</strong>
        </div>
      </td>
      <td style="color: #38bdf8;">${t.analysis.battingScore}</td>
      <td style="color: #ef4444;">${t.analysis.bowlingScore}</td>
      <td style="font-weight: 900; color: #f59e0b;">+${t.analysis.auraPoints}</td>
      <td><span class="tier-badge" style="background: ${t.analysis.tierColor || '#f59e0b'}; color: #000;">${t.analysis.tier}</span></td>
    `;
    tr.addEventListener('click', () => {
      activeCritiqueTeamId = t.id;
      renderDetailedCritique(t.id);
    });
    leaderboardBody.appendChild(tr);
  });

  // Team Selector Tabs
  const critiqueTabs = document.getElementById('analyzer-team-tabs');
  critiqueTabs.innerHTML = '';
  teamList.forEach(t => {
    const btn = document.createElement('button');
    btn.className = `btn btn-secondary ${t.id === activeCritiqueTeamId ? 'btn-primary' : ''}`;
    btn.style.padding = '6px 12px';
    btn.style.fontSize = '0.8rem';
    btn.style.minHeight = '34px';
    btn.innerHTML = `<img src="${getProxyOrDirectImageUrl(t.logo)}" style="width: 16px; height: 16px; object-fit: contain;"> ${t.shortName}`;
    btn.addEventListener('click', () => {
      activeCritiqueTeamId = t.id;
      renderDetailedCritique(t.id);
      renderAnalyzerView();
    });
    critiqueTabs.appendChild(btn);
  });

  renderDetailedCritique(activeCritiqueTeamId);
}

function renderDetailedCritique(teamId) {
  if (!roomState || !roomState.teams) return;
  const team = roomState.teams[teamId];
  if (!team) return;

  const analysis = (roomState.teamAnalyses && roomState.teamAnalyses[teamId]) || {
    auraPoints: 8850,
    tier: 'SSS',
    tierLabel: 'GOD TIER DYNASTY 👑',
    battingScore: 92,
    bowlingScore: 88,
    balanceScore: 94,
    playingXI: team.squad.map((p, idx) => ({ ...p, slot: idx+1, roleTag: p.role })),
    commentary: {
      shastri: "“LIKE A TRACER BULLET! A formidable, high-octane unit with championship pedigree!”",
      harsha: "“A fascinating blend of flair and tactical discipline. Balanced to perfection.”",
      memeRoast: "🗿 GIGACHAD SQUAD: Bro cooked the entire room, drafted certified killers, and earned maximum Aura!"
    }
  };

  document.getElementById('critique-team-name').textContent = team.name;
  document.getElementById('critique-team-logo').src = getProxyOrDirectImageUrl(team.logo);
  document.getElementById('critique-aura-points').textContent = `+${analysis.auraPoints} AURA`;
  const tierBadge = document.getElementById('critique-tier-badge');
  tierBadge.textContent = `${analysis.tier} ${analysis.tierLabel || ''}`;
  tierBadge.style.background = analysis.tierColor || '#f59e0b';

  document.getElementById('critique-bat-score').textContent = analysis.battingScore;
  document.getElementById('critique-bowl-score').textContent = analysis.bowlingScore;
  document.getElementById('critique-balance-score').textContent = analysis.balanceScore;

  // Steal vs Overpay
  const stealEl = document.getElementById('critique-steal-text');
  if (analysis.bestSteal) {
    stealEl.innerHTML = `<strong>${analysis.bestSteal.player.name}</strong> at <strong>₹${analysis.bestSteal.price} Cr</strong> (Rating: ${analysis.bestSteal.rating}/100)!`;
  } else {
    stealEl.textContent = 'Clean, disciplined purchases across the board.';
  }

  const overpayEl = document.getElementById('critique-overpay-text');
  if (analysis.worstOverpay && analysis.worstOverpay.price > 12) {
    overpayEl.innerHTML = `<strong>${analysis.worstOverpay.player.name}</strong> inflated to <strong>₹${analysis.worstOverpay.price} Cr</strong> in a bidding war!`;
  } else {
    overpayEl.textContent = 'Zero catastrophic overpays! Masterful budget control.';
  }

  document.getElementById('commentary-shastri').textContent = analysis.commentary.shastri;
  document.getElementById('commentary-harsha').textContent = analysis.commentary.harsha;
  document.getElementById('commentary-meme').textContent = analysis.commentary.memeRoast;

  // Tactical Lineup 1 to 11
  const xiGrid = document.getElementById('critique-xi-grid');
  xiGrid.innerHTML = '';
  const xiList = analysis.playingXI || team.squad;

  xiList.forEach(p => {
    const card = document.createElement('div');
    card.className = 'glass';
    card.style.padding = '8px 12px';
    card.style.display = 'flex';
    card.style.alignItems = 'center';
    card.style.gap = '10px';
    card.innerHTML = `
      <div style="font-weight: 900; color: #f59e0b; width: 20px;">#${p.slot || ''}</div>
      <img src="${getProxyOrDirectImageUrl(p.image) || ''}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; background: #1e293b;" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\' fill=\'%2394a3b8\'><circle cx=\'50\' cy=\'35\' r=\'24\'/><path d=\'M18 90c0-18 14-32 32-32s32 14 32 32z\'/></svg>';">
      <div style="flex: 1;">
        <div style="font-weight: 800; font-size: 0.9rem;">${p.name} ${p.isCaptain ? '👑(C)' : ''}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">${p.roleTag || p.role} • ${p.type === 'Overseas' ? '✈️' : '🇮🇳'}</div>
      </div>
    `;
    xiGrid.appendChild(card);
  });
}

function renderTournamentResults(result) {
  renderAnalyzerView();
  if (result && result.champion && result.champion.id) {
    window.audioEngine.playTeamAnthem(result.champion.id);
  }
  triggerConfetti();
}

function copySquadAuraCard() {
  if (!roomState || !roomState.teams) return;
  const team = roomState.teams[activeCritiqueTeamId];
  const a = (roomState.teamAnalyses && roomState.teamAnalyses[activeCritiqueTeamId]) || {};

  const report = `
🏏 IPL MEGA AUCTION SQUAD REPORT 🏏
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Team: ${team.name}
Manager: ${team.ownerName || 'Mastermind'}
Total Spent: ₹${(team.totalSpent || 0).toFixed(2)} Cr
Aura Score: +${a.auraPoints || 7500} Aura Points
Tier: ${a.tier || 'S'} Grade (${a.tierLabel || 'Contender'})

📊 STATS RADAR:
• Batting: ${a.battingScore || 80}/100
• Bowling: ${a.bowlingScore || 80}/100
• Balance: ${a.balanceScore || 85}/100

🎙️ PRO AI JUDGE VERDICT:
${a.commentary ? a.commentary.memeRoast : ''}

PLAYING XI:
${(a.playingXI || team.squad).map((p, i) => `${i+1}. ${p.name} (${p.roleTag || p.role})`).join('\n')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `.trim();

  navigator.clipboard.writeText(report).then(() => {
    alert('📋 Squad Aura Card copied! Paste it in your WhatsApp/Discord group to flex!');
  });
}

// Confetti Setup
let confettiCtx = null;
let confettiParticles = [];

function setupConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  confettiCtx = canvas.getContext('2d');
  resizeConfetti();
  window.addEventListener('resize', resizeConfetti);
}

function resizeConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function triggerConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas || !confettiCtx) return;

  const colors = ['#f59e0b', '#ef4444', '#38bdf8', '#22c55e', '#a855f7', '#ec4899', '#ffffff'];
  confettiParticles = [];

  for (let i = 0; i < 120; i++) {
    confettiParticles.push({
      x: canvas.width * 0.5,
      y: canvas.height * 0.35,
      vx: (Math.random() - 0.5) * 20,
      vy: (Math.random() - 0.7) * 18,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 12,
      opacity: 1
    });
  }

  requestAnimationFrame(updateConfetti);
}

function updateConfetti() {
  if (!confettiCtx || confettiParticles.length === 0) return;
  const canvas = document.getElementById('confetti-canvas');
  confettiCtx.clearRect(0, 0, canvas.width, canvas.height);

  confettiParticles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.45;
    p.rotation += p.rotSpeed;
    p.opacity -= 0.008;

    confettiCtx.save();
    confettiCtx.translate(p.x, p.y);
    confettiCtx.rotate((p.rotation * Math.PI) / 180);
    confettiCtx.fillStyle = p.color;
    confettiCtx.globalAlpha = Math.max(0, p.opacity);
    confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
    confettiCtx.restore();
  });

  confettiParticles = confettiParticles.filter(p => p.opacity > 0);
  if (confettiParticles.length > 0) {
    requestAnimationFrame(updateConfetti);
  }
}
