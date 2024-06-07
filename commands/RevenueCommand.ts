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

      const url = 'https://app-54786.dc-sp-1.absamcloud.com/api/data/revenue';
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
    console.log(this.check.data)
    for (const [index, check] of Object.entries(this.check.data)) {


      let browser;

      try {
        browser = await puppeteer.launch({
          userDataDir: '../profiles/revenueStatus',
          slowMo: 10,
          defaultViewport: null,
          headless: false
        });
      } catch (error) {
        browser = await puppeteer.launch({
          userDataDir: '../profiles/revenueStatu2',
          slowMo: 10,
          defaultViewport: null,
          headless: false
        });
      }

      const page = await browser.newPage();

      await page.goto('https://servicos.receita.fazenda.gov.br/Servicos/CPF/ConsultaSituacao/ConsultaPublica.asp', {timeout: 120000});
      await page.setViewport({width: 1080, height: 1024});


      await page.waitForSelector('input[name="txtCPF"]', {timeout: 0});
      await page.waitForSelector('input[name="txtDataNascimento"]', {timeout: 0});


      // @ts-ignore
      await page.type('input[name="txtCPF"]', check.cpf);
      // @ts-ignore
      await page.type('input[name="txtDataNascimento"]', await this.formatDate(check.dateBirth));

      await new Promise(resolve => setTimeout(resolve, 2000));

      await page.click('#hcaptcha');

      await new Promise(resolve => setTimeout(resolve, 2000));

      await page.click('#id_submit');

      await new Promise(resolve => setTimeout(resolve, 2000));


      const conteudoDaPagina = await page.content();

// Exemplo de verificação pelo conteúdo da página
      if (conteudoDaPagina.includes('Data de nascimento informada') || conteudoDaPagina.includes('CPF não encontrado na base')) {
        try {


          console.log('Data de nascimento divergente ou nao encontrado na base');
          await axios.delete(`https://app-54786.dc-sp-1.absamcloud.com/api/data/${check.id}`)
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

        console.log(valores[0], valores[1], valores[3])
        // @ts-ignore

        try {
          const response = await axios.put(`https://app-54786.dc-sp-1.absamcloud.com/api/data/${check.id}`, {
            'revenue': valores[3] == 'REGULAR',

          })
          // @ts-ignore
          console.log(`Iteração ${index}: Bem sucedida (BUSCA DO STATUS NA RECEITA)`);
          console.log('');
          console.log('DADOS TESTADOS');
          console.log('CPF: ' + response.data.cpf)
          console.log('Nome: ' + response.data.name)
          console.log('DN: ' + response.data.dateBirth)
          console.log('Status: ' + response.data.status)
          console.log('');
          if (response.data.upload) {
            console.log('DADOS DO USUÁRIO');
            console.log(`Nome: ${response.data.upload.user.name}`);
            console.log(`Crédito: ${response.data.upload.user.credit}`);
            console.log('');
            console.log('DADOS DO UPLOAD');
            console.log(`Nome: ${response.data.upload.name}`);
            console.log(`Tipo de pagamento: ${response.data.upload.typePayment}`);
            console.log(`Casa de teste: ${response.data.upload.homeBet}`);
          }
          console.log('---------------------------------------------------------')
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

  async formatDate(dateString) {
    let [day, month, year] = dateString.split('/');
    day = day.padStart(2, '0');
    month = month.padStart(2, '0');
    return `${day}/${month}/${year}`;
  }
}
