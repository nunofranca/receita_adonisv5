import {BaseCommand} from '@adonisjs/core/build/standalone'
import puppeteer from "puppeteer";
import axios, {AxiosResponse} from "axios";

export default class RevenueCommand extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'revenue:command'

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

      const url = 'https://checkbetano.com.br/api/data/revenue';
      console.log(url)

      this.check = await axios.get(url)
    } catch (error) {
      console.log('ERRO AO BUSCAR DADOS')
      return
    }
    // @ts-ignore
    if (Object.keys(this.check.data).length === 0) {
      console.log('Sem registro para verirficar')
      await this.countdown(10);

    }

    for (const [index, check] of Object.entries(this.check.data)) {
      console.log(check)


      let browser;

      browser =  await puppeteer.launch({

        // userDataDir: '../profiles/dateBirth',
       // executablePath: '/usr/bin/microsoft-edge',
        //executablePath: '/usr/bin/chromium-browser',
        slowMo: 10,
        defaultViewport: null,
        headless: true,

        ignoreDefaultArgs: ["--disable-extensions"],
        args: [
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

      await page.goto('https://servicos.receita.fazenda.gov.br/Servicos/CPF/ConsultaSituacao/ConsultaPublica.asp', {timeout: 120000});
      await page.setViewport({width: 1080, height: 1024});


      await page.waitForSelector('input[name="txtCPF"]', {timeout: 0});
      await page.waitForSelector('input[name="txtDataNascimento"]', {timeout: 0});


      // @ts-ignore
      await page.type('input[name="txtCPF"]', await this.formatCPF(check.cpf));
      // @ts-ignore
      await page.type('input[name="txtDataNascimento"]', await this.formatDate(check.dateBirth));

      await new Promise(resolve => setTimeout(resolve, 3000));

      await page.click('#hcaptcha');

      await new Promise(resolve => setTimeout(resolve, 3000));

      await page.click('#id_submit');

      await new Promise(resolve => setTimeout(resolve, 2000));


      const conteudoDaPagina = await page.content();

// Exemplo de verificação pelo conteúdo da página
      if (conteudoDaPagina.includes('Data de nascimento informada') || conteudoDaPagina.includes('CPF não encontrado na base')) {
        try {


          console.log('Data de nascimento divergente ou nao encontrado na base');
          // await axios.delete(`https://app-54786.dc-sp-1.absamcloud.com/api/data/${check.id}`)
          await axios.put(`https://checkbetano.com.br/api/data/${check.id}`, {
            'dateBirth': null,
            'name': null,

          })
          await browser.close();

        } catch (error) {
          console.log('ERRO AO DELETAR')
          return
        }


      } else if (conteudoDaPagina.includes('CPF incorreto.')) {
        console.log('Erro no cpf');

      } else {

        // @ts-ignore
        const valores = await page.$$eval('.clConteudoEsquerda b', spans => spans.map(span => span.textContent.trim()));
        await new Promise(resolve => setTimeout(resolve, 1000));
        await browser.close();

        if (!valores[0] || !valores[1] || !valores[3]) {

          console.log('Valores indefinidos')
          console.log('Valores indefinidos')
          return
        }

        console.log(valores[0] + ' - ' + valores[1] + ' - ' + valores[3])
        console.log(valores[3] == 'REGULAR')
        console.log(await this.formatCPF(check.cpf))
        console.log(await this.formatDate(check.dateBirth))
        console.log()
        console.log('***********************************************************')
        // @ts-ignore

        try {
          // @ts-ignore
          const response = await axios.put(`https://checkbetano.com.br/api/data/${check.id}`, {
            'revenue': valores[3] == 'REGULAR',
            'cpf': await this.formatCPF(check.cpf),
            'dateBirth': await this.formatDate(check.dateBirth),

          })


        } catch (error) {
          console.log(error)
        }

      }

    }

  }

  // async formatDateBirth(data) {
  //   const partes = data.split('-');
  //   return `${partes[2]}/${partes[1]}/${partes[0]}`;
  // }

  async countdown(minutes) {
    for (let i = minutes; i > 0; i--) {
      console.log(`Faltam ${i} minutos para uma nova  busca de CPF com status null`);
      console.log('____________________________________________________');
      await new Promise(resolve => setTimeout(resolve, 60000)); // Espera 1 minuto
    }
    console.log('Contagem regressiva concluída.');
  }

  async formatCPF(cpfString) {
    // Remove qualquer caractere que não seja número
    let cpf = cpfString.replace(/\D/g, '');

    // Adiciona zeros à esquerda, se necessário, para garantir que tenha 11 dígitos

    return cpf.padStart(11, '0');
  }

  async formatDate(dateString) {
    let [day, month, year] = dateString.split('/');
    day = day.padStart(2, '0');
    month = month.padStart(2, '0');
    return `${day}/${month}/${year}`;
  }
}
