import {BaseCommand} from '@adonisjs/core/build/standalone';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from "puppeteer-extra-plugin-stealth"


// @ts-ignore
import AnonymizeUAPlugin from "puppeteer-extra-plugin-anonymize-ua";
// @ts-ignore
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";
import Xvfb from 'xvfb';

const xvfb = new Xvfb({
    displayNum: 99, // número da tela
    reuse: true,
    timeout: 5000,
    xvfb_args: ['-screen', '0', '1024x768x24', '-ac']
});

xvfb.start((err) => {
    if (err) {
        console.error('Erro ao iniciar o XVFB:', err);
        return;
    }

    console.log('XVFB iniciado');

    // Coloque aqui o código que precisa rodar com o XVFB
    // ...

    // Após o código rodar, pare o XVFB
    xvfb.stop((err) => {
        if (err) {
            console.error('Erro ao parar o XVFB:', err);
            return;
        }

        console.log('XVFB parado');
    });
});

import axios from 'axios';
import * as fs from 'fs';

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
    public static commandName = 'test:login_google';

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

        let browser;

        const response = await axios.get('https://botbet.tec.br/api/bet/star');
        const data = response.data;

        console.log(data);

        const parts = data.proxy.proxy.split(':');
        const proxy = {
            ip_port: parts[0] + ':' + parts[1],
            username: parts[2],
            password: parts[3],
        };
        console.log(proxy);

        const profile = `../profiles/qwee5we4wqeqe2we5`;
        if (!fs.existsSync(profile)) {
            fs.mkdirSync(profile, {recursive: true});
        }

        browser = await puppeteer.launch({
            //userDataDir: profile,
            executablePath: '/usr/bin/microsoft-edge',
            // executablePath: '/usr/bin/chrome',
            slowMo: 10,
            defaultViewport: null,
            headless: false,
            ignoreDefaultArgs: ["--disable-extensions"],

            args: [
                '--proxy-server=http://geo.iproyal.com:12321',
                '--start-maximized',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--window-size=1920x1080',
            ],
        });


        const page = await browser.newPage();

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');


        // Definindo cabeçalhos HTTP adicionais para pt-BR
        await page.setExtraHTTPHeaders({
            'accept-language': 'pt-BR,pt;q=0.9',
        });

        const randomDelay = () => {
            return Math.floor(Math.random() * 2000) + 1000; // Atraso entre 1 e 3 segundos
        };

        // Função para simular movimento aleatório do mouse
        const randomMouseMove = async () => {
            await page.mouse.move(
                Math.floor(Math.random() * 800), // Coordenada X aleatória na página
                Math.floor(Math.random() * 600) // Coordenada Y aleatória na página
            );
        };
        // await applyStealthSettings(page);

        await page.authenticate({
            username: 'PSqAoBQrU9fCnfiX',
            password: 'tOzvHAQurOZIf2a3_country-br',
        });
        await randomMouseMove();

        await page.goto('https://accounts.google.com/v3/signin/identifier?continue=https%3A%2F%2Fwww.google.com.br%2F&ec=GAZAmgQ&hl=pt-BR&ifkv=AaSxoQzmgJ1cLzhz_RiZ3Q_19cFM6u5VCAKcx4o-dsaHREFzhBKIGnayemNomS5mNUMjEekDd4kK&passive=true&flowName=GlifWebSignIn&flowEntry=ServiceLogin&dsh=S1275832598%3A1716502765207858&ddm=0', {timeout: 60000});
        // @ts-ignore
        await new Promise(resolve => setTimeout(resolve, 5000));


        await page.type('#identifierId', 'beatzjean098@gmail.com'); // Insira seu e-mail do Google
        await randomMouseMove();

        const randomMouseMovePopup = async () => {
            await page.mouse.move(
                Math.floor(Math.random() * 800), // Coordenada X aleatória na página
                Math.floor(Math.random() * 600) // Coordenada Y aleatória na página
            );
        };
        await randomMouseMovePopup();
        await new Promise(resolve => setTimeout(resolve, randomDelay()));
        await randomMouseMovePopup();
        await new Promise(resolve => setTimeout(resolve, randomDelay()));

        await new Promise(resolve => setTimeout(resolve, randomDelay()));
        console.log(randomDelay())
        await new Promise(resolve => setTimeout(resolve, 10000));
        await randomMouseMovePopup();
        await new Promise(resolve => setTimeout(resolve, randomDelay()));
        await page.keyboard.press('Tab');
        await new Promise(resolve => setTimeout(resolve, randomDelay()));
        await page.keyboard.press('Tab');
        await randomMouseMovePopup();
        await new Promise(resolve => setTimeout(resolve, randomDelay()));
        await page.keyboard.press('Tab');
        await randomMouseMovePopup();
        await new Promise(resolve => setTimeout(resolve, randomDelay()));
        await page.keyboard.press('Enter');
        await randomMouseMovePopup();
        await new Promise(resolve => setTimeout(resolve, 10000));

        await page.type('#password', 'a5qbb8dr0lfzq0', {delay: 1000});


        await new Promise(resolve => setTimeout(resolve, randomDelay()));
        await page.keyboard.press('Tab');

        await new Promise(resolve => setTimeout(resolve, randomDelay()));
        await page.keyboard.press('Tab');

        await page.keyboard.press('Enter');

        console.log('depois do enter da senha')


        await new Promise(resolve => setTimeout(resolve, 10000));

        // Pressione a tecla Shift
        await page.keyboard.down('Shift');

        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');

        await page.keyboard.up('Shift');

        await new Promise(resolve => setTimeout(resolve, 5000));
        console.log('antes do enter da confirmacao de email')
        await page.keyboard.press('Enter');
        await new Promise(resolve => setTimeout(resolve, 11000));
        await page.type('input[type="email"]', '4waseruma669u@guerrillamail.org');
        await new Promise(resolve => setTimeout(resolve, 5000));
        await page.keyboard.press('Tab');
        await new Promise(resolve => setTimeout(resolve, 5000));
        await page.keyboard.press('Enter');
        await new Promise(resolve => setTimeout(resolve, 10000000));


    }

}
