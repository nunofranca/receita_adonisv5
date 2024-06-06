import axios from "axios";
import ButtonNextBetano from "./ButtonNextBetano";

const Address = async (page, cep, phone) =>{
  const randomMouseMovePopup = async () => {
    await page.mouse.move(
      Math.floor(Math.random() * 800), // Coordenada X aleatória na página
      Math.floor(Math.random() * 600) // Coordenada Y aleatória na página
    );
  };
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
    await randomMouseMovePopup();
    await page.waitForSelector('#street', {visible: true});
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.type("#street", addressApi.logradouro.replace(/[^a-zA-Z0-9 ]/g, ''))
    console.log('Adicionou o nome da rua: ' + addressApi.logradouro.replace(/[^a-zA-Z0-9 ]/g, ''))
    await new Promise(resolve => setTimeout(resolve, 2000));
    await randomMouseMovePopup();
    await page.waitForSelector('#city', {visible: true});
    await page.type("#city", addressApi.localidade.replace(/[^a-zA-Z0-9 ]/g, ''))
    console.log('Adicionou a cidade: ' + addressApi.localidade.replace(/[^a-zA-Z0-9 ]/g, ''))
    await randomMouseMovePopup();
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.waitForSelector('#postalcode', {visible: true});
    await page.type("#postalcode", addressApi.cep)
    console.log('Adicionou o CEP: ' + addressApi.cep)
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.waitForSelector('#mobilePhone', {visible: true});
    await page.type("#mobilePhone", phone)
    await randomMouseMovePopup();
    console.log('Adicionou o Telefone: ' + phone)
  } catch (error) {
    console.log(error)
  }



  return addressApi

}
export default Address
