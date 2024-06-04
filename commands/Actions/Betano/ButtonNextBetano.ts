const ButtonNextBetano = async (page) => {
  const buttons = await page.$$('button');
  let nextButton;

  for (let button of buttons) {
    const span = await button.$('span');
    if (span) {
      const textContent = await page.evaluate(el => el.textContent.trim(), span);
      if (textContent === 'PRÓXIMA') {
        nextButton = button;
        break;
      }
    }
  }
  if (nextButton) {
    await nextButton.click();
  }
}
export default ButtonNextBetano
