import WebGPUNodeBuilder from './WebGPUNodeBuilder.js';
import { NoToneMapping, EquirectangularReflectionMapping, EquirectangularRefractionMapping } from 'three';
import { NodeFrame, vec2, cubeTexture, texture, rangeFog, densityFog, reference, toneMapping, positionWorld, modelWorldMatrix, transformDirection, equirectUV, oneMinus, viewportBottomLeft } from 'three/nodes';

class WebGPUNodes {

	constructor( renderer, properties ) {

		this.renderer = renderer;
		this.properties = properties;

		this.nodeFrame = new NodeFrame();

	}

	get( renderObject ) {

		const renderObjectProperties = this.properties.get( renderObject );

		let nodeBuilder = renderObjectProperties.nodeBuilder;

		if ( nodeBuilder === undefined ) {

			nodeBuilder = new WebGPUNodeBuilder( renderObject.object, this.renderer );
			nodeBuilder.material = renderObject.material;
			nodeBuilder.lightsNode = renderObject.lightsNode;
			nodeBuilder.environmentNode = this.getEnvironmentNode( renderObject.scene );
			nodeBuilder.fogNode = this.getFogNode( renderObject.scene );
			nodeBuilder.toneMappingNode = this.getToneMappingNode();
			nodeBuilder.build();

			renderObjectProperties.nodeBuilder = nodeBuilder;

		}

		return nodeBuilder;

	}

	getForCompute( computeNode ) {

		const computeProperties = this.properties.get( computeNode );

		let nodeBuilder = computeProperties.nodeBuilder;

		if ( nodeBuilder === undefined ) {

			nodeBuilder = new WebGPUNodeBuilder( computeNode, this.renderer );
			nodeBuilder.build();

			computeProperties.nodeBuilder = nodeBuilder;

		}

		return nodeBuilder;

	}

	remove( renderObject ) {

		const objectProperties = this.properties.get( renderObject );

		delete objectProperties.nodeBuilder;

	}

	updateFrame() {

		this.nodeFrame.update();

	}

	getEnvironmentNode( scene ) {

		return scene.environmentNode || this.properties.get( scene ).environmentNode || null;

	}

	getFogNode( scene ) {

		return scene.fogNode || this.properties.get( scene ).fogNode || null;

	}

	getToneMappingNode() {

		return this.renderer.toneMappingNode || this.properties.get( this.renderer ).toneMappingNode || null;

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

	updateToneMapping() {

		const renderer = this.renderer;
		const rendererProperties = this.properties.get( renderer );
		const rendererToneMapping = renderer.toneMapping;

		if ( rendererToneMapping !== NoToneMapping ) {

			if ( rendererProperties.toneMappingCacheKey !== rendererToneMapping ) {

				rendererProperties.toneMappingNode = toneMapping( renderer.toneMapping, reference( 'toneMappingExposure', 'float', renderer ) );
				rendererProperties.toneMappingCacheKey = rendererToneMapping;

			}

		} else {

			delete rendererProperties.toneMappingNode;
			delete rendererProperties.toneMappingCacheKey;

		}

	}

	updateBackground( scene ) {

		const sceneProperties = this.properties.get( scene );
		const background = scene.background;

		if ( background ) {

			if ( sceneProperties.backgroundCacheKey !== background.uuid ) {

				let backgroundNode = null;

				if ( background.isCubeTexture === true ) {

					backgroundNode = cubeTexture( background, transformDirection( positionWorld, modelWorldMatrix ) );

				} else if ( background.isTexture === true ) {

					let nodeUV = null;

					if ( background.mapping === EquirectangularReflectionMapping || background.mapping === EquirectangularRefractionMapping ) {

						const dirNode = transformDirection( positionWorld, modelWorldMatrix );

						nodeUV = equirectUV( dirNode );
						nodeUV = vec2( nodeUV.x, oneMinus( nodeUV.y ) );

					} else {

						nodeUV = viewportBottomLeft;

					}

					backgroundNode = texture( background, nodeUV );

				}

				sceneProperties.backgroundNode = backgroundNode;
				sceneProperties.backgroundCacheKey = background.uuid;

			}

		} else if ( sceneProperties.backgroundNode ) {

			delete sceneProperties.backgroundNode;
			delete sceneProperties.backgroundCacheKey;

		}

	}

	updateFog( scene ) {

		const sceneProperties = this.properties.get( scene );
		const fog = scene.fog;

		if ( fog ) {

			if ( sceneProperties.fogCacheKey !== fog.uuid ) {

				let fogNode = null;

				if ( fog.isFogExp2 ) {

					fogNode = densityFog( reference( 'color', 'color', fog ), reference( 'density', 'float', fog ) );

				} else if ( fog.isFog ) {

					fogNode = rangeFog( reference( 'color', 'color', fog ), reference( 'near', 'float', fog ), reference( 'far', 'float', fog ) );

				} else {

					console.error( 'WebGPUNodes: Unsupported fog configuration.', fog );

				}

				sceneProperties.fogNode = fogNode;
				sceneProperties.fogCacheKey = fog.uuid;

			}

		} else {

			delete sceneProperties.fogNode;
			delete sceneProperties.fogCacheKey;

		}

	}

	updateEnvironment( scene ) {

		const sceneProperties = this.properties.get( scene );
		const environment = scene.environment;

		if ( environment ) {

			if ( sceneProperties.environmentCacheKey !== environment.uuid ) {

				let environmentNode = null;

				if ( environment.isCubeTexture === true ) {

					environmentNode = cubeTexture( environment );

				} else if ( environment.isTexture === true ) {

					environmentNode = texture( environment );

				} else {

					console.error( 'WebGPUNodes: Unsupported environment configuration.', environment );

				}

				sceneProperties.environmentNode = environmentNode;
				sceneProperties.environmentCacheKey = environment.uuid;

			}

		} else if ( sceneProperties.environmentNode ) {

			delete sceneProperties.environmentNode;
			delete sceneProperties.environmentCacheKey;

		}

	}

	update( renderObject ) {

		const nodeBuilder = this.get( renderObject );
		const nodeFrame = this.nodeFrame;

		nodeFrame.object = renderObject.object;
		nodeFrame.camera = renderObject.camera;
		nodeFrame.renderer = renderObject.renderer;
		nodeFrame.material = renderObject.material;

		for ( const node of nodeBuilder.updateNodes ) {

			nodeFrame.updateNode( node );

		}

	}

	dispose() {

		this.nodeFrame = new NodeFrame();

	}

}

export default WebGPUNodes;
