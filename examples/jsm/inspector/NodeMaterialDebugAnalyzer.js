import { BasicShadowMap, PCFShadowMap, PCFSoftShadowMap, VSMShadowMap, warn } from 'three/webgpu';


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

function getPath( basePath, property, index = undefined ) {

	let path = `${ basePath }.${ property }`;

	if ( index !== undefined ) {

		path += Number.isInteger( index ) ? `[${ index }]` : `.${ index }`;

	}

	return path;

}

function getNodeCustomCacheStateComponents( node, path ) {

	const cacheKeyComponents = [];

	if ( node.type === 'ToneMappingNode' && typeof node.getToneMapping === 'function' ) {

		const toneMapping = node.getToneMapping();

		cacheKeyComponents.push( {
			property: `${ path }.toneMapping`,
			valueKey: String( toneMapping ),
			value: String( toneMapping )
		} );

	} else if ( Object.prototype.hasOwnProperty.call( node, 'enabled' ) && typeof node.enabled === 'boolean' ) {

		cacheKeyComponents.push( {
			property: `${ path }.enabled`,
			valueKey: String( node.enabled ),
			value: node.enabled ? 'enabled' : 'disabled'
		} );

	} else if ( node.isPropertyNode === true ) {

		cacheKeyComponents.push( {
			property: `${ path }.name`,
			valueKey: String( node.name ),
			value: getDebugValue( node.name )
		}, {
			property: `${ path }.varying`,
			valueKey: String( node.varying ),
			value: String( node.varying )
		} );

	} else if ( typeof node.getLights === 'function' ) {

		cacheKeyComponents.push( {
			property: `${ path }.lights`,
			valueKey: getLightsNodeValueKey( node ),
			value: getLightsNodeValue( node )
		} );

	}

	return cacheKeyComponents;

}

function getNodeComponent( node, path, withSnapshot = false ) {

	const component = {
		node,
		property: path,
		valueKey: node.getCacheKey(),
		value: getNodeValue( node ),
		nodeId: node.id,
		nodeType: node.type || node.constructor.name,
		customCacheKey: node.customCacheKey(),
		customCacheState: getNodeCustomCacheStateComponents( node, path )
	};

	if ( withSnapshot === true ) {

		component.snapshot = getNodeSnapshot( node, path );

	}

	return component;

}

function getComponentByProperty( components, property ) {

	for ( const component of components ) {

		if ( component.property === property ) return component;

	}

	return null;

}

function getNodeSnapshot( node, path, ignores = new Set() ) {

	const component = getNodeComponent( node, path );

	const nextIgnores = new Set( ignores );
	nextIgnores.add( node );

	const children = [];

	for ( const { property, index, childNode } of node._getChildren( new Set( ignores ) ) ) {

		const childPath = getPath( path, property, index );

		children.push( {
			property: childPath,
			valueKey: childNode.getCacheKey(),
			value: getNodeValue( childNode ),
			snapshot: getNodeSnapshot( childNode, childPath, nextIgnores )
		} );

	}

	return {
		path,
		value: component.value,
		valueKey: component.valueKey,
		nodeId: component.nodeId,
		nodeType: component.nodeType,
		customCacheKey: component.customCacheKey,
		customCacheState: component.customCacheState,
		children
	};

}

function getMaterialNodeComponents( material, withSnapshots = false ) {

	if ( material.isNodeMaterial !== true || typeof material._getNodeChildren !== 'function' ) return [];

	const cacheKeyComponents = [];

	for ( const { property, childNode } of material._getNodeChildren() ) {

		const path = `material.${ property }`;

		cacheKeyComponents.push( getNodeComponent( childNode, path, withSnapshots ) );

	}

	return cacheKeyComponents;

}

function getTraceMaterialNodeComponents( previousComponents, currentComponents ) {

	const previousMap = new Map();

	for ( const component of previousComponents ) {

		previousMap.set( component.property, component );

	}

	for ( const component of currentComponents ) {

		const previousComponent = previousMap.get( component.property );

		if (
			previousComponent !== undefined &&
			previousComponent.valueKey === component.valueKey &&
			previousComponent.nodeId === component.nodeId &&
			previousComponent.nodeType === component.nodeType &&
			previousComponent.snapshot !== undefined
		) {

			component.snapshot = previousComponent.snapshot;

		} else {

			component.snapshot = getNodeSnapshot( component.node, component.property );

		}

	}

	return currentComponents;

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

	const lights = lightsNode.getLights().slice().sort( ( a, b ) => a.id - b.id );
	const values = lights.map( getLightValue );
	const label = `${ lights.length } light${ lights.length === 1 ? '' : 's' }`;

	return values.length > 0 ? `${ label } [${ values.join( ', ' ) }]` : label;

}

function getLightsNodeValue( lightsNode ) {

	if ( lightsNode === null ) return 'none';

	const lightsNodeType = lightsNode.type || lightsNode.constructor.name;

	return `${ lightsNodeType } ${ getLightsValue( lightsNode ) }`;

}

