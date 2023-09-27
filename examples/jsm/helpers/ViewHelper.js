import {
	BoxGeometry,
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
	Vector2,
	Vector3,
	Vector4
} from 'three';

class ViewHelper extends Object3D {

	constructor( camera, domElement ) {

		super();

		this.isViewHelper = true;

		this.animating = false;
		this.center = new Vector3();

		const color1 = new Color( '#ff3653' );
		const color2 = new Color( '#8adb00' );
		const color3 = new Color( '#2c8fff' );

		const interactiveObjects = [];
		const raycaster = new Raycaster();
		const mouse = new Vector2();
		const dummy = new Object3D();

		const orthoCamera = new OrthographicCamera( - 2, 2, 2, - 2, 0, 4 );
		orthoCamera.position.set( 0, 0, 2 );

		const geometry = new BoxGeometry( 0.8, 0.05, 0.05 ).translate( 0.4, 0, 0 );

		const xAxis = new Mesh( geometry, getAxisMaterial( color1 ) );
		const yAxis = new Mesh( geometry, getAxisMaterial( color2 ) );
		const zAxis = new Mesh( geometry, getAxisMaterial( color3 ) );

		yAxis.rotation.z = Math.PI / 2;
		zAxis.rotation.y = - Math.PI / 2;

		this.add( xAxis );
		this.add( zAxis );
		this.add( yAxis );

		const posXAxisHelper = new Sprite( getSpriteMaterial( color1, 'X' ) );
		posXAxisHelper.userData.type = 'posX';
		const posYAxisHelper = new Sprite( getSpriteMaterial( color2, 'Y' ) );
		posYAxisHelper.userData.type = 'posY';
		const posZAxisHelper = new Sprite( getSpriteMaterial( color3, 'Z' ) );
		posZAxisHelper.userData.type = 'posZ';
		const negXAxisHelper = new Sprite( getSpriteMaterial( color1 ) );
		negXAxisHelper.userData.type = 'negX';
		const negYAxisHelper = new Sprite( getSpriteMaterial( color2 ) );
		negYAxisHelper.userData.type = 'negY';
		const negZAxisHelper = new Sprite( getSpriteMaterial( color3 ) );
		negZAxisHelper.userData.type = 'negZ';

		posXAxisHelper.position.x = 1;
		posYAxisHelper.position.y = 1;
		posZAxisHelper.position.z = 1;
		negXAxisHelper.position.x = - 1;
		negXAxisHelper.scale.setScalar( 0.8 );
		negYAxisHelper.position.y = - 1;
		negYAxisHelper.scale.setScalar( 0.8 );
		negZAxisHelper.position.z = - 1;
		negZAxisHelper.scale.setScalar( 0.8 );

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

		this.render = function ( renderer ) {

			this.quaternion.copy( camera.quaternion ).invert();
			this.updateMatrixWorld();

			point.set( 0, 0, 1 );
			point.applyQuaternion( camera.quaternion );

			if ( point.x >= 0 ) {

				posXAxisHelper.material.opacity = 1;
				negXAxisHelper.material.opacity = 0.5;

			} else {

				posXAxisHelper.material.opacity = 0.5;
				negXAxisHelper.material.opacity = 1;

			}

			if ( point.y >= 0 ) {

				posYAxisHelper.material.opacity = 1;
				negYAxisHelper.material.opacity = 0.5;

			} else {

				posYAxisHelper.material.opacity = 0.5;
				negYAxisHelper.material.opacity = 1;

			}

			if ( point.z >= 0 ) {

				posZAxisHelper.material.opacity = 1;
				negZAxisHelper.material.opacity = 0.5;

			} else {

				posZAxisHelper.material.opacity = 0.5;
				negZAxisHelper.material.opacity = 1;

			}

			//

			const x = domElement.offsetWidth - dim;

			renderer.clearDepth();

			renderer.getViewport( viewport );
			renderer.setViewport( x, 0, dim, dim );

			renderer.render( this, orthoCamera );

			renderer.setViewport( viewport.x, viewport.y, viewport.z, viewport.w );

		};

		const targetPosition = new Vector3();
		const targetQuaternion = new Quaternion();

		const q1 = new Quaternion();
		const q2 = new Quaternion();
		const viewport = new Vector4();
		let radius = 0;

		this.handleClick = function ( event ) {

			if ( this.animating === true ) return false;

			const rect = domElement.getBoundingClientRect();
			const offsetX = rect.left + ( domElement.offsetWidth - dim );
			const offsetY = rect.top + ( domElement.offsetHeight - dim );
			mouse.x = ( ( event.clientX - offsetX ) / ( rect.right - offsetX ) ) * 2 - 1;
			mouse.y = - ( ( event.clientY - offsetY ) / ( rect.bottom - offsetY ) ) * 2 + 1;

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

		function getSpriteMaterial( color, text = null ) {

			const canvas = document.createElement( 'canvas' );
			canvas.width = 64;
			canvas.height = 64;

			const context = canvas.getContext( '2d' );
			context.beginPath();
			context.arc( 32, 32, 16, 0, 2 * Math.PI );
			context.closePath();
			context.fillStyle = color.getStyle();
			context.fill();

			if ( text !== null ) {

				context.font = '24px Arial';
				context.textAlign = 'center';
				context.fillStyle = '#000000';
				context.fillText( text, 32, 41 );

			}

			const texture = new CanvasTexture( canvas );

			return new SpriteMaterial( { map: texture, toneMapped: false } );

		}

	}

}

export { ViewHelper };
