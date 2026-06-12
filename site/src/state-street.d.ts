/**
 * Ambient types for the State Street framework.
 *
 * The framework's build/ output ships no .d.ts, so the site declares the public
 * surface it uses here. Webpack resolves the *runtime* import to ../build/index.js
 * (see webpack.config.js alias); this file only satisfies the type checker.
 */
declare module "@state-street/state-street" {
  export interface StateOptions {
    renderLoop?: boolean;
    targetFPS?: number;
    imgMemoryBudget?: number;
    imgWarmPerFrame?: number;
  }

  export class State {
    constructor(
      template: string,
      data?: Record<string, any>,
      components?: Record<string, (props: any) => string>,
      methods?: Record<string, (args: any) => void>,
      options?: StateOptions
    );
    data: Record<string, any>;
    dirty: boolean;
    update(): void;
    forceUpdate(): void;
    warmImages(list: string[]): void;
  }
}
