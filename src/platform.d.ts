export interface AnimationContext {
  requestAnimationFrame: (callback: FrameRequestCallback) => number;
  cancelAnimationFrame: (handle: number) => void;
}

export interface Platform {
  devicePixelRatio(): number;
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
  animationContext: AnimationContext;
  setProperties(properties: PlatformProperties): void;
}

interface PlatformProperties{
  rendertargetUseDEPTH_COMPONENT24: boolean;
}

export declare const platform: Platform;
