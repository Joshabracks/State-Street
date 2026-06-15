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
    mountTarget?: Element | string;
    mountOnAvailable?: boolean;
    preserveInParent?: boolean;
  }

  export class State {
    constructor(
      template: string,
      data?: Record<string, any>,
      components?: Record<string, (props: any) => string>,
      methods?: Record<string, (args: any) => void | string>,
      options?: StateOptions
    );
    data: Record<string, any>;
    dirty: boolean;
    id: string;
    root: Element | null;
    mounted: boolean;
    preserveSet: Set<string>;
    update(): void;
    forceUpdate(): void;
    mountCheck(): void;
    setMountTarget(target: Element | string): void;
    togglePreserve(ssid: string, on?: boolean): void;
    setRenderLoop(on: boolean): void;
    setTargetFPS(n: number): void;
    setImgMemoryBudget(n: number): void;
    setImgWarmPerFrame(n: number): void;
    warmImages(list: string[]): void;
    destroy(): void;
  }
}
