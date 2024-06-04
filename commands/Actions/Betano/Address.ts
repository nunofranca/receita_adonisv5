import axios from "axios";
import ButtonNextBetano from "./ButtonNextBetano";

const Address = async (page, address, url) =>{
  await new Promise(resolve => setTimeout(resolve, 20000));
  const addressProxy = await axios.get(url + '/api/cep/' + proxy.slug);
  console.log('Fez a requisição para pegar o proxy')
  const addressReq = await axios.get('https://viacep.com.br/ws/' + addressProxy.data.cep + '/json/');
  console.log('Fez a requisição no VIACEP')
  await new Promise(resolve => setTimeout(resolve, 20000));
  const addressApi = addressReq.data
  console.log(addressApi)

  try {
    await page.waitForSelector('#street', {visible: true});
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.type("#street", addressApi.logradouro.replace(/[^a-zA-Z0-9 ]/g, ''))
    console.log('Adicionou o nome da rua: ' + addressApi.logradouro.replace(/[^a-zA-Z0-9 ]/g, ''))
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.waitForSelector('#city', {visible: true});
    await page.type("#city", addressApi.localidade.replace(/[^a-zA-Z0-9 ]/g, ''))
    console.log('Adicionou a cidade: ' + addressApi.localidade.replace(/[^a-zA-Z0-9 ]/g, ''))
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.waitForSelector('#postalcode', {visible: true});
    await page.type("#postalcode", addressApi.cep)
    console.log('Adicionou o CEP: ' + addressApi.cep)
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.waitForSelector('#mobilePhone', {visible: true});
    await page.type("#mobilePhone", address.phone)
    console.log('Adicionou o Telefone: ' + address.phone)
  } catch (error) {
    console.log(error)
  }



  return addressApi

}
export default Address
