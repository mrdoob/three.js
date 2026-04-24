import {
	DoubleSide,
	CanvasTexture,
	Mesh,
	MeshBasicMaterial,
	NodeMaterial,
	OrthographicCamera,
	PlaneGeometry,
	Scene,
	DepthTexture,
	Vector2
} from 'three/webgpu';
import { uv, uniform, textureLoad } from 'three/tsl';

/**
 * This is a helper for visualising a given light's shadow map.
 * It works for shadow casting lights: DirectionalLight and SpotLight.
 * It renders out the shadow map and displays it on a HUD.
 *
 * This module can only be used with {@link WebGPURenderer}. When using {@link WebGLRenderer},
 * import the class from `ShadowMapViewer.js`.
 *
 * ```js
 * const lightShadowMapViewer = new ShadowMapViewer( light );
 * lightShadowMapViewer.position.x = 10;
 * lightShadowMapViewer.position.y = SCREEN_HEIGHT - ( SHADOW_MAP_HEIGHT / 4 ) - 10;
 * lightShadowMapViewer.size.width = SHADOW_MAP_WIDTH / 4;
 * lightShadowMapViewer.size.height = SHADOW_MAP_HEIGHT / 4;
 * lightShadowMapViewer.update();
 * ```
 *
 * @three_import import { ShadowMapViewer } from 'three/addons/utils/ShadowMapViewerGPU.js';
 */
class ShadowMapViewer {

	/**
	 * Constructs a new shadow map viewer.
	 *
	 * @param {Light} light - The shadow casting light.
	 */
	constructor( light ) {

		//- Internals
		const scope = this;
		const doRenderLabel = ( light.name !== undefined && light.name !== '' );
		let currentAutoClear;

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

		const material = new NodeMaterial();

		const textureDimension = uniform( new Vector2() );

		const shadowMapUniform = textureLoad( new DepthTexture(), uv().flipY().mul( textureDimension ) );
		material.fragmentNode = shadowMapUniform.x.oneMinus();

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

			const labelTexture = new CanvasTexture( labelCanvas );

			const labelMaterial = new MeshBasicMaterial( { map: labelTexture, side: DoubleSide, transparent: true } );

			const labelPlane = new PlaneGeometry( labelCanvas.width, labelCanvas.height );
			labelMesh = new Mesh( labelPlane, labelMaterial );

			scene.add( labelMesh );

		}

		function resetPosition() {

			scope.position.set( scope.position.x, scope.position.y );

		}

		/**
		 * Whether to display the shadow map viewer or not.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.enabled = true;

		/**
		 * The size of the viewer. When changing this property, make sure
		 * to call {@link ShadowMapViewer#update}.
		 *
		 * @type {{width:number,height:number}}
		 * @default true
		 */
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

		/**
		 * The position of the viewer. When changing this property, make sure
		 * to call {@link ShadowMapViewer#update}.
		 *
		 * @type {{width:number,height:number}}
		 * @default true
		 */
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

		/**
		 * Renders the viewer. This method must be called in the app's animation loop.
		 *
		 * @param {WebGPURenderer} renderer - The renderer.
		 */
		this.render = function ( renderer ) {

			if ( this.enabled ) {

				//Because a light's .shadowMap is only initialised after the first render pass
				//we have to make sure the correct map is sent into the shader, otherwise we
				//always end up with the scene's first added shadow casting light's shadowMap
				//in the shader
				//See: https://github.com/mrdoob/three.js/issues/5932

				const depthTexture = light.shadow.map.depthTexture;

				shadowMapUniform.value = depthTexture;
				textureDimension.value.set( depthTexture.width, depthTexture.height );

				currentAutoClear = renderer.autoClear;
				renderer.autoClear = false; // To allow render overlay
				renderer.clearDepth();
				renderer.render( scene, camera );
				renderer.autoClear = currentAutoClear;

			}

		};

		/**
		 * Resizes the viewer. This method should be called whenever the app's
		 * window is resized.
		 */
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

		/**
		 * Updates the viewer.
		 */
		this.update = function () {

			this.position.set( this.position.x, this.position.y );
			this.size.set( this.size.width, this.size.height );

		};

		//Force an update to set position/size
		this.update();

	}

}


export { ShadowMapViewer };
