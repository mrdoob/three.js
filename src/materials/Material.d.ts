import { Plane } from './../math/Plane';
import { Shader } from './../renderers/shaders/ShaderLib';
import { EventDispatcher } from './../core/EventDispatcher';
import { WebGLRenderer } from './../renderers/WebGLRenderer';
import {
	BlendingDstFactor,
	BlendingEquation,
	Blending,
	BlendingSrcFactor,
	DepthModes,
	Side,
	Colors,
} from '../constants';

// Materials //////////////////////////////////////////////////////////////////////////////////
export let MaterialIdCount: number;

export interface MaterialParameters {
	alphaTest?: number;
	blendDst?: BlendingDstFactor;
	blendDstAlpha?: number;
	blendEquation?: BlendingEquation;
	blendEquationAlpha?: number;
	blending?: Blending;
	blendSrc?: BlendingSrcFactor | BlendingDstFactor;
	blendSrcAlpha?: number;
	clipIntersection?: boolean;
	clippingPlanes?: Plane[];
	clipShadows?: boolean;
	colorWrite?: boolean;
	depthFunc?: DepthModes;
	depthTest?: boolean;
	depthWrite?: boolean;
	fog?: boolean;
	lights?: boolean;
	name?: string;
	opacity?: number;
	overdraw?: number;
	polygonOffset?: boolean;
	polygonOffsetFactor?: number;
	polygonOffsetUnits?: number;
	precision?: 'highp' | 'mediump' | 'lowp' | null;
	premultipliedAlpha?: boolean;
	dithering?: boolean;
	flatShading?: boolean;
	side?: Side;
	shadowSide?: Side;
	transparent?: boolean;
	vertexColors?: Colors;
	vertexTangents?: boolean;
	visible?: boolean;
}

/**
 * Materials describe the appearance of objects. They are defined in a (mostly) renderer-independent way, so you don't have to rewrite materials if you decide to use a different renderer.
 */
export class Material extends EventDispatcher {

	constructor();

	/**
   * Sets the alpha value to be used when running an alpha test. Default is 0.
   */
	alphaTest: number;

	/**
   * Blending destination. It's one of the blending mode constants defined in Three.js. Default is {@link OneMinusSrcAlphaFactor}.
   */
	blendDst: BlendingDstFactor;

	/**
   * The tranparency of the .blendDst. Default is null.
   */
	blendDstAlpha: number | null;

	/**
   * Blending equation to use when applying blending. It's one of the constants defined in Three.js. Default is {@link AddEquation}.
   */
	blendEquation: BlendingEquation;

	/**
   * The tranparency of the .blendEquation. Default is null.
   */
	blendEquationAlpha: number | null;

	/**
   * Which blending to use when displaying objects with this material. Default is {@link NormalBlending}.
   */
	blending: Blending;

	/**
   * Blending source. It's one of the blending mode constants defined in Three.js. Default is {@link SrcAlphaFactor}.
   */
	blendSrc: BlendingSrcFactor | BlendingDstFactor;

	/**
   * The tranparency of the .blendSrc. Default is null.
   */
	blendSrcAlpha: number | null;

	/**
   * Changes the behavior of clipping planes so that only their intersection is clipped, rather than their union. Default is false.
   */
	clipIntersection: boolean;

	/**
   * User-defined clipping planes specified as THREE.Plane objects in world space. These planes apply to the objects this material is attached to. Points in space whose signed distance to the plane is negative are clipped (not rendered). See the WebGL / clipping /intersection example. Default is null.
   */
	clippingPlanes: any;

	/**
   * Defines whether to clip shadows according to the clipping planes specified on this material. Default is false.
   */
	clipShadows: boolean;

	/**
   * Whether to render the material's color. This can be used in conjunction with a mesh's .renderOrder property to create invisible objects that occlude other objects. Default is true.
   */
	colorWrite: boolean;

	/**
   * Which depth function to use. Default is {@link LessEqualDepth}. See the depth mode constants for all possible values.
   */
	depthFunc: DepthModes;

	/**
   * Whether to have depth test enabled when rendering this material. Default is true.
   */
	depthTest: boolean;

	/**
   * Whether rendering this material has any effect on the depth buffer. Default is true.
   * When drawing 2D overlays it can be useful to disable the depth writing in order to layer several things together without creating z-index artifacts.
   */
	depthWrite: boolean;

