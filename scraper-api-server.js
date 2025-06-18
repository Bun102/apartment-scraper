const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
app.use(cors());
app.use(express.json());

// Helper function to extract data from LoopNet (mock logic, must be tailored to page structure)
const extractLoopNetData = async (html) => {
  const $ = cheerio.load(html);
  const data = {
    price: $('span:contains("Price")').next().text().replace(/[^\d]/g, ''),
    units: $('span:contains("Units")').next().text().replace(/[^\d]/g, ''),
    address: $('h1').first().text(),
    yearBuilt: $('span:contains("Year Built")').next().text(),
    image: $('img').first().attr('src') || '',
    noi: '' // Optional: LoopNet often doesn't list this
  };
  return data;
};

// Master scraper route
app.post('/api/scrape', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    const response = await axios.get(url);
    let data = {};

    if (url.includes('loopnet.com')) {
      data = await extractLoopNetData(response.data);
    } else if (url.includes('zillow.com')) {
      data = { error: 'Zillow scraping not implemented yet' };
    } else if (url.includes('realtor.com')) {
      data = { error: 'Realtor scraping not implemented yet' };
    } else {
      return res.status(400).json({ error: 'Unsupported domain' });
    }

    return res.json(data);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: 'Scraping failed' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Scraper API running on port ${PORT}`));
