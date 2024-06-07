import axios from "axios";
import AuthProxy from "./Betano/AuthProxy";


const VerifyCpfAndEmailInBetano = async (data, email, browser, proxy, url) => {
  console.log('Entrou no componente que verifica se ja tem conta')
  const page = await browser.newPage()
  await AuthProxy(proxy, page)
  await page.goto('https://brbetano.com/register', {timeout: 180000});
  console.log('Abriu a página da betano pra verificar se email o CPF já estão cadastrados')
  await page.locator('button[data-qa="email"]').click();

  await page.locator('#tax-number').fill(data.cpf);
  console.log('Digitou o CPF');

  await new Promise(resolve => setTimeout(resolve, 2000));
  const cpfExist = await page.evaluate(() => {
    return document.body.innerText.includes('Este CPF já existe');
  });
  await new Promise(resolve => setTimeout(resolve, 2000));
  if (cpfExist) {
    console.log('CPF já existe: ', cpfExist);
    await axios.delete(`${url}/api/data/${data.id}`);
    console.log(`${data.cpf} foi deletado do sistema`);

    await browser.close();
    return true
  } else {
    await axios.put(`${url}/api/data/${data.id}`, {
      betano: false
    });
    console.log('CPF não está cadastrado na Betano');
  }


  await page.locator('#email').fill(email.email);
  console.log('Digitou o email');
  await new Promise(resolve => setTimeout(resolve, 2000));
  const emailExist = await page.evaluate(() => {
    return document.body.innerText.includes('Este email já está sendo utilizado');
  });

  if (emailExist) {
    axios.delete(url + '/api/email/' + data.id)
      .then(() => {
        console.log(email.email + ' Já tem cadastro e foi deletado')
      })
    console.log('Email já tem conta')
    browser.close()
    return true
  }
  console.log('FIM componente que verifica se ja tem conta')
  return false;
}

export default VerifyCpfAndEmailInBetano
