const LoginGoogle = async (page) => {
  await page.goto('https://accounts.google.com/v3/signin/identifier?continue=https%3A%2F%2Fwww.google.com.br%2F&ec=GAZAmgQ&hl=pt-BR&ifkv=AaSxoQzmgJ1cLzhz_RiZ3Q_19cFM6u5VCAKcx4o-dsaHREFzhBKIGnayemNomS5mNUMjEekDd4kK&passive=true&flowName=GlifWebSignIn&flowEntry=ServiceLogin&dsh=S1275832598%3A1716502765207858&ddm=0', {timeout: 60000});

  // @ts-ignore
  await page.waitForSelector('#identifierId', {visible: true});
  await new Promise(resolve => setTimeout(resolve, 10000));
  await page.type('#identifierId', email.email);
  await new Promise(resolve => setTimeout(resolve, 10000));
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await new Promise(resolve => setTimeout(resolve, 10000000));
  await new Promise(resolve => setTimeout(resolve, randomDelay()));
  await page.keyboard.press('Enter');


  await page.waitForSelector('#password', {visible: true});
  await new Promise(resolve => setTimeout(resolve, 10000));
  await page.type('#password', email.password);


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

export default LoginGoogle
