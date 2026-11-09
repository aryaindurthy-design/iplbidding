// Pro Cricket Squad Analyzer & Ruthless Judge of All Time

function analyzeSquad(team, squad = [], allTeamsSummary = []) {
  const squadSize = squad.length;
  const overseasPlayers = squad.filter(p => p.type === 'Overseas');
  const indianPlayers = squad.filter(p => p.type === 'Indian');
  const overseasCount = overseasPlayers.length;

  const batsmen = squad.filter(p => p.role === 'Batsman');
  const wicketKeepers = squad.filter(p => p.role === 'Wicket-Keeper');
  const allRounders = squad.filter(p => p.role === 'All-Rounder');
  const bowlers = squad.filter(p => p.role === 'Bowler');

  // Bowling breakdown
  const paceKeywords = ['fast', 'pace', 'medium', 'seam'];
  const spinKeywords = ['spin', 'orthodox', 'legbreak', 'offbreak', 'wrist'];

  // Identify bowlers
  const totalBowlingOptions = bowlers.length + allRounders.filter(p => (p.stats && p.stats.wickets > 10) || p.rating > 70).length;

  // Key players identification
  const hasMSD = squad.some(p => p.name.includes('Dhoni'));
  const hasRohit = squad.some(p => p.name.includes('Rohit'));
  const hasKohli = squad.some(p => p.name.includes('Kohli'));
  const hasBumrah = squad.some(p => p.name.includes('Bumrah'));
  const hasHardik = squad.some(p => p.name.includes('Hardik'));
  const hasKlaasen = squad.some(p => p.name.includes('Klaasen'));
  const hasHead = squad.some(p => p.name.includes('Head'));
  const hasRussell = squad.some(p => p.name.includes('Russell'));
  const hasNarine = squad.some(p => p.name.includes('Narine'));
  const hasStarc = squad.some(p => p.name.includes('Starc'));

  // 1. Batting Depth (0 - 100)
  let battingScore = 50;
  const topBatters = [...batsmen, ...wicketKeepers, ...allRounders].sort((a,b) => (b.rating || 0) - (a.rating || 0));
  const avgBatRating = topBatters.slice(0, 6).reduce((acc, p) => acc + (p.rating || 60), 0) / Math.max(1, Math.min(6, topBatters.length));
  battingScore = Math.min(99, Math.round(avgBatRating * 0.95 + (topBatters.length >= 7 ? 10 : -10)));

  // 2. Bowling Attack (0 - 100)
  let bowlingScore = 50;
  const topBowlers = [...bowlers, ...allRounders].sort((a,b) => (b.rating || 0) - (a.rating || 0));
  const avgBowlRating = topBowlers.slice(0, 5).reduce((acc, p) => acc + (p.rating || 60), 0) / Math.max(1, Math.min(5, topBowlers.length));
  let deathBowlingBonus = hasBumrah ? 18 : (hasStarc ? 10 : (squad.some(p => p.name.includes('Pathirana') || p.name.includes('Arshdeep')) ? 12 : 0));
  bowlingScore = Math.min(99, Math.round(avgBowlRating * 0.9 + deathBowlingBonus - (totalBowlingOptions < 5 ? 15 : 0)));

  // 3. Balance & Synergy (0 - 100)
  let balanceScore = 65;
  if (wicketKeepers.length === 0) balanceScore -= 35;
  else if (wicketKeepers.length >= 1) balanceScore += 10;
  if (allRounders.length >= 2) balanceScore += 12;
  if (totalBowlingOptions >= 6) balanceScore += 10;
  if (overseasCount > 4) balanceScore -= 30; // Rule violation
  balanceScore = Math.max(10, Math.min(98, balanceScore));

  // 4. Financial & Steal Analysis
  let totalSpent = squad.reduce((sum, p) => sum + (p.soldPrice || p.basePrice || 2), 0);
  let steals = [];
  let overpays = [];

  for (const p of squad) {
    const price = p.soldPrice || p.basePrice || 2;
    const valueRatio = (p.rating || 70) / Math.max(0.5, price);
    if (valueRatio >= 45 && (p.rating || 0) >= 75) {
      steals.push({ player: p, price, rating: p.rating, ratio: valueRatio });
    }
    if (price >= 14 && (p.rating || 0) < 78) {
      overpays.push({ player: p, price, rating: p.rating, ratio: valueRatio });
    }
  }
  steals.sort((a,b) => b.ratio - a.ratio);
  overpays.sort((a,b) => a.ratio - b.ratio);

  const bestSteal = steals[0] || null;
  const worstOverpay = overpays[0] || (squad.sort((a,b)=>(b.soldPrice||0)-(a.soldPrice||0))[0] ? { player: squad[0], price: squad[0].soldPrice||squad[0].basePrice } : null);

  // 5. AURA POINTS CALCULATION
  let auraPoints = 4500;
  auraPoints += Math.round((battingScore - 60) * 45);
  auraPoints += Math.round((bowlingScore - 60) * 45);
  auraPoints += Math.round((balanceScore - 60) * 40);

  // Aura modifiers
  if (hasMSD) auraPoints += 1500; // Thala for a reason
  if (hasKohli) auraPoints += 1200; // King Kohli Aura
  if (hasRohit) auraPoints += 1200; // Hitman 5-trophy Aura
  if (hasBumrah) auraPoints += 1400; // Best bowler on planet Earth
  if (hasHead || hasKlaasen) auraPoints += 900; // SRH 287 Aura
  if (hasRussell || hasNarine) auraPoints += 1000; // KKR Carnival Aura

  // Penalties
  if (wicketKeepers.length === 0) auraPoints -= 2000;
  if (overseasCount > 4) auraPoints -= 2500;
  if (totalBowlingOptions < 5) auraPoints -= 1200;
  if (totalSpent > 115) auraPoints -= 500; // Broke

  // Tier Grading
  let tier = 'A';
  let tierLabel = 'Playoff Contender';
  let tierColor = '#3b82f6';

  if (auraPoints >= 8800) {
    tier = 'SSS';
    tierLabel = 'GOD TIER DYNASTY 👑';
    tierColor = '#eab308';
  } else if (auraPoints >= 7600) {
    tier = 'S';
    tierLabel = 'CHAMPIONSHIP FAVORITES 🏆';
    tierColor = '#22c55e';
  } else if (auraPoints >= 6400) {
    tier = 'A';
    tierLabel = 'PLAYOFF LOCK ⚔️';
    tierColor = '#3b82f6';
  } else if (auraPoints >= 4800) {
    tier = 'B';
    tierLabel = 'MID-TABLE DRAMA 📉';
    tierColor = '#f97316';
  } else if (auraPoints >= 3000) {
    tier = 'C';
    tierLabel = 'PBKS TRIBUTE SQUAD 🤡';
    tierColor = '#ef4444';
  } else {
    tier = 'F';
    tierLabel = 'TOTAL FRAUD / DISBAND 💀';
    tierColor = '#991b1b';
  }

  // Generate Optimal Playing XI Lineup (1 to 11)
  const playingXI = generateOptimalLineup(squad);

  // Generate Roasts and Commentary
  const commentary = generateCommentary({
    team,
    squad,
    squadSize,
    overseasCount,
    wicketKeepers,
    batsmen,
    bowlers,
    allRounders,
    battingScore,
    bowlingScore,
    balanceScore,
    auraPoints,
    tier,
    hasMSD,
    hasKohli,
    hasRohit,
    hasBumrah,
    bestSteal,
    worstOverpay,
    totalBowlingOptions
  });

  return {
    teamId: team.id,
    teamName: team.name,
    teamColor: team.primaryColor,
    squadSize,
    overseasCount,
    indianCount: squadSize - overseasCount,
    totalSpent: parseFloat(totalSpent.toFixed(2)),
    battingScore,
    bowlingScore,
    balanceScore,
    auraPoints,
    tier,
    tierLabel,
    tierColor,
    playingXI,
    rolesCount: {
      batsmen: batsmen.length,
      wicketKeepers: wicketKeepers.length,
      allRounders: allRounders.length,
      bowlers: bowlers.length
    },
    bestSteal,
    worstOverpay,
    commentary
  };
}

