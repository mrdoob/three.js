export namespace WEBGL {
    function isWebGLAvailable(): boolean;
    function isWebGL2Available(): boolean;
    function getWebGLErrorMessage(): HTMLElement;
    function getWebGL2ErrorMessage(): HTMLElement;
    function getErrorMessage(version: number): HTMLElement;
}
