const NoteLogin =async (page, browser)=>{
  const notLogin = await page.evaluate((text: string) => {
    return document.body.textContent.includes(text);
  }, 'Não foi possível fazer o login');

  const notBot = await page.evaluate((text: string) => {
    // @ts-ignore
    const not = document.body.textContent.includes(text);
    if (not) console.log('Confirme que você não é um robô')
    return not
  }, 'Confirme que você não é um robô');

  const captcha = await page.evaluate((text: string) => {
    // @ts-ignore
    document.body.textContent.includes(text);
    const not = document.body.textContent.includes(text);
    if (not) console.log('CAPTCHA Security check')
    return not
  }, 'CAPTCHA Security check');
  const emailExist = await page.evaluate((text: string) => {

    const not = document.body.textContent.includes(text);
    if (not) console.log('Parece que já tem uma conta Betano. Por favor, digite sua senha para continuar')
    return not
  }, 'Parece que já tem uma conta Betano. Por favor, digite sua senha para continuar.');

  const signin = await page.evaluate((text: string) => {
    // @ts-ignore
    const not = document.body.textContent.includes(text);
    if (not) console.log('Sign ink')
    return not
  }, 'Sign in');

  const incom = await page.evaluate((text: string) => {
    // @ts-ignore
    const not = document.body.textContent.includes(text);
    if (not) console.log('Detectamos uma atividade')
  }, 'Detectamos uma atividade');


  if (notLogin || notBot || captcha || emailExist || signin || incom) {

    browser.close()
    return
  }
  console.log('Tudo ok nas verificações de login')
  return
}
export default NoteLogin
