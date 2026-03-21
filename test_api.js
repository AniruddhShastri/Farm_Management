const fetch = require('node-fetch');
async function test() {
  const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=Kanpur&count=1`);
  const geoData = await geoRes.json();
  const lat = geoData.results[0].latitude;
  const lng = geoData.results[0].longitude;
  const w = await fetch(`https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=2023-01-01&end_date=2023-12-31&daily=temperature_2m_mean,precipitation_sum,shortwave_radiation_sum&timezone=auto`);
  const wd = await w.json();
  console.log(wd.daily.precipitation_sum.slice(0, 5));
}
test();
