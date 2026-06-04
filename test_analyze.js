const test = async () => {
  try {
    console.log("Testing Tavily + Llama API directly...");
    const req = await fetch('http://localhost:3000/api/analyze-company', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company: 'Vercel',
        tavilyKey: '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'
      })
    });
    const res = await req.json();
    console.log(res);
  } catch(e) {
    console.error(e);
  }
}
test();