	/**
   * Whether the material is affected by fog. Default is true.
   */
	fog: boolean;

	/**
   * Unique number of this material instance.
   */
	id: number;

	/**
   * Used to check whether this or derived classes are materials. Default is true.
   * You should not change this, as it used internally for optimisation.
   */
	isMaterial: boolean;

	/**
   * Whether the material is affected by lights. Default is true.
   */
	lights: boolean;

	/**
   * Material name. Default is an empty string.
   */
	name: string;

	/**
   * Specifies that the material needs to be updated, WebGL wise. Set it to true if you made changes that need to be reflected in WebGL.
   * This property is automatically set to true when instancing a new material.
   */
	needsUpdate: boolean;

	/**
   * Opacity. Default is 1.
   */
	opacity: number;

	/**
   * Enables/disables overdraw. If greater than zero, polygons are drawn slightly bigger in order to fix antialiasing gaps when using the CanvasRenderer. Default is 0.
   */
	overdraw: number;

	/**
   * Whether to use polygon offset. Default is false. This corresponds to the POLYGON_OFFSET_FILL WebGL feature.
   */
	polygonOffset: boolean;

	/**
   * Sets the polygon offset factor. Default is 0.
   */
	polygonOffsetFactor: number;

	/**
   * Sets the polygon offset units. Default is 0.
   */
	polygonOffsetUnits: number;

	/**
   * Override the renderer's default precision for this material. Can be "highp", "mediump" or "lowp". Defaults is null.
   */
	precision: 'highp' | 'mediump' | 'lowp' | null;

	/**
   * Whether to premultiply the alpha (transparency) value. See WebGL / Materials / Transparency for an example of the difference. Default is false.
   */
	premultipliedAlpha: boolean;

	/**
   * Whether to apply dithering to the color to remove the appearance of banding. Default is false.
   */
	dithering: boolean;

	/**
   * Define whether the material is rendered with flat shading. Default is false.
   */
	flatShading: boolean;

	/**
   * Defines which of the face sides will be rendered - front, back or both.
   * Default is THREE.FrontSide. Other options are THREE.BackSide and THREE.DoubleSide.
   */
	side: Side;

	/**
   * Defines whether this material is transparent. This has an effect on rendering as transparent objects need special treatment and are rendered after non-transparent objects.
   * When set to true, the extent to which the material is transparent is controlled by setting it's .opacity property.
   * Default is false.
   */
	transparent: boolean;

	/**
   * Value is the string 'Material'. This shouldn't be changed, and can be used to find all objects of this type in a scene.
   */
	type: string;

	/**
   * UUID of this material instance. This gets automatically assigned, so this shouldn't be edited.
   */
	uuid: string;

	/**
   * Defines whether vertex coloring is used. Default is THREE.NoColors. Other options are THREE.VertexColors and THREE.FaceColors.
   */
	vertexColors: Colors;

	/**
   * Defines whether precomputed vertex tangents are used. Default is false.
   */
	vertexTangents: boolean;

	/**
   * Defines whether this material is visible. Default is true.
   */
	visible: boolean;

	/**
   * An object that can be used to store custom data about the Material. It should not hold references to functions as these will not be cloned.
   */
	userData: any;

	/**
   * Return a new material with the same parameters as this material.
   */
	clone(): this;

	/**
   * Copy the parameters from the passed material into this material.
   * @param material
   */
	copy( material: Material ): this;

	/**
   * This disposes the material. Textures of a material don't get disposed. These needs to be disposed by {@link Texture}.
   */
	dispose(): void;

	/**
   * An optional callback that is executed immediately before the shader program is compiled. This function is called with the shader source code as a parameter. Useful for the modification of built-in materials.
   * @param shader Source code of the shader
   * @param renderer WebGLRenderer Context that is initializing the material
   */
	onBeforeCompile ( shader : Shader, renderer : WebGLRenderer ) : void;

	/**
   * Sets the properties based on the values.
   * @param values A container with parameters.
   */
	setValues( values: MaterialParameters ): void;

	/**
   * Convert the material to three.js JSON format.
   * @param meta Object containing metadata such as textures or images for the material.
   */
	toJSON( meta?: any ): any;

	/**
   * Call .dispatchEvent ( { type: 'update' }) on the material.
   */
	update(): void;

}
