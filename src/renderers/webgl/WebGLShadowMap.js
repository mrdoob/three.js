import { FrontSide, BackSide, DoubleSide, NearestFilter, LinearFilter, PCFShadowMap, VSMShadowMap, NoBlending, LessEqualCompare, GreaterEqualCompare, DepthFormat, UnsignedIntType, RGFormat, HalfFloatType, FloatType, PCFSoftShadowMap } from '../../constants.js';
import { WebGLRenderTarget } from '../WebGLRenderTarget.js';
import { WebGLCubeRenderTarget } from '../WebGLCubeRenderTarget.js';
import { MeshDepthMaterial } from '../../materials/MeshDepthMaterial.js';
import { MeshDistanceMaterial } from '../../materials/MeshDistanceMaterial.js';
import { ShaderMaterial } from '../../materials/ShaderMaterial.js';
import { BufferAttribute } from '../../core/BufferAttribute.js';
import { BufferGeometry } from '../../core/BufferGeometry.js';
import { Mesh } from '../../objects/Mesh.js';
import { Vector4 } from '../../math/Vector4.js';
import { Vector2 } from '../../math/Vector2.js';
import { Matrix4 } from '../../math/Matrix4.js';
import { Frustum } from '../../math/Frustum.js';
import { DepthTexture } from '../../textures/DepthTexture.js';
import { CubeDepthTexture } from '../../textures/CubeDepthTexture.js';

import * as vsm from '../shaders/ShaderLib/vsm.glsl.js';
import { warn } from '../../utils.js';
import { Vector3 } from '../../math/Vector3.js';

const _cubeDirections = [
	/*@__PURE__*/ new Vector3( 1, 0, 0 ), /*@__PURE__*/ new Vector3( - 1, 0, 0 ), /*@__PURE__*/ new Vector3( 0, 1, 0 ),
	/*@__PURE__*/ new Vector3( 0, - 1, 0 ), /*@__PURE__*/ new Vector3( 0, 0, 1 ), /*@__PURE__*/ new Vector3( 0, 0, - 1 )
];

const _cubeUps = [
	/*@__PURE__*/ new Vector3( 0, - 1, 0 ), /*@__PURE__*/ new Vector3( 0, - 1, 0 ), /*@__PURE__*/ new Vector3( 0, 0, 1 ),
	/*@__PURE__*/ new Vector3( 0, 0, - 1 ), /*@__PURE__*/ new Vector3( 0, - 1, 0 ), /*@__PURE__*/ new Vector3( 0, - 1, 0 )
];

const _projScreenMatrix = /*@__PURE__*/ new Matrix4();
const _lightPositionWorld = /*@__PURE__*/ new Vector3();
const _lookTarget = /*@__PURE__*/ new Vector3();

