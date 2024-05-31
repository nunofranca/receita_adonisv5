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

      return;
    }


  });
});

import axios from 'axios';

import userAgents from "../userAgents";

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


    let browser;
    const apiUrls = [
      'https://app-54674.dc-sp-1.absamcloud.com',
      //'https://app-54653.dc-us-1.absamcloud.com'
    ];

    function getRandomUrl(urls) {
      const randomIndex = Math.floor(Math.random() * urls.length);

      return urls[randomIndex];
    }

    let url = getRandomUrl(apiUrls)



    const dataReq = await axios.get(url + '/api/data');

    const proxyReq = await axios.get(url + '/api/proxy');
    const emailReq = await axios.get(url + '/api/email/' + dataReq.data.user_id);
    const addressReq = await axios.get(url + '/api/address');
    const data = dataReq.data;
    const email = emailReq.data;
    const address = addressReq.data;

    const proxy = proxyReq.data;
    console.log(proxy)



    if (data.length === 0 || email.length === 0) {
      console.log('sem dados suficientes')
      await new Promise(resolve => setTimeout(resolve, 3000));
      return
    }


    browser = await puppeteer.launch({
      // env: {
      //   DISPLAY: ":10.0"
      // },
      // userDataDir: '../profiles/dateBirth',
       executablePath: '/usr/bin/microsoft-edge',
      //executablePath: '/usr/bin/chromium-browser',
      slowMo: 10,
      defaultViewport: null,
      headless: false,
      ignoreDefaultArgs: ["--disable-extensions"],

      args: [
        '--proxy-server=' + proxy.proxy,
        // '--proxy-server=http://x279.fxdx.in:15783',
        '--start-maximized',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080',
      ],
    });

    try {
      const page = await browser.newPage();
      // Aumentar tempos de espera padrão
      await page.setDefaultNavigationTimeout(60000);
      await page.setDefaultTimeout(60000);

      // Interceptar e bloquear recursos pesados

      const client = await page.target().createCDPSession();
      await client.send('Network.clearBrowserCookies');
      await client.send('Network.clearBrowserCache');

      const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
      await page.setUserAgent(randomUserAgent);


      // Definindo cabeçalhos HTTP adicionais para pt-BR
      await page.setExtraHTTPHeaders({
        'accept-language': 'pt-BR,pt;q=0.9',
      });


      await page.authenticate({
        username: proxy.username,
        password: proxy.password,
      });

      await page.goto('https://brbetano.com/register', {timeout: 180000});

      await new Promise(resolve => setTimeout(resolve, 5000));
      await page.evaluate(() => {
        const registerEmail = Array.from(document.querySelectorAll('span'));
        const next = registerEmail.find(span => span.textContent.trim() === 'Registrar com email');
        if (next) {
          next.click();
        } else {
          console.error('Botão "Continue" não encontrado.');
        }
      });
      await new Promise(resolve => setTimeout(resolve, 5000));
      await page.type('#tax-number', data.cpf);
      await new Promise(resolve => setTimeout(resolve, 5000));
      const textoExistente1 = await page.evaluate(() => {
        return document.body.innerText.includes('Este CPF já existe');
      });
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(textoExistente1)

      if (textoExistente1) {
        console.log('caiu aqui')
        await axios.delete(url + '/api/data/' + data.id)
        console.log(data.cpf + 'Já tem cadastro e foi deletado')
        await browser.close()
      }
      await new Promise(resolve => setTimeout(resolve, 5000));


      //await page.goto('https://globo.com', {timeout: 60000});
      await page.goto('https://accounts.google.com/v3/signin/identifier?continue=https%3A%2F%2Fwww.google.com.br%2F&ec=GAZAmgQ&hl=pt-BR&ifkv=AS5LTAQniEoHUgJl13A3qmCBu5onhiRkW3pIYGnnK22SMJxAfC75ulKzXXMtDamun64Ls4b5jN2HpA&passive=true&flowName=GlifWebSignIn&flowEntry=ServiceLogin&dsh=S-218042109%3A1717111244684717&ddm=0', {timeout: 60000});

      await new Promise(resolve => setTimeout(resolve, 15000));


      // @ts-ignore
      await page.waitForSelector('#identifierId', {visible: true});
      await new Promise(resolve => setTimeout(resolve, 5000));

      await page.type('#identifierId', email.email);
      await new Promise(resolve => setTimeout(resolve, 5000));
      await buttonNext(page)
      await new Promise(resolve => setTimeout(resolve, 5000));

      await notLogin(page)

      await new Promise(resolve => setTimeout(resolve, 5000));


      await page.waitForSelector('#password', {visible: true});
      await new Promise(resolve => setTimeout(resolve, 5000));
      await page.type('#password', email.password);
      await new Promise(resolve => setTimeout(resolve, 2000));
      await buttonNext(page)


      await new Promise(resolve => setTimeout(resolve, 10000));
      try {

        await page.evaluate(() => {
          const divs = Array.from(document.querySelectorAll('div'));
          const div = divs.find(div => {
            return div && div.textContent.trim() === 'Confirme seu e-mail de recuperação';
          });
          if (div) {
            div.click();
          } else {
            console.error('Botão "PRÓXIMA" não encontrado.');
          }
        });
      } catch (error) {
        console.log(error)
      }
      await new Promise(resolve => setTimeout(resolve, 7000));
      try {
        const isEmailInputPresent = await page.evaluate(() => {
          return !!document.querySelector('input[type="email"]');
        });

        if (isEmailInputPresent) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          await page.type('input[type="email"]', email.emailRecovery);
          await new Promise(resolve => setTimeout(resolve, 5000));
          await buttonNext(page)

        }
      } catch (error) {

        await browser.close();
      }

      await new Promise(resolve => setTimeout(resolve, 10000));


      await page.setViewport({
        width: Math.floor(Math.random() * (1920 - 800 + 1)) + 800,
        height: Math.floor(Math.random() * (1080 - 600 + 1)) + 600,
        deviceScaleFactor: 1
      });

      await page.goto('https://brbetano.com/register', {timeout: 180000});

      await page.waitForSelector('body');

      await new Promise(resolve => setTimeout(resolve, 3000));

      const isTextPresent = await page.evaluate((text: string) => {
        return document.body.textContent.includes(text);
      }, 'BEM-VINDO À BETANO');

      if (!isTextPresent) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await page.goto('https://brbetano.com/register', {timeout: 180000});
      }


      // @ts-ignore
      await new Promise(resolve => setTimeout(resolve, 7000));


      await page.evaluate(() => {
        const loginGoogle = Array.from(document.querySelectorAll('span'));
        const next = loginGoogle.find(span => span.textContent.trim() === 'Registrar com Google');
        if (next) {
          next.click();
        } else {
          console.error('Botão "Continue" não encontrado.');
        }
      });


      await new Promise(resolve => setTimeout(resolve, 10000));
      // Espera até que uma nova página seja aberta (pop-up)
      const pages = await browser.pages();

      const popup = pages[pages.length - 1]
      await popup.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');


      await popup.setExtraHTTPHeaders({
        'accept-language': 'pt-BR,pt;q=0.9',
      });

      try {
        await new Promise(resolve => setTimeout(resolve, 7000));
        await popup.keyboard.press('Tab');
        await popup.keyboard.press('Tab');
        await popup.keyboard.press('Enter');

        // await popup.evaluate(() => {
        //   const loginGoogle = Array.from(document.querySelectorAll('div'));
        //   const next = loginGoogle.find(span => span.textContent.trim() ===email.email);
        //   if (next) {
        //     next.click();
        //   } else {
        //     console.error('Botão "Continue" não encontrado.');
        //   }
        // });
        await new Promise(resolve => setTimeout(resolve, 7000));
        await popup.evaluate(() => {
          const nextt = Array.from(document.querySelectorAll('span'));
          const next = nextt.find(span => span.textContent.trim() === 'Continue');
          if (next) {
            next.click();

          } else {
            console.error('Botão "Continue" não encontrado.');
          }
        });
        await new Promise(resolve => setTimeout(resolve, 7000));
      } catch (error) {
        console.log('NAO FEZ OS TABS DE CONFIRMAR CONTA')
      }
      const date = new Date(data.dateBirth);
      const day = String(date.getUTCDate()).padStart(2, '0'); // Converte para string e garante dois dígitos
      const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Converte para string e garante dois dígitos
      const year = String(date.getUTCFullYear()); // Converte para string
      await new Promise(resolve => setTimeout(resolve, 15000));

      await page.waitForSelector('#day', {visible: true});
      await page.select('#day', day);

      await page.select('#month', month);

      await page.waitForSelector('#year', {visible: true});
      await page.select('#year', year);

      await page.waitForSelector('#tax-number', {visible: true});
      await new Promise(resolve => setTimeout(resolve, 2000));
      await page.type('#tax-number', data.cpf);
      await new Promise(resolve => setTimeout(resolve, 5000));
      const textoExistente = await page.evaluate(() => {
        return document.body.innerText.includes('Este CPF já existe');
      });

      if (textoExistente) {
        await axios.delete(url + '/api/data/' + data.id)
        console.log(data.cpf + 'Já tem cadastro e foi deletado')
        await browser.close()
      }

      await new Promise(resolve => setTimeout(resolve, 5000));

      async function clickProxima() {
        await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const button = buttons.find(btn => {
            const span = btn.querySelector('span');
            return span && span.textContent.trim() === 'PRÓXIMA';
          });
          if (button) {
            button.click();
          } else {
            console.error('Botão "PRÓXIMA" não encontrado.');
          }
        });
      }

      await clickProxima()
      const addressReq = await axios.get(url + '/api/cep/'+proxy.slug);
      await new Promise(resolve => setTimeout(resolve, 3000));
      const addressApi = addressReq.data
      await page.waitForSelector('#street', {visible: true});
      await new Promise(resolve => setTimeout(resolve, 2000));
      await page.type("#street", addressApi.logradouro)
      await new Promise(resolve => setTimeout(resolve, 2000));
      await page.waitForSelector('#city', {visible: true});
      await page.type("#city", addressApi.localidade)
      await new Promise(resolve => setTimeout(resolve, 2000));
      await page.waitForSelector('#postalcode', {visible: true});
      await page.type("#postalcode", addressApi.cep)
      await new Promise(resolve => setTimeout(resolve, 2000));
      await page.waitForSelector('#mobilePhone', {visible: true});
      await page.type("#mobilePhone", address.phone)

      await new Promise(resolve => setTimeout(resolve, 2000));
      await clickProxima()
      await new Promise(resolve => setTimeout(resolve, 7000));
      await page.focus('#username');
      await page.keyboard.down('Control');
      await page.keyboard.press('A');
      await page.keyboard.up('Control');
      await page.keyboard.press('Backspace');
      await new Promise(resolve => setTimeout(resolve, 2000))
      await page.type('#username', data.username)
      // const username = await page.evaluate(selector => {
      //   return document.querySelector(selector).value;
      // }, '#username');
      await new Promise(resolve => setTimeout(resolve, 2000));
      await page.waitForSelector('input[type="password"]', {visible: true});
      await page.type('input[type="password"]', 'Money4Life#')
      await new Promise(resolve => setTimeout(resolve, 4000))

      await new Promise(resolve => setTimeout(resolve, 2000));
      await clickProxima()
      await new Promise(resolve => setTimeout(resolve, 8000));
      const checkbox = await page.$('span.checkbox-check.tw-rounded-xs');
      if (checkbox) {
        await checkbox.click();
        console.log('Checkbox clicado com sucesso.');
      } else {
        console.error('Checkbox não encontrado.');
      }


      await new Promise(resolve => setTimeout(resolve, 8000));
      await page.evaluate(() => {
        const buttonRegister = Array.from(document.querySelectorAll('button'));
        const register = buttonRegister.find(regis => {
          const span = regis.querySelector('span');
          return span && span.textContent.trim() === 'REGISTRAR';
        });

        if (register) {
          register.click();


        } else {
          console.error('Botão "PRÓXIMA" não encontrado.');
        }
      });
      await new Promise(resolve => setTimeout(resolve, 15000));
      const account = await axios.post(
        url + '/api/account',
        {
          password: 'Money4Life#',
          useragent: randomUserAgent,
          user_id: data.user_id,
          username: data.username,
          data: data,
          email: email,
          address: address


        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      console.log(account)
      await new Promise(resolve => setTimeout(resolve, 15000));


    } catch (error) {
      console.log(error)
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

    async function buttonNext(page) {
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const button = buttons.find(btn => {
          const span = btn.querySelector('span');
          // @ts-ignore
          return span && span.textContent.trim() === 'Avançar';
        });
        if (button) {

          button.click();
        }
      });
    }

    async function notLogin(page){
      const notLogin = await page.evaluate((text: string) => {
        return document.body.textContent.includes(text);
      }, 'Não foi possível fazer o login');

      const notBot = await page.evaluate((text: string) => {
        return document.body.textContent.includes(text);
      }, 'Confirme que você não é um robô');

      const captcha = await page.evaluate((text: string) => {
        return document.body.textContent.includes(text);
      }, 'CAPTCHA Security check');
      const emailExist = await page.evaluate((text: string) => {
        return document.body.textContent.includes(text);
      }, 'Parece que já tem uma conta Betano. Por favor, digite sua senha para continuar.');

      const signin = await page.evaluate((text: string) => {
        return document.body.textContent.includes(text);
      }, 'Sign in');

      const incom = await page.evaluate((text: string) => {
        return document.body.textContent.includes(text);
      }, 'Detectamos uma atividade ');


      if (notLogin || notBot || captcha || emailExist || signin || incom) {

        browser.close()
        return
      }
    }
  }


}
