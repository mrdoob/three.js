// Need a way to get real data when instancited by ObjectLoader
THREE.LatheGeometry = ( function() {

	var __threeGeometry = THREE.LatheGeometry;
	var __prototype = THREE.LatheGeometry.prototype;

	var ret = function customGeometry() {

		this.__ctorArguments = arguments;

		__threeGeometry.apply( this, arguments );

	}

	ret.__prototype = __prototype;

	return ret;

} )();

THREE.LatheGeometry.prototype = THREE.LatheGeometry.__prototype;

// As we want to customize UV => customize this.faceVertexUvs[0].push.
THREE.Geometry = ( function() {

	var __threeGeometry = THREE.Geometry;
	var __prototype = THREE.Geometry.prototype;

	var ret = function customGeometry() {

		__threeGeometry.apply( this, arguments );

		var __self = this;

		this.faceVertexUvs[ 0 ].__push = this.faceVertexUvs[ 0 ].push;

		this.faceVertexUvs[ 0 ].push = function() {

			if ( __self.type === 'LatheGeometry' ) {

				// Does anybody asked for custom UV mapping .
				if ( __self.parameters.mapping === undefined ) {

					__self.parameters.mapping = 'index';
					if ( __self.__ctorArguments.length === 1 && __self.__ctorArguments[ 0 ].type === 'LatheGeometry' && __self.__ctorArguments[ 0 ].mapping ) {

						__self.parameters.mapping = __self.__ctorArguments[ 0 ].mapping;

					} else if ( __self.__ctorArguments.length === 5 ) {

						__self.parameters.mapping = __self.__ctorArguments[ 4 ];

					}

				}

				if ( __self.parameters.mapping === 'length' ) {

					var np = __self.parameters.points.length;

					if ( __self.ratioDistance === undefined ) {

						// Compute new V based on length.
						__self.ratioDistance = [ 0 ];
						var distance = 0;

						for ( var i = 1; i < np; i ++ ) {

							var pt1 = __self.parameters.points[ i - 1 ];
							var pt2 = __self.parameters.points[ i ];
							var lgX = pt2.x - pt1.x;
							var lgY = pt2.y - pt1.y;
							distance += Math.sqrt( lgX * lgX + lgY * lgY );
							__self.ratioDistance.push( distance );

						}

						for ( var i = 1; i < __self.parameters.points.length; i ++ ) {

							__self.ratioDistance[ i ] /= distance;

						}

					}

					// Compute control variables.
					var inverseSegments = 1.0 / __self.parameters.segments;
					var i = Math.floor( this.length / ( ( np - 1 ) * 2 ) );
					var k = this.length % ( ( np - 1 ) * 2 );
					var j = Math.floor( k / 2 );

					// Compute UVs.
					var u0 = i * inverseSegments;
					var v0 = __self.ratioDistance[ j ];
					var u1 = u0 + inverseSegments;
					var v1 = __self.ratioDistance[ j + 1 ];

					if ( k % 2 ) {

						this.__push.apply( this, [[
						new THREE.Vector2( u1, v0 ),
						new THREE.Vector2( u1, v1 ),
						new THREE.Vector2( u0, v1 )
						]] );

					} else {

						this.__push.apply( this, [[
						new THREE.Vector2( u0, v0 ),
						new THREE.Vector2( u1, v0 ),
						new THREE.Vector2( u0, v1 )
						]] );

					}

				} else {

					// Standard UVs.
					this.__push.apply( this, arguments );

				}

			}

		}

	}

	ret.__prototype = __prototype;

	return ret;

} )();

THREE.Geometry.prototype = THREE.Geometry.__prototype;