function getLightsNodeValueKey( lightsNode ) {

	if ( lightsNode === null ) return 'null';

	return String( lightsNode.getCacheKey( true ) );

}

function getCacheKeyDifference( previousComponents, currentComponents, resolveDifference = null ) {

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

			if ( resolveDifference !== null ) {

				const resolvedDifference = resolveDifference( component, current );

				if ( resolvedDifference !== null ) return resolvedDifference;

			}

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

function getNodeSnapshotDifference( previousSnapshot, currentSnapshot ) {

	if ( previousSnapshot.valueKey === currentSnapshot.valueKey ) return null;

	if ( previousSnapshot.nodeId !== currentSnapshot.nodeId || previousSnapshot.nodeType !== currentSnapshot.nodeType ) {

		return {
			property: previousSnapshot.path,
			previousValue: previousSnapshot.value,
			value: currentSnapshot.value
		};

	}

	const childDifference = getCacheKeyDifference(
		previousSnapshot.children,
		currentSnapshot.children,
		( previousComponent, currentComponent ) => getNodeSnapshotDifference( previousComponent.snapshot, currentComponent.snapshot )
	);

	if ( childDifference !== null ) return childDifference;

	if ( previousSnapshot.customCacheKey !== currentSnapshot.customCacheKey ) {

		const customCacheStateDifference = getCacheKeyDifference( previousSnapshot.customCacheState, currentSnapshot.customCacheState );

		if ( customCacheStateDifference !== null ) return customCacheStateDifference;

		return {
			property: `${ previousSnapshot.path }.customCacheKey()`,
			previousValue: String( previousSnapshot.customCacheKey ),
			value: String( currentSnapshot.customCacheKey )
		};

	}

	return {
		property: previousSnapshot.path,
		previousValue: `${ previousSnapshot.value } cacheKey:${ previousSnapshot.valueKey }`,
		value: `${ currentSnapshot.value } cacheKey:${ currentSnapshot.valueKey }`
	};

}

function getNodeComponentDifference( previousComponent, currentComponent ) {

	if ( previousComponent.valueKey === currentComponent.valueKey ) return null;

	if ( previousComponent.nodeId !== currentComponent.nodeId || previousComponent.nodeType !== currentComponent.nodeType ) {

		return {
			property: previousComponent.property,
			previousValue: previousComponent.value,
			value: currentComponent.value
		};

	}

	if ( previousComponent.customCacheKey !== currentComponent.customCacheKey ) {

		const customCacheStateDifference = getCacheKeyDifference( previousComponent.customCacheState, currentComponent.customCacheState );

		if ( customCacheStateDifference !== null ) return customCacheStateDifference;

		return {
			property: `${ previousComponent.property }.customCacheKey()`,
			previousValue: String( previousComponent.customCacheKey ),
			value: String( currentComponent.customCacheKey )
		};

	}

	return {
		property: previousComponent.property,
		previousValue: `${ previousComponent.value } cacheKey:${ previousComponent.valueKey }`,
		value: `${ currentComponent.value } cacheKey:${ currentComponent.valueKey }`
	};

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
		property: 'scene.lightsNode',
		valueKey: getLightsNodeValueKey( renderObject.lightsNode ),
		value: getLightsNodeValue( renderObject.lightsNode )
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

function getNodesCacheKey( renderObject ) {

	let cacheKey = 0;

	if ( renderObject.material.isShadowPassMaterial !== true ) {

		cacheKey = renderObject._nodes.getCacheKey( renderObject.scene, renderObject.lightsNode );

	}

	return String( cacheKey );

}

/**
 * Renderer component for node material invalidation debugging.
 *
 * @private
 */
class NodeMaterialDebugAnalyzer {

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

		return true;

	}

	/**
	 * Whether detailed material-node tracing is enabled.
	 *
	 * @type {boolean}
	 * @readonly
	 */
	get traceEnabled() {

		return true;

	}

	/**
	 * Updates the cached debug data for the given render object.
	 *
	 * @param {RenderObject} renderObject - The render object.
	 */
	update( renderObject ) {

		if ( this.enabled === false ) return;

		const previousData = this.cache.get( renderObject );
		const geometryId = renderObject.geometry !== null ? renderObject.geometry.id : null;

		if ( previousData !== undefined ) {

			// Callback mode only needs the baseline captured when the render object became current.
			if ( this.traceEnabled === false ) return;

			if (
				previousData.materialNodes !== undefined &&
				previousData.version === renderObject.version &&
				previousData.geometryId === geometryId &&
				previousData.clippingContextCacheKey === renderObject.clippingContextCacheKey
			) {

				return;

			}

		}

		const data = {
			version: renderObject.version,
			geometryId,
			clippingContextCacheKey: renderObject.clippingContextCacheKey,
			material: getMaterialCacheKeyComponents( renderObject ),
			materialNodes: getMaterialNodeComponents( renderObject.material, this.traceEnabled ),
			materialNodesTrace: this.traceEnabled,
			dynamic: getDynamicCacheKeyComponents( renderObject ),
			dynamicCacheKey: String( renderObject.getDynamicCacheKey() ),
			nodesCacheKey: getNodesCacheKey( renderObject )
		};

		this.cache.set( renderObject, data );

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

		let material = null;
		let materialNodes = null;
		let traceMaterialNodes = null;
		let dynamicCacheKey = null;
		let nodesCacheKey = null;
		const currentMaterial = () => material || ( material = getMaterialCacheKeyComponents( renderObject ) );
		const currentMaterialNodes = () => materialNodes || ( materialNodes = getMaterialNodeComponents( renderObject.material ) );
		const currentTraceMaterialNodes = () => {

			if ( traceMaterialNodes === null ) {

				traceMaterialNodes = getTraceMaterialNodeComponents( previousData.materialNodes, currentMaterialNodes() );

			}

			return traceMaterialNodes;

		};

		const currentDynamicCacheKey = () => dynamicCacheKey || ( dynamicCacheKey = String( renderObject.getDynamicCacheKey() ) );
		const currentNodesCacheKey = () => nodesCacheKey || ( nodesCacheKey = getNodesCacheKey( renderObject ) );

		const materialCacheDifference = getCacheKeyDifference(
			previousData.material,
			currentMaterial(),
			( previousComponent, currentComponent ) => {

				if ( previousData.materialNodes === undefined ) return null;
				if ( previousComponent.property !== 'material.customProgramCacheKey' ) return null;

				let nodeDifference = null;

				nodeDifference = getCacheKeyDifference( previousData.materialNodes, currentMaterialNodes(), getNodeComponentDifference );

				if ( nodeDifference === null ) return null;

				if ( previousData.materialNodesTrace === true ) {

					const previousNode = getComponentByProperty( previousData.materialNodes, nodeDifference.property );

					if (
						previousNode !== null &&
						previousNode.snapshot !== undefined &&
						previousNode.property === nodeDifference.property
					) {

						const currentNode = getComponentByProperty( currentTraceMaterialNodes(), nodeDifference.property );

						if ( currentNode !== null && currentNode.snapshot !== undefined ) {

							const snapshotDifference = getNodeSnapshotDifference( previousNode.snapshot, currentNode.snapshot );

							if ( snapshotDifference !== null ) nodeDifference = snapshotDifference;

						}

					}

				}

				return {
					property: nodeDifference.property,
					previousValue: nodeDifference.previousValue,
					value: nodeDifference.value,
					sourceProperty: previousComponent.property,
					sourcePreviousValue: previousComponent.value,
					sourceValue: currentComponent.value
				};

			}
		);

		if ( materialCacheDifference !== null ) {

			this._dispatch( {
				stage: 'material-cache',
				property: materialCacheDifference.property,
				previousValue: materialCacheDifference.previousValue,
				value: materialCacheDifference.value,
				sourceProperty: materialCacheDifference.sourceProperty,
				sourcePreviousValue: materialCacheDifference.sourcePreviousValue,
				sourceValue: materialCacheDifference.sourceValue,
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
				dynamicCacheKeyPrevious: previousData.dynamicCacheKey,
				dynamicCacheKey: currentDynamicCacheKey(),
				nodesCacheKeyPrevious: previousData.nodesCacheKey,
				nodesCacheKey: currentNodesCacheKey(),
				material: renderObject.material,
				renderObject
			} );

			return;

		}

		const previousCustomProgramCacheKey = previousData.material.find( ( component ) => component.property === 'material.customProgramCacheKey' );
		const currentCustomProgramCacheKey = currentMaterial().find( ( component ) => component.property === 'material.customProgramCacheKey' );

		this._dispatch( {
			stage: 'node-cache',
			property: 'material.customProgramCacheKey',
			previousValue: previousCustomProgramCacheKey ? previousCustomProgramCacheKey.value : previousData.materialCacheKey,
			value: currentCustomProgramCacheKey ? currentCustomProgramCacheKey.value : renderObject.getMaterialCacheKey(),
			rebuild: true,
			needsRefresh: true,
			material: renderObject.material,
			renderObject
		} );

	}

	_dispatch( data ) {

		const callback = this.onNodeMaterialInvalidation;
		const materialLabel = data.material.name !== '' ? data.material.name : data.material.type;
		const event = Object.assign( {}, data );

		event.materialLabel = materialLabel;

		if ( typeof callback === 'function' ) {

			callback( event );
			return;

		}


		const property = event.property !== undefined ? ` via ${ event.property }` : '';
		const values = event.previousValue !== undefined && event.value !== undefined ? ` (${ event.previousValue } -> ${ event.value })` : '';
		const source = event.sourceProperty !== undefined && event.sourceProperty !== event.property ? ` [${ event.sourceProperty }]` : '';

		warn( `Renderer: NodeMaterial needs rebuild for "${ materialLabel }"${ property }${ values }${ source }.` );

	}

}

export default NodeMaterialDebugAnalyzer;
