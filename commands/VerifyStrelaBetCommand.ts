import {BaseCommand} from '@adonisjs/core/build/standalone'
import puppeteer from "puppeteer";
import axios, {AxiosResponse} from "axios";
import {th} from "@faker-js/faker";

export default class VerifyStrelaBetCommand extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'verify:strela_bet_command'

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
  public check: AxiosResponse<any, any>;

  public async run() {

    try {
      // const url = 'https://consultaxservice.online/api/bet/getByStatusNull/estrelaBet';
      //
      //
      // this.check = await axios.get(url)
      //
      // if (Object.keys(this.check.data).length === 0) {
      //   console.log('Não há CPF para consulta na Estrela Bet. Aguardando...');
      //   await new Promise(resolve => setTimeout(resolve, 600000));
      //   return;
      // }

      const browser = await puppeteer.launch({
        executablePath: '/usr/bin/google-chrome', // Caminho do executável do Chrome no WSL
        headless: false,
        args: [
          '--enable-automation',
          '--start-maximized',
          '--disable-extensions'
        ],
        slowMo: 10,

        // headless: false
      });
      const page = await browser.newPage();
      await page.setJavaScriptEnabled(true);

      await page.goto('https://www.playpix.com/pb/', {timeout: 120000});


      await page.setViewport({width: 1920, height: 1080});
      const cpfs = generateRandomNumbers(10)



      await new Promise(resolve => setTimeout(resolve, 10000));

      const buttons = await page.$$('button');

      for (const button of buttons) {


        // const buttonText = await button.evaluate(el => el.innerText.trim()); // Obtém o texto do botão
        const buttonText = await button.evaluate(el => el.classList.contains('register')); // Obtém o texto do botão

        if (buttonText && await button.isIntersectingViewport()) {
          console.log('existe o botao')
          button.click();
          break;
        }
      }

      await new Promise(resolve => setTimeout(resolve, 15000));

      await page.type('[name="email"]', 'alberttojrfsa@gmail.com')
      await new Promise(resolve => setTimeout(resolve, 3000));
      await page.type('[name="password"]', 'Nuno1201#')
      await new Promise(resolve => setTimeout(resolve, 3000));
      await page.type('[name="phoneNumber"]', '75997140438')
      await new Promise(resolve => setTimeout(resolve, 3000));
      await page.click('[title="Próximo"]')
      await new Promise(resolve => setTimeout(resolve, 10000));

      for (const cpf of cpfs){

        // @ts-ignore
        await page.type('[name="personal_id"]', cpf.toString())

        await new Promise(resolve => setTimeout(resolve, 10000));

        const name = await page.evaluate(() => {
          // @ts-ignore
          return document.querySelector<HTMLInputElement>('[name="first_name"]').value ?? null;
        });
        const last_name = await page.evaluate(() => {
          // @ts-ignore
          return document.querySelector<HTMLInputElement>('[name="last_name"]').value ?? null;
        });
        const birth_date = await page.evaluate(() => {
          // @ts-ignore
          return document.querySelector<HTMLInputElement>('[name="birth_date"]').value ?? null;
        });


        console.log('Valor do sobrenome:', name + ' ' + last_name);
        console.log('Valor do dn:', birth_date.replace(/\./g, '/'));
        await new Promise(resolve => setTimeout(resolve, 8000));

        if (birth_date) {
          await axios.post('https://checkbetano.com.br/api/data/', {
            name: name + ' ' + last_name,
            dateBirth: birth_date.replace(/\./g, '/')
          }, {
            headers: {
              'Content-Type': 'application/json'
            }
          })
        }
      }




    } catch (error) {
      console.log(error)
    }

    function generateRandomNumber() {
      // Gera um número aleatório de 11 dígitos
      return Math.floor(10000000000 + Math.random() * 90000000000);
    }

    function generateRandomNumbers(count) {
      const randomNumbers = [];
      for (let i = 0; i < count; i++) {
        randomNumbers.push(generateRandomNumber());
      }
      return randomNumbers;
    }

  }
}
