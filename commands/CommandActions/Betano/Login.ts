import NoteLogin from "../NoteLogin";

const Login = async (page, browser) => {
  console.log('Entrou no componente que loga a betano');

  try {
    await page.waitForSelector('span', {timeout: 30000});

    const spans = await page.$$('span');

    for (let span of spans) {
      const textContent = await page.evaluate(el => el.textContent.trim(), span);
      if (textContent === 'Registrar com Google') {
        await span.click();
        console.log('Clicou para logar com email');
        break;
      }
    }

    await new Promise(resolve => setTimeout(resolve, 10000));

    const pages = await browser.pages();
    const popup = pages[pages.length - 1];

    console.log('Número de páginas abertas: ', pages.length);
    console.log('Página principal: ', pages[0].url());
    console.log('Popup: ', popup.url());

    if (popup) {
      console.log('Abriu popup do google pra logar');

      await popup.setExtraHTTPHeaders({
        'accept-language': 'pt-BR,pt;q=0.9',
      });

      await NoteLogin(page, browser);

      // Focar no popup antes de realizar ações de teclado
      await popup.bringToFront();

      // Verificar se o popup está focado
      const isPopupFocused = await popup.evaluate(() => document.hasFocus());
      console.log('Popup está focado: ', isPopupFocused);

      await new Promise(resolve => setTimeout(resolve, 2000));

      await popup.keyboard.press('Tab');
      await new Promise(resolve => setTimeout(resolve, 1000));
      await popup.keyboard.press('Tab');
      await new Promise(resolve => setTimeout(resolve, 1000));
      await popup.keyboard.press('Enter');

      console.log('Selecionou o email e apertou enter');

      await new Promise(resolve => setTimeout(resolve, 10000));

      const spansContinue = await popup.$$('span');

      for (let next of spansContinue) {
        const text = await popup.evaluate(element => element.textContent.trim(), next);
        if (text === 'Continue') {
          console.log('antes de clicar no botão de continue para logar');
          await next.click();
          console.log('Clicou no botão de continue para logar');
          break;
        }
      }

      await new Promise(resolve => setTimeout(resolve, 10000));
      console.log('FIM do componente que loga a betano');
    }
  } catch (error) {
    console.error('Erro durante o login na Betano:', error);
  }
};

export default Login;
