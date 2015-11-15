/**
 * Origin: https://github.com/mrdoob/three.js/blob/af21991fc7c4e1d35d6a93031707273d937af0f9/examples/js/loaders/VTKLoader.js
 * @author mrdoob / http://mrdoob.com/ and Alex Pletzer
 */

THREE.VTKLoader = function ( manager ) {

    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.VTKLoader.prototype = {

    constructor: THREE.VTKLoader,

    load: function ( url, onLoad, onProgress, onError ) {
        // Will we bump into trouble reading the whole file into memory?
        var scope = this;
        var loader = new THREE.XHRLoader( scope.manager );
        loader.setCrossOrigin( this.crossOrigin );
        loader.load( url, function ( text ) {
            onLoad( scope.parse( text ) );
        }, onProgress, onError );
    },

    setCrossOrigin: function ( value ) {
        this.crossOrigin = value;
    },

    parse: function ( data ) {
    
        // connectivity of the triangles
        var indices = [];

        // triangles vertices
        var positions = [];

        // red, green, blue colors in the range 0 to 1
        var colors = [];

        // LUT variables required for coloring
        var colorMap = 'rainbow';
        var numberOfColors = 512;
        var lut = new THREE.Lut( colorMap, numberOfColors );
        lut.setMax( 2000 );
        lut.setMin( 0 );

        // Float values defined for the LUT
        var color_scalars = [];

        // normal vector, one per vertex
        var normals = [];

        var result;

        // pattern for reading vertices, 3 floats or integers
        var pat3Floats = /(\-?\d+\.?[\d\-\+e]*)\s+(\-?\d+\.?[\d\-\+e]*)\s+(\-?\d+\.?[\d\-\+e]*)/g;

        // pattern for connectivity, an integer followed by any number of ints
        // the first integer is the number of polygon nodes
        var patConnectivity = /^(\d+)\s+([\s\d]*)/;

        // indicates start of vertex data section
        var patPOINTS = /^POINTS /;

        // indicates start of polygon connectivity section
        var patPOLYGONS = /^POLYGONS /;

        // POINT_DATA number_of_values 
        var patPOINT_DATA = /^POINT_DATA[ ]+(\d+)/;

        // CELL_DATA number_of_polys
        var patCELL_DATA = /^CELL_DATA[ ]+(\d+)/;

        // Start of color section
        var patCOLOR_SCALARS = /^COLOR_SCALARS[ ]+(\w+)[ ]+3/;

        // Start of LUT section
        var patLOOKUP_TABLE = /^LOOKUP_TABLE[ ]+(\w)/;

        // NORMALS Normals float
        var patNORMALS = /^NORMALS[ ]+(\w+)[ ]+(\w+)/;

        var inPointsSection = false;
        var inPolygonsSection = false;
        var inPointDataSection = false;
        var inCellDataSection = false;
        var inColorSection = false;
        var inLookupTableSection = false;
        var inNormalsSection = false;

        var lines = data.split('\n');

        for ( var i in lines ) {
        
            var line = lines[ i ];
            
            if ( inPointsSection ) {
            
                // get the vertices
                while ( ( result = pat3Floats.exec( line ) ) !== null ) {
                
                    var x = parseFloat( result[ 1 ] );
                    var y = parseFloat( result[ 2 ] );
                    var z = parseFloat( result[ 3 ] );
                    positions.push( x, y, z );
                    
                }
                
            } else if ( inPolygonsSection ) {
            
                if ( ( result = patConnectivity.exec( line ) ) !== null ) {
                
                    // numVertices i0 i1 i2 ...
                    var numVertices = parseInt( result[ 1 ] );
                    var inds = result[ 2 ].split(/\s+/); 
                    if ( numVertices >= 3 ) {
                    
                        var i0 = parseInt( inds[ 0 ] );
                        var i1, i2;
                        var k = 1;
                        // split the polygon in numVertices - 2 triangles
                        for ( var j = 0; j < numVertices - 2; ++j ) {
                        
                            i1 = parseInt( inds[ k ] );
                            i2 = parseInt( inds[ k  + 1 ] );
                              indices.push( i0, i1, i2 );
                            k++;
                            
                        }
                        
                    }
                    
                }
                
            } else if ( inPointDataSection ) {
            
                if ( inColorSection ) {
                
                    // get the colors
                    
                    while ( ( result = pat3Floats.exec( line ) ) !== null ) {
                    
                        var r = parseFloat( result[ 1 ] );
                        var g = parseFloat( result[ 2 ] );
                        var b = parseFloat( result[ 3 ] );
                        colors.push( r, g, b );
                        
                    }
                    
                } else if ( inLookupTableSection ) {
                
                    // get the color scalars
    
                    var items = line.split( /(\s+)/ );
                    
                    for ( var item_index = 0; item_index < items.length; item_index++ ) {
                    
                        var scalar = parseFloat( items[ item_index ] ).toFixed( 12 );
                        
                        if ( ! isNaN( scalar ) ) {
                        
                            color_scalars.push( scalar );
                            
                        }
                        
                    }
                    
                } else if ( inNormalsSection ) {
                
                    // get the normal vectors
                    
                    while ( ( result = pat3Floats.exec( line ) ) !== null ) {
                    
                        var nx = parseFloat( result[ 1 ] );
                        var ny = parseFloat( result[ 2 ] );
                        var nz = parseFloat( result[ 3 ] );
                        normals.push( nx, ny, nz );
                        
                    }
                    
                }
                
            } else if ( inCellDataSection ) {
            
                if ( inColorSection ) {
                
                    // get the colors
                    
                    while ( ( result = pat3Floats.exec( line ) ) !== null ) {
                    
                        var r = parseFloat( result[ 1 ] );
                        var g = parseFloat( result[ 2 ] );
                        var b = parseFloat( result[ 3 ] );
                        colors.push( r, g, b );
                        
                    }
                    
                } else if ( inLookupTableSection ) {
                
                    // get the color scalars
                    var items = line.split( /(\s+)/ );
                    
                    for ( var item_index = 0; item_index < items.length; item_index++ ) {
                    
                        var scalar = parseFloat( items[ item_index ] ).toFixed( 12 );
                        
                        if ( ! isNaN( scalar ) ) {
                        
                            color_scalars.push( scalar );
                        }
                        
                    }
                    
                } else if ( inNormalsSection ) {
                
                    // get the normal vectors
                    while ( ( result = pat3Floats.exec( line ) ) !== null ) {
                    
                        var nx = parseFloat( result[ 1 ] );
                        var ny = parseFloat( result[ 2 ] );
                        var nz = parseFloat( result[ 3 ] );
                        normals.push( nx, ny, nz );
                        
                    }
                    
                }
                
            }

            if ( patPOLYGONS.exec( line ) !== null ) {
            
                inPolygonsSection = true;
                inPointsSection = false;
                
            } else if ( patPOINTS.exec( line ) !== null ) {
            
                inPolygonsSection = false;
                inPointsSection = true;
                
            } else if ( patPOINT_DATA.exec( line ) !== null ) {
            
                inPointDataSection = true;
                inPointsSection = false;
                inPolygonsSection = false;
                
            } else if ( patCELL_DATA.exec( line ) !== null ) {
            
                inCellDataSection = true;
                inPointsSection = false;
                inPolygonsSection = false;
                
            } else if ( patCOLOR_SCALARS.exec( line ) !== null ) {
            
                inColorSection = true;
                inLookupTableSection = false;
                inNormalsSection = false;
                inPointsSection = false;
                inPolygonsSection = false;
                
            } else if ( patLOOKUP_TABLE.exec( line ) !== null ) {
            
                inLookupTableSection = true;
                inColorSection = false;
                inNormalsSection = false;
                inPointsSection = false;
                inPolygonsSection = false;
                
            } else if ( patNORMALS.exec( line ) !== null ) {
            
                inNormalsSection = true;
                inLookupTableSection = false;
                inColorSection = false;
                inPointsSection = false;
                inPolygonsSection = false;
                
            }
            
        }

        var geometry;
        var stagger = 'point';

        if ( colors.length == indices.length ) {
        
            stagger = 'cell';
            
        }

        if ( stagger == 'point' ) {
        
            // nodal. Use BufferGeometry
            geometry = new THREE.BufferGeometry();
            geometry.addAttribute( 'index', new THREE.BufferAttribute( new ( indices.length > 65535 ? Uint32Array : Uint16Array )( indices ), 1 ) );
            geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( positions ), 3 ) );

            if ( colors.length == positions.length ) {
            
                geometry.addAttribute( 'color', new THREE.BufferAttribute( new Float32Array( colors ), 3 ) );
                
            } else if ( color_scalars.length > 0 ) {
            
                // Use LUT for coloring.
                var lutColors = [];
                for ( var i = 0; i < color_scalars.length; i++ ) {
                
                    var colorValue = color_scalars[ i ];
                    color = lut.getColor( colorValue );
                    if ( color == undefined ) {
                    
                        console.log( "ERROR: " + colorValue );
                        
                    } else {
                    
                        lutColors[ 3 * i ] = color.r;
                        lutColors[ 3 * i + 1 ] = color.g;
                        lutColors[ 3 * i + 2 ] = color.b;
                        
                    }
                    
                }
                
                geometry.addAttribute( 'color', new THREE.BufferAttribute( new Float32Array( lutColors ), 3 ) );
                
            }

            if ( normals.length == positions.length ) {
            
                geometry.addAttribute( 'normal', new THREE.BufferAttribute( new Float32Array( normals ), 3 ) );
                
            }
            
        } else {
        
            // cell centered colors. The only way to attach a solid color to each triangle
            // is to use Geometry 
            geometry = new THREE.Geometry();

            var numTriangles = indices.length / 3;
            var numPoints = positions.length / 3;
            var va, vb, vc;
            var face;
            var colorA, colorB, colorC;
            var ia, ib, ic;
            var x, y, z;
            var r, g, b;

            for ( var j = 0; j < numPoints; ++j ) {
            
                x = positions[ 3*j + 0 ];
                y = positions[ 3*j + 1 ];
                z = positions[ 3*j + 2 ];
                geometry.vertices.push( new THREE.Vector3( x, y, z ) );
                
            }
            
            for ( var i = 0; i < numTriangles; ++i ) {
            
                ia = indices[ 3*i + 0 ];
                ib = indices[ 3*i + 1 ];
                ic = indices[ 3*i + 2 ];
                geometry.faces.push( new THREE.Face3( ia, ib, ic ) );
                
            }

            if ( colors.length == numTriangles * 3 ) {
            
                for ( var i = 0; i < numTriangles; ++i ) {
                
                    face = geometry.faces[i];
                    r = colors[ 3*i + 0 ];
                    g = colors[ 3*i + 1 ];
                    b = colors[ 3*i + 2 ];
                    face.color = new THREE.Color().setRGB( r, g, b );
                    
                }
                
            } else if ( color_scalars.length == numTriangles ) {
            
                // Use LUT for coloring.
                for ( var i = 0; i < numTriangles; ++i ) {
                
                    face = geometry.faces[i];
                    colorValue = color_scalars[ i ];
                    color = lut.getColor( colorValue );
                    if ( color == undefined ) {
                    
                        console.log( "ERROR: " + colorValue );
                        
                    } else {

                        color = new THREE.Color();
                        color.setRGB( color.r, color.g, color.b );
                        face.color = new THREE.Color().setRGB( r, g, b );
                        
                    }
                    
                }
                
            }
            
        }
        
        return geometry;
    }
};

THREE.EventDispatcher.prototype.apply( THREE.VTKLoader.prototype );
