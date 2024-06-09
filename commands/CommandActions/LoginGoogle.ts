import userAgents from "../../userAgents";
import NoteLogin from "./NoteLogin";
import ButtonNext from "./ButtonNext";
import RandomUserAgent from "./RandomUserAgent";
import AuthProxy from "./Betano/AuthProxy";
import LaunchGoogle from "./LaunchGoogle";

const LoginGoogle = async (email, data, proxy) => {
  console.log(proxy);
  console.log('Entrou no componente que loga no google');

  const browser = await LaunchGoogle(proxy)

  const page = await browser.newPage();
  await AuthProxy(proxy, page);
  const cookies = await page.cookies();

  // Aumentar tempos de espera padrão
  await page.setDefaultNavigationTimeout(60000);
  await page.setDefaultTimeout(60000);

  const randomUserAgent = await RandomUserAgent();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  console.log('Setou o useragent');

  // Definindo cabeçalhos HTTP adicionais para pt-BR
  await page.setExtraHTTPHeaders({
    'accept-language': 'pt-BR,pt;q=0.9',
  });

  console.log('Autenticou no proxy');

  const randomMouseMovePopup = async () => {
    await page.mouse.move(
      Math.floor(Math.random() * 800), // Coordenada X aleatória na página
      Math.floor(Math.random() * 600) // Coordenada Y aleatória na página
    );
  };


  try {
    await Promise.all([
      page.waitForNavigation({waitUntil: 'networkidle0'}), // Espera até que a navegação complete
      // page.goto('https://meuip.com', { waitUntil: 'networkidle0' })
      page.goto('https://accounts.google.com/v3/signin/identifier?continue=https%3A%2F%2Fwww.google.com.br%2F&ec=GAZAmgQ&hl=pt-BR&ifkv=AS5LTAQniEoHUgJl13A3qmCBu5onhiRkW3pIYGnnK22SMJxAfC75ulKzXXMtDamun64Ls4b5jN2HpA&passive=true&flowName=GlifWebSignIn&flowEntry=ServiceLogin&dsh=S-218042109%3A1717111244684717&ddm=0', {waitUntil: 'networkidle0'})
    ]);


    await randomMouseMovePopup();

    await page.waitForSelector('#identifierId');
    // await page.locator('#identifierId').fill(email.email);
    console.log('Email: ' + email.email);
    console.log('Senha: ' + email.password);
    console.log('Recuperacao: ' + email.emailRecovery);

    //await randomMouseMovePopup();
    // await new Promise(resolve => setTimeout(resolve, 3000));
    //
    // await ButtonNext(page);
    // await randomMouseMovePopup();
    // await NoteLogin(page, browser);



    // await page.waitForSelector('#password');
    // await page.type('#password', email.password);


    await new Promise(resolve => setTimeout(resolve, 90000));
    await randomMouseMovePopup();

   // await ButtonNext(page);
    //await new Promise(resolve => setTimeout(resolve, 10000));

  //   const divs = await page.$$('div');
  //   let found = false;
  //
  //   for (let div of divs) {
  //     const textContent = await page.evaluate(el => el.textContent.trim(), div);
  //     if (textContent === 'Confirme seu e-mail de recuperação') {
  //       await div.click();
  //       console.log('Clicou no botão para seguir');
  //       found = true;
  //       break;
  //     }
  //   }
  //
  //   if (!found) {
  //     console.error('Botão "Confirme seu e-mail de recuperação" não encontrado.');
  //     return;
  //   }
  //
  //   await new Promise(resolve => setTimeout(resolve, 10000));
  //
  //   const isEmailInputPresent = await page.evaluate(() => {
  //     return !!document.querySelector('input[type="email"]');
  //   });
  //
  //   if (isEmailInputPresent) {
  //     await page.waitForSelector('input[type="email"]');
  //     await page.locator('input[type="email"]').fill(email.emailRecovery);
  //     console.log('Adicionou o email de recuperação ' + email.emailRecovery);
  //     await page.screenshot()
  //     await new Promise(resolve => setTimeout(resolve, 5000));
  //     await ButtonNext(page);
  //   }
  //
  //   await new Promise(resolve => setTimeout(resolve, 10000));
  //   return cookies
  } catch (error) {
    console.error('Erro durante o login no Google:', error);
  }
};

export default LoginGoogle;