// Generate the tactical 1 to 11 batting order
function generateOptimalLineup(squad = []) {
  if (!squad || squad.length === 0) return [];
  
  const squadCopy = [...squad];
  const lineup = [];

  // 1 & 2: Top 2 Openers / High SR Batters
  const openers = squadCopy.filter(p => p.role === 'Batsman' || (p.stats && p.stats.sr >= 140)).sort((a,b) => (b.rating||0) - (a.rating||0));
  const op1 = openers[0] || squadCopy[0];
  if (op1) { lineup.push({ ...op1, slot: 1, roleTag: 'Opener' }); squadCopy.splice(squadCopy.indexOf(op1), 1); }
  const op2 = openers.find(p => p.id !== op1?.id) || squadCopy[0];
  if (op2) { lineup.push({ ...op2, slot: 2, roleTag: 'Opener' }); squadCopy.splice(squadCopy.indexOf(op2), 1); }

  // 3: Anchor / Pure Batsman
  const no3 = squadCopy.find(p => p.role === 'Batsman') || squadCopy[0];
  if (no3) { lineup.push({ ...no3, slot: 3, roleTag: 'Top Order Anchor' }); squadCopy.splice(squadCopy.indexOf(no3), 1); }

  // 4: Middle Order enforcer
  const no4 = squadCopy.find(p => p.role === 'Batsman' || p.role === 'Wicket-Keeper') || squadCopy[0];
  if (no4) { lineup.push({ ...no4, slot: 4, roleTag: 'Middle Order' }); squadCopy.splice(squadCopy.indexOf(no4), 1); }

  // 5: Wicket-Keeper / Middle order
  const wk = squadCopy.find(p => p.role === 'Wicket-Keeper') || squadCopy.find(p => p.role === 'Batsman') || squadCopy[0];
  if (wk) { lineup.push({ ...wk, slot: 5, roleTag: wk.role === 'Wicket-Keeper' ? 'Wicket-Keeper (WK)' : 'Middle Order' }); squadCopy.splice(squadCopy.indexOf(wk), 1); }

  // 6: All-Rounder / Finisher
  const ar1 = squadCopy.find(p => p.role === 'All-Rounder') || squadCopy[0];
  if (ar1) { lineup.push({ ...ar1, slot: 6, roleTag: 'Finisher / All-Rounder' }); squadCopy.splice(squadCopy.indexOf(ar1), 1); }

  // 7: 2nd All-Rounder or Bowling All-Rounder
  const ar2 = squadCopy.find(p => p.role === 'All-Rounder') || squadCopy.find(p => p.role === 'Bowler') || squadCopy[0];
  if (ar2) { lineup.push({ ...ar2, slot: 7, roleTag: 'Lower-Order Hitter / All-Rounder' }); squadCopy.splice(squadCopy.indexOf(ar2), 1); }

  // 8, 9, 10, 11: Frontline Bowlers
  const remainingBowlers = squadCopy.filter(p => p.role === 'Bowler').sort((a,b) => (b.rating||0) - (a.rating||0));
  for (let slot = 8; slot <= 11; slot++) {
    const b = remainingBowlers.shift() || squadCopy.shift();
    if (b) {
      lineup.push({ ...b, slot, roleTag: 'Frontline Bowler' });
    }
  }

  // Tag captain (Highest rating Indian legend or highest rated player)
  let captain = lineup.find(p => p.name.includes('Dhoni') || p.name.includes('Rohit') || p.name.includes('Cummins') || p.name.includes('Kohli')) || lineup[0];
  if (captain) {
    captain.isCaptain = true;
  }

  return lineup;
}

