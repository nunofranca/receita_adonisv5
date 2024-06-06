import puppeteer from "puppeteer-extra";

const Launch = async (proxy) => {

    return await puppeteer.launch({
        env: {
          DISPLAY: ":0"
        },
        // userDataDir: '../profiles/dateBirth',
        executablePath: '/usr/bin/microsoft-edge',
        //executablePath: '/usr/bin/chromium-browser',
        slowMo: 10,
        defaultViewport: null,
        headless: true,
        ignoreDefaultArgs: ["--disable-extensions"],
        args: [
            '--proxy-server=http://' + proxy.proxy,
            // '--proxy-server=http://ipv6-ww.lightningproxies.net:10000',
            '--start-maximized',
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
