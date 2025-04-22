import { Material } from '../Material.js';
import { NormalBlending } from '../../constants.js';

import { getNodeChildren, getCacheKey } from '../../nodes/core/NodeUtils.js';
import { output, diffuseColor, emissive, varyingProperty } from '../../nodes/core/PropertyNode.js';
import { materialAlphaTest, materialColor, materialOpacity, materialEmissive, materialNormal, materialLightMap, materialAO } from '../../nodes/accessors/MaterialNode.js';
import { modelViewProjection } from '../../nodes/accessors/ModelViewProjectionNode.js';
import { normalLocal } from '../../nodes/accessors/Normal.js';
import { instancedMesh } from '../../nodes/accessors/InstancedMeshNode.js';
import { batch } from '../../nodes/accessors/BatchNode.js';
import { materialReference } from '../../nodes/accessors/MaterialReferenceNode.js';
import { positionLocal, positionView } from '../../nodes/accessors/Position.js';
import { skinning } from '../../nodes/accessors/SkinningNode.js';
import { morphReference } from '../../nodes/accessors/MorphNode.js';
import { mix } from '../../nodes/math/MathNode.js';
import { float, vec3, vec4 } from '../../nodes/tsl/TSLBase.js';
import AONode from '../../nodes/lighting/AONode.js';
import { lightingContext } from '../../nodes/lighting/LightingContextNode.js';
import IrradianceNode from '../../nodes/lighting/IrradianceNode.js';
import { depth, viewZToLogarithmicDepth, viewZToOrthographicDepth } from '../../nodes/display/ViewportDepthNode.js';
import { cameraFar, cameraNear, cameraProjectionMatrix } from '../../nodes/accessors/Camera.js';
import { clipping, clippingAlpha, hardwareClipping } from '../../nodes/accessors/ClippingNode.js';
import NodeMaterialObserver from './manager/NodeMaterialObserver.js';
import getAlphaHashThreshold from '../../nodes/functions/material/getAlphaHashThreshold.js';
import { modelViewMatrix } from '../../nodes/accessors/ModelNode.js';
import { vertexColor } from '../../nodes/accessors/VertexColorNode.js';

/**
 * Base class for all node materials.
 *
 * @augments Material
 */
class NodeMaterial extends Material {

	static get type() {

		return 'NodeMaterial';

	}

	/**
	 * Represents the type of the node material.
	 *
	 * @type {string}
	 */
	get type() {

		return this.constructor.type;

	}

	set type( _value ) { /* */ }

