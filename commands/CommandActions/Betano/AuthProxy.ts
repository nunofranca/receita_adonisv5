const AuthProxy =async (proxy, page) =>{

  // await page.authenticate({
  //   username: proxy.username,
  //   password: proxy.password,
  // });

  await page.authenticate({
    username: proxy.username,
    password: proxy.password
  });
  // await page.authenticate({
  //   username: proxy.username,
  //   password: proxy.password,
  // });
}
export default AuthProxy
