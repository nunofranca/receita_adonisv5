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
import VerifyCpfAndEmailInBetano from "./CommandActions/VerifyCpfAndEmailInBetano";
import LoginGoogle from "./CommandActions/LoginGoogle";
import Launch from "./CommandActions/Launch";
import AuthProxy from "./CommandActions/Betano/AuthProxy";
import ConfigPage from "./CommandActions/Betano/ConfigPage";
import Login from "./CommandActions/Betano/Login";
import BasicData from "./CommandActions/Betano/BasicData";
import Address from "./CommandActions/Betano/Address";
import ButtonNextBetano from "./CommandActions/Betano/ButtonNextBetano";
import {da} from "@faker-js/faker";
import {HttpsProxyAgent} from "https-proxy-agent";
import NotBot from "./CommandActions/NotBot";
import {add} from "slashes";

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

    if (Object.keys(proxy).length == 0) {
      console.log('Sem proxy');
      return
    }


    //


    if (Object.keys(proxy.user.datas).length === 0) {

      console.log('Sem registro para verirficar')
      return

    }
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

    // const addressReqVia = await axios.get('https://viacep.com.br/ws/'+address.postCode+'/json/');
    //
    // const addressApiVia = addressReqVia.data
    // if (addressApiVia.erro) {
    //     console.log(address.postCode)
    //     console.log(addressApiVia)
    //     return
    // }

    if (proxy.slug === 'undefined') {
      return
    }
    console.log(proxy.slug)

    const cepReq = await axios.get(url + '/api/cep/' + proxy.slug);
    const cep = cepReq.data

    const email = proxy.user.emails[0];


    if (data.length === 0 || email.length === 0) {
      console.log('sem dados suficientes')
      await new Promise(resolve => setTimeout(resolve, 3000));
      return
    }

    const browser = await Launch()
    if (await VerifyCpfAndEmailInBetano(data, email, browser, proxy, url)) {
      await browser.close()
      return;
    }

    try {

      const page = await browser.newPage();
      await page.goto('http://192.168.0.1/')

      await page.locator('#userName').wait()
      await page.locator('#userName').fill('nuno')
      await page.locator('#pcPassword').fill('Nuno1201#')
      await page.locator('#loginBtn').click()
      await new Promise(resolve => setTimeout(resolve, 5000));
      const frames = page.frames();
      const bottomLeftFrame = frames.find(frame => frame.name() === 'bottomLeftFrame');

      if (bottomLeftFrame) {
        console.log('Frame `bottomLeftFrame` encontrado!');

        const elementoHandle = await bottomLeftFrame.$('#menu_network'); // Substitua `seletorDoElemento` pelo seletor real

        if (elementoHandle) {
          // Clica no elemento
          await elementoHandle.click();
          console.log('Clique realizado no elemento dentro do frame `bottomLeftFrame`.');
        } else {
          console.log('Elemento não encontrado no frame `bottomLeftFrame`.');
        }
      } else {
        console.log('Frame `bottomLeftFrame` não encontrado.');
      }

      await new Promise(resolve => setTimeout(resolve, 5000));

      const bottomMainFrame = frames.find(frame => frame.name() === 'mainFrame');

      if (bottomMainFrame) {
        const elementReset = await bottomMainFrame.$('#disConn'); // Substitua `seletorDoElemento` pelo seletor real
        if (elementReset) {
          try {
            // Obter o IP público
            let myIpResponse = await axios.get('https://api.ipify.org?format=json');
            let myIp = myIpResponse.data.ip;
            console.log('IP atual:', myIp);

            // Consultar a conta usando o IP
            let accountResponse = await axios.get(url + '/api/account/' + myIp);
            let account = accountResponse.data;

            // Continuar tentando desconectar enquanto a conta existir
            while (account) {
              await new Promise(resolve => setTimeout(resolve, 3000)); // Aguardar 3 segundos
              await elementReset.click();
              console.log('Clicado para desconectar.');

              // Re-verificar a conta após tentar desconectar
              accountResponse = await axios.get(url + '/api/account/' + myIp);
              if (account) break

            }

          } catch (error) {
            console.error('Erro durante a execução:', error);
          }
        } else {
          console.error('Elemento não encontrado.');
        }
      }

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


      await page.goto('https://gmail.com')
      await LoginGoogle(email, page, browser)

      await new Promise(resolve => setTimeout(resolve, 10000));
      await page.goto('https://br.betano.com/myaccount/register')

      const randomUserAgentBetano = userAgentBetano[Math.floor(Math.random() * userAgentBetano.length)];
      //await  NotBot(pageBetano)
      await page.setUserAgent(randomUserAgentBetano);



      await Login(page, browser)
      await new Promise(resolve => setTimeout(resolve, 10000));


      await new Promise(resolve => setTimeout(resolve, 5000));

      console.log('Carregando a página...')
      await new Promise(resolve => setTimeout(resolve, 5000));
      console.log('Página carregadada')

      await BasicData(page, data, url, browser)
      await new Promise(resolve => setTimeout(resolve, 3000));
      await ButtonNextBetano(page)
      await new Promise(resolve => setTimeout(resolve, 3000));
      await Address(page, cep, address)
      await new Promise(resolve => setTimeout(resolve, 3000));
      await ButtonNextBetano(page)
      await new Promise(resolve => setTimeout(resolve, 3000));
      await page.focus('#username');
      await page.keyboard.down('Control');
      await page.keyboard.press('A');
      await page.keyboard.up('Control');
      await page.keyboard.press('Backspace');

      await new Promise(resolve => setTimeout(resolve, 2000))
      await page.type('#username', username)
      await new Promise(resolve => setTimeout(resolve, 2000));
      await page.waitForSelector('input[type="password"]', {visible: true});
      await page.type('input[type="password"]', 'Money4Life#')
      await new Promise(resolve => setTimeout(resolve, 5000));
      await ButtonNextBetano(page)
      await new Promise(resolve => setTimeout(resolve, 5000));
      const checkbox = await page.$('span.checkbox-check.tw-rounded-xs');
      if (!checkbox) return
      await checkbox.click();
      console.log('Clicou no checkbox');
      await new Promise(resolve => setTimeout(resolve, 3000));

      await page.evaluate(() => {
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

    } finally {
      await new Promise(resolve => setTimeout(resolve, 18000));
      await browser.close()
    }

  }


}
