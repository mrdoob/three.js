import DataMap from '../DataMap.js';
import ChainMap from '../ChainMap.js';
import NodeBuilderState from './NodeBuilderState.js';
import { EquirectangularReflectionMapping, EquirectangularRefractionMapping, NoToneMapping, SRGBColorSpace } from 'three';
import { NodeFrame, vec4, objectGroup, renderGroup, frameGroup, cubeTexture, texture, rangeFog, densityFog, reference, viewportBottomLeft, normalWorld, pmremTexture, viewportTopLeft } from '../../../nodes/Nodes.js';

class Nodes extends DataMap {

	constructor( renderer, backend ) {

		super();

		this.renderer = renderer;
		this.backend = backend;
		this.nodeFrame = new NodeFrame();
		this.nodeBuilderCache = new Map();
		this.callHashCache = new ChainMap();
		this.groupsData = new ChainMap();

	}

	updateGroup( nodeUniformsGroup ) {

		const groupNode = nodeUniformsGroup.groupNode;
		const name = groupNode.name;

		// objectGroup is every updated

		if ( name === objectGroup.name ) return true;

		// renderGroup is updated once per render/compute call

		if ( name === renderGroup.name ) {

			const uniformsGroupData = this.get( nodeUniformsGroup );
			const renderId = this.nodeFrame.renderId;

			if ( uniformsGroupData.renderId !== renderId ) {

				uniformsGroupData.renderId = renderId;

				return true;

			}

			return false;

		}

		// frameGroup is updated once per frame

		if ( name === frameGroup.name ) {

			const uniformsGroupData = this.get( nodeUniformsGroup );
			const frameId = this.nodeFrame.frameId;

			if ( uniformsGroupData.frameId !== frameId ) {

				uniformsGroupData.frameId = frameId;

				return true;

			}

			return false;

		}

		// other groups are updated just when groupNode.needsUpdate is true

		const groupChain = [ groupNode, nodeUniformsGroup ];

		let groupData = this.groupsData.get( groupChain );
		if ( groupData === undefined ) this.groupsData.set( groupChain, groupData = {} );

		if ( groupData.version !== groupNode.version ) {

			groupData.version = groupNode.version;

			return true;

		}

		return false;

	}

	getForRenderCacheKey( renderObject ) {

		return renderObject.initialCacheKey;

	}

	getForRender( renderObject ) {

		const renderObjectData = this.get( renderObject );

		let nodeBuilderState = renderObjectData.nodeBuilderState;

		if ( nodeBuilderState === undefined ) {

			const { nodeBuilderCache } = this;

			const cacheKey = this.getForRenderCacheKey( renderObject );

			nodeBuilderState = nodeBuilderCache.get( cacheKey );

			if ( nodeBuilderState === undefined ) {

				const nodeBuilder = this.backend.createNodeBuilder( renderObject.object, this.renderer, renderObject.scene );
				nodeBuilder.material = renderObject.material;
				nodeBuilder.context.material = renderObject.material;
				nodeBuilder.lightsNode = renderObject.lightsNode;
				nodeBuilder.environmentNode = this.getEnvironmentNode( renderObject.scene );
				nodeBuilder.fogNode = this.getFogNode( renderObject.scene );
				nodeBuilder.clippingContext = renderObject.clippingContext;
				nodeBuilder.build();

				nodeBuilderState = this._createNodeBuilderState( nodeBuilder );

				nodeBuilderCache.set( cacheKey, nodeBuilderState );

			}

			nodeBuilderState.usedTimes ++;

			renderObjectData.nodeBuilderState = nodeBuilderState;

		}

		return nodeBuilderState;

	}

	delete( object ) {

		if ( object.isRenderObject ) {

			const nodeBuilderState = this.get( object ).nodeBuilderState;
			nodeBuilderState.usedTimes --;

			if ( nodeBuilderState.usedTimes === 0 ) {

				this.nodeBuilderCache.delete( this.getForRenderCacheKey( object ) );

			}

		}

		return super.delete( object );

	}

	getForCompute( computeNode ) {

		const computeData = this.get( computeNode );

		let nodeBuilderState = computeData.nodeBuilderState;

		if ( nodeBuilderState === undefined ) {

			const nodeBuilder = this.backend.createNodeBuilder( computeNode, this.renderer );
			nodeBuilder.build();

			nodeBuilderState = this._createNodeBuilderState( nodeBuilder );

			computeData.nodeBuilderState = nodeBuilderState;

		}

		return nodeBuilderState;

	}

	_createNodeBuilderState( nodeBuilder ) {

		return new NodeBuilderState(
			nodeBuilder.vertexShader,
			nodeBuilder.fragmentShader,
			nodeBuilder.computeShader,
			nodeBuilder.getAttributesArray(),
			nodeBuilder.getBindings(),
			nodeBuilder.updateNodes,
			nodeBuilder.updateBeforeNodes,
			nodeBuilder.transforms
		);

	}

	getEnvironmentNode( scene ) {

		return scene.environmentNode || this.get( scene ).environmentNode || null;

	}

	getBackgroundNode( scene ) {

		return scene.backgroundNode || this.get( scene ).backgroundNode || null;

	}

	getFogNode( scene ) {

		return scene.fogNode || this.get( scene ).fogNode || null;

	}

