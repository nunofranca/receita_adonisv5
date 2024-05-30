import puppeteer from "puppeteer-extra";

const Browser = async (proxy: { proxy: string; }) =>{
  return  await puppeteer.launch({
    // userDataDir: '../profiles/dateBirth',
    env: {
      DISPLAY: ":10.0"
    },
    executablePath: '/usr/bin/microsoft-edge',
    slowMo: 10,
    defaultViewport: null,
    headless: false,
    ignoreDefaultArgs: ["--disable-extensions"],

    args: [
      '--proxy-server=' + proxy.proxy,
      // '--proxy-server=http://x279.fxdx.in:15783',
      //'--start-maximized',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      //'--window-size=1920x1080',
    ],
  });

}

export default Browser