function WebGLShadowMap( renderer, objects, capabilities ) {

	let _frustum = new Frustum();

	const _shadowMapSize = new Vector2(),
		_viewportSize = new Vector2(),

		_viewport = new Vector4(),

		_depthMaterial = new MeshDepthMaterial(),
		_distanceMaterial = new MeshDistanceMaterial(),

		_materialCache = {},

		_maxTextureSize = capabilities.maxTextureSize;

	const shadowSide = { [ FrontSide ]: BackSide, [ BackSide ]: FrontSide, [ DoubleSide ]: DoubleSide };

	const shadowMaterialVertical = new ShaderMaterial( {
		defines: {
			VSM_SAMPLES: 8
		},
		uniforms: {
			shadow_pass: { value: null },
			resolution: { value: new Vector2() },
			radius: { value: 4.0 }
		},

		vertexShader: vsm.vertex,
		fragmentShader: vsm.fragment

	} );

	const shadowMaterialHorizontal = shadowMaterialVertical.clone();
	shadowMaterialHorizontal.defines.HORIZONTAL_PASS = 1;

	const fullScreenTri = new BufferGeometry();
	fullScreenTri.setAttribute(
		'position',
		new BufferAttribute(
			new Float32Array( [ - 1, - 1, 0.5, 3, - 1, 0.5, - 1, 3, 0.5 ] ),
			3
		)
	);

	const fullScreenMesh = new Mesh( fullScreenTri, shadowMaterialVertical );

	const scope = this;

	this.enabled = false;

	this.autoUpdate = true;
	this.needsUpdate = false;

	this.type = PCFShadowMap;
	let _previousType = this.type;

	this.render = function ( lights, scene, camera ) {

		if ( scope.enabled === false ) return;
		if ( scope.autoUpdate === false && scope.needsUpdate === false ) return;

		if ( lights.length === 0 ) return;

		if ( this.type === PCFSoftShadowMap ) {

			warn( 'WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead.' );
			this.type = PCFShadowMap;

		}

		const currentRenderTarget = renderer.getRenderTarget();
		const activeCubeFace = renderer.getActiveCubeFace();
		const activeMipmapLevel = renderer.getActiveMipmapLevel();

		const _state = renderer.state;

		// Set GL state for depth map.
		_state.setBlending( NoBlending );

		if ( _state.buffers.depth.getReversed() === true ) {

			_state.buffers.color.setClear( 0, 0, 0, 0 );

		} else {

			_state.buffers.color.setClear( 1, 1, 1, 1 );

		}

		_state.buffers.depth.setTest( true );
		_state.setScissorTest( false );

		// check for shadow map type changes

		const typeChanged = _previousType !== this.type;

		// When shadow map type changes, materials need recompilation because sampler types change
		// (sampler2DShadow for PCF vs sampler2D for Basic)
		if ( typeChanged ) {

			scene.traverse( function ( object ) {

				if ( object.material ) {

					if ( Array.isArray( object.material ) ) {

						object.material.forEach( mat => mat.needsUpdate = true );

					} else {

						object.material.needsUpdate = true;

					}

				}

			} );

		}

		// render depth map

		for ( let i = 0, il = lights.length; i < il; i ++ ) {

			const light = lights[ i ];
			const shadow = light.shadow;

			if ( shadow === undefined ) {

				warn( 'WebGLShadowMap:', light, 'has no shadow.' );
				continue;

			}

			if ( shadow.autoUpdate === false && shadow.needsUpdate === false ) continue;

			_shadowMapSize.copy( shadow.mapSize );

			const shadowFrameExtents = shadow.getFrameExtents();

			_shadowMapSize.multiply( shadowFrameExtents );

			_viewportSize.copy( shadow.mapSize );

			if ( _shadowMapSize.x > _maxTextureSize || _shadowMapSize.y > _maxTextureSize ) {

				if ( _shadowMapSize.x > _maxTextureSize ) {

					_viewportSize.x = Math.floor( _maxTextureSize / shadowFrameExtents.x );
					_shadowMapSize.x = _viewportSize.x * shadowFrameExtents.x;
					shadow.mapSize.x = _viewportSize.x;

				}

				if ( _shadowMapSize.y > _maxTextureSize ) {

					_viewportSize.y = Math.floor( _maxTextureSize / shadowFrameExtents.y );
					_shadowMapSize.y = _viewportSize.y * shadowFrameExtents.y;
					shadow.mapSize.y = _viewportSize.y;

				}

			}

			const reversedDepthBuffer = renderer.state.buffers.depth.getReversed();
			shadow.camera._reversedDepth = reversedDepthBuffer;

			if ( shadow.map === null || typeChanged === true ) {

				if ( shadow.map !== null ) {

					if ( shadow.map.depthTexture !== null ) {

						shadow.map.depthTexture.dispose();
						shadow.map.depthTexture = null;

					}

					shadow.map.dispose();

				}

				if ( this.type === VSMShadowMap ) {

					if ( light.isPointLight ) {

						warn( 'WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.' );
						continue;

					}

					shadow.map = new WebGLRenderTarget( _shadowMapSize.x, _shadowMapSize.y, {
						format: RGFormat,
						type: HalfFloatType,
						minFilter: LinearFilter,
						magFilter: LinearFilter,
						generateMipmaps: false
					} );
					shadow.map.texture.name = light.name + '.shadowMap';

					// Native depth texture for VSM - depth is captured here, then blurred into the color texture
					shadow.map.depthTexture = new DepthTexture( _shadowMapSize.x, _shadowMapSize.y, FloatType );
					shadow.map.depthTexture.name = light.name + '.shadowMapDepth';
					shadow.map.depthTexture.format = DepthFormat;
					shadow.map.depthTexture.compareFunction = null; // For regular sampling (not shadow comparison)
					shadow.map.depthTexture.minFilter = NearestFilter;
					shadow.map.depthTexture.magFilter = NearestFilter;

				} else {

					if ( light.isPointLight ) {

						shadow.map = new WebGLCubeRenderTarget( _shadowMapSize.x );
						shadow.map.depthTexture = new CubeDepthTexture( _shadowMapSize.x, UnsignedIntType );

					} else {

						shadow.map = new WebGLRenderTarget( _shadowMapSize.x, _shadowMapSize.y );
						shadow.map.depthTexture = new DepthTexture( _shadowMapSize.x, _shadowMapSize.y, UnsignedIntType );

					}

					shadow.map.depthTexture.name = light.name + '.shadowMap';
					shadow.map.depthTexture.format = DepthFormat;

					if ( this.type === PCFShadowMap ) {

						shadow.map.depthTexture.compareFunction = reversedDepthBuffer ? GreaterEqualCompare : LessEqualCompare;
						shadow.map.depthTexture.minFilter = LinearFilter;
						shadow.map.depthTexture.magFilter = LinearFilter;

					} else {

						shadow.map.depthTexture.compareFunction = null;
						shadow.map.depthTexture.minFilter = NearestFilter;
						shadow.map.depthTexture.magFilter = NearestFilter;

					}

				}

				shadow.camera.updateProjectionMatrix();

			}

			// For cube render targets (PointLights), render all 6 faces. Otherwise, render once.
			const faceCount = shadow.map.isWebGLCubeRenderTarget ? 6 : 1;

			for ( let face = 0; face < faceCount; face ++ ) {

				// For cube render targets, render to each face separately
				if ( shadow.map.isWebGLCubeRenderTarget ) {

					renderer.setRenderTarget( shadow.map, face );
					renderer.clear();

				} else {

					// For 2D render targets, use viewports
					if ( face === 0 ) {

						renderer.setRenderTarget( shadow.map );
						renderer.clear();

					}

					const viewport = shadow.getViewport( face );

					_viewport.set(
						_viewportSize.x * viewport.x,
						_viewportSize.y * viewport.y,
						_viewportSize.x * viewport.z,
						_viewportSize.y * viewport.w
					);

					_state.viewport( _viewport );

				}

				if ( light.isPointLight ) {

					const camera = shadow.camera;
					const shadowMatrix = shadow.matrix;

					const far = light.distance || camera.far;

					if ( far !== camera.far ) {

						camera.far = far;
						camera.updateProjectionMatrix();

					}

					_lightPositionWorld.setFromMatrixPosition( light.matrixWorld );
					camera.position.copy( _lightPositionWorld );

					_lookTarget.copy( camera.position );
					_lookTarget.add( _cubeDirections[ face ] );
					camera.up.copy( _cubeUps[ face ] );
					camera.lookAt( _lookTarget );
					camera.updateMatrixWorld();

					shadowMatrix.makeTranslation( - _lightPositionWorld.x, - _lightPositionWorld.y, - _lightPositionWorld.z );

					_projScreenMatrix.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
					shadow._frustum.setFromProjectionMatrix( _projScreenMatrix, camera.coordinateSystem, camera.reversedDepth );

				} else {

					shadow.updateMatrices( light );

				}

				_frustum = shadow.getFrustum();

				renderObject( scene, camera, shadow.camera, light, this.type );

			}

			// do blur pass for VSM

			if ( shadow.isPointLightShadow !== true && this.type === VSMShadowMap ) {

				VSMPass( shadow, camera );

			}

			shadow.needsUpdate = false;

		}

		_previousType = this.type;

		scope.needsUpdate = false;

		renderer.setRenderTarget( currentRenderTarget, activeCubeFace, activeMipmapLevel );

	};

	function VSMPass( shadow, camera ) {

		const geometry = objects.update( fullScreenMesh );

		if ( shadowMaterialVertical.defines.VSM_SAMPLES !== shadow.blurSamples ) {

			shadowMaterialVertical.defines.VSM_SAMPLES = shadow.blurSamples;
			shadowMaterialHorizontal.defines.VSM_SAMPLES = shadow.blurSamples;

			shadowMaterialVertical.needsUpdate = true;
			shadowMaterialHorizontal.needsUpdate = true;

		}

		if ( shadow.mapPass === null ) {

			shadow.mapPass = new WebGLRenderTarget( _shadowMapSize.x, _shadowMapSize.y, {
				format: RGFormat,
				type: HalfFloatType
			} );

		}

		// vertical pass - read from native depth texture

		shadowMaterialVertical.uniforms.shadow_pass.value = shadow.map.depthTexture;
		shadowMaterialVertical.uniforms.resolution.value = shadow.mapSize;
		shadowMaterialVertical.uniforms.radius.value = shadow.radius;
		renderer.setRenderTarget( shadow.mapPass );
		renderer.clear();
		renderer.renderBufferDirect( camera, null, geometry, shadowMaterialVertical, fullScreenMesh, null );

		// horizontal pass

		shadowMaterialHorizontal.uniforms.shadow_pass.value = shadow.mapPass.texture;
		shadowMaterialHorizontal.uniforms.resolution.value = shadow.mapSize;
		shadowMaterialHorizontal.uniforms.radius.value = shadow.radius;
		renderer.setRenderTarget( shadow.map );
		renderer.clear();
		renderer.renderBufferDirect( camera, null, geometry, shadowMaterialHorizontal, fullScreenMesh, null );

	}

	function getDepthMaterial( object, material, light, type ) {

		let result = null;

		const customMaterial = ( light.isPointLight === true ) ? object.customDistanceMaterial : object.customDepthMaterial;

		if ( customMaterial !== undefined ) {

			result = customMaterial;

		} else {

			result = ( light.isPointLight === true ) ? _distanceMaterial : _depthMaterial;

			if ( ( renderer.localClippingEnabled && material.clipShadows === true && Array.isArray( material.clippingPlanes ) && material.clippingPlanes.length !== 0 ) ||
				( material.displacementMap && material.displacementScale !== 0 ) ||
				( material.alphaMap && material.alphaTest > 0 ) ||
				( material.map && material.alphaTest > 0 ) ||
				( material.alphaToCoverage === true ) ) {

				// in this case we need a unique material instance reflecting the
				// appropriate state

				const keyA = result.uuid, keyB = material.uuid;

				let materialsForVariant = _materialCache[ keyA ];

				if ( materialsForVariant === undefined ) {

					materialsForVariant = {};
					_materialCache[ keyA ] = materialsForVariant;

				}

				let cachedMaterial = materialsForVariant[ keyB ];

				if ( cachedMaterial === undefined ) {

					cachedMaterial = result.clone();
					materialsForVariant[ keyB ] = cachedMaterial;
					material.addEventListener( 'dispose', onMaterialDispose );

				}

				result = cachedMaterial;

			}

		}

		result.visible = material.visible;
		result.wireframe = material.wireframe;

		if ( type === VSMShadowMap ) {

			result.side = ( material.shadowSide !== null ) ? material.shadowSide : material.side;

		} else {

			result.side = ( material.shadowSide !== null ) ? material.shadowSide : shadowSide[ material.side ];

		}

		result.alphaMap = material.alphaMap;
		result.alphaTest = ( material.alphaToCoverage === true ) ? 0.5 : material.alphaTest; // approximate alphaToCoverage by using a fixed alphaTest value
		result.map = material.map;

		result.clipShadows = material.clipShadows;
		result.clippingPlanes = material.clippingPlanes;
		result.clipIntersection = material.clipIntersection;

		result.displacementMap = material.displacementMap;
		result.displacementScale = material.displacementScale;
		result.displacementBias = material.displacementBias;

		result.wireframeLinewidth = material.wireframeLinewidth;
		result.linewidth = material.linewidth;

		if ( light.isPointLight === true && result.isMeshDistanceMaterial === true ) {

			const materialProperties = renderer.properties.get( result );
			materialProperties.light = light;

		}

		return result;

	}

	function renderObject( object, camera, shadowCamera, light, type ) {

		if ( object.visible === false ) return;

		const visible = object.layers.test( camera.layers );

		if ( visible && ( object.isMesh || object.isLine || object.isPoints ) ) {

			if ( ( object.castShadow || ( object.receiveShadow && type === VSMShadowMap ) ) && ( ! object.frustumCulled || _frustum.intersectsObject( object ) ) ) {

				object.modelViewMatrix.multiplyMatrices( shadowCamera.matrixWorldInverse, object.matrixWorld );

				const geometry = objects.update( object );
				const material = object.material;

				if ( Array.isArray( material ) ) {

					const groups = geometry.groups;

					for ( let k = 0, kl = groups.length; k < kl; k ++ ) {

						const group = groups[ k ];
						const groupMaterial = material[ group.materialIndex ];

						if ( groupMaterial && groupMaterial.visible ) {

							const depthMaterial = getDepthMaterial( object, groupMaterial, light, type );

							object.onBeforeShadow( renderer, object, camera, shadowCamera, geometry, depthMaterial, group );

							renderer.renderBufferDirect( shadowCamera, null, geometry, depthMaterial, object, group );

							object.onAfterShadow( renderer, object, camera, shadowCamera, geometry, depthMaterial, group );

						}

					}

				} else if ( material.visible ) {

					const depthMaterial = getDepthMaterial( object, material, light, type );

					object.onBeforeShadow( renderer, object, camera, shadowCamera, geometry, depthMaterial, null );

					renderer.renderBufferDirect( shadowCamera, null, geometry, depthMaterial, object, null );

					object.onAfterShadow( renderer, object, camera, shadowCamera, geometry, depthMaterial, null );

				}

			}

		}

		const children = object.children;

		for ( let i = 0, l = children.length; i < l; i ++ ) {

			renderObject( children[ i ], camera, shadowCamera, light, type );

		}

	}

	function onMaterialDispose( event ) {

		const material = event.target;

		material.removeEventListener( 'dispose', onMaterialDispose );

		// make sure to remove the unique distance/depth materials used for shadow map rendering

		for ( const id in _materialCache ) {

			const cache = _materialCache[ id ];

			const uuid = event.target.uuid;

			if ( uuid in cache ) {

				const shadowMaterial = cache[ uuid ];
				shadowMaterial.dispose();
				delete cache[ uuid ];

			}

		}

	}

}


export { WebGLShadowMap };
