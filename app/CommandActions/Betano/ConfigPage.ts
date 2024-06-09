
const ConfigPage =async (page)=>{


  await page.setViewport({
    width: Math.floor(Math.random() * (1920 - 800 + 1)) + 800,
    height: Math.floor(Math.random() * (1080 - 600 + 1)) + 600,

    deviceScaleFactor: 1
  });
  await page.goto('https://brbetano.com/register', {timeout: 180000});
}
export default ConfigPage
