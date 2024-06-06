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
import VerifyCpfAndEmailInBetano from "./Actions/VerifyCpfAndEmailInBetano";
import LoginGoogle from "./Actions/LoginGoogle";
import Launch from "./Actions/Launch";
import AuthProxy from "./Actions/Betano/AuthProxy";
import ConfigPage from "./Actions/Betano/ConfigPage";
import Login from "./Actions/Betano/Login";
import BasicData from "./Actions/Betano/BasicData";
import Address from "./Actions/Betano/Address";
import ButtonNextBetano from "./Actions/Betano/ButtonNextBetano";
import {da} from "@faker-js/faker";
import {HttpsProxyAgent} from "https-proxy-agent";
import VerifyCpfAndEmailInBetanoChecker from "./Actions/VerifyCpfAndEmailInBetanoChecker";

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


    const response = await axios.get('https://app-54786.dc-sp-1.absamcloud.com/api/data')
    if (Object.keys(response.data).length == 0) {
      console.log('Sem dados');
      return
    }

    const browser = await Launch()

    const proxy = {
      username: 'PSqAoBQrU9fCnfiX',
      password: 'Nuno1201_country-br'
    }
    if (await VerifyCpfAndEmailInBetanoChecker(response.data,'nunotestestte@gmail.com', browser,proxy, 'https://app-54786.dc-sp-1.absamcloud.com')) {
      await browser.close()
      return;
    }


  }


}
