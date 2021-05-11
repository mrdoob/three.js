import { TempNode } from '../core/TempNode.js';

class LightNode extends TempNode {

	constructor( scope ) {

		super( 'v3', { shared: false } );

		this.scope = scope || LightNode.TOTAL;

	}

	generate( builder, output ) {

		if ( builder.isCache( 'light' ) ) {

			return builder.format( 'reflectedLight.directDiffuse', this.type, output );

		} else {

			console.warn( 'THREE.LightNode is only compatible in "light" channel.' );

			return builder.format( 'vec3( 0.0 )', this.type, output );

		}

	}

	copy( source ) {

		super.copy( source );

		this.scope = source.scope;

		return this;

	}

	toJSON( meta ) {

		var data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.scope = this.scope;

		}

		return data;

	}

}

LightNode.TOTAL = 'total';
LightNode.prototype.nodeType = 'Light';

export { LightNode };
