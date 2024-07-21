import {BaseCommand} from '@adonisjs/core/build/standalone'
import puppeteer from "puppeteer";
import axios from "axios";

export default class TestPixLinker extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'test:pix_linker_apix'

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
      await page.goto('https://ib.contasimples.com/login');
      await page.type('#email', 'alberttojrfsa@gmail.com');
      await new Promise(resolve => setTimeout(resolve, 2000));
      await page.type('#password', '120112');
      await new Promise(resolve => setTimeout(resolve, 2000));
      const buttonsNext = await page.$$('button');
      for (const next of buttonsNext) {
        const buttonText = await next.evaluate(node => node.textContent.trim());
        if (buttonText === 'Entrar') {
          await next.click();
          break;
        }
      }

      await new Promise(resolve => setTimeout(resolve, 40000));

      await page.click('[href="/cliente/pix"]');
      await new Promise(resolve => setTimeout(resolve, 10000));
      await page.click('[href="/cliente/pix/transferencia-pix"]');
      await new Promise(resolve => setTimeout(resolve, 10000));
      const spans = await page.$$('span');
      for (const span of spans) {
        try {
          const buttonText = await span.evaluate(node => node.textContent.trim());
          if (buttonText === 'Novo Contato') {
            await span.click();
            break;
          }
        } catch (error) {
          console.error('Erro ao avaliar ou clicar no elemento:', error);
        }
      }

      await new Promise(resolve => setTimeout(resolve, 10000));



      let yes = 0;
      let no = 0




      console.log('_________________________________________')
      console.log()
      console.log('Fazendo buscas de CPF')
      console.log()
      console.log('_________________________________________')

      const url = 'https://www.checkbetano.com.br/api/data/pix';


      this.check = await axios.get(url);
      let comPix = 0;
      let semPix = 0

      for (const [index, check] of Object.entries(this.check.data)) {
        let cpf = check.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

        await page.type('[placeholder="Digite a chave que você deseja cadastrar"]', cpf);
        await new Promise(resolve => setTimeout(resolve, 7000));
        const semPix = await page.evaluate(() => {
          return document.body.textContent.includes('Chave não encontrada');
        });
        const comPix = await page.evaluate(() => {
          return document.body.textContent.includes('Chave encontrada');
        });

        if (comPix) {
          console.log('___________________________________________________________');
          console.log('Com PIX.');
          console.log(cpf)
          await this.updateCheck(check.id, 0)
          yes +=1
          console.log('COM PIX ' + yes)
          console.log('___________________________________________________________');

        }
        if (semPix) {
          console.log('___________________________________________________________');
          console.log('Sem PIX.');
          console.log(cpf)
          no +=1
          console.log('SEM PIX ' + no)
          console.log('___________________________________________________________');
          //await this.updateCheck(check.id, 1)
        }
        await page.$eval('[placeholder="Digite a chave que você deseja cadastrar"]', input => {
          input.value = '';
        });

        await new Promise(resolve => setTimeout(resolve, 45000));
      }

    } catch (error) {
      console.error('Erro ao executar o script:', error);
    } finally {
      await browser.close();
    }
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
