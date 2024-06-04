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
    let browser;
    const apiUrls = [
      'https://botbetano.com.br',
      //'https://app-54653.dc-us-1.absamcloud.com'
    ];

    function getRandomUrl(urls) {
      const randomIndex = Math.floor(Math.random() * urls.length);

      return urls[randomIndex];
    }

    let url = getRandomUrl(apiUrls)

    console.log('Chegou nas requisições')
    const dataReq = await axios.get(url + '/api/data');

    const proxyReq = await axios.get(url + '/api/proxy');
    const emailReq = await axios.get(url + '/api/email/' + dataReq.data.user_id);
    const addressReq = await axios.get(url + '/api/address');
    const data = dataReq.data;
    const email = emailReq.data;
    const address = addressReq.data;


    const proxy = proxyReq.data;
    console.log('Fez todas as requisições necessára à API')


    if (data.length === 0 || email.length === 0) {
      console.log('sem dados suficientes')
      await new Promise(resolve => setTimeout(resolve, 3000));
      return
    }


    browser = await Launch(proxy)

    try {

      await VerifyCpfAndEmailInBetano(data, email, browser, proxy, url)

      await LoginGoogle(email, data, proxy, browser)

      await new Promise(resolve => setTimeout(resolve, 5000));


      try {

        const pageBetano = await browser.newPage()
        const randomUserAgentBetano = userAgentBetano[Math.floor(Math.random() * userAgentBetano.length)];

        await pageBetano.setUserAgent(randomUserAgentBetano);


        await AuthProxy(proxy, pageBetano)

        await ConfigPage(pageBetano)
        await new Promise(resolve => setTimeout(resolve, 7000));
        await Login(pageBetano, browser)


        await new Promise(resolve => setTimeout(resolve, 10000));


        await BasicData(pageBetano, data, url, browser)

        async function clickProxima() {
          await pageBetano.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const button = buttons.find(btn => {
              const span = btn.querySelector('span');
              // @ts-ignore
              return span && span.textContent.trim() === 'PRÓXIMA';
            });
            if (button) {
              button.click();

            } else {
              console.error('Botão "PRÓXIMA" não encontrado.');
            }
          });
        }

        await clickProxima()
        await new Promise(resolve => setTimeout(resolve, 20000));
        const addressProxy = await axios.get(url + '/api/cep/' + proxy.slug);
        console.log('Fez a requisição para pegar o proxy')
        const addressReq = await axios.get('https://viacep.com.br/ws/' + addressProxy.data.cep + '/json/');
        console.log('Fez a requisição no VIACEP')
        await new Promise(resolve => setTimeout(resolve, 20000));
        const addressApi = addressReq.data
        console.log(addressApi)

        try {
          await pageBetano.waitForSelector('#street', {visible: true});
          await new Promise(resolve => setTimeout(resolve, 2000));
          await pageBetano.type("#street", addressApi.logradouro.replace(/[^a-zA-Z0-9 ]/g, ''))
          console.log('Adicionou o nome da rua: ' + addressApi.logradouro.replace(/[^a-zA-Z0-9 ]/g, ''))
          await new Promise(resolve => setTimeout(resolve, 2000));
          await pageBetano.waitForSelector('#city', {visible: true});
          await pageBetano.type("#city", addressApi.localidade.replace(/[^a-zA-Z0-9 ]/g, ''))
          console.log('Adicionou a cidade: ' + addressApi.localidade.replace(/[^a-zA-Z0-9 ]/g, ''))
          await new Promise(resolve => setTimeout(resolve, 2000));
          await pageBetano.waitForSelector('#postalcode', {visible: true});
          await pageBetano.type("#postalcode", addressApi.cep)
          console.log('Adicionou o CEP: ' + addressApi.cep)
          await new Promise(resolve => setTimeout(resolve, 2000));
          await pageBetano.waitForSelector('#mobilePhone', {visible: true});
          await pageBetano.type("#mobilePhone", address.phone)
          console.log('Adicionou o Telefone: ' + address.phone)
        } catch (error) {
          console.log(error)
        }


        await new Promise(resolve => setTimeout(resolve, 2000));
        await clickProxima()
        console.log('Clicou no botão para a próxima pagina')
        await new Promise(resolve => setTimeout(resolve, 7000));
        await pageBetano.focus('#username');
        await pageBetano.keyboard.down('Control');
        await pageBetano.keyboard.press('A');
        await pageBetano.keyboard.up('Control');
        await pageBetano.keyboard.press('Backspace');
        console.log('Deletou o username padrão')
        await new Promise(resolve => setTimeout(resolve, 2000))
        await pageBetano.type('#username', data.username)
        console.log('Adicinou o useraname: ' + data.username)
        // const username = await page.evaluate(selector => {
        //   return document.querySelector(selector).value;
        // }, '#username');
        await new Promise(resolve => setTimeout(resolve, 2000));
        await pageBetano.waitForSelector('input[type="password"]', {visible: true});
        await pageBetano.type('input[type="password"]', 'Money4Life#')
        console.log('Adicinou a senha')
        await new Promise(resolve => setTimeout(resolve, 6000))

        await clickProxima()
        console.log('Clicou no botão para a próxima pagina')
        await new Promise(resolve => setTimeout(resolve, 8000));
        const checkbox = await pageBetano.$('span.checkbox-check.tw-rounded-xs');
        if (checkbox) {
          await checkbox.click();
          console.log('Clicou no checkbox');
        } else {
          console.error('Checkbox não encontrado.');
        }


        await new Promise(resolve => setTimeout(resolve, 8000));
        await pageBetano.evaluate(() => {
          const buttonRegister = Array.from(document.querySelectorAll('button'));
          const register = buttonRegister.find(regis => {
            const span = regis.querySelector('span');
            // @ts-ignore
            return span && span.textContent.trim() === 'REGISTRAR';
          });

          if (register) {
            register.click();
            console.log('Clicou no botao de registrar')


          } else {
            console.error('Botão "PRÓXIMA" não encontrado.');
          }
        });
        await new Promise(resolve => setTimeout(resolve, 15000));
        console.log(randomUserAgentBetano);
        const account = await axios.post(
          url + '/api/account',
          {
            password: 'Money4Life#',
            useragent: randomUserAgentBetano ?? 'Sem informação',
            user_id: data.user_id,
            username: data.username,
            data: data,
            email: email,
            address: {
              id: address.id,
              street: addressApi.logradouro,
              city: addressApi.localidade,
              postCode: addressApi.cep
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
        console.log(account)
        await new Promise(resolve => setTimeout(resolve, 15000));

      } catch (error) {
        console.log('Primeiro catch:' + error)

      } finally {
        await browser.close();
      }
    } catch (error) {
      console.log('Ultimo catch:' + error)

    } finally {
      // const cookiesBetano = await page.cookies();
      // for (let cookieBe of cookiesBetano) {
      //   await page.deleteCookie(cookieBe);
      // }
      //
      // // Verificar que os cookies foram limpos
      // const cookiesAfterBetano = await page.cookies();
      // console.log('Cookies after deletion:', cookiesAfterBetano);
      await browser.close()
    }


    async function buttonNext(page) {
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const button = buttons.find(btn => {
          const span = btn.querySelector('span');
          // @ts-ignore
          return span && span.textContent.trim() === 'Avançar';
        });
        if (button) {

          button.click();
        }
      });
    }


  }


}
