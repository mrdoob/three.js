/**
 * @author wivlaro / http://wvr.me.uk/
 */

THREE.OcclusionCuller = function(parameters) {

	parameters = parameters || {};
	
	this.info = {
	
		tested: 0,
		culled: 0,
		occluders: 0,
		fillRatio: 0

	};

	var _occlusionBuffer = null,
		_occlusionVerticesTemp = null,
		_occlusionBufferWidth,
		_occlusionBufferHeight;
	
	this.occlusionBufferMaxFill = parameters.occlusionBufferMaxFill !== undefined ? parameters.occlusionBufferMaxFill : 0.99;
	this.occlusionPixelTolerance = parameters.occlusionPixelTolerance !== undefined ? parameters.occlusionPixelTolerance : 4;
	
	var pa = new THREE.Vector3(),
		pb = new THREE.Vector3(),
		pc = new THREE.Vector3(),
		_objectProjScreenMatrix = new THREE.Matrix4();
	
	this.cullObjects = function ( renderList, projScreenMatrix, viewportWidth, viewportHeight ) {

		var info = this.info;
		
		info.tested = 0;
		info.culled = 0;
		info.fillRatio = 0;
		info.occluders = 0;

		var webglObject, object, isOccluded, isOccluder;

		_occlusionBufferWidth = Math.ceil(viewportWidth / this.occlusionPixelTolerance) | 0;
		_occlusionBufferHeight = Math.ceil(viewportHeight / this.occlusionPixelTolerance) | 0;

		var occlusionBufferSize = _occlusionBufferWidth * _occlusionBufferHeight;
		var occlusionBufferFilled = 0;
		var occlusionBufferFillThreshold = ( this.occlusionBufferMaxFill * occlusionBufferSize ) | 0;

		//Size incorrect, reallocate
		if ( _occlusionBuffer === null || _occlusionBuffer.length !== occlusionBufferSize ) {

			_occlusionBuffer = new Uint16Array( occlusionBufferSize );

		}

		if ( ! _occlusionVerticesTemp ) {

			_occlusionVerticesTemp = new Float32Array(48);

		}

		function processTriangleFill( pa, pb, pc, buff, buffWidth, buffHeight, occluder, occludable ) {

			//TODO: Candidate for asm.js ?

			//Check off-screen
			if (  ( pa.x <= -1 && pb.x <= -1 && pc.x <= -1 ) || 
				 ( pa.y <= -1 && pb.y <= -1 && pc.y <= -1 ) || 
				 ( pa.x >= 1 && pb.x >= 1 && pc.x >= 1 ) || 
				 ( pa.y >= 1 && pb.y >= 1 && pc.y >= 1 )  ) {

				return true;

			}

			//Check winding - skip back-facing triangles
			var vabx = pb.x - pa.x;
			var vaby = pb.y - pa.y;
			var vacx = pc.x - pa.x;
			var vacy = pc.y - pa.y;
			if ( vabx * vacy <= vaby * vacx ) return true;

			var temp;
			if ( pa.y > pb.y ) {
				if ( pc.y > pa.y ) {
					temp = pa;
					pa = pc;
					pc = temp;
				}
			}
			else {
				if ( pb.y > pc.y ) {
					temp = pa;
					pa = pb;
					pb = temp;
				}
				else {
					temp = pa;
					pa = pc;
					pc = temp;
				}
			}
			if ( pc.y > pb.y ) {
				temp = pb;
				pb = pc;
				pc = temp;
			}

			var halfWidth = buffWidth >> 1;
			var halfHeight = buffHeight >> 1;

			//Convert to screen coordinates
			var pax = ( 1 + pa.x ) * halfWidth,
				pay = ( 1 - pa.y ) * halfHeight,
				pbx = ( 1 + pb.x ) * halfWidth,
				pby = ( 1 - pb.y ) * halfHeight,
				pcx = ( 1 + pc.x ) * halfWidth,
				pcy = ( 1 - pc.y ) * halfHeight,
				paz = ( pa.z * 0x10000 ) | 0,
				pbz = ( pb.z * 0x10000 ) | 0,
				pcz = ( pc.z * 0x10000 ) | 0;

			var max_z = paz, min_z = paz;
			if ( pbz > max_z ) max_z = pbz; else if ( pbz < min_z ) min_z = pbz;
			if ( pcz > max_z ) max_z = pcz; else if ( pcz < min_z ) min_z = pcz;

			function fillRow( buff, yoff, x, xr, max_z ) {
				//A more conservative cull mode achieved by not filling the edges
	//				x++;xr--;
				if ( x < 0 ) x = 0;
				if ( xr >= buffWidth ) xr = buffWidth;

				if ( x < xr ) {

					//convert x/xr to indices
					x += yoff;
					xr += yoff;

					for ( var z; x !== xr; x++ ) {

						//If closer than occlusionBuffer value:
						z = buff[ x ];

						if ( max_z < z ) {

							if ( z === 0xffff ) {

								occlusionBufferFilled++;

							}

							//Set finest occlusionBuffers Z value
							buff[x] = max_z;

						}

					}

				}

			}

			function testRow( buff, yoff, x, xr, min_z ) {

				if ( x < 0 ) x = 0;
				if ( xr >= buffWidth ) xr = buffWidth;

				if ( x < xr ) {

					//convert x/xr to indices
					x += yoff;
					xr += yoff;

					//If all vertices further than Z value, object is occluded!
					for (; x !== xr; x++ ) {

						//If any vertex closer than occlusionBuffer point, stop testing, we have to draw
						if ( min_z < buff[x] ) return false;

					}

				}

				return true;
			}

			function fillAndTestRow( buff, yoff, x, xr, min_z, max_z ) {

				if ( x < 0 ) x = 0;
				if ( xr >= buffWidth ) xr = buffWidth;

				var isOccluded = true;

				if ( x < xr ) {

					//convert x/xr to indices
					x += yoff;
					xr += yoff;

					for (; x !== xr; x++ ) {

						//If closer than occlusionBuffer value:
						if ( min_z < buff[x] ) {

							isOccluded = false;
							//Switch to fill mode
							//A more conservative cull mode achieved by not filling the edges
	//							x++;xr--;
							break;

						}

					}

					if ( x < xr ) {

						for ( var z; x !== xr; x++ ) {

							//If closer than occlusionBuffer value:
							z = buff[x];
							if ( max_z < z ) {

								if ( z === 0xffff ) {

									occlusionBufferFilled++;

								}

								//Set finest occlusionBuffers Z value
								buff[x] = max_z;

							}

						}

					}

				}

				return isOccluded;
			}

			//Scan triangle from pay -> pby
			var y, yoff, xl16, xr16, isOccluded = true;

			function doScan( ystop ) {

				if ( occluder ) {

					if ( occludable ) {

						for (; y < ystop; yoff += buffWidth, y++, xl16 += grad_l16, xr16 += grad_r16 ) {

							if ( ! fillAndTestRow( buff, yoff, xl16 >> 16, xr16 >> 16, min_z, max_z )  ) {

								//Oh well, not occluded, the fill will continue below
								isOccluded = false;
								break;

							}

						}

					}

					for (; y < ystop; yoff += buffWidth, y++, xl16 += grad_l16, xr16 += grad_r16 ) {

						fillRow( buff, yoff, xl16 >> 16, xr16 >> 16, max_z );

					}
				}
				else if ( occludable ) {

					for (; y < ystop; yoff += buffWidth, y++, xl16 += grad_l16, xr16 += grad_r16 ) {

						if ( ! testRow( buff, yoff, xl16 >> 16, xr16 >> 16, min_z )  ) {

							isOccluded = false;
							break;

						}

					}

				}

			}

			var y0 = pay|0;
			var y1 = pby|0;

			vabx = pbx - pax;
			vaby = pby - pay;
			vacx = pcx - pax;
			vacy = pcy - pay;

			//Figure out left/right
			var grad_ab16 = ( +vabx * +0x10000 / +vaby ) | 0;
			var grad_ac16 = ( +vacx * +0x10000 / +vacy ) | 0;
			var grad_l16, grad_r16;
			if ( grad_ab16 < grad_ac16 ) {
				grad_l16 = grad_ab16;
				grad_r16 = grad_ac16;
			}
			else {
				grad_r16 = grad_ab16;
				grad_l16 = grad_ac16;
			}

			if ( y1 >= 0 ) {
				if ( y0 >= 0 ) {

					y = ( y0 | 0 );
					yoff = ( y0 | 0 ) * buffWidth;
					xl16 = pax << 16;
					xr16 = pax << 16;

				}
				else {

					//Fast-forward to 0
					y=0;
					yoff = 0;
					xl16 = ( pax << 16 ) - ( y0 * grad_l16 );
					xr16 = ( pax << 16 ) - ( y0 * grad_r16 );

				}

				if ( y1 === y0 ) {

					if ( pax < pbx ) {

						xr16 = pbx << 16;
						grad_r16 = (  ( pcx - pbx ) * 0x10000 / ( pcy - pby )  ) | 0;
						grad_l16 = grad_ac16;

					}
					else {

						xl16 = pbx << 16;
						grad_l16 = (  ( pcx - pbx ) * 0x10000 / ( pcy - pby )  ) | 0;
						grad_r16 = grad_ac16;

					}

				}
				else {

					doScan( y1 > buffHeight ? buffHeight : ( y1|0 )  );

					if ( grad_ab16 < grad_ac16 ) {

						grad_l16 = (  ( pcx - pbx ) * 0x10000 / ( pcy - pby )  ) | 0;
						grad_r16 = grad_ac16;
						xl16 = pbx << 16;

					}
					else {

						grad_r16 = (  ( pcx - pbx ) * 0x10000 / ( pcy - pby )  ) | 0;
						grad_l16 = grad_ac16;
						xr16 = pbx << 16;

					}

				}

			}
			else if ( y1 < buffWidth ) {

				//Fast forward to 0
				if ( grad_ab16 < grad_ac16 ) {

					grad_l16 = (  ( pcx - pbx ) * 0x10000 / ( pcy - pby )  ) | 0;
					grad_r16 = grad_ac16;
					xl16 = ( pbx << 16 ) - y1 * grad_l16;
					xr16 = ( pax << 16 ) - y0 * grad_r16;

				}
				else {

					grad_r16 = (  ( pcx - pbx ) * 0x10000 / ( pcy - pby )  ) | 0;
					grad_l16 = grad_ac16;
					xl16 = ( pax << 16 ) - y0 * grad_l16;
					xr16 = ( pbx << 16 ) - y1 * grad_r16;

				}
				yoff = 0;
				y=0;
			}

			if (y1 < buffHeight) {
				doScan(pcy > buffHeight ? buffHeight : (pcy|0));
			}

			return isOccluded;

		}

		function testTriangleEdges(pa, pb, pc, buff, buffWidth, buffHeight) {

			//TODO: Candidate for asm.js ?

			//Check off-screen
			if (( pa.x <= -1 && pb.x <= -1 && pc.x <= -1 ) || 
				( pa.y <= -1 && pb.y <= -1 && pc.y <= -1 ) || 
				( pa.x >= 1 && pb.x >= 1 && pc.x >= 1 ) || 
				( pa.y >= 1 && pb.y >= 1 && pc.y >= 1 ) ) {

				return true;

			}

			//Check winding - skip back-facing triangles
			var vabx = pb.x - pa.x;
			var vaby = pb.y - pa.y;
			var vacx = pc.x - pa.x;
			var vacy = pc.y - pa.y;
			if ( vabx * vacy <= vaby * vacx ) return true;

			var halfWidth = buffWidth >> 1;
			var halfHeight = buffHeight >> 1;

			//Convert to screen coordinates
			var pax = ( ( 1 + pa.x ) * halfWidth  ) | 0,
				pay = ( ( 1 - pa.y ) * halfHeight ) | 0,
				pbx = ( ( 1 + pb.x ) * halfWidth  ) | 0,
				pby = ( ( 1 - pb.y ) * halfHeight ) | 0,
				pcx = ( ( 1 + pc.x ) * halfWidth  ) | 0,
				pcy = ( ( 1 - pc.y ) * halfHeight ) | 0,
				paz = ( pa.z * 0x10000 ) | 0,
				pbz = ( pb.z * 0x10000 ) | 0,
				pcz = ( pc.z * 0x10000 ) | 0;

			function scanLine( x, y, bx, by, min_z ) {

				//Trivial, completely off-screen line cases

				if ( x < 0 && bx < 0 ) return true;
				if ( y < 0 && by < 0 ) return true;
				if ( x > buffWidth && bx > buffWidth ) return true;
				if ( y > buffHeight && by > buffHeight ) return true;

				var dx, dy, sx, sy, syoff, err, e2;

				var yoff = y * buffWidth;

				//Bresenham-based line walker

				if ( x < bx ) {

					dx = bx - x;
					sx = 1;

				}
				else {

					dx = x - bx;
					sx = -1;

				}

				if ( y < by ) {

					dy = by - y;
					sy = 1;
					syoff = buffWidth;

				}
				else {

					dy = y - by;
					sy = -1;
					syoff = -buffWidth;

				}

				err = dx - dy;

				var onScreen = x >= 0 && x < buffWidth && y >= 0 && y < buffHeight;

				while (true) {

					if ( onScreen && min_z < buff[ yoff + x ] ) {

	//						buff[ yoff + x ] = 0xfffe;
						return false;

					}

					if ( x === bx && y === by ) return true;

					e2 = err<<1;
					if ( e2 > -dy ) {

						err -= dy;
						x += sx;

						if ( onScreen ) {

							if ( x < 0 || x >= buffWidth ) return true;

						}
						else if ( x >= 0 && x < buffWidth ) {

							onScreen = true;

						}

					}
					if ( e2 < dx ) {

						err += dx;
						y += sy;
						yoff += syoff;

						if ( onScreen ) {

							if ( y < 0 || y >= buffHeight ) return true;

						}
						else if ( y >= 0 && y < buffHeight ) {

							onScreen = true;

						}

					}
				}

			}

			if ( ! scanLine( pax, pay, pbx, pby, paz < pbz ? paz : pbz ) ) return false;
			if ( ! scanLine( pbx, pby, pcx, pcy, pbz < pcz ? pbz : pcz ) ) return false;
			if ( ! scanLine( pcx, pcy, pax, pay, pcz < paz ? pcz : paz ) ) return false;

			return true;
		}


		for (var i = renderList.length - 1; i !== -1; i--) {

			webglObject = renderList[ i ];
			object = webglObject.object;

			//isOccluded is true until we can prove we have to render the object
			isOccluded = object.occludable && occlusionBufferFilled > 0;
			isOccluder = object.occluder && occlusionBufferFilled < occlusionBufferFillThreshold;

			if ( webglObject.render && ( isOccluded || isOccluder ) ) {

				object.updateMatrixWorld();

				_objectProjScreenMatrix.multiplyMatrices( projScreenMatrix, object.matrixWorld );

				if ( occlusionBufferFilled === 0 ) {

					for (var j = 0, bufferLength = _occlusionBuffer.length; j < bufferLength ; j++ ) {

						_occlusionBuffer[j] = 0xffff;

					}

				}

				function processTrianglesIndexed( vertexArray, faceArray, edgeMode ) {

					if ( _occlusionVerticesTemp.length < vertexArray.length ) {

						_occlusionVerticesTemp = new Float32Array( vertexArray.length );

					}

					//Project vertices into view space
					for (var j = 0, numElements = vertexArray.length; j < numElements && ( isOccluded || isOccluder ); j += 3) {

						//Project triangle corners, skip near the near/far planes for simplicity
						pa.set( vertexArray[ j ], vertexArray[ j + 1 ], vertexArray[ j + 2 ] ).applyProjection( _objectProjScreenMatrix );

						//Object crosses the near/far plane, never occluded
						if ( pa.z <= 0 || pa.z >= 1 ) {

							isOccluded = false;

						}

						_occlusionVerticesTemp[ j ] = pa.x;
						_occlusionVerticesTemp[ j + 1 ] = pa.y;
						_occlusionVerticesTemp[ j + 2 ] = pa.z;

					}

					for (var j = 0, numElements = faceArray.length, voff; j < numElements && ( isOccluded || isOccluder ); ) {

						voff = faceArray[ j++ ] * 3;
						pa.set(_occlusionVerticesTemp[ voff++ ], _occlusionVerticesTemp[ voff++ ], _occlusionVerticesTemp[ voff++ ]);

						voff = faceArray[ j++ ] * 3;
						pb.set(_occlusionVerticesTemp[ voff++ ], _occlusionVerticesTemp[ voff++ ], _occlusionVerticesTemp[ voff++ ]);

						voff = faceArray[ j++ ] * 3;
						pc.set(_occlusionVerticesTemp[ voff++ ], _occlusionVerticesTemp[ voff++ ], _occlusionVerticesTemp[ voff++ ]);

						if ( isOccluder || ! edgeMode ) {

							if ( ! processTriangleFill(pa, pb, pc, _occlusionBuffer, _occlusionBufferWidth, _occlusionBufferHeight, isOccluder, isOccluded ) ) {

								isOccluded = false;

							}

						}
						else {

							if ( ! testTriangleEdges(pa, pb, pc, _occlusionBuffer, _occlusionBufferWidth, _occlusionBufferHeight ) ) {

								isOccluded = false;

							}

						}

					}

				}

				function processTriangles( vertexArray, edgeMode ) {

					for ( var j = 0, numElements = vertexArray.length; j < numElements && ( isOccluded || isOccluder ); j += 9 ) {

						//Project triangle corners, skip triangles overlapping the near/far planes for simplicity
						pa.set( vertexArray[ j   ], vertexArray[ j+1 ], vertexArray[ j+2 ] ).applyProjection(_objectProjScreenMatrix );
						if ( pa.z <= 0 || pa.z >= 1 ) { isOccluded = false; continue; }

						pb.set( vertexArray[ j+3 ], vertexArray[ j+4 ], vertexArray[ j+5 ] ).applyProjection( _objectProjScreenMatrix );
						if ( pb.z <= 0 || pb.z >= 1 ) { isOccluded = false; continue; }

						pc.set( vertexArray[ j+6 ], vertexArray[ j+7 ], vertexArray[ j+8 ] ).applyProjection( _objectProjScreenMatrix );
						if ( pc.z <= 0 || pc.z >= 1 ) { isOccluded = false; continue; }


						if ( isOccluder || !edgeMode ) {

							if ( ! processTriangleFill( pa, pb, pc, _occlusionBuffer, _occlusionBufferWidth, _occlusionBufferHeight, isOccluder, isOccluded ) ) {

								isOccluded = false;

							}

						}
						else {

							if ( ! testTriangleEdges( pa, pb, pc, _occlusionBuffer, _occlusionBufferWidth, _occlusionBufferHeight ) ) {

								isOccluded = false;

							}

						}

					}

				}

				function processVertices(vertexArray, numElements) {

					if (typeof numElements === 'undefined') {

						numElements = vertexArray.length;

					}

					//Project vertices into view space
					for (var j = 0; j < numElements && isOccluded; j += 3) {

						//Project triangle corners, skip near the near/far planes for simplicity
						pa.set(vertexArray[ j ], vertexArray[ j + 1 ], vertexArray[ j + 2 ]).applyProjection( _objectProjScreenMatrix );

						//Object crosses the near plane, never occluded
						if ( pa.z <= 0 ) {

							isOccluded = false;

						}
						//Check on-screen
						else if (pa.x >= -1 && pa.y >= -1 && pa.x < 1 && pa.y < 1 ){

							var halfWidth = _occlusionBufferWidth >> 1;
							var halfHeight = _occlusionBufferHeight >> 1;

							//Convert to screen coordinates
							var sx = ( ( 1 + pa.x ) * halfWidth ) | 0,
								sy = ( ( 1 - pa.y ) * halfHeight ) | 0,
								sz = ( pa.z*0x10000 ) | 0;

							var buff = _occlusionBuffer[ sy * _occlusionBufferWidth + sx ];

							if (sz < buff) {

								isOccluded = false;

							}

						}

					}

				}

				function processAABBPoints( geometry ) {

					if ( geometry.boundingBox === null ) {

						geometry.computeBoundingBox();

					}

					var bbMax = geometry.boundingBox.max;
					var bbMin = geometry.boundingBox.min;

					var j = 0;

					_occlusionVerticesTemp[ j++ ] = bbMin.x;
					_occlusionVerticesTemp[ j++ ] = bbMin.y;
					_occlusionVerticesTemp[ j++ ] = bbMin.z;

					_occlusionVerticesTemp[ j++ ] = bbMax.x;
					_occlusionVerticesTemp[ j++ ] = bbMin.y;
					_occlusionVerticesTemp[ j++ ] = bbMin.z;

					_occlusionVerticesTemp[ j++ ] = bbMin.x;
					_occlusionVerticesTemp[ j++ ] = bbMax.y;
					_occlusionVerticesTemp[ j++ ] = bbMin.z;

					_occlusionVerticesTemp[ j++ ] = bbMax.x;
					_occlusionVerticesTemp[ j++ ] = bbMax.y;
					_occlusionVerticesTemp[ j++ ] = bbMin.z;

					_occlusionVerticesTemp[ j++ ] = bbMin.x;
					_occlusionVerticesTemp[ j++ ] = bbMin.y;
					_occlusionVerticesTemp[ j++ ] = bbMax.z;

					_occlusionVerticesTemp[ j++ ] = bbMax.x;
					_occlusionVerticesTemp[ j++ ] = bbMin.y;
					_occlusionVerticesTemp[ j++ ] = bbMax.z;

					_occlusionVerticesTemp[ j++ ] = bbMin.x;
					_occlusionVerticesTemp[ j++ ] = bbMax.y;
					_occlusionVerticesTemp[ j++ ] = bbMax.z;

					_occlusionVerticesTemp[ j++ ] = bbMax.x;
					_occlusionVerticesTemp[ j++ ] = bbMax.y;
					_occlusionVerticesTemp[ j++ ] = bbMax.z;

					processVertices( _occlusionVerticesTemp, j );

				}

				if ( object instanceof THREE.Mesh && object.geometry instanceof THREE.BufferGeometry ) {

					if ( isOccluder || ( isOccluded && ( object.occludable === THREE.FillOccludable || object.occludable === THREE.EdgeOccludable ) ) ) {

						if ( isOccluded ) {

							info.tested++;

						}

						if ( object.geometry.attributes.index ) {

							processTrianglesIndexed( object.geometry.attributes.position.array, object.geometry.attributes.index.array, object.occludable === THREE.EdgeOccludable );

						}
						else {

							processTriangles( object.geometry.attributes.position.array, object.occludable === THREE.EdgeOccludable );

						}

						if ( isOccluder ) {

							info.occluders++;

						}

					}
					else if ( isOccluded ) {

						if ( object.occludable === THREE.VertexOccludable ) {

							info.tested++;

							processVertices( object.geometry.attributes.position.array );

						}
						else if ( object.occludable === THREE.AABBOccludable ) {

							info.tested++;

							processAABBPoints( object.geometry );

						}

					}

				}
				else if ( object instanceof THREE.Mesh ) {

					if ( isOccluder || ( isOccluded && ( object.occludable === THREE.FillOccludable || object.occludable === THREE.EdgeOccludable ) ) ) {

						if ( isOccluded ) {

							info.tested++;

						}

						for ( var g in object.geometry.geometryGroups ) {

							var geometryGroup = object.geometry.geometryGroups[ g ];
							processTrianglesIndexed( geometryGroup.__vertexArray, geometryGroup.__faceArray, object.occludable === THREE.EdgeOccludable );

						}

						if ( isOccluder ) {

							info.occluders++;

						}

					}
					else if ( isOccluded ) {

						if ( object.occludable === THREE.VertexOccludable ) {

							info.tested++;

							for ( var g in object.geometry.geometryGroups ) {

								var geometryGroup = object.geometry.geometryGroups[ g ];
								processVertices( geometryGroup.__vertexArray );

							}

						}
						else if ( object.occludable === THREE.AABBOccludable ) {

							info.tested++;

							processAABBPoints( object.geometry );

						}

					}

				}
				else {

					isOccluded = false;
					console.warn( "Unsupported occluder/occludable" );

				}


				if ( isOccluded ) {

					webglObject.render = false;
					info.culled++;

				}

			}

		}

		info.fillRatio = occlusionBufferFilled / occlusionBufferSize;

	};

	this.renderDebug = function (debugCanvas) {

		debugCanvas.width = _occlusionBufferWidth;
		debugCanvas.height = _occlusionBufferHeight;
		var debugContext = debugCanvas.getContext( '2d' );
		debugContext.fillStyle = 'rgba(0,0,0,0)';
		debugContext.clearRect( 0, 0, _occlusionBufferWidth, _occlusionBufferHeight );

		debugContext.fillStyle = 'rgba(255,0,255,0.25)';
		var debugImageData = debugContext.createImageData( _occlusionBufferWidth, _occlusionBufferHeight );

		var hueModulo = ( 256 * 6 );
		var r, g, b, z, zcol;

		for (var i = 0, o = 0; i < _occlusionBuffer.length; i++) {

			z = _occlusionBuffer[ i ];
			zcol = ( z << 3 ) % hueModulo;
			switch ( zcol >> 8 ) {
				case 0: r = 255; g =  zcol & 255; b = 0; break;
				case 1: g = 255; r = ~zcol & 255; b = 0; break;
				case 2: g = 255; b =  zcol & 255; r = 0; break;
				case 3: b = 255; g = ~zcol & 255; r = 0; break;
				case 4: b = 255; r =  zcol & 255; g = 0; break;
				case 5: r = 255; b = ~zcol & 255; g = 0; break;
			}

			debugImageData.data[o++] = r;
			debugImageData.data[o++] = g;
			debugImageData.data[o++] = b;
			debugImageData.data[o++] = z < 0xffff ? 128 : 0;

		}

		debugContext.putImageData( debugImageData, 0, 0 );

	};

	
};