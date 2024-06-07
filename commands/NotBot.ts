const NotBot = async (page) =>{

  // Modificar propriedades para simular um navegador não headless
  await page.evaluateOnNewDocument(() => {
    // Enganar propriedades comuns que denunciam o modo headless
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
    });

    // Falsificar plugins
    Object.defineProperty(navigator, 'plugins', {
      get: () => [
        { name: 'Chrome PDF Viewer', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
        { name: 'Chrome PDF Plugin', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai', description: '' },
        { name: 'Native Client', filename: 'internal-nacl-plugin', description: '' }
      ],
    });

    // Falsificar propriedades de idiomas
    Object.defineProperty(navigator, 'languages', {
      get: () => ['pt-BR', 'pt'],
    });

    // Falsificar propriedades de mídia
    Object.defineProperty(navigator, 'mediaDevices', {
      get: () => ({
        getUserMedia: () => Promise.resolve(null),
        enumerateDevices: () => Promise.resolve([
          { kind: 'audioinput', label: 'Microphone', deviceId: 'default' },
          { kind: 'videoinput', label: 'Webcam', deviceId: 'default' }
        ])
      }),
    });

    // Falsificar outros comportamentos específicos
    // @ts-ignore
    window.chrome = {
      runtime: {}
    };
  });
}
function navigator(navigator: any, arg1: string, arg2: { get: () => boolean; }) {
    throw new Error("Function not implemented.");
}

export default NotBot

