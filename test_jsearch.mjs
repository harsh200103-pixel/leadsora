async function test() {
  const query = 'Engineer';
  const location = 'Global';
  const rapidApiKey = 'dce6b2a37amshb9608bc3c001bdfp140418jsnef8c85290652';
  try {
    const res = await fetch(`https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query + ' in ' + location)}&num_pages=1`, {
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      }
    });
    console.log('JSearch status:', res.status);
    const data = await res.json();
    console.log('JSearch response:', data.message || (data.data ? `Found ${data.data.length} jobs` : data));
  } catch(e) {
    console.error(e);
  }
}
test();
