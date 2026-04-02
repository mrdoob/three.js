import { BasicShadowMap, PCFShadowMap, PCFSoftShadowMap, VSMShadowMap } from '../../constants.js';
import { warn } from '../../utils.js';

function getKeys( obj ) {

	const keys = Object.keys( obj );

	let proto = Object.getPrototypeOf( obj );

	while ( proto ) {

		const descriptors = Object.getOwnPropertyDescriptors( proto );

		for ( const key in descriptors ) {

			if ( descriptors[ key ] !== undefined ) {

				const descriptor = descriptors[ key ];

				if ( descriptor && typeof descriptor.get === 'function' ) {

					keys.push( key );

				}

			}

		}

		proto = Object.getPrototypeOf( proto );

	}

	return keys;

}

function getDebugValue( value ) {

	if ( value === undefined ) return 'undefined';
	if ( value === null ) return 'null';

	const type = typeof value;

	if ( type === 'string' ) return `"${ value }"`;
	if ( type === 'number' || type === 'boolean' || type === 'bigint' ) return String( value );

	if ( Array.isArray( value ) ) {

		const values = value.slice( 0, 4 ).map( getDebugValue ).join( ', ' );
		return `[${ values }${ value.length > 4 ? ', ...' : '' }]`;

	}

	if ( value.isTexture === true ) return `${ value.type }#${ value.id } v${ value.version }`;
	if ( value.isColor === true ) return `Color(${ value.r }, ${ value.g }, ${ value.b })`;
	if ( value.isVector2 === true || value.isVector3 === true || value.isVector4 === true ) return `${ value.constructor.name }(${ value.toArray().join( ', ' ) })`;
	if ( value.isMatrix3 === true || value.isMatrix4 === true ) return `${ value.constructor.name }(...)`;
	if ( value.uuid !== undefined ) return `${ value.type || 'Object' }(${ value.uuid })`;

	return String( value );

}

function getShadowMapTypeName( type ) {

	if ( type === BasicShadowMap ) return 'BasicShadowMap';
	if ( type === PCFShadowMap ) return 'PCFShadowMap';
	if ( type === PCFSoftShadowMap ) return 'PCFSoftShadowMap';
	if ( type === VSMShadowMap ) return 'VSMShadowMap';

	return String( type );

}

function getNodeValue( node ) {

	if ( node === null ) return 'none';

	const name = node.name !== undefined && node.name !== '' ? ` "${ node.name }"` : '';
	return `${ node.type || node.constructor.name }#${ node.id }${ name }`;

}

function getLightValueKey( light ) {

	let valueKey = `${ light.type }:${ light.id }:${ light.castShadow === true ? 1 : 0 }`;

	if ( light.isSpotLight === true ) {

		valueKey += `:${ light.map !== null ? light.map.id : - 1 }`;
		valueKey += `:${ light.colorNode ? light.colorNode.getCacheKey() : - 1 }`;

	}

	return valueKey;

}

function getLightValue( light ) {

	let value = `${ light.type }#${ light.id }`;

	if ( light.castShadow === true ) value += ' shadow';

	if ( light.isSpotLight === true ) {

		if ( light.map !== null ) value += ` map:${ light.map.id }`;
		if ( light.colorNode ) value += ' colorNode';

	}

	return value;

}

function getLightsValue( lightsNode ) {

	if ( lightsNode === null ) return '0 lights';

	const lights = lightsNode.getLights().slice().sort( ( a, b ) => a.id - b.id );
	const values = lights.map( getLightValue );
	const label = `${ lights.length } light${ lights.length === 1 ? '' : 's' }`;

	return values.length > 0 ? `${ label } [${ values.join( ', ' ) }]` : label;

}

function getLightsValueKey( lightsNode ) {

	if ( lightsNode === null ) return '';

	return lightsNode.getLights().slice().sort( ( a, b ) => a.id - b.id ).map( getLightValueKey ).join( ',' );

}

function getCacheKeyDifference( previousComponents, currentComponents ) {

	const currentMap = new Map();

	for ( const component of currentComponents ) {

		currentMap.set( component.property, component );

	}

	for ( const component of previousComponents ) {

		const current = currentMap.get( component.property );

		if ( current === undefined ) {

			return { property: component.property, previousValue: component.value, value: 'undefined' };

		}

		if ( component.valueKey !== current.valueKey ) {

			return { property: component.property, previousValue: component.value, value: current.value };

		}

	}

	const previousMap = new Map();

	for ( const component of previousComponents ) {

		previousMap.set( component.property, component );

	}

	for ( const component of currentComponents ) {

		if ( previousMap.has( component.property ) === false ) {

			return { property: component.property, previousValue: 'undefined', value: component.value };

		}

	}

	return null;

}

