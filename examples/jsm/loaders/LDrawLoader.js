import {
	BufferAttribute,
	BufferGeometry,
	Color,
	FileLoader,
	Float32BufferAttribute,
	Group,
	LineBasicMaterial,
	LineSegments,
	Loader,
	Matrix4,
	Mesh,
	MeshPhongMaterial,
	MeshStandardMaterial,
	ShaderMaterial,
	UniformsLib,
	UniformsUtils,
	Vector3
} from '../../../build/three.module.js';

// Special surface finish tag types.
// Note: "MATERIAL" tag (e.g. GLITTER, SPECKLE) is not implemented
const FINISH_TYPE_DEFAULT = 0;
const FINISH_TYPE_CHROME = 1;
const FINISH_TYPE_PEARLESCENT = 2;
const FINISH_TYPE_RUBBER = 3;
const FINISH_TYPE_MATTE_METALLIC = 4;
const FINISH_TYPE_METAL = 5;

// State machine to search a subobject path.
// The LDraw standard establishes these various possible subfolders.
const FILE_LOCATION_AS_IS = 0;
const FILE_LOCATION_TRY_PARTS = 1;
const FILE_LOCATION_TRY_P = 2;
const FILE_LOCATION_TRY_MODELS = 3;
const FILE_LOCATION_TRY_RELATIVE = 4;
const FILE_LOCATION_TRY_ABSOLUTE = 5;
const FILE_LOCATION_NOT_FOUND = 6;

const _tempVec0 = new Vector3();
const _tempVec1 = new Vector3();

class LDrawConditionalLineMaterial extends ShaderMaterial {

	constructor( parameters ) {

		super( {

			uniforms: UniformsUtils.merge( [
				UniformsLib.fog,
				{
					diffuse: {
						value: new Color()
					},
					opacity: {
						value: 1.0
					}
				}
			] ),

			vertexShader: /* glsl */`
				attribute vec3 control0;
				attribute vec3 control1;
				attribute vec3 direction;
				varying float discardFlag;

				#include <common>
				#include <color_pars_vertex>
				#include <fog_pars_vertex>
				#include <logdepthbuf_pars_vertex>
				#include <clipping_planes_pars_vertex>
				void main() {
					#include <color_vertex>

					vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
					gl_Position = projectionMatrix * mvPosition;

					// Transform the line segment ends and control points into camera clip space
					vec4 c0 = projectionMatrix * modelViewMatrix * vec4( control0, 1.0 );
					vec4 c1 = projectionMatrix * modelViewMatrix * vec4( control1, 1.0 );
					vec4 p0 = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
					vec4 p1 = projectionMatrix * modelViewMatrix * vec4( position + direction, 1.0 );

					c0.xy /= c0.w;
					c1.xy /= c1.w;
					p0.xy /= p0.w;
					p1.xy /= p1.w;

					// Get the direction of the segment and an orthogonal vector
					vec2 dir = p1.xy - p0.xy;
					vec2 norm = vec2( -dir.y, dir.x );

					// Get control point directions from the line
					vec2 c0dir = c0.xy - p1.xy;
					vec2 c1dir = c1.xy - p1.xy;

					// If the vectors to the controls points are pointed in different directions away
					// from the line segment then the line should not be drawn.
					float d0 = dot( normalize( norm ), normalize( c0dir ) );
					float d1 = dot( normalize( norm ), normalize( c1dir ) );
					discardFlag = float( sign( d0 ) != sign( d1 ) );

					#include <logdepthbuf_vertex>
					#include <clipping_planes_vertex>
					#include <fog_vertex>
				}
			`,

			fragmentShader: /* glsl */`
			uniform vec3 diffuse;
			uniform float opacity;
			varying float discardFlag;

			#include <common>
			#include <color_pars_fragment>
			#include <fog_pars_fragment>
			#include <logdepthbuf_pars_fragment>
			#include <clipping_planes_pars_fragment>
			void main() {

				if ( discardFlag > 0.5 ) discard;

				#include <clipping_planes_fragment>
				vec3 outgoingLight = vec3( 0.0 );
				vec4 diffuseColor = vec4( diffuse, opacity );
				#include <logdepthbuf_fragment>
				#include <color_fragment>
				outgoingLight = diffuseColor.rgb; // simple shader
				gl_FragColor = vec4( outgoingLight, diffuseColor.a );
				#include <tonemapping_fragment>
				#include <encodings_fragment>
				#include <fog_fragment>
				#include <premultiplied_alpha_fragment>
			}
			`,

		} );

		Object.defineProperties( this, {

			opacity: {
				get: function () {

					return this.uniforms.opacity.value;

				},

				set: function ( value ) {

					this.uniforms.opacity.value = value;

				}
			},

			color: {
				get: function () {

					return this.uniforms.diffuse.value;

				}
			}

		} );

		this.setValues( parameters );
		this.isLDrawConditionalLineMaterial = true;

	}

}

