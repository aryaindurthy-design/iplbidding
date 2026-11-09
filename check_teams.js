const fs = require('fs');

async function run() {
  const teams = [
    'chennai-super-kings',
    'delhi-capitals',
    'gujarat-titans',
    'kolkata-knight-riders',
    'lucknow-super-giants',
    'mumbai-indians',
    'punjab-kings',
    'rajasthan-royals',
    'royal-challengers-bengaluru',
    'sunrisers-hyderabad'
  ];
  for (const t of teams) {
    try {
      const res = await fetch('https://www.iplt20.com/teams/' + t);
      const html = await res.text();
      const headshots = [...html.matchAll(/https:\/\/documents\.iplt20\.com\/ipl\/IPLHeadshot2025\/(\d+)\.png/g)].map(m => m[1]);
      const otherHeadshots = [...html.matchAll(/https:\/\/documents\.iplt20\.com\/ipl\/IPLHeadshot2024\/(\d+)\.png/g)].map(m => m[1]);
      console.log(t, '2025:', headshots.length, '2024:', otherHeadshots.length);
      if (headshots.length > 0) {
        console.log(headshots);
      }
    } catch (e) {
      console.log(t, 'error:', e.message);
    }
  }
}

run();
