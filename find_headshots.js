const fs = require('fs');

async function checkId(id) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(`https://documents.iplt20.com/ipl/IPLHeadshot2025/${id}.png`, {
      method: 'HEAD',
      signal: controller.signal
    });
    clearTimeout(timeout);
    return res.status === 200;
  } catch (e) {
    return false;
  }
}

async function run() {
  const existing = JSON.parse(fs.readFileSync('valid_ids.json', 'utf8'));
  const validSet = new Set(existing);
  const startTotal = 601;
  const endTotal = 2500;
  const batchSize = 50;

  for (let start = startTotal; start <= endTotal; start += batchSize) {
    const promises = [];
    for (let i = start; i < start + batchSize && i <= endTotal; i++) {
      promises.push((async (id) => {
        const ok = await checkId(id);
        if (ok) validSet.add(id);
      })(i));
    }
    await Promise.all(promises);
    process.stdout.write(`Checked up to ${Math.min(start + batchSize - 1, endTotal)}, total valid: ${validSet.size}\r`);
  }
  const allValid = Array.from(validSet).sort((a,b)=>a-b);
  console.log(`\nDone. Total valid IDs: ${allValid.length}`);
  fs.writeFileSync('valid_ids.json', JSON.stringify(allValid, null, 2));
}

run();
