const base = 'http://localhost:4000';
const userId = process.argv[2] || 'u1781447563108';
const projectId = process.argv[3] || 'p1781453475710';
(async () => {
  try {
    const res = await fetch(`${base}/api/character/${userId}/${projectId}`);
    console.log('STATUS', res.status);
    const txt = await res.text();
    console.log('BODY', txt);
  } catch (err) {
    console.error('ERROR', err);
  }
})();
