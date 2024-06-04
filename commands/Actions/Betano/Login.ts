
import NoteLogin from "../NoteLogin";


const Login = async (page, browser) => {
  console.log('Entrou no componente que loga a betano')
  const spans = await page.$$('span');


  for (let span of spans) {
    const textContent = await page.evaluate(el => el.textContent.trim(), span);
    if (textContent === 'Registrar com Google') {
      await span.click();
      console.log('Clicou para logar com email');
      break;
    }
  }


  const pages = await browser.pages();

  const popup = pages[pages.length - 1]


  console.log('Abriu popup do google pra logar')
  await popup.setExtraHTTPHeaders({
    'accept-language': 'pt-BR,pt;q=0.9',
  });
  await new Promise(resolve => setTimeout(resolve, 30000));
  await NoteLogin(popup, browser)
  await new Promise(resolve => setTimeout(resolve, 30000));
  await popup.keyboard.press('Tab');
  await popup.keyboard.press('Tab');
  await popup.keyboard.press('Enter');
  console.log('Selecionou o email e apertou enter')

  await new Promise(resolve => setTimeout(resolve, 30000));
  const spansContinue = await page.$$('span');

  for (let next of spansContinue) {
    const text= await popup.evaluate(element => element.textContent.trim(), next);
    if (text === 'Continue') {
      console.log('antes de clicar no botão de continue para logar');
      await next.click();
      console.log('Clicou no botão de continue para logar');
      break;
    }
  }
  await new Promise(resolve => setTimeout(resolve, 10000));
  await NoteLogin(popup, browser)

  console.log('FIM do componente que loga a betano')

}
export default Login
