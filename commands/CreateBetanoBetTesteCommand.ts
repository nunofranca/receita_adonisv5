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
import VerifyCpfAndEmailInBetano from "App/CommandActions/VerifyCpfAndEmailInBetano";
import LoginGoogle from "App/CommandActions/LoginGoogle";
import Launch from "App/CommandActions/Launch";
import AuthProxy from "App/CommandActions/Betano/AuthProxy";
import ConfigPage from "App/CommandActions/Betano/ConfigPage";
import Login from "App/CommandActions/Betano/Login";
import BasicData from "App/CommandActions/Betano/BasicData";
import Address from "App/CommandActions/Betano/Address";
import ButtonNextBetano from "App/CommandActions/Betano/ButtonNextBetano";
import {da} from "@faker-js/faker";
import {HttpsProxyAgent} from "https-proxy-agent";
import VerifyCpfAndEmailInBetanoChecker from "App/CommandActions/VerifyCpfAndEmailInBetanoChecker";

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


    const proxy = await axios.get('https://app-54786.dc-sp-1.absamcloud.com/api/proxy')
    console.log(proxy.data)
    const response = await axios.get('https://app-54786.dc-sp-1.absamcloud.com/api/data/betano/' + proxy.data.user_id)
    if (Object.keys(response.data).length == 0) {
      console.log('Sem dados');
      return
    }

    const browser = await Launch(proxy.data)


    // @ts-ignore
    if (await VerifyCpfAndEmailInBetanoChecker(response, 'nunotestestte@gmail.com', browser, proxy.data, 'https://app-54786.dc-sp-1.absamcloud.com')) {
      await browser.close()
      return;
    }


  }


}
