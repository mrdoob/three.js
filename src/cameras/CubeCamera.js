import { WebGLCoordinateSystem, WebGPUCoordinateSystem } from '../constants.js';
import { Object3D } from '../core/Object3D.js';
import { PerspectiveCamera } from './PerspectiveCamera.js';

const fov = - 90; // negative fov is not an error
const aspect = 1;

/**
 * A special type of camera that is positioned in 3D space to render its surroundings into a
 * cube render target. The render target can then be used as an environment map for rendering
 * realtime reflections in your scene.
 *
 * ```js
 * // Create cube render target
 * const cubeRenderTarget = new THREE.WebGLCubeRenderTarget( 256, { generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter } );
 *
 * // Create cube camera
 * const cubeCamera = new THREE.CubeCamera( 1, 100000, cubeRenderTarget );
 * scene.add( cubeCamera );
 *
 * // Create car
 * const chromeMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff, envMap: cubeRenderTarget.texture } );
 * const car = new THREE.Mesh( carGeometry, chromeMaterial );
 * scene.add( car );
 *
 * // Update the render target cube
 * car.visible = false;
 * cubeCamera.position.copy( car.position );
 * cubeCamera.update( renderer, scene );
 *
 * // Render the scene
 * car.visible = true;
 * renderer.render( scene, camera );
 * ```
 *
 * @augments Object3D
 */
class CubeCamera extends Object3D {

	/**
	 * Constructs a new cube camera.
	 *
	 * @param {number} near - The camera's near plane.
	 * @param {number} far - The camera's far plane.
	 * @param {WebGLCubeRenderTarget} renderTarget - The cube render target.
	 */
	constructor( near, far, renderTarget ) {

		super();

		this.type = 'CubeCamera';

		/**
		 * A reference to the cube render target.
		 *
		 * @type {WebGLCubeRenderTarget}
		 */
		this.renderTarget = renderTarget;

		/**
		 * The current active coordinate system.
		 *
		 * @type {?(WebGLCoordinateSystem|WebGPUCoordinateSystem)}
		 * @default null
		 */
		this.coordinateSystem = null;

		/**
		 * The current active mipmap level
		 *
		 * @type {number}
		 * @default 0
		 */
		this.activeMipmapLevel = 0;

		const cameraPX = new PerspectiveCamera( fov, aspect, near, far );
		cameraPX.layers = this.layers;
		this.add( cameraPX );

		const cameraNX = new PerspectiveCamera( fov, aspect, near, far );
		cameraNX.layers = this.layers;
		this.add( cameraNX );

		const cameraPY = new PerspectiveCamera( fov, aspect, near, far );
		cameraPY.layers = this.layers;
		this.add( cameraPY );

		const cameraNY = new PerspectiveCamera( fov, aspect, near, far );
		cameraNY.layers = this.layers;
		this.add( cameraNY );

		const cameraPZ = new PerspectiveCamera( fov, aspect, near, far );
		cameraPZ.layers = this.layers;
		this.add( cameraPZ );

		const cameraNZ = new PerspectiveCamera( fov, aspect, near, far );
		cameraNZ.layers = this.layers;
		this.add( cameraNZ );

	}

	/**
	 * Must be called when the coordinate system of the cube camera is changed.
	 */
	updateCoordinateSystem() {

		const coordinateSystem = this.coordinateSystem;

		const cameras = this.children.concat();

		const [ cameraPX, cameraNX, cameraPY, cameraNY, cameraPZ, cameraNZ ] = cameras;

		for ( const camera of cameras ) this.remove( camera );

		if ( coordinateSystem === WebGLCoordinateSystem ) {

			cameraPX.up.set( 0, 1, 0 );
			cameraPX.lookAt( 1, 0, 0 );

			cameraNX.up.set( 0, 1, 0 );
			cameraNX.lookAt( - 1, 0, 0 );

			cameraPY.up.set( 0, 0, - 1 );
			cameraPY.lookAt( 0, 1, 0 );

			cameraNY.up.set( 0, 0, 1 );
			cameraNY.lookAt( 0, - 1, 0 );

			cameraPZ.up.set( 0, 1, 0 );
			cameraPZ.lookAt( 0, 0, 1 );

			cameraNZ.up.set( 0, 1, 0 );
			cameraNZ.lookAt( 0, 0, - 1 );

		} else if ( coordinateSystem === WebGPUCoordinateSystem ) {

			cameraPX.up.set( 0, - 1, 0 );
			cameraPX.lookAt( - 1, 0, 0 );

			cameraNX.up.set( 0, - 1, 0 );
			cameraNX.lookAt( 1, 0, 0 );

			cameraPY.up.set( 0, 0, 1 );
			cameraPY.lookAt( 0, 1, 0 );

			cameraNY.up.set( 0, 0, - 1 );
			cameraNY.lookAt( 0, - 1, 0 );

			cameraPZ.up.set( 0, - 1, 0 );
			cameraPZ.lookAt( 0, 0, 1 );

			cameraNZ.up.set( 0, - 1, 0 );
			cameraNZ.lookAt( 0, 0, - 1 );

		} else {

			throw new Error( 'THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: ' + coordinateSystem );

		}

		for ( const camera of cameras ) {

			this.add( camera );

			camera.updateMatrixWorld();

		}

	}

