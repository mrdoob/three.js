import { BufferGeometry, Float32BufferAttribute, Matrix4, Mesh, MeshBasicMaterial, Object3D, Raycaster, SphereGeometry, Vector3 } from 'three';

const PINCH_MAX = 0.05;
const PINCH_THRESHOLD = 0.02;
const PINCH_MIN = 0.01;
const POINTER_ADVANCE_MAX = 0.02;
const POINTER_OPACITY_MAX = 1;
const POINTER_OPACITY_MIN = 0.4;
const POINTER_FRONT_RADIUS = 0.002;
const POINTER_REAR_RADIUS = 0.01;
const POINTER_REAR_RADIUS_MIN = 0.003;
const POINTER_LENGTH = 0.035;
const POINTER_SEGMENTS = 16;
const POINTER_RINGS = 12;
const POINTER_HEMISPHERE_ANGLE = 110;
const YAXIS = /* @__PURE__ */ new Vector3( 0, 1, 0 );
const ZAXIS = /* @__PURE__ */ new Vector3( 0, 0, 1 );

const CURSOR_RADIUS = 0.02;
const CURSOR_MAX_DISTANCE = 1.5;

class OculusHandPointerModel extends Object3D {

	constructor( hand, controller ) {

		super();

		this.hand = hand;
		this.controller = controller;

		// Unused
		this.motionController = null;
		this.envMap = null;
		this.mesh = null;

		this.pointerGeometry = null;
		this.pointerMesh = null;
		this.pointerObject = null;

		this.pinched = false;
		this.attached = false;

		this.cursorObject = null;

		this.raycaster = null;

		this._onConnected = this._onConnected.bind( this );
		this._onDisconnected = this._onDisconnected.bind( this );
		this.hand.addEventListener( 'connected', this._onConnected );
		this.hand.addEventListener( 'disconnected', this._onDisconnected );

	}

	_onConnected( event ) {

		const xrInputSource = event.data;
		if ( xrInputSource.hand ) {

			this.visible = true;
			this.xrInputSource = xrInputSource;

			this.createPointer();

		}

	}

	_onDisconnected() {

		this.visible = false;
		this.xrInputSource = null;

		if ( this.pointerGeometry ) this.pointerGeometry.dispose();
		if ( this.pointerMesh && this.pointerMesh.material ) this.pointerMesh.material.dispose();

		this.clear();

	}

	_drawVerticesRing( vertices, baseVector, ringIndex ) {

		const segmentVector = baseVector.clone();
		for ( let i = 0; i < POINTER_SEGMENTS; i ++ ) {

			segmentVector.applyAxisAngle( ZAXIS, ( Math.PI * 2 ) / POINTER_SEGMENTS );
			const vid = ringIndex * POINTER_SEGMENTS + i;
			vertices[ 3 * vid ] = segmentVector.x;
			vertices[ 3 * vid + 1 ] = segmentVector.y;
			vertices[ 3 * vid + 2 ] = segmentVector.z;

		}

	}

	_updatePointerVertices( rearRadius ) {

		const vertices = this.pointerGeometry.attributes.position.array;
		// first ring for front face
		const frontFaceBase = new Vector3(
			POINTER_FRONT_RADIUS,
			0,
			- 1 * ( POINTER_LENGTH - rearRadius )
		);
		this._drawVerticesRing( vertices, frontFaceBase, 0 );

		// rings for rear hemisphere
		const rearBase = new Vector3(
			Math.sin( ( Math.PI * POINTER_HEMISPHERE_ANGLE ) / 180 ) * rearRadius,
			Math.cos( ( Math.PI * POINTER_HEMISPHERE_ANGLE ) / 180 ) * rearRadius,
			0
		);
		for ( let i = 0; i < POINTER_RINGS; i ++ ) {

			this._drawVerticesRing( vertices, rearBase, i + 1 );
			rearBase.applyAxisAngle(
				YAXIS,
				( Math.PI * POINTER_HEMISPHERE_ANGLE ) / 180 / ( POINTER_RINGS * - 2 )
			);

		}

		// front and rear face center vertices
		const frontCenterIndex = POINTER_SEGMENTS * ( 1 + POINTER_RINGS );
		const rearCenterIndex = POINTER_SEGMENTS * ( 1 + POINTER_RINGS ) + 1;
		const frontCenter = new Vector3(
			0,
			0,
			- 1 * ( POINTER_LENGTH - rearRadius )
		);
		vertices[ frontCenterIndex * 3 ] = frontCenter.x;
		vertices[ frontCenterIndex * 3 + 1 ] = frontCenter.y;
		vertices[ frontCenterIndex * 3 + 2 ] = frontCenter.z;
		const rearCenter = new Vector3( 0, 0, rearRadius );
		vertices[ rearCenterIndex * 3 ] = rearCenter.x;
		vertices[ rearCenterIndex * 3 + 1 ] = rearCenter.y;
		vertices[ rearCenterIndex * 3 + 2 ] = rearCenter.z;

		this.pointerGeometry.setAttribute(
			'position',
			new Float32BufferAttribute( vertices, 3 )
		);
		// verticesNeedUpdate = true;

	}

