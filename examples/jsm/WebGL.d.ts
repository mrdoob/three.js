export namespace WEBGL {

  export function isWebGLAvailable(): boolean;
  export function isWebGL2Available(): boolean;
  export function getWebGLErrorMessage(): HTMLElement;
  export function getWebGL2ErrorMessage(): HTMLElement;
  export function getErrorMessage(version: number): HTMLElement;

}
