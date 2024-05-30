import { Page, Browser } from "puppeteer";

const LoginGoogle = async (page: Page, email: { email: any; }, browser: Browser) => {
  await page.goto('https://accounts.google.com/v3/signin/identifier?continue=https%3A%2F%2Fwww.google.com.br%2F&ec=GAZAmgQ&hl=pt-BR&ifkv=AaSxoQzmgJ1cLzhz_RiZ3Q_19cFM6u5VCAKcx4o-dsaHREFzhBKIGnayemNomS5mNUMjEekDd4kK&passive=true&flowName=GlifWebSignIn&flowEntry=ServiceLogin&dsh=S1275832598%3A1716502765207858&ddm=0', {
    waitUntil: 'networkidle0' // Espera até que não haja mais de 0 conexões de rede por pelo menos 500ms
  });

  try {

  await page.waitForSelector('#identifierId', {visible: true});

  await page.type('#identifierId', email.email);

  await buttons(page, 'Avançar')


    await new Promise(resolve => setTimeout(resolve, 50544500));
    await page.waitForSelector('#password', { visible: true });

  } catch (error) {

  } finally {
    await browser.close();
  }




  await new Promise(resolve => setTimeout(resolve, 2000));
  await page.keyboard.press('Tab');

  await page.keyboard.press('Tab');

  await page.keyboard.press('Enter');


  await new Promise(resolve => setTimeout(resolve, 10000));
  await page.keyboard.down('Shift');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.up('Shift');

  await new Promise(resolve => setTimeout(resolve, 10000));
  await page.keyboard.press('Enter');
  await new Promise(resolve => setTimeout(resolve, 20000));
}

const buttons = async (page, text) =>{
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const button = buttons.find(btn => {
      const span = btn.querySelector('span');
      // @ts-ignore
      return span && span.textContent.trim() === text;
    });
    if (button) {

      button.click();
    }
  });
}
export default LoginGoogle
