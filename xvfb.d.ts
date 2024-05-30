// types/xvfb.d.ts
declare module 'xvfb' {
  interface XvfbOptions {
    displayNum?: number;
    reuse?: boolean;
    timeout?: number;
    xvfb_args?: string[];
    onStderrData?: (data: string) => void;
    onStdoutData?: (data: string) => void;
  }

  class Xvfb {
    constructor(options?: XvfbOptions);
    start(callback?: (err: Error | null) => void): void;
    stop(callback?: (err: Error | null) => void): void;
  }

  export = Xvfb;
}

