import DataMap from '../DataMap.js';
import ChainMap from '../ChainMap.js';
import { NoToneMapping, EquirectangularReflectionMapping, EquirectangularRefractionMapping } from 'three';
import { NodeFrame, cubeTexture, texture, rangeFog, densityFog, reference, toneMapping, equirectUV, viewportBottomLeft, normalWorld } from '../../../nodes/Nodes.js';

class Nodes extends DataMap {

	constructor( renderer, backend ) {

		super();

		this.renderer = renderer;
		this.backend = backend;
		this.nodeFrame = new NodeFrame();
		this.cache = new ChainMap();

	}

	getForRenderChainKey( renderObject ) {

		const { object, material, lightsNode, context } = renderObject;

		return [ object.geometry, material, lightsNode, context ];

	}

	getForRender( renderObject ) {

		const renderObjectData = this.get( renderObject );

		let nodeBuilder = renderObjectData.nodeBuilder;

		if ( nodeBuilder === undefined ) {

			const { cache } = this;

			const chainKey = this.getForRenderChainKey( renderObject );

			nodeBuilder = cache.get( chainKey );

			if ( nodeBuilder === undefined ) {

				nodeBuilder = this.backend.createNodeBuilder( renderObject.object, this.renderer, renderObject.scene );
				nodeBuilder.material = renderObject.material;
				nodeBuilder.lightsNode = renderObject.lightsNode;
				nodeBuilder.environmentNode = this.getEnvironmentNode( renderObject.scene );
				nodeBuilder.fogNode = this.getFogNode( renderObject.scene );
				nodeBuilder.toneMappingNode = this.getToneMappingNode();
				nodeBuilder.build();

				cache.set( chainKey, nodeBuilder );

			}

			renderObjectData.nodeBuilder = nodeBuilder;

		}

		return nodeBuilder;

	}

	delete( object ) {

		if ( object.isRenderObject ) {

			this.cache.delete( this.getForRenderChainKey( object ) );

		}

		return super.delete( object );

	}

	getForCompute( computeNode ) {

		const computeData = this.get( computeNode );

		let nodeBuilder = computeData.nodeBuilder;

		if ( nodeBuilder === undefined ) {

			nodeBuilder = this.backend.createNodeBuilder( computeNode, this.renderer );
			nodeBuilder.build();

			computeData.nodeBuilder = nodeBuilder;

		}

		return nodeBuilder;

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

	getToneMappingNode() {

		if ( this.isToneMappingState === false ) return null;

		return this.renderer.toneMappingNode || this.get( this.renderer ).toneMappingNode || null;

	}

	getCacheKey( scene, lightsNode ) {

		const environmentNode = this.getEnvironmentNode( scene );
		const fogNode = this.getFogNode( scene );
		const toneMappingNode = this.getToneMappingNode();

		const cacheKey = [];

		if ( lightsNode ) cacheKey.push( 'lightsNode:' + lightsNode.getCacheKey() );
		if ( environmentNode ) cacheKey.push( 'environmentNode:' + environmentNode.getCacheKey() );
		if ( fogNode ) cacheKey.push( 'fogNode:' + fogNode.getCacheKey() );
		if ( toneMappingNode ) cacheKey.push( 'toneMappingNode:' + toneMappingNode.getCacheKey() );

		return '{' + cacheKey.join( ',' ) + '}';

	}

	updateScene( scene ) {

		this.updateEnvironment( scene );
		this.updateFog( scene );
		this.updateBackground( scene );
		this.updateToneMapping();

	}

	get isToneMappingState() {

		const renderer = this.renderer;
		const renderTarget = renderer.getRenderTarget();

		return renderTarget && renderTarget.isCubeRenderTarget ? false : true;

	}

	updateToneMapping() {

		const renderer = this.renderer;
		const rendererData = this.get( renderer );
		const rendererToneMapping = renderer.toneMapping;

		if ( this.isToneMappingState && rendererToneMapping !== NoToneMapping ) {

			if ( rendererData.toneMapping !== rendererToneMapping ) {

				const rendererToneMappingNode = rendererData.rendererToneMappingNode || toneMapping( rendererToneMapping, reference( 'toneMappingExposure', 'float', renderer ) );
				rendererToneMappingNode.toneMapping = rendererToneMapping;

				rendererData.rendererToneMappingNode = rendererToneMappingNode;
				rendererData.toneMappingNode = rendererToneMappingNode;
				rendererData.toneMapping = rendererToneMapping;

			}

		} else {

			// Don't delete rendererData.rendererToneMappingNode
			delete rendererData.toneMappingNode;
			delete rendererData.toneMapping;

		}

	}

	updateBackground( scene ) {

		const sceneData = this.get( scene );
		const background = scene.background;

		if ( background ) {

			if ( sceneData.background !== background ) {

				let backgroundNode = null;

				if ( background.isCubeTexture === true ) {

					backgroundNode = cubeTexture( background, normalWorld );

				} else if ( background.isTexture === true ) {

					let nodeUV = null;

					if ( background.mapping === EquirectangularReflectionMapping || background.mapping === EquirectangularRefractionMapping ) {

						nodeUV = equirectUV();

					} else {

						nodeUV = viewportBottomLeft;

					}

					backgroundNode = texture( background, nodeUV ).setUpdateMatrix( true );

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

	getNodeFrame( renderObject ) {

		const nodeFrame = this.nodeFrame;
		nodeFrame.scene = renderObject.scene;
		nodeFrame.object = renderObject.object;
		nodeFrame.camera = renderObject.camera;
		nodeFrame.renderer = renderObject.renderer;
		nodeFrame.material = renderObject.material;

		return nodeFrame;

	}

	updateBefore( renderObject ) {

		const nodeFrame = this.getNodeFrame( renderObject );
		const nodeBuilder = renderObject.getNodeBuilder();

		for ( const node of nodeBuilder.updateBeforeNodes ) {

			nodeFrame.updateBeforeNode( node );

		}

	}

	updateForCompute( /*computeNode*/ ) { }

	updateForRender( renderObject ) {

		const nodeFrame = this.getNodeFrame( renderObject );
		const nodeBuilder = renderObject.getNodeBuilder();

		for ( const node of nodeBuilder.updateNodes ) {

			nodeFrame.updateNode( node );

		}

	}

	dispose() {

		super.dispose();

		this.nodeFrame = new NodeFrame();

	}

}

export default Nodes;
