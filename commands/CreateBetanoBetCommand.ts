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
    let browser;
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

// Função para limpar o diretório do perfil do usuário


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
        '--proxy-server=http://' + proxy.proxy,
        // '--proxy-server=http://ipv6-ww.lightningproxies.net:10000',
        '--start-maximized',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080',
        '--disable-features=IsolateOrigins,site-per-process',
        // '--user-data-dir=../profiles/dateBirth'
      ],
    });
    console.log('Iniciou o Launch')
    try {


      if (data.betano === null) {
        const pageBetano = await browser.newPage();
        await pageBetano.authenticate({
          username: proxy.username,
          password: proxy.password,
        });
        await pageBetano.goto('https://brbetano.com/register', {timeout: 180000});
        console.log('Abriu a página da betano pra verificar se email o CPF já estão cadastrados')

        await new Promise(resolve => setTimeout(resolve, 5000));
        await pageBetano.evaluate(() => {
          const registerEmail = Array.from(document.querySelectorAll('span'));
          // @ts-ignore
          const next = registerEmail.find(span => span.textContent.trim() === 'Registrar com email');
          if (next) {
            next.click();
          }
        });


        await new Promise(resolve => setTimeout(resolve, 5000));
        await pageBetano.type('#tax-number', data.cpf);
        console.log('Digitou o CPF');
        await new Promise(resolve => setTimeout(resolve, 2000));
        const cpfExist = await pageBetano.evaluate(() => {
          return document.body.innerText.includes('Este CPF já existe');
        });
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (cpfExist) {
          console.log('CPF já existe: ', cpfExist);
          await axios.delete(`${url}/api/data/${data.id}`);
          console.log(`${data.cpf} foi deletado do sistema`);
          await browser.close();
        } else {
          await axios.put(`${url}/api/data/${data.id}`, {
            betano: false
          });
          console.log('CPF não está cadastrado na Betano');
        }
        new Promise(resolve => setTimeout(resolve, 2000));

        pageBetano.type('#email', email.email);
        console.log('Digitou o email');
        await new Promise(resolve => setTimeout(resolve, 2000));
        const emailExist = await pageBetano.evaluate(() => {
          return document.body.innerText.includes('Este email já está sendo utilizado');
        });

        if (emailExist) {
          axios.delete(url + '/api/email/' + data.id)
            .then(() => {
              console.log(email.email + ' Já tem cadastro e foi deletado')
            })
          browser.close()
          return
        }
        console.log('Email e CPF disponíveis para cadastro');

        await new Promise(resolve => setTimeout(resolve, 2000));
        pageBetano.close()
      }
      const pageGoogle = await browser.newPage();
      // Aumentar tempos de espera padrão
      await pageGoogle.setDefaultNavigationTimeout(60000);
      await pageGoogle.setDefaultTimeout(60000);


      const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
      await pageGoogle.setUserAgent(randomUserAgent);
      console.log('Setou o userargent')
      // Definindo cabeçalhos HTTP adicionais para pt-BR
      await pageGoogle.setExtraHTTPHeaders({
        'accept-language': 'pt-BR,pt;q=0.9',
      });


      await pageGoogle.authenticate({
        username: proxy.username,
        password: proxy.password,
      });

      console.log('Autenticou no proxy')
      const randomMouseMovePopup = async () => {
        await pageGoogle.mouse.move(
          Math.floor(Math.random() * 800), // Coordenada X aleatória na página
          Math.floor(Math.random() * 600) // Coordenada Y aleatória na página
        );
      };


      await pageGoogle.goto('https://accounts.google.com/v3/signin/identifier?continue=https%3A%2F%2Fwww.google.com.br%2F&ec=GAZAmgQ&hl=pt-BR&ifkv=AS5LTAQniEoHUgJl13A3qmCBu5onhiRkW3pIYGnnK22SMJxAfC75ulKzXXMtDamun64Ls4b5jN2HpA&passive=true&flowName=GlifWebSignIn&flowEntry=ServiceLogin&dsh=S-218042109%3A1717111244684717&ddm=0', {timeout: 60000});
      await randomMouseMovePopup();
      await new Promise(resolve => setTimeout(resolve, 15000));
      console.log(data.cpf + ' Abriu a página do google')

      // @ts-ignore
      await pageGoogle.waitForSelector('#identifierId', {visible: true});
      console.log(data.cpf + ' Adicionou a email principal')
      await new Promise(resolve => setTimeout(resolve, 5000));
      await randomMouseMovePopup();
      await pageGoogle.type('#identifierId', email.email)
      console.log('Adicionou a email principal: ' + email.email)
      await randomMouseMovePopup();
      await new Promise(resolve => setTimeout(resolve, 5000));
      await buttonNext(pageGoogle)

      await randomMouseMovePopup();

      await new Promise(resolve => setTimeout(resolve, 5000));
      await randomMouseMovePopup();
      await notLogin(pageGoogle)

      await new Promise(resolve => setTimeout(resolve, 5000));

      await randomMouseMovePopup();
      await pageGoogle.waitForSelector('#password', {visible: true});
      await new Promise(resolve => setTimeout(resolve, 5000));
      await pageGoogle.type('#password', email.password);
      console.log('Adicionou a senha do email: ' + email.password)
      await randomMouseMovePopup();


      await new Promise(resolve => setTimeout(resolve, 5000));

      await randomMouseMovePopup();

      await buttonNext(pageGoogle)


      await new Promise(resolve => setTimeout(resolve, 10000));

      // await notLogin(page)
      try {

        await pageGoogle.evaluate(() => {

          const divs = Array.from(document.querySelectorAll('div'));
          const div = divs.find(div => {
            console.log('Pediu para escolhe a forma de recuperação de email')
            // @ts-ignore
            return div && div.textContent.trim() === 'Confirme seu e-mail de recuperação';

          });
          if (div) {
            div.click();
            console.log('Clicou no botao para seguir')
          } else {
            console.error('Botão "PRÓXIMA" não encontrado.');
          }
        });
      } catch (error) {
        console.log(error)
      }
      await randomMouseMovePopup();
      await pageGoogle.waitForSelector('input[type="email"]', {visible: true});
      await new Promise(resolve => setTimeout(resolve, 7000));
      try {
        const isEmailInputPresent = await pageGoogle.evaluate(() => {
          return !!document.querySelector('input[type="email"]');
        });


        if (isEmailInputPresent) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          await pageGoogle.type('input[type="email"]', email.emailRecovery);
          console.log('Adicionou o email de recuperacação ' + email.emailRecovery)
          await new Promise(resolve => setTimeout(resolve, 5000));
          await buttonNext(pageGoogle)

        }
      } catch (error) {

        await browser.close();
      }

      const pageBetano = await  browser.newPage()
      await pageBetano.authenticate({
        username: proxy.username,
        password: proxy.password,
      });
      await pageBetano.setDefaultNavigationTimeout(60000);
      await pageBetano.setDefaultTimeout(60000);
      await new Promise(resolve => setTimeout(resolve, 30000));
      const randomUserAgentBetano = userAgentBetano[Math.floor(Math.random() * userAgentBetano.length)];
      await pageBetano.setUserAgent(randomUserAgentBetano);
      await pageBetano.setViewport({
        width: Math.floor(Math.random() * (1920 - 800 + 1)) + 800,
        height: Math.floor(Math.random() * (1080 - 600 + 1)) + 600,

        deviceScaleFactor: 1
      });


      await pageBetano.goto('https://brbetano.com/register', {timeout: 180000});
      console.log('Abriu a pagina da betano')
      await pageBetano.waitForSelector('body');

      await new Promise(resolve => setTimeout(resolve, 3000));


      // @ts-ignore
      await new Promise(resolve => setTimeout(resolve, 7000));


      await pageBetano.evaluate(() => {
        const loginGoogle = Array.from(document.querySelectorAll('span'));
        // @ts-ignore
        const next = loginGoogle.find(span => span.textContent.trim() === 'Registrar com Google');
        if (next) {
          next.click();
          console.log('Clicou para logar com email')
        } else {
          console.error('Botão "Continue" não encontrado.');
        }
      });


      await new Promise(resolve => setTimeout(resolve, 10000));
      // Espera até que uma nova página seja aberta (pop-up)
      const pages = await browser.pages();

      const popup = pages[pages.length - 1]
      await popup.setUserAgent(randomUserAgent);

      console.log('Abriu popup do google pra logar')
      await popup.setExtraHTTPHeaders({
        'accept-language': 'pt-BR,pt;q=0.9',
      });

      try {
        await new Promise(resolve => setTimeout(resolve, 7000));
        await popup.keyboard.press('Tab');
        await popup.keyboard.press('Tab');
        await popup.keyboard.press('Enter');
        console.log('Selecionou o email e apertou enter')

        await new Promise(resolve => setTimeout(resolve, 12000));
        await popup.evaluate(() => {
          const nextt = Array.from(document.querySelectorAll('span'));
          // @ts-ignore
          const next = nextt.find(span => span.textContent.trim() === 'Continue');
          if (next) {
            next.click();
            console.log('Clicou no botão de continue para logar')

          } else {
            console.error('Botão "Continue" não encontrado.');
          }
        });

      } catch (error) {
        console.log(error)
      }
      await new Promise(resolve => setTimeout(resolve, 10000));

      const date = new Date(data.dateBirth);
      const day = String(date.getUTCDate()).padStart(2, '0'); // Converte para string e garante dois dígitos
      const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Converte para string e garante dois dígitos
      const year = String(date.getUTCFullYear()); // Converte para string
      await new Promise(resolve => setTimeout(resolve, 15000));

      await pageBetano.waitForSelector('#day', {visible: true});
      await pageBetano.select('#day', day);
      console.log('Adicionou o dia de nascimento ' + day)

      await pageBetano.select('#month', month);
      console.log('Adicionou o mês de nascimento ' + month)
      await pageBetano.waitForSelector('#year', {visible: true});
      await pageBetano.select('#year', year);
      console.log('Adicionou o ano de nascimento ' + year)
      await pageBetano.waitForSelector('#tax-number', {visible: true});
      await new Promise(resolve => setTimeout(resolve, 2000));
      await pageBetano.type('#tax-number', data.cpf);
      await new Promise(resolve => setTimeout(resolve, 2000));
      const cpfExist2 = await pageBetano.evaluate(() => {
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

      async function clickProxima() {
        await pageBetano.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const button = buttons.find(btn => {
            const span = btn.querySelector('span');
            // @ts-ignore
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
      const addressProxy = await axios.get(url + '/api/cep/' + proxy.slug);
      console.log('Fez a requisição para pegar o proxy')
      const addressReq = await axios.get('https://viacep.com.br/ws/' + addressProxy.data.cep + '/json/');
      console.log('Fez a requisição no VIACEP')
      await new Promise(resolve => setTimeout(resolve, 10000));
      const addressApi = addressReq.data
      console.log(addressApi)

      try {
        await pageBetano.waitForSelector('#street', {visible: true});
        await new Promise(resolve => setTimeout(resolve, 2000));
        await pageBetano.type("#street", addressApi.logradouro.replace(/[^a-zA-Z0-9 ]/g, ''))
        console.log('Adicionou o nome da rua: ' + addressApi.logradouro.replace(/[^a-zA-Z0-9 ]/g, ''))
        await new Promise(resolve => setTimeout(resolve, 2000));
        await pageBetano.waitForSelector('#city', {visible: true});
        await pageBetano.type("#city", addressApi.localidade.replace(/[^a-zA-Z0-9 ]/g, ''))
        console.log('Adicionou a cidade: ' + addressApi.localidade.replace(/[^a-zA-Z0-9 ]/g, ''))
        await new Promise(resolve => setTimeout(resolve, 2000));
        await pageBetano.waitForSelector('#postalcode', {visible: true});
        await pageBetano.type("#postalcode", addressApi.cep)
        console.log('Adicionou o CEP: ' + addressApi.cep)
        await new Promise(resolve => setTimeout(resolve, 2000));
        await pageBetano.waitForSelector('#mobilePhone', {visible: true});
        await pageBetano.type("#mobilePhone", address.phone)
        console.log('Adicionou o Telefone: ' + address.phone)
      } catch (error) {
        console.log(error)
      }


      await new Promise(resolve => setTimeout(resolve, 2000));
      await clickProxima()
      console.log('Clicou no botão para a próxima pagina')
      await new Promise(resolve => setTimeout(resolve, 7000));
      await pageBetano.focus('#username');
      await pageBetano.keyboard.down('Control');
      await pageBetano.keyboard.press('A');
      await pageBetano.keyboard.up('Control');
      await pageBetano.keyboard.press('Backspace');
      console.log('Deletou o username padrão')
      await new Promise(resolve => setTimeout(resolve, 2000))
      await pageBetano.type('#username', data.username)
      console.log('Adicinou o useraname: ' + data.username)
      // const username = await page.evaluate(selector => {
      //   return document.querySelector(selector).value;
      // }, '#username');
      await new Promise(resolve => setTimeout(resolve, 2000));
      await pageBetano.waitForSelector('input[type="password"]', {visible: true});
      await pageBetano.type('input[type="password"]', 'Money4Life#')
      console.log('Adicinou a senha')
      await new Promise(resolve => setTimeout(resolve, 6000))

      await clickProxima()
      console.log('Clicou no botão para a próxima pagina')
      await new Promise(resolve => setTimeout(resolve, 8000));
      const checkbox = await pageBetano.$('span.checkbox-check.tw-rounded-xs');
      if (checkbox) {
        await checkbox.click();
        console.log('Clicou no checkbox');
      } else {
        console.error('Checkbox não encontrado.');
      }


      await new Promise(resolve => setTimeout(resolve, 8000));
      await pageBetano.evaluate(() => {
        const buttonRegister = Array.from(document.querySelectorAll('button'));
        const register = buttonRegister.find(regis => {
          const span = regis.querySelector('span');
          // @ts-ignore
          return span && span.textContent.trim() === 'REGISTRAR';
        });

        if (register) {
          register.click();
          console.log('Clicou no botao de registrar')


        } else {
          console.error('Botão "PRÓXIMA" não encontrado.');
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

    async function

    notLogin(page) {
      const notLogin = await page.evaluate((text: string) => {
        return document.body.textContent.includes(text);
      }, 'Não foi possível fazer o login');

      const notBot = await page.evaluate((text: string) => {
        // @ts-ignore
        return document.body.textContent.includes(text);
      }, 'Confirme que você não é um robô');

      const captcha = await page.evaluate((text: string) => {
        // @ts-ignore
        return document.body.textContent.includes(text);
      }, 'CAPTCHA Security check');
      const emailExist = await page.evaluate((text: string) => {
        // @ts-ignore
        return document.body.textContent.includes(text);
      }, 'Parece que já tem uma conta Betano. Por favor, digite sua senha para continuar.');

      const signin = await page.evaluate((text: string) => {
        // @ts-ignore
        return document.body.textContent.includes(text);
      }, 'Sign in');

      const incom = await page.evaluate((text: string) => {
        // @ts-ignore
        return document.body.textContent.includes(text);
      }, 'Detectamos uma atividade');


      if (notLogin || notBot || captcha || emailExist || signin || incom) {

        browser.close()
        return
      }
      console.log('Tudo ok nas verificações de login')
      return
    }
  }


}
