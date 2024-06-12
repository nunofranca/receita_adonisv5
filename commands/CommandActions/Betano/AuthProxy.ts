const AuthProxy =async (proxy, page) =>{

  await page.authenticate({
    username: 'hee54548-zone-resi',
    password: 'gftr5154rt',
  });
  // await page.authenticate({
  //   username: proxy.username,
  //   password: proxy.password,
  // });
}
export default AuthProxy