	/**
	 * Constructs a new node material.
	 */
	constructor() {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isNodeMaterial = true;

		/**
		 * Whether this material is affected by fog or not.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.fog = true;

		/**
		 * Whether this material is affected by lights or not.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.lights = false;

		/**
		 * Whether this material uses hardware clipping or not.
		 * This property is managed by the engine and should not be
		 * modified by apps.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.hardwareClipping = false;

		/**
		 * Node materials which set their `lights` property to `true`
		 * are affected by all lights of the scene. Sometimes selective
		 * lighting is wanted which means only _some_ lights in the scene
		 * affect a material. This can be achieved by creating an instance
		 * of {@link LightsNode} with a list of selective
		 * lights and assign the node to this property.
		 *
		 * ```js
		 * const customLightsNode = lights( [ light1, light2 ] );
		 * material.lightsNode = customLightsNode;
		 * ```
		 *
		 * @type {?LightsNode}
		 * @default null
		 */
		this.lightsNode = null;

		/**
		 * The environment of node materials can be defined by an environment
		 * map assigned to the `envMap` property or by `Scene.environment`
		 * if the node material is a PBR material. This node property allows to overwrite
		 * the default behavior and define the environment with a custom node.
		 *
		 * ```js
		 * material.envNode = pmremTexture( renderTarget.texture );
		 * ```
		 *
		 * @type {?Node<vec3>}
		 * @default null
		 */
		this.envNode = null;

		/**
		 * The lighting of node materials might be influenced by ambient occlusion.
		 * The default AO is inferred from an ambient occlusion map assigned to `aoMap`
		 * and the respective `aoMapIntensity`. This node property allows to overwrite
		 * the default and define the ambient occlusion with a custom node instead.
		 *
		 * If you don't want to overwrite the diffuse color but modify the existing
		 * values instead, use {@link materialAO}.
		 *
		 * @type {?Node<float>}
		 * @default null
		 */
		this.aoNode = null;

		/**
		 * The diffuse color of node materials is by default inferred from the
		 * `color` and `map` properties. This node property allows to overwrite the default
		 * and define the diffuse color with a node instead.
		 *
		 * ```js
		 * material.colorNode = color( 0xff0000 ); // define red color
		 * ```
		 *
		 * If you don't want to overwrite the diffuse color but modify the existing
		 * values instead, use {@link materialColor}.
		 *
		 * ```js
		 * material.colorNode = materialColor.mul( color( 0xff0000 ) ); // give diffuse colors a red tint
		 * ```
		 *
		 * @type {?Node<vec3>}
		 * @default null
		 */
		this.colorNode = null;

		/**
		 * The normals of node materials are by default inferred from the `normalMap`/`normalScale`
		 * or `bumpMap`/`bumpScale` properties. This node property allows to overwrite the default
		 * and define the normals with a node instead.
		 *
		 * If you don't want to overwrite the normals but modify the existing values instead,
		 * use {@link materialNormal}.
		 *
		 * @type {?Node<vec3>}
		 * @default null
		 */
		this.normalNode = null;

		/**
		 * The opacity of node materials is by default inferred from the `opacity`
		 * and `alphaMap` properties. This node property allows to overwrite the default
		 * and define the opacity with a node instead.
		 *
		 * If you don't want to overwrite the normals but modify the existing
		 * value instead, use {@link materialOpacity}.
		 *
		 * @type {?Node<float>}
		 * @default null
		 */
		this.opacityNode = null;

		/**
		 * This node can be used to implement a variety of filter-like effects. The idea is
		 * to store the current rendering into a texture e.g. via `viewportSharedTexture()`, use it
		 * to create an arbitrary effect and then assign the node composition to this property.
		 * Everything behind the object using this material will now be affected by a filter.
		 *
		 * ```js
		 * const material = new NodeMaterial()
		 * material.transparent = true;
		 *
		 * // everything behind the object will be monochromatic
		 * material.backdropNode = saturation( viewportSharedTexture().rgb, 0 );
		 * ```
		 *
		 * Backdrop computations are part of the lighting so only lit materials can use this property.
		 *
		 * @type {?Node<vec3>}
		 * @default null
		 */
		this.backdropNode = null;

		/**
		 * This node allows to modulate the influence of `backdropNode` to the outgoing light.
		 *
		 * @type {?Node<float>}
		 * @default null
		 */
		this.backdropAlphaNode = null;

		/**
		 * The alpha test of node materials is by default inferred from the `alphaTest`
		 * property. This node property allows to overwrite the default and define the
		 * alpha test with a node instead.
		 *
		 * If you don't want to overwrite the alpha test but modify the existing
		 * value instead, use {@link materialAlphaTest}.
		 *
		 * @type {?Node<float>}
		 * @default null
		 */
		this.alphaTestNode = null;

		/**
		 * The local vertex positions are computed based on multiple factors like the
		 * attribute data, morphing or skinning. This node property allows to overwrite
		 * the default and define local vertex positions with nodes instead.
		 *
		 * If you don't want to overwrite the vertex positions but modify the existing
		 * values instead, use {@link positionLocal}.
		 *
		 *```js
		 * material.positionNode = positionLocal.add( displace );
		 * ```
		 *
		 * @type {?Node<vec3>}
		 * @default null
		 */
		this.positionNode = null;

		/**
		 * This node property is intended for logic which modifies geometry data once or per animation step.
		 * Apps usually place such logic randomly in initialization routines or in the animation loop.
		 * `geometryNode` is intended as a dedicated API so there is an intended spot where geometry modifications
		 * can be implemented.
		 *
		 * The idea is to assign a `Fn` definition that holds the geometry modification logic. A typical example
		 * would be a GPU based particle system that provides a node material for usage on app level. The particle
		 * simulation would be implemented as compute shaders and managed inside a `Fn` function. This function is
		 * eventually assigned to `geometryNode`.
		 *
		 * @type {?Function}
		 * @default null
		 */
		this.geometryNode = null;

		/**
		 * Allows to overwrite depth values in the fragment shader.
		 *
		 * @type {?Node<float>}
		 * @default null
		 */
		this.depthNode = null;

		/**
		 * Allows to overwrite the position used for shadow map rendering which
		 * is by default {@link positionWorld}, the vertex position
		 * in world space.
		 *
		 * @type {?Node<float>}
		 * @default null
		 */
		this.receivedShadowPositionNode = null;

		/**
		 * Allows to overwrite the geometry position used for shadow map projection which
		 * is by default {@link positionLocal}, the vertex position in local space.
		 *
		 * @type {?Node<float>}
		 * @default null
		 */
		this.castShadowPositionNode = null;

		/**
		 * This node can be used to influence how an object using this node material
		 * receive shadows.
		 *
		 * ```js
		 * const totalShadows = float( 1 ).toVar();
		 * material.receivedShadowNode = Fn( ( [ shadow ] ) => {
		 * 	totalShadows.mulAssign( shadow );
		 * 	//return float( 1 ); // bypass received shadows
		 * 	return shadow.mix( color( 0xff0000 ), 1 ); // modify shadow color
		 * } );
		 *
		 * @type {?(Function|FunctionNode<vec4>)}
		 * @default null
		 */
		this.receivedShadowNode = null;

		/**
		 * This node can be used to influence how an object using this node material
		 * casts shadows. To apply a color to shadows, you can simply do:
		 *
		 * ```js
		 * material.castShadowNode = vec4( 1, 0, 0, 1 );
		 * ```
		 *
		 * Which can be nice to fake colored shadows of semi-transparent objects. It
		 * is also common to use the property with `Fn` function so checks are performed
		 * per fragment.
		 *
		 * ```js
		 * materialCustomShadow.castShadowNode = Fn( () => {
		 * 	hash( vertexIndex ).greaterThan( 0.5 ).discard();
		 * 	return materialColor;
		 * } )();
		 *  ```
		 *
		 * @type {?Node<vec4>}
		 * @default null
		 */
		this.castShadowNode = null;

		/**
		 * This node can be used to define the final output of the material.
		 *
		 * TODO: Explain the differences to `fragmentNode`.
		 *
		 * @type {?Node<vec4>}
		 * @default null
		 */
		this.outputNode = null;

		/**
		 * MRT configuration is done on renderer or pass level. This node allows to
		 * overwrite what values are written into MRT targets on material level. This
		 * can be useful for implementing selective FX features that should only affect
		 * specific objects.
		 *
		 * @type {?MRTNode}
		 * @default null
		 */
		this.mrtNode = null;

		/**
		 * This node property can be used if you need complete freedom in implementing
		 * the fragment shader. Assigning a node will replace the built-in material
		 * logic used in the fragment stage.
		 *
		 * @type {?Node<vec4>}
		 * @default null
		 */
		this.fragmentNode = null;

		/**
		 * This node property can be used if you need complete freedom in implementing
		 * the vertex shader. Assigning a node will replace the built-in material logic
		 * used in the vertex stage.
		 *
		 * @type {?Node<vec4>}
		 * @default null
		 */
		this.vertexNode = null;

		// Deprecated properties

		Object.defineProperty( this, 'shadowPositionNode', { // @deprecated, r176

			get: () => {

				return this.receivedShadowPositionNode;

			},

			set: ( value ) => {

				console.warn( 'THREE.NodeMaterial: ".shadowPositionNode" was renamed to ".receivedShadowPositionNode".' );

				this.receivedShadowPositionNode = value;

			}

		} );

	}

