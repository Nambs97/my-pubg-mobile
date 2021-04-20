const webdriver = require('selenium-webdriver');

// username: Username can be found at automation dashboard
const USERNAME = 'rarivosonandrian1';
 
// AccessKey:  AccessKey can be generated from automation dashboard or profile section
const KEY = 'wcE2cK3eufm64h7XXBAd';
 
// gridUrl: gridUrl can be found at automation dashboard
const GRID_HOST = 'hub-cloud.browserstack.com/wd/hub'
//const GRID_HOST = 'hub.lambdatest.com/wd/hub';

// URL: https://{username}:{accessKey}@hub.lambdatest.com/wd/hub
const gridUrl = 'http://' + USERNAME + ':' + KEY + '@' + GRID_HOST;

const capabilities1 = {
    'browser': 'chrome',
    'browser_version': 'latest',
    'os': 'Windows',
    'os_version': '10',
    'build': 'browserstack-build-1',
    'name': 'PUBG Mobile Midasbuy'
  }
  const capabilities2 = {
      'browser': 'firefox',
    'browser_version': 'latest',
    'os': 'Windows',
    'os_version': '10',
    'build': 'browserstack-build-1',
    'name': 'Parallel test 2'
  }
  const capabilities3 = {
      'browser': 'safari',
    'browser_version': 'latest',
    'os': 'OS X',
    'os_version': 'Big Sur',
    'build': 'browserstack-build-1',
    'name': 'Parallel test 3'
  }

async function getPlayerIGN(playerID) {
    var playerIGN = '';
  const capabilities = capabilities1;
  let driver = new webdriver.Builder()
    .usingServer(gridUrl)
    .withCapabilities({
      ...capabilities,
      ...capabilities['browser'] && { browserName: capabilities['browser']}  // Because NodeJS language binding requires browserName to be defined
    })
    .build();
  await driver.get("https://www.midasbuy.com/midasbuy/ot/buy/pubgm");
  const playerIDField = await driver.findElement(webdriver.By.xpath('/html/body/div[1]/div[2]/div[2]/div[1]/div[3]/div/div/div/div/div[1]/input'));
  const okButton = await driver.findElement(webdriver.By.xpath('/html/body/div[1]/div[2]/div[2]/div[1]/div[3]/div/div/div/div/div[2]'));
  await playerIDField.sendKeys(playerID); // this submits on desktop browsers
  await okButton.click();

  try {
    //await driver.wait(webdriver.until.titleMatches(/BrowserStack/i), 5000);
    //console.log("Getting " + playerID + "'s nickname in process...");
    await driver.manage().setTimeouts( { implicit: 1000 } );
    const el_playerIGN = await driver.findElement(webdriver.By.xpath('/html/body/div[1]/div[2]/div[2]/div[1]/div[3]/div/div/div/div/div[1]/div[1]/p'));
    //const el_playerIGN = await driver.wait(until.elementLocated(By.xpath('/html/body/div[1]/div[2]/div[2]/div[1]/div[3]/div/div/div/div/div[1]/div[1]/p')));
    const playerIGN = el_playerIGN.getText();
    /*playerIGN.then((nickname) => {
        console.log(nickname);
        playerIGN = nickname;
    });*/
    await driver.executeScript(
      'browserstack_executor: {"action": "setSessionStatus", "arguments": {"status":"passed","reason": "Player Nickname retrieved successfully!"}}'
    );
    await driver.quit();
    return playerIGN;
  } catch (e) {
    await driver.executeScript(
      'browserstack_executor: {"action": "setSessionStatus", "arguments": {"status":"failed","reason": "Player Nickname not load in time"}}'
    );
    console.log('Getting nickname failed');
    await driver.quit();
  }
}

exports.getPlayerIGN = getPlayerIGN;