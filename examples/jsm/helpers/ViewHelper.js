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

const _color1 = /*@__PURE__*/ new Color( '#ff4466' );
const _color2 = /*@__PURE__*/ new Color( '#88ff44' );
const _color3 = /*@__PURE__*/ new Color( '#4488ff' );
const _color4 = /*@__PURE__*/ new Color( '#000000' );

const _dim = 128;
const _turnRate = 2 * Math.PI; // turn rate in angles per second

const _mouse = /*@__PURE__*/ new Vector2();
const _viewport = /*@__PURE__*/ new Vector4();
const _raycaster = /*@__PURE__*/ new Raycaster();
const _dummy = /*@__PURE__*/ new Object3D();

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
		 * The camera whose transformation is visualized. It can be reassigned at
		 * any time to rebind the helper to a different camera.
		 *
		 * @type {Camera}
		 */
		this.camera = camera;

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

		this._domElement = domElement;

		this._options = {};

		this._orthoCamera = new OrthographicCamera( - 2, 2, 2, - 2, 0, 4 );
		this._orthoCamera.position.set( 0, 0, 2 );

		const geometry = new CylinderGeometry( 0.04, 0.04, 0.8, 5 ).rotateZ( - Math.PI / 2 ).translate( 0.4, 0, 0 );

		const xAxis = new Mesh( geometry, getAxisMaterial( _color1 ) );
		const yAxis = new Mesh( geometry, getAxisMaterial( _color2 ) );
		const zAxis = new Mesh( geometry, getAxisMaterial( _color3 ) );

		yAxis.rotation.z = Math.PI / 2;
		zAxis.rotation.y = - Math.PI / 2;

		this.add( xAxis );
		this.add( zAxis );
		this.add( yAxis );

		const spriteMaterial1 = getSpriteMaterial( _color1, undefined, this._options );
		const spriteMaterial2 = getSpriteMaterial( _color2, undefined, this._options );
		const spriteMaterial3 = getSpriteMaterial( _color3, undefined, this._options );
		const spriteMaterial4 = getSpriteMaterial( _color4, undefined, this._options );

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

		this._geometry = geometry;
		this._xAxis = xAxis;
		this._yAxis = yAxis;
		this._zAxis = zAxis;
		this._posXAxisHelper = posXAxisHelper;
		this._posYAxisHelper = posYAxisHelper;
		this._posZAxisHelper = posZAxisHelper;
		this._negXAxisHelper = negXAxisHelper;
		this._negYAxisHelper = negYAxisHelper;
		this._negZAxisHelper = negZAxisHelper;

		this._interactiveObjects = [ posXAxisHelper, posYAxisHelper, posZAxisHelper, negXAxisHelper, negYAxisHelper, negZAxisHelper ];

		this._targetPosition = new Vector3();
		this._targetQuaternion = new Quaternion();
		this._q1 = new Quaternion();
		this._q2 = new Quaternion();
		this._radius = 0;

	}

	/**
	 * Renders the helper in a separate view in the viewport.
	 * Position is controlled by the `location` property.
	 *
	 * @param {WebGLRenderer|WebGPURenderer} renderer - The renderer.
	 */
	render( renderer ) {

		const domElement = this._domElement;

		this.quaternion.copy( this.camera.quaternion ).invert();
		this.updateMatrixWorld();

		const location = this.location;

		let x, y;

		if ( location.left !== null ) {

			x = location.left;

		} else {

			x = domElement.offsetWidth - _dim - location.right;

		}

		if ( location.top !== null ) {

			// Position from top
			y = renderer.isWebGPURenderer ? location.top : domElement.offsetHeight - _dim - location.top;

		} else {

			// Position from bottom
			y = renderer.isWebGPURenderer ? domElement.offsetHeight - _dim - location.bottom : location.bottom;

		}

		renderer.clearDepth();

		renderer.getViewport( _viewport );
		renderer.setViewport( x, y, _dim, _dim );

		renderer.render( this, this._orthoCamera );

		renderer.setViewport( _viewport.x, _viewport.y, _viewport.z, _viewport.w );

	}

	/**
	 * This method should be called when a click or pointer event
	 * has happened in the app.
	 *
	 * @param {PointerEvent} event - The event to process.
	 * @return {boolean} Whether an intersection with the helper has been detected or not.
	 */
	handleClick( event ) {

		if ( this.animating === true ) return false;

		const domElement = this._domElement;

		const rect = domElement.getBoundingClientRect();
		const location = this.location;

		let offsetX, offsetY;

		if ( location.left !== null ) {

			offsetX = rect.left + location.left;

		} else {

			offsetX = rect.left + domElement.offsetWidth - _dim - location.right;

		}

		if ( location.top !== null ) {

			offsetY = rect.top + location.top;

		} else {

			offsetY = rect.top + domElement.offsetHeight - _dim - location.bottom;

		}

		_mouse.x = ( ( event.clientX - offsetX ) / _dim ) * 2 - 1;
		_mouse.y = - ( ( event.clientY - offsetY ) / _dim ) * 2 + 1;

		_raycaster.setFromCamera( _mouse, this._orthoCamera );

		const intersects = _raycaster.intersectObjects( this._interactiveObjects );

		if ( intersects.length > 0 ) {

			const intersection = intersects[ 0 ];
			const object = intersection.object;

			this._prepareAnimationData( object, this.center );

			this.animating = true;

			return true;

		} else {

			return false;

		}

	}

	/**
	 * Sets labels for each axis. By default, they are unlabeled.
	 *
	 * @param {string|undefined} labelX - The label for the x-axis.
	 * @param {string|undefined} labelY - The label for the y-axis.
	 * @param {string|undefined} labelZ - The label for the z-axis.
	 */
	setLabels( labelX, labelY, labelZ ) {

		this._options.labelX = labelX;
		this._options.labelY = labelY;
		this._options.labelZ = labelZ;

		this._updateLabels();

	}

	/**
	 * Sets the label style. Has no effect when the axes are unlabeled.
	 *
	 * @param {string} [font='24px Arial'] - The label font.
	 * @param {string} [color='#000000'] - The label color.
	 * @param {number} [radius=14] - The label radius.
	 */
	setLabelStyle( font, color, radius ) {

		this._options.font = font;
		this._options.color = color;
		this._options.radius = radius;

		this._updateLabels();

	}

	/**
	 * Updates the helper. This method should be called in the app's animation
	 * loop.
	 *
	 * @param {number} delta - The delta time in seconds.
	 */
	update( delta ) {

		const step = delta * _turnRate;

		// animate position by doing a slerp and then scaling the position on the unit sphere

		this._q1.rotateTowards( this._q2, step );
		this.camera.position.set( 0, 0, 1 ).applyQuaternion( this._q1 ).multiplyScalar( this._radius ).add( this.center );

		// animate orientation

		this.camera.quaternion.rotateTowards( this._targetQuaternion, step );

		if ( this._q1.angleTo( this._q2 ) === 0 ) {

			this.animating = false;

		}

	}

	/**
	 * Frees the GPU-related resources allocated by this instance. Call this
	 * method whenever this instance is no longer used in your app.
	 */
	dispose() {

		super.dispose();

		this._geometry.dispose();

		this._xAxis.material.dispose();
		this._yAxis.material.dispose();
		this._zAxis.material.dispose();

		this._posXAxisHelper.material.map.dispose();
		this._posYAxisHelper.material.map.dispose();
		this._posZAxisHelper.material.map.dispose();
		this._negXAxisHelper.material.map.dispose();
		this._negYAxisHelper.material.map.dispose();
		this._negZAxisHelper.material.map.dispose();

		this._posXAxisHelper.material.dispose();
		this._posYAxisHelper.material.dispose();
		this._posZAxisHelper.material.dispose();
		this._negXAxisHelper.material.dispose();
		this._negYAxisHelper.material.dispose();
		this._negZAxisHelper.material.dispose();

	}

	_prepareAnimationData( object, focusPoint ) {

		const targetPosition = this._targetPosition;
		const targetQuaternion = this._targetQuaternion;

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

		this._radius = this.camera.position.distanceTo( focusPoint );
		targetPosition.multiplyScalar( this._radius ).add( focusPoint );

		_dummy.position.copy( focusPoint );

		_dummy.lookAt( this.camera.position );
		this._q1.copy( _dummy.quaternion );

		_dummy.lookAt( targetPosition );
		this._q2.copy( _dummy.quaternion );

	}

	_updateLabels() {

		const options = this._options;

		const posXAxisHelper = this._posXAxisHelper;
		const posYAxisHelper = this._posYAxisHelper;
		const posZAxisHelper = this._posZAxisHelper;

		posXAxisHelper.material.map.dispose();
		posYAxisHelper.material.map.dispose();
		posZAxisHelper.material.map.dispose();

		posXAxisHelper.material.dispose();
		posYAxisHelper.material.dispose();
		posZAxisHelper.material.dispose();

		posXAxisHelper.material = getSpriteMaterial( _color1, options.labelX, options );
		posYAxisHelper.material = getSpriteMaterial( _color2, options.labelY, options );
		posZAxisHelper.material = getSpriteMaterial( _color3, options.labelZ, options );

	}

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

function getSpriteMaterial( color, text, options ) {

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

export { ViewHelper };
