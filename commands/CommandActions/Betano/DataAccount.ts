import HumanType from "../../../HumanType";

const DataAccount = async (page, username) => {

  const selectorUserName = '#username'
  const selectorPassword = 'input[type="password"]'
  await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 1000) + 500)); // Atraso aleatório entre 500ms e 1500ms

  await deleteField(page, selectorUserName)
  await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 1000) + 500)); // Atraso aleatório entre 500ms e 1500ms

  await HumanType(page, selectorUserName, username)
  await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 1000) + 500)); // Atraso aleatório entre 500ms e 1500ms

  console.log('');
  console.log('***************************************************');
  console.log('USERNAME: ' + username)
  console.log('***************************************************');
  console.log('');

  await HumanType(page, selectorPassword, 'Money4Life#')
  await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 1000) + 500));
}

async function deleteField(page, selector) {
  // Focar no campo

  await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 200) + 100)); // Atraso aleatório entre 100ms e 300ms

  // // Selecionar todo o texto no campo
  await page.click(selector, { clickCount: 3 });
  //
  // // Obter o valor atual do campo
  // const text = await page.$eval(selector, el => el.value);

  // Segurar a tecla Backspace para deletar o texto
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('Backspace');
    await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 100) + 50)); // Atraso aleatório entre 50ms e 150ms
  }
}

export default DataAccount
