import {BaseCommand} from '@adonisjs/core/build/standalone';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from "puppeteer-extra-plugin-stealth"

import axios from 'axios';

// @ts-ignore
import userAgents from "../userAgents";
// @ts-ignore
import userAgentBetano from "../UserAgentBetano";
// @ts-ignore
import AnonymizeUAPlugin from "puppeteer-extra-plugin-anonymize-ua";
// @ts-ignore
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";
import Xvfb from 'xvfb';
import VerifyCpfAndEmailInBetano from "./Actions/VerifyCpfAndEmailInBetano";
import LoginGoogle from "./Actions/LoginGoogle";
import Launch from "./Actions/Launch";
import AuthProxy from "./Actions/Betano/AuthProxy";
import ConfigPage from "./Actions/Betano/ConfigPage";
import Login from "./Actions/Betano/Login";
import BasicData from "./Actions/Betano/BasicData";
import Address from "./Actions/Betano/Address";
import ButtonNextBetano from "./Actions/Betano/ButtonNextBetano";

const xvfb = new Xvfb({
    displayNum: 99, // número da tela
    reuse: true,
    timeout: 5000,
    xvfb_args: ['-screen', '0', '1024x768x24', '-ac']
});

xvfb.start((err) => {
    if (err) {

        return;
    }

    xvfb.stop((err) => {
        if (err) {

            return;
        }


    });
});

console.log('depois do xvfb')


const stealth = StealthPlugin()
stealth.enabledEvasions.delete('iframe.contentWindow')
stealth.enabledEvasions.delete('media.codecs')
puppeteer.use(stealth)
puppeteer.use(AnonymizeUAPlugin());
puppeteer.use(
    AdblockerPlugin({
        blockTrackers: true,
    })
);

export default class TestPixSimple extends BaseCommand {
    /**
     * Command name is used to run the command
     */
    public static commandName = 'test:create_betano';

    /**
     * Command description is displayed in the "help" output
     */
    public static description = '';

    public static settings = {
        /**
         * Set the following value to true, if you want to load the application
         * before running the command. Don't forget to call `node ace generate:manifest`
         * afterwards.
         */
        loadApp: false,

        /**
         * Set the following value to true, if you want this command to keep running until
         * you manually decide to exit the process. Don't forget to call
         * `node ace generate:manifest` afterwards.
         */
        stayAlive: false,
    };

