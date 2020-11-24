import { Object3D } from '../core/Object3D.js';
import { Vector3 } from '../math/Vector3.js';
import { PerspectiveCamera } from './PerspectiveCamera.js';

const fov = 90, aspect = 1;

function CubeCamera( near, far, renderTarget ) {

	Object3D.call( this );

	this.type = 'CubeCamera';

	if ( renderTarget.isWebGLCubeRenderTarget !== true ) {

		console.error( 'THREE.CubeCamera: The constructor now expects an instance of WebGLCubeRenderTarget as third parameter.' );
		return;

	}

	this.renderTarget = renderTarget;

	const cameraPX = new PerspectiveCamera( fov, aspect, near, far );
	cameraPX.layers = this.layers;
	cameraPX.up.set( 0, - 1, 0 );
	cameraPX.lookAt( new Vector3( 1, 0, 0 ) );
	this.add( cameraPX );

	const cameraNX = new PerspectiveCamera( fov, aspect, near, far );
	cameraNX.layers = this.layers;
	cameraNX.up.set( 0, - 1, 0 );
	cameraNX.lookAt( new Vector3( - 1, 0, 0 ) );
	this.add( cameraNX );

	const cameraPY = new PerspectiveCamera( fov, aspect, near, far );
	cameraPY.layers = this.layers;
	cameraPY.up.set( 0, 0, 1 );
	cameraPY.lookAt( new Vector3( 0, 1, 0 ) );
	this.add( cameraPY );

	const cameraNY = new PerspectiveCamera( fov, aspect, near, far );
	cameraNY.layers = this.layers;
	cameraNY.up.set( 0, 0, - 1 );
	cameraNY.lookAt( new Vector3( 0, - 1, 0 ) );
	this.add( cameraNY );

	const cameraPZ = new PerspectiveCamera( fov, aspect, near, far );
	cameraPZ.layers = this.layers;
	cameraPZ.up.set( 0, - 1, 0 );
	cameraPZ.lookAt( new Vector3( 0, 0, 1 ) );
	this.add( cameraPZ );

	const cameraNZ = new PerspectiveCamera( fov, aspect, near, far );
	cameraNZ.layers = this.layers;
	cameraNZ.up.set( 0, - 1, 0 );
	cameraNZ.lookAt( new Vector3( 0, 0, - 1 ) );
	this.add( cameraNZ );

	this.update = function ( renderer, scene ) {

		if ( this.parent === null ) this.updateMatrixWorld();

		const currentXrEnabled = renderer.xr.enabled;
		const currentRenderTarget = renderer.getRenderTarget();

		renderer.xr.enabled = false;

		const generateMipmaps = renderTarget.texture.generateMipmaps;

		renderTarget.texture.generateMipmaps = false;

		renderer.setRenderTarget( renderTarget, 0 );
		renderer.render( scene, cameraPX );

		renderer.setRenderTarget( renderTarget, 1 );
		renderer.render( scene, cameraNX );

		renderer.setRenderTarget( renderTarget, 2 );
		renderer.render( scene, cameraPY );

		renderer.setRenderTarget( renderTarget, 3 );
		renderer.render( scene, cameraNY );

		renderer.setRenderTarget( renderTarget, 4 );
		renderer.render( scene, cameraPZ );

		renderTarget.texture.generateMipmaps = generateMipmaps;

		renderer.setRenderTarget( renderTarget, 5 );
		renderer.render( scene, cameraNZ );

		renderer.setRenderTarget( currentRenderTarget );

		renderer.xr.enabled = currentXrEnabled;

	};

}

CubeCamera.prototype = Object.create( Object3D.prototype );
CubeCamera.prototype.constructor = CubeCamera;


export { CubeCamera };
