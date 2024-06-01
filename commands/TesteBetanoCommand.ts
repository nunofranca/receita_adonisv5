import { BaseCommand } from '@adonisjs/core/build/standalone'
import axios from "axios";
import puppeteer from "puppeteer-extra";

export default class TesteBetanoCommand extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'test:betano'

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

    const apiUrls = [
      'https://app-54674.dc-sp-1.absamcloud.com',
      'https://app-54653.dc-us-1.absamcloud.com'
    ];
    function getRandomUrl(urls) {
      const randomIndex = Math.floor(Math.random() * urls.length);

      return urls[randomIndex];
    }

    let url = getRandomUrl(apiUrls)
    const dataReq = await axios.get(url + '/api/data');
    const data = dataReq.data;
   browser = await puppeteer.launch({
      // env: {
      //   DISPLAY: ":10.0"
      // },
      // userDataDir: '../profiles/dateBirth',
      executablePath: '/usr/bin/microsoft-edge',
      //executablePath: '/usr/bin/chromium-browser',
      slowMo: 10,
      defaultViewport: null,
      headless: false,
      ignoreDefaultArgs: ["--disable-extensions"],

      args: [

        // '--proxy-server=http://ipv6-ww.lightningproxies.net:10000',
        '--start-maximized',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080',
      ],
    });

    const page = await browser.newPage();
    await page.goto('https://brbetano.com/register', {timeout: 180000});

    await new Promise(resolve => setTimeout(resolve, 5000));
    await page.evaluate(() => {
      // @ts-ignore
      const registerEmail = Array.from(document.querySelectorAll('span'));
      // @ts-ignore
      const next = registerEmail.find(span => span.textContent.trim() === 'Registrar com email');
      if (next) {
        // @ts-ignore
        next.click();
      } else {
        console.error('Botão "Continue" não encontrado.');
      }
    });
    await new Promise(resolve => setTimeout(resolve, 5000));
    await page.type('#tax-number', data.cpf);
    await new Promise(resolve => setTimeout(resolve, 5000));
    const textoExistente1 = await page.evaluate(() => {
      // @ts-ignore
      return document.body.innerText.includes('Este CPF já existe');
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log(textoExistente1)

    if (textoExistente1) {
      console.log('caiu aqui')
      await axios.delete(url + '/api/data/' + data.id)
      console.log(data.cpf + 'Já tem cadastro e foi deletado')
      await browser.close()
    }

  }
}
