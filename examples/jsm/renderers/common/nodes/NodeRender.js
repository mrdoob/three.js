import WebGPUNodeBuilder from '../../webgpu/backends/webgpu/builder/WGSLNodeBuilder.js';
import { NoToneMapping, EquirectangularReflectionMapping, EquirectangularRefractionMapping } from 'three';
import { NodeFrame, cubeTexture, texture, rangeFog, densityFog, reference, toneMapping, positionWorld, modelWorldMatrix, transformDirection, equirectUV, viewportBottomLeft } from '../../../nodes/Nodes.js';

class NodeRender {

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

			if ( rendererProperties.toneMapping !== rendererToneMapping ) {

				rendererProperties.toneMappingNode = toneMapping( rendererToneMapping, reference( 'toneMappingExposure', 'float', renderer ) );
				rendererProperties.toneMapping = rendererToneMapping;

			}

		} else {

			delete rendererProperties.toneMappingNode;
			delete rendererProperties.toneMapping;

		}

	}

	updateBackground( scene ) {

		const sceneProperties = this.properties.get( scene );
		const background = scene.background;

		if ( background ) {

			if ( sceneProperties.background !== background ) {

				let backgroundNode = null;

				if ( background.isCubeTexture === true ) {

					backgroundNode = cubeTexture( background, transformDirection( positionWorld, modelWorldMatrix ) );

				} else if ( background.isTexture === true ) {

					let nodeUV = null;

					if ( background.mapping === EquirectangularReflectionMapping || background.mapping === EquirectangularRefractionMapping ) {

						nodeUV = equirectUV();

					} else {

						nodeUV = viewportBottomLeft;

					}

					backgroundNode = texture( background, nodeUV );

				} else if ( background.isColor !== true ) {

					console.error( 'WebGPUNodes: Unsupported background configuration.', background );

				}

				sceneProperties.backgroundNode = backgroundNode;
				sceneProperties.background = background;

			}

		} else if ( sceneProperties.backgroundNode ) {

			delete sceneProperties.backgroundNode;
			delete sceneProperties.background;

		}

	}

	updateFog( scene ) {

		const sceneProperties = this.properties.get( scene );
		const fog = scene.fog;

		if ( fog ) {

			if ( sceneProperties.fog !== fog ) {

				let fogNode = null;

				if ( fog.isFogExp2 ) {

					fogNode = densityFog( reference( 'color', 'color', fog ), reference( 'density', 'float', fog ) );

				} else if ( fog.isFog ) {

					fogNode = rangeFog( reference( 'color', 'color', fog ), reference( 'near', 'float', fog ), reference( 'far', 'float', fog ) );

				} else {

					console.error( 'WebGPUNodes: Unsupported fog configuration.', fog );

				}

				sceneProperties.fogNode = fogNode;
				sceneProperties.fog = fog;

			}

		} else {

			delete sceneProperties.fogNode;
			delete sceneProperties.fog;

		}

	}

	updateEnvironment( scene ) {

		const sceneProperties = this.properties.get( scene );
		const environment = scene.environment;

		if ( environment ) {

			if ( sceneProperties.environment !== environment ) {

				let environmentNode = null;

				if ( environment.isCubeTexture === true ) {

					environmentNode = cubeTexture( environment );

				} else if ( environment.isTexture === true ) {

					environmentNode = texture( environment );

				} else {

					console.error( 'WebGPUNodes: Unsupported environment configuration.', environment );

				}

				sceneProperties.environmentNode = environmentNode;
				sceneProperties.environment = environment;

			}

		} else if ( sceneProperties.environmentNode ) {

			delete sceneProperties.environmentNode;
			delete sceneProperties.environment;

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
		const nodeBuilder = this.get( renderObject );

		for ( const node of nodeBuilder.updateBeforeNodes ) {

			nodeFrame.updateBeforeNode( node );

		}

	}

	update( renderObject ) {

		const nodeFrame = this.getNodeFrame( renderObject );
		const nodeBuilder = this.get( renderObject );

		for ( const node of nodeBuilder.updateNodes ) {

			nodeFrame.updateNode( node );

		}

	}

	dispose() {

		this.nodeFrame = new NodeFrame();

	}

}

export default NodeRender;
