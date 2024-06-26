import axios from "axios";
import ButtonNextBetano from "./ButtonNextBetano";
import RandomClick from "../../../RandonClick";
import { Page, Browser } from "puppeteer";


const BasicData = async (page: Page, data: {
  dateBirth: string | number | Date;
  cpf: any;
  id: any;
}, url: any, browser: Browser) => {
  await new Promise(resolve => setTimeout(resolve, 30000));

  // for (let i = 0; i < 5; i++) { // Realiza 5 movimentos e cliques aleatórios
  //   const x = await  RandomClick(0, 1280); // Coordenada X aleatória dentro do viewport
  //   const y =await  RandomClick(0, 800);  // Coordenada Y aleatória dentro do viewport
  //   await page.mouse.move(await x, await y);
  //
  //  // Espera aleatória entre 500ms e 2500ms
  // }
  console.log('Etrou no BasicData')
  const date = new Date(data.dateBirth);
  const day = String(date.getUTCDate()).padStart(2, '0'); // Converte para string e garante dois dígitos
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Converte para string e garante dois dígitos
  const year = String(date.getUTCFullYear()); // Converte para string

  for (let i = 0; i < 5; i++) { // Realiza 5 movimentos e cliques aleatórios
    const x = await  RandomClick(0, 987); // Coordenada X aleatória dentro do viewport
    const y =await  RandomClick(0, 1254);  // Coordenada Y aleatória dentro do viewport
    await page.mouse.move(await x,await y);

     // Espera aleatória entre 500ms e 2500ms
  }



// Verificar novamente fora do loop se pelo menos um dos seletores foi encontrado
  if (!await page.$('select[name="Day"]') && !await page.$('#day')) {
    console.log('Nenhum dos seletores foi encontrado. Fechando o navegador.');
    await browser.close();
    return;
  }

  for (let i = 0; i < 5; i++) { // Realiza 5 movimentos e cliques aleatórios
    const x = await  RandomClick(0, 800); // Coordenada X aleatória dentro do viewport
    const y = await RandomClick(0, 800);  // Coordenada Y aleatória dentro do viewport
    await page.mouse.move(await x,await y);


  }
  async function humanSelect(page, selector, value) {
    const element = await page.$(selector);
    if (element) {
      // Simular movimento do mouse até o elemento
      const boundingBox = await element.boundingBox();
      await page.mouse.move(
        boundingBox.x + boundingBox.width / 2,
        boundingBox.y + boundingBox.height / 2
      );

      await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 1000) + 500)); // Atraso aleatório entre 500ms e 1500ms

      page.focus(selector)
      await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 700) + 100)); // Atraso aleatório entre 500ms e 1500ms

      await page.select(selector, value);
    }
  }
  await  humanSelect(page, 'select[name="Day"]', day)
  await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 1000) + 500)); // Atraso aleatório entre 500ms e 1500ms
  await page.select('select[name="Month"]', month);
  await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 1000) + 500)); // Atraso aleatório entre 500ms e 1500ms
  await  humanSelect(page, 'select[name="Year"]', year)

  async function humanCpf(page, selector, text) {
    for (let i = 0; i < text.length; i++) {
      await page.type(selector, text[i]);
      await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 200) + 50))
    }
  }
  await humanCpf(page, '#tax-number', data.cpf)
  await new Promise(resolve => setTimeout(resolve, 2000));
  const cpfExist2 = await page.evaluate(() => {
    return document.body.innerText.includes('Este CPF já existe');
  });
  for (let i = 0; i < 5; i++) { // Realiza 5 movimentos e cliques aleatórios
    const x = await  RandomClick(0, 880); // Coordenada X aleatória dentro do viewport
    const y =  await RandomClick(0, 2541);  // Coordenada Y aleatória dentro do viewport
    await page.mouse.move(await x,await y);

  }
  await new Promise(resolve => setTimeout(resolve, 1000));
  if (cpfExist2) {
    console.log('CPF já existe: ', cpfExist2);
    await axios.delete(`${url}/api/data/${data.id}`);
    console.log(`${data.cpf} foi deletado do sistema`);
    await browser.close();
  } else {
    await axios.put(`${url}/api/data/${data.id}`, {
      betano: false
    });
    console.log('CPF não está cadastrado na Betano');
  }
  console.log('FIM do basic data')


}
export default BasicData
