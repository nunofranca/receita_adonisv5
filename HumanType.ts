const HumanType = async (page, selector, value) => {
  const element = await page.$(selector);
  if (element) {
    // Simular movimento do mouse até o elemento
    const boundingBox = await element.boundingBox();
    await page.mouse.move(
      boundingBox.x + boundingBox.width / 2,
      boundingBox.y + boundingBox.height / 2
    );

    await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 800) + 200)); // Atraso aleatório entre 500ms e 1500ms

    // Selecionar o valorv

    await page.type(selector, value, {delay: Math.floor(Math.random() * 700) + 200});
  }
}
export default HumanType
