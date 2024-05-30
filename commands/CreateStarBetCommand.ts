import {BaseCommand} from '@adonisjs/core/build/standalone'
import puppeteer from 'puppeteer';
import axios from "axios";

import * as fs from "fs";



export default class TestPixSimple extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'test:create_star_bet'

  /**
   * Command description is displayed in the "help" output
   */
  public static description = ''

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
  }

  public async run() {

    try {
      const response = await axios.get('https://botbet.tec.br/api/bet/star');
      const data = response.data;
      if (Object.keys(data).length === 0) {
        console.log('Sem registro para verirficar')
        await this.countdown(30);

      }

      console.log(data);

      const parts = data.proxy.proxy.split(':')
      const proxy = {
        ip_port: parts[0] + ':' + parts[1],
        username: parts[2],
        password: parts[3],
      };
      console.log(proxy)


      const profile = `../profiles/${data.star.cpf}`;
      if (!fs.existsSync(profile)) {
        fs.mkdirSync(profile, {recursive: true});
      }

      const browser = await puppeteer.launch({
        defaultBrowserContext: 'default', // Use o contexto padrão do navegador

        userDataDir: profile,
        handleSIGINT: false,
        slowMo: 10,
        defaultViewport: null,
        headless: false,
        args: [

          '--proxy-server=http://geo.iproyal.com:12321',
          // '--proxy-server=http://' + proxy.ip_port,
          '--disable-notifications',
          '--enable-automation',
          '--start-maximized',
          '--disable-features=ClipboardAccess',
          '--disable-features=ClipboardContentSetting'
        ],
      });


      const page = await browser.newPage();


      // await page.authenticate({
      //   username: proxy.username,
      //   password: proxy.password,
      // });

      await page.authenticate({
        username: 'PSqAoBQrU9fCnfiX',
        password: 'Nuno1201_country-br',
      });

      try {
        // await page.goto('https://www.meuip.com.br', { timeout: 60000 });
        await page.goto(data.link.url, {timeout: 600000});


      } catch (error) {
        console.error('Erro ao carregar a página de login:', error);
        await browser.close();
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 10000));

      await page.type('#cpfnumber', data.star.cpf);
      await new Promise(resolve => setTimeout(resolve, 10000));

      const temTextoDadosContato = await page.evaluate(() => {
        return document.body.textContent.includes('CPF já cadastrado!');
      });

      if (temTextoDadosContato) {
        console.log('ja tem cadastro');
        await axios.delete('https://botbet.tec.br/api/bet/star/' + data.star.id)
        await browser.close();
        return;
      }

      await page.waitForSelector('#continueReg');
      await page.click('#continueReg');
      await new Promise(resolve => setTimeout(resolve, 10000));

      await page.type('#username', data.star.username.normalize('NFD').replace(/[\u0300-\u036f]/g, ""));
      await new Promise(resolve => setTimeout(resolve, 10000));
      await page.keyboard.press('Tab');
      await new Promise(resolve => setTimeout(resolve, 1000));
      await page.type('#email', data.email.email);
      await new Promise(resolve => setTimeout(resolve, 10000));
      await page.keyboard.press('Tab');
      await new Promise(resolve => setTimeout(resolve, 1000));
      await page.type('#password', data.star.password);
      await new Promise(resolve => setTimeout(resolve, 10000));
      await page.keyboard.press('Tab');
      await new Promise(resolve => setTimeout(resolve, 1000));
      await page.type('#confirmPassword', data.star.password);
      await new Promise(resolve => setTimeout(resolve, 10000));
      await page.keyboard.press('Tab');
      await new Promise(resolve => setTimeout(resolve, 1000));
      await page.type('#phone', data.star.phone);
      await page.keyboard.press('Tab');
      await new Promise(resolve => setTimeout(resolve, 1000));
      await page.click('#termsNcondition');
      await new Promise(resolve => setTimeout(resolve, 3000));
      await page.click('#continueReg');


      await new Promise(resolve => setTimeout(resolve, 40000));
      const registered = await page.evaluate(() => {
        return document.body.textContent.includes('Cadastro feito');
      });
      if (!registered) {
        return
      }
      await new Promise(resolve => setTimeout(resolve, 10000));
      await axios.put('https://botbet.tec.br/api/bet/star/' + data.star.id, {
        'created': true,
        'proxy': data.proxy.proxy,
        'email': data.email.email,
        'link_id': data.link.id,
        'correlation': null
      })
      await new Promise(resolve => setTimeout(resolve, 10000));
      return;
      await page.goto('https://estrelabet.com/pb/myaccount/cashier', {timeout: 60000});

      await new Promise(resolve => setTimeout(resolve, 10000));

      await page.click('.icon-new-deposit')


      await new Promise(resolve => setTimeout(resolve, 10000));
      await page.evaluate(() => {
        const input = document.querySelector('#depositAmount');
        // @ts-ignore
        input.value = '';
      });
      await new Promise(resolve => setTimeout(resolve, 3000));
      await page.type('#depositAmount', '10000');
      await new Promise(resolve => setTimeout(resolve, 10000));
      await page.click('#depositActionBtn');

      await new Promise(resolve => setTimeout(resolve, 10000));

      const buttons = await page.$$('button');
      for (const button of buttons) {

        const buttonText = await button.evaluate(node => node.textContent.trim());
        if (buttonText === 'Copie o código do código QR') {
          await button.click();

          await new Promise(resolve => setTimeout(resolve, 2000));

          const clipboardData = await page.evaluate(() => {

            return navigator.clipboard.readText();
          });

          const correlation = '649848qwe32d328'
          await axios.post('https://api.openpix.com.br/api/v1/payment', {
            'qrCode': clipboardData,
            'correlationID': correlation,
            'comment': 'Credito estrela bet',
          }, {
            'headers': {
              'accept': 'application/json',
              'content-type': 'application/json',
              'Authorization': 'Q2xpZW50X0lkXzFlOWI4YjAwLTExZjktNGMzYS1hZTZiLWQ0M2ViMjE0ZjQzNDpDbGllbnRfU2VjcmV0X0lSRkZPVGNFOGV3RlVhaDg4ak1VWU1qTGtabFBRRjdPWGNYSkhmYndRQkk9',
            },
          })

          await axios.put('https://botbet.tec.br/api/bet/star/' + data.star.id, {
            'created': true,
            'proxy': data.proxy.proxy,
            'email': data.email.email,
            'link_id': data.link.id,
            'correlation': correlation
          })


          console.log('Botão "Copiar" clicado.');
          break;
        }
      }


      await browser.close();
    } catch (error) {
      console.error('Erro ao executar o comando:', error);
    }
  }

  async countdown(minutes) {
    for (let i = minutes; i > 0; i--) {
      console.log(`Faltam ${i} minutos para uma nova  busca de CPF com status null`);
      console.log('____________________________________________________');
      await new Promise(resolve => setTimeout(resolve, 60000)); // Espera 1 minuto
    }
    console.log('Contagem regressiva concluída.');
  }

  async generateRandomString(length: number) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}