function smoothNormals( triangles, lineSegments ) {

	function hashVertex( v ) {

		// NOTE: 1e2 is pretty coarse but was chosen because it allows edges
		// to be smoothed as expected (see minifig arms). The errors between edges
		// could be due to matrix multiplication.
		const x = ~ ~ ( v.x * 1e2 );
		const y = ~ ~ ( v.y * 1e2 );
		const z = ~ ~ ( v.z * 1e2 );
		return `${ x },${ y },${ z }`;

	}

	function hashEdge( v0, v1 ) {

		return `${ hashVertex( v0 ) }_${ hashVertex( v1 ) }`;

	}

	const hardEdges = new Set();
	const halfEdgeList = {};
	const fullHalfEdgeList = {};
	const normals = [];

	// Save the list of hard edges by hash
	for ( let i = 0, l = lineSegments.length; i < l; i ++ ) {

		const ls = lineSegments[ i ];
		const v0 = ls.v0;
		const v1 = ls.v1;
		hardEdges.add( hashEdge( v0, v1 ) );
		hardEdges.add( hashEdge( v1, v0 ) );

	}

	// track the half edges associated with each triangle
	for ( let i = 0, l = triangles.length; i < l; i ++ ) {

		const tri = triangles[ i ];
		for ( let i2 = 0, l2 = 3; i2 < l2; i2 ++ ) {

			const index = i2;
			const next = ( i2 + 1 ) % 3;
			const v0 = tri[ `v${ index }` ];
			const v1 = tri[ `v${ next }` ];
			const hash = hashEdge( v0, v1 );

			// don't add the triangle if the edge is supposed to be hard
			if ( hardEdges.has( hash ) ) continue;
			halfEdgeList[ hash ] = tri;
			fullHalfEdgeList[ hash ] = tri;

		}

	}

	// Iterate until we've tried to connect all triangles to share normals
	while ( true ) {

		// Stop if there are no more triangles left
		const halfEdges = Object.keys( halfEdgeList );
		if ( halfEdges.length === 0 ) break;

		// Exhaustively find all connected triangles
		let i = 0;
		const queue = [ fullHalfEdgeList[ halfEdges[ 0 ] ] ];
		while ( i < queue.length ) {

			// initialize all vertex normals in this triangle
			const tri = queue[ i ];
			i ++;

			const faceNormal = tri.faceNormal;
			if ( tri.n0 === null ) {

				tri.n0 = faceNormal.clone().multiplyScalar( tri.fromQuad ? 0.5 : 1.0 );
				normals.push( tri.n0 );

			}

			if ( tri.n1 === null ) {

				tri.n1 = faceNormal.clone().multiplyScalar( tri.fromQuad ? 0.5 : 1.0 );
				normals.push( tri.n1 );

			}

			if ( tri.n2 === null ) {

				tri.n2 = faceNormal.clone();
				normals.push( tri.n2 );

			}

			// Check if any edge is connected to another triangle edge
			for ( let i2 = 0, l2 = 3; i2 < l2; i2 ++ ) {

				const index = i2;
				const next = ( i2 + 1 ) % 3;
				const v0 = tri[ `v${ index }` ];
				const v1 = tri[ `v${ next }` ];

				// delete this triangle from the list so it won't be found again
				const hash = hashEdge( v0, v1 );
				delete halfEdgeList[ hash ];

				const reverseHash = hashEdge( v1, v0 );
				const otherTri = fullHalfEdgeList[ reverseHash ];
				if ( otherTri ) {

					// NOTE: If the angle between triangles is > 67.5 degrees then assume it's
					// hard edge. There are some cases where the line segments do not line up exactly
					// with or span multiple triangle edges (see Lunar Vehicle wheels).
					if ( Math.abs( otherTri.faceNormal.dot( tri.faceNormal ) ) < 0.25 ) {

						continue;

					}

					// if this triangle has already been traversed then it won't be in
					// the halfEdgeList. If it has not then add it to the queue and delete
					// it so it won't be found again.
					if ( reverseHash in halfEdgeList ) {

						queue.push( otherTri );
						delete halfEdgeList[ reverseHash ];

					}

					// Find the matching edge in this triangle and copy the normal vector over
					for ( let i3 = 0, l3 = 3; i3 < l3; i3 ++ ) {

						const otherIndex = i3;
						const otherNext = ( i3 + 1 ) % 3;
						const otherV0 = otherTri[ `v${ otherIndex }` ];
						const otherV1 = otherTri[ `v${ otherNext }` ];

						const otherHash = hashEdge( otherV0, otherV1 );
						if ( otherHash === reverseHash ) {

							if ( otherTri[ `n${ otherIndex }` ] === null ) {

								const norm = tri[ `n${ next }` ];
								otherTri[ `n${ otherIndex }` ] = norm;

								const isDoubledVert = otherTri.fromQuad && otherIndex !== 2;
								norm.addScaledVector( otherTri.faceNormal, isDoubledVert ? 0.5 : 1.0 );

							}

							if ( otherTri[ `n${ otherNext }` ] === null ) {

								const norm = tri[ `n${ index }` ];
								otherTri[ `n${ otherNext }` ] = norm;

								const isDoubledVert = otherTri.fromQuad && otherNext !== 2;
								norm.addScaledVector( otherTri.faceNormal, isDoubledVert ? 0.5 : 1.0 );

							}

							break;

						}

					}

				}

			}

		}

	}

	// The normals of each face have been added up so now we average them by normalizing the vector.
	for ( let i = 0, l = normals.length; i < l; i ++ ) {

		normals[ i ].normalize();

	}

}

function isPrimitiveType( type ) {

	return /primitive/i.test( type ) || type === 'Subpart';

}

class LineParser {

	constructor( line, lineNumber ) {

		this.line = line;
		this.lineLength = line.length;
		this.currentCharIndex = 0;
		this.currentChar = ' ';
		this.lineNumber = lineNumber;

	}

	seekNonSpace() {

		while ( this.currentCharIndex < this.lineLength ) {

			this.currentChar = this.line.charAt( this.currentCharIndex );

			if ( this.currentChar !== ' ' && this.currentChar !== '\t' ) {

				return;

			}

			this.currentCharIndex ++;

		}

	}

	getToken() {

		const pos0 = this.currentCharIndex ++;

		// Seek space
		while ( this.currentCharIndex < this.lineLength ) {

			this.currentChar = this.line.charAt( this.currentCharIndex );

			if ( this.currentChar === ' ' || this.currentChar === '\t' ) {

				break;

			}

			this.currentCharIndex ++;

		}

		const pos1 = this.currentCharIndex;

		this.seekNonSpace();

		return this.line.substring( pos0, pos1 );

	}

	getRemainingString() {

		return this.line.substring( this.currentCharIndex, this.lineLength );

	}

	isAtTheEnd() {

		return this.currentCharIndex >= this.lineLength;

	}

	setToEnd() {

		this.currentCharIndex = this.lineLength;

	}

	getLineNumberString() {

		return this.lineNumber >= 0 ? ' at line ' + this.lineNumber : '';

	}

}

function sortByMaterial( a, b ) {

	if ( a.colourCode === b.colourCode ) {

		return 0;

	}

	if ( a.colourCode < b.colourCode ) {

		return - 1;

	}

	return 1;

}

