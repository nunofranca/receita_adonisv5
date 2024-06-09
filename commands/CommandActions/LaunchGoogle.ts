import puppeteer from "puppeteer-extra";
import fs from 'fs'
import path from 'path'

const Launch = async (proxy) => {

  const profileDir = path.resolve(__dirname, `../profiles/${Math.floor(10000000 + Math.random() * 90000000).toString()}`)

  if (!fs.existsSync(profileDir)) {
    fs.mkdirSync(profileDir, {recursive: true})
  }

  return await puppeteer.launch({
    ignoreHTTPSErrors: true,
    userDataDir: profileDir,
     executablePath: '/usr/bin/microsoft-edge', // Ou '/usr/bin/chrome-browser'
    //executablePath: '/usr/bin/chromium-browser',
    slowMo: 10,
    defaultViewport: null,
    headless: false,
    ignoreDefaultArgs: ["--disable-extensions"],
    args: [
      '--proxy-server=http://' + proxy.proxy,
      '--start-minimized',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920x1080',
      '--disable-features=IsolateOrigins,site-per-process',
    ],
  });


}
export default Launch
