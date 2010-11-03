/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Loader = function() {
};

THREE.Loader.prototype = {
	
	loadAsync: function( url, callback ) {
		
		var element = document.createElement( 'script' );
		element.type = 'text/javascript';
		element.onload = callback;
		element.src = url;
		document.getElementsByTagName( "head" )[ 0 ].appendChild( element );

	},

	loadWorker: function ( url, callback, urlbase ) {
		
		var s = (new Date).getTime(),
			worker = new Worker( url );

		worker.onmessage = function( event ) {
		
			THREE.Loader.prototype.createModel( event.data, callback, urlbase );
			
		};
		
		worker.postMessage( s );
		
	},

	createModel: function ( data, callback, urlbase ) {
		
		var Model = function ( urlbase ) {
			
			var scope = this;

			THREE.Geometry.call(this);
			
			init_materials();
			init_vertices();
			init_uvs();
			init_faces();
			
			this.computeCentroids();
			this.computeNormals();
			
			function init_vertices() {
			
				var i, l, d;
				
				for( i = 0, l = data.vertices.length; i < l; i++ ) {
					
					d = data.vertices[i];
					v( d[0], d[1], d[2] );
					
				}
			
			}

			function init_uvs() {
			
				var i, l, d;
				
				for( i = 0, l = data.uvs.length; i < l; i++ ) {
					
					d = data.uvs[i];
					if ( d.length == 6 ) {
						
						uv( d[0], d[1], d[2], d[3], d[4], d[5] );
						
					} else if ( d.length == 8 ) {
					
						uv( d[0], d[1], d[2], d[3], d[4], d[5], d[6], d[7] );
					
					}
						
				}
			
			}

			function init_faces() {
			
				var i, l, d;
				
				for( i = 0, l = data.faces.length; i < l; i++ ) {
					
					d = data.faces[i];
					
					if ( d.length == 4 ) {
						
						f3( d[0], d[1], d[2], d[3] );
						
					} else if ( d.length == 5 ) {
					
						f4( d[0], d[1], d[2], d[3], d[4] );
					
					} else if ( d.length == 7 ) {
					
						f3n( d[0], d[1], d[2], d[3], d[4], d[5], d[6] );
					
					} else if ( d.length == 9 ) {
					
						f4n( d[0], d[1], d[2], d[3], d[4], d[5], d[6], d[7], d[8] );
					
					}
						
				}
			
			}
			
			function v( x, y, z ) {
				
				scope.vertices.push( new THREE.Vertex( new THREE.Vector3( x, y, z ) ) );
				
			}

			function f3( a, b, c, mi ) {
				
				var material = scope.materials[ mi ];
				scope.faces.push( new THREE.Face3( a, b, c, null, material ) );
				
			}

			function f4( a, b, c, d, mi ) {
				
				var material = scope.materials[ mi ];
				scope.faces.push( new THREE.Face4( a, b, c, d, null, material ) );
				
			}

			function f3n( a, b, c, mi, n1, n2, n3 ) {
				
				var material = scope.materials[ mi ],
					n1x = data.normals[n1][0],
					n1y = data.normals[n1][1],
					n1z = data.normals[n1][2],
					n2x = data.normals[n2][0],
					n2y = data.normals[n2][1],
					n2z = data.normals[n2][2],
					n3x = data.normals[n3][0],
					n3y = data.normals[n3][1],
					n3z = data.normals[n3][2];
				
				scope.faces.push( new THREE.Face3( a, b, c, 
								  [new THREE.Vector3( n1x, n1y, n1z ), new THREE.Vector3( n2x, n2y, n2z ), new THREE.Vector3( n3x, n3y, n3z )], 
								  material ) );
				
			}

			function f4n( a, b, c, d, mi, n1, n2, n3, n4 ) {
				
				var material = scope.materials[ mi ],
					n1x = data.normals[n1][0],
					n1y = data.normals[n1][1],
					n1z = data.normals[n1][2],
					n2x = data.normals[n2][0],
					n2y = data.normals[n2][1],
					n2z = data.normals[n2][2],
					n3x = data.normals[n3][0],
					n3y = data.normals[n3][1],
					n3z = data.normals[n3][2],
					n4x = data.normals[n4][0],
					n4y = data.normals[n4][1],
					n4z = data.normals[n4][2];
				
				scope.faces.push( new THREE.Face4( a, b, c, d,
								  [new THREE.Vector3( n1x, n1y, n1z ), new THREE.Vector3( n2x, n2y, n2z ), new THREE.Vector3( n3x, n3y, n3z ), new THREE.Vector3( n4x, n4y, n4z )], 
								  material ) );
				
			}

			function uv( u1, v1, u2, v2, u3, v3, u4, v4 ) {
				
				var uv = [];
				uv.push( new THREE.UV( u1, v1 ) );
				uv.push( new THREE.UV( u2, v2 ) );
				uv.push( new THREE.UV( u3, v3 ) );
				if ( u4 && v4 ) uv.push( new THREE.UV( u4, v4 ) );
				scope.uvs.push( uv );
				
			}
			
			function init_materials() {
				
				scope.materials = [];
				for( var i = 0; i < data.materials.length; ++i ) {
					scope.materials[i] = [ create_material( data.materials[i], urlbase ) ];
				}
				
			}
		
			function is_pow2( n ) {
				
				var l = Math.log(n) / Math.LN2;
				return Math.floor(l) == l;
				
			}
			
			function nearest_pow2(n) {
				
				var l = Math.log(n) / Math.LN2;
				return Math.pow( 2, Math.round(l) );
				
			}
			
			function create_material( m ) {
				
				var material, texture, image, color;
				
				if( m.map_diffuse && urlbase ) {
					
					texture = document.createElement( 'canvas' );
					material = new THREE.MeshBitmapMaterial( texture );
					
					image = new Image();
					image.onload = function () {
						
						if ( !is_pow2( this.width ) || !is_pow2( this.height ) ) {
						
							var w = nearest_pow2( this.width ),
								h = nearest_pow2( this.height );
							
							material.bitmap.width = w;
							material.bitmap.height = h;
							material.bitmap.getContext("2d").drawImage( this, 0, 0, w, h );
							
						} else {
							
							material.bitmap = this;
							
						}
						
						material.loaded = 1;
						
					};
					
					image.src = urlbase + "/" + m.map_diffuse;
					
				} else if( m.col_diffuse ) {
					
					color = (m.col_diffuse[0]*255 << 16) + (m.col_diffuse[1]*255 << 8) + m.col_diffuse[2]*255;
					material = new THREE.MeshColorFillMaterial( color, m.transparency );
					
				} else if( m.a_dbg_color ) {
					
					material = new THREE.MeshColorFillMaterial( m.a_dbg_color );
					
				} else {
					
					material = new THREE.MeshColorFillMaterial( 0xffeeeeee );
					
				}

				return material;
			}
			
		}

		Model.prototype = new THREE.Geometry();
		Model.prototype.constructor = Model;
		
		callback( new Model( urlbase ) );

	}
	
};