	/**
	 * Allows to define a custom cache key that influence the material key computation
	 * for render objects.
	 *
	 * @return {string} The custom cache key.
	 */
	customProgramCacheKey() {

		return this.type + getCacheKey( this );

	}

	/**
	 * Builds this material with the given node builder.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	build( builder ) {

		this.setup( builder );

	}

	/**
	 * Setups a node material observer with the given builder.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {NodeMaterialObserver} The node material observer.
	 */
	setupObserver( builder ) {

		return new NodeMaterialObserver( builder );

	}

	/**
	 * Setups the vertex and fragment stage of this node material.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	setup( builder ) {

		builder.context.setupNormal = () => this.setupNormal( builder );
		builder.context.setupPositionView = () => this.setupPositionView( builder );
		builder.context.setupModelViewProjection = () => this.setupModelViewProjection( builder );

		const renderer = builder.renderer;
		const renderTarget = renderer.getRenderTarget();

		// < VERTEX STAGE >

		builder.addStack();

		const vertexNode = this.vertexNode || this.setupVertex( builder );

		builder.stack.outputNode = vertexNode;

		this.setupHardwareClipping( builder );

		if ( this.geometryNode !== null ) {

			builder.stack.outputNode = builder.stack.outputNode.bypass( this.geometryNode );

		}

		builder.addFlow( 'vertex', builder.removeStack() );

		// < FRAGMENT STAGE >

		builder.addStack();

		let resultNode;

		const clippingNode = this.setupClipping( builder );

		if ( this.depthWrite === true || this.depthTest === true ) {

			// only write depth if depth buffer is configured

			if ( renderTarget !== null ) {

				if ( renderTarget.depthBuffer === true ) this.setupDepth( builder );

			} else {

				if ( renderer.depth === true ) this.setupDepth( builder );

			}

		}

		if ( this.fragmentNode === null ) {

			this.setupDiffuseColor( builder );
			this.setupVariants( builder );

			const outgoingLightNode = this.setupLighting( builder );

			if ( clippingNode !== null ) builder.stack.add( clippingNode );

			// force unsigned floats - useful for RenderTargets

			const basicOutput = vec4( outgoingLightNode, diffuseColor.a ).max( 0 );

			resultNode = this.setupOutput( builder, basicOutput );

			// OUTPUT NODE

			output.assign( resultNode );

			//

			const isCustomOutput = this.outputNode !== null;

			if ( isCustomOutput ) resultNode = this.outputNode;

			// MRT

			if ( renderTarget !== null ) {

				const mrt = renderer.getMRT();
				const materialMRT = this.mrtNode;

				if ( mrt !== null ) {

					if ( isCustomOutput ) output.assign( resultNode );

					resultNode = mrt;

					if ( materialMRT !== null ) {

						resultNode = mrt.merge( materialMRT );

					}

				} else if ( materialMRT !== null ) {

					resultNode = materialMRT;

				}

			}

		} else {

			let fragmentNode = this.fragmentNode;

			if ( fragmentNode.isOutputStructNode !== true ) {

				fragmentNode = vec4( fragmentNode );

			}

			resultNode = this.setupOutput( builder, fragmentNode );

		}

		builder.stack.outputNode = resultNode;

		builder.addFlow( 'fragment', builder.removeStack() );

		// < OBSERVER >

		builder.observer = this.setupObserver( builder );

	}

	/**
	 * Setups the clipping node.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {ClippingNode} The clipping node.
	 */
	setupClipping( builder ) {

		if ( builder.clippingContext === null ) return null;

		const { unionPlanes, intersectionPlanes } = builder.clippingContext;

		let result = null;

		if ( unionPlanes.length > 0 || intersectionPlanes.length > 0 ) {

			const samples = builder.renderer.samples;

			if ( this.alphaToCoverage && samples > 1 ) {

				// to be added to flow when the color/alpha value has been determined
				result = clippingAlpha();

			} else {

				builder.stack.add( clipping() );

			}

		}

		return result;

	}

	/**
	 * Setups the hardware clipping if available on the current device.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	setupHardwareClipping( builder ) {

		this.hardwareClipping = false;

		if ( builder.clippingContext === null ) return;

		const candidateCount = builder.clippingContext.unionPlanes.length;

		// 8 planes supported by WebGL ANGLE_clip_cull_distance and WebGPU clip-distances

		if ( candidateCount > 0 && candidateCount <= 8 && builder.isAvailable( 'clipDistance' ) ) {

			builder.stack.add( hardwareClipping() );

			this.hardwareClipping = true;

		}

		return;

	}

	/**
	 * Setups the depth of this material.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	setupDepth( builder ) {

		const { renderer, camera } = builder;

		// Depth

		let depthNode = this.depthNode;

		if ( depthNode === null ) {

			const mrt = renderer.getMRT();

			if ( mrt && mrt.has( 'depth' ) ) {

				depthNode = mrt.get( 'depth' );

			} else if ( renderer.logarithmicDepthBuffer === true ) {

				if ( camera.isPerspectiveCamera ) {

					depthNode = viewZToLogarithmicDepth( positionView.z, cameraNear, cameraFar );

				} else {

					depthNode = viewZToOrthographicDepth( positionView.z, cameraNear, cameraFar );

				}

			}

		}

		if ( depthNode !== null ) {

			depth.assign( depthNode ).toStack();

		}

	}

	/**
	 * Setups the position node in view space. This method exists
	 * so derived node materials can modify the implementation e.g. sprite materials.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {Node<vec3>} The position in view space.
	 */
	setupPositionView( /*builder*/ ) {

		return modelViewMatrix.mul( positionLocal ).xyz;

	}

