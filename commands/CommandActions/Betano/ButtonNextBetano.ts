const ButtonNextBetano = async (page) => {
  console.log('Entrou no componente que aperta o botao de próximo');
  const element = await page.$('button[data-qa="next"]');

  if (element) {
    // Obter as dimensões do elemento
    const boundingBox = await element.boundingBox();

    // Coordenadas do centro do elemento
    const targetX = boundingBox.x + boundingBox.width / 2;
    const targetY = boundingBox.y + boundingBox.height / 2;

    // Coordenadas atuais do mouse (supondo que o mouse começa na posição 0, 0)
    let currentX = 0;
    let currentY = 0;

    // Função para mover o mouse de maneira gradual
    const moveMouseGradually = async (startX, startY, endX, endY, steps) => {
      const deltaX = (endX - startX) / steps;
      const deltaY = (endY - startY) / steps;

      for (let i = 0; i < steps; i++) {
        currentX += deltaX;
        currentY += deltaY;
        await page.mouse.move(currentX, currentY);
        await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 50) + 25)); // Atraso aleatório entre 25ms e 75ms
      }
    };

    // Mover o mouse até o centro do botão
    await moveMouseGradually(currentX, currentY, targetX, targetY, 20);

    // Adicionar um atraso aleatório para simular comportamento humano
    await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 200) + 50));

    // Clicar no botão
    await element.click();
  }

  console.log('FIM do componente que aperta o botao de próximo');
}

export default ButtonNextBetano;
