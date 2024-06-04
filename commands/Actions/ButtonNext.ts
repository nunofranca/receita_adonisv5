const ButtonNext = async (page) => {
  await page.waitForSelector('button');

  // Encontrar todos os botões
  const buttons = await page.$$('button');
  let found = false;

  for (let button of buttons) {
    const span = await button.$('span');
    if (span) {
      const textContent = await page.evaluate(el => el.textContent.trim(), span);
      if (textContent === 'Avançar') {
        await button.click();
        console.log('Clicou no botão "Avançar"');
        found = true;
        break;
      }
    }
  }

  if (!found) {
    console.error('Botão "Avançar" não encontrado.');
  }
}
export default ButtonNext