function createObject( elements, elementSize, isConditionalSegments ) {

	// Creates a LineSegments (elementSize = 2) or a Mesh (elementSize = 3 )
	// With per face / segment material, implemented with mesh groups and materials array

	// Sort the triangles or line segments by colour code to make later the mesh groups
	elements.sort( sortByMaterial );

	const positions = [];
	const normals = [];
	const materials = [];

	const bufferGeometry = new BufferGeometry();
	let prevMaterial = null;
	let index0 = 0;
	let numGroupVerts = 0;

	for ( let iElem = 0, nElem = elements.length; iElem < nElem; iElem ++ ) {

		const elem = elements[ iElem ];
		const v0 = elem.v0;
		const v1 = elem.v1;
		// Note that LDraw coordinate system is rotated 180 deg. in the X axis w.r.t. Three.js's one
		positions.push( v0.x, v0.y, v0.z, v1.x, v1.y, v1.z );
		if ( elementSize === 3 ) {

			positions.push( elem.v2.x, elem.v2.y, elem.v2.z );

			const n0 = elem.n0 || elem.faceNormal;
			const n1 = elem.n1 || elem.faceNormal;
			const n2 = elem.n2 || elem.faceNormal;
			normals.push( n0.x, n0.y, n0.z );
			normals.push( n1.x, n1.y, n1.z );
			normals.push( n2.x, n2.y, n2.z );

		}

		if ( prevMaterial !== elem.material ) {

			if ( prevMaterial !== null ) {

				bufferGeometry.addGroup( index0, numGroupVerts, materials.length - 1 );

			}

			materials.push( elem.material );

			prevMaterial = elem.material;
			index0 = iElem * elementSize;
			numGroupVerts = elementSize;

		} else {

			numGroupVerts += elementSize;

		}

	}

	if ( numGroupVerts > 0 ) {

		bufferGeometry.addGroup( index0, Infinity, materials.length - 1 );

	}

	bufferGeometry.setAttribute( 'position', new Float32BufferAttribute( positions, 3 ) );

	if ( elementSize === 3 ) {

		bufferGeometry.setAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );

	}

	let object3d = null;

	if ( elementSize === 2 ) {

		object3d = new LineSegments( bufferGeometry, materials );

	} else if ( elementSize === 3 ) {

		object3d = new Mesh( bufferGeometry, materials );

	}

	if ( isConditionalSegments ) {

		object3d.isConditionalLine = true;

		const controlArray0 = new Float32Array( elements.length * 3 * 2 );
		const controlArray1 = new Float32Array( elements.length * 3 * 2 );
		const directionArray = new Float32Array( elements.length * 3 * 2 );
		for ( let i = 0, l = elements.length; i < l; i ++ ) {

			const os = elements[ i ];
			const c0 = os.c0;
			const c1 = os.c1;
			const v0 = os.v0;
			const v1 = os.v1;
			const index = i * 3 * 2;
			controlArray0[ index + 0 ] = c0.x;
			controlArray0[ index + 1 ] = c0.y;
			controlArray0[ index + 2 ] = c0.z;
			controlArray0[ index + 3 ] = c0.x;
			controlArray0[ index + 4 ] = c0.y;
			controlArray0[ index + 5 ] = c0.z;

			controlArray1[ index + 0 ] = c1.x;
			controlArray1[ index + 1 ] = c1.y;
			controlArray1[ index + 2 ] = c1.z;
			controlArray1[ index + 3 ] = c1.x;
			controlArray1[ index + 4 ] = c1.y;
			controlArray1[ index + 5 ] = c1.z;

			directionArray[ index + 0 ] = v1.x - v0.x;
			directionArray[ index + 1 ] = v1.y - v0.y;
			directionArray[ index + 2 ] = v1.z - v0.z;
			directionArray[ index + 3 ] = v1.x - v0.x;
			directionArray[ index + 4 ] = v1.y - v0.y;
			directionArray[ index + 5 ] = v1.z - v0.z;

		}

		bufferGeometry.setAttribute( 'control0', new BufferAttribute( controlArray0, 3, false ) );
		bufferGeometry.setAttribute( 'control1', new BufferAttribute( controlArray1, 3, false ) );
		bufferGeometry.setAttribute( 'direction', new BufferAttribute( directionArray, 3, false ) );

	}

	return object3d;

}

//

class LDrawLoader extends Loader {

	constructor( manager ) {

		super( manager );

		// This is a stack of 'parse scopes' with one level per subobject loaded file.
		// Each level contains a material lib and also other runtime variables passed between parent and child subobjects
		// When searching for a material code, the stack is read from top of the stack to bottom
		// Each material library is an object map keyed by colour codes.
		this.parseScopesStack = null;

		// Array of THREE.Material
		this.materials = [];

		// Not using THREE.Cache here because it returns the previous HTML error response instead of calling onError()
		// This also allows to handle the embedded text files ("0 FILE" lines)
		this.subobjectCache = {};

		// This object is a map from file names to paths. It agilizes the paths search. If it is not set then files will be searched by trial and error.
		this.fileMap = null;

		// Add default main triangle and line edge materials (used in piecess that can be coloured with a main color)
		this.setMaterials( [
			this.parseColourMetaDirective( new LineParser( 'Main_Colour CODE 16 VALUE #FF8080 EDGE #333333' ) ),
			this.parseColourMetaDirective( new LineParser( 'Edge_Colour CODE 24 VALUE #A0A0A0 EDGE #333333' ) )
		] );

		// If this flag is set to true, each subobject will be a Object.
		// If not (the default), only one object which contains all the merged primitives will be created.
		this.separateObjects = false;

		// If this flag is set to true the vertex normals will be smoothed.
		this.smoothNormals = true;

	}

	load( url, onLoad, onProgress, onError ) {

		if ( ! this.fileMap ) {

			this.fileMap = {};

		}

		const scope = this;

		const fileLoader = new FileLoader( this.manager );
		fileLoader.setPath( this.path );
		fileLoader.setRequestHeader( this.requestHeader );
		fileLoader.setWithCredentials( this.withCredentials );
		fileLoader.load( url, function ( text ) {

			scope.processObject( text, onLoad, null, url );

		}, onProgress, onError );

	}

	parse( text, path, onLoad ) {

		// Async parse.  This function calls onParse with the parsed THREE.Object3D as parameter

		this.processObject( text, onLoad, null, path );

	}

