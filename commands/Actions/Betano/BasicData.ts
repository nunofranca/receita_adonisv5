import axios from "axios";
import ButtonNextBetano from "./ButtonNextBetano";


const BasicData = async  (page, data, url, browser) =>{
  const date = new Date(data.dateBirth);
  const day = String(date.getUTCDate()).padStart(2, '0'); // Converte para string e garante dois dígitos
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Converte para string e garante dois dígitos
  const year = String(date.getUTCFullYear()); // Converte para string
  await new Promise(resolve => setTimeout(resolve, 15000));

  await page.waitForSelector('#day', {visible: true});
  await page.select('#day', day);
  console.log('passou do select do day')
  console.log('Adicionou o dia de nascimento ' + day)

  await page.select('#month', month);
  console.log('passou do select do month')
  console.log('Adicionou o mês de nascimento ' + month)
  await page.waitForSelector('#year', {visible: true});
  await page.select('#year', year);
  console.log('passou do select do year')
  console.log('Adicionou o ano de nascimento ' + year)
  await page.waitForSelector('#tax-number', {visible: true});
  await new Promise(resolve => setTimeout(resolve, 2000));
  await page.type('#tax-number', data.cpf);
  await new Promise(resolve => setTimeout(resolve, 2000));
  const cpfExist2 = await page.evaluate(() => {
    return document.body.innerText.includes('Este CPF já existe');
  });
  await new Promise(resolve => setTimeout(resolve, 1000));
  if (cpfExist2) {
    console.log('CPF já existe: ', cpfExist2);
    await axios.delete(`${url}/api/data/${data.id}`);
    console.log(`${data.cpf} foi deletado do sistema`);
    //await browser.close();
  } else {
    await axios.put(`${url}/api/data/${data.id}`, {
      betano: false
    });
    console.log('CPF não está cadastrado na Betano');
  }
  await new Promise(resolve => setTimeout(resolve, 10000));
    await ButtonNextBetano(page)


}
export default BasicData
