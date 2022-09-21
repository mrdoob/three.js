export interface AnimationContext {
  requestAnimationFrame: (callback: FrameRequestCallback) => number;
  cancelAnimationFrame: (handle: number) => void;
}

export interface Platform {
  devicePixelRatio(): number;
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
  animationContext: AnimationContext;
}

export declare const platform: Platform;
