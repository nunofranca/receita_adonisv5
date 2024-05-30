import { BaseCommand } from '@adonisjs/core/build/standalone'
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

    try{
      const url = 'https://consultaxservice.online/api/bet/getByStatusNull/estrelaBet';


      this.check = await axios.get(url)

      if (Object.keys(this.check.data).length === 0) {
        console.log('Não há CPF para consulta na Estrela Bet. Aguardando...');
        await new Promise(resolve => setTimeout(resolve, 600000));
        return;
      }

      const browser = await puppeteer.launch({
        executablePath: '/usr/bin/google-chrome', // Caminho do executável do Chrome no WSL
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

      await page.goto('https://estrelabet.com/pb#/overview', {timeout: 120000});


      await page.setViewport({width: 1920, height: 1080});


      await new Promise(resolve => setTimeout(resolve, 5000));

      const buttons = await page.$$('button');

        for (const button of buttons) {


          const buttonText = await button.evaluate(el => el.innerText.trim()); // Obtém o texto do botão

          if (buttonText === 'Cadastro' && await button.isIntersectingViewport()) {

           button.click();
            break;
          }
        }


      await new Promise(resolve => setTimeout(resolve, 5000));

      await page.type('#cpfnumber', this.check.data.cpf)
      await new Promise(resolve => setTimeout(resolve, 15000));
      const errorMessage = await page.$('.form-field--error-msg');
      if (errorMessage) {
        const errorText = await errorMessage.evaluate((el: Element) => (el as HTMLElement).innerText.trim()) as string;
        if (errorText === 'CPF já cadastrado!') {
          console.log(`CPF ${this.check.data.cpf} ${errorText}`);
          console.log('-------------------------------------------------------');
          await axios.put('https://consultaxservice.online/api/bet/' + this.check.data.id, {
            status: 1
          }, {
            headers: {
              'Content-Type': 'application/json'
            }
          })
        }else{
          console.log(`CPF ${this.check.data.cpf} ${errorText}`);
          console.log('-------------------------------------------------------');
        }
      }else {
        console.log(`CPF ${this.check.data.cpf} NÃO ESTÁ CADASTRADO NO ESPRELA BET`);
        console.log('-------------------------------------------------------');
        await axios.put('https://consultaxservice.online/api/bet/' + this.check.data.id, {
          status: 0
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
      }
      await browser.close();
    }catch (error){
      console.log(error)
    }

  }
}
