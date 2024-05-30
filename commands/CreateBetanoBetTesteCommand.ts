import {BaseCommand} from '@adonisjs/core/build/standalone';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from "puppeteer-extra-plugin-stealth"


// @ts-ignore
import AnonymizeUAPlugin from "puppeteer-extra-plugin-anonymize-ua";
// @ts-ignore
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";
import Xvfb from 'xvfb';

const xvfb = new Xvfb({
  displayNum: 99, // número da tela
  reuse: true,
  timeout: 5000,
  xvfb_args: ['-screen', '0', '1024x768x24', '-ac']
});

xvfb.start((err) => {
  if (err) {
    console.error('Erro ao iniciar o XVFB:', err);
    return;
  }

  console.log('XVFB iniciado');

  // Coloque aqui o código que precisa rodar com o XVFB
  // ...

  // Após o código rodar, pare o XVFB
  xvfb.stop((err) => {
    if (err) {
      console.error('Erro ao parar o XVFB:', err);
      return;
    }

    console.log('XVFB parado');
  });
});

import axios from 'axios';

import LoginGoogle from "./Actions/LoginGoogle";
import Browser from "./Actions/Browser";
import Page from "./Actions/Page";

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
  public static commandName = 'test:create_betano_test';

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


    const apiUrls = [
      'https://app-54653.dc-us-1.absamcloud.com',

    ];
    const proxies = [
      {
        proxy: 'http://geo.iproyal.com:11225',
        username: 'Yazaguar',
        password: 'Money4ever_country-br_streaming-1'
      },
    ];

    function getRandomProxy(proxies: string | any[]) {
      const randomIndex = Math.floor(Math.random() * proxies.length);
      return proxies[randomIndex];
    }

    const proxy = getRandomProxy(proxies);

    function getRandomUrl(urls) {
      const randomIndex = Math.floor(Math.random() * urls.length);

      return urls[randomIndex];
    }

    let url = getRandomUrl(apiUrls)


    const dataReq = await axios.get(url + '/api/data');
    const addressReq = await axios.get(url + '/api/address');

    const emailReq = await axios.get(url + '/api/email/' + dataReq.data.user_id);

    const data = dataReq.data;
    const email = emailReq.data;
    const address = addressReq.data;


    if (data.length === 0 || email.length === 0 || address.length === 0) {
      console.log('sem dados suficientes')
      await new Promise(resolve => setTimeout(resolve, 3000));
      return
    }
    try {

      const browser = await Browser(proxy)
      const page = Page(browser, proxy)
      await LoginGoogle(page, email, browser)

      await new Promise(resolve => setTimeout(resolve, 20000000));


    } catch (error) {
      console.log(error)
    }

  }

}
