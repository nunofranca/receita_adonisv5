import {BaseCommand} from '@adonisjs/core/build/standalone'
import puppeteer from "puppeteer-extra";
import axios from "axios";
import {th} from "@faker-js/faker";

export default class GenerateData extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'generate:data'

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

    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch({
      env: {
        display : "10.0"
      },

      ignoreHTTPSErrors: true,
      // userDataDir: '../profiles/dateBirth',
      executablePath: '/usr/bin/microsoft-edge',
      //executablePath: '/usr/bin/chromium-browser',
      slowMo: 10,
      defaultViewport: null,
      headless: true,
      ignoreDefaultArgs: ["--disable-extensions"],
      args: [
        // '--proxy-server=http://geo.iproyal.com:12321',
        '--lang=pt-BR', //
        '--start-minimized',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080',
        '--disable-features=IsolateOrigins,site-per-process',
        // '--user-data-dir=../profiles/dateBirth'
      ],
    });
    const page = await browser.newPage();
    // await page.authenticate({
    //   username: 'PSqAoBQrU9fCnfiX',
    //   password: 'Nuno1201_country-br_session-jTAgxCw3_lifetime-24h'
    // })

    // Navigate the page to a URL
    await page.goto('https://estrelabet.com/register', {
      waitUntil: 'networkidle0'
    });

    let total = 0

    for (let i = 0; i < 20000; i++) {
      if (i === 19999){
        console.log('Ultimo loop')
      }

      const cpf = await this.generateRandomCPF()
      if (!cpf) {
        continue
      }


      const cpfNumber = '#cpfnumber'
      await page.locator(cpfNumber).wait();
      await page.locator(cpfNumber).fill(String(cpf));

      await new Promise(resolve => setTimeout(resolve, 5000));

      const text = await page.evaluate(() => {
        const element = document.querySelector('.form-field--error-msg');
        return element ? element.innerText : null;
      });
      if (text) {
        continue;
      }

      const response = await axios.get('https://api.netrin.com.br/v1/consulta-composta?token=60b26d39-b51b-4fd4-8019-87e73aad6b37&s=receita-federal-cpf-data-nascimento&cpf=' + cpf)
      console.log(response.status)
      if (response.data.CpfBirthdate.idade > 54 || response.data.CpfBirthdate.idade < 35) {
        continue
      }
      total++
      console.log('Total aproveitado: ' + total)

     axios.post('https://app-54786.dc-sp-1.absamcloud.com/api/data', {
        cpf: cpf,
        name: response.data.CpfBirthdate.nome,
        dateBirth: response.data.CpfBirthdate.dataNascimento,
        user_id: 1
      })

    }
    console.log('Cliclo finalizado')
    await browser.close();

  }

  async generateRandomCPF() {
    let cpf = '';
    for (let i = 0; i < 11; i++) {
      cpf += Math.floor(Math.random() * 10);
    }
    return await this.isValidCPF(cpf);
  }

  async isValidCPF(cpf) {
    let Soma = 0
    let Resto

    let strCPF = String(cpf).replace(/[^\d]/g, '')

    if (strCPF.length !== 11)
      return false

    if ([
      '00000000000',
      '11111111111',
      '22222222222',
      '33333333333',
      '44444444444',
      '55555555555',
      '66666666666',
      '77777777777',
      '88888888888',
      '99999999999',
    ].indexOf(strCPF) !== -1)
      return false

    for (let i = 1; i <= 9; i++)
      Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i);

    Resto = (Soma * 10) % 11

    if ((Resto == 10) || (Resto == 11))
      Resto = 0

    if (Resto != parseInt(strCPF.substring(9, 10)))
      return false

    Soma = 0

    for (let i = 1; i <= 10; i++)
      Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i)

    Resto = (Soma * 10) % 11

    if ((Resto == 10) || (Resto == 11))
      Resto = 0

    if (Resto != parseInt(strCPF.substring(10, 11)))
      return false

    return cpf
  }


}