	createPointer() {

		let i, j;
		const vertices = new Array(
			( ( POINTER_RINGS + 1 ) * POINTER_SEGMENTS + 2 ) * 3
		).fill( 0 );
		// const vertices = [];
		const indices = [];
		this.pointerGeometry = new BufferGeometry();

		this.pointerGeometry.setAttribute(
			'position',
			new Float32BufferAttribute( vertices, 3 )
		);

		this._updatePointerVertices( POINTER_REAR_RADIUS );

		// construct faces to connect rings
		for ( i = 0; i < POINTER_RINGS; i ++ ) {

			for ( j = 0; j < POINTER_SEGMENTS - 1; j ++ ) {

				indices.push(
					i * POINTER_SEGMENTS + j,
					i * POINTER_SEGMENTS + j + 1,
					( i + 1 ) * POINTER_SEGMENTS + j
				);
				indices.push(
					i * POINTER_SEGMENTS + j + 1,
					( i + 1 ) * POINTER_SEGMENTS + j + 1,
					( i + 1 ) * POINTER_SEGMENTS + j
				);

			}

			indices.push(
				( i + 1 ) * POINTER_SEGMENTS - 1,
				i * POINTER_SEGMENTS,
				( i + 2 ) * POINTER_SEGMENTS - 1
			);
			indices.push(
				i * POINTER_SEGMENTS,
				( i + 1 ) * POINTER_SEGMENTS,
				( i + 2 ) * POINTER_SEGMENTS - 1
			);

		}

		// construct front and rear face
		const frontCenterIndex = POINTER_SEGMENTS * ( 1 + POINTER_RINGS );
		const rearCenterIndex = POINTER_SEGMENTS * ( 1 + POINTER_RINGS ) + 1;

		for ( i = 0; i < POINTER_SEGMENTS - 1; i ++ ) {

			indices.push( frontCenterIndex, i + 1, i );
			indices.push(
				rearCenterIndex,
				i + POINTER_SEGMENTS * POINTER_RINGS,
				i + POINTER_SEGMENTS * POINTER_RINGS + 1
			);

		}

		indices.push( frontCenterIndex, 0, POINTER_SEGMENTS - 1 );
		indices.push(
			rearCenterIndex,
			POINTER_SEGMENTS * ( POINTER_RINGS + 1 ) - 1,
			POINTER_SEGMENTS * POINTER_RINGS
		);

		const material = new MeshBasicMaterial();
		material.transparent = true;
		material.opacity = POINTER_OPACITY_MIN;

		this.pointerGeometry.setIndex( indices );

		this.pointerMesh = new Mesh( this.pointerGeometry, material );

		this.pointerMesh.position.set( 0, 0, - 1 * POINTER_REAR_RADIUS );
		this.pointerObject = new Object3D();
		this.pointerObject.add( this.pointerMesh );

		this.raycaster = new Raycaster();

		// create cursor
		const cursorGeometry = new SphereGeometry( CURSOR_RADIUS, 10, 10 );
		const cursorMaterial = new MeshBasicMaterial();
		cursorMaterial.transparent = true;
		cursorMaterial.opacity = POINTER_OPACITY_MIN;

		this.cursorObject = new Mesh( cursorGeometry, cursorMaterial );
		this.pointerObject.add( this.cursorObject );

		this.add( this.pointerObject );

	}

