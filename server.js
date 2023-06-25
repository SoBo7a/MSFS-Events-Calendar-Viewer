const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();


const port = 3002; // Specify the desired port for the server
const url = 'https://forums.flightsimulator.com/c/community/community-fly-in-events/143/l/calendar.json'; // Specify the MSFS Events Calender URL

app.use(cors());

app.get('/api/calendar', async (req, res) => {
  try {
    const response = await axios.get(url);
    const jsonData = response.data;

    res.json(jsonData);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching data' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