	setMaterials( materials ) {

		// Clears parse scopes stack, adds new scope with material library

		this.parseScopesStack = [];

		this.newParseScopeLevel( materials );

		this.getCurrentParseScope().isFromParse = false;

		this.materials = materials;

		return this;

	}

	setFileMap( fileMap ) {

		this.fileMap = fileMap;

		return this;

	}

	newParseScopeLevel( materials ) {

		// Adds a new scope level, assign materials to it and returns it

		const matLib = {};

		if ( materials ) {

			for ( let i = 0, n = materials.length; i < n; i ++ ) {

				const material = materials[ i ];
				matLib[ material.userData.code ] = material;

			}

		}

		const topParseScope = this.getCurrentParseScope();
		const newParseScope = {

			lib: matLib,
			url: null,

			// Subobjects
			subobjects: null,
			numSubobjects: 0,
			subobjectIndex: 0,
			inverted: false,
			category: null,
			keywords: null,

			// Current subobject
			currentFileName: null,
			mainColourCode: topParseScope ? topParseScope.mainColourCode : '16',
			mainEdgeColourCode: topParseScope ? topParseScope.mainEdgeColourCode : '24',
			currentMatrix: new Matrix4(),
			matrix: new Matrix4(),

			// If false, it is a root material scope previous to parse
			isFromParse: true,

			triangles: null,
			lineSegments: null,
			conditionalSegments: null,

			// If true, this object is the start of a construction step
			startingConstructionStep: false
		};

		this.parseScopesStack.push( newParseScope );

		return newParseScope;

	}

	removeScopeLevel() {

		this.parseScopesStack.pop();

		return this;

	}

	addMaterial( material ) {

		// Adds a material to the material library which is on top of the parse scopes stack. And also to the materials array

		const matLib = this.getCurrentParseScope().lib;

		if ( ! matLib[ material.userData.code ] ) {

			this.materials.push( material );

		}

		matLib[ material.userData.code ] = material;

		return this;

	}

	getMaterial( colourCode ) {

		// Given a colour code search its material in the parse scopes stack

		if ( colourCode.startsWith( '0x2' ) ) {

			// Special 'direct' material value (RGB colour)

			const colour = colourCode.substring( 3 );

			return this.parseColourMetaDirective( new LineParser( 'Direct_Color_' + colour + ' CODE -1 VALUE #' + colour + ' EDGE #' + colour + '' ) );

		}

		for ( let i = this.parseScopesStack.length - 1; i >= 0; i -- ) {

			const material = this.parseScopesStack[ i ].lib[ colourCode ];

			if ( material ) {

				return material;

			}

		}

		// Material was not found
		return null;

	}

	getParentParseScope() {

		if ( this.parseScopesStack.length > 1 ) {

			return this.parseScopesStack[ this.parseScopesStack.length - 2 ];

		}

		return null;

	}

	getCurrentParseScope() {

		if ( this.parseScopesStack.length > 0 ) {

			return this.parseScopesStack[ this.parseScopesStack.length - 1 ];

		}

		return null;

	}

	parseColourMetaDirective( lineParser ) {

		// Parses a colour definition and returns a THREE.Material or null if error

		let code = null;

		// Triangle and line colours
		let colour = 0xFF00FF;
		let edgeColour = 0xFF00FF;

		// Transparency
		let alpha = 1;
		let isTransparent = false;
		// Self-illumination:
		let luminance = 0;

		let finishType = FINISH_TYPE_DEFAULT;

		let edgeMaterial = null;

		const name = lineParser.getToken();
		if ( ! name ) {

			throw 'LDrawLoader: Material name was expected after "!COLOUR tag' + lineParser.getLineNumberString() + '.';

		}

		// Parse tag tokens and their parameters
		let token = null;
		while ( true ) {

			token = lineParser.getToken();

			if ( ! token ) {

				break;

			}

			switch ( token.toUpperCase() ) {

				case 'CODE':

					code = lineParser.getToken();
					break;

				case 'VALUE':

					colour = lineParser.getToken();
					if ( colour.startsWith( '0x' ) ) {

						colour = '#' + colour.substring( 2 );

					} else if ( ! colour.startsWith( '#' ) ) {

						throw 'LDrawLoader: Invalid colour while parsing material' + lineParser.getLineNumberString() + '.';

					}

					break;

				case 'EDGE':

					edgeColour = lineParser.getToken();
					if ( edgeColour.startsWith( '0x' ) ) {

						edgeColour = '#' + edgeColour.substring( 2 );

					} else if ( ! edgeColour.startsWith( '#' ) ) {

						// Try to see if edge colour is a colour code
						edgeMaterial = this.getMaterial( edgeColour );
						if ( ! edgeMaterial ) {

							throw 'LDrawLoader: Invalid edge colour while parsing material' + lineParser.getLineNumberString() + '.';

						}

						// Get the edge material for this triangle material
						edgeMaterial = edgeMaterial.userData.edgeMaterial;

					}

					break;

				case 'ALPHA':

					alpha = parseInt( lineParser.getToken() );

					if ( isNaN( alpha ) ) {

						throw 'LDrawLoader: Invalid alpha value in material definition' + lineParser.getLineNumberString() + '.';

					}

					alpha = Math.max( 0, Math.min( 1, alpha / 255 ) );

					if ( alpha < 1 ) {

						isTransparent = true;

					}

					break;

				case 'LUMINANCE':

					luminance = parseInt( lineParser.getToken() );

					if ( isNaN( luminance ) ) {

						throw 'LDrawLoader: Invalid luminance value in material definition' + LineParser.getLineNumberString() + '.';

					}

					luminance = Math.max( 0, Math.min( 1, luminance / 255 ) );

					break;

				case 'CHROME':
					finishType = FINISH_TYPE_CHROME;
					break;

				case 'PEARLESCENT':
					finishType = FINISH_TYPE_PEARLESCENT;
					break;

				case 'RUBBER':
					finishType = FINISH_TYPE_RUBBER;
					break;

				case 'MATTE_METALLIC':
					finishType = FINISH_TYPE_MATTE_METALLIC;
					break;

				case 'METAL':
					finishType = FINISH_TYPE_METAL;
					break;

				case 'MATERIAL':
					// Not implemented
					lineParser.setToEnd();
					break;

				default:
					throw 'LDrawLoader: Unknown token "' + token + '" while parsing material' + lineParser.getLineNumberString() + '.';
					break;

			}

		}

		let material = null;

		switch ( finishType ) {

			case FINISH_TYPE_DEFAULT:

				material = new MeshStandardMaterial( { color: colour, roughness: 0.3, metalness: 0 } );
				break;

			case FINISH_TYPE_PEARLESCENT:

				// Try to imitate pearlescency by setting the specular to the complementary of the color, and low shininess
				const specular = new Color( colour );
				const hsl = specular.getHSL( { h: 0, s: 0, l: 0 } );
				hsl.h = ( hsl.h + 0.5 ) % 1;
				hsl.l = Math.min( 1, hsl.l + ( 1 - hsl.l ) * 0.7 );
				specular.setHSL( hsl.h, hsl.s, hsl.l );

				material = new MeshPhongMaterial( { color: colour, specular: specular, shininess: 10, reflectivity: 0.3 } );
				break;

			case FINISH_TYPE_CHROME:

				// Mirror finish surface
				material = new MeshStandardMaterial( { color: colour, roughness: 0, metalness: 1 } );
				break;

			case FINISH_TYPE_RUBBER:

				// Rubber finish
				material = new MeshStandardMaterial( { color: colour, roughness: 0.9, metalness: 0 } );
				break;

			case FINISH_TYPE_MATTE_METALLIC:

				// Brushed metal finish
				material = new MeshStandardMaterial( { color: colour, roughness: 0.8, metalness: 0.4 } );
				break;

			case FINISH_TYPE_METAL:

				// Average metal finish
				material = new MeshStandardMaterial( { color: colour, roughness: 0.2, metalness: 0.85 } );
				break;

			default:
				// Should not happen
				break;

		}

		material.transparent = isTransparent;
		material.premultipliedAlpha = true;
		material.opacity = alpha;
		material.depthWrite = ! isTransparent;

		material.polygonOffset = true;
		material.polygonOffsetFactor = 1;

		if ( luminance !== 0 ) {

			material.emissive.set( material.color ).multiplyScalar( luminance );

		}

		if ( ! edgeMaterial ) {

			// This is the material used for edges
			edgeMaterial = new LineBasicMaterial( {
				color: edgeColour,
				transparent: isTransparent,
				opacity: alpha,
				depthWrite: ! isTransparent
			} );
			edgeMaterial.userData.code = code;
			edgeMaterial.name = name + ' - Edge';

			// This is the material used for conditional edges
			edgeMaterial.userData.conditionalEdgeMaterial = new LDrawConditionalLineMaterial( {

				fog: true,
				transparent: isTransparent,
				depthWrite: ! isTransparent,
				color: edgeColour,
				opacity: alpha,

			} );

		}

		material.userData.code = code;
		material.name = name;

		material.userData.edgeMaterial = edgeMaterial;

		return material;

	}

