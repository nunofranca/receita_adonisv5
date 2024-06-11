import {BaseCommand} from '@adonisjs/core/build/standalone';
import puppeteer from 'puppeteer-extra';
import {KnownDevices} from 'puppeteer';
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
import VerifyCpfAndEmailInBetano from "./CommandActions/VerifyCpfAndEmailInBetano";
import LoginGoogle from "./CommandActions/LoginGoogle";
import Launch from "./CommandActions/Launch";

import Login from "./CommandActions/Betano/Login";
import BasicData from "./CommandActions/Betano/BasicData";
import Address from "./CommandActions/Betano/Address";
import ButtonNextBetano from "./CommandActions/Betano/ButtonNextBetano";
import AuthProxy from "./CommandActions/Betano/AuthProxy";
import Geolocalization from "../Geolocalization";


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
  public static commandName = 'test:create_betano';

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

    console.log('Entrou no metodo RUN')


    const apiUrls = [
      'https://botbetano.com.br',
      //'https://app-54653.dc-us-1.absamcloud.com'
    ];

    function getRandomUrl(urls) {
      const randomIndex = Math.floor(Math.random() * urls.length);

      return urls[randomIndex];
    }

    let url = getRandomUrl(apiUrls)
    const proxyReq = await axios.get(url + '/api/proxy');

    const proxy = proxyReq.data;


    const getCityKey = (city) => {
      const cities = Geolocalization();
      return cities.find(c => c.name === city);
    };
    const geo = getCityKey(proxy.city)
    console.log(geo.longitude, geo.latitude)

    const data = proxy.user.datas[0];


    async function generateUsername(data) {
      const asciiName = data.replace(/[^\x00-\x7F]/g, ''); // Remove caracteres não ASCII
      const baseName = asciiName.split(' ')[0].toLowerCase();
      const randomString = Math.random().toString(36).substring(2, 5);
      const randomNumber = Math.floor(Math.random() * 10);
      let username = `${baseName}${randomString}${randomNumber}`;
      if (username.length > 12) {
        username = username.substring(0, 12);
      }

      return username;
    }

    const username = await generateUsername(data.name)
    const addressReq = await axios.get(url + '/api/address');
    const address = addressReq.data;

    if (proxy.slug === 'undefined') {
      return
    }
    console.log(proxy.slug)

    const cepReq = await axios.get(url + '/api/cep/salvador');
    const cep = cepReq.data

    const email = proxy.user.emails[0];


    if (data.length === 0 || email.length === 0) {
      console.log('sem dados suficientes')
      await new Promise(resolve => setTimeout(resolve, 3000));
      return
    }

    const browser = await Launch()


    try {
      // let myIpResponse = await axios.get('https://api.ipify.org?format=json');
      // let myIp = myIpResponse.data.ip;
      // console.log('IP atual:', myIp);
      // let accountResponse = await axios.get(url + '/api/account/' + myIp);
      // if (accountResponse.data) {
      //   await this.resetConnection(browser)
      //   return
      // }
      // if (data.betano === null) {
      //   if (await VerifyCpfAndEmailInBetano(data, email, browser, proxy, url)) {
      //     await browser.close()
      //     return;
      //   }
      // }

      await new Promise(resolve => setTimeout(resolve, 10000));

      console.log('')
      console.log('')
      console.log(proxy.user.name)
      console.log('************************************')
      console.log('email ' + email.email)
      console.log('senha ' + email.password)
      console.log('recuperacao ' + email.emailRecovery)
      console.log('************************************')
      console.log('')
      const page = await browser.newPage();
      console.log(proxy)
      await AuthProxy(proxy, page)

      await page.goto('https://gmail.com')
      // await page.goto('https://meuip.com')

      await LoginGoogle(email, page, browser)
      // const deleteFiles = await this.prompt.toggle(
      //   'Want to delete all files?',
      //   ['Y', 'N']
      // )
      //
      // if (!deleteFiles) {
      //   console.log('nao')
      //   return
      // }
      await new Promise(resolve => setTimeout(resolve, 10000));
      const randomUserAgentBetano = userAgentBetano[Math.floor(Math.random() * userAgentBetano.length)];

      await page.setUserAgent(randomUserAgentBetano);


      await new Promise(resolve => setTimeout(resolve, 10000));

      const devices = [
        'iPhone 11 Pro',
        'iPhone 12 Pro',
        'Galaxy S9',
        'iPad Pro'
      ];
      const device = devices[Math.floor(Math.random() * devices.length)];
      const pageBetano = await browser.newPage();

      await AuthProxy(proxy, pageBetano)
      // @ts-ignore

      const context = browser.defaultBrowserContext();
      await context.overridePermissions('https://br.betano.com/myaccount/register', ['geolocation']);
      await context.overridePermissions('https://accounts.google.com', ['geolocation']);
      // @ts-ignore
      await pageBetano.setGeolocation({latitude: geo.latitude, longitude: geo.longitude});
      // @ts-ignore
      await pageBetano.emulate(KnownDevices[device])
      await pageBetano.goto('https://br.betano.com/myaccount/register')
      console.log('Emulando o: ' + device)

      await new Promise(resolve => setTimeout(resolve, 10000));
      await Login(pageBetano, browser)

      await new Promise(resolve => setTimeout(resolve, 5000));


      await BasicData(pageBetano, data, url, browser)

      await ButtonNextBetano(pageBetano)
      await new Promise(resolve => setTimeout(resolve, 8000));
      await Address(pageBetano, cep, address)
      await ButtonNextBetano(pageBetano)
      await new Promise(resolve => setTimeout(resolve, 8000));
      await pageBetano.focus('#username');
      await pageBetano.keyboard.down('Control');
      await pageBetano.keyboard.press('A');
      await pageBetano.keyboard.up('Control');
      await pageBetano.keyboard.press('Backspace');

      await new Promise(resolve => setTimeout(resolve, 2000))
      await pageBetano.type('#username', username)
      await new Promise(resolve => setTimeout(resolve, 2000));
      await pageBetano.waitForSelector('input[type="password"]', {visible: true});
      await pageBetano.type('input[type="password"]', 'Money4Life#')
      await new Promise(resolve => setTimeout(resolve, 5000));
      await ButtonNextBetano(pageBetano)
      await new Promise(resolve => setTimeout(resolve, 5000));
      const checkbox = await pageBetano.$('span.checkbox-check.tw-rounded-xs');
      if (!checkbox) return
      await checkbox.click();
      console.log('Clicou no checkbox');
      await new Promise(resolve => setTimeout(resolve, 3000));
      let accountResponseConfirmation = await axios.get(url + '/api/account/' + myIp);
      if (accountResponseConfirmation.data) {
        return
      }
      await pageBetano.evaluate(() => {
        console.log('Entrou no componente que aperta o botão de próximo');
        const buttons = Array.from(document.querySelectorAll('button'));
        const registerButton = buttons.find(button => button.textContent.trim() === 'REGISTRAR');

        if (!registerButton) return
        registerButton.click();
        console.log('Clicou no botão de registrar');

      });
      await new Promise(resolve => setTimeout(resolve, 10000));
      const ip = await axios.get('https://api.ipify.org?format=json')
      axios.post(
        url + '/api/account',
        {
          ip: ip.data.ip,
          password: 'Money4Life#',
          useragent: randomUserAgentBetano ?? 'Sem informação',
          user_id: data.user_id,
          username: username,
          data: data,
          email: email,
          address: {
            id: address.id,

          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      ).then(() => {
        console.log('Conta cadastrada com sucesso')
      });
    } catch (error) {
      console.log('Ultimo catch:' + error)
      await this.resetConnection(browser)

    } finally {
      await this.resetConnection(browser)
      await browser.close()
    }

  }

  async resetConnection(browser) {
    try {
      const pageRoteador = await browser.newPage();
      await pageRoteador.goto('http://192.168.0.1/')


      await pageRoteador.locator('#userName').wait()
      await pageRoteador.locator('#userName').fill('nuno')
      await pageRoteador.locator('#pcPassword').fill('Nuno1201#')
      await pageRoteador.locator('#loginBtn').click()
      await new Promise(resolve => setTimeout(resolve, 5000));
      const frames = pageRoteador.frames();
      const bottomLeftFrame = frames.find(frame => frame.name() === 'bottomLeftFrame');

      if (bottomLeftFrame) {
        const elementoHandle = await bottomLeftFrame.$('#menu_network'); // Substitua `seletorDoElemento` pelo seletor real
        if (elementoHandle) {
          await elementoHandle.click();

        }
        await new Promise(resolve => setTimeout(resolve, 1000)); // Aguardar 3 segundos
      }
      const bottomMainFrame = frames.find(frame => frame.name() === 'mainFrame');
      await new Promise(resolve => setTimeout(resolve, 1000))
      if (bottomMainFrame) {
        const elementReset = await bottomMainFrame.$('#disConn'); // Substitua `seletorDoElemento` pelo seletor real
        if (elementReset) {
          try {

            await elementReset.click();
            console.log('Clicado para desconectar.');
            await new Promise(resolve => setTimeout(resolve, 3000)); // Aguardar 3 segundos

            return
          } catch (error) {
            console.error('Erro durante a execução:', error);
          }
        } else {
          console.error('Elemento não encontrado.');
        }
      }
    } catch (error) {
      console.log(error)
    }
  }


  // Função para verificar se o texto está presente
  async checkTextPresence(page, browser) {
    const textPresent = await page.evaluate((text) => {
      return document.body.innerText.includes(text);
    }, 'We want to make sure it is actually you we are dealing with and not a robot.');

    if (textPresent) {
      await this.resetConnection(browser)
    }
  }


  async checkForCaptcha(page, browser) {
    const captchaSelectors = [
      'iframe[src*="recaptcha"]',
      'iframe[src*="hcaptcha"]',
      'div[id*="recaptcha"]',
      'div[class*="hcaptcha"]',
      'img[src*="captcha"]',
    ];

    for (const selector of captchaSelectors) {
      try {
        await page.waitForSelector(selector, {timeout: 5000});
        await this.resetConnection(browser)
      } catch (e) {
        // Element not found within the timeout
      }
    }

    return false;
  }


}
