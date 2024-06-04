import userAgents from "../../userAgents";

import NoteLogin from "./NoteLogin";
import ButtonNext from "./ButtonNext";
import RandomUserAgent from "./RandomUserAgent";


const LoginGoogle = async (email, data, proxy, browser) => {
  const pageGoogle = await browser.newPage();
  // Aumentar tempos de espera padrão
  await pageGoogle.setDefaultNavigationTimeout(60000);
  await pageGoogle.setDefaultTimeout(60000);

  const randomUserAgent = await RandomUserAgent()
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
  await new Promise(resolve => setTimeout(resolve, 5000));

  await pageGoogle.goto('https://accounts.google.com/v3/signin/identifier?continue=https%3A%2F%2Fwww.google.com.br%2F&ec=GAZAmgQ&hl=pt-BR&ifkv=AS5LTAQniEoHUgJl13A3qmCBu5onhiRkW3pIYGnnK22SMJxAfC75ulKzXXMtDamun64Ls4b5jN2HpA&passive=true&flowName=GlifWebSignIn&flowEntry=ServiceLogin&dsh=S-218042109%3A1717111244684717&ddm=0', {timeout: 60000});
  await randomMouseMovePopup();
  await new Promise(resolve => setTimeout(resolve, 15000));
  console.log(data.cpf + ' Abriu a página do google')

  // @ts-ignore
  await pageGoogle.waitForSelector('#identifierId', {visible: true});
  await new Promise(resolve => setTimeout(resolve, 5000));
  await randomMouseMovePopup();
  await pageGoogle.type('#identifierId', email.email)
  console.log('Adicionou a email principal: ' + email.email)
  await randomMouseMovePopup();
  await new Promise(resolve => setTimeout(resolve, 5000));
  await ButtonNext(pageGoogle)


  await randomMouseMovePopup();
  await NoteLogin(pageGoogle, browser)
  await new Promise(resolve => setTimeout(resolve, 10000));
  await pageGoogle.waitForSelector('#password', {visible: true});

  await pageGoogle.type('#password', email.password);
  console.log('Adicionou a senha do email: ' + email.password)
  await randomMouseMovePopup();
// Esperar pelo carregamento dos divs
  await ButtonNext(pageGoogle)
  await new Promise(resolve => setTimeout(resolve, 20000));

  // Encontrar todos os divs
  const divs = await pageGoogle.$$('div');
  let found = false;

  for (let div of divs) {
    const textContent = await pageGoogle.evaluate(el => el.textContent.trim(), div);
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

  await pageGoogle.waitForSelector('input[type="email"]', {visible: true});
  await new Promise(resolve => setTimeout(resolve, 7000));

  const isEmailInputPresent = await pageGoogle.evaluate(() => {
    return !!document.querySelector('input[type="email"]');
  });


  if (isEmailInputPresent) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    await pageGoogle.type('input[type="email"]', email.emailRecovery);
    console.log('Adicionou o email de recuperacação ' + email.emailRecovery)
    await new Promise(resolve => setTimeout(resolve, 5000));
    await ButtonNext(pageGoogle)
    await new Promise(resolve => setTimeout(resolve, 7000));
  }


}
export default LoginGoogle
