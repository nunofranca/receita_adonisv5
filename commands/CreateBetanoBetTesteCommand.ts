import {BaseCommand} from '@adonisjs/core/build/standalone';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from "puppeteer-extra-plugin-stealth"

import axios from 'axios';

// @ts-ignore
import userAgents from "../userAgents";
// @ts-ignore
import userAgentBetano from "../UserAgentBetano";
// @ts-ignore
import AnonymizeUAPlugin from "puppeteer-extra-plugin-anonymize-ua";
// @ts-ignore
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";
import Xvfb from 'xvfb';

import Launch from './CommandActions/Launch'; // Ajuste o caminho relativo conforme a estrutura de pastas


import VerifyCpfAndEmailInBetanoChecker from "./CommandActions/VerifyCpfAndEmailInBetanoChecker";

const xvfb = new Xvfb({
  displayNum: 99, // número da tela
  reuse: true,
  timeout: 5000,
  xvfb_args: ['-screen', '0', '1024x768x24', '-ac']
});

xvfb.start((err) => {
  if (err) {

    return;
  }

  xvfb.stop((err) => {
    if (err) {

      return;
    }


  });
});

console.log('depois do xvfb')


const stealth = StealthPlugin()
stealth.enabledEvasions.delete('iframe.contentWindow')
stealth.enabledEvasions.delete('media.codecs')
puppeteer.use(stealth)
puppeteer.use(AnonymizeUAPlugin());
puppeteer.use(
  AdblockerPlugin({
    blockTrackers: true,
  })
);

export default class TestPixSimple extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'test:create_betano_teste';

  /**
   * Command description is displayed in the "help" output
   */
  public static description = '';

  public static settings = {
    /**
     * Set the following value to true, if you want to load the application
     * before running the command. Don't forget to call `node ace generate:manifest`
     * afterwards.
     */
    loadApp: false,

    /**
     * Set the following value to true, if you want this command to keep running until
     * you manually decide to exit the process. Don't forget to call
     * `node ace generate:manifest` afterwards.
     */
    stayAlive: false,
  };

  public async run() {


    const proxy = await axios.get('https://app-54786.dc-sp-1.absamcloud.com/api/proxy')
    console.log(proxy.data.proxy)
    const response = await axios.get('https://app-54786.dc-sp-1.absamcloud.com/api/data/betano/' + proxy.data.user_id)
    if (Object.keys(response.data).length < 3) {
      console.log('Sem dados');
      return
    }

   const browser = await puppeteer.launch({
      // env: {
      //   DISPLAY: ":0"
      // },
      ignoreHTTPSErrors: true,
      //userDataDir: profileDir,
      executablePath: '/usr/bin/microsoft-edge',
      //executablePath: '/usr/bin/chrome-browser',
      // executablePath: '/usr/bin/chromium-browser',
      slowMo: 10,
      defaultViewport: null,
      headless: false,

      ignoreDefaultArgs: ["--disable-extensions"],
      args: [

        '--proxy-server=http://'+proxy.data.proxy,
        // '--start-maximized',
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


    // @ts-ignore
    if (await VerifyCpfAndEmailInBetanoChecker(response, 'nunotestestte@gmail.com', browser, proxy.data, 'https://app-54786.dc-sp-1.absamcloud.com')) {
      await browser.close()
      return;
    }


  }


}
