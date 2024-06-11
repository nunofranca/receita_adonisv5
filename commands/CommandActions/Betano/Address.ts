import axios from "axios";
import ButtonNextBetano from "./ButtonNextBetano";
import RandomClick from "../../../RandonClick";
import HumanType from "../../../HumanType";

const Address = async (page, cep, address) => {

  console.log('Entrou no Componente de Address')
  console.log(cep.cep)

  await new Promise(resolve => setTimeout(resolve, 10000));

  try {
    for (let i = 0; i < 5; i++) { // Realiza 5 movimentos e cliques aleatórios
      const x = await RandomClick(0, 1800); // Coordenada X aleatória dentro do viewport
      const y = RandomClick(0, 850);  // Coordenada Y aleatória dentro do viewport
      await page.mouse.move(await x, await y);
      // Espera aleatória entre 500ms e 2500ms
    }

    const street = '#street';
    const city = '#city';
    const postCode = '#postalcode';
    const phone = '#mobilePhone';

    await HumanType(page, street, address.street.replace(/[^a-zA-Z0-9 ]/g, ''))
    await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 1000) + 500)); // Atraso aleatório entre 500ms e 1500ms
    await deleteField(page, city)
    await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 1000) + 500)); // Atraso aleatório entre 500ms e 1500ms
    await HumanType(page, city, address.city.replace(/[^a-zA-Z0-9 ]/g, ''))
    await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 1000) + 500)); // Atraso aleatório entre 500ms e 1500ms

    await deleteField(page, postCode)
    await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 1000) + 500)); // Atraso aleatório entre 500ms e 1500ms
    await HumanType(page, postCode, address.postCode)
    await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 1000) + 500)); // Atraso aleatório entre 500ms e 1500ms

    await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 1000) + 500)); // Atraso aleatório entre 500ms e 1500ms
    await HumanType(page, phone, address.phone)

    await new Promise(resolve => setTimeout(resolve, 4000));
  } catch (error) {
    console.log(error)
  }


  return address

}

async function deleteField(page, selector) {
  // Focar no campo

  await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 200) + 100)); // Atraso aleatório entre 100ms e 300ms

  // // Selecionar todo o texto no campo
  await page.click(selector, { clickCount: 3 });
  //
  // // Obter o valor atual do campo
  // const text = await page.$eval(selector, el => el.value);

  // Segurar a tecla Backspace para deletar o texto
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('Backspace');
    await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 100) + 50)); // Atraso aleatório entre 50ms e 150ms
  }
}
export default Address
