/**
 * @author mr.doob / http://mrdoob.com/
 * based on Papervision3D's Plane.as
 */

var Plane = function ( width, height, segments_width, segments_height ) {

	THREE.Geometry.call( this );

	var scope = this,
	width_half = width / 2,
	height_half = height / 2,
	gridX = segments_width || 1,
	gridY = segments_height || 1,
	gridX1 = gridX + 1,
	gridY1 = gridY + 1,
	segment_width = width / gridX,
	segment_height = height / gridY;


	for(var iy = 0; iy < gridY1; iy++) {

		for( var ix = 0; ix < gridX1; ix++ ) {

			var x = ix * segment_width - width_half;
			var y = iy * segment_height - height_half;

			this.vertices.push( new THREE.Vertex( new THREE.Vector3( x, -y, 0 ) ) );

		}

	}

	for(  iy = 0; iy < gridY; iy++ ) {

		for( ix = 0; ix < gridX; ix++ ) {

			var a = ix + gridX1 * iy;
			var b = ix + gridX1 * ( iy + 1 );
			var c = ( ix + 1 ) + gridX1 * iy;

			this.faces.push( new THREE.Face3( a, b, c ) );
			this.uvs.push( [
						new THREE.Vector2( ix / gridX, iy / gridY ),
						new THREE.Vector2( ix / gridX, ( iy + 1 ) / gridY ),
						new THREE.Vector2( ( ix + 1 ) / gridX, iy / gridY )
					] );

			a = ( ix + 1 ) + gridX1 * ( iy + 1 );
			b = ( ix + 1 ) + gridX1 * iy;
			c = ix + gridX1 * ( iy + 1 );

			this.faces.push( new THREE.Face3( a, b, c ) );
			this.uvs.push( [
						new THREE.Vector2( ( ix + 1 ) / gridX, ( iy + 1 ) / gridY ),
						new THREE.Vector2( ( ix + 1 ) / gridX, iy / gridY ),
						new THREE.Vector2( ix / gridX, ( iy + 1 ) / gridY )
					] );

		}

	}

}

Plane.prototype = new THREE.Geometry();
Plane.prototype.constructor = Plane;
