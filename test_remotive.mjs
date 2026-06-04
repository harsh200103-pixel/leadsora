async function test() {
  try {
    const query = 'React Developer';
    const res = await fetch(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query)}&limit=30`);
    const data = await res.json();
    console.log(`Remotive returned ${data.jobs?.length} jobs`);
  } catch(e) {
    console.error(e);
  }
}
test();
