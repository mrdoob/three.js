import { OrthographicCamera, Scene, Mesh, PlaneGeometry } from 'three';
import { vec4, MeshBasicNodeMaterial } from '../../nodes/Nodes.js';

/** Correct UVs to be compatible with `flipY=false` textures. */
function flipY( geometry ) {

	const uv = geometry.attributes.uv;

	for ( let i = 0; i < uv.count; i ++ ) {

		uv.setY( i, 1 - uv.getY( i ) );

	}

	return geometry;

}

const cameraRT = new OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
const sceneRT = new Scene();
const materialRT = new MeshBasicNodeMaterial();
sceneRT.add( new Mesh( flipY( new PlaneGeometry( 2, 2 ) ), materialRT ) );

class PostProcessing {

	constructor( renderer ) {

		this.renderer = renderer;

		this._material = new MeshBasicNodeMaterial();

		this.outputNode = vec4( 0, 0, 1, 1 );

	}

	render() {

		materialRT.fragmentNode = this.outputNode;

		this.renderer.render( sceneRT, cameraRT );

	}

}

export default PostProcessing;
