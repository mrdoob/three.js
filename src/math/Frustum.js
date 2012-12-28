/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author bhouston / http://exocortex.com
 */

THREE.Frustum = function ( p0, p1, p2, p3, p4, p5 ) {

	this.planes = [

		( p0 !== undefined ) ? p0 : new THREE.Plane(),
		( p1 !== undefined ) ? p1 : new THREE.Plane(),
		( p2 !== undefined ) ? p2 : new THREE.Plane(),
		( p3 !== undefined ) ? p3 : new THREE.Plane(),
		( p4 !== undefined ) ? p4 : new THREE.Plane(),
		( p5 !== undefined ) ? p5 : new THREE.Plane()

	];

};

THREE.Frustum.prototype = {

	set: function ( p0, p1, p2, p3, p4, p5 ) {

		this.planes[0].copy( p0 );
		this.planes[1].copy( p1 );
		this.planes[2].copy( p2 );
		this.planes[3].copy( p3 );
		this.planes[4].copy( p4 );
		this.planes[5].copy( p5 );
		
		return this;	

	},

	copy: function ( frustum ) {

		for( var i = 0; i < 6; i ++ ) {

			this.planes[i].copy( frustum.planes[i] );

		}

		return this;	

	},

	setFromMatrix: function ( m ) {

		var planes = this.planes;

		var me = m.elements;
		var me0 = me[0], me1 = me[1], me2 = me[2], me3 = me[3];
		var me4 = me[4], me5 = me[5], me6 = me[6], me7 = me[7];
		var me8 = me[8], me9 = me[9], me10 = me[10], me11 = me[11];
		var me12 = me[12], me13 = me[13], me14 = me[14], me15 = me[15];

		planes[ 0 ].setComponents( me3 - me0, me7 - me4, me11 - me8, me15 - me12 );
		planes[ 1 ].setComponents( me3 + me0, me7 + me4, me11 + me8, me15 + me12 );
		planes[ 2 ].setComponents( me3 + me1, me7 + me5, me11 + me9, me15 + me13 );
		planes[ 3 ].setComponents( me3 - me1, me7 - me5, me11 - me9, me15 - me13 );
		planes[ 4 ].setComponents( me3 - me2, me7 - me6, me11 - me10, me15 - me14 );
		planes[ 5 ].setComponents( me3 + me2, me7 + me6, me11 + me10, me15 + me14 );

		for ( var i = 0; i < 6; i ++ ) {

			planes[ i ].normalize();

		}

		return this;

	},

	contains: function ( object ) {

		var planes = this.planes;

		var matrix = object.matrixWorld;
		var matrixPosition = matrix.getPosition();
		var radius = - object.geometry.boundingSphere.radius * matrix.getMaxScaleOnAxis();

		var distance = 0.0;

		for ( var i = 0; i < 6; i ++ ) {

			distance = planes[ i ].distanceToPoint( matrixPosition );
			if ( distance <= radius ) return false;

		}

		return true;

	},

	containsSphere: function ( sphere ) {
		
		for ( var i = 0; i < 6; i ++ ) {

			var distance = this.planes[ i ].distanceToPoint( sphere.center );

			if( distance <= sphere.radius ) {

				return false;

			}

		}

		return true;

	},

	containsPoint: function ( point ) {
		
		for ( var i = 0; i < 6; i ++ ) {

			if( this.planes[ i ].distanceToPoint( point ) < 0 ) {

				return false;

			}

		}

		return true;

	},

	containsAnyPoints: function ( points ) {

		var p0 = this.planes[ 0 ];
		var p1 = this.planes[ 1 ];
		var p2 = this.planes[ 2 ];
		var p3 = this.planes[ 3 ];
		var p4 = this.planes[ 4 ];
		var p5 = this.planes[ 5 ];
			
		for( var j = 0, jl = points.length; j < jl; j ++ ) {

			var pt = points[j];

			if(
				( p0.distanceToPoint( pt ) >= 0 ) && 
				( p1.distanceToPoint( pt ) >= 0 ) && 
				( p2.distanceToPoint( pt ) >= 0 ) && 
				( p3.distanceToPoint( pt ) >= 0 ) && 
				( p4.distanceToPoint( pt ) >= 0 ) && 
				( p5.distanceToPoint( pt ) >= 0 )
				) {

				return true;

			}

		}

		return false;
	},

	transform: function ( matrix, optionalNormalMatrix ) {

		optionalNormalMatrix = optionalNormalMatrix || new THREE.Matrix3().getInverse( matrix ).transpose();

		for( var i = 0; i < 6; i ++ ) {

			this.planes[i].transform( matrix, optionalNormalMatrix );

		}

		return this;
		
	},

	clone: function () {

		return new THREE.Frustum(
			this.planes[0], this.planes[1], this.planes[2], 
			this.planes[3], this.planes[4], this.planes[5] );

	}

};

