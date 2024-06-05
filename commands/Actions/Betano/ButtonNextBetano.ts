const ButtonNextBetano = async (page) => {
    console.log('Entrou no componente que aperta o botao de próximo');

// Espera o seletor do botão com data-qa="next" aparecer na página
    await page.waitForSelector('button[data-qa="next"]', { visible: true });

// Encontra e clica no botão com data-qa="next"
    await page.evaluate(() => {
        const nextButton = document.querySelector('button[data-qa="next"]') as HTMLButtonElement | null;
        if (nextButton) {
            nextButton.click();
        }
    });

    console.log('FIM do componente que aperta o botao de próximo');


}
export default ButtonNextBetano