// Generate the legendary Commentary & Roasts
function generateCommentary(ctx) {
  const {
    team,
    squadSize,
    overseasCount,
    wicketKeepers,
    battingScore,
    bowlingScore,
    balanceScore,
    auraPoints,
    tier,
    hasMSD,
    hasKohli,
    hasRohit,
    hasBumrah,
    bestSteal,
    worstOverpay,
    totalBowlingOptions
  } = ctx;

  // 1. Ravi Shastri Electrifying Commentary
  let shastri = "";
  if (hasBumrah && battingScore > 80) {
    shastri = `“LIKE A TRACER BULLET! This ${team.name} squad is packing some serious heat! Jasprit Bumrah leading that pace attack with pure venom, and a batting card capable of putting 240 on the board in their sleep! Absolute belter of a unit!”`;
  } else if (overseasCount > 4) {
    shastri = `“WHAT ON EARTH ARE WE DOING HERE?! Five or more overseas players?! This isn’t Melbourne or Sydney, this is the Indian Premier League! BCCI rules thrown out of the window! Schoolboy error!”`;
  } else if (wicketKeepers.length === 0) {
    shastri = `“FLASH IN THE PAN! You’ve spent big bucks, made all the noise, but WHO IS KEEPING WICKETS?! You can’t have the team owner standing behind the stumps with winter gloves on! Absolute madness!”`;
  } else if (battingScore > 85 && bowlingScore < 60) {
    shastri = `“They will score 260 at the Chinnaswamy, but mark my words, they will concede 261 in 18 overs! It’s all guns blazing up top, but that bowling card is bowling full tosses at the death!”`;
  } else if (auraPoints > 8000) {
    shastri = `“WHEN IT’S IN THE V, IT’S INTO THE TREE! A complete masterclass at the auction table! High octane, pure charisma, and clinical execution. Write their names on the trophy right now!”`;
  } else {
    shastri = `“They’re in the contest, but they’ll have to dig deep. Every single ball is going to matter for ${team.name}. No room for passengers in this tournament!”`;
  }

  // 2. Harsha Bhogle Poetic Breakdown
  let harsha = "";
  if (balanceScore > 80) {
    harsha = `“There is a quiet, deliberate symmetry to how ${team.name} went about their business. They didn't just buy stars; they bought role players who fit the jigsaw puzzle of modern T20 cricket. The left-right combinations, the sixth bowling security blanket—it’s textbook squad management.”`;
  } else if (totalBowlingOptions < 5) {
    harsha = `“Cricket can be wonderfully unpredictable, but one fundamental truth remains: you need twenty overs from five capable bowlers. When your captain looks around for a fifth over and finds part-timers with shaky hands, pressure has a habit of finding you out.”`;
  } else if (hasMSD) {
    harsha = `“When MS Dhoni sits in that dugout, numbers on a spreadsheet suddenly take a back seat. He has made a career of squeezing 120% out of modest bowling attacks. The aura alone is worth a dozen runs in a tense chase.”`;
  } else {
    harsha = `“It’s a squad of fascinating contrasts. On paper, there are moments of genuine brilliance, yet one feels the margins will be knife-edge when the tournament reaches the business end.”`;
  }

  // 3. Brutal Gen-Z Aura / Meme Roast
  let memeRoast = "";
  if (auraPoints > 8500) {
    memeRoast = `🗿 GIGACHAD ENERGY (+${auraPoints} Aura): Bro cooked the entire room and left zero crumbs. Oppenheimer level squad building. Other franchises are officially filing for bankruptcy.`;
  } else if (wicketKeepers.length === 0) {
    memeRoast = `🤡 ZERO GLOVES DETECTED (-2,500 Aura): Bro drafted 11 outfielders and forgot the wicketkeeper exists. Who is stopping 150kmph snorters? The umpire? Bro is playing street gully cricket with rush keeper rules!`;
  } else if (overseasCount > 4) {
    memeRoast = `✈️ AIRPORT TERMINAL SQUAD (-2,000 Aura): Bro bought half of Australia and West Indies. You know only 4 overseas can play right? Bro thought this was EA Sports Cricket 07 with cheats turned on.`;
  } else if (worstOverpay && worstOverpay.price > 15) {
    memeRoast = `💸 FINANCIAL FRAUD ALERT (-1,200 Aura): Bro spent ₹${worstOverpay.price} Cr on ${worstOverpay.player?.name}. Ambani himself gasped in the auction hall. Bro is single-handedly causing inflation in Mumbai.`;
  } else if (bowlingScore < 55) {
    memeRoast = `📉 DEFENSE: 404 NOT FOUND (-1,500 Aura): Bowling attack looks like it was generated by a random number generator. Batsmen in the opposition are already ordering celebrations on Swiggy.`;
  } else {
    memeRoast = `⚡ AURA CHECK: +${auraPoints} Aura. Decent cooking, but you let a few steals slip through your fingers while overthinking like an engineer during viva. Still solid for playoffs.`;
  }

  return {
    shastri,
    harsha,
    memeRoast
  };
}

