import { LightsNode } from '../../nodes/Nodes.js';
import ChainMap from './ChainMap.js';

const _defaultLights = /*@__PURE__*/ new LightsNode();

class Lighting extends ChainMap {

	constructor() {

		super();

	}

	createNode( lights = [] ) {

		return new LightsNode().setLights( lights );

	}

	getNode( scene, camera ) {

		// ignore post-processing

		if ( scene.isQuadMesh ) return _defaultLights;

		// tiled lighting

		const keys = [ scene, camera ];

		let node = this.get( keys );

		if ( node === undefined ) {

			node = this.createNode();
			this.set( keys, node );

		}

		return node;

	}

}

export default Lighting;
