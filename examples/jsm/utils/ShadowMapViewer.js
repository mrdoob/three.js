import {
	DoubleSide,
	LinearFilter,
	Mesh,
	MeshBasicMaterial,
	OrthographicCamera,
	PlaneGeometry,
	Scene,
	ShaderMaterial,
	Texture,
	UniformsUtils
} from '../../../build/three.module.js';
import { UnpackDepthRGBAShader } from '../shaders/UnpackDepthRGBAShader.js';

/**
 * This is a helper for visualising a given light's shadow map.
 * It works for shadow casting lights: DirectionalLight and SpotLight.
 * It renders out the shadow map and displays it on a HUD.
 *
 * Example usage:
 *	1) Import ShadowMapViewer into your app.
 *
 *	2) Create a shadow casting light and name it optionally:
 *		let light = new DirectionalLight( 0xffffff, 1 );
 *		light.castShadow = true;
 *		light.name = 'Sun';
 *
 *	3) Create a shadow map viewer for that light and set its size and position optionally:
 *		let shadowMapViewer = new ShadowMapViewer( light );
 *		shadowMapViewer.size.set( 128, 128 );	//width, height  default: 256, 256
 *		shadowMapViewer.position.set( 10, 10 );	//x, y in pixel	 default: 0, 0 (top left corner)
 *
 *	4) Render the shadow map viewer in your render loop:
 *		shadowMapViewer.render( renderer );
 *
 *	5) Optionally: Update the shadow map viewer on window resize:
 *		shadowMapViewer.updateForWindowResize();
 *
 *	6) If you set the position or size members directly, you need to call shadowMapViewer.update();
 */

class ShadowMapViewer {

	constructor( light ) {

		//- Internals
		const scope = this;
		const doRenderLabel = ( light.name !== undefined && light.name !== '' );
		let userAutoClearSetting;

		//Holds the initial position and dimension of the HUD
		const frame = {
			x: 10,
			y: 10,
			width: 256,
			height: 256
		};

		const camera = new OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 10 );
		camera.position.set( 0, 0, 2 );
		const scene = new Scene();

		//HUD for shadow map
		const shader = UnpackDepthRGBAShader;

		const uniforms = UniformsUtils.clone( shader.uniforms );
		const material = new ShaderMaterial( {
			uniforms: uniforms,
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader
		} );
		const plane = new PlaneGeometry( frame.width, frame.height );
		const mesh = new Mesh( plane, material );

		scene.add( mesh );


		//Label for light's name
		let labelCanvas, labelMesh;

		if ( doRenderLabel ) {

			labelCanvas = document.createElement( 'canvas' );

			const context = labelCanvas.getContext( '2d' );
			context.font = 'Bold 20px Arial';

			const labelWidth = context.measureText( light.name ).width;
			labelCanvas.width = labelWidth;
			labelCanvas.height = 25;	//25 to account for g, p, etc.

			context.font = 'Bold 20px Arial';
			context.fillStyle = 'rgba( 255, 0, 0, 1 )';
			context.fillText( light.name, 0, 20 );

			const labelTexture = new Texture( labelCanvas );
			labelTexture.magFilter = LinearFilter;
			labelTexture.minFilter = LinearFilter;
			labelTexture.needsUpdate = true;

			const labelMaterial = new MeshBasicMaterial( { map: labelTexture, side: DoubleSide } );
			labelMaterial.transparent = true;

			const labelPlane = new PlaneGeometry( labelCanvas.width, labelCanvas.height );
			labelMesh = new Mesh( labelPlane, labelMaterial );

			scene.add( labelMesh );

		}


		function resetPosition() {

			scope.position.set( scope.position.x, scope.position.y );

		}

		//- API
		// Set to false to disable displaying this shadow map
		this.enabled = true;

		// Set the size of the displayed shadow map on the HUD
		this.size = {
			width: frame.width,
			height: frame.height,
			set: function ( width, height ) {

				this.width = width;
				this.height = height;

				mesh.scale.set( this.width / frame.width, this.height / frame.height, 1 );

				//Reset the position as it is off when we scale stuff
				resetPosition();

			}
		};

		// Set the position of the displayed shadow map on the HUD
		this.position = {
			x: frame.x,
			y: frame.y,
			set: function ( x, y ) {

				this.x = x;
				this.y = y;

				const width = scope.size.width;
				const height = scope.size.height;

				mesh.position.set( - window.innerWidth / 2 + width / 2 + this.x, window.innerHeight / 2 - height / 2 - this.y, 0 );

				if ( doRenderLabel ) labelMesh.position.set( mesh.position.x, mesh.position.y - scope.size.height / 2 + labelCanvas.height / 2, 0 );

			}
		};

		this.render = function ( renderer ) {

			if ( this.enabled ) {

				//Because a light's .shadowMap is only initialised after the first render pass
				//we have to make sure the correct map is sent into the shader, otherwise we
				//always end up with the scene's first added shadow casting light's shadowMap
				//in the shader
				//See: https://github.com/mrdoob/three.js/issues/5932
				uniforms.tDiffuse.value = light.shadow.map.texture;

				userAutoClearSetting = renderer.autoClear;
				renderer.autoClear = false; // To allow render overlay
				renderer.clearDepth();
				renderer.render( scene, camera );
				renderer.autoClear = userAutoClearSetting;	//Restore user's setting

			}

		};

		this.updateForWindowResize = function () {

			if ( this.enabled ) {

				 camera.left = window.innerWidth / - 2;
				 camera.right = window.innerWidth / 2;
				 camera.top = window.innerHeight / 2;
				 camera.bottom = window.innerHeight / - 2;
				 camera.updateProjectionMatrix();

				 this.update();

			}

		};

		this.update = function () {

			this.position.set( this.position.x, this.position.y );
			this.size.set( this.size.width, this.size.height );

		};

		//Force an update to set position/size
		this.update();

	}

}


export { ShadowMapViewer };