function getMaterialCacheKeyComponents( renderObject ) {

	const { object, material, renderer } = renderObject;
	const cacheKeyComponents = [];
	const customProgramCacheKey = material.customProgramCacheKey();

	cacheKeyComponents.push( {
		property: 'material.customProgramCacheKey',
		valueKey: customProgramCacheKey,
		value: getDebugValue( customProgramCacheKey )
	} );

	for ( const property of getKeys( material ) ) {

		if ( /^(is[A-Z]|_)|^(visible|version|uuid|name|opacity|userData)$/.test( property ) ) continue;

		const value = material[ property ];
		let valueKey;

		if ( value !== null ) {

			const type = typeof value;

			if ( type === 'number' ) {

				valueKey = value !== 0 ? '1' : '0';

			} else if ( type === 'object' ) {

				valueKey = '{';

				if ( value.isTexture ) {

					valueKey += value.mapping;

					if ( renderer.backend.isWebGPUBackend === true ) {

						valueKey += value.magFilter;
						valueKey += value.minFilter;
						valueKey += value.wrapS;
						valueKey += value.wrapT;
						valueKey += value.wrapR;

					}

				}

				valueKey += '}';

			} else {

				valueKey = String( value );

			}

		} else {

			valueKey = String( value );

		}

		cacheKeyComponents.push( {
			property: `material.${ property }`,
			valueKey,
			value: getDebugValue( value )
		} );

	}

	cacheKeyComponents.push( {
		property: 'clippingContext.cacheKey',
		valueKey: renderObject.clippingContextCacheKey,
		value: getDebugValue( renderObject.clippingContextCacheKey )
	} );

	if ( object.geometry ) {

		const geometryCacheKey = renderObject.getGeometryCacheKey();

		cacheKeyComponents.push( {
			property: 'geometry.cacheKey',
			valueKey: geometryCacheKey,
			value: getDebugValue( geometryCacheKey )
		} );

	}

	if ( object.skeleton ) {

		cacheKeyComponents.push( {
			property: 'object.skeleton.bones.length',
			valueKey: String( object.skeleton.bones.length ),
			value: String( object.skeleton.bones.length )
		} );

	}

	if ( object.isBatchedMesh ) {

		cacheKeyComponents.push( {
			property: 'object._matricesTexture',
			valueKey: object._matricesTexture.uuid,
			value: getDebugValue( object._matricesTexture )
		} );

		if ( object._colorsTexture !== null ) {

			cacheKeyComponents.push( {
				property: 'object._colorsTexture',
				valueKey: object._colorsTexture.uuid,
				value: getDebugValue( object._colorsTexture )
			} );

		}

	}

	if ( object.isInstancedMesh || object.count > 1 || Array.isArray( object.morphTargetInfluences ) ) {

		cacheKeyComponents.push( {
			property: 'object.uuid',
			valueKey: object.uuid,
			value: object.uuid
		} );

	}

	cacheKeyComponents.push( {
		property: 'renderContext.id',
		valueKey: String( renderObject.context.id ),
		value: String( renderObject.context.id )
	} );

	cacheKeyComponents.push( {
		property: 'object.receiveShadow',
		valueKey: String( object.receiveShadow ),
		value: String( object.receiveShadow )
	} );

	return cacheKeyComponents;

}

