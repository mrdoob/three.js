 /** This EventsControls will allow to facilitate development speed for simple manipulations by means of a mouse
 * - point and click, drag and drop.
 * @author Vildanov Almaz / alvild@gmail.com
 */

EventsControls = function ( camera, domElement ) {

	var _this = this;

	this.camera = camera;
	this.container = ( domElement !== undefined ) ? domElement : document;
	this.fixed = new THREE.Vector3( 0, 0, 0 );
	this.draggable = true;
	
	var _DisplaceFocused = null; // выделенный объект
	this.focused = null; // выделенный объект
	this.focusedChild = null; // выделенная часть 3D объекта
	this.previous = new THREE.Vector3(); // предыдущие координаты выделенного объекта
	var _DisplacemouseOvered = null; // наведенный объект	
	this.mouseOvered = null; // наведенный объект
	this.mouseOveredChild = null; // наведенная часть 3D объекта	
	this.focusedItem = null;
	this.mouseOveredItem = null;
	this.focusedDistance = null;
	this.mouseOveredDistance = null;
	this.focusedPoint = null;
	this.mouseOveredPoint = null;
	this.raycaster = new THREE.Raycaster();

	this.map = null;
	this.projectionPoint = null;
	
	this._mouse = new THREE.Vector2();
	this.mouse = new THREE.Vector2();
	
	this.collidable = false;
	this.collidableEntities = [];		
	this.collision = function () { 
		console.log( 'collision!' );
	}
	
	//this._projector = new THREE.Projector();
	//this.clock = new THREE.Clock();
	//this.period = 0.1; 
	//this.clock.start();

	// API

	this.enabled = true;

	this.objects = [];
	var _DisplaceIntersects = [];
	var _DisplaceIntersectsMap = [];	
	this.intersects = [];
	this.intersectsMap = [];

	this.update = function () {
		if ( _this.enabled ) { 
			onContainerMouseMove();
			_this.mouseMove();
		}
	}

	this.dragAndDrop = function () { this.container.style.cursor = 'move' }
	this.mouseOver = function () { this.container.style.cursor = 'pointer' }
	this.mouseOut = function () { this.container.style.cursor = 'auto' }
	this.mouseUp = function () { this.container.style.cursor = 'auto' }
	this.mouseMove = function () {}	
	this.onclick = function () {}

	this.returnPrevious = function() {

		this._selGetPos( this.previous );

	}
	this.attach = function ( object ) {

		if ( object instanceof THREE.Mesh ) { 
			this.objects.push( object );
		}
		else {

			this.objects.push( object );

			for ( var i = 0; i < object.children.length; i++ ) {
				object.children[i].userData.parent = object;		
			}
		}

	}

	this.detach = function ( object ) {

		var item = _this.objects.indexOf( object );
		this.objects.splice( item, 1 );

	}

	this.setFocus = function ( object ) {

		_DisplaceFocused = object;
		_this.focusedItem = _this.objects.indexOf( object );
		
		if ( object.userData.parent ) { // console.log( ' select object3D ' );
			this.focused = object.userData.parent;
			this.focusedChild = _DisplaceFocused;
			this.previous.copy( this.focused.position );
		}
		else { //console.log( ' select mesh ' );
			this.focused = object; this.focusedChild = null;
			this.previous.copy( this.focused.position );
		}

	}
	
	this._setFocusNull = function () {
		_DisplaceFocused = null;
		this.focused = null;
		this.focusedChild = null;
		this.focusedItem = null;
	}
	
	this.select = function ( object ) {

		_DisplacemouseOvered = object;
		_this.mouseOveredItem = _this.objects.indexOf( object );			
		if ( object.userData.parent ) { // console.log( ' select object3D ' );
			this.mouseOvered = object.userData.parent;
			this.mouseOveredChild = _DisplacemouseOvered;
		}
		else { //console.log( ' select mesh ' );
			this.mouseOvered = object; this.mouseOveredChild = null;
		}

	}
	
	this._setSelectNull = function () {
		_DisplacemouseOvered = null;
		this.mouseOvered =  null;
		this.mouseOveredChild = null;
		this.mouseOveredItem = null;		
	}

	this._selGetPos = function( a ) {

		this.focused.position.copy( a ); //console.log( this.focused.position );
	}

	this._rayGet = function () {

		if ( _this.camera instanceof THREE.OrthographicCamera ) {

			var vector = new THREE.Vector3( _this._mouse.x, _this._mouse.y, - 1 ).unproject( this.camera );
			var direction = new THREE.Vector3( 0, 0, -1 ).transformDirection( this.camera.matrixWorld );
			_this.raycaster.set( vector, direction );

		}
		else {

			var vector = new THREE.Vector3( _this._mouse.x, _this._mouse.y, 1 );
			//_this._projector.unprojectVector( vector, camera ); 
			vector.unproject( _this.camera );
			//	_this.raycaster = new THREE.Raycaster( _this.camera.position, vector.sub( _this.camera.position ).normalize() );
			_this.raycaster.set( _this.camera.position, vector.sub( _this.camera.position ).normalize() );		

		}

		//return _this.raycaster;

	}
	
	this._setMap = function () {

		_this.intersectsMap = _DisplaceIntersectsMap;

	}

	function getMousePos( event ) {
	if ( _this.enabled ) { 	
		var x = event.offsetX == undefined ? event.layerX : event.offsetX;
		var y = event.offsetY == undefined ? event.layerY : event.offsetY;	
		
		_this._mouse.x = ( ( x ) / _this.container.width ) * 2 - 1;
		_this._mouse.y = - ( ( y ) / _this.container.height ) * 2 + 1;

		var vector = new THREE.Vector3( _this._mouse.x, _this._mouse.y, 0.5 );
		return vector;
	}
	}

	function onContainerMouseDown( event ) {
		
	if ( _this.enabled ) { 	
		if ( _this.focused ) { return; }
		_this._rayGet();
		_this.intersects = _this.raycaster.intersectObjects( _this.objects, true );

		if ( _this.intersects.length > 0 ) {

			_this.setFocus( _this.intersects[ 0 ].object );
			_this.focusedDistance = _this.intersects[ 0 ].distance;
			_this.focusedPoint = _this.intersects[ 0 ].point;
			_this.onclick();

		}
		else {
			_this._setFocusNull();
		}
	}
	}

	function onContainerMouseMove() {
	
	//var time = _this.clock.getElapsedTime();
	//if ( time > _this.period ) { 
	//_this.clock.elapsedTime = 0;

//	console.log('________________________');
		_this._rayGet();

		if ( _this.focused ) {

		if ( _this.draggable ) {
			_DisplaceIntersectsMap = _this.raycaster.intersectObject( _this.map );
			_this._setMap();
			try {
				var pos = new THREE.Vector3().copy( _DisplaceIntersectsMap[ 0 ].point );
				if ( _this.fixed.x == 1 ) { pos.x = _this.previous.x };
				if ( _this.fixed.y == 1 ) { pos.y = _this.previous.y };
				if ( _this.fixed.z == 1 ) { pos.z = _this.previous.z };				
				_this._selGetPos( pos );
			}
			catch( err ) {}

			_this.dragAndDrop(); //_this._selGetPos( _this.focused.position );
		}
		}
		else {

			_DisplaceIntersects = _this.raycaster.intersectObjects( _this.objects, true );
			_this.intersects = _DisplaceIntersects;
			if ( _this.intersects.length > 0 ) {	
					_this.mouseOveredDistance = _this.intersects[ 0 ].distance;
					_this.mouseOveredPoint = _this.intersects[ 0 ].point;			
				if ( _this.mouseOvered ) {  // какая-то клавиша уже была наведена			
					if ( _DisplacemouseOvered != _this.intersects[ 0 ].object ) {
						_this.mouseOut();
						_this.select( _this.intersects[ 0 ].object );				
						_this.mouseOver();
					}
					//else _this.mouseOver();
				}
				else {
					_this.select( _this.intersects[ 0 ].object );
					_this.mouseOveredDistance = _this.intersects[ 0 ].distance;
					_this.mouseOveredPoint = _this.intersects[ 0 ].point;					
					_this.mouseOver();
				}
			}
			else {
				if ( _DisplacemouseOvered ) { _this.mouseOut(); _this._setSelectNull(); }
			}

		}

		if ( _this.focused ) {					
		if ( _this.collidable ) {
			var originPoint = _this.focused.position.clone();
			for (var vertexIndex = 0; vertexIndex < _this.focused.geometry.vertices.length; vertexIndex++)	{		
				var localVertex = _this.focused.geometry.vertices[vertexIndex].clone();
				var globalVertex = _this.focused.localToWorld( localVertex );
				var directionVector = new THREE.Vector3().copy( globalVertex );
				directionVector.sub( _this.focused.position );

				_this.raycaster.set( originPoint, directionVector.clone().normalize() );
				var collisionResults = _this.raycaster.intersectObjects( _this.collidableEntities );

				if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ) {
					_this.collision();
					break;
				}

			}		
		}
		
		}

	//}
	}

	function onContainerMouseUp( event ) {
	if ( _this.enabled ) { 	
		event.preventDefault();

			if ( _this.focused ) {

				_this.mouseUp();
                _DisplaceFocused = null;
				_this.focused = null; 

			}
	}
	}

	this.container.addEventListener( 'mousedown', onContainerMouseDown, false );	// мышка нажата
	this.container.addEventListener( 'mousemove', getMousePos, false );   // получение координат мыши
	this.container.addEventListener( 'mouseup', onContainerMouseUp, false );       // мышка отпущена

};

			
			THREE.Vector3.prototype.console = function ( vec ) {
				console.log( vec + ' ( ' + this.x + ' ' + this.y + ' ' + this.z + ' )' );
			}
//EventsControls.prototype = Object.create( THREE.EventDispatcher.prototype );

