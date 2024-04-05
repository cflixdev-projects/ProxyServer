const express = require('express');
const cors = require('cors');
const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const axios = require('axios');

const app = express();
const port = 5000;

app.use(cors());

// Function to control Selenium WebDriver to get the video link
async function getVideoLink(showName, season, episode) {
    let driver;
    try {
        const options = new chrome.Options();
        options.addArguments('--headless'); // Run Chrome in headless mode

        driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

        const link = `http://186.2.175.5/serie/stream/${showName}/staffel-${season}/episode-${episode}`;
        await driver.get(link);

        const element = await driver.findElement(By.css('#wrapper > div.seriesContentBox > div.container.marginBottom > div:nth-child(5) > div.hosterSiteVideo > div.inSiteWebStream > div:nth-child(1) > iframe'));
        const contentValue = await element.getAttribute('src');

        return contentValue;
    } finally {
        if (driver) {
            await driver.quit();
        }
    }
}

// Endpoint to handle requests
app.get('/proxy/:show/:season/:episode', async (req, res) => {
    const { show, season, episode } = req.params;
    try {
        const videoLink = await getVideoLink(show, season, episode);
        res.send(videoLink);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Proxy server listening at http://localhost:${port}`);
});
