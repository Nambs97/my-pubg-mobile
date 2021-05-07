const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');

const screen = {
    width: 640,
    height: 480
  };

  var chromeCapabilities = webdriver.Capabilities.chrome();
  //setting chrome options to start the browser fully maximized
  var chromeOptions = {
      'args': ['--headless']
  };
  chromeCapabilities.set('chromeOptions', chromeOptions);

async function getPlayerIGN(playerID) {
  let driver = new webdriver.Builder()
  .forBrowser('chrome')
  .setChromeOptions(new chrome.Options().headless().windowSize(screen))
  .build(); 
    let t =  Date.now();
  await driver.get("https://www.midasbuy.com/midasbuy/ot/buy/pubgm");
    const playerIDField = await driver.findElement(webdriver.By.xpath('/html/body/div[1]/div[2]/div[2]/div[1]/div[3]/div/div/div/div/div[1]/input'));
    const okButton = await driver.findElement(webdriver.By.xpath('/html/body/div[1]/div[2]/div[2]/div[1]/div[3]/div/div/div/div/div[2]'));
    await playerIDField.sendKeys(playerID); // this submits on desktop browsers
    await driver.manage().setTimeouts( { implicit: 750 } );
    await okButton.click();

    try {
      console.log("Getting " + playerID + "'s nickname in process...");
      await driver.manage().setTimeouts( { implicit: 2000 } );
      console.log('Trying to get IGN Field...')
      const el_playerIGN = await driver.findElement(webdriver.By.xpath('/html/body/div[1]/div[2]/div[2]/div[1]/div[3]/div/div/div/div/div[1]/div[1]/p'));
      console.log('IGN Field found !')
      const playerIGN = el_playerIGN.getText();
      playerIGN.then(data => console.log(data))
      .then(() => {
        driver.quit();
      });
      let difftime = Date.now() - t;
      console.log('Getting nickname success in '+ difftime +' ms !');
    } catch (e) {
      console.log('Getting nickname failed');
      await driver.quit();
    }
    //await driver.quit();
}

getPlayerIGN('5397845093');