	/**
	 * Setups the position in clip space.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {Node<vec4>} The position in view space.
	 */
	setupModelViewProjection( /*builder*/ ) {

		return cameraProjectionMatrix.mul( positionView );

	}

	/**
	 * Setups the logic for the vertex stage.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {Node<vec4>} The position in clip space.
	 */
	setupVertex( builder ) {

		builder.addStack();

		this.setupPosition( builder );

		builder.context.vertex = builder.removeStack();

		return modelViewProjection;

	}

	/**
	 * Setups the computation of the position in local space.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {Node<vec3>} The position in local space.
	 */
	setupPosition( builder ) {

		const { object, geometry } = builder;

		if ( geometry.morphAttributes.position || geometry.morphAttributes.normal || geometry.morphAttributes.color ) {

			morphReference( object ).toStack();

		}

		if ( object.isSkinnedMesh === true ) {

			skinning( object ).toStack();

		}

		if ( this.displacementMap ) {

			const displacementMap = materialReference( 'displacementMap', 'texture' );
			const displacementScale = materialReference( 'displacementScale', 'float' );
			const displacementBias = materialReference( 'displacementBias', 'float' );

			positionLocal.addAssign( normalLocal.normalize().mul( ( displacementMap.x.mul( displacementScale ).add( displacementBias ) ) ) );

		}

		if ( object.isBatchedMesh ) {

			batch( object ).toStack();

		}

		if ( ( object.isInstancedMesh && object.instanceMatrix && object.instanceMatrix.isInstancedBufferAttribute === true ) ) {

			instancedMesh( object ).toStack();

		}

		if ( this.positionNode !== null ) {

			positionLocal.assign( this.positionNode.context( { isPositionNodeInput: true } ) );

		}

		return positionLocal;

	}

	/**
	 * Setups the computation of the material's diffuse color.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @param {BufferGeometry} geometry - The geometry.
	 */
	setupDiffuseColor( { object, geometry } ) {

		let colorNode = this.colorNode ? vec4( this.colorNode ) : materialColor;

		// VERTEX COLORS

		if ( this.vertexColors === true && geometry.hasAttribute( 'color' ) ) {

			colorNode = colorNode.mul( vertexColor() );

		}

		// Instanced colors

		if ( object.instanceColor ) {

			const instanceColor = varyingProperty( 'vec3', 'vInstanceColor' );

			colorNode = instanceColor.mul( colorNode );

		}

		if ( object.isBatchedMesh && object._colorsTexture ) {

			const batchColor = varyingProperty( 'vec3', 'vBatchColor' );

			colorNode = batchColor.mul( colorNode );

		}


		// COLOR

		diffuseColor.assign( colorNode );

		// OPACITY

		const opacityNode = this.opacityNode ? float( this.opacityNode ) : materialOpacity;
		diffuseColor.a.assign( diffuseColor.a.mul( opacityNode ) );

		// ALPHA TEST

		if ( this.alphaTestNode !== null || this.alphaTest > 0 ) {

			const alphaTestNode = this.alphaTestNode !== null ? float( this.alphaTestNode ) : materialAlphaTest;

			diffuseColor.a.lessThanEqual( alphaTestNode ).discard();

		}

		// ALPHA HASH

		if ( this.alphaHash === true ) {

			diffuseColor.a.lessThan( getAlphaHashThreshold( positionLocal ) ).discard();

		}

		if ( this.transparent === false && this.blending === NormalBlending && this.alphaToCoverage === false ) {

			diffuseColor.a.assign( 1.0 );

		}

	}

	/**
	 * Abstract interface method that can be implemented by derived materials
	 * to setup material-specific node variables.
	 *
	 * @abstract
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	setupVariants( /*builder*/ ) {

		// Interface function.

	}

	/**
	 * Setups the outgoing light node variable
	 *
	 * @return {Node<vec3>} The outgoing light node.
	 */
	setupOutgoingLight() {

		return ( this.lights === true ) ? vec3( 0 ) : diffuseColor.rgb;

	}

	/**
	 * Setups the normal node from the material.
	 *
	 * @return {Node<vec3>} The normal node.
	 */
	setupNormal() {

		return this.normalNode ? vec3( this.normalNode ) : materialNormal;

	}

	/**
	 * Setups the environment node from the material.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {Node<vec4>} The environment node.
	 */
	setupEnvironment( /*builder*/ ) {

		let node = null;

		if ( this.envNode ) {

			node = this.envNode;

		} else if ( this.envMap ) {

			node = this.envMap.isCubeTexture ? materialReference( 'envMap', 'cubeTexture' ) : materialReference( 'envMap', 'texture' );

		}

		return node;

	}

	/**
	 * Setups the light map node from the material.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {Node<vec3>} The light map node.
	 */
	setupLightMap( builder ) {

		let node = null;

		if ( builder.material.lightMap ) {

			node = new IrradianceNode( materialLightMap );

		}

		return node;

	}

	/**
	 * Setups the lights node based on the scene, environment and material.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {LightsNode} The lights node.
	 */
	setupLights( builder ) {

		const materialLightsNode = [];

		//

		const envNode = this.setupEnvironment( builder );

		if ( envNode && envNode.isLightingNode ) {

			materialLightsNode.push( envNode );

		}

		const lightMapNode = this.setupLightMap( builder );

		if ( lightMapNode && lightMapNode.isLightingNode ) {

			materialLightsNode.push( lightMapNode );

		}

		if ( this.aoNode !== null || builder.material.aoMap ) {

			const aoNode = this.aoNode !== null ? this.aoNode : materialAO;

			materialLightsNode.push( new AONode( aoNode ) );

		}

		let lightsN = this.lightsNode || builder.lightsNode;

		if ( materialLightsNode.length > 0 ) {

			lightsN = builder.renderer.lighting.createNode( [ ...lightsN.getLights(), ...materialLightsNode ] );

		}

		return lightsN;

	}

	/**
	 * This method should be implemented by most derived materials
	 * since it defines the material's lighting model.
	 *
	 * @abstract
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {LightingModel} The lighting model.
	 */
	setupLightingModel( /*builder*/ ) {

		// Interface function.

	}

	/**
	 * Setups the outgoing light node.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {Node<vec3>} The outgoing light node.
	 */
	setupLighting( builder ) {

		const { material } = builder;
		const { backdropNode, backdropAlphaNode, emissiveNode } = this;

		// OUTGOING LIGHT

		const lights = this.lights === true || this.lightsNode !== null;

		const lightsNode = lights ? this.setupLights( builder ) : null;

		let outgoingLightNode = this.setupOutgoingLight( builder );

		if ( lightsNode && lightsNode.getScope().hasLights ) {

			const lightingModel = this.setupLightingModel( builder ) || null;

			outgoingLightNode = lightingContext( lightsNode, lightingModel, backdropNode, backdropAlphaNode );

		} else if ( backdropNode !== null ) {

			outgoingLightNode = vec3( backdropAlphaNode !== null ? mix( outgoingLightNode, backdropNode, backdropAlphaNode ) : backdropNode );

		}

		// EMISSIVE

		if ( ( emissiveNode && emissiveNode.isNode === true ) || ( material.emissive && material.emissive.isColor === true ) ) {

			emissive.assign( vec3( emissiveNode ? emissiveNode : materialEmissive ) );

			outgoingLightNode = outgoingLightNode.add( emissive );

		}

		return outgoingLightNode;

	}

	/**
	 * Setup the fog.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @param {Node<vec4>} outputNode - The existing output node.
	 * @return {Node<vec4>} The output node.
	 */
	setupFog( builder, outputNode ) {

		const fogNode = builder.fogNode;

		if ( fogNode ) {

			output.assign( outputNode );

			outputNode = vec4( fogNode );

		}

		return outputNode;

	}

	/**
	 * Setups the output node.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @param {Node<vec4>} outputNode - The existing output node.
	 * @return {Node<vec4>} The output node.
	 */
	setupOutput( builder, outputNode ) {

		// FOG

		if ( this.fog === true ) {

			outputNode = this.setupFog( builder, outputNode );

		}

		return outputNode;

	}

	/**
	 * Most classic material types have a node pendant e.g. for `MeshBasicMaterial`
	 * there is `MeshBasicNodeMaterial`. This utility method is intended for
	 * defining all material properties of the classic type in the node type.
	 *
	 * @param {Material} material - The material to copy properties with their values to this node material.
	 */
	setDefaultValues( material ) {

		// This approach is to reuse the native refreshUniforms*
		// and turn available the use of features like transmission and environment in core

		for ( const property in material ) {

			const value = material[ property ];

			if ( this[ property ] === undefined ) {

				this[ property ] = value;

				if ( value && value.clone ) this[ property ] = value.clone();

			}

		}

		const descriptors = Object.getOwnPropertyDescriptors( material.constructor.prototype );

		for ( const key in descriptors ) {

			if ( Object.getOwnPropertyDescriptor( this.constructor.prototype, key ) === undefined &&
			     descriptors[ key ].get !== undefined ) {

				Object.defineProperty( this.constructor.prototype, key, descriptors[ key ] );

			}

		}

	}

	/**
	 * Serializes this material to JSON.
	 *
	 * @param {?(Object|string)} meta - The meta information for serialization.
	 * @return {Object} The serialized node.
	 */
	toJSON( meta ) {

		const isRoot = ( meta === undefined || typeof meta === 'string' );

		if ( isRoot ) {

			meta = {
				textures: {},
				images: {},
				nodes: {}
			};

		}

		const data = Material.prototype.toJSON.call( this, meta );
		const nodeChildren = getNodeChildren( this );

		data.inputNodes = {};

		for ( const { property, childNode } of nodeChildren ) {

			data.inputNodes[ property ] = childNode.toJSON( meta ).uuid;

		}

		// TODO: Copied from Object3D.toJSON

		function extractFromCache( cache ) {

			const values = [];

			for ( const key in cache ) {

				const data = cache[ key ];
				delete data.metadata;
				values.push( data );

			}

			return values;

		}

		if ( isRoot ) {

			const textures = extractFromCache( meta.textures );
			const images = extractFromCache( meta.images );
			const nodes = extractFromCache( meta.nodes );

			if ( textures.length > 0 ) data.textures = textures;
			if ( images.length > 0 ) data.images = images;
			if ( nodes.length > 0 ) data.nodes = nodes;

		}

		return data;

	}

	/**
	 * Copies the properties of the given node material to this instance.
	 *
	 * @param {NodeMaterial} source - The material to copy.
	 * @return {NodeMaterial} A reference to this node material.
	 */
	copy( source ) {

		this.lightsNode = source.lightsNode;
		this.envNode = source.envNode;

		this.colorNode = source.colorNode;
		this.normalNode = source.normalNode;
		this.opacityNode = source.opacityNode;
		this.backdropNode = source.backdropNode;
		this.backdropAlphaNode = source.backdropAlphaNode;
		this.alphaTestNode = source.alphaTestNode;

		this.positionNode = source.positionNode;
		this.geometryNode = source.geometryNode;

		this.depthNode = source.depthNode;
		this.receivedShadowPositionNode = source.receivedShadowPositionNode;
		this.castShadowPositionNode = source.castShadowPositionNode;
		this.receivedShadowNode = source.receivedShadowNode;
		this.castShadowNode = source.castShadowNode;

		this.outputNode = source.outputNode;
		this.mrtNode = source.mrtNode;

		this.fragmentNode = source.fragmentNode;
		this.vertexNode = source.vertexNode;

		return super.copy( source );

	}

}

export default NodeMaterial;
