export class WebGLAnimation {
	start(): void;

	stop(): void;

	setAnimationLoop(callback: Function): void;

	setContext(value: WebGLRenderingContext | WebGL2RenderingContext): void;
}