	_updateRaycaster() {

		if ( this.raycaster ) {

			const pointerMatrix = this.pointerObject.matrixWorld;
			const tempMatrix = new Matrix4();
			tempMatrix.identity().extractRotation( pointerMatrix );
			this.raycaster.ray.origin.setFromMatrixPosition( pointerMatrix );
			this.raycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( tempMatrix );

		}

	}

	_updatePointer() {

		this.pointerObject.visible = this.controller.visible;
		const indexTip = this.hand.joints[ 'index-finger-tip' ];
		const thumbTip = this.hand.joints[ 'thumb-tip' ];
		const distance = indexTip.position.distanceTo( thumbTip.position );
		const position = indexTip.position
			.clone()
			.add( thumbTip.position )
			.multiplyScalar( 0.5 );
		this.pointerObject.position.copy( position );
		this.pointerObject.quaternion.copy( this.controller.quaternion );

		this.pinched = distance <= PINCH_THRESHOLD;

		const pinchScale = ( distance - PINCH_MIN ) / ( PINCH_MAX - PINCH_MIN );
		const focusScale = ( distance - PINCH_MIN ) / ( PINCH_THRESHOLD - PINCH_MIN );
		if ( pinchScale > 1 ) {

			this._updatePointerVertices( POINTER_REAR_RADIUS );
			this.pointerMesh.position.set( 0, 0, - 1 * POINTER_REAR_RADIUS );
			this.pointerMesh.material.opacity = POINTER_OPACITY_MIN;

		} else if ( pinchScale > 0 ) {

			const rearRadius =
        ( POINTER_REAR_RADIUS - POINTER_REAR_RADIUS_MIN ) * pinchScale +
        POINTER_REAR_RADIUS_MIN;
			this._updatePointerVertices( rearRadius );
			if ( focusScale < 1 ) {

				this.pointerMesh.position.set(
					0,
					0,
					- 1 * rearRadius - ( 1 - focusScale ) * POINTER_ADVANCE_MAX
				);
				this.pointerMesh.material.opacity =
          POINTER_OPACITY_MIN +
          ( 1 - focusScale ) * ( POINTER_OPACITY_MAX - POINTER_OPACITY_MIN );

			} else {

				this.pointerMesh.position.set( 0, 0, - 1 * rearRadius );
				this.pointerMesh.material.opacity = POINTER_OPACITY_MIN;

			}

		} else {

			this._updatePointerVertices( POINTER_REAR_RADIUS_MIN );
			this.pointerMesh.position.set(
				0,
				0,
				- 1 * POINTER_REAR_RADIUS_MIN - POINTER_ADVANCE_MAX
			);
			this.pointerMesh.material.opacity = POINTER_OPACITY_MAX;

		}

		this.cursorObject.material.opacity = this.pointerMesh.material.opacity;

	}

	updateMatrixWorld( force ) {

		super.updateMatrixWorld( force );
		if ( this.pointerGeometry ) {

			this._updatePointer();
			this._updateRaycaster();

		}

	}

	isPinched() {

		return this.pinched;

	}

	setAttached( attached ) {

		this.attached = attached;

	}

	isAttached() {

		return this.attached;

	}

	intersectObject( object, recursive = true ) {

		if ( this.raycaster ) {

			return this.raycaster.intersectObject( object, recursive );

		}

	}

	intersectObjects( objects, recursive = true ) {

		if ( this.raycaster ) {

			return this.raycaster.intersectObjects( objects, recursive );

		}

	}

	checkIntersections( objects, recursive = false ) {

		if ( this.raycaster && ! this.attached ) {

			const intersections = this.raycaster.intersectObjects( objects, recursive );
			const direction = new Vector3( 0, 0, - 1 );
			if ( intersections.length > 0 ) {

				const intersection = intersections[ 0 ];
				const distance = intersection.distance;
				this.cursorObject.position.copy( direction.multiplyScalar( distance ) );

			} else {

				this.cursorObject.position.copy( direction.multiplyScalar( CURSOR_MAX_DISTANCE ) );

			}

		}

	}

	setCursor( distance ) {

		const direction = new Vector3( 0, 0, - 1 );
		if ( this.raycaster && ! this.attached ) {

			this.cursorObject.position.copy( direction.multiplyScalar( distance ) );

		}

	}

	dispose() {

		this._onDisconnected();
		this.hand.removeEventListener( 'connected', this._onConnected );
		this.hand.removeEventListener( 'disconnected', this._onDisconnected );

	}

}

export { OculusHandPointerModel };
