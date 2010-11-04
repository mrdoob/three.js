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
			
				var i, l, x, y, z;
				
				for( i = 0, l = data.vertices.length/3; i < l; i++ ) {
					
					x = data.vertices[ i*3     ];
					y = data.vertices[ i*3 + 1 ];
					z = data.vertices[ i*3 + 2 ];
					v( x, y, z );
					
				}
			
			}

			function init_uvs() {
			
				var i, l, d, ua, ub, uc, ud, va, vb, vc, vd;
				
				for( i = 0, l = data.uvs_tri.length; i < l; i++ ) {
					
					ua = data.uvs_tri[ i*6     ];
					va = data.uvs_tri[ i*6 + 1 ];
					
					ub = data.uvs_tri[ i*6 + 2 ];
					vb = data.uvs_tri[ i*6 + 3 ];
					
					uc = data.uvs_tri[ i*6 + 4 ];
					vc = data.uvs_tri[ i*6 + 5 ];
					
					uv( ua, va, ub, vb, uc, vc );
					
				}
				
				for( i = 0, l = data.uvs_quad.length; i < l; i++ ) {
					
					ua = data.uvs_quad[ i*8     ];
					va = data.uvs_quad[ i*8 + 1 ];
					
					ub = data.uvs_quad[ i*8 + 2 ];
					vb = data.uvs_quad[ i*8 + 3 ];
					
					uc = data.uvs_quad[ i*8 + 4 ];
					vc = data.uvs_quad[ i*8 + 5 ];
					
					ud = data.uvs_quad[ i*8 + 6 ];
					vd = data.uvs_quad[ i*8 + 7 ];
					
					uv( ua, va, ub, vb, uc, vc, ud, vd );
				
				}
			
			}

			function init_faces() {
			
				var i, l, a, b, c, d, m, na, nb, nc, nd;

				for( i = 0, l = data.triangles.length/4; i < l; i++ ) {
					
					a = data.triangles[ i*4     ];
					b = data.triangles[ i*4 + 1 ];
					c = data.triangles[ i*4 + 2 ];
					
					m = data.triangles[ i*4 + 3 ];
					
					f3( a, b, c, m );
				
				}

				for( i = 0, l = data.triangles_n.length/7; i < l; i++ ) {
					
					a  = data.triangles_n[ i*7     ];
					b  = data.triangles_n[ i*7 + 1 ];
					c  = data.triangles_n[ i*7 + 2 ];
					
					m  = data.triangles_n[ i*7 + 3 ];
					
					na = data.triangles_n[ i*7 + 4 ];
					nb = data.triangles_n[ i*7 + 5 ];
					nc = data.triangles_n[ i*7 + 6 ];
					
					f3n( a, b, c, m, na, nb, nc );
				
				}
				
				for( i = 0, l = data.quads.length/5; i < l; i++ ) {
					
					a = data.quads[ i*5     ];
					b = data.quads[ i*5 + 1 ];
					c = data.quads[ i*5 + 2 ];
					d = data.quads[ i*5 + 3 ];
					
					m = data.quads[ i*5 + 4 ];
					
					f4( a, b, c, d, m );
					
				}

				for( i = 0, l = data.quads_n.length/9; i < l; i++ ) {
					
					a  = data.quads_n[ i*9     ];
					b  = data.quads_n[ i*9 + 1 ];
					c  = data.quads_n[ i*9 + 2 ];
					d  = data.quads_n[ i*9 + 3 ];
					
					m  = data.quads_n[ i*9 + 4 ];
					
					na = data.quads_n[ i*9 + 5 ];
					nb = data.quads_n[ i*9 + 6 ];
					nc = data.quads_n[ i*9 + 7 ];
					nd = data.quads_n[ i*9 + 8 ];
					
					f4n( a, b, c, d, m, na, nb, nc, nd );
				
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

			function f3n( a, b, c, mi, na, nb, nc ) {
				
				var material = scope.materials[ mi ],
					nax = data.normals[ na*3     ],
					nay = data.normals[ na*3 + 1 ],
					naz = data.normals[ na*3 + 2 ],
				
					nbx = data.normals[ nb*3     ],
					nby = data.normals[ nb*3 + 1 ],
					nbz = data.normals[ nb*3 + 2 ],
				
					ncx = data.normals[ nc*3     ],
					ncy = data.normals[ nc*3 + 1 ],
					ncz = data.normals[ nc*3 + 2 ];
				
				scope.faces.push( new THREE.Face3( a, b, c, 
								  [new THREE.Vector3( nax, nay, naz ), new THREE.Vector3( nbx, nby, nbz ), new THREE.Vector3( ncx, ncy, ncz )], 
								  material ) );
				
			}

			function f4n( a, b, c, d, mi, na, nb, nc, nd ) {
				
				var material = scope.materials[ mi ],
					nax = data.normals[ na*3     ],
					nay = data.normals[ na*3 + 1 ],
					naz = data.normals[ na*3 + 2 ],
				
					nbx = data.normals[ nb*3     ],
					nby = data.normals[ nb*3 + 1 ],
					nbz = data.normals[ nb*3 + 2 ],
				
					ncx = data.normals[ nc*3     ],
					ncy = data.normals[ nc*3 + 1 ],
					ncz = data.normals[ nc*3 + 2 ],
				
					ndx = data.normals[ nd*3     ],
					ndy = data.normals[ nd*3 + 1 ],
					ndz = data.normals[ nd*3 + 2 ];
				
				scope.faces.push( new THREE.Face4( a, b, c, d,
								  [new THREE.Vector3( nax, nay, naz ), new THREE.Vector3( nbx, nby, nbz ), new THREE.Vector3( ncx, ncy, ncz ), new THREE.Vector3( ndx, ndy, ndz )], 
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