function getDynamicCacheKeyComponents( renderObject ) {

	const cacheKeyComponents = [ {
		property: 'scene.lights',
		valueKey: getLightsValueKey( renderObject.lightsNode ),
		value: getLightsValue( renderObject.lightsNode )
	}, {
		property: 'object.receiveShadow',
		valueKey: String( renderObject.object.receiveShadow ),
		value: String( renderObject.object.receiveShadow )
	}, {
		property: 'renderer.contextNode',
		valueKey: `${ renderObject.renderer.contextNode.id },${ renderObject.renderer.contextNode.version }`,
		value: `id:${ renderObject.renderer.contextNode.id }, version:${ renderObject.renderer.contextNode.version }`
	} ];

	if ( renderObject.material.isShadowPassMaterial !== true ) {

		const environmentNode = renderObject._nodes.getEnvironmentNode( renderObject.scene );
		const fogNode = renderObject._nodes.getFogNode( renderObject.scene );
		const outputRenderTarget = renderObject.renderer.getOutputRenderTarget();

		cacheKeyComponents.push( {
			property: 'scene.environmentNode',
			valueKey: environmentNode ? String( environmentNode.getCacheKey() ) : 'null',
			value: getNodeValue( environmentNode )
		}, {
			property: 'scene.fogNode',
			valueKey: fogNode ? String( fogNode.getCacheKey() ) : 'null',
			value: getNodeValue( fogNode )
		}, {
			property: 'renderTarget.multiview',
			valueKey: outputRenderTarget && outputRenderTarget.multiview ? 'true' : 'false',
			value: outputRenderTarget && outputRenderTarget.multiview ? 'true' : 'false'
		}, {
			property: 'renderer.shadowMap.enabled',
			valueKey: renderObject.renderer.shadowMap.enabled ? 'true' : 'false',
			value: renderObject.renderer.shadowMap.enabled ? 'true' : 'false'
		}, {
			property: 'renderer.shadowMap.type',
			valueKey: String( renderObject.renderer.shadowMap.type ),
			value: getShadowMapTypeName( renderObject.renderer.shadowMap.type )
		} );

	}

	if ( renderObject.camera.isArrayCamera ) {

		cacheKeyComponents.push( {
			property: 'camera.cameras.length',
			valueKey: String( renderObject.camera.cameras.length ),
			value: String( renderObject.camera.cameras.length )
		} );

	}

	return cacheKeyComponents;

}

/**
 * Renderer component for node material invalidation debugging.
 *
 * @private
 */
class NodeMaterialDebug {

	/**
	 * Constructs a new node material debug component.
	 *
	 * @param {Renderer} renderer - The renderer.
	 */
	constructor( renderer ) {

		/**
		 * The renderer.
		 *
		 * @type {Renderer}
		 */
		this.renderer = renderer;

		/**
		 * Weak map with cache-key snapshots per render object.
		 *
		 * @type {WeakMap<RenderObject,Object>}
		 */
		this.cache = new WeakMap();

	}

	/**
	 * Whether node material invalidation debugging is enabled.
	 *
	 * @type {boolean}
	 * @readonly
	 */
	get enabled() {

		return this.renderer.debug.traceNodeMaterialInvalidation === true || typeof this.renderer.debug.onNodeMaterialInvalidation === 'function';

	}

	/**
	 * Updates the cached debug data for the given render object.
	 *
	 * @param {RenderObject} renderObject - The render object.
	 */
	update( renderObject ) {

		if ( this.enabled === false ) return;

		this.cache.set( renderObject, {
			material: getMaterialCacheKeyComponents( renderObject ),
			dynamic: getDynamicCacheKeyComponents( renderObject )
		} );

	}

	/**
	 * Reports cache invalidation for the given render object.
	 *
	 * @param {RenderObject} renderObject - The render object.
	 */
	report( renderObject ) {

		if ( this.enabled === false ) return;

		const previousData = this.cache.get( renderObject );

		if ( previousData === undefined ) return;

		const materialCacheDifference = getCacheKeyDifference( previousData.material, getMaterialCacheKeyComponents( renderObject ) );

		if ( materialCacheDifference !== null ) {

			this._dispatch( {
				stage: 'material-cache',
				property: materialCacheDifference.property,
				previousValue: materialCacheDifference.previousValue,
				value: materialCacheDifference.value,
				rebuild: true,
				needsRefresh: true,
				material: renderObject.material,
				renderObject
			} );

			return;

		}

		const dynamicCacheDifference = getCacheKeyDifference( previousData.dynamic, getDynamicCacheKeyComponents( renderObject ) );

		if ( dynamicCacheDifference !== null ) {

			this._dispatch( {
				stage: 'dynamic-cache',
				property: dynamicCacheDifference.property,
				previousValue: dynamicCacheDifference.previousValue,
				value: dynamicCacheDifference.value,
				rebuild: true,
				needsRefresh: true,
				material: renderObject.material,
				renderObject
			} );

		}

	}

	_dispatch( data ) {

		const callback = this.renderer.debug.onNodeMaterialInvalidation;
		const materialLabel = data.material.name !== '' ? data.material.name : data.material.type;
		const event = { ...data, materialLabel };

		if ( typeof callback === 'function' ) {

			callback( event );
			return;

		}

		if ( this.renderer.debug.traceNodeMaterialInvalidation !== true ) return;

		const property = event.property !== undefined ? ` via ${ event.property }` : '';
		const values = event.previousValue !== undefined && event.value !== undefined ? ` (${ event.previousValue } -> ${ event.value })` : '';

		warn( `Renderer: NodeMaterial needs rebuild for "${ materialLabel }"${ property }${ values }.` );

	}

}

export default NodeMaterialDebug;
