import axios from "axios";
import AuthProxy from "./Betano/AuthProxy";


const VerifyCpfAndEmailInBetano = async (response, email, browser, proxy, url) => {


  const page = await browser.newPage()
 await AuthProxy(proxy, page)
  await page.goto('https://brbetano.com/register', {timeout: 180000});
  console.log('Abriu a página da betano pra verificar se email o CPF já estão cadastrados')


  await page.waitForSelector('span', {timeout: 30000});
  await new Promise(resolve => setTimeout(resolve, 10000));

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
    await page.focus('#tax-number');
    await deleteField(page, '#tax-number')




    await page.type('#tax-number', data.cpf, {delay: 50});
    console.log('Digitou o CPF');
    await new Promise(resolve => setTimeout(resolve, 2000));
    const cpfExist = await page.evaluate(() => {
      return document.body.innerText.includes('Este CPF já existe') || document.body.innerText.includes('Este CPF não é válido');
    });
    console.log(cpfExist)
    new Promise(resolve => setTimeout(resolve, 3000000));
    if (cpfExist) {
      console.log('CPF já existe: ', cpfExist);
       axios.put(`${url}/api/data/${data.id}`, {
        betano: false
      });
      console.log(`${data.cpf} já possui cadastro na betano`);

    } else {
      axios.put(`${url}/api/data/${data.id}`, {
        betano: true
      });
      console.log(`${data.cpf} não está cadastrado na Betano`);
    }
    new Promise(resolve => setTimeout(resolve, 3000));

    console.log('******************************************')

  }
  await browser.close();
  return;
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

async function formatCPF(cpfString) {
  // Remove qualquer caractere que não seja número
  let cpf = cpfString.replace(/\D/g, '');

  // Adiciona zeros à esquerda, se necessário, para garantir que tenha 11 dígitos

  return cpf.padStart(11, '0');
}


export default VerifyCpfAndEmailInBetano