	//

	objectParse( text ) {

		// Retrieve data from the parent parse scope
		const parentParseScope = this.getParentParseScope();

		// Main colour codes passed to this subobject (or default codes 16 and 24 if it is the root object)
		const mainColourCode = parentParseScope.mainColourCode;
		const mainEdgeColourCode = parentParseScope.mainEdgeColourCode;

		const currentParseScope = this.getCurrentParseScope();

		// Parse result variables
		let triangles;
		let lineSegments;
		let conditionalSegments;

		const subobjects = [];

		let category = null;
		let keywords = null;

		if ( text.indexOf( '\r\n' ) !== - 1 ) {

			// This is faster than String.split with regex that splits on both
			text = text.replace( /\r\n/g, '\n' );

		}

		const lines = text.split( '\n' );
		const numLines = lines.length;

		let parsingEmbeddedFiles = false;
		let currentEmbeddedFileName = null;
		let currentEmbeddedText = null;

		let bfcCertified = false;
		let bfcCCW = true;
		let bfcInverted = false;
		let bfcCull = true;
		let type = '';

		let startingConstructionStep = false;

		const scope = this;
		function parseColourCode( lineParser, forEdge ) {

			// Parses next colour code and returns a THREE.Material

			let colourCode = lineParser.getToken();

			if ( ! forEdge && colourCode === '16' ) {

				colourCode = mainColourCode;

			}

			if ( forEdge && colourCode === '24' ) {

				colourCode = mainEdgeColourCode;

			}

			const material = scope.getMaterial( colourCode );

			if ( ! material ) {

				throw 'LDrawLoader: Unknown colour code "' + colourCode + '" is used' + lineParser.getLineNumberString() + ' but it was not defined previously.';

			}

			return material;

		}

		function parseVector( lp ) {

			const v = new Vector3( parseFloat( lp.getToken() ), parseFloat( lp.getToken() ), parseFloat( lp.getToken() ) );

			if ( ! scope.separateObjects ) {

				v.applyMatrix4( currentParseScope.currentMatrix );

			}

			return v;

		}

		// Parse all line commands
		for ( let lineIndex = 0; lineIndex < numLines; lineIndex ++ ) {

			const line = lines[ lineIndex ];

			if ( line.length === 0 ) continue;

			if ( parsingEmbeddedFiles ) {

				if ( line.startsWith( '0 FILE ' ) ) {

					// Save previous embedded file in the cache
					this.subobjectCache[ currentEmbeddedFileName.toLowerCase() ] = currentEmbeddedText;

					// New embedded text file
					currentEmbeddedFileName = line.substring( 7 );
					currentEmbeddedText = '';

				} else {

					currentEmbeddedText += line + '\n';

				}

				continue;

			}

			const lp = new LineParser( line, lineIndex + 1 );

			lp.seekNonSpace();

			if ( lp.isAtTheEnd() ) {

				// Empty line
				continue;

			}

			// Parse the line type
			const lineType = lp.getToken();

			let material;
			let segment;
			let inverted;
			let ccw;
			let doubleSided;
			let v0, v1, v2, v3, faceNormal;

			switch ( lineType ) {

				// Line type 0: Comment or META
				case '0':

					// Parse meta directive
					const meta = lp.getToken();

					if ( meta ) {

						switch ( meta ) {

							case '!LDRAW_ORG':

								type = lp.getToken();

								currentParseScope.triangles = [];
								currentParseScope.lineSegments = [];
								currentParseScope.conditionalSegments = [];
								currentParseScope.type = type;

								const isRoot = ! parentParseScope.isFromParse;
								if ( isRoot || scope.separateObjects && ! isPrimitiveType( type ) ) {

									currentParseScope.groupObject = new Group();

									currentParseScope.groupObject.userData.startingConstructionStep = currentParseScope.startingConstructionStep;

								}

								// If the scale of the object is negated then the triangle winding order
								// needs to be flipped.
								if (
									currentParseScope.matrix.determinant() < 0 && (
										scope.separateObjects && isPrimitiveType( type ) ||
											! scope.separateObjects
									) ) {

									currentParseScope.inverted = ! currentParseScope.inverted;

								}

								triangles = currentParseScope.triangles;
								lineSegments = currentParseScope.lineSegments;
								conditionalSegments = currentParseScope.conditionalSegments;

								break;

							case '!COLOUR':

								material = this.parseColourMetaDirective( lp );
								if ( material ) {

									this.addMaterial( material );

								}	else {

									console.warn( 'LDrawLoader: Error parsing material' + lp.getLineNumberString() );

								}

								break;

							case '!CATEGORY':

								category = lp.getToken();
								break;

							case '!KEYWORDS':

								const newKeywords = lp.getRemainingString().split( ',' );
								if ( newKeywords.length > 0 ) {

									if ( ! keywords ) {

										keywords = [];

									}

									newKeywords.forEach( function ( keyword ) {

										keywords.push( keyword.trim() );

									} );

								}

								break;

							case 'FILE':

								if ( lineIndex > 0 ) {

									// Start embedded text files parsing
									parsingEmbeddedFiles = true;
									currentEmbeddedFileName = lp.getRemainingString();
									currentEmbeddedText = '';

									bfcCertified = false;
									bfcCCW = true;

								}

								break;

							case 'BFC':

								// Changes to the backface culling state
								while ( ! lp.isAtTheEnd() ) {

									const token = lp.getToken();

									switch ( token ) {

										case 'CERTIFY':
										case 'NOCERTIFY':

											bfcCertified = token === 'CERTIFY';
											bfcCCW = true;

											break;

										case 'CW':
										case 'CCW':

											bfcCCW = token === 'CCW';

											break;

										case 'INVERTNEXT':

											bfcInverted = true;

											break;

										case 'CLIP':
										case 'NOCLIP':

											  bfcCull = token === 'CLIP';

											break;

										default:

											console.warn( 'THREE.LDrawLoader: BFC directive "' + token + '" is unknown.' );

											break;

									}

								}

								break;

							case 'STEP':

								startingConstructionStep = true;

								break;

							default:
								// Other meta directives are not implemented
								break;

						}

					}

					break;

					// Line type 1: Sub-object file
				case '1':

					material = parseColourCode( lp );

					const posX = parseFloat( lp.getToken() );
					const posY = parseFloat( lp.getToken() );
					const posZ = parseFloat( lp.getToken() );
					const m0 = parseFloat( lp.getToken() );
					const m1 = parseFloat( lp.getToken() );
					const m2 = parseFloat( lp.getToken() );
					const m3 = parseFloat( lp.getToken() );
					const m4 = parseFloat( lp.getToken() );
					const m5 = parseFloat( lp.getToken() );
					const m6 = parseFloat( lp.getToken() );
					const m7 = parseFloat( lp.getToken() );
					const m8 = parseFloat( lp.getToken() );

					const matrix = new Matrix4().set(
						m0, m1, m2, posX,
						m3, m4, m5, posY,
						m6, m7, m8, posZ,
						0, 0, 0, 1
					);

					let fileName = lp.getRemainingString().trim().replace( /\\/g, '/' );

					if ( scope.fileMap[ fileName ] ) {

						// Found the subobject path in the preloaded file path map
						fileName = scope.fileMap[ fileName ];

					}	else {

						// Standardized subfolders
						if ( fileName.startsWith( 's/' ) ) {

							fileName = 'parts/' + fileName;

						} else if ( fileName.startsWith( '48/' ) ) {

							fileName = 'p/' + fileName;

						}

					}

					subobjects.push( {
						material: material,
						matrix: matrix,
						fileName: fileName,
						originalFileName: fileName,
						locationState: FILE_LOCATION_AS_IS,
						url: null,
						triedLowerCase: false,
						inverted: bfcInverted !== currentParseScope.inverted,
						startingConstructionStep: startingConstructionStep
					} );

					bfcInverted = false;

					break;

					// Line type 2: Line segment
				case '2':

					material = parseColourCode( lp, true );

					segment = {
						material: material.userData.edgeMaterial,
						colourCode: material.userData.code,
						v0: parseVector( lp ),
						v1: parseVector( lp )
					};

					lineSegments.push( segment );

					break;

					// Line type 5: Conditional Line segment
				case '5':

					material = parseColourCode( lp, true );

					segment = {
						material: material.userData.edgeMaterial.userData.conditionalEdgeMaterial,
						colourCode: material.userData.code,
						v0: parseVector( lp ),
						v1: parseVector( lp ),
						c0: parseVector( lp ),
						c1: parseVector( lp )
					};

					conditionalSegments.push( segment );

					break;

					// Line type 3: Triangle
				case '3':

					material = parseColourCode( lp );

					inverted = currentParseScope.inverted;
					ccw = bfcCCW !== inverted;
					doubleSided = ! bfcCertified || ! bfcCull;

					if ( ccw === true ) {

						v0 = parseVector( lp );
						v1 = parseVector( lp );
						v2 = parseVector( lp );

					} else {

						v2 = parseVector( lp );
						v1 = parseVector( lp );
						v0 = parseVector( lp );

					}

					_tempVec0.subVectors( v1, v0 );
					_tempVec1.subVectors( v2, v1 );
					faceNormal = new Vector3()
						.crossVectors( _tempVec0, _tempVec1 )
						.normalize();

					triangles.push( {
						material: material,
						colourCode: material.userData.code,
						v0: v0,
						v1: v1,
						v2: v2,
						faceNormal: faceNormal,
						n0: null,
						n1: null,
						n2: null,
						fromQuad: false,
					} );

					if ( doubleSided === true ) {

						triangles.push( {
							material: material,
							colourCode: material.userData.code,
							v0: v0,
							v1: v2,
							v2: v1,
							faceNormal: faceNormal,
							n0: null,
							n1: null,
							n2: null,
							fromQuad: false,
						} );

					}

					break;

					// Line type 4: Quadrilateral
				case '4':

					material = parseColourCode( lp );

					inverted = currentParseScope.inverted;
					ccw = bfcCCW !== inverted;
					doubleSided = ! bfcCertified || ! bfcCull;

					if ( ccw === true ) {

						v0 = parseVector( lp );
						v1 = parseVector( lp );
						v2 = parseVector( lp );
						v3 = parseVector( lp );

					} else {

						v3 = parseVector( lp );
						v2 = parseVector( lp );
						v1 = parseVector( lp );
						v0 = parseVector( lp );

					}

					_tempVec0.subVectors( v1, v0 );
					_tempVec1.subVectors( v2, v1 );
					faceNormal = new Vector3()
						.crossVectors( _tempVec0, _tempVec1 )
						.normalize();

					// specifically place the triangle diagonal in the v0 and v1 slots so we can
					// account for the doubling of vertices later when smoothing normals.
					triangles.push( {
						material: material,
						colourCode: material.userData.code,
						v0: v2,
						v1: v0,
						v2: v1,
						faceNormal: faceNormal,
						n0: null,
						n1: null,
						n2: null,
						fromQuad: true,
					} );

					triangles.push( {
						material: material,
						colourCode: material.userData.code,
						v0: v0,
						v1: v2,
						v2: v3,
						faceNormal: faceNormal,
						n0: null,
						n1: null,
						n2: null,
						fromQuad: true,
					} );

					if ( doubleSided === true ) {

						triangles.push( {
							material: material,
							colourCode: material.userData.code,
							v0: v0,
							v1: v2,
							v2: v1,
							faceNormal: faceNormal,
							n0: null,
							n1: null,
							n2: null,
							fromQuad: true,
						} );

						triangles.push( {
							material: material,
							colourCode: material.userData.code,
							v0: v2,
							v1: v0,
							v2: v3,
							faceNormal: faceNormal,
							n0: null,
							n1: null,
							n2: null,
							fromQuad: true,
						} );

					}

					break;

				default:
					throw 'LDrawLoader: Unknown line type "' + lineType + '"' + lp.getLineNumberString() + '.';
					break;

			}

		}

		if ( parsingEmbeddedFiles ) {

			this.subobjectCache[ currentEmbeddedFileName.toLowerCase() ] = currentEmbeddedText;

		}

		currentParseScope.category = category;
		currentParseScope.keywords = keywords;
		currentParseScope.subobjects = subobjects;
		currentParseScope.numSubobjects = subobjects.length;
		currentParseScope.subobjectIndex = 0;

	}

