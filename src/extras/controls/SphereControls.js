/**
 * @author Guillaume Masse / http://masgui.wikidot.com
 * @author mrdoob / http://mrdoob.com/
 */

THREE.SphereControls = function ( object, domElement, radius, theta, phi ) {
	
	this.object = object;
	this.target = new THREE.Vector3( 0, 0, 0 );
	this.domElement = ( domElement !== undefined ) ? domElement : document;
	
	this.isMouseDown = false;
	this.onMouseDownPosition = new THREE.Vector2(0,0);
	
	this.radius = ( radius !== undefined ) ? radius : 1600;
	
	this.theta = ( theta !== undefined ) ? theta : 45;
	this.onMouseDownTheta = ( theta !== undefined ) ? theta : 45;
	
	this.phi = ( phi !== undefined ) ? phi : 45;
	this.onMouseDownPhi = ( phi !== undefined ) ? phi : 45;
	
	this.onMouseDown = function( event ) {

		event.preventDefault();

		this.isMouseDown = true;

		// usefull ?
		this.onMouseDownTheta = this.theta;
		this.onMouseDownPhi = this.phi;
		
		this.onMouseDownPosition.x = event.clientX;
		this.onMouseDownPosition.y = event.clientY;
	};
	
	this.onMouseMove = function( event ) {

		event.preventDefault();

		if( !this.isMouseDown )
		{
			return;
		}

		this.theta = - ( ( event.clientX - this.onMouseDownPosition.x ) * 0.5 ) + this.onMouseDownTheta;
		this.phi = ( ( event.clientY - this.onMouseDownPosition.y ) * 0.5 ) + this.onMouseDownPhi;
		this.phi = Math.min( 180, Math.max( 0, this.phi ) );
	};
	
	this.onMouseUp = function( event ) {

		event.preventDefault();

		this.isMouseDown = false;

		this.onMouseDownPosition.x = event.clientX - this.onMouseDownPosition.x;
		this.onMouseDownPosition.y = event.clientY - this.onMouseDownPosition.y;
	};
	
	this.onMouseWheel = function( event ) {

		var newRadius = this.radius - event.wheelDeltaY;

		if( this.object.near < newRadius && newRadius < this.object.far )
		{
			this.radius = newRadius;			
		}
	};
	
	this.update = function( ) {

		this.object.position.x 
			= this.radius 
			* Math.sin( this.theta * Math.PI / 360 ) 
			* Math.cos( this.phi * Math.PI / 360 );
			
		this.object.position.y 
			= this.radius 
			* Math.sin( this.phi * Math.PI / 360 );
			
		this.object.position.z 
			= this.radius 
			* Math.cos( this.theta * Math.PI / 360 ) 
			* Math.cos( this.phi * Math.PI / 360 );

		this.object.lookAt( this.target );
		this.object.updateMatrix();
	};
	
	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
	this.domElement.addEventListener( 'mousedown', bind( this, this.onMouseDown ), false );
	this.domElement.addEventListener( 'mousemove', bind( this, this.onMouseMove ), false );
	this.domElement.addEventListener( 'mouseup', bind( this, this.onMouseUp ), false );
	this.domElement.addEventListener( 'mousewheel', bind( this, this.onMouseWheel ), false );

	function bind( scope, fn ) {

		return function () {

			fn.apply( scope, arguments );

		};
	};
};