// Full Tournament Simulation
function simulateTournament(teamsWithSquads = []) {
  if (!teamsWithSquads || teamsWithSquads.length < 2) return null;

  // Calculate team strengths
  const analyzed = teamsWithSquads.map(t => {
    const analysis = analyzeSquad(t, t.squad || []);
    return {
      ...t,
      analysis,
      strength: (analysis.battingScore * 0.45 + analysis.bowlingScore * 0.45 + analysis.balanceScore * 0.1),
      played: 0,
      won: 0,
      lost: 0,
      points: 0,
      nrr: 0.0,
      runsScored: 0,
      oversBatted: 0,
      runsConceded: 0,
      oversBowled: 0
    };
  });

  // League Round Robin (each pair plays 1 match)
  const matchResults = [];
  let playerRunsMap = {};
  let playerWicketsMap = {};

  for (let i = 0; i < analyzed.length; i++) {
    for (let j = i + 1; j < analyzed.length; j++) {
      const t1 = analyzed[i];
      const t2 = analyzed[j];
      const match = simulateMatch(t1, t2, playerRunsMap, playerWicketsMap);
      matchResults.push(match);

      t1.played++;
      t2.played++;
      if (match.winnerId === t1.id) {
        t1.won++;
        t1.points += 2;
        t2.lost++;
      } else {
        t2.won++;
        t2.points += 2;
        t1.lost++;
      }

      t1.runsScored += match.team1Score;
      t1.oversBatted += 20;
      t1.runsConceded += match.team2Score;
      t1.oversBowled += 20;

      t2.runsScored += match.team2Score;
      t2.oversBatted += 20;
      t2.runsConceded += match.team1Score;
      t2.oversBowled += 20;
    }
  }

  // Calculate NRR
  analyzed.forEach(t => {
    const forRate = t.oversBatted > 0 ? (t.runsScored / t.oversBatted) : 0;
    const againstRate = t.oversBowled > 0 ? (t.runsConceded / t.oversBowled) : 0;
    t.nrr = parseFloat((forRate - againstRate).toFixed(3));
  });

  // Sort Standings by Points, then NRR
  analyzed.sort((a,b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.nrr - a.nrr;
  });

  // Playoffs (Top 4 if >= 4 teams, else Top 2)
  const playoffs = [];
  let champion = analyzed[0];
  let runnerUp = analyzed[1];

  if (analyzed.length >= 4) {
    const q1 = simulateMatch(analyzed[0], analyzed[1], playerRunsMap, playerWicketsMap, "Qualifier 1");
    playoffs.push(q1);
    const q1Winner = q1.winnerId === analyzed[0].id ? analyzed[0] : analyzed[1];
    const q1Loser = q1.winnerId === analyzed[0].id ? analyzed[1] : analyzed[0];

    const elim = simulateMatch(analyzed[2], analyzed[3], playerRunsMap, playerWicketsMap, "Eliminator");
    playoffs.push(elim);
    const elimWinner = elim.winnerId === analyzed[2].id ? analyzed[2] : analyzed[3];

    const q2 = simulateMatch(q1Loser, elimWinner, playerRunsMap, playerWicketsMap, "Qualifier 2");
    playoffs.push(q2);
    const q2Winner = q2.winnerId === q1Loser.id ? q1Loser : elimWinner;

    const final = simulateMatch(q1Winner, q2Winner, playerRunsMap, playerWicketsMap, "IPL GRAND FINALE 🏆");
    playoffs.push(final);
    champion = final.winnerId === q1Winner.id ? q1Winner : q2Winner;
    runnerUp = final.winnerId === q1Winner.id ? q2Winner : q1Winner;
  } else if (analyzed.length >= 2) {
    const final = simulateMatch(analyzed[0], analyzed[1], playerRunsMap, playerWicketsMap, "IPL GRAND FINALE 🏆");
    playoffs.push(final);
    champion = final.winnerId === analyzed[0].id ? analyzed[0] : analyzed[1];
    runnerUp = final.winnerId === analyzed[0].id ? analyzed[1] : analyzed[0];
  }

  // Orange Cap (Top Run Scorer)
  const topRunScorers = Object.entries(playerRunsMap).map(([name, runs]) => ({ name, runs })).sort((a,b) => b.runs - a.runs);
  const orangeCap = topRunScorers[0] || { name: 'Virat Kohli', runs: 642 };

  // Purple Cap (Top Wicket Taker)
  const topWicketTakers = Object.entries(playerWicketsMap).map(([name, wickets]) => ({ name, wickets })).sort((a,b) => b.wickets - a.wickets);
  const purpleCap = topWicketTakers[0] || { name: 'Jasprit Bumrah', wickets: 24 };

  return {
    standings: analyzed.map((t, idx) => ({
      rank: idx + 1,
      id: t.id,
      name: t.name,
      color: t.primaryColor,
      played: t.played,
      won: t.won,
      lost: t.lost,
      points: t.points,
      nrr: t.nrr,
      auraPoints: t.analysis.auraPoints,
      tier: t.analysis.tier
    })),
    playoffs,
    champion: {
      id: champion.id,
      name: champion.name,
      color: champion.primaryColor,
      auraPoints: champion.analysis.auraPoints,
      tier: champion.analysis.tier,
      slogan: champion.slogan
    },
    runnerUp: {
      id: runnerUp.id,
      name: runnerUp.name,
      color: runnerUp.primaryColor
    },
    awards: {
      orangeCap,
      purpleCap,
      clownAward: analyzed[analyzed.length - 1], // lowest points
      moneyballAward: analyzed.slice().sort((a,b) => b.analysis.battingScore + b.analysis.bowlingScore - (a.analysis.totalSpent*0.5))[0]
    }
  };
}

