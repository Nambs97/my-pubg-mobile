const webdriver = require('selenium-webdriver');

const browserStackParams = {
  USERNAME : 'rarivosonandrian1',
  KEY : 'wcE2cK3eufm64h7XXBAd',
  GRID_HOST : 'hub-cloud.browserstack.com/wd/hub'
};

const lambdaTestParams = {
  USERNAME : 'nambinintsoa26',
  KEY : 'K7Ht2ltj2NSOnyjftkiYNcTAbekBRIYMolsBUhVZqW5O7i1V6b',
  GRID_HOST : 'hub.lambdatest.com/wd/hub'
};

// BrowserStack Capabilities
const bsCapabilities = {
  'browser': 'chrome',
  'browser_version': 'latest',
  'os': 'Windows',
  'os_version': '10',
  'build': 'pubg-mobile-build',
  'name': 'LCDP Gaming Store'
}

// LambdaTest Capabilities
const ltCapabilities = {
  platform: 'windows 10',
  browserName: 'chrome',
  version: '90.0',
  headless : true,
  resolution: '1280x800',
  network: true,
  visual: true,
  console: true,
  video: true,
  name: 'LCDP Gaming Store', // name of the test
  build: 'pubg-mobile-build' // name of the build
}

async function getPlayerIGN(remoteServerParam, playerID) {
  //Default value of remoteServer parameters
  let serverParams = lambdaTestParams;
  let genCapabilities = ltCapabilities;
  let remoteServer = 'lambdatest';
  //console.log(">>>REMOTE 0: " + remoteServer);
  //console.log(">>>PARAM 0: " + JSON.stringify(serverParams));
  //console.log(">>>REMOTE 1: " + remoteServer + '/' + remoteServerParam);
  if (remoteServerParam == 'browserstack' || remoteServerParam == 'lambdatest') {
    remoteServer = remoteServerParam;
    //console.log(">>>REMOTE 2: " + remoteServer + '/' + remoteServerParam);
  }

  if (remoteServer == 'browserstack') {
    serverParams = browserStackParams;
    genCapabilities = bsCapabilities;
  } else if (remoteServer == 'lambdatest') {
    serverParams = lambdaTestParams;
    genCapabilities = ltCapabilities;
  }

  //console.log(">>>PARAM 1: " + JSON.stringify(serverParams));
  // URL: https://{username}:{accessKey}@hub.lambdatest.com/wd/hub
  //const gridUrl = 'http://' + USERNAME + ':' + KEY + '@' + GRID_HOST;
  const gridUrl = 'http://' + serverParams.USERNAME + ':' + serverParams.KEY + '@' + serverParams.GRID_HOST;
  const capabilities = genCapabilities;
  //console.log(">>>CAP 0: " + JSON.stringify(capabilities));
  //console.log(">>>REMOTE URL 0: " + gridUrl);

  //Process if remoteServer is BrowserStack
  if (remoteServer == 'browserstack') {
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
    await driver.manage().setTimeouts( { implicit: 750 } );
    await okButton.click();

    try {
      console.log("Getting " + playerID + "'s nickname in process...");
      await driver.manage().setTimeouts( { implicit: 1000 } );
      const el_playerIGN = await driver.findElement(webdriver.By.xpath('/html/body/div[1]/div[2]/div[2]/div[1]/div[3]/div/div/div/div/div[1]/div[1]/p'));
      const playerIGN = el_playerIGN.getText();
      
      await driver.executeScript(
        'browserstack_executor: {"action": "setSessionStatus", "arguments": {"status":"passed","reason": "Player Nickname retrieved successfully!"}}'
      );
      await driver.quit();
      console.log('Getting nickname success');
      return playerIGN;
    } catch (e) {
      await driver.executeScript(
        'browserstack_executor: {"action": "setSessionStatus", "arguments": {"status":"failed","reason": "Player Nickname not load in time"}}'
      );
      console.log('Getting nickname failed');
      await driver.quit();
    }
  //Process if remoteServer is LambdaTest
  } else if (remoteServer == 'lambdatest') {
    const driver = new webdriver.Builder()
        .usingServer(gridUrl)
        .withCapabilities(capabilities)
        .build();

    await driver.get("https://www.midasbuy.com/midasbuy/ot/buy/pubgm");
    const playerIDField = await driver.findElement(webdriver.By.xpath('/html/body/div[1]/div[2]/div[2]/div[1]/div[3]/div/div/div/div/div[1]/input'));
    const okButton = await driver.findElement(webdriver.By.xpath('/html/body/div[1]/div[2]/div[2]/div[1]/div[3]/div/div/div/div/div[2]'));
    await playerIDField.sendKeys(playerID); // this submits on desktop browsers
    await driver.manage().setTimeouts( { implicit: 750 } );
    await okButton.click();

    try {
      console.log("Getting " + playerID + "'s nickname in process...");
      await driver.manage().setTimeouts( { implicit: 1000 } );
      const el_playerIGN = await driver.findElement(webdriver.By.xpath('/html/body/div[1]/div[2]/div[2]/div[1]/div[3]/div/div/div/div/div[1]/div[1]/p'));
      const playerIGN = el_playerIGN.getText();
      
      await driver.quit();
      console.log('Getting nickname success');
      return playerIGN;
    } catch (e) {
      console.log('Getting nickname failed');
      await driver.quit();
    }
  }
}

exports.getPlayerIGN = getPlayerIGN;