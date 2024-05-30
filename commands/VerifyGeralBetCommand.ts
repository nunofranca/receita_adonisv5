import {BaseCommand} from '@adonisjs/core/build/standalone'
import puppeteer from "puppeteer";
import axios, {AxiosResponse} from "axios";


export default class VerifyGeralBetCommand extends BaseCommand {
    /**
     * Command name is used to run the command
     */
      public static commandName = 'verify:geral_bet_command'

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

      const browser = await puppeteer.launch({
        userDataDir: '../profiles/geralBet',
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
      await page.setJavaScriptEnabled(true);

      await page.goto('https://geralbet.com/signup', {timeout: 120000});
      await page.setViewport({width: 1080, height: 1024});
      await new Promise(resolve => setTimeout(resolve, 15000));

        for (let i = 1; i <= 9999999; i++) {
            console.log('INTERAÇÃO GERAL: ' + i)
            const url = 'https://consultaxservice.online/api/check/getBetTest/geral_bet';
            console.log(url)

            let check = await axios.get(url)

            if (!check.data) {
                console.log('Sem registro para verirficar')
                await this.countdown(10);

            }

            try {


                    const inputField = await page.$('#DOCUMENT_NUMBER');
                    if (!inputField) {
                        return
                    }
                    for (let i = 0; i < 11; i++) {
                        await inputField.press('Backspace');
                    }

                    await new Promise(resolve => setTimeout(resolve, 8000));
                    await page.type('#DOCUMENT_NUMBER', check.data.cpf)
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    await page.click('#EMAIL');
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    const documentContent = await page.evaluate(() => document.documentElement.outerHTML);

                    // Verifica se o texto está presente no documento
                    if (documentContent.includes("Já existe uma conta com essas credenciais.")) {
                        console.log(check.data.cpf + ' JÁ FOI CADASTRADO ANTERIORMENTE')
                        await axios.put('https://consultaxservice.online/api/check/updateBet/' + check.data.id, {
                            'status': 1,
                            'bet': 'Geral Bet',
                        })

                    } else {
                        console.log(check.data.cpf + ' TESTADO AGORA')
                        await axios.put('https://consultaxservice.online/api/check/updateBet/' + check.data.id, {
                            'status': 0,
                            'bet': 'Geral Bet',
                        })
                    }
                    await new Promise(resolve => setTimeout(resolve, 3000));

            } catch
                (error) {
                console.log(error)

            }
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

