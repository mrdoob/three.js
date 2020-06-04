import { IFog } from './Fog';
import { Material } from './../materials/Material';
import { Object3D } from './../core/Object3D';
import { Color } from '../math/Color';
import { Texture } from '../textures/Texture';
import { WebGLRenderer } from "../renderers/WebGLRenderer";
import { Camera } from "../cameras/Camera";
import { RenderTarget } from "../renderers/webgl/WebGLRenderLists";
// Scenes /////////////////////////////////////////////////////////////////////

/**
 * Scenes allow you to set up what and where is to be rendered by three.js. This is where you place objects, lights and cameras.
 */
export class Scene extends Object3D {

	constructor();

	type: 'Scene';

	/**
	 * A fog instance defining the type of fog that affects everything rendered in the scene. Default is null.
	 */
	fog: IFog | null;

	/**
	 * If not null, it will force everything in the scene to be rendered with that material. Default is null.
	 */
	overrideMaterial: Material | null;
	autoUpdate: boolean;
	background: null | Color | Texture;
	environment: null | Texture;

	readonly isScene: true;

	/**
	 * Calls before rendering scene
	 */
	onBeforeRender: (
		renderer: WebGLRenderer,
		scene: Scene,
		camera: Camera,
		renderTarget: RenderTarget
	) => void;

	/**
	 * Calls after rendering scene
	 */
	onAfterRender: (
		renderer: WebGLRenderer,
		scene: Scene,
		camera: Camera
	) => void;

	toJSON( meta?: any ): any;
	dispose(): void;

}