	computeConstructionSteps( model ) {

		// Sets userdata.constructionStep number in Group objects and userData.numConstructionSteps number in the root Group object.

		let stepNumber = 0;

		model.traverse( c => {

			if ( c.isGroup ) {

				if ( c.userData.startingConstructionStep ) {

					stepNumber ++;

				}

				c.userData.constructionStep = stepNumber;

			}

		} );

		model.userData.numConstructionSteps = stepNumber + 1;

	}

	processObject( text, onProcessed, subobject, url ) {

		const scope = this;

		const parseScope = scope.newParseScopeLevel();
		parseScope.url = url;

		const parentParseScope = scope.getParentParseScope();

		// Set current matrix
		if ( subobject ) {

			parseScope.currentMatrix.multiplyMatrices( parentParseScope.currentMatrix, subobject.matrix );
			parseScope.matrix.copy( subobject.matrix );
			parseScope.inverted = subobject.inverted;
			parseScope.startingConstructionStep = subobject.startingConstructionStep;

		}

		// Add to cache
		let currentFileName = parentParseScope.currentFileName;
		if ( currentFileName !== null ) {

			currentFileName = parentParseScope.currentFileName.toLowerCase();

		}

		if ( scope.subobjectCache[ currentFileName ] === undefined ) {

			scope.subobjectCache[ currentFileName ] = text;

		}


		// Parse the object (returns a Group)
		scope.objectParse( text );
		let finishedCount = 0;
		onSubobjectFinish();

		function onSubobjectFinish() {

			finishedCount ++;

			if ( finishedCount === parseScope.subobjects.length + 1 ) {

				finalizeObject();

			} else {

				// Once the previous subobject has finished we can start processing the next one in the list.
				// The subobject processing shares scope in processing so it's important that they be loaded serially
				// to avoid race conditions.
				// Promise.resolve is used as an approach to asynchronously schedule a task _before_ this frame ends to
				// avoid stack overflow exceptions when loading many subobjects from the cache. RequestAnimationFrame
				// will work but causes the load to happen after the next frame which causes the load to take significantly longer.
				const subobject = parseScope.subobjects[ parseScope.subobjectIndex ];
				Promise.resolve().then( function () {

					loadSubobject( subobject );

				} );
				parseScope.subobjectIndex ++;

			}

		}

		function finalizeObject() {

			if ( scope.smoothNormals && parseScope.type === 'Part' ) {

				smoothNormals( parseScope.triangles, parseScope.lineSegments );

			}

			const isRoot = ! parentParseScope.isFromParse;
			if ( scope.separateObjects && ! isPrimitiveType( parseScope.type ) || isRoot ) {

				const objGroup = parseScope.groupObject;

				if ( parseScope.triangles.length > 0 ) {

					objGroup.add( createObject( parseScope.triangles, 3 ) );

				}

				if ( parseScope.lineSegments.length > 0 ) {

					objGroup.add( createObject( parseScope.lineSegments, 2 ) );

				}

				if ( parseScope.conditionalSegments.length > 0 ) {

					objGroup.add( createObject( parseScope.conditionalSegments, 2, true ) );

				}

				if ( parentParseScope.groupObject ) {

					objGroup.name = parseScope.fileName;
					objGroup.userData.category = parseScope.category;
					objGroup.userData.keywords = parseScope.keywords;
					parseScope.matrix.decompose( objGroup.position, objGroup.quaternion, objGroup.scale );

					parentParseScope.groupObject.add( objGroup );

				}

			} else {

				const separateObjects = scope.separateObjects;
				const parentLineSegments = parentParseScope.lineSegments;
				const parentConditionalSegments = parentParseScope.conditionalSegments;
				const parentTriangles = parentParseScope.triangles;

				const lineSegments = parseScope.lineSegments;
				const conditionalSegments = parseScope.conditionalSegments;
				const triangles = parseScope.triangles;

				for ( let i = 0, l = lineSegments.length; i < l; i ++ ) {

					const ls = lineSegments[ i ];

					if ( separateObjects ) {

						ls.v0.applyMatrix4( parseScope.matrix );
						ls.v1.applyMatrix4( parseScope.matrix );

					}

					parentLineSegments.push( ls );

				}

				for ( let i = 0, l = conditionalSegments.length; i < l; i ++ ) {

					const os = conditionalSegments[ i ];

					if ( separateObjects ) {

						os.v0.applyMatrix4( parseScope.matrix );
						os.v1.applyMatrix4( parseScope.matrix );
						os.c0.applyMatrix4( parseScope.matrix );
						os.c1.applyMatrix4( parseScope.matrix );

					}

					parentConditionalSegments.push( os );

				}

				for ( let i = 0, l = triangles.length; i < l; i ++ ) {

					const tri = triangles[ i ];

					if ( separateObjects ) {

						tri.v0 = tri.v0.clone().applyMatrix4( parseScope.matrix );
						tri.v1 = tri.v1.clone().applyMatrix4( parseScope.matrix );
						tri.v2 = tri.v2.clone().applyMatrix4( parseScope.matrix );

						_tempVec0.subVectors( tri.v1, tri.v0 );
						_tempVec1.subVectors( tri.v2, tri.v1 );
						tri.faceNormal.crossVectors( _tempVec0, _tempVec1 ).normalize();

					}

					parentTriangles.push( tri );

				}

			}

			scope.removeScopeLevel();

			// If it is root object, compute construction steps
			if ( ! parentParseScope.isFromParse ) {

				scope.computeConstructionSteps( parseScope.groupObject );

			}

			if ( onProcessed ) {

				onProcessed( parseScope.groupObject );

			}

		}

		function loadSubobject( subobject ) {

			parseScope.mainColourCode = subobject.material.userData.code;
			parseScope.mainEdgeColourCode = subobject.material.userData.edgeMaterial.userData.code;
			parseScope.currentFileName = subobject.originalFileName;


			// If subobject was cached previously, use the cached one
			const cached = scope.subobjectCache[ subobject.originalFileName.toLowerCase() ];
			if ( cached ) {

				scope.processObject( cached, function ( subobjectGroup ) {

					onSubobjectLoaded( subobjectGroup, subobject );
					onSubobjectFinish();

				}, subobject, url );

				return;

			}

			// Adjust file name to locate the subobject file path in standard locations (always under directory scope.path)
			// Update also subobject.locationState for the next try if this load fails.
			let subobjectURL = subobject.fileName;
			let newLocationState = FILE_LOCATION_NOT_FOUND;

			switch ( subobject.locationState ) {

				case FILE_LOCATION_AS_IS:
					newLocationState = subobject.locationState + 1;
					break;

				case FILE_LOCATION_TRY_PARTS:
					subobjectURL = 'parts/' + subobjectURL;
					newLocationState = subobject.locationState + 1;
					break;

				case FILE_LOCATION_TRY_P:
					subobjectURL = 'p/' + subobjectURL;
					newLocationState = subobject.locationState + 1;
					break;

				case FILE_LOCATION_TRY_MODELS:
					subobjectURL = 'models/' + subobjectURL;
					newLocationState = subobject.locationState + 1;
					break;

				case FILE_LOCATION_TRY_RELATIVE:
					subobjectURL = url.substring( 0, url.lastIndexOf( '/' ) + 1 ) + subobjectURL;
					newLocationState = subobject.locationState + 1;
					break;

				case FILE_LOCATION_TRY_ABSOLUTE:

					if ( subobject.triedLowerCase ) {

						// Try absolute path
						newLocationState = FILE_LOCATION_NOT_FOUND;

					} else {

						// Next attempt is lower case
						subobject.fileName = subobject.fileName.toLowerCase();
						subobjectURL = subobject.fileName;
						subobject.triedLowerCase = true;
						newLocationState = FILE_LOCATION_AS_IS;

					}

					break;

				case FILE_LOCATION_NOT_FOUND:

					// All location possibilities have been tried, give up loading this object
					console.warn( 'LDrawLoader: Subobject "' + subobject.originalFileName + '" could not be found.' );

					return;

			}

			subobject.locationState = newLocationState;
			subobject.url = subobjectURL;

			// Load the subobject
			// Use another file loader here so we can keep track of the subobject information
			// and use it when processing the next model.
			const fileLoader = new FileLoader( scope.manager );
			fileLoader.setPath( scope.path );
			fileLoader.setRequestHeader( scope.requestHeader );
			fileLoader.setWithCredentials( scope.withCredentials );
			fileLoader.load( subobjectURL, function ( text ) {

				scope.processObject( text, function ( subobjectGroup ) {

					onSubobjectLoaded( subobjectGroup, subobject );
					onSubobjectFinish();

				}, subobject, url );

			}, undefined, function ( err ) {

				onSubobjectError( err, subobject );

			}, subobject );

		}

		function onSubobjectLoaded( subobjectGroup, subobject ) {

			if ( subobjectGroup === null ) {

				// Try to reload
				loadSubobject( subobject );
				return;

			}

			scope.fileMap[ subobject.originalFileName ] = subobject.url;

		}

		function onSubobjectError( err, subobject ) {

			// Retry download from a different default possible location
			loadSubobject( subobject );

		}

	}

}

export { LDrawLoader };