    public async run() {
        console.log('Entrou no metodo RUN')

        const apiUrls = [
            'https://botbetano.com.br',
            //'https://app-54653.dc-us-1.absamcloud.com'
        ];

        function getRandomUrl(urls) {
            const randomIndex = Math.floor(Math.random() * urls.length);

            return urls[randomIndex];
        }

        let url = getRandomUrl(apiUrls)

        console.log('Chegou nas requisições')
        const dataReq = await axios.get(url + '/api/data');

        const proxyReq = await axios.get(url + '/api/proxy');
        const emailReq = await axios.get(url + '/api/email/' + dataReq.data.user_id);
        const addressReq = await axios.get(url + '/api/address');
        const data = dataReq.data;
        const email = emailReq.data;
        const address = addressReq.data;


        const proxy = proxyReq.data;
        console.log('Fez todas as requisições necessára à API')


        if (data.length === 0 || email.length === 0) {
            console.log('sem dados suficientes')
            await new Promise(resolve => setTimeout(resolve, 3000));
            return
        }


        const browser = await Launch(proxy)

        try {
            const pageGoogle = await browser.newPage()
            await AuthProxy(proxy, pageGoogle)
            const pageBetano = await browser.newPage()
            await AuthProxy(proxy, pageBetano)
            await VerifyCpfAndEmailInBetano(data, email, pageBetano, browser, url)

            await LoginGoogle(email, data, pageGoogle, browser)

            await new Promise(resolve => setTimeout(resolve, 5000));


            try {


                const randomUserAgentBetano = userAgentBetano[Math.floor(Math.random() * userAgentBetano.length)];

                await pageGoogle.setUserAgent(randomUserAgentBetano);

                await ConfigPage(pageBetano)
                await new Promise(resolve => setTimeout(resolve, 7000));
                await Login(pageBetano)


                await new Promise(resolve => setTimeout(resolve, 10000));


                const date = new Date(data.dateBirth);
                const day = String(date.getUTCDate()).padStart(2, '0'); // Converte para string e garante dois dígitos
                const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Converte para string e garante dois dígitos
                const year = String(date.getUTCFullYear()); // Converte para string
                await new Promise(resolve => setTimeout(resolve, 15000));
                console.log('pantes do swaitForselect do day')
                await page.waitForSelector('#day', {visible: true});
                console.log('pantes do select do day')
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
                    await browser.close();
                } else {
                    await axios.put(`${url}/api/data/${data.id}`, {
                        betano: false
                    });
                    console.log('CPF não está cadastrado na Betano');
                }
                await new Promise(resolve => setTimeout(resolve, 10000));
                await ButtonNextBetano(page)
                await new Promise(resolve => setTimeout(resolve, 10000));
                const addressApi = await Address(page, address);


                console.log('Clicou no botão para a próxima pagina')
                await new Promise(resolve => setTimeout(resolve, 7000));
                await page.focus('#username');
                await page.keyboard.down('Control');
                await page.keyboard.press('A');
                await page.keyboard.up('Control');
                await page.keyboard.press('Backspace');
                console.log('Deletou o username padrão')
                await new Promise(resolve => setTimeout(resolve, 2000))
                await page.type('#username', data.username)
                console.log('Adicinou o useraname: ' + data.username)
                // const username = await page.evaluate(selector => {
                //   return document.querySelector(selector).value;
                // }, '#username');
                await new Promise(resolve => setTimeout(resolve, 2000));
                await page.waitForSelector('input[type="password"]', {visible: true});
                await page.type('input[type="password"]', 'Money4Life#')
                console.log('Adicinou a senha')
                await new Promise(resolve => setTimeout(resolve, 6000))

                await ButtonNextBetano(page)
                console.log('Clicou no botão para a próxima pagina')
                await new Promise(resolve => setTimeout(resolve, 8000));
                const checkbox = await page.$('span.checkbox-check.tw-rounded-xs');
                if (checkbox) {
                    await checkbox.click();
                    console.log('Clicou no checkbox');
                } else {
                    console.error('Checkbox não encontrado.');
                }


                await new Promise(resolve => setTimeout(resolve, 8000));
                await page.evaluate(() => {
                    const buttons = await page.$$('button');

                    for (let button of buttons) {
                        const textContent = await page.evaluate(el => el.textContent.trim(), button);
                        if (textContent === 'PRÓXIMO') {
                            await button.click();
                            break;
                        }
                    }
                });
                await new Promise(resolve => setTimeout(resolve, 15000));
                console.log(randomUserAgentBetano);
                const account = await axios.post(
                    url + '/api/account',
                    {
                        password: 'Money4Life#',
                        useragent: randomUserAgentBetano ?? 'Sem informação',
                        user_id: data.user_id,
                        username: data.username,
                        data: data,
                        email: email,
                        address: {
                            id: address.id,
                            street: addressApi.logradouro,
                            city: addressApi.localidade,
                            postCode: addressApi.cep
                        }


                    },
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                ).then(() => {
                    console.log('Conta cadastrada com sucesso')
                });
                console.log(account)
                await new Promise(resolve => setTimeout(resolve, 15000));

            } catch (error) {
                console.log('Primeiro catch:' + error)

            } finally {
                await browser.close();
            }
        } catch (error) {
            console.log('Ultimo catch:' + error)

        } finally {
            // const cookiesBetano = await page.cookies();
            // for (let cookieBe of cookiesBetano) {
            //   await page.deleteCookie(cookieBe);
            // }
            //
            // // Verificar que os cookies foram limpos
            // const cookiesAfterBetano = await page.cookies();
            // console.log('Cookies after deletion:', cookiesAfterBetano);
            await browser.close()
        }


    }


}
