import {BaseCommand} from '@adonisjs/core/build/standalone'

import axios, {AxiosResponse} from "axios";


export default class GetDateBirthCommand extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'get:date_birth_2_command'

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
  public url;

  public async run() {
    // let status = Math.random() < 0.5 ? null : true;

    try {

      this.url = 'https://consultaxservice.online/api/getRevenueDateBirthNull';

    } catch (error) {
      console.log('ERRO AO BUSCAR DADOS')
      return
    }

    try {
      this.check = await axios.get(this.url)
    } catch (error) {
      console.log(error.data)
    }


    // @ts-ignore
    if (Object.keys(this.check.data).length === 0) {
      console.log('Não há CPF para consulta');

      return;
    }


    for (const [index, check] of Object.entries(this.check.data)) {
      try {
        //token da conta hub@oprotagonistafsa.com.br
        // let urlHub = 'https://ws.hubdodesenvolvedor.com.br/v2/nome_cpf/?cpf=' + check.cpf + '&token=145564485DWLOolbAQZ262812264';

        //token da conta alberttojrfsa@gmail.com
        const urlHub = 'https://ws.hubdodesenvolvedor.com.br/v2/nome_cpf/?cpf=' + check.cpf + '&token=138617825auTMxPtNhD250270280';

        let checkHub = await axios.get(urlHub)
        if (!checkHub.data.status) {
          console.log(checkHub.data)
          console.log(`Iteração ${index}: CPF: -${check.cpf} Não encontrado`);
          if (checkHub.data.message != 'Token Inválido ou sem saldo para a consulta.') {
            await axios.delete(`https://consultaxservice.online/api/revenue/${check.id}`)
          }
          console.log('_____________________________________________________________________');

          continue
        }

        console.log(check.cpf + ' ECONTRADO PELO HUB DO DESENVOLVEDOR')
        console.log('CRÉDITOS CONSUMIDOS: ' + checkHub.data.consumed)

        const response = await axios.put(`https://consultaxservice.online/api/updateRevenueFromDateBirthNull/${check.id}`, {
          'dateBirth': checkHub.data.result.data_de_nascimento
        })
        // @ts-ignore
        console.log(`Iteração ${index}: Bem sucedida (BUSCA DA DATA DE NASCIMENTO)`);
        console.log('');
        console.log('DADOS TESTADOS');
        console.log(`CPF: ${response.data.cpf}`)
        console.log(`Nascimento: ${response.data.dateBirth}`)
        console.log('_____________________________________________________________________');

      } catch (error) {
        console.log('ERRO AO CONSULTAR HUB DO DESENVOLVEDOR')
        console.log(error.message)
      }

    }


  }

}