	/**
	 * Calling this method will render the given scene with the given renderer
	 * into the cube render target of the camera.
	 *
	 * @param {(Renderer|WebGLRenderer)} renderer - The renderer.
	 * @param {Scene} scene - The scene to render.
	 */
	update( renderer, scene ) {

		if ( this.parent === null ) this.updateMatrixWorld();

		const { renderTarget, activeMipmapLevel } = this;

		if ( this.coordinateSystem !== renderer.coordinateSystem ) {

			this.coordinateSystem = renderer.coordinateSystem;

			this.updateCoordinateSystem();

		}

		const [ cameraPX, cameraNX, cameraPY, cameraNY, cameraPZ, cameraNZ ] = this.children;

		const currentRenderTarget = renderer.getRenderTarget();
		const currentActiveCubeFace = renderer.getActiveCubeFace();
		const currentActiveMipmapLevel = renderer.getActiveMipmapLevel();

		const currentXrEnabled = renderer.xr.enabled;

		renderer.xr.enabled = false;

		const generateMipmaps = renderTarget.texture.generateMipmaps;

		renderTarget.texture.generateMipmaps = false;

		// https://github.com/mrdoob/three.js/issues/31413#issuecomment-3095966812

		let reversedDepthBuffer = false;

		if ( renderer.isWebGLRenderer === true ) {

			reversedDepthBuffer = renderer.state.buffers.depth.getReversed();

		} else {

			reversedDepthBuffer = renderer.reversedDepthBuffer;

		}

		renderer.setRenderTarget( renderTarget, 0, activeMipmapLevel );
		if ( reversedDepthBuffer && renderer.autoClear === false ) renderer.clearDepth();
		renderer.render( scene, cameraPX );

		renderer.setRenderTarget( renderTarget, 1, activeMipmapLevel );
		if ( reversedDepthBuffer && renderer.autoClear === false ) renderer.clearDepth();
		renderer.render( scene, cameraNX );

		renderer.setRenderTarget( renderTarget, 2, activeMipmapLevel );
		if ( reversedDepthBuffer && renderer.autoClear === false ) renderer.clearDepth();
		renderer.render( scene, cameraPY );

		renderer.setRenderTarget( renderTarget, 3, activeMipmapLevel );
		if ( reversedDepthBuffer && renderer.autoClear === false ) renderer.clearDepth();
		renderer.render( scene, cameraNY );

		renderer.setRenderTarget( renderTarget, 4, activeMipmapLevel );
		if ( reversedDepthBuffer && renderer.autoClear === false ) renderer.clearDepth();
		renderer.render( scene, cameraPZ );

		// mipmaps are generated during the last call of render()
		// at this point, all sides of the cube render target are defined

		renderTarget.texture.generateMipmaps = generateMipmaps;

		renderer.setRenderTarget( renderTarget, 5, activeMipmapLevel );
		if ( reversedDepthBuffer && renderer.autoClear === false ) renderer.clearDepth();
		renderer.render( scene, cameraNZ );

		renderer.setRenderTarget( currentRenderTarget, currentActiveCubeFace, currentActiveMipmapLevel );

		renderer.xr.enabled = currentXrEnabled;

		renderTarget.texture.needsPMREMUpdate = true;

	}

}

export { CubeCamera };