// Single Match Simulation
function simulateMatch(t1, t2, playerRunsMap, playerWicketsMap, matchName = null) {
  const diff = (t1.strength - t2.strength);
  const baseT1 = 175 + (t1.analysis.battingScore - 70) * 0.8 + (Math.random() * 40 - 20);
  const baseT2 = 170 + (t2.analysis.battingScore - 70) * 0.8 + (Math.random() * 40 - 20) - (t1.analysis.bowlingScore - 70) * 0.5;

  let s1 = Math.max(120, Math.round(baseT1));
  let s2 = Math.max(115, Math.round(baseT2 + diff * 0.4));
  let w1 = Math.min(10, Math.max(2, Math.round(4 + (t2.analysis.bowlingScore - 70) * 0.1 + Math.random() * 3)));
  let w2 = Math.min(10, Math.max(2, Math.round(4 + (t1.analysis.bowlingScore - 70) * 0.1 + Math.random() * 3)));

  // If tie, random 1 run difference
  if (s1 === s2) s1 += 1;

  const winner = s1 > s2 ? t1 : t2;
  const loser = s1 > s2 ? t2 : t1;
  const margin = s1 > s2 ? `${s1 - s2} runs` : `${10 - w2} wickets`;

  // Distribute runs to top players
  distributeStats(t1.squad || [], s1, w2, playerRunsMap, playerWicketsMap);
  distributeStats(t2.squad || [], s2, w1, playerRunsMap, playerWicketsMap);

  return {
    matchName: matchName || `${t1.shortName || t1.id} vs ${t2.shortName || t2.id}`,
    team1: t1.name,
    team1Short: t1.shortName || t1.id,
    team1Color: t1.primaryColor,
    team1Score: s1,
    team1Wickets: w1,
    team2: t2.name,
    team2Short: t2.shortName || t2.id,
    team2Color: t2.primaryColor,
    team2Score: s2,
    team2Wickets: w2,
    winnerId: winner.id,
    winnerName: winner.name,
    summary: `${winner.name} won by ${margin}!`
  };
}

function distributeStats(squad, teamRuns, teamWicketsTaken, runsMap, wicketsMap) {
  if (!squad || squad.length === 0) return;
  const batters = squad.filter(p => p.role === 'Batsman' || p.role === 'Wicket-Keeper' || p.role === 'All-Rounder');
  let remainingRuns = teamRuns;
  batters.slice(0, 4).forEach((p, idx) => {
    const share = idx === 0 ? Math.round(remainingRuns * 0.45) : Math.round(remainingRuns * 0.25);
    runsMap[p.name] = (runsMap[p.name] || 0) + share;
    remainingRuns -= share;
  });

  const bowlers = squad.filter(p => p.role === 'Bowler' || p.role === 'All-Rounder');
  let remainingW = teamWicketsTaken;
  bowlers.slice(0, 3).forEach((p, idx) => {
    const w = idx === 0 ? Math.min(remainingW, 2) : 1;
    wicketsMap[p.name] = (wicketsMap[p.name] || 0) + w;
    remainingW -= w;
  });
}

module.exports = {
  analyzeSquad,
  generateOptimalLineup,
  generateCommentary,
  simulateTournament
};

