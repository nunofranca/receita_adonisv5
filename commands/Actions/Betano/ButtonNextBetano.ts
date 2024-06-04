const ButtonNextBetano = async (page) => {

    const buttons = await page.$$('button');

    for (let button of buttons) {
        const textContent = await page.evaluate(el => el.textContent.trim(), button);
        if (textContent === 'PRÓXIMO') {
            await button.click();
            break;
        }
    }
}
export default ButtonNextBetano
