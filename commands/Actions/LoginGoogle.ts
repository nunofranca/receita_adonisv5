import userAgents from "../../userAgents";

import NoteLogin from "./NoteLogin";
import ButtonNext from "./ButtonNext";
import RandomUserAgent from "./RandomUserAgent";
import AuthProxy from "./Betano/AuthProxy";



const LoginGoogle = async (email, data, proxy, browser) => {

  console.log('Entrou no componente que loga no google')
  const page = await browser.newPage();
  await AuthProxy(proxy, page)
  // Aumentar tempos de espera padrão
  await page.setDefaultNavigationTimeout(60000);
  await page.setDefaultTimeout(60000);

  const randomUserAgent = await RandomUserAgent()
  await page.setUserAgent(randomUserAgent);
  console.log('Setou o userargent')
  // Definindo cabeçalhos HTTP adicionais para pt-BR
  await page.setExtraHTTPHeaders({
    'accept-language': 'pt-BR,pt;q=0.9',
  });

  console.log('Autenticou no proxy')
  const randomMouseMovePopup = async () => {
    await page.mouse.move(
      Math.floor(Math.random() * 800), // Coordenada X aleatória na página
      Math.floor(Math.random() * 600) // Coordenada Y aleatória na página
    );
  };
  await new Promise(resolve => setTimeout(resolve, 5000));

  await page.goto('https://accounts.google.com/v3/signin/identifier?continue=https%3A%2F%2Fwww.google.com.br%2F&ec=GAZAmgQ&hl=pt-BR&ifkv=AS5LTAQniEoHUgJl13A3qmCBu5onhiRkW3pIYGnnK22SMJxAfC75ulKzXXMtDamun64Ls4b5jN2HpA&passive=true&flowName=GlifWebSignIn&flowEntry=ServiceLogin&dsh=S-218042109%3A1717111244684717&ddm=0', {timeout: 60000});
  await randomMouseMovePopup();
  await new Promise(resolve => setTimeout(resolve, 15000));
  console.log(data.cpf + ' Abriu a página do google')

  // @ts-ignore
  await page.waitForSelector('#identifierId', {visible: true});
  await new Promise(resolve => setTimeout(resolve, 5000));
  await randomMouseMovePopup();
  await page.type('#identifierId', email.email)
  console.log('Adicionou a email principal: ' + email.email)
  await randomMouseMovePopup();
  await new Promise(resolve => setTimeout(resolve, 3000));
  await ButtonNext(page)
  await new Promise(resolve => setTimeout(resolve, 12000));


  await randomMouseMovePopup();
  await NoteLogin(page, browser)
  await new Promise(resolve => setTimeout(resolve, 5000));
  await page.waitForSelector('#password', {visible: true});

  await page.type('#password', email.password);
  console.log('Adicionou a senha do email: ' + email.password)
  await new Promise(resolve => setTimeout(resolve, 3000));
  await randomMouseMovePopup();
// Esperar pelo carregamento dos divs
  await ButtonNext(page)
  await new Promise(resolve => setTimeout(resolve, 20000));

  // Encontrar todos os divs
  const divs = await page.$$('div');
  let found = false;

  for (let div of divs) {
    const textContent = await page.evaluate(el => el.textContent.trim(), div);
    if (textContent === 'Confirme seu e-mail de recuperação') {
      await div.click();
      console.log('Clicou no botão para seguir');
      found = true;
      break;
    }
  }

  if (!found) {
    console.error('Botão "Confirme seu e-mail de recuperação" não encontrado.');
    return
  }
  await new Promise(resolve => setTimeout(resolve, 10000));

  await page.waitForSelector('input[type="email"]', {visible: true});
  await new Promise(resolve => setTimeout(resolve, 7000));

  const isEmailInputPresent = await page.evaluate(() => {
    return !!document.querySelector('input[type="email"]');
  });


  if (isEmailInputPresent) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    await page.type('input[type="email"]', email.emailRecovery);
    console.log('Adicionou o email de recuperacação ' + email.emailRecovery)
    await new Promise(resolve => setTimeout(resolve, 5000));
    await ButtonNext(page)
    await new Promise(resolve => setTimeout(resolve, 7000));
  }

  console.log('FIM do componente que loga no google')
}
export default LoginGoogle
