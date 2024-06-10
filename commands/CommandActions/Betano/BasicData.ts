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

  for (let i = 0; i < 5; i++) { // Realiza 5 movimentos e cliques aleatórios
    const x = await  RandomClick(0, 1280); // Coordenada X aleatória dentro do viewport
    const y =await  RandomClick(0, 800);  // Coordenada Y aleatória dentro do viewport
    await page.mouse.move(await x, await y);

   // Espera aleatória entre 500ms e 2500ms
  }
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


  for (let i = 0; i < 5; i++) {
    try {
      console.log('Tentativa ' + (i + 1) + ' de achar o select Day');

      // Tentar encontrar o primeiro seletor
      try {
        await page.waitForSelector('select[name="Day"]', {timeout: 30000});
      } catch (e1) {
        console.log('select[name="Day"] não encontrado.');
      }

      // Tentar encontrar o segundo seletor
      try {
        await page.waitForSelector('#day', {timeout: 30000});
      } catch (e2) {
        console.log('#day não encontrado.');
      }

      // Se pelo menos um dos seletores foi encontrado, sair do loop
      if (await page.$('select[name="Day"]') || await page.$('#day')) {
        break;
      }

    } catch (e) {
      console.log(`Tentativa ${i + 1} falhou. Tentando novamente...`);
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (i == 4) {
        await browser.close();
        return;
      }
    }
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
  await page.select('select[name="Day"]', day);
  console.log('Adicionou o dia de nascimento ' + day)
  for (let i = 0; i < 5; i++) {
    try {
      console.log('Tentativa ' + i + 1 + ' de acha o select Month')

      await page.waitForSelector('select[name="Month"]', {timeout: 30000});

    } catch (e) {
      console.log(`Tentativa ${i + 1} falhou. Tentando novamente...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  await page.select('select[name="Month"]', month);
  console.log('passou do select do month')
  console.log('Adicionou o mês de nascimento ' + month)
  for (let i = 0; i < 5; i++) { // Realiza 5 movimentos e cliques aleatórios
    const x = await  RandomClick(0, 985); // Coordenada X aleatória dentro do viewport
    const y = await RandomClick(0, 798);  // Coordenada Y aleatória dentro do viewport
    await page.mouse.move(await x,await y);
    await page.mouse.click(await x,await y);

  }
  await page.waitForSelector('select[name="Year"]', {timeout: 30000});
  await page.select('select[name="Year"]', year);
  console.log('passou do select do year')
  console.log('Adicionou o ano de nascimento ' + year)
  for (let i = 0; i < 5; i++) { // Realiza 5 movimentos e cliques aleatórios
    const x = await  RandomClick(0, 1895); // Coordenada X aleatória dentro do viewport
    const y =  await RandomClick(0, 1458);  // Coordenada Y aleatória dentro do viewport
    await page.mouse.move(await x,await y);


  }
  await page.waitForSelector('#tax-number', {timeout:  await RandomClick(300, 1352)});
  for (let i = 0; i < 5; i++) { // Realiza 5 movimentos e cliques aleatórios
    const x = await  RandomClick(0, 700); // Coordenada X aleatória dentro do viewport
    const y =  await RandomClick(0, 878);  // Coordenada Y aleatória dentro do viewport
    await page.mouse.move(await x,await y);


  }
  await page.type('#tax-number', data.cpf);
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
