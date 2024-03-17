import { WebGLNodeBuilder } from './WebGLNodeBuilder.js';
import { NodeFrame } from '../../../nodes/Nodes.js';

import { Material } from 'three';

const builders = new WeakMap();
export const nodeFrame = new NodeFrame();

Material.prototype.onBuild = function ( object, parameters, renderer ) {

	const material = this;

	if ( material.isNodeMaterial === true ) {

		builders.set( material, new WebGLNodeBuilder( object, renderer, parameters, material ).build() );

	}

};

Material.prototype.onBeforeRender = function ( renderer, scene, camera, geometry, object ) {

	const nodeBuilder = builders.get( this );

	if ( nodeBuilder !== undefined ) {

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