	getCacheKey( scene, lightsNode ) {

		const chain = [ scene, lightsNode ];
		const callId = this.renderer.info.calls;

		let cacheKeyData = this.callHashCache.get( chain );

		if ( cacheKeyData === undefined || cacheKeyData.callId !== callId ) {

			const environmentNode = this.getEnvironmentNode( scene );
			const fogNode = this.getFogNode( scene );

			const cacheKey = [];

			if ( lightsNode ) cacheKey.push( lightsNode.getCacheKey() );
			if ( environmentNode ) cacheKey.push( environmentNode.getCacheKey() );
			if ( fogNode ) cacheKey.push( fogNode.getCacheKey() );

			cacheKeyData = {
				callId,
				cacheKey: cacheKey.join( ',' )
			};

			this.callHashCache.set( chain, cacheKeyData );

		}

		return cacheKeyData.cacheKey;

	}

	updateScene( scene ) {

		this.updateEnvironment( scene );
		this.updateFog( scene );
		this.updateBackground( scene );

	}

	get isToneMappingState() {

		return this.renderer.getRenderTarget() ? false : true;

	}

	updateBackground( scene ) {

		const sceneData = this.get( scene );
		const background = scene.background;

		if ( background ) {

			if ( sceneData.background !== background ) {

				let backgroundNode = null;

				if ( background.isCubeTexture === true || ( background.mapping === EquirectangularReflectionMapping || background.mapping === EquirectangularRefractionMapping ) ) {

					backgroundNode = pmremTexture( background, normalWorld );

				} else if ( background.isTexture === true ) {

					backgroundNode = texture( background, viewportBottomLeft ).setUpdateMatrix( true );

				} else if ( background.isColor !== true ) {

					console.error( 'WebGPUNodes: Unsupported background configuration.', background );

				}

				sceneData.backgroundNode = backgroundNode;
				sceneData.background = background;

			}

		} else if ( sceneData.backgroundNode ) {

			delete sceneData.backgroundNode;
			delete sceneData.background;

		}

	}

	updateFog( scene ) {

		const sceneData = this.get( scene );
		const fog = scene.fog;

		if ( fog ) {

			if ( sceneData.fog !== fog ) {

				let fogNode = null;

				if ( fog.isFogExp2 ) {

					fogNode = densityFog( reference( 'color', 'color', fog ), reference( 'density', 'float', fog ) );

				} else if ( fog.isFog ) {

					fogNode = rangeFog( reference( 'color', 'color', fog ), reference( 'near', 'float', fog ), reference( 'far', 'float', fog ) );

				} else {

					console.error( 'WebGPUNodes: Unsupported fog configuration.', fog );

				}

				sceneData.fogNode = fogNode;
				sceneData.fog = fog;

			}

		} else {

			delete sceneData.fogNode;
			delete sceneData.fog;

		}

	}

	updateEnvironment( scene ) {

		const sceneData = this.get( scene );
		const environment = scene.environment;

		if ( environment ) {

			if ( sceneData.environment !== environment ) {

				let environmentNode = null;

				if ( environment.isCubeTexture === true ) {

					environmentNode = cubeTexture( environment );

				} else if ( environment.isTexture === true ) {

					environmentNode = texture( environment );

				} else {

					console.error( 'Nodes: Unsupported environment configuration.', environment );

				}

				sceneData.environmentNode = environmentNode;
				sceneData.environment = environment;

			}

		} else if ( sceneData.environmentNode ) {

			delete sceneData.environmentNode;
			delete sceneData.environment;

		}

	}

	getNodeFrame( renderer = this.renderer, scene = null, object = null, camera = null, material = null ) {

		const nodeFrame = this.nodeFrame;
		nodeFrame.renderer = renderer;
		nodeFrame.scene = scene;
		nodeFrame.object = object;
		nodeFrame.camera = camera;
		nodeFrame.material = material;

		return nodeFrame;

	}

	getNodeFrameForRender( renderObject ) {

		return this.getNodeFrame( renderObject.renderer, renderObject.scene, renderObject.object, renderObject.camera, renderObject.material );

	}

	getOutputNode( outputTexture ) {

		let output = texture( outputTexture, viewportTopLeft );

		if ( this.isToneMappingState ) {

			if ( this.renderer.toneMappingNode ) {

				output = vec4( this.renderer.toneMappingNode.context( { color: output.rgb } ), output.a );

			} else if ( this.renderer.toneMapping !== NoToneMapping ) {

				output = output.toneMapping( this.renderer.toneMapping );

			}

		}

		if ( this.renderer.currentColorSpace === SRGBColorSpace ) {

			output = output.linearToColorSpace( this.renderer.currentColorSpace );

		}

		return output;

	}

	updateBefore( renderObject ) {

		const nodeFrame = this.getNodeFrameForRender( renderObject );
		const nodeBuilder = renderObject.getNodeBuilderState();

		for ( const node of nodeBuilder.updateBeforeNodes ) {

			nodeFrame.updateBeforeNode( node );

		}

	}

	updateForCompute( computeNode ) {

		const nodeFrame = this.getNodeFrame();
		const nodeBuilder = this.getForCompute( computeNode );

		for ( const node of nodeBuilder.updateNodes ) {

			nodeFrame.updateNode( node );

		}

	}

	updateForRender( renderObject ) {

		const nodeFrame = this.getNodeFrameForRender( renderObject );
		const nodeBuilder = renderObject.getNodeBuilderState();

		for ( const node of nodeBuilder.updateNodes ) {

			nodeFrame.updateNode( node );

		}

	}

	dispose() {

		super.dispose();

		this.nodeFrame = new NodeFrame();
		this.nodeBuilderCache = new Map();

	}

}

export default Nodes;
