import puppeteer from "puppeteer-extra";
import fs from 'fs'
import path from 'path'

const Launch = async () => {

    const profileDir = path.resolve(__dirname, `../profiles/${Math.floor(10000000 + Math.random() * 90000000).toString()}`)

    if (!fs.existsSync(profileDir)) {
        fs.mkdirSync(profileDir, {recursive: true})
    }
    return await puppeteer.launch({
        env: {
          DISPLAY: "10.0"
        },
        ignoreHTTPSErrors: true,
        //userDataDir: profileDir,
        //executablePath: '/usr/bin/microsoft-edge',
        //executablePath: '/usr/bin/chrome-browser',
        slowMo: 10,
        defaultViewport: null,
        headless: false,
        ignoreDefaultArgs: ["--disable-extensions"],
        args: [

            // '--proxy-server=http://ipv6-ww.lightningproxies.net:10000',
            // '--start-maximized',
            '--start-minimized',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--window-size=1920x1080',
            '--disable-features=IsolateOrigins,site-per-process',
            // '--user-data-dir=../profiles/dateBirth'
        ],
    });


}
export default Launch
