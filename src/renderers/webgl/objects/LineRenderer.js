
THREE.WebGLRenderer.LineRenderer = function ( lowlevelrenderer, info ) {

	THREE.WebGLRenderer.Object3DRenderer.call( this, lowlevelrenderer, info );

};

THREE.WebGLRenderer.LineRenderer.prototype = Object.create( THREE.WebGLRenderer.Object3DRenderer.prototype );

THREE.extend( THREE.WebGLRenderer.LineRenderer.prototype, {

	createBuffers: function ( geometry ) {

		var renderer = this.renderer;
		geometry.__webglVertexBuffer = renderer.createBuffer();
		geometry.__webglColorBuffer = renderer.createBuffer();
		geometry.__webglLineDistanceBuffer = renderer.createBuffer();

		this.info.memory.geometries ++;

	},

	initBuffers: function ( geometry, object ) {

		var nvertices = geometry.vertices.length;

		geometry.__vertexArray = new Float32Array( nvertices * 3 );
		geometry.__colorArray = new Float32Array( nvertices * 3 );
		geometry.__lineDistanceArray = new Float32Array( nvertices * 1 );

		geometry.__webglLineCount = nvertices;

		this.initCustomAttributes ( geometry, object );

	},

	setBuffers: function ( geometry, object ) {

		var renderer = this.renderer;
		var v, c, d, vertex, offset, color,

		vertices = geometry.vertices,
		colors = geometry.colors,
		lineDistances = geometry.lineDistances,

		vl = vertices.length,
		cl = colors.length,
		dl = lineDistances.length,

		vertexArray = geometry.__vertexArray,
		colorArray = geometry.__colorArray,
		lineDistanceArray = geometry.__lineDistanceArray,

		dirtyVertices = geometry.verticesNeedUpdate,
		dirtyColors = geometry.colorsNeedUpdate,
		dirtyLineDistances = geometry.lineDistancesNeedUpdate,

		customAttributes = geometry.__webglCustomAttributesList,

		i, il,
		a, ca, cal, value,
		customAttribute;

		if ( dirtyVertices ) {

			for ( v = 0; v < vl; v ++ ) {

				vertex = vertices[ v ];

				offset = v * 3;

				vertexArray[ offset ]     = vertex.x;
				vertexArray[ offset + 1 ] = vertex.y;
				vertexArray[ offset + 2 ] = vertex.z;

			}

			renderer.setDynamicArrayBuffer(geometry.__webglVertexBuffer,vertexArray);

		}

		if ( dirtyColors ) {

			for ( c = 0; c < cl; c ++ ) {

				color = colors[ c ];

				offset = c * 3;

				colorArray[ offset ]     = color.r;
				colorArray[ offset + 1 ] = color.g;
				colorArray[ offset + 2 ] = color.b;

			}

			renderer.setDynamicArrayBuffer(geometry.__webglColorBuffer,colorArray);

		}

		if ( dirtyLineDistances ) {

			for ( d = 0; d < dl; d ++ ) {

				lineDistanceArray[ d ] = lineDistances[ d ];

			}

			renderer.setDynamicArrayBuffer( geometry.__webglLineDistanceBuffer,lineDistanceArray);

		}

		if ( customAttributes ) {

			for ( i = 0, il = customAttributes.length; i < il; i ++ ) {

				customAttribute = customAttributes[ i ];

				if ( customAttribute.needsUpdate &&
					 ( customAttribute.boundTo === undefined ||
					   customAttribute.boundTo === "vertices" ) ) {

					offset = 0;

					cal = customAttribute.value.length;

					if ( customAttribute.size === 1 ) {

						for ( ca = 0; ca < cal; ca ++ ) {

							customAttribute.array[ ca ] = customAttribute.value[ ca ];

						}

					} else if ( customAttribute.size === 2 ) {

						for ( ca = 0; ca < cal; ca ++ ) {

							value = customAttribute.value[ ca ];

							customAttribute.array[ offset ] 	= value.x;
							customAttribute.array[ offset + 1 ] = value.y;

							offset += 2;

						}

					} else if ( customAttribute.size === 3 ) {

						if ( customAttribute.type === "c" ) {

							for ( ca = 0; ca < cal; ca ++ ) {

								value = customAttribute.value[ ca ];

								customAttribute.array[ offset ] 	= value.r;
								customAttribute.array[ offset + 1 ] = value.g;
								customAttribute.array[ offset + 2 ] = value.b;

								offset += 3;

							}

						} else {

							for ( ca = 0; ca < cal; ca ++ ) {

								value = customAttribute.value[ ca ];

								customAttribute.array[ offset ] 	= value.x;
								customAttribute.array[ offset + 1 ] = value.y;
								customAttribute.array[ offset + 2 ] = value.z;

								offset += 3;

							}

						}

					} else if ( customAttribute.size === 4 ) {

						for ( ca = 0; ca < cal; ca ++ ) {

							value = customAttribute.value[ ca ];

							customAttribute.array[ offset ] 	 = value.x;
							customAttribute.array[ offset + 1  ] = value.y;
							customAttribute.array[ offset + 2  ] = value.z;
							customAttribute.array[ offset + 3  ] = value.w;

							offset += 4;

						}

					}

					renderer.setDynamicArrayBuffer( customAttribute.buffer,customAttribute.array);

				}

			}

		}

	}

} );
