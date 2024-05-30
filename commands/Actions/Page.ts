// @ts-ignore
import { Browser } from "puppeteer";
// @ts-ignore
import userAgents from "../../userAgents";

const Page = async (browser: Browser, proxy: { username: string; password: string; }) =>{
  const page = await browser.newPage();

  const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
  await page.setUserAgent(randomUserAgent);


  // Definindo cabeçalhos HTTP adicionais para pt-BR
  await page.setExtraHTTPHeaders({
    'accept-language': 'pt-BR,pt;q=0.9',
  });

  await page.authenticate({
    username: proxy.username,
    password: proxy.password,
  });

  return page
}
export default Page
