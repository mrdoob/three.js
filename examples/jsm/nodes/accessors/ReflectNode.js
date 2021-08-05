import { TempNode } from '../core/TempNode.js';
import { PositionNode } from './PositionNode.js';
import { NormalNode } from './NormalNode.js';

class ReflectNode extends TempNode {

	constructor( scope ) {

		super( 'v3' );

		this.scope = scope || ReflectNode.CUBE;

	}

	getUnique( builder ) {

		return ! builder.context.viewNormal;

	}

	getType( /* builder */ ) {

		switch ( this.scope ) {

			case ReflectNode.SPHERE:

				return 'v2';

		}

		return this.type;

	}

	generate( builder, output ) {

		const isUnique = this.getUnique( builder );

		if ( builder.isShader( 'fragment' ) ) {

			let result, code, reflectVec;

			switch ( this.scope ) {

				case ReflectNode.VECTOR:

					const viewNormalNode = new NormalNode( NormalNode.VIEW );
					const roughnessNode = builder.context.roughness;

					const viewNormal = viewNormalNode.build( builder, 'v3' );
					const viewPosition = new PositionNode( PositionNode.VIEW ).build( builder, 'v3' );
					const roughness = roughnessNode ? roughnessNode.build( builder, 'f' ) : undefined;

					let method = `reflect( -normalize( ${viewPosition} ), ${viewNormal} )`;

					if ( roughness ) {

						// Mixing the reflection with the normal is more accurate and keeps rough objects from gathering light from behind their tangent plane.
						method = `normalize( mix( ${method}, ${viewNormal}, ${roughness} * ${roughness} ) )`;

					}

					code = `inverseTransformDirection( ${method}, viewMatrix )`;

					if ( isUnique ) {

						builder.addNodeCode( `vec3 reflectVec = ${code};` );

						result = 'reflectVec';

					} else {

						result = code;

					}

					break;

				case ReflectNode.CUBE:

					reflectVec = new ReflectNode( ReflectNode.VECTOR ).build( builder, 'v3' );

					code = 'vec3( -' + reflectVec + '.x, ' + reflectVec + '.yz )';

					if ( isUnique ) {

						builder.addNodeCode( `vec3 reflectCubeVec = ${code};` );

						result = 'reflectCubeVec';

					} else {

						result = code;

					}

					break;

				case ReflectNode.SPHERE:

					reflectVec = new ReflectNode( ReflectNode.VECTOR ).build( builder, 'v3' );

					code = 'normalize( ( viewMatrix * vec4( ' + reflectVec + ', 0.0 ) ).xyz + vec3( 0.0, 0.0, 1.0 ) ).xy * 0.5 + 0.5';

					if ( isUnique ) {

						builder.addNodeCode( `vec2 reflectSphereVec = ${code};` );

						result = 'reflectSphereVec';

					} else {

						result = code;

					}

					break;

			}

			return builder.format( result, this.getType( builder ), output );

		} else {

			console.warn( 'THREE.ReflectNode is not compatible with ' + builder.shader + ' shader.' );

			return builder.format( 'vec3( 0.0 )', this.type, output );

		}

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

ReflectNode.CUBE = 'cube';
ReflectNode.SPHERE = 'sphere';
ReflectNode.VECTOR = 'vector';

ReflectNode.prototype.nodeType = 'Reflect';

export { ReflectNode };
