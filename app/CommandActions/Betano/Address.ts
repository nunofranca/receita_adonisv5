import axios from "axios";
import ButtonNextBetano from "./ButtonNextBetano";
import RandomClick from "../../../RandonClick";

const Address = async (page, cep, phone) =>{

  console.log('Entrou no Componente de Address')
  console.log(cep.cep)

  await new Promise(resolve => setTimeout(resolve, 20000));
  console.log('Fez a requisição para pegar o proxy')
  const addressReq = await axios.get('https://viacep.com.br/ws/' + cep.cep + '/json/');
  console.log('Fez a requisição no VIACEP')
  const addressApi = addressReq.data
  console.log(addressApi)

  await new Promise(resolve => setTimeout(resolve, 10000));

  try {
    for (let i = 0; i < 5; i++) { // Realiza 5 movimentos e cliques aleatórios
      const x = await  RandomClick(0, 1800); // Coordenada X aleatória dentro do viewport
      const y =  RandomClick(0, 850);  // Coordenada Y aleatória dentro do viewport
      await page.mouse.move(await x, await y);
      await page.mouse.click(await x, await y);
      // Espera aleatória entre 500ms e 2500ms
    }
    await page.waitForSelector('#street', {visible: true});
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.type("#street", addressApi.logradouro.replace(/[^a-zA-Z0-9 ]/g, ''))
    console.log('Adicionou o nome da rua: ' + addressApi.logradouro.replace(/[^a-zA-Z0-9 ]/g, ''))
    await new Promise(resolve => setTimeout(resolve, 2000));
    for (let i = 0; i < 5; i++) { // Realiza 5 movimentos e cliques aleatórios
      const x = await  RandomClick(0, 214); // Coordenada X aleatória dentro do viewport
      const y =  await RandomClick(0, 2050);  // Coordenada Y aleatória dentro do viewport
      await page.mouse.move(await x, await y);
      await page.mouse.click(await x, await y);

    }
    await page.waitForSelector('#city', {visible: true});
    await page.type("#city", addressApi.localidade.replace(/[^a-zA-Z0-9 ]/g, ''))
    console.log('Adicionou a cidade: ' + addressApi.localidade.replace(/[^a-zA-Z0-9 ]/g, ''))

    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.waitForSelector('#postalcode', {visible: true});
    await page.type("#postalcode", addressApi.cep)
    console.log('Adicionou o CEP: ' + addressApi.cep)
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.waitForSelector('#mobilePhone', {visible: true});
    await page.type("#mobilePhone", phone)

    console.log('Adicionou o Telefone: ' + phone)
  } catch (error) {
    console.log(error)
  }



  return addressApi

}
export default Address
