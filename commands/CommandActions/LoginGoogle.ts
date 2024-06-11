import RandomUserAgent from "./RandomUserAgent";
import ButtonNext from "./ButtonNext";
import NoteLogin from "./NoteLogin";


const LoginGoogle = async (email, page, browser) => {

  console.log('Entrou no componente que loga no google');

  // Aumentar tempos de espera padrão
  await page.setDefaultNavigationTimeout(60000);
  await page.setDefaultTimeout(60000);

  const randomUserAgent = await RandomUserAgent();
  await page.setUserAgent(randomUserAgent);

  await page.setExtraHTTPHeaders({
    'accept-language': 'pt-BR,pt;q=0.9',
  });


  const randomMouseMovePopup = async () => {
    await page.mouse.move(
      Math.floor(Math.random() * 800), // Coordenada X aleatória na página
      Math.floor(Math.random() * 600) // Coordenada Y aleatória na página
    );
  };


  try {
    await randomMouseMovePopup();
    await page.focus('#identifierId');
    await new Promise(resolve => setTimeout(resolve, 700));
    await page.type('#identifierId', email.email, {delay: 150});
    await randomMouseMovePopup();
    await new Promise(resolve => setTimeout(resolve, 3000));
    await ButtonNext(page);
    await randomMouseMovePopup();
    await NoteLogin(page, browser);


    await new Promise(resolve => setTimeout(resolve, 5000));

    await page.focus('#password');
    await new Promise(resolve => setTimeout(resolve, 800));
    await page.type('#password', email.password, {delay: 150});

    await ButtonNext(page);
    await new Promise(resolve => setTimeout(resolve, 10000));

    await randomMouseMovePopup();

    await new Promise(resolve => setTimeout(resolve, 10000));

    // Encontrar todos os divs
    const divs = await page.$$('div');
    let found = false;

    for (let div of divs) {
      const textContent = await page.evaluate(el => el.textContent.trim(), div);
      if (textContent === 'Confirm your recovery email') {
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
      await page.focus('input[type="email"]');
      await new Promise(resolve => setTimeout(resolve, 800));
      await page.type('input[type="email"]', email.emailRecovery, {delay: 150});
      console.log('Adicionou o email de recuperacação ' + email.emailRecovery)
      await new Promise(resolve => setTimeout(resolve, 5000));
      await ButtonNext(page)

    }


  } catch (error) {
    console.error('Erro durante o login no Google:', error);
  }
};

export default LoginGoogle;
