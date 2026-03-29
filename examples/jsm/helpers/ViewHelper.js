import {
	CylinderGeometry,
	CanvasTexture,
	Color,
	Euler,
	Mesh,
	MeshBasicMaterial,
	Object3D,
	OrthographicCamera,
	Quaternion,
	Raycaster,
	Sprite,
	SpriteMaterial,
	SRGBColorSpace,
	Vector2,
	Vector3,
	Vector4
} from 'three';

/**
 * A special type of helper that visualizes the camera's transformation
 * in a small viewport area as an axes helper. Such a helper is often wanted
 * in 3D modeling tools or scene editors like the [three.js editor](https://threejs.org/editor).
 *
 * The helper allows to click on the X, Y and Z axes which animates the camera
 * so it looks along the selected axis.
 *
 * @augments Object3D
 * @three_import import { ViewHelper } from 'three/addons/helpers/ViewHelper.js';
 */
class ViewHelper extends Object3D {

	/**
	 * Constructs a new view helper.
	 *
	 * @param {Camera} camera - The camera whose transformation should be visualized.
	 * @param {HTMLElement} [domElement] - The DOM element that is used to render the view.
	 */
	constructor( camera, domElement ) {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isViewHelper = true;

		/**
		 * Whether the helper is currently animating or not.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default false
		 */
		this.animating = false;

		/**
		 * The helper's center point.
		 *
		 * @type {Vector3}
		 */
		this.center = new Vector3();

		/**
		 * Controls the position of the helper in the viewport.
		 * Use `top`/`bottom` for vertical positioning and `left`/`right` for horizontal.
		 * If `left` is `null`, `right` is used. If `top` is `null`, `bottom` is used.
		 *
		 * @type {{top: number|null, right: number, bottom: number, left: number|null}}
		 */
		this.location = {
			top: null,
			right: 0,
			bottom: 0,
			left: null
		};

		const color1 = new Color( '#ff4466' );
		const color2 = new Color( '#88ff44' );
		const color3 = new Color( '#4488ff' );
		const color4 = new Color( '#000000' );

		const options = {};

		const interactiveObjects = [];
		const raycaster = new Raycaster();
		const mouse = new Vector2();
		const dummy = new Object3D();

		const orthoCamera = new OrthographicCamera( - 2, 2, 2, - 2, 0, 4 );
		orthoCamera.position.set( 0, 0, 2 );

		const geometry = new CylinderGeometry( 0.04, 0.04, 0.8, 5 ).rotateZ( - Math.PI / 2 ).translate( 0.4, 0, 0 );

		const xAxis = new Mesh( geometry, getAxisMaterial( color1 ) );
		const yAxis = new Mesh( geometry, getAxisMaterial( color2 ) );
		const zAxis = new Mesh( geometry, getAxisMaterial( color3 ) );

		yAxis.rotation.z = Math.PI / 2;
		zAxis.rotation.y = - Math.PI / 2;

		this.add( xAxis );
		this.add( zAxis );
		this.add( yAxis );

		const spriteMaterial1 = getSpriteMaterial( color1 );
		const spriteMaterial2 = getSpriteMaterial( color2 );
		const spriteMaterial3 = getSpriteMaterial( color3 );
		const spriteMaterial4 = getSpriteMaterial( color4 );

		const posXAxisHelper = new Sprite( spriteMaterial1 );
		const posYAxisHelper = new Sprite( spriteMaterial2 );
		const posZAxisHelper = new Sprite( spriteMaterial3 );
		const negXAxisHelper = new Sprite( spriteMaterial4 );
		const negYAxisHelper = new Sprite( spriteMaterial4 );
		const negZAxisHelper = new Sprite( spriteMaterial4 );

		posXAxisHelper.position.x = 1;
		posYAxisHelper.position.y = 1;
		posZAxisHelper.position.z = 1;
		negXAxisHelper.position.x = - 1;
		negYAxisHelper.position.y = - 1;
		negZAxisHelper.position.z = - 1;

		negXAxisHelper.material.opacity = 0.2;
		negYAxisHelper.material.opacity = 0.2;
		negZAxisHelper.material.opacity = 0.2;

		posXAxisHelper.userData.type = 'posX';
		posYAxisHelper.userData.type = 'posY';
		posZAxisHelper.userData.type = 'posZ';
		negXAxisHelper.userData.type = 'negX';
		negYAxisHelper.userData.type = 'negY';
		negZAxisHelper.userData.type = 'negZ';

		this.add( posXAxisHelper );
		this.add( posYAxisHelper );
		this.add( posZAxisHelper );
		this.add( negXAxisHelper );
		this.add( negYAxisHelper );
		this.add( negZAxisHelper );

		interactiveObjects.push( posXAxisHelper );
		interactiveObjects.push( posYAxisHelper );
		interactiveObjects.push( posZAxisHelper );
		interactiveObjects.push( negXAxisHelper );
		interactiveObjects.push( negYAxisHelper );
		interactiveObjects.push( negZAxisHelper );

		const point = new Vector3();
		const dim = 128;
		const turnRate = 2 * Math.PI; // turn rate in angles per second

		/**
		 * Renders the helper in a separate view in the viewport.
		 * Position is controlled by the `location` property.
		 *
		 * @param {WebGLRenderer|WebGPURenderer} renderer - The renderer.
		 */
		this.render = function ( renderer ) {

			this.quaternion.copy( camera.quaternion ).invert();
			this.updateMatrixWorld();

			point.set( 0, 0, 1 );
			point.applyQuaternion( camera.quaternion );

			//

			const location = this.location;

			let x, y;

			if ( location.left !== null ) {

				x = location.left;

			} else {

				x = domElement.offsetWidth - dim - location.right;

			}

			if ( location.top !== null ) {

				// Position from top
				y = renderer.isWebGPURenderer ? location.top : domElement.offsetHeight - dim - location.top;

			} else {

				// Position from bottom
				y = renderer.isWebGPURenderer ? domElement.offsetHeight - dim - location.bottom : location.bottom;

			}

			renderer.clearDepth();

			renderer.getViewport( viewport );
			renderer.setViewport( x, y, dim, dim );

			renderer.render( this, orthoCamera );

			renderer.setViewport( viewport.x, viewport.y, viewport.z, viewport.w );

		};

		const targetPosition = new Vector3();
		const targetQuaternion = new Quaternion();

		const q1 = new Quaternion();
		const q2 = new Quaternion();
		const viewport = new Vector4();
		let radius = 0;

		/**
		 * This method should be called when a click or pointer event
		 * has happened in the app.
		 *
		 * @param {PointerEvent} event - The event to process.
		 * @return {boolean} Whether an intersection with the helper has been detected or not.
		 */
		this.handleClick = function ( event ) {

			if ( this.animating === true ) return false;

			const rect = domElement.getBoundingClientRect();
			const location = this.location;

			let offsetX, offsetY;

			if ( location.left !== null ) {

				offsetX = rect.left + location.left;

			} else {

				offsetX = rect.left + domElement.offsetWidth - dim - location.right;

			}

			if ( location.top !== null ) {

				offsetY = rect.top + location.top;

			} else {

				offsetY = rect.top + domElement.offsetHeight - dim - location.bottom;

			}

			mouse.x = ( ( event.clientX - offsetX ) / dim ) * 2 - 1;
			mouse.y = - ( ( event.clientY - offsetY ) / dim ) * 2 + 1;

			raycaster.setFromCamera( mouse, orthoCamera );

			const intersects = raycaster.intersectObjects( interactiveObjects );

			if ( intersects.length > 0 ) {

				const intersection = intersects[ 0 ];
				const object = intersection.object;

				prepareAnimationData( object, this.center );

				this.animating = true;

				return true;

			} else {

				return false;

			}

		};

		/**
		 * Sets labels for each axis. By default, they are unlabeled.
		 *
		 * @param {string|undefined} labelX - The label for the x-axis.
		 * @param {string|undefined} labelY - The label for the y-axis.
		 * @param {string|undefined} labelZ - The label for the z-axis.
		 */
		this.setLabels = function ( labelX, labelY, labelZ ) {

			options.labelX = labelX;
			options.labelY = labelY;
			options.labelZ = labelZ;

			updateLabels();

		};

		/**
		 * Sets the label style. Has no effect when the axes are unlabeled.
		 *
		 * @param {string} [font='24px Arial'] - The label font.
		 * @param {string} [color='#000000'] - The label color.
		 * @param {number} [radius=14] - The label radius.
		 */
		this.setLabelStyle = function ( font, color, radius ) {

			options.font = font;
			options.color = color;
			options.radius = radius;

			updateLabels();

		};

		/**
		 * Updates the helper. This method should be called in the app's animation
		 * loop.
		 *
		 * @param {number} delta - The delta time in seconds.
		 */
		this.update = function ( delta ) {

			const step = delta * turnRate;

			// animate position by doing a slerp and then scaling the position on the unit sphere

			q1.rotateTowards( q2, step );
			camera.position.set( 0, 0, 1 ).applyQuaternion( q1 ).multiplyScalar( radius ).add( this.center );

			// animate orientation

			camera.quaternion.rotateTowards( targetQuaternion, step );

			if ( q1.angleTo( q2 ) === 0 ) {

				this.animating = false;

			}

		};

		/**
		 * Frees the GPU-related resources allocated by this instance. Call this
		 * method whenever this instance is no longer used in your app.
		 */
		this.dispose = function () {

			geometry.dispose();

			xAxis.material.dispose();
			yAxis.material.dispose();
			zAxis.material.dispose();

			posXAxisHelper.material.map.dispose();
			posYAxisHelper.material.map.dispose();
			posZAxisHelper.material.map.dispose();
			negXAxisHelper.material.map.dispose();
			negYAxisHelper.material.map.dispose();
			negZAxisHelper.material.map.dispose();

			posXAxisHelper.material.dispose();
			posYAxisHelper.material.dispose();
			posZAxisHelper.material.dispose();
			negXAxisHelper.material.dispose();
			negYAxisHelper.material.dispose();
			negZAxisHelper.material.dispose();

		};

		function prepareAnimationData( object, focusPoint ) {

			switch ( object.userData.type ) {

				case 'posX':
					targetPosition.set( 1, 0, 0 );
					targetQuaternion.setFromEuler( new Euler( 0, Math.PI * 0.5, 0 ) );
					break;

				case 'posY':
					targetPosition.set( 0, 1, 0 );
					targetQuaternion.setFromEuler( new Euler( - Math.PI * 0.5, 0, 0 ) );
					break;

				case 'posZ':
					targetPosition.set( 0, 0, 1 );
					targetQuaternion.setFromEuler( new Euler() );
					break;

				case 'negX':
					targetPosition.set( - 1, 0, 0 );
					targetQuaternion.setFromEuler( new Euler( 0, - Math.PI * 0.5, 0 ) );
					break;

				case 'negY':
					targetPosition.set( 0, - 1, 0 );
					targetQuaternion.setFromEuler( new Euler( Math.PI * 0.5, 0, 0 ) );
					break;

				case 'negZ':
					targetPosition.set( 0, 0, - 1 );
					targetQuaternion.setFromEuler( new Euler( 0, Math.PI, 0 ) );
					break;

				default:
					console.error( 'ViewHelper: Invalid axis.' );

			}

			//

			radius = camera.position.distanceTo( focusPoint );
			targetPosition.multiplyScalar( radius ).add( focusPoint );

			dummy.position.copy( focusPoint );

			dummy.lookAt( camera.position );
			q1.copy( dummy.quaternion );

			dummy.lookAt( targetPosition );
			q2.copy( dummy.quaternion );

		}

		function getAxisMaterial( color ) {

			return new MeshBasicMaterial( { color: color, toneMapped: false } );

		}

		function useOffscreenCanvas() {

			let result = false;

			try {

				// this check has been adapted from WebGLTextures

				result = typeof OffscreenCanvas !== 'undefined' && ( new OffscreenCanvas( 1, 1 ).getContext( '2d' ) ) !== null;

			} catch ( err ) {

				// Ignore any errors

			}

			return result;

		}

		function createCanvas( width, height ) {

			let canvas;

			if ( useOffscreenCanvas() ) {

				canvas = new OffscreenCanvas( width, height );

			} else {

				canvas = document.createElement( 'canvas' );
				canvas.width = width;
				canvas.height = height;

			}

			return canvas;

		}

		function getSpriteMaterial( color, text ) {

			const { font = '24px Arial', color: labelColor = '#000000', radius = 14 } = options;

			const canvas = createCanvas( 64, 64 );

			const context = canvas.getContext( '2d' );
			context.beginPath();
			context.arc( 32, 32, radius, 0, 2 * Math.PI );
			context.closePath();
			context.fillStyle = color.getStyle();
			context.fill();

			if ( text ) {

				context.font = font;
				context.textAlign = 'center';
				context.fillStyle = labelColor;
				context.fillText( text, 32, 41 );

			}

			const texture = new CanvasTexture( canvas );
			texture.colorSpace = SRGBColorSpace;

			return new SpriteMaterial( { map: texture, toneMapped: false } );

		}

		function updateLabels() {

			posXAxisHelper.material.map.dispose();
			posYAxisHelper.material.map.dispose();
			posZAxisHelper.material.map.dispose();

			posXAxisHelper.material.dispose();
			posYAxisHelper.material.dispose();
			posZAxisHelper.material.dispose();

			posXAxisHelper.material = getSpriteMaterial( color1, options.labelX );
			posYAxisHelper.material = getSpriteMaterial( color2, options.labelY );
			posZAxisHelper.material = getSpriteMaterial( color3, options.labelZ );

		}

	}

}

export { ViewHelper };
