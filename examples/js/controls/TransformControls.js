( function () {

	const _raycaster = new THREE.Raycaster();

	const _tempVector = new THREE.Vector3();

	const _tempVector2 = new THREE.Vector3();

	const _tempQuaternion = new THREE.Quaternion();

	const _unit = {
		X: new THREE.Vector3( 1, 0, 0 ),
		Y: new THREE.Vector3( 0, 1, 0 ),
		Z: new THREE.Vector3( 0, 0, 1 )
	};
	const _changeEvent = {
		type: 'change'
	};
	const _mouseDownEvent = {
		type: 'mouseDown'
	};
	const _mouseUpEvent = {
		type: 'mouseUp',
		mode: null
	};
	const _objectChangeEvent = {
		type: 'objectChange'
	};

	class TransformControls extends THREE.Object3D {

		constructor( camera, domElement ) {

			super();

			if ( domElement === undefined ) {

				console.warn( 'THREE.TransformControls: The second parameter "domElement" is now mandatory.' );
				domElement = document;

			}

			this.isTransformControls = true;
			this.visible = false;
			this.domElement = domElement;
			this.domElement.style.touchAction = 'none'; // disable touch scroll

			const _gizmo = new TransformControlsGizmo();

			this._gizmo = _gizmo;
			this.add( _gizmo );

			const _plane = new TransformControlsPlane();

			this._plane = _plane;
			this.add( _plane );
			const scope = this; // Defined getter, setter and store for a property

			function defineProperty( propName, defaultValue ) {

				let propValue = defaultValue;
				Object.defineProperty( scope, propName, {
					get: function () {

						return propValue !== undefined ? propValue : defaultValue;

					},
					set: function ( value ) {

						if ( propValue !== value ) {

							propValue = value;
							_plane[ propName ] = value;
							_gizmo[ propName ] = value;
							scope.dispatchEvent( {
								type: propName + '-changed',
								value: value
							} );
							scope.dispatchEvent( _changeEvent );

						}

					}
				} );
				scope[ propName ] = defaultValue;
				_plane[ propName ] = defaultValue;
				_gizmo[ propName ] = defaultValue;

			} // Define properties with getters/setter
			// Setting the defined property will automatically trigger change event
			// Defined properties are passed down to gizmo and plane


			defineProperty( 'camera', camera );
			defineProperty( 'object', undefined );
			defineProperty( 'enabled', true );
			defineProperty( 'axis', null );
			defineProperty( 'mode', 'translate' );
			defineProperty( 'translationSnap', null );
			defineProperty( 'rotationSnap', null );
			defineProperty( 'scaleSnap', null );
			defineProperty( 'space', 'world' );
			defineProperty( 'size', 1 );
			defineProperty( 'dragging', false );
			defineProperty( 'showX', true );
			defineProperty( 'showY', true );
			defineProperty( 'showZ', true ); // Reusable utility variables

			const worldPosition = new THREE.Vector3();
			const worldPositionStart = new THREE.Vector3();
			const worldQuaternion = new THREE.Quaternion();
			const worldQuaternionStart = new THREE.Quaternion();
			const cameraPosition = new THREE.Vector3();
			const cameraQuaternion = new THREE.Quaternion();
			const pointStart = new THREE.Vector3();
			const pointEnd = new THREE.Vector3();
			const rotationAxis = new THREE.Vector3();
			const rotationAngle = 0;
			const eye = new THREE.Vector3(); // TODO: remove properties unused in plane and gizmo

			defineProperty( 'worldPosition', worldPosition );
			defineProperty( 'worldPositionStart', worldPositionStart );
			defineProperty( 'worldQuaternion', worldQuaternion );
			defineProperty( 'worldQuaternionStart', worldQuaternionStart );
			defineProperty( 'cameraPosition', cameraPosition );
			defineProperty( 'cameraQuaternion', cameraQuaternion );
			defineProperty( 'pointStart', pointStart );
			defineProperty( 'pointEnd', pointEnd );
			defineProperty( 'rotationAxis', rotationAxis );
			defineProperty( 'rotationAngle', rotationAngle );
			defineProperty( 'eye', eye );
			this._offset = new THREE.Vector3();
			this._startNorm = new THREE.Vector3();
			this._endNorm = new THREE.Vector3();
			this._cameraScale = new THREE.Vector3();
			this._parentPosition = new THREE.Vector3();
			this._parentQuaternion = new THREE.Quaternion();
			this._parentQuaternionInv = new THREE.Quaternion();
			this._parentScale = new THREE.Vector3();
			this._worldScaleStart = new THREE.Vector3();
			this._worldQuaternionInv = new THREE.Quaternion();
			this._worldScale = new THREE.Vector3();
			this._positionStart = new THREE.Vector3();
			this._quaternionStart = new THREE.Quaternion();
			this._scaleStart = new THREE.Vector3();
			this._getPointer = getPointer.bind( this );
			this._onPointerDown = onPointerDown.bind( this );
			this._onPointerHover = onPointerHover.bind( this );
			this._onPointerMove = onPointerMove.bind( this );
			this._onPointerUp = onPointerUp.bind( this );
			this.domElement.addEventListener( 'pointerdown', this._onPointerDown );
			this.domElement.addEventListener( 'pointermove', this._onPointerHover );
			this.domElement.addEventListener( 'pointerup', this._onPointerUp );

		} // updateMatrixWorld  updates key transformation variables


		updateMatrixWorld() {

			if ( this.object !== undefined ) {

				this.object.updateMatrixWorld();

				if ( this.object.parent === null ) {

					console.error( 'TransformControls: The attached 3D object must be a part of the scene graph.' );

				} else {

					this.object.parent.matrixWorld.decompose( this._parentPosition, this._parentQuaternion, this._parentScale );

				}

				this.object.matrixWorld.decompose( this.worldPosition, this.worldQuaternion, this._worldScale );

				this._parentQuaternionInv.copy( this._parentQuaternion ).invert();

				this._worldQuaternionInv.copy( this.worldQuaternion ).invert();

			}

			this.camera.updateMatrixWorld();
			this.camera.matrixWorld.decompose( this.cameraPosition, this.cameraQuaternion, this._cameraScale );

			if ( this.camera.isOrthographicCamera ) {

				this.camera.getWorldDirection( this.eye ).negate();

			} else {

				this.eye.copy( this.cameraPosition ).sub( this.worldPosition ).normalize();

			}

			super.updateMatrixWorld( this );

		}

		pointerHover( pointer ) {

			if ( this.object === undefined || this.dragging === true ) return;

			_raycaster.setFromCamera( pointer, this.camera );

			const intersect = intersectObjectWithRay( this._gizmo.picker[ this.mode ], _raycaster );

			if ( intersect ) {

				this.axis = intersect.object.name;

			} else {

				this.axis = null;

			}

		}

		pointerDown( pointer ) {

			if ( this.object === undefined || this.dragging === true || pointer.button !== 0 ) return;

			if ( this.axis !== null ) {

				_raycaster.setFromCamera( pointer, this.camera );

				const planeIntersect = intersectObjectWithRay( this._plane, _raycaster, true );

				if ( planeIntersect ) {

					this.object.updateMatrixWorld();
					this.object.parent.updateMatrixWorld();

					this._positionStart.copy( this.object.position );

					this._quaternionStart.copy( this.object.quaternion );

					this._scaleStart.copy( this.object.scale );

					this.object.matrixWorld.decompose( this.worldPositionStart, this.worldQuaternionStart, this._worldScaleStart );
					this.pointStart.copy( planeIntersect.point ).sub( this.worldPositionStart );

				}

				this.dragging = true;
				_mouseDownEvent.mode = this.mode;
				this.dispatchEvent( _mouseDownEvent );

			}

		}

		pointerMove( pointer ) {

			const axis = this.axis;
			const mode = this.mode;
			const object = this.object;
			let space = this.space;

			if ( mode === 'scale' ) {

				space = 'local';

			} else if ( axis === 'E' || axis === 'XYZE' || axis === 'XYZ' ) {

				space = 'world';

			}

			if ( object === undefined || axis === null || this.dragging === false || pointer.button !== - 1 ) return;

			_raycaster.setFromCamera( pointer, this.camera );

			const planeIntersect = intersectObjectWithRay( this._plane, _raycaster, true );
			if ( ! planeIntersect ) return;
			this.pointEnd.copy( planeIntersect.point ).sub( this.worldPositionStart );

			if ( mode === 'translate' ) {

				// Apply translate
				this._offset.copy( this.pointEnd ).sub( this.pointStart );

				if ( space === 'local' && axis !== 'XYZ' ) {

					this._offset.applyQuaternion( this._worldQuaternionInv );

				}

				if ( axis.indexOf( 'X' ) === - 1 ) this._offset.x = 0;
				if ( axis.indexOf( 'Y' ) === - 1 ) this._offset.y = 0;
				if ( axis.indexOf( 'Z' ) === - 1 ) this._offset.z = 0;

				if ( space === 'local' && axis !== 'XYZ' ) {

					this._offset.applyQuaternion( this._quaternionStart ).divide( this._parentScale );

				} else {

					this._offset.applyQuaternion( this._parentQuaternionInv ).divide( this._parentScale );

				}

				object.position.copy( this._offset ).add( this._positionStart ); // Apply translation snap

				if ( this.translationSnap ) {

					if ( space === 'local' ) {

						object.position.applyQuaternion( _tempQuaternion.copy( this._quaternionStart ).invert() );

						if ( axis.search( 'X' ) !== - 1 ) {

							object.position.x = Math.round( object.position.x / this.translationSnap ) * this.translationSnap;

						}

						if ( axis.search( 'Y' ) !== - 1 ) {

							object.position.y = Math.round( object.position.y / this.translationSnap ) * this.translationSnap;

						}

						if ( axis.search( 'Z' ) !== - 1 ) {

							object.position.z = Math.round( object.position.z / this.translationSnap ) * this.translationSnap;

						}

						object.position.applyQuaternion( this._quaternionStart );

					}

					if ( space === 'world' ) {

						if ( object.parent ) {

							object.position.add( _tempVector.setFromMatrixPosition( object.parent.matrixWorld ) );

						}

						if ( axis.search( 'X' ) !== - 1 ) {

							object.position.x = Math.round( object.position.x / this.translationSnap ) * this.translationSnap;

						}

						if ( axis.search( 'Y' ) !== - 1 ) {

							object.position.y = Math.round( object.position.y / this.translationSnap ) * this.translationSnap;

						}

						if ( axis.search( 'Z' ) !== - 1 ) {

							object.position.z = Math.round( object.position.z / this.translationSnap ) * this.translationSnap;

						}

						if ( object.parent ) {

							object.position.sub( _tempVector.setFromMatrixPosition( object.parent.matrixWorld ) );

						}

					}

				}

			} else if ( mode === 'scale' ) {

				if ( axis.search( 'XYZ' ) !== - 1 ) {

					let d = this.pointEnd.length() / this.pointStart.length();
					if ( this.pointEnd.dot( this.pointStart ) < 0 ) d *= - 1;

					_tempVector2.set( d, d, d );

				} else {

					_tempVector.copy( this.pointStart );

					_tempVector2.copy( this.pointEnd );

					_tempVector.applyQuaternion( this._worldQuaternionInv );

					_tempVector2.applyQuaternion( this._worldQuaternionInv );

					_tempVector2.divide( _tempVector );

					if ( axis.search( 'X' ) === - 1 ) {

						_tempVector2.x = 1;

					}

					if ( axis.search( 'Y' ) === - 1 ) {

						_tempVector2.y = 1;

					}

					if ( axis.search( 'Z' ) === - 1 ) {

						_tempVector2.z = 1;

					}

				} // Apply scale


				object.scale.copy( this._scaleStart ).multiply( _tempVector2 );

				if ( this.scaleSnap ) {

					if ( axis.search( 'X' ) !== - 1 ) {

						object.scale.x = Math.round( object.scale.x / this.scaleSnap ) * this.scaleSnap || this.scaleSnap;

					}

					if ( axis.search( 'Y' ) !== - 1 ) {

						object.scale.y = Math.round( object.scale.y / this.scaleSnap ) * this.scaleSnap || this.scaleSnap;

					}

					if ( axis.search( 'Z' ) !== - 1 ) {

						object.scale.z = Math.round( object.scale.z / this.scaleSnap ) * this.scaleSnap || this.scaleSnap;

					}

				}

			} else if ( mode === 'rotate' ) {

				this._offset.copy( this.pointEnd ).sub( this.pointStart );

				const ROTATION_SPEED = 20 / this.worldPosition.distanceTo( _tempVector.setFromMatrixPosition( this.camera.matrixWorld ) );

				if ( axis === 'E' ) {

					this.rotationAxis.copy( this.eye );
					this.rotationAngle = this.pointEnd.angleTo( this.pointStart );

					this._startNorm.copy( this.pointStart ).normalize();

					this._endNorm.copy( this.pointEnd ).normalize();

					this.rotationAngle *= this._endNorm.cross( this._startNorm ).dot( this.eye ) < 0 ? 1 : - 1;

				} else if ( axis === 'XYZE' ) {

					this.rotationAxis.copy( this._offset ).cross( this.eye ).normalize();
					this.rotationAngle = this._offset.dot( _tempVector.copy( this.rotationAxis ).cross( this.eye ) ) * ROTATION_SPEED;

				} else if ( axis === 'X' || axis === 'Y' || axis === 'Z' ) {

					this.rotationAxis.copy( _unit[ axis ] );

					_tempVector.copy( _unit[ axis ] );

					if ( space === 'local' ) {

						_tempVector.applyQuaternion( this.worldQuaternion );

					}

					this.rotationAngle = this._offset.dot( _tempVector.cross( this.eye ).normalize() ) * ROTATION_SPEED;

				} // Apply rotation snap


				if ( this.rotationSnap ) this.rotationAngle = Math.round( this.rotationAngle / this.rotationSnap ) * this.rotationSnap; // Apply rotate

				if ( space === 'local' && axis !== 'E' && axis !== 'XYZE' ) {

					object.quaternion.copy( this._quaternionStart );
					object.quaternion.multiply( _tempQuaternion.setFromAxisAngle( this.rotationAxis, this.rotationAngle ) ).normalize();

				} else {

					this.rotationAxis.applyQuaternion( this._parentQuaternionInv );
					object.quaternion.copy( _tempQuaternion.setFromAxisAngle( this.rotationAxis, this.rotationAngle ) );
					object.quaternion.multiply( this._quaternionStart ).normalize();

				}

			}

			this.dispatchEvent( _changeEvent );
			this.dispatchEvent( _objectChangeEvent );

		}

		pointerUp( pointer ) {

			if ( pointer.button !== 0 ) return;

			if ( this.dragging && this.axis !== null ) {

				_mouseUpEvent.mode = this.mode;
				this.dispatchEvent( _mouseUpEvent );

			}

			this.dragging = false;
			this.axis = null;

		}

		dispose() {

			this.domElement.removeEventListener( 'pointerdown', this._onPointerDown );
			this.domElement.removeEventListener( 'pointermove', this._onPointerHover );
			this.domElement.removeEventListener( 'pointermove', this._onPointerMove );
			this.domElement.removeEventListener( 'pointerup', this._onPointerUp );
			this.traverse( function ( child ) {

				if ( child.geometry ) child.geometry.dispose();
				if ( child.material ) child.material.dispose();

			} );

		} // Set current object


		attach( object ) {

			this.object = object;
			this.visible = true;
			return this;

		} // Detach from object


		detach() {

			this.object = undefined;
			this.visible = false;
			this.axis = null;
			return this;

		}

		reset() {

			if ( ! this.enabled ) return;

			if ( this.dragging ) {

				this.object.position.copy( this._positionStart );
				this.object.quaternion.copy( this._quaternionStart );
				this.object.scale.copy( this._scaleStart );
				this.dispatchEvent( _changeEvent );
				this.dispatchEvent( _objectChangeEvent );
				this.pointStart.copy( this.pointEnd );

			}

		}

		getRaycaster() {

			return _raycaster;

		} // TODO: deprecate


		getMode() {

			return this.mode;

		}

		setMode( mode ) {

			this.mode = mode;

		}

		setTranslationSnap( translationSnap ) {

			this.translationSnap = translationSnap;

		}

		setRotationSnap( rotationSnap ) {

			this.rotationSnap = rotationSnap;

		}

		setScaleSnap( scaleSnap ) {

			this.scaleSnap = scaleSnap;

		}

		setSize( size ) {

			this.size = size;

		}

		setSpace( space ) {

			this.space = space;

		}

	} // mouse / touch event handlers


	function getPointer( event ) {

		if ( this.domElement.ownerDocument.pointerLockElement ) {

			return {
				x: 0,
				y: 0,
				button: event.button
			};

		} else {

			const rect = this.domElement.getBoundingClientRect();
			return {
				x: ( event.clientX - rect.left ) / rect.width * 2 - 1,
				y: - ( event.clientY - rect.top ) / rect.height * 2 + 1,
				button: event.button
			};

		}

	}

	function onPointerHover( event ) {

		if ( ! this.enabled ) return;

		switch ( event.pointerType ) {

			case 'mouse':
			case 'pen':
				this.pointerHover( this._getPointer( event ) );
				break;

		}

	}

	function onPointerDown( event ) {

		if ( ! this.enabled ) return;

		if ( ! document.pointerLockElement ) {

			this.domElement.setPointerCapture( event.pointerId );

		}

		this.domElement.addEventListener( 'pointermove', this._onPointerMove );
		this.pointerHover( this._getPointer( event ) );
		this.pointerDown( this._getPointer( event ) );

	}

	function onPointerMove( event ) {

		if ( ! this.enabled ) return;
		this.pointerMove( this._getPointer( event ) );

	}

	function onPointerUp( event ) {

		if ( ! this.enabled ) return;
		this.domElement.releasePointerCapture( event.pointerId );
		this.domElement.removeEventListener( 'pointermove', this._onPointerMove );
		this.pointerUp( this._getPointer( event ) );

	}

	function intersectObjectWithRay( object, raycaster, includeInvisible ) {

		const allIntersections = raycaster.intersectObject( object, true );

		for ( let i = 0; i < allIntersections.length; i ++ ) {

			if ( allIntersections[ i ].object.visible || includeInvisible ) {

				return allIntersections[ i ];

			}

		}

		return false;

	} //
	// Reusable utility variables


	const _tempEuler = new THREE.Euler();

	const _alignVector = new THREE.Vector3( 0, 1, 0 );

	const _zeroVector = new THREE.Vector3( 0, 0, 0 );

	const _lookAtMatrix = new THREE.Matrix4();

	const _tempQuaternion2 = new THREE.Quaternion();

	const _identityQuaternion = new THREE.Quaternion();

	const _dirVector = new THREE.Vector3();

	const _tempMatrix = new THREE.Matrix4();

	const _unitX = new THREE.Vector3( 1, 0, 0 );

	const _unitY = new THREE.Vector3( 0, 1, 0 );

	const _unitZ = new THREE.Vector3( 0, 0, 1 );

	const _v1 = new THREE.Vector3();

	const _v2 = new THREE.Vector3();

	const _v3 = new THREE.Vector3();

	class TransformControlsGizmo extends THREE.Object3D {

		constructor() {

			super();
			this.isTransformControlsGizmo = true;
			this.type = 'TransformControlsGizmo'; // shared materials

			const gizmoMaterial = new THREE.MeshBasicMaterial( {
				depthTest: false,
				depthWrite: false,
				fog: false,
				toneMapped: false,
				transparent: true
			} );
			const gizmoLineMaterial = new THREE.LineBasicMaterial( {
				depthTest: false,
				depthWrite: false,
				fog: false,
				toneMapped: false,
				transparent: true
			} ); // Make unique material for each axis/color

			const matInvisible = gizmoMaterial.clone();
			matInvisible.opacity = 0.15;
			const matHelper = gizmoLineMaterial.clone();
			matHelper.opacity = 0.5;
			const matRed = gizmoMaterial.clone();
			matRed.color.setHex( 0xff0000 );
			const matGreen = gizmoMaterial.clone();
			matGreen.color.setHex( 0x00ff00 );
			const matBlue = gizmoMaterial.clone();
			matBlue.color.setHex( 0x0000ff );
			const matRedTransparent = gizmoMaterial.clone();
			matRedTransparent.color.setHex( 0xff0000 );
			matRedTransparent.opacity = 0.5;
			const matGreenTransparent = gizmoMaterial.clone();
			matGreenTransparent.color.setHex( 0x00ff00 );
			matGreenTransparent.opacity = 0.5;
			const matBlueTransparent = gizmoMaterial.clone();
			matBlueTransparent.color.setHex( 0x0000ff );
			matBlueTransparent.opacity = 0.5;
			const matWhiteTransparent = gizmoMaterial.clone();
			matWhiteTransparent.opacity = 0.25;
			const matYellowTransparent = gizmoMaterial.clone();
			matYellowTransparent.color.setHex( 0xffff00 );
			matYellowTransparent.opacity = 0.25;
			const matYellow = gizmoMaterial.clone();
			matYellow.color.setHex( 0xffff00 );
			const matGray = gizmoMaterial.clone();
			matGray.color.setHex( 0x787878 ); // reusable geometry

			const arrowGeometry = new THREE.CylinderGeometry( 0, 0.04, 0.1, 12 );
			arrowGeometry.translate( 0, 0.05, 0 );
			const scaleHandleGeometry = new THREE.BoxGeometry( 0.08, 0.08, 0.08 );
			scaleHandleGeometry.translate( 0, 0.04, 0 );
			const lineGeometry = new THREE.BufferGeometry();
			lineGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( [ 0, 0, 0, 1, 0, 0 ], 3 ) );
			const lineGeometry2 = new THREE.CylinderGeometry( 0.0075, 0.0075, 0.5, 3 );
			lineGeometry2.translate( 0, 0.25, 0 );

			function CircleGeometry( radius, arc ) {

				const geometry = new THREE.TorusGeometry( radius, 0.0075, 3, 64, arc * Math.PI * 2 );
				geometry.rotateY( Math.PI / 2 );
				geometry.rotateX( Math.PI / 2 );
				return geometry;

			} // Special geometry for transform helper. If scaled with position vector it spans from [0,0,0] to position


			function TranslateHelperGeometry() {

				const geometry = new THREE.BufferGeometry();
				geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( [ 0, 0, 0, 1, 1, 1 ], 3 ) );
				return geometry;

			} // Gizmo definitions - custom hierarchy definitions for setupGizmo() function


			const gizmoTranslate = {
				X: [[ new THREE.Mesh( arrowGeometry, matRed ), [ 0.5, 0, 0 ], [ 0, 0, - Math.PI / 2 ]], [ new THREE.Mesh( arrowGeometry, matRed ), [ - 0.5, 0, 0 ], [ 0, 0, Math.PI / 2 ]], [ new THREE.Mesh( lineGeometry2, matRed ), [ 0, 0, 0 ], [ 0, 0, - Math.PI / 2 ]]],
				Y: [[ new THREE.Mesh( arrowGeometry, matGreen ), [ 0, 0.5, 0 ]], [ new THREE.Mesh( arrowGeometry, matGreen ), [ 0, - 0.5, 0 ], [ Math.PI, 0, 0 ]], [ new THREE.Mesh( lineGeometry2, matGreen ) ]],
				Z: [[ new THREE.Mesh( arrowGeometry, matBlue ), [ 0, 0, 0.5 ], [ Math.PI / 2, 0, 0 ]], [ new THREE.Mesh( arrowGeometry, matBlue ), [ 0, 0, - 0.5 ], [ - Math.PI / 2, 0, 0 ]], [ new THREE.Mesh( lineGeometry2, matBlue ), null, [ Math.PI / 2, 0, 0 ]]],
				XYZ: [[ new THREE.Mesh( new THREE.OctahedronGeometry( 0.1, 0 ), matWhiteTransparent.clone() ), [ 0, 0, 0 ]]],
				XY: [[ new THREE.Mesh( new THREE.BoxGeometry( 0.15, 0.15, 0.01 ), matBlueTransparent.clone() ), [ 0.15, 0.15, 0 ]]],
				YZ: [[ new THREE.Mesh( new THREE.BoxGeometry( 0.15, 0.15, 0.01 ), matRedTransparent.clone() ), [ 0, 0.15, 0.15 ], [ 0, Math.PI / 2, 0 ]]],
				XZ: [[ new THREE.Mesh( new THREE.BoxGeometry( 0.15, 0.15, 0.01 ), matGreenTransparent.clone() ), [ 0.15, 0, 0.15 ], [ - Math.PI / 2, 0, 0 ]]]
			};
			const pickerTranslate = {
				X: [[ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 0.6, 4 ), matInvisible ), [ 0.3, 0, 0 ], [ 0, 0, - Math.PI / 2 ]], [ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 0.6, 4 ), matInvisible ), [ - 0.3, 0, 0 ], [ 0, 0, Math.PI / 2 ]]],
				Y: [[ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 0.6, 4 ), matInvisible ), [ 0, 0.3, 0 ]], [ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 0.6, 4 ), matInvisible ), [ 0, - 0.3, 0 ], [ 0, 0, Math.PI ]]],
				Z: [[ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 0.6, 4 ), matInvisible ), [ 0, 0, 0.3 ], [ Math.PI / 2, 0, 0 ]], [ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 0.6, 4 ), matInvisible ), [ 0, 0, - 0.3 ], [ - Math.PI / 2, 0, 0 ]]],
				XYZ: [[ new THREE.Mesh( new THREE.OctahedronGeometry( 0.2, 0 ), matInvisible ) ]],
				XY: [[ new THREE.Mesh( new THREE.BoxGeometry( 0.2, 0.2, 0.01 ), matInvisible ), [ 0.15, 0.15, 0 ]]],
				YZ: [[ new THREE.Mesh( new THREE.BoxGeometry( 0.2, 0.2, 0.01 ), matInvisible ), [ 0, 0.15, 0.15 ], [ 0, Math.PI / 2, 0 ]]],
				XZ: [[ new THREE.Mesh( new THREE.BoxGeometry( 0.2, 0.2, 0.01 ), matInvisible ), [ 0.15, 0, 0.15 ], [ - Math.PI / 2, 0, 0 ]]]
			};
			const helperTranslate = {
				START: [[ new THREE.Mesh( new THREE.OctahedronGeometry( 0.01, 2 ), matHelper ), null, null, null, 'helper' ]],
				END: [[ new THREE.Mesh( new THREE.OctahedronGeometry( 0.01, 2 ), matHelper ), null, null, null, 'helper' ]],
				DELTA: [[ new THREE.Line( TranslateHelperGeometry(), matHelper ), null, null, null, 'helper' ]],
				X: [[ new THREE.Line( lineGeometry, matHelper.clone() ), [ - 1e3, 0, 0 ], null, [ 1e6, 1, 1 ], 'helper' ]],
				Y: [[ new THREE.Line( lineGeometry, matHelper.clone() ), [ 0, - 1e3, 0 ], [ 0, 0, Math.PI / 2 ], [ 1e6, 1, 1 ], 'helper' ]],
				Z: [[ new THREE.Line( lineGeometry, matHelper.clone() ), [ 0, 0, - 1e3 ], [ 0, - Math.PI / 2, 0 ], [ 1e6, 1, 1 ], 'helper' ]]
			};
			const gizmoRotate = {
				XYZE: [[ new THREE.Mesh( CircleGeometry( 0.5, 1 ), matGray ), null, [ 0, Math.PI / 2, 0 ]]],
				X: [[ new THREE.Mesh( CircleGeometry( 0.5, 0.5 ), matRed ) ]],
				Y: [[ new THREE.Mesh( CircleGeometry( 0.5, 0.5 ), matGreen ), null, [ 0, 0, - Math.PI / 2 ]]],
				Z: [[ new THREE.Mesh( CircleGeometry( 0.5, 0.5 ), matBlue ), null, [ 0, Math.PI / 2, 0 ]]],
				E: [[ new THREE.Mesh( CircleGeometry( 0.75, 1 ), matYellowTransparent ), null, [ 0, Math.PI / 2, 0 ]]]
			};
			const helperRotate = {
				AXIS: [[ new THREE.Line( lineGeometry, matHelper.clone() ), [ - 1e3, 0, 0 ], null, [ 1e6, 1, 1 ], 'helper' ]]
			};
			const pickerRotate = {
				XYZE: [[ new THREE.Mesh( new THREE.SphereGeometry( 0.25, 10, 8 ), matInvisible ) ]],
				X: [[ new THREE.Mesh( new THREE.TorusGeometry( 0.5, 0.1, 4, 24 ), matInvisible ), [ 0, 0, 0 ], [ 0, - Math.PI / 2, - Math.PI / 2 ]]],
				Y: [[ new THREE.Mesh( new THREE.TorusGeometry( 0.5, 0.1, 4, 24 ), matInvisible ), [ 0, 0, 0 ], [ Math.PI / 2, 0, 0 ]]],
				Z: [[ new THREE.Mesh( new THREE.TorusGeometry( 0.5, 0.1, 4, 24 ), matInvisible ), [ 0, 0, 0 ], [ 0, 0, - Math.PI / 2 ]]],
				E: [[ new THREE.Mesh( new THREE.TorusGeometry( 0.75, 0.1, 2, 24 ), matInvisible ) ]]
			};
			const gizmoScale = {
				X: [[ new THREE.Mesh( scaleHandleGeometry, matRed ), [ 0.5, 0, 0 ], [ 0, 0, - Math.PI / 2 ]], [ new THREE.Mesh( lineGeometry2, matRed ), [ 0, 0, 0 ], [ 0, 0, - Math.PI / 2 ]], [ new THREE.Mesh( scaleHandleGeometry, matRed ), [ - 0.5, 0, 0 ], [ 0, 0, Math.PI / 2 ]]],
				Y: [[ new THREE.Mesh( scaleHandleGeometry, matGreen ), [ 0, 0.5, 0 ]], [ new THREE.Mesh( lineGeometry2, matGreen ) ], [ new THREE.Mesh( scaleHandleGeometry, matGreen ), [ 0, - 0.5, 0 ], [ 0, 0, Math.PI ]]],
				Z: [[ new THREE.Mesh( scaleHandleGeometry, matBlue ), [ 0, 0, 0.5 ], [ Math.PI / 2, 0, 0 ]], [ new THREE.Mesh( lineGeometry2, matBlue ), [ 0, 0, 0 ], [ Math.PI / 2, 0, 0 ]], [ new THREE.Mesh( scaleHandleGeometry, matBlue ), [ 0, 0, - 0.5 ], [ - Math.PI / 2, 0, 0 ]]],
				XY: [[ new THREE.Mesh( new THREE.BoxGeometry( 0.15, 0.15, 0.01 ), matBlueTransparent ), [ 0.15, 0.15, 0 ]]],
				YZ: [[ new THREE.Mesh( new THREE.BoxGeometry( 0.15, 0.15, 0.01 ), matRedTransparent ), [ 0, 0.15, 0.15 ], [ 0, Math.PI / 2, 0 ]]],
				XZ: [[ new THREE.Mesh( new THREE.BoxGeometry( 0.15, 0.15, 0.01 ), matGreenTransparent ), [ 0.15, 0, 0.15 ], [ - Math.PI / 2, 0, 0 ]]],
				XYZ: [[ new THREE.Mesh( new THREE.BoxGeometry( 0.1, 0.1, 0.1 ), matWhiteTransparent.clone() ) ]]
			};
			const pickerScale = {
				X: [[ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 0.6, 4 ), matInvisible ), [ 0.3, 0, 0 ], [ 0, 0, - Math.PI / 2 ]], [ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 0.6, 4 ), matInvisible ), [ - 0.3, 0, 0 ], [ 0, 0, Math.PI / 2 ]]],
				Y: [[ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 0.6, 4 ), matInvisible ), [ 0, 0.3, 0 ]], [ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 0.6, 4 ), matInvisible ), [ 0, - 0.3, 0 ], [ 0, 0, Math.PI ]]],
				Z: [[ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 0.6, 4 ), matInvisible ), [ 0, 0, 0.3 ], [ Math.PI / 2, 0, 0 ]], [ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 0.6, 4 ), matInvisible ), [ 0, 0, - 0.3 ], [ - Math.PI / 2, 0, 0 ]]],
				XY: [[ new THREE.Mesh( new THREE.BoxGeometry( 0.2, 0.2, 0.01 ), matInvisible ), [ 0.15, 0.15, 0 ]]],
				YZ: [[ new THREE.Mesh( new THREE.BoxGeometry( 0.2, 0.2, 0.01 ), matInvisible ), [ 0, 0.15, 0.15 ], [ 0, Math.PI / 2, 0 ]]],
				XZ: [[ new THREE.Mesh( new THREE.BoxGeometry( 0.2, 0.2, 0.01 ), matInvisible ), [ 0.15, 0, 0.15 ], [ - Math.PI / 2, 0, 0 ]]],
				XYZ: [[ new THREE.Mesh( new THREE.BoxGeometry( 0.2, 0.2, 0.2 ), matInvisible ), [ 0, 0, 0 ]]]
			};
			const helperScale = {
				X: [[ new THREE.Line( lineGeometry, matHelper.clone() ), [ - 1e3, 0, 0 ], null, [ 1e6, 1, 1 ], 'helper' ]],
				Y: [[ new THREE.Line( lineGeometry, matHelper.clone() ), [ 0, - 1e3, 0 ], [ 0, 0, Math.PI / 2 ], [ 1e6, 1, 1 ], 'helper' ]],
				Z: [[ new THREE.Line( lineGeometry, matHelper.clone() ), [ 0, 0, - 1e3 ], [ 0, - Math.PI / 2, 0 ], [ 1e6, 1, 1 ], 'helper' ]]
			}; // Creates an THREE.Object3D with gizmos described in custom hierarchy definition.

			function setupGizmo( gizmoMap ) {

				const gizmo = new THREE.Object3D();

				for ( const name in gizmoMap ) {

					for ( let i = gizmoMap[ name ].length; i --; ) {

						const object = gizmoMap[ name ][ i ][ 0 ].clone();
						const position = gizmoMap[ name ][ i ][ 1 ];
						const rotation = gizmoMap[ name ][ i ][ 2 ];
						const scale = gizmoMap[ name ][ i ][ 3 ];
						const tag = gizmoMap[ name ][ i ][ 4 ]; // name and tag properties are essential for picking and updating logic.

						object.name = name;
						object.tag = tag;

						if ( position ) {

							object.position.set( position[ 0 ], position[ 1 ], position[ 2 ] );

						}

						if ( rotation ) {

							object.rotation.set( rotation[ 0 ], rotation[ 1 ], rotation[ 2 ] );

						}

						if ( scale ) {

							object.scale.set( scale[ 0 ], scale[ 1 ], scale[ 2 ] );

						}

						object.updateMatrix();
						const tempGeometry = object.geometry.clone();
						tempGeometry.applyMatrix4( object.matrix );
						object.geometry = tempGeometry;
						object.renderOrder = Infinity;
						object.position.set( 0, 0, 0 );
						object.rotation.set( 0, 0, 0 );
						object.scale.set( 1, 1, 1 );
						gizmo.add( object );

					}

				}

				return gizmo;

			} // Gizmo creation


			this.gizmo = {};
			this.picker = {};
			this.helper = {};
			this.add( this.gizmo[ 'translate' ] = setupGizmo( gizmoTranslate ) );
			this.add( this.gizmo[ 'rotate' ] = setupGizmo( gizmoRotate ) );
			this.add( this.gizmo[ 'scale' ] = setupGizmo( gizmoScale ) );
			this.add( this.picker[ 'translate' ] = setupGizmo( pickerTranslate ) );
			this.add( this.picker[ 'rotate' ] = setupGizmo( pickerRotate ) );
			this.add( this.picker[ 'scale' ] = setupGizmo( pickerScale ) );
			this.add( this.helper[ 'translate' ] = setupGizmo( helperTranslate ) );
			this.add( this.helper[ 'rotate' ] = setupGizmo( helperRotate ) );
			this.add( this.helper[ 'scale' ] = setupGizmo( helperScale ) ); // Pickers should be hidden always

			this.picker[ 'translate' ].visible = false;
			this.picker[ 'rotate' ].visible = false;
			this.picker[ 'scale' ].visible = false;

		} // updateMatrixWorld will update transformations and appearance of individual handles


		updateMatrixWorld( force ) {

			const space = this.mode === 'scale' ? 'local' : this.space; // scale always oriented to local rotation

			const quaternion = space === 'local' ? this.worldQuaternion : _identityQuaternion; // Show only gizmos for current transform mode

			this.gizmo[ 'translate' ].visible = this.mode === 'translate';
			this.gizmo[ 'rotate' ].visible = this.mode === 'rotate';
			this.gizmo[ 'scale' ].visible = this.mode === 'scale';
			this.helper[ 'translate' ].visible = this.mode === 'translate';
			this.helper[ 'rotate' ].visible = this.mode === 'rotate';
			this.helper[ 'scale' ].visible = this.mode === 'scale';
			let handles = [];
			handles = handles.concat( this.picker[ this.mode ].children );
			handles = handles.concat( this.gizmo[ this.mode ].children );
			handles = handles.concat( this.helper[ this.mode ].children );

			for ( let i = 0; i < handles.length; i ++ ) {

				const handle = handles[ i ]; // hide aligned to camera

				handle.visible = true;
				handle.rotation.set( 0, 0, 0 );
				handle.position.copy( this.worldPosition );
				let factor;

				if ( this.camera.isOrthographicCamera ) {

					factor = ( this.camera.top - this.camera.bottom ) / this.camera.zoom;

				} else {

					factor = this.worldPosition.distanceTo( this.cameraPosition ) * Math.min( 1.9 * Math.tan( Math.PI * this.camera.fov / 360 ) / this.camera.zoom, 7 );

				}

				handle.scale.set( 1, 1, 1 ).multiplyScalar( factor * this.size / 4 ); // TODO: simplify helpers and consider decoupling from gizmo

				if ( handle.tag === 'helper' ) {

					handle.visible = false;

					if ( handle.name === 'AXIS' ) {

						handle.position.copy( this.worldPositionStart );
						handle.visible = !! this.axis;

						if ( this.axis === 'X' ) {

							_tempQuaternion.setFromEuler( _tempEuler.set( 0, 0, 0 ) );

							handle.quaternion.copy( quaternion ).multiply( _tempQuaternion );

							if ( Math.abs( _alignVector.copy( _unitX ).applyQuaternion( quaternion ).dot( this.eye ) ) > 0.9 ) {

								handle.visible = false;

							}

						}

						if ( this.axis === 'Y' ) {

							_tempQuaternion.setFromEuler( _tempEuler.set( 0, 0, Math.PI / 2 ) );

							handle.quaternion.copy( quaternion ).multiply( _tempQuaternion );

							if ( Math.abs( _alignVector.copy( _unitY ).applyQuaternion( quaternion ).dot( this.eye ) ) > 0.9 ) {

								handle.visible = false;

							}

						}

						if ( this.axis === 'Z' ) {

							_tempQuaternion.setFromEuler( _tempEuler.set( 0, Math.PI / 2, 0 ) );

							handle.quaternion.copy( quaternion ).multiply( _tempQuaternion );

							if ( Math.abs( _alignVector.copy( _unitZ ).applyQuaternion( quaternion ).dot( this.eye ) ) > 0.9 ) {

								handle.visible = false;

							}

						}

						if ( this.axis === 'XYZE' ) {

							_tempQuaternion.setFromEuler( _tempEuler.set( 0, Math.PI / 2, 0 ) );

							_alignVector.copy( this.rotationAxis );

							handle.quaternion.setFromRotationMatrix( _lookAtMatrix.lookAt( _zeroVector, _alignVector, _unitY ) );
							handle.quaternion.multiply( _tempQuaternion );
							handle.visible = this.dragging;

						}

						if ( this.axis === 'E' ) {

							handle.visible = false;

						}

					} else if ( handle.name === 'START' ) {

						handle.position.copy( this.worldPositionStart );
						handle.visible = this.dragging;

					} else if ( handle.name === 'END' ) {

						handle.position.copy( this.worldPosition );
						handle.visible = this.dragging;

					} else if ( handle.name === 'DELTA' ) {

						handle.position.copy( this.worldPositionStart );
						handle.quaternion.copy( this.worldQuaternionStart );

						_tempVector.set( 1e-10, 1e-10, 1e-10 ).add( this.worldPositionStart ).sub( this.worldPosition ).multiplyScalar( - 1 );

						_tempVector.applyQuaternion( this.worldQuaternionStart.clone().invert() );

						handle.scale.copy( _tempVector );
						handle.visible = this.dragging;

					} else {

						handle.quaternion.copy( quaternion );

						if ( this.dragging ) {

							handle.position.copy( this.worldPositionStart );

						} else {

							handle.position.copy( this.worldPosition );

						}

						if ( this.axis ) {

							handle.visible = this.axis.search( handle.name ) !== - 1;

						}

					} // If updating helper, skip rest of the loop


					continue;

				} // Align handles to current local or world rotation


				handle.quaternion.copy( quaternion );

				if ( this.mode === 'translate' || this.mode === 'scale' ) {

					// Hide translate and scale axis facing the camera
					const AXIS_HIDE_THRESHOLD = 0.99;
					const PLANE_HIDE_THRESHOLD = 0.2;

					if ( handle.name === 'X' ) {

						if ( Math.abs( _alignVector.copy( _unitX ).applyQuaternion( quaternion ).dot( this.eye ) ) > AXIS_HIDE_THRESHOLD ) {

							handle.scale.set( 1e-10, 1e-10, 1e-10 );
							handle.visible = false;

						}

					}

					if ( handle.name === 'Y' ) {

						if ( Math.abs( _alignVector.copy( _unitY ).applyQuaternion( quaternion ).dot( this.eye ) ) > AXIS_HIDE_THRESHOLD ) {

							handle.scale.set( 1e-10, 1e-10, 1e-10 );
							handle.visible = false;

						}

					}

					if ( handle.name === 'Z' ) {

						if ( Math.abs( _alignVector.copy( _unitZ ).applyQuaternion( quaternion ).dot( this.eye ) ) > AXIS_HIDE_THRESHOLD ) {

							handle.scale.set( 1e-10, 1e-10, 1e-10 );
							handle.visible = false;

						}

					}

					if ( handle.name === 'XY' ) {

						if ( Math.abs( _alignVector.copy( _unitZ ).applyQuaternion( quaternion ).dot( this.eye ) ) < PLANE_HIDE_THRESHOLD ) {

							handle.scale.set( 1e-10, 1e-10, 1e-10 );
							handle.visible = false;

						}

					}

					if ( handle.name === 'YZ' ) {

						if ( Math.abs( _alignVector.copy( _unitX ).applyQuaternion( quaternion ).dot( this.eye ) ) < PLANE_HIDE_THRESHOLD ) {

							handle.scale.set( 1e-10, 1e-10, 1e-10 );
							handle.visible = false;

						}

					}

					if ( handle.name === 'XZ' ) {

						if ( Math.abs( _alignVector.copy( _unitY ).applyQuaternion( quaternion ).dot( this.eye ) ) < PLANE_HIDE_THRESHOLD ) {

							handle.scale.set( 1e-10, 1e-10, 1e-10 );
							handle.visible = false;

						}

					}

				} else if ( this.mode === 'rotate' ) {

					// Align handles to current local or world rotation
					_tempQuaternion2.copy( quaternion );

					_alignVector.copy( this.eye ).applyQuaternion( _tempQuaternion.copy( quaternion ).invert() );

					if ( handle.name.search( 'E' ) !== - 1 ) {

						handle.quaternion.setFromRotationMatrix( _lookAtMatrix.lookAt( this.eye, _zeroVector, _unitY ) );

					}

					if ( handle.name === 'X' ) {

						_tempQuaternion.setFromAxisAngle( _unitX, Math.atan2( - _alignVector.y, _alignVector.z ) );

						_tempQuaternion.multiplyQuaternions( _tempQuaternion2, _tempQuaternion );

						handle.quaternion.copy( _tempQuaternion );

					}

					if ( handle.name === 'Y' ) {

						_tempQuaternion.setFromAxisAngle( _unitY, Math.atan2( _alignVector.x, _alignVector.z ) );

						_tempQuaternion.multiplyQuaternions( _tempQuaternion2, _tempQuaternion );

						handle.quaternion.copy( _tempQuaternion );

					}

					if ( handle.name === 'Z' ) {

						_tempQuaternion.setFromAxisAngle( _unitZ, Math.atan2( _alignVector.y, _alignVector.x ) );

						_tempQuaternion.multiplyQuaternions( _tempQuaternion2, _tempQuaternion );

						handle.quaternion.copy( _tempQuaternion );

					}

				} // Hide disabled axes


				handle.visible = handle.visible && ( handle.name.indexOf( 'X' ) === - 1 || this.showX );
				handle.visible = handle.visible && ( handle.name.indexOf( 'Y' ) === - 1 || this.showY );
				handle.visible = handle.visible && ( handle.name.indexOf( 'Z' ) === - 1 || this.showZ );
				handle.visible = handle.visible && ( handle.name.indexOf( 'E' ) === - 1 || this.showX && this.showY && this.showZ ); // highlight selected axis

				handle.material._color = handle.material._color || handle.material.color.clone();
				handle.material._opacity = handle.material._opacity || handle.material.opacity;
				handle.material.color.copy( handle.material._color );
				handle.material.opacity = handle.material._opacity;

				if ( this.enabled && this.axis ) {

					if ( handle.name === this.axis ) {

						handle.material.color.setHex( 0xffff00 );
						handle.material.opacity = 1.0;

					} else if ( this.axis.split( '' ).some( function ( a ) {

						return handle.name === a;

					} ) ) {

						handle.material.color.setHex( 0xffff00 );
						handle.material.opacity = 1.0;

					}

				}

			}

			super.updateMatrixWorld( force );

		}

	} //


	class TransformControlsPlane extends THREE.Mesh {

		constructor() {

			super( new THREE.PlaneGeometry( 100000, 100000, 2, 2 ), new THREE.MeshBasicMaterial( {
				visible: false,
				wireframe: true,
				side: THREE.DoubleSide,
				transparent: true,
				opacity: 0.1,
				toneMapped: false
			} ) );
			this.isTransformControlsPlane = true;
			this.type = 'TransformControlsPlane';

		}

		updateMatrixWorld( force ) {

			let space = this.space;
			this.position.copy( this.worldPosition );
			if ( this.mode === 'scale' ) space = 'local'; // scale always oriented to local rotation

			_v1.copy( _unitX ).applyQuaternion( space === 'local' ? this.worldQuaternion : _identityQuaternion );

			_v2.copy( _unitY ).applyQuaternion( space === 'local' ? this.worldQuaternion : _identityQuaternion );

			_v3.copy( _unitZ ).applyQuaternion( space === 'local' ? this.worldQuaternion : _identityQuaternion ); // Align the plane for current transform mode, axis and space.


			_alignVector.copy( _v2 );

			switch ( this.mode ) {

				case 'translate':
				case 'scale':
					switch ( this.axis ) {

						case 'X':
							_alignVector.copy( this.eye ).cross( _v1 );

							_dirVector.copy( _v1 ).cross( _alignVector );

							break;

						case 'Y':
							_alignVector.copy( this.eye ).cross( _v2 );

							_dirVector.copy( _v2 ).cross( _alignVector );

							break;

						case 'Z':
							_alignVector.copy( this.eye ).cross( _v3 );

							_dirVector.copy( _v3 ).cross( _alignVector );

							break;

						case 'XY':
							_dirVector.copy( _v3 );

							break;

						case 'YZ':
							_dirVector.copy( _v1 );

							break;

						case 'XZ':
							_alignVector.copy( _v3 );

							_dirVector.copy( _v2 );

							break;

						case 'XYZ':
						case 'E':
							_dirVector.set( 0, 0, 0 );

							break;

					}

					break;

				case 'rotate':
				default:
					// special case for rotate
					_dirVector.set( 0, 0, 0 );

			}

			if ( _dirVector.length() === 0 ) {

				// If in rotate mode, make the plane parallel to camera
				this.quaternion.copy( this.cameraQuaternion );

			} else {

				_tempMatrix.lookAt( _tempVector.set( 0, 0, 0 ), _dirVector, _alignVector );

				this.quaternion.setFromRotationMatrix( _tempMatrix );

			}

			super.updateMatrixWorld( force );

		}

	}

	THREE.TransformControls = TransformControls;
	THREE.TransformControlsGizmo = TransformControlsGizmo;
	THREE.TransformControlsPlane = TransformControlsPlane;

} )();
