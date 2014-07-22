/**
 * @author Vildanov Almaz
 * based on https://github.com/mrdoob/three.js/blob/master/src/extras/geometries/TextGeometry.js
 */
 
/*	Usage Examples

var A = new THREE.Vector2( -50, 0 );
var B = new THREE.Vector2( 30, 10 );
var C = new THREE.Vector2( 20, 50 );
var D = new THREE.Vector2( -20, 60 );
var E = new THREE.Vector2( -40, 30 );

var geometry = new THREE.PrismGeometry( [A, B, C, D, E], { height: 24 } );
var material = new THREE.MeshPhongMaterial( { color: 0x0033FF } );
var prism1 = new THREE.Mesh( geometry, material );
scene.add( prism1 );

*/

 
THREE.PrismGeometry = function (a, b) {
    b = b || {};
	
	var c = new THREE.Shape();

	( function f( ctx ){

	ctx.moveTo( a[0].x, a[0].y );
	for (var i=1; i < a.length; i++)
		{
			ctx.lineTo( a[i].x, a[i].y );
		}
	ctx.lineTo( a[0].x, a[0].y );

	} )( c);
	
    b.amount = void 0 !== b.height ? b.height : 50;
    void 0 === b.bevelThickness && (b.bevelThickness = 10);
    void 0 === b.bevelSize && (b.bevelSize = 8);
    void 0 === b.bevelEnabled && (b.bevelEnabled = !1);
    THREE.ExtrudeGeometry.call(this, c, b)
};

THREE.PrismGeometry.prototype = Object.create(THREE.ExtrudeGeometry.prototype);