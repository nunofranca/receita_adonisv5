import axios from "axios";

const VerifyCpfAndEmailInBetano =async (data, email, page, proxy, url) =>{

  if (data.betano === null) {


    await page.goto('https://brbetano.com/register', {timeout: 180000});
    console.log('Abriu a página da betano pra verificar se email o CPF já estão cadastrados')

    await new Promise(resolve => setTimeout(resolve, 10000));
    await page.waitForSelector('span');

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


    await new Promise(resolve => setTimeout(resolve, 5000));
    await page.type('#tax-number', data.cpf);
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
      await page.close();
    } else {
      await axios.put(`${url}/api/data/${data.id}`, {
        betano: false
      });
      console.log('CPF não está cadastrado na Betano');
    }
    new Promise(resolve => setTimeout(resolve, 2000));

    page.type('#email', email.email);
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
      page.close()
      return
    }
    console.log('Email e CPF disponíveis para cadastro');

    await new Promise(resolve => setTimeout(resolve, 2000));
    page.close()
  }
}

export default VerifyCpfAndEmailInBetano
