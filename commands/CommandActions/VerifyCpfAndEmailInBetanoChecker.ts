import axios from "axios";
import AuthProxy from "./Betano/AuthProxy";


const VerifyCpfAndEmailInBetano = async (response, email, browser, proxy, url) => {


  const page = await browser.newPage()
  await AuthProxy(proxy, page)
  await page.goto('https://brbetano.com/register', {timeout: 180000});
  console.log('Abriu a página da betano pra verificar se email o CPF já estão cadastrados')


  await page.waitForSelector('span', {timeout: 30000});
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Encontrar todos os elementos <span> e procurar pelo texto desejado
  const spans = await page.$$('span');
  let found = false;

  for (let span of spans) {
    const textContent = await page.evaluate(el => el.textContent.trim(), span);
    if (textContent === 'Registrar com email') {
      await span.click();
      console.log('Clicou no botão "Registrar com email"');
      found = true;
      break;
    }
  }

  if (!found) {
    console.error('Botão "Registrar com email" não encontrado.');
  }
  await page.waitForSelector('#tax-number', {timeout: 60000});

  for (const [index, data] of Object.entries(response.data)) {
    await page.click('#tax-number');


    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');

    await page.keyboard.press('Backspace');

    await page.type('#tax-number', await formatCPF(data.cpf));
    console.log('Digitou o CPF');
    await new Promise(resolve => setTimeout(resolve, 3000));
    const cpfExist = await page.evaluate(() => {
      return document.body.innerText.includes('Este CPF já existe') || document.body.innerText.includes('Este CPF não é válido');
    });
    if (cpfExist) {
      console.log('CPF já existe: ', cpfExist);
      await axios.put(`${url}/api/data/${data.id}`, {
        betano: false
      });
      console.log(`${data.cpf} já possui cadastro na betano`);

    } else {
      await axios.put(`${url}/api/data/${data.id}`, {
        betano: true
      });
      console.log(`${data.cpf} não está cadastrado na Betano`);
    }
    new Promise(resolve => setTimeout(resolve, 2000));

    console.log('******************************************')

  }
  await browser.close();
  return;
}

async function formatCPF(cpfString) {
  // Remove qualquer caractere que não seja número
  let cpf = cpfString.replace(/\D/g, '');

  // Adiciona zeros à esquerda, se necessário, para garantir que tenha 11 dígitos

  return cpf.padStart(11, '0');
}


export default VerifyCpfAndEmailInBetano
