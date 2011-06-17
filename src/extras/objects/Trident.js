/**
 * @author sroucheray / http://sroucheray.org/
 */

/**
 * @constructor
 * Three axis representing the cartesian coordinates
 * @param xAxisColor {number}
 * @param yAxisColor {number}
 * @param zAxisColor {number}
 * @param showArrows {Boolean}
 * @param length {number}
 * @param scale {number}
 * 
 * @see THREE.Trident.defaultParams
 */
THREE.Trident = function ( params /** Object */) {

	THREE.Object3D.call( this );
	
	var hPi = Math.PI / 2, cone;
	
	params = params || THREE.Trident.defaultParams;
	
	if(params !== THREE.Trident.defaultParams){
		for ( var key in THREE.Trident.defaultParams) {
			if(!params.hasOwnProperty(key)){
				params[key] = THREE.Trident.defaultParams[key];
			}
		}
	}
	
	this.scale = new THREE.Vector3( params.scale, params.scale, params.scale );
	this.addChild( getSegment( new THREE.Vector3(params.length,0,0), params.xAxisColor ) );
	this.addChild( getSegment( new THREE.Vector3(0,params.length,0), params.yAxisColor ) );
	this.addChild( getSegment( new THREE.Vector3(0,0,params.length), params.zAxisColor ) );
	
	if(params.showArrows){
		cone = getCone(params.xAxisColor);
		cone.rotation.y = - hPi;
		cone.position.x = params.length;
		this.addChild( cone );
		
		cone = getCone(params.yAxisColor);
		cone.rotation.x = hPi;
		cone.position.y = params.length;
		this.addChild( cone );
		
		cone = getCone(params.zAxisColor);
		cone.rotation.y = Math.PI;
		cone.position.z = params.length;
		this.addChild( cone );
	}

	function getCone ( color ) {
		//0.1 required to get a cone with a mapped bottom face
		return new THREE.Mesh( new THREE.CylinderGeometry( 30, 0.1, params.length / 20, params.length / 5 ), new THREE.MeshBasicMaterial( { color : color } ) );
	}

	function getSegment ( point, color ){
		var geom = new THREE.Geometry();
		geom.vertices = [new THREE.Vertex(), new THREE.Vertex(point)];
		return new THREE.Line( geom, new THREE.LineBasicMaterial( { color : color } ) );
	}
};

THREE.Trident.prototype = new THREE.Object3D();
THREE.Trident.prototype.constructor = THREE.Trident;

THREE.Trident.defaultParams = {
		xAxisColor : 0xFF0000,
		yAxisColor : 0x00FF00,
		zAxisColor : 0x0000FF,
		showArrows : true,
		length : 100,
		scale : 1
};
