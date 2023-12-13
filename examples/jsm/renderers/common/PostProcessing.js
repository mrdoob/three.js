import { OrthographicCamera, Scene, Mesh, PlaneGeometry } from 'three';
import { vec4, MeshBasicNodeMaterial } from '../../nodes/Nodes.js';

const cameraRT = new OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
const sceneRT = new Scene();
const materialRT = new MeshBasicNodeMaterial();
sceneRT.add( new Mesh( new PlaneGeometry( 2, 2 ), materialRT ) );

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
