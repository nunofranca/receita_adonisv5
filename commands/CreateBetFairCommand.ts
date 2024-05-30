import {BaseCommand} from '@adonisjs/core/build/standalone'
import puppeteer, {Page} from "puppeteer";
import axios from "axios";
import useProxy from "@lem0-packages/puppeteer-page-proxy";


import * as fs from "fs";

export default class TestPixSimple extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'test:create_bet_fair'

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
    const devices = [
      {
        name: 'Desktop 1080p',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
        viewport: {
          width: 1920,
          height: 1080,
          deviceScaleFactor: 1,
        },
      },
      {
        name: 'Desktop 720p',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
        viewport: {
          width: 1280,
          height: 720,
          deviceScaleFactor: 1,
        },
      },
      {
        name: 'Laptop with HiDPI screen',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
        viewport: {
          width: 1440,
          height: 900,
          deviceScaleFactor: 2,
        },
      },
      {
        name: 'iPad',
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15A5370a Safari/604.1',
        viewport: {
          width: 768,
          height: 1024,
          deviceScaleFactor: 2,
          isMobile: true,
          hasTouch: true,
        },
      },
      {
        name: 'iPhone 12',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15A5370a Safari/604.1',
        viewport: {
          width: 768,
          height: 1024,
          deviceScaleFactor: 3,
          isMobile: true,
          hasTouch: true,
        },
      }
    ];


    try {
      const response = await axios.get('https://botbet.tec.br/api/bet/betfair');

      const data = response.data;

      const parts = data.proxy.proxy.split(':')
      const proxy = {
        ip_port: parts[0] + ':' + parts[1],
        username: parts[2],
        password: parts[3],
      };
      const numDevices = devices.length;


      const deviceIndex = Math.floor(Math.random() * numDevices);
      const device = devices[deviceIndex];




      const profile = `../profiles/${data.betfair.cpf}`;
      if (!fs.existsSync(profile)) {
        fs.mkdirSync(profile, {recursive: true});
      }

      const browser = await puppeteer.launch({
        userDataDir: profile,
        handleSIGINT: false,
        slowMo: 10,
        defaultViewport: null,
        headless: false,
        args: [
          '--proxy-server=http://geo.iproyal.com:12321',

          '--enable-automation',
          '--start-maximized',
        ],
      });


      const page = await browser.newPage();
      await page.setUserAgent(device.userAgent);
      await page.setViewport(device.viewport);
      console.log(`Simulando: ${device.name}`);

      // await page.authenticate({
      //   username: proxy.username,
      //   password: proxy.password,
      // });
      await page.authenticate({
        username: 'PSqAoBQrU9fCnfiX',
        password: 'tOzvHAQurOZIf2a3_country-br',
      });

      try {
        await page.goto(data.link.url, {timeout: 180000});
        await page.goto('https://register.betfair.com/account/registration?prod=90&promotionCode=ZBI208&returnURL=https://promos.betfair.com/promotion?promoCode=acqzbi208brp2', {timeout: 180000});
        // await page.goto('https://meuip.com', {timeout: 180000});
        await new Promise(resolve => setTimeout(resolve, 15000));

      } catch (error) {
        console.error('Erro ao carregar a página de login:', error);
        await browser.close();
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 10000));
      // Verifica se o elemento com o seletor '#onetrust-accept-btn-handler' existe
      const acceptButton = await page.$('#onetrust-accept-btn-handler');

      // Se o elemento existir, clica nele
      if (acceptButton) {
        await acceptButton.click();
        console.log('Clicou no botão de aceitar cookies');
      } else {
        console.log('O botão de aceitar cookies não foi encontrado');
      }

      await new Promise(resolve => setTimeout(resolve, 10000));




      await new Promise(resolve => setTimeout(resolve, 10000));
      await page.type('#firstName', data.betfair.first_name.normalize('NFD').replace(/[\u0300-\u036f]/g, ""));
      await new Promise(resolve => setTimeout(resolve, 10000));
      await page.type('#lastName', data.betfair.last_name.normalize('NFD').replace(/[\u0300-\u036f]/g, ""));
      await new Promise(resolve => setTimeout(resolve, 10000));
      await page.type('#dateOfBirth_year', data.betfair.dateBirth);
      await new Promise(resolve => setTimeout(resolve, 10000));
      await page.type('#brazilNationalIdentifier', data.betfair.cpf);
      await new Promise(resolve => setTimeout(resolve, 10000));
      await page.type('#postCode', data.betfair.zipCode);
      await new Promise(resolve => setTimeout(resolve, 10000));
      await page.type('#address1', data.betfair.street.replace(/[\u0300-\u036f]/g, ""));
      await new Promise(resolve => setTimeout(resolve, 10000));
      await page.type('#town', data.betfair.city.normalize('NFD').replace(/[\u0300-\u036f]/g, ""));
      await new Promise(resolve => setTimeout(resolve, 10000));
      const selectRandomOption = async (page: Page, selectId: string) => {
        const options = await page.$$eval(`#${selectId} option`, options => options.map(option => option.value));
        const randomOption = options[Math.floor(Math.random() * options.length)];
        await page.select(`#${selectId}`, randomOption);

      };

      await selectRandomOption(page, 'province');

      await new Promise(resolve => setTimeout(resolve, 10000));
      await page.type('#phoneNumber', data.betfair.phone);
      await new Promise(resolve => setTimeout(resolve, 10000));
      await page.type('#email', data.email.email);
      await new Promise(resolve => setTimeout(resolve, 10000));
      await page.type('#password', data.betfair.password);
      await page.keyboard.press('Tab');

      await page.keyboard.press('Tab');
      await new Promise(resolve => setTimeout(resolve, 10000));

      await page.type('#securityAnswer', data.betfair.ask.normalize('NFD').replace(/[\u0300-\u036f]/g, ""));
      await page.keyboard.press('Tab');
      await new Promise(resolve => setTimeout(resolve, 10000));
      await page.click('[data-qa-selector="joinButton"]');
      await new Promise(resolve => setTimeout(resolve, 5000));
      await page.evaluate(() => {
        const link = document.querySelector('a[data-dispatch="CLOSE_CARD_PAGE_JOIN_NOW"]');
        link.click();

      });
      await new Promise(resolve => setTimeout(resolve, 10000));
      await axios.put('https://botbet.tec.br/api/bet/betfair/' + data.betfair.id, {
        'created': true,
        'proxy': data.proxy.proxy,
        'email': data.email.email,
        'link_id': data.link.id
      })
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
}
