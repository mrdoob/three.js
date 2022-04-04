import { WebGLNodeBuilder } from './WebGLNodeBuilder.js';
import NodeFrame from 'three-nodes/core/NodeFrame.js';

import LightsNode from 'three-nodes/lights/LightsNode.js';

import { Material } from 'three';

const builders = new WeakMap();
export const nodeFrame = new NodeFrame();

Material.prototype.onBuild = function ( object, parameters, renderer ) {

	builders.set( this, new WebGLNodeBuilder( object, renderer, parameters ) );

};

Material.prototype.onBeforeRender = function ( renderer, scene, camera, geometry, object ) {

	const nodeBuilder = builders.get( this );

	if ( nodeBuilder !== undefined ) {

		if ( nodeBuilder.lightNode === null ) {

			const lights = [];

			scene.traverseVisible( function ( object ) { // from WebGLRenderer

				if ( object.isLight && object.layers.test( camera.layers ) ) {

					lights.push( object );

				}

			} );

			nodeBuilder.lightNode = new LightsNode().fromLights( lights );

			if ( scene.fogNode ) nodeBuilder.fogNode = scene.fogNode;
									// @TODO: make something like new FogNode.fromFog( scene.fog or renderer.properties.get( material ).fog )

			nodeBuilder.build();

		}

		nodeFrame.material = this;
		nodeFrame.camera = camera;
		nodeFrame.object = object;
		nodeFrame.renderer = renderer;

		const updateNodes = nodeBuilder.updateNodes;

		if ( updateNodes.length > 0 ) {

			// force refresh material uniforms
			renderer.state.useProgram( null );

			//this.uniformsNeedUpdate = true;

			for ( const node of updateNodes ) {

				nodeFrame.updateNode( node );

			}
			
		}

	}

};
