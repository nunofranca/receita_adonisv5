import {BaseCommand} from '@adonisjs/core/build/standalone'
import puppeteer from "puppeteer";
import axios from "axios";

export default class TestPixLinker extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'test:pix_linker'

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

  protected check;

  public async run() {


    const browser = await puppeteer.launch({
      userDataDir: '../profiles/pixLinker',
      handleSIGINT: false,
      slowMo: 10,
      defaultViewport: null,
      headless: false,

      args: [
        '--enable-automation',
        // '--start-maximized',
        '--disable-extensions'
      ],
    });
    const page = await browser.newPage();

    await browser.waitForTarget(() => true);


    try {
      await page.goto('https://www.gerarpix.com.br/',);
    } catch (error) {
      console.error('Erro ao carregar a página de login:', error);
    }


     await new Promise(resolve => setTimeout(resolve, 5000));


    for (let consults = 0; consults <= 2000; consults++) {



      console.log('_________________________________________')
      console.log()
      console.log('Fazendo buscas de CPF')
      console.log()
      console.log('_________________________________________')

      const url = 'https://www.checkbetano.com.br/api/data/pix';


      this.check = await axios.get(url);



      if (Object.keys(this.check.data).length === 0) {
        console.log('Não há CPF para consulta');

        continue
      }

      for (const [index, check] of Object.entries(this.check.data)) {

        page.select('#key_type', 'cpf')
    
    }


    await new Promise(resolve => setTimeout(resolve, 200000000000));
  }

  async updateCheck(id, pix){
    try {
      await fetch('https://www.checkbetano.com.br/api/data/' + id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({pix: pix})
      });
    }catch (error){
      console.log('ERRO AO FAZER UPDATE DO CHECK' + error)

    }

  }
}
