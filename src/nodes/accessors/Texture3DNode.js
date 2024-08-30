import { registerNode } from '../core/Node.js';
import TextureNode from './TextureNode.js';
import { nodeProxy, vec3, Fn, If } from '../tsl/TSLBase.js';

const normal = Fn( ( { texture, uv } ) => {

	const epsilon = 0.0001;

	const ret = vec3().temp();

	If( uv.x.lessThan( epsilon ), () => {

		ret.assign( vec3( 1, 0, 0 ) );

	} ).ElseIf( uv.y.lessThan( epsilon ), () => {

		ret.assign( vec3( 0, 1, 0 ) );

	} ).ElseIf( uv.z.lessThan( epsilon ), () => {

		ret.assign( vec3( 0, 0, 1 ) );

	} ).ElseIf( uv.x.greaterThan( 1 - epsilon ), () => {

		ret.assign( vec3( - 1, 0, 0 ) );

	} ).ElseIf( uv.y.greaterThan( 1 - epsilon ), () => {

		ret.assign( vec3( 0, - 1, 0 ) );

	} ).ElseIf( uv.z.greaterThan( 1 - epsilon ), () => {

		ret.assign( vec3( 0, 0, - 1 ) );

	} ).Else( () => {

		const step = 0.01;

		const x = texture.uv( uv.add( vec3( - step, 0.0, 0.0 ) ) ).r.sub( texture.uv( uv.add( vec3( step, 0.0, 0.0 ) ) ).r );
		const y = texture.uv( uv.add( vec3( 0.0, - step, 0.0 ) ) ).r.sub( texture.uv( uv.add( vec3( 0.0, step, 0.0 ) ) ).r );
		const z = texture.uv( uv.add( vec3( 0.0, 0.0, - step ) ) ).r.sub( texture.uv( uv.add( vec3( 0.0, 0.0, step ) ) ).r );

		ret.assign( vec3( x, y, z ) );

	} );

	return ret.normalize();

} );


class Texture3DNode extends TextureNode {

	constructor( value, uvNode = null, levelNode = null ) {

		super( value, uvNode, levelNode );

		this.isTexture3DNode = true;

	}

	getInputType( /*builder*/ ) {

		return 'texture3D';

	}

	getDefaultUV() {

		return vec3( 0.5, 0.5, 0.5 );

	}

	setUpdateMatrix( /*updateMatrix*/ ) { } // Ignore .updateMatrix for 3d TextureNode

	setupUV( builder, uvNode ) {

		return uvNode;

	}

	generateUV( builder, uvNode ) {

		return uvNode.build( builder, 'vec3' );

	}

	normal( uvNode ) {

		return normal( { texture: this, uv: uvNode } );

	}

}

export default Texture3DNode;

Texture3DNode.type = /*@__PURE__*/ registerNode( 'Texture3D', Texture3DNode );

export const texture3D = /*@__PURE__*/ nodeProxy( Texture3DNode );
