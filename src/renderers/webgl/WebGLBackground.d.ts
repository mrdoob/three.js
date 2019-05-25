
import { Color } from "../../math/Color.js";
import { WebGLRenderer } from "../WebGLRenderer.js"
import { WebGLState } from "./WebGLState.js"
import { WebGLObjects } from "./WebGLObjects.js"
import { WebGLRenderLists } from "./WebGLRenderLists.js"
import { Scene } from "../../scenes/Scene.js"

export class WebGLBackground {
	constructor(renderer: WebGLRenderer, state: WebGLState, objects: WebGLObjects, premultipliedAlpha: any);

	getClearColor(): void;
	setClearColor(color: Color, alpha: any): void;
	getClearAlpha(): void;
	setClearAlpha(alpha: any): void;
	render(renderList: WebGLRenderLists, scene: Scene, camera: any, forceClear: any): void;
}
