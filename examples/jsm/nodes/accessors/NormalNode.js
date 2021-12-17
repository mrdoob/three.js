import { TempNode } from '../core/TempNode.js';
import { NodeLib } from '../core/NodeLib.js';

class NormalNode extends TempNode {

	constructor( scope ) {

		super( 'v3' );

		this.scope = scope || NormalNode.VIEW;

	}

	getShared() {

		// if shared is false, TempNode will not create temp variable (for optimization)

		return this.scope === NormalNode.WORLD;

	}

	build( builder, output, uuid, ns ) {

		const contextNormal = builder.context[ this.scope + 'Normal' ];

		if ( contextNormal ) {

			return contextNormal.build( builder, output, uuid, ns );

		}

		return super.build( builder, output, uuid );

	}

	generate( builder, output ) {

		let result;

		switch ( this.scope ) {

			case NormalNode.VIEW:

				if ( builder.isShader( 'vertex' ) ) result = 'transformedNormal';
				else result = 'geometryNormal';

				break;

			case NormalNode.LOCAL:

				if ( builder.isShader( 'vertex' ) ) {

					result = 'objectNormal';

				} else {

					builder.requires.normal = true;

					result = 'vObjectNormal';

				}

				break;

			case NormalNode.WORLD:

				if ( builder.isShader( 'vertex' ) ) {

					result = 'inverseTransformDirection( transformedNormal, viewMatrix ).xyz';

				} else {

					builder.requires.worldNormal = true;

					result = 'vWNormal';

				}

				break;

		}

		return builder.format( result, this.getType( builder ), output );

	}

	copy( source ) {

		super.copy( source );

		this.scope = source.scope;

		return this;

	}

	toJSON( meta ) {

		let data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.scope = this.scope;

		}

		return data;

	}

}

NormalNode.LOCAL = 'local';
NormalNode.WORLD = 'world';
NormalNode.VIEW = 'view';

NormalNode.prototype.nodeType = 'Normal';

NodeLib.addKeyword( 'viewNormal', function () {

	return new NormalNode( NormalNode.VIEW );

} );

NodeLib.addKeyword( 'localNormal', function () {

	return new NormalNode( NormalNode.NORMAL );

} );

NodeLib.addKeyword( 'worldNormal', function () {

	return new NormalNode( NormalNode.WORLD );

} );

export { NormalNode };
