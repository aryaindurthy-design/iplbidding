async function run() {
  const res = await fetch('https://iplt20players.com/players/bhuvneshwar_kumar');
  const html = await res.text();
  console.log('length:', html.length);
  const imgs = html.match(/https:\/\/[^"']+\.(?:png|jpg|webp)/gi) || [];
  console.log('imgs:', imgs.slice(0, 10));
}
run();
