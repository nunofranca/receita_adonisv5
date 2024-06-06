import axios from "axios";
import ButtonNextBetano from "./ButtonNextBetano";


const BasicData = async  (page, data, url, browser) =>{
  const randomMouseMovePopup = async () => {
    await page.mouse.move(
      Math.floor(Math.random() * 800), // Coordenada X aleatória na página
      Math.floor(Math.random() * 600) // Coordenada Y aleatória na página
    );
  };
  console.log('Etrou no BasicData')
  const date = new Date(data.dateBirth);
  const day = String(date.getUTCDate()).padStart(2, '0'); // Converte para string e garante dois dígitos
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Converte para string e garante dois dígitos
  const year = String(date.getUTCFullYear()); // Converte para string
  await randomMouseMovePopup();

  for (let i = 0; i < 5; i++) {
    try {
      console.log('Tentativa ' + (i + 1) + ' de achar o select Day');

      // Tentar encontrar o primeiro seletor
      try {
        await page.waitForSelector('select[name="Day"]', { timeout: 30000 });
      } catch (e1) {
        console.log('select[name="Day"] não encontrado.');
      }

      // Tentar encontrar o segundo seletor
      try {
        await page.waitForSelector('#day', { timeout: 30000 });
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

  await page.select('select[name="Day"]', day);
  console.log('Adicionou o dia de nascimento ' + day)
  for (let i = 0; i < 5; i++) {
    try {
      console.log('Tentativa '+ i+1 +' de acha o select Month')
      await randomMouseMovePopup();
      await page.waitForSelector('select[name="Month"]', {timeout: 30000});

    } catch (e) {
      console.log(`Tentativa ${i + 1} falhou. Tentando novamente...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  await page.select('select[name="Month"]', month);
  console.log('passou do select do month')
  console.log('Adicionou o mês de nascimento ' + month)
  await randomMouseMovePopup();
  await page.waitForSelector('select[name="Year"]', {timeout: 30000});
  await page.select('select[name="Year"]', year);
  console.log('passou do select do year')
  console.log('Adicionou o ano de nascimento ' + year)
  await randomMouseMovePopup();
  await page.waitForSelector('#tax-number', {timeout: 30000});
  await randomMouseMovePopup();
  await page.type('#tax-number', data.cpf);
  await new Promise(resolve => setTimeout(resolve, 2000));
  const cpfExist2 = await page.evaluate(() => {
    return document.body.innerText.includes('Este CPF já existe');
  });
  await randomMouseMovePopup();
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
