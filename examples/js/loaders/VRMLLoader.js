/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.VRMLLoader = function () {};

THREE.VRMLLoader.prototype = {

	constructor: THREE.VRMLLoader,

    isRecordingPoints: false,

    isRecordingFaces: false,

    points: [],

    indexes : [],

	load: function ( url, callback ) {

		var scope = this;
		var request = new XMLHttpRequest();

		request.addEventListener( 'load', function ( event ) {

			var object = scope.parse( event.target.responseText );

			scope.dispatchEvent( { type: 'load', content: object } );

		}, false );

		request.addEventListener( 'progress', function ( event ) {

			scope.dispatchEvent( { type: 'progress', loaded: event.loaded, total: event.total } );

		}, false );

		request.addEventListener( 'error', function () {

			scope.dispatchEvent( { type: 'error', message: 'Couldn\'t load URL [' + url + ']' } );

		}, false );

		request.open( 'GET', url, true );
		request.send( null );

	},

	parse: function ( data ) {

		var parseV1 = function ( lines, scene ) {

			console.warn( 'VRML V1.0 not supported yet' );

		};

		var parseV2 = function ( lines, scene ) {
            var defines = {};
            var float3_pattern = /([\d\.\+\-e]+),?\s+([\d\.\+\-e]+),?\s+([\d\.\+\-e]+)/;

            var parseProperty = function (node, line) {

                var parts = [];
                var part;
                var property = {};
                var fieldName;

                /**
                 * Expression for matching relevant information, such as a name or value, but not the separators
                 * @type {RegExp}
                 */
                var regex = /[^\s,\[\]]+/g;
                var point;
                var index;

                while (null != ( part = regex.exec(line) ) ) {
                    parts.push(part[0]);
                }

                fieldName = parts[0];

                if (fieldName === 'point') {
                    // start recording points
                    this.isRecordingPoints = true;
                    this.points = [];
                }

                if (fieldName === 'coordIndex') {
                    // start recording faces
                    this.isRecordingFaces = true;
                    this.indexes = [];
                }

                if (this.isRecordingFaces) {

                    // the parts hold the indexes as strings
                    if (parts.length > 0) {
                        index = [];

                        for (var ind = 0;ind < parts.length; ind++) {

                            // the part should either be positive integer or -1
                            if (!/(-?\d+)/.test( parts[ind]) ) {
                                continue;
                            }

                            // end of current face
                            if (parts[ind] === "-1") {
                                if (index.length > 0) {
                                   this.indexes.push(index);
                                }

                                // start new one
                                index = [];
                            } else {
                                index.push(parseInt( parts[ind]) );
                            }
                        }

                    }

                    // end
                    if (/]/.exec(line)) {
                        this.isRecordingFaces = false;
                        node.coordIndex = this.indexes;
                    }

                } else if (this.isRecordingPoints) {

                    parts = float3_pattern.exec(line);

                    // parts may be empty on first and last line
                    if (null != parts) {
                        point = {
                            x: parseFloat(parts[1]),
                            y: parseFloat(parts[2]),
                            z: parseFloat(parts[3])
                        };

                        this.points.push(point);
                    }

                    // end
                    if (/]/.exec(line)) {
                        this.isRecordingPoints = false;
                        node.points = this.points;
                    }

                } else if ( parts[parts.length -1] !== 'NULL' && fieldName !== 'children') {

                    switch (fieldName) {

                        case 'diffuseColor':
                        case 'emissiveColor':
                        case 'specularColor':
                        case 'color':

                            if (parts.length != 4) {
                                console.warn('Invalid color format detected for ' + fieldName );
                                break;
                            }

                            property = {
                                'r'         : parseFloat(parts[1]),
                                'g'         : parseFloat(parts[2]),
                                'b'         : parseFloat(parts[3])
                            }

                            break;

                        case 'translation':
                        case 'scale':
                        case 'size':
                            if (parts.length != 4) {
                                console.warn('Invalid vector format detected for ' + fieldName);
                                break;
                            }

                            property = {
                                'x'         : parseFloat(parts[1]),
                                'y'         : parseFloat(parts[2]),
                                'z'         : parseFloat(parts[3])
                            }

                            break;

                        case 'radius':
                        case 'topRadius':
                        case 'bottomRadius':
                        case 'height':
                        case 'transparency':
                        case 'shininess':
                        case 'ambientIntensity':
                            if (parts.length != 2) {
                                console.warn('Invalid single float value specification detected for ' + fieldName);
                                break;
                            }

                            property = parseFloat(parts[1]);

                            break;

                        case 'rotation':
                            if (parts.length != 5) {
                                console.warn('Invalid quaternion format detected for ' + fieldName);
                                break;
                            }

                            property = {
                                'x'         : parseFloat(parts[1]),
                                'y'         : parseFloat(parts[2]),
                                'z'         : parseFloat(parts[3]),
                                'w'         : parseFloat(parts[4])
                            }

                            break;

                        case 'ccw':
                        case 'solid':
                        case 'colorPerVertex':
                        case 'convex':
                            if (parts.length != 2) {
                                console.warn('Invalid format detected for ' + fieldName);
                                break;
                            }

                            property = parts[1] === 'TRUE' ? true : false;

                            break;
                    }

                    node[fieldName] = property;
                }

                return property;
            };

			var getTree = function ( lines ) {

				var tree = { 'string': 'Scene', children: [] };
				var current = tree;
                var matches;
                var specification;

				for ( var i = 0; i < lines.length; i ++ ) {

                    var comment = '';

					var line = lines[ i ];

                    // omit whitespace only lines
                    if ( null !== ( result = /^\s+?$/g.exec( line ) ) ) {
                        continue;
                    }

                    line = line.trim();

                    // skip empty lines
                    if (line === '') {
                        continue;
                    }

					if ( /#/.exec( line ) ) {

                        var parts = line.split('#');

                        // discard everything after the #, it is a comment
                        line = parts[0];

                        // well, let's also keep the comment
                        comment = parts[1];
					}

                    if ( matches = /([^\s]*){1}\s?{/.exec( line ) ) { // first subpattern should match the Node name

						var block = { 'nodeType' : matches[1], 'string': line, 'parent': current, 'children': [],'comment' : comment};
						current.children.push( block );
						current = block;

						if ( /}/.exec( line ) ) {
                            // example: geometry Box { size 1 1 1 } # all on the same line
                            specification = /{(.*)}/.exec( line )[ 1 ];

                            // todo: remove once new parsing is complete?
							block.children.push( specification );

                            parseProperty(current, specification);

							current = current.parent;

						}

					} else if ( /}/.exec( line ) ) {

						current = current.parent;

					} else if ( line !== '' ) {

                        parseProperty(current, line);
                        // todo: remove once new parsing is complete?
                        current.children.push( line );

					}

				}

                return tree;
			}

			var parseNode = function ( data, parent ) {

				// console.log( data );

				if ( typeof data === 'string' ) {

					if ( /USE/.exec( data ) ) {

                        var defineKey = /USE\s+?(\w+)/.exec( data )[ 1 ];

                        if (undefined == defines[defineKey]) {
                            console.warn(defineKey + ' is not defined.');
                        } else {

                            if ( /appearance/.exec( data ) && defineKey ) {

                                parent.material = defines[ defineKey ].clone();

                            } else if ( /geometry/.exec( data ) && defineKey ) {

                                parent.geometry = defines[ defineKey ].clone();

                                // the solid property is not cloned with clone(), is only needed for VRML loading, so we need to transfer it
                                if (undefined !== defines[ defineKey ].solid && defines[ defineKey ].solid === false) {
                                    parent.geometry.solid = false;
                                    parent.material.side = THREE.DoubleSide;
                                }

                            } else if (defineKey){

                                var object = defines[ defineKey ].clone();
                                parent.add( object );

                            }

                        }

					}

					return;

				}

				var object = parent;

				if ( 'Transform' === data.nodeType || 'Group' === data.nodeType ) {

					object = new THREE.Object3D();

					if ( /DEF/.exec( data.string ) ) {
						object.name = /DEF\s+(\w+)/.exec( data.string )[ 1 ];
						defines[ object.name ] = object;
					}

                    if ( undefined !== data['translation'] ) {

                        var t = data.translation;

                        object.position.set(t.x, t.y, t.z);

                    }

                    if ( undefined !== data.rotation ) {

                        var r = data.rotation;

                        object.quaternion.setFromAxisAngle( new THREE.Vector3( r.x, r.y, r.z ), r.w );

                    }

                    if ( undefined !== data.scale ) {

                        var s = data.scale;

                        object.scale.set( s.x, s.y, s.z );

                    }

					parent.add( object );

				} else if ( 'Shape' === data.nodeType ) {

					object = new THREE.Mesh();

					if ( /DEF/.exec( data.string ) ) {
						object.name = /DEF (\w+)/.exec( data.string )[ 1 ];
						defines[ object.name ] = object;
					}

					parent.add( object );

				} else if ( 'Background' === data.nodeType ) {

                    console.warn('Implement hemisphere light here');

				} else if ( /geometry/.exec( data.string ) ) {

					if ( 'Box' === data.nodeType ) {

                        var s = data.size;

						parent.geometry = new THREE.CubeGeometry( s.x, s.y, s.z );

					} else if ( 'Cylinder' === data.nodeType ) {

						parent.geometry = new THREE.CylinderGeometry( data.radius, data.radius, data.height );

					} else if ( 'Cone' === data.nodeType ) {

						parent.geometry = new THREE.CylinderGeometry( data.topRadius, data.bottomRadius, data.height );

					} else if ( 'Sphere' === data.nodeType ) {

						parent.geometry = new THREE.SphereGeometry( data.radius );

					} else if ( 'IndexedFaceSet' === data.nodeType ) {

                        var geometry = new THREE.Geometry();

                        var indexes;

                        for (var i = 0, j = data.children.length; i < j; i++) {

                            var child = data.children[i];

                            var vec;

                            if ( 'Coordinate' === child.nodeType ) {

                                for (var k = 0, l = child.points.length; k < l; k++) {

                                    var point = child.points[k];

                                    vec = new THREE.Vector3(point.x, point.y, point.z);

                                    geometry.vertices.push( vec );
                                }

                                break;
                            }
                        }

                        var skip = 0;
                        // read this: http://math.hws.edu/eck/cs424/notes2013/16_Threejs_Advanced.html
                        for (var i = 0, j = data.coordIndex.length; i < j; i++) {

                            indexes = data.coordIndex[i];

                            // vrml support multipoint indexed face sets (more then 3 vertices). You must calculate the composing triangles here
                            skip = 0;

                            // todo: this is the time to check if the faces are ordered ccw or not (cw)

                            // Face3 only works with triangles, but IndexedFaceSet allows shapes with more then three vertices, build them of triangles
                            while ( indexes.length >= 3 && skip < (indexes.length -2) ) {

                                var face = new THREE.Face3(
                                    indexes[0],
                                    indexes[skip + 1],
                                    indexes[skip + 2],
                                    null // normal, will be added later
                                    // todo: pass in the color, if a color index is present
                                );

                                skip++;

                                geometry.faces.push(face);

                            }


                        }

                        if (false === data.solid) {
                            parent.material.side = THREE.DoubleSide;
                        }

                        // we need to store it on the geometry for use with defines
                        geometry.solid = data.solid;

                        geometry.computeFaceNormals();
                        //geometry.computeVertexNormals(); // does not show
                        geometry.computeBoundingSphere();

                        // see if it's a define
                        if ( /DEF/.exec( data.string ) ) {
                            geometry.name = /DEF (\w+)/.exec( data.string )[ 1 ];
                            defines[ geometry.name ] = geometry;
                        }

                        parent.geometry = geometry;
					}

					return;

				} else if ( /appearance/.exec( data.string ) ) {

					for ( var i = 0; i < data.children.length; i ++ ) {

						var child = data.children[ i ];

						if ( 'Material' === child.nodeType ) {
							var material = new THREE.MeshPhongMaterial();

                            if ( undefined !== child.diffuseColor ) {

                                var d = child.diffuseColor;

                                material.color.setRGB( d.r, d.g, d.b );

                            }

                            if ( undefined !== child.emissiveColor ) {

                                var e = child.emissiveColor;

                                material.emissive.setRGB( e.r, e.g, e.b);

                            }

                            if ( undefined !== child.specularColor ) {

                                var s = child.specularColor;

                                material.specular.setRGB( s.r, s.g, s.b );

                            }

                            if ( undefined !== child.transparency ) {

                                var t = child.transparency;
                                // transparency is opposite of opacity
                                material.opacity = Math.abs( 1 - t );
                                material.transparent = true;

                            }


							if ( /DEF/.exec( data.string ) ) {

								material.name = /DEF (\w+)/.exec( data.string )[ 1 ];

								defines[ material.name ] = material;

							}

                            // todo: below does not work, but we should find a way to make it work (for USE(d) geometries (IndexedFaceSets) that are marked as solid)
                            if (undefined !== parent.geometry.solid && false === parent.geometry.solid) {
                                material.side = THREE.DoubleSide;
                            }

							parent.material = material;

                            // material found, stop looping
                            break;
						}

					}

					return;

				}

				for ( var i = 0, l = data.children.length; i < l; i ++ ) {

					var child = data.children[ i ];

					parseNode( data.children[ i ], object );

				}

			}

			parseNode( getTree( lines ), scene );

		};

		var scene = new THREE.Scene();

		var lines = data.split( '\n' );
		var header = lines.shift();

		if ( /V1.0/.exec( header ) ) {

			parseV1( lines, scene );

		} else if ( /V2.0/.exec( header ) ) {

			parseV2( lines, scene );

		}

		return scene;

	}

};

THREE.EventDispatcher.prototype.apply( THREE.VRMLLoader.prototype );
