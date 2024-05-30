import { BaseCommand } from '@adonisjs/core/build/standalone'
import puppeteer from "puppeteer";
import axios from "axios";

export default class TestPixSimple extends BaseCommand {
  /**
   * Command name is used to run the command
   */
    public static commandName = 'test:pix_simple'

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
      userDataDir: '../profiles/pixSimple',
      handleSIGINT: false,
      slowMo: 10,
      defaultViewport: null,
      headless: false,

      args: [
        '--enable-automation',
        // '--start-maximized',
       // '--disable-extensions'
      ],
    });
    const page = await browser.newPage();



    await browser.waitForTarget(() => true);


    try {
      await page.goto('https://app.cora.com.br', );
    } catch (error) {
      console.error('Erro ao carregar a página de login:', error);
    }


    await new Promise(resolve => setTimeout(resolve, 40000));

    try {
      await page.goto('https://app.cora.com.br/transferencia/contato/nova-chave');
    } catch (error) {
      console.error('Erro ao carregar a página de dashboard já logado:', error);
    }



    await new Promise(resolve => setTimeout(resolve, 300000));



    let comPix = 0;
    let semPix = 0
    let stop = 0
    let listNotPix = [];


    for(let consults = 0; consults <=2000; consults++){

      console.log('_________________________________________')
      console.log()
      console.log('Fazendo buscas de CPF')
      console.log()
      console.log('_________________________________________')

      let status = Math.random() < 0.5 ? true : true;

      // let status = Math.random() < 0.5 ? null : true;
     let url = 'https://consultaxservice.online/api/check/getByPixNull/5/';

      if (status !== null) {
        url += status;
      }


      this.check = await axios.get(url)

      if (Object.keys(this.check.data).length === 0) {
        console.log('Não há CPF para consulta');

        continue;
      }

      for (const [index, check] of Object.entries(this.check.data)) {
        if (stop == 5) {
          listNotPix = [];
          let time = 0
          console.log('')
          console.log('PAUSADO POR FALHA NA COMUNICAÇÃO DO LINKER')
          console.log('Total de CPFs na lista: ' + listNotPix.length)
          while (time <= 120) {
            try {
              await page.goto('https://ib.linker.com.br/pix/transfer/new/with-key');
            } catch (error) {
              await new Promise(resolve => setTimeout(resolve, 2000));
              await page.goto('https://ib.linker.com.br/pix/transfer/new/with-key');
            }

            time += 1
            await new Promise(resolve => setTimeout(resolve, 60000));
            console.log('Tempo restante para voltar: ' + Math.ceil(120 - time) + ' minutos');
            console.log('_________________________________________')

          }
          time = 0
          stop = 0
        }


        let input = true;
        while (input) {
          try {
            await new Promise(resolve => setTimeout(resolve, 5000));
            // Clica no botão com o texto "Chave CPF"
            const sapans = await page.$$('span');
            for (const span of spans) {

              const spanPix = await span.evaluate(node => node.textContent.trim());
              if (spanPix === 'Pix') {
                await span.click();
                break;
              }
            }
            await new Promise(resolve => setTimeout(resolve, 200000));
            await page.waitForSelector('input', {timeout: 3000}); // Espera até que um elemento de entrada seja encontrado na página dentro de 5 segundos
            await page.type('input', check.cpf); // Digita o valor do CPF no elemento de entrada
            input = false

          } catch (error) {
            console.log('INTERAÇÃO: ' + index)
            console.log('STATUS: INPUT NÃO ENCONTRADO')
            console.log('CPF: ' + check.cpf)
            console.log('___________________________________________________')
            await page.goto('https://ib.linker.com.br/pix/transfer/new/with-key');

          }
        }


        await new Promise(resolve => setTimeout(resolve, 2000));

        const buttonsNext = await page.$$('button');
        for (const next of buttonsNext) {

          const buttonText = await next.evaluate(node => node.textContent.trim());
          if (buttonText === 'Continuar') {

            await next.click();
            break;
          }
        }

        await new Promise(resolve => setTimeout(resolve, 5000));



        const temTextoDadosContato = await page.evaluate(() => {

          // @ts-ignore
          return document.body.textContent.includes('Dados do contato');
        });


        if (temTextoDadosContato) {

          await fetch('https://consultaxservice.online/api/check/' + check.id, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({pix: 1})
          });

          while (listNotPix.length > 0) {
            const id = listNotPix.shift();

            await fetch('https://consultaxservice.online/api/check/' + id, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({pix: 0})
            });
            semPix += 1;
          }
          comPix += 1;
          stop = 0

        } else {
          console.log('INTERAÇÃO: ' + index)
          console.log('CPF: ' + check.cpf + ' adicionado a lista de pissíveis pix')
          console.log('___________________________________________________')
          listNotPix.push(check.id)

          stop += 1


        }

        let reload = true
        while (reload) {
          try {
            console.log('')
            console.log('RESUMO DE CONSULTAS')
            console.log('COM PIX: ' + comPix)
            console.log('SEM PIX: ' + semPix)
            console.log('___________________________________________________')
            console.log('')
            await page.goto('https://ib.linker.com.br/pix/transfer/new/with-key');
            reload = false

          } catch (error) {
            console.log('Erro ao atualizar ')
          }
        }
      }
    }



    await new Promise(resolve => setTimeout(resolve, 200000000000));
  }
}
