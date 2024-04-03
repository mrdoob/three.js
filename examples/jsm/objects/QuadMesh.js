import { BufferGeometry, Float32BufferAttribute, Mesh, OrthographicCamera } from 'three';

// Helper for passes that need to fill the viewport with a single quad.

const _camera = new OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );

// https://github.com/mrdoob/three.js/pull/21358

class QuadGeometry extends BufferGeometry {

	constructor( flipY = false ) {

		super();

		const uv = flipY === false ? [ 0, - 1, 0, 1, 2, 1 ] : [ 0, 2, 0, 0, 2, 0 ];

		this.setAttribute( 'position', new Float32BufferAttribute( [ - 1, 3, 0, - 1, - 1, 0, 3, - 1, 0 ], 3 ) );
		this.setAttribute( 'uv', new Float32BufferAttribute( uv, 2 ) );

	}

}

const _geometry = new QuadGeometry();

class QuadMesh extends Mesh {

	constructor( material = null ) {

		super( _geometry, material );

		this.camera = _camera;

	}

	renderAsync( renderer ) {

		return renderer.renderAsync( this, _camera );

	}

	render( renderer ) {

		renderer.render( this, _camera );

	}

}

export default QuadMesh;
