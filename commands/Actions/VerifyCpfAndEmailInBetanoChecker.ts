import axios from "axios";
import AuthProxy from "./Betano/AuthProxy";


const VerifyCpfAndEmailInBetano = async (data, email, browser, proxy, url) => {
    console.log('Entrou no componente que verifica se ja tem conta')


    const page = await browser.newPage()
    await AuthProxy(proxy, page)
    await page.goto('https://brbetano.com/register', {timeout: 180000});
    console.log('Abriu a página da betano pra verificar se email o CPF já estão cadastrados')


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



    console.log(data)
    await page.waitForSelector('#tax-number');
    await page.type('#tax-number', data.cpf);
    console.log('Digitou o CPF');
    await new Promise(resolve => setTimeout(resolve, 2000));
    const cpfExist = await page.evaluate(() => {
        return document.body.innerText.includes('Este CPF já existe');
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    if (cpfExist) {
        console.log('CPF já existe: ', cpfExist);
        await axios.put(`${url}/api/data/${data.id}`, {
          betano: true
        });
        console.log(`${data.cpf} foi possui cadastro na betano`);
        await browser.close();
        return false
    } else {
        await axios.put(`${url}/api/data/${data.id}`, {
            betano: true
        });
        console.log('CPF não está cadastrado na Betano');
    }
    new Promise(resolve => setTimeout(resolve, 2000));


    console.log('Email e CPF disponíveis para cadastro');
    console.log('FIM componente que verifica se ja tem conta')
    return false;
}

export default VerifyCpfAndEmailInBetano
