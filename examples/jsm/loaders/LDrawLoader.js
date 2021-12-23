import {
	BufferAttribute,
	BufferGeometry,
	Color,
	FileLoader,
	Group,
	LineBasicMaterial,
	LineSegments,
	Loader,
	Matrix4,
	Mesh,
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

function smoothNormals( faces, lineSegments ) {

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
	const normals = [];

	// Save the list of hard edges by hash
	for ( let i = 0, l = lineSegments.length; i < l; i ++ ) {

		const ls = lineSegments[ i ];
		const vertices = ls.vertices;
		const v0 = vertices[ 0 ];
		const v1 = vertices[ 1 ];
		hardEdges.add( hashEdge( v0, v1 ) );
		hardEdges.add( hashEdge( v1, v0 ) );

	}

	// track the half edges associated with each triangle
	for ( let i = 0, l = faces.length; i < l; i ++ ) {

		const tri = faces[ i ];
		const vertices = tri.vertices;
		const vertCount = vertices.length;
		for ( let i2 = 0; i2 < vertCount; i2 ++ ) {

			const index = i2;
			const next = ( i2 + 1 ) % vertCount;
			const v0 = vertices[ index ];
			const v1 = vertices[ next ];
			const hash = hashEdge( v0, v1 );

			// don't add the triangle if the edge is supposed to be hard
			if ( hardEdges.has( hash ) ) continue;

			const info = {
				index: index,
				tri: tri
			};
			halfEdgeList[ hash ] = info;

		}

	}

	// Iterate until we've tried to connect all faces to share normals
	while ( true ) {

		// Stop if there are no more faces left
		let halfEdge = null;
		for ( const key in halfEdgeList ) {

			halfEdge = halfEdgeList[ key ];
			break;

		}

		if ( halfEdge === null ) {

			break;

		}

		// Exhaustively find all connected faces
		const queue = [ halfEdge ];
		while ( queue.length > 0 ) {

			// initialize all vertex normals in this triangle
			const tri = queue.pop().tri;
			const vertices = tri.vertices;
			const vertNormals = tri.normals;
			const faceNormal = tri.faceNormal;

			// Check if any edge is connected to another triangle edge
			const vertCount = vertices.length;
			for ( let i2 = 0; i2 < vertCount; i2 ++ ) {

				const index = i2;
				const next = ( i2 + 1 ) % vertCount;
				const v0 = vertices[ index ];
				const v1 = vertices[ next ];

				// delete this triangle from the list so it won't be found again
				const hash = hashEdge( v0, v1 );
				delete halfEdgeList[ hash ];

				const reverseHash = hashEdge( v1, v0 );
				const otherInfo = halfEdgeList[ reverseHash ];
				if ( otherInfo ) {

					const otherTri = otherInfo.tri;
					const otherIndex = otherInfo.index;
					const otherNormals = otherTri.normals;
					const otherVertCount = otherNormals.length;
					const otherFaceNormal = otherTri.faceNormal;

					// NOTE: If the angle between faces is > 67.5 degrees then assume it's
					// hard edge. There are some cases where the line segments do not line up exactly
					// with or span multiple triangle edges (see Lunar Vehicle wheels).
					if ( Math.abs( otherTri.faceNormal.dot( tri.faceNormal ) ) < 0.25 ) {

						continue;

					}

					// if this triangle has already been traversed then it won't be in
					// the halfEdgeList. If it has not then add it to the queue and delete
					// it so it won't be found again.
					if ( reverseHash in halfEdgeList ) {

						queue.push( otherInfo );
						delete halfEdgeList[ reverseHash ];

					}

					// share the first normal
					const otherNext = ( otherIndex + 1 ) % otherVertCount;
					if (
						vertNormals[ index ] && otherNormals[ otherNext ] &&
						vertNormals[ index ] !== otherNormals[ otherNext ]
					) {

						otherNormals[ otherNext ].norm.add( vertNormals[ index ].norm );
						vertNormals[ index ].norm = otherNormals[ otherNext ].norm;

					}

					let sharedNormal1 = vertNormals[ index ] || otherNormals[ otherNext ];
					if ( sharedNormal1 === null ) {

						// it's possible to encounter an edge of a triangle that has already been traversed meaning
						// both edges already have different normals defined and shared. To work around this we create
						// a wrapper object so when those edges are merged the normals can be updated everywhere.
						sharedNormal1 = { norm: new Vector3() };
						normals.push( sharedNormal1.norm );

					}

					if ( vertNormals[ index ] === null ) {

						vertNormals[ index ] = sharedNormal1;
						sharedNormal1.norm.add( faceNormal );

					}

					if ( otherNormals[ otherNext ] === null ) {

						otherNormals[ otherNext ] = sharedNormal1;
						sharedNormal1.norm.add( otherFaceNormal );

					}

					// share the second normal
					if (
						vertNormals[ next ] && otherNormals[ otherIndex ] &&
						vertNormals[ next ] !== otherNormals[ otherIndex ]
					) {

						otherNormals[ otherIndex ].norm.add( vertNormals[ next ].norm );
						vertNormals[ next ].norm = otherNormals[ otherIndex ].norm;

					}

					let sharedNormal2 = vertNormals[ next ] || otherNormals[ otherIndex ];
					if ( sharedNormal2 === null ) {

						sharedNormal2 = { norm: new Vector3() };
						normals.push( sharedNormal2.norm );

					}

					if ( vertNormals[ next ] === null ) {

						vertNormals[ next ] = sharedNormal2;
						sharedNormal2.norm.add( faceNormal );

					}

					if ( otherNormals[ otherIndex ] === null ) {

						otherNormals[ otherIndex ] = sharedNormal2;
						sharedNormal2.norm.add( otherFaceNormal );

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

function isPartType( type ) {

	return type === 'Part';

}

function isModelType( type ) {

	return type === 'Model' || type === 'Unofficial_Model';

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

class LDrawFileCache {

	constructor( loader ) {

		this.cache = {};
		this.loader = loader;

	}

	setData( key, contents ) {

		this.cache[ key.toLowerCase() ] = contents;

	}

	async loadData( fileName ) {

		const key = fileName.toLowerCase();
		if ( key in this.cache ) {

			return this.cache[ key ];

		}

		this.cache[ fileName ] = new Promise( async ( resolve, reject ) => {

			let triedLowerCase = false;
			let locationState = FILE_LOCATION_AS_IS;
			while ( locationState !== FILE_LOCATION_NOT_FOUND ) {

				let subobjectURL = fileName;
				switch ( locationState ) {

					case FILE_LOCATION_AS_IS:
						locationState = locationState + 1;
						break;

					case FILE_LOCATION_TRY_PARTS:
						subobjectURL = 'parts/' + subobjectURL;
						locationState = locationState + 1;
						break;

					case FILE_LOCATION_TRY_P:
						subobjectURL = 'p/' + subobjectURL;
						locationState = locationState + 1;
						break;

					case FILE_LOCATION_TRY_MODELS:
						subobjectURL = 'models/' + subobjectURL;
						locationState = locationState + 1;
						break;

					case FILE_LOCATION_TRY_RELATIVE:
						subobjectURL = fileName.substring( 0, fileName.lastIndexOf( '/' ) + 1 ) + subobjectURL;
						locationState = locationState + 1;
						break;

					case FILE_LOCATION_TRY_ABSOLUTE:

						if ( triedLowerCase ) {

							// Try absolute path
							locationState = FILE_LOCATION_NOT_FOUND;

						} else {

							// Next attempt is lower case
							fileName = fileName.toLowerCase();
							subobjectURL = fileName;
							triedLowerCase = true;
							locationState = FILE_LOCATION_AS_IS;

						}

						break;

				}

				const loader = this.loader;
				const fileLoader = new FileLoader( loader.manager );
				fileLoader.setPath( loader.partsLibraryPath );
				fileLoader.setRequestHeader( loader.requestHeader );
				fileLoader.setWithCredentials( loader.withCredentials );

				try {

					const text = await fileLoader.loadAsync( subobjectURL );
					this.setData( fileName, text );
					resolve( text );
					return;

				} catch {

					continue;

				}

			}

			reject();

		} );

		return this.cache[ fileName ];

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

function createObject( elements, elementSize, isConditionalSegments = false, totalElements = null ) {

	// Creates a LineSegments (elementSize = 2) or a Mesh (elementSize = 3 )
	// With per face / segment material, implemented with mesh groups and materials array

	// Sort the faces or line segments by colour code to make later the mesh groups
	elements.sort( sortByMaterial );

	if ( totalElements === null ) {

		totalElements = elements.length;

	}

	const positions = new Float32Array( elementSize * totalElements * 3 );
	const normals = elementSize === 3 ? new Float32Array( elementSize * totalElements * 3 ) : null;
	const materials = [];

	const quadArray = new Array( 6 );
	const bufferGeometry = new BufferGeometry();
	let prevMaterial = null;
	let index0 = 0;
	let numGroupVerts = 0;
	let offset = 0;

	for ( let iElem = 0, nElem = elements.length; iElem < nElem; iElem ++ ) {

		const elem = elements[ iElem ];
		let vertices = elem.vertices;
		if ( vertices.length === 4 ) {

			quadArray[ 0 ] = vertices[ 0 ];
			quadArray[ 1 ] = vertices[ 1 ];
			quadArray[ 2 ] = vertices[ 2 ];
			quadArray[ 3 ] = vertices[ 0 ];
			quadArray[ 4 ] = vertices[ 2 ];
			quadArray[ 5 ] = vertices[ 3 ];
			vertices = quadArray;

		}

		for ( let j = 0, l = vertices.length; j < l; j ++ ) {

			const v = vertices[ j ];
			const index = offset + j * 3;
			positions[ index + 0 ] = v.x;
			positions[ index + 1 ] = v.y;
			positions[ index + 2 ] = v.z;

		}

		if ( elementSize === 3 ) {

			let elemNormals = elem.normals;
			if ( elemNormals.length === 4 ) {

				quadArray[ 0 ] = elemNormals[ 0 ];
				quadArray[ 1 ] = elemNormals[ 1 ];
				quadArray[ 2 ] = elemNormals[ 2 ];
				quadArray[ 3 ] = elemNormals[ 0 ];
				quadArray[ 4 ] = elemNormals[ 2 ];
				quadArray[ 5 ] = elemNormals[ 3 ];
				elemNormals = quadArray;

			}

			for ( let j = 0, l = elemNormals.length; j < l; j ++ ) {

				let n = elem.faceNormal;
				if ( elemNormals[ j ] ) {

					n = elemNormals[ j ].norm;

				}

				const index = offset + j * 3;
				normals[ index + 0 ] = n.x;
				normals[ index + 1 ] = n.y;
				normals[ index + 2 ] = n.z;

			}

		}

		if ( prevMaterial !== elem.material ) {

			if ( prevMaterial !== null ) {

				bufferGeometry.addGroup( index0, numGroupVerts, materials.length - 1 );

			}

			materials.push( elem.material );

			prevMaterial = elem.material;
			index0 = offset / 3;
			numGroupVerts = vertices.length;

		} else {

			numGroupVerts += vertices.length;

		}

		offset += 3 * vertices.length;

	}

	if ( numGroupVerts > 0 ) {

		bufferGeometry.addGroup( index0, Infinity, materials.length - 1 );

	}

	bufferGeometry.setAttribute( 'position', new BufferAttribute( positions, 3 ) );

	if ( normals !== null ) {

		bufferGeometry.setAttribute( 'normal', new BufferAttribute( normals, 3 ) );

	}

	let object3d = null;

	if ( elementSize === 2 ) {

		object3d = new LineSegments( bufferGeometry, materials.length === 1 ? materials[ 0 ] : materials );

	} else if ( elementSize === 3 ) {

		object3d = new Mesh( bufferGeometry, materials.length === 1 ? materials[ 0 ] : materials );

	}

	if ( isConditionalSegments ) {

		object3d.isConditionalLine = true;

		const controlArray0 = new Float32Array( elements.length * 3 * 2 );
		const controlArray1 = new Float32Array( elements.length * 3 * 2 );
		const directionArray = new Float32Array( elements.length * 3 * 2 );
		for ( let i = 0, l = elements.length; i < l; i ++ ) {

			const os = elements[ i ];
			const vertices = os.vertices;
			const controlPoints = os.controlPoints;
			const c0 = controlPoints[ 0 ];
			const c1 = controlPoints[ 1 ];
			const v0 = vertices[ 0 ];
			const v1 = vertices[ 1 ];
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

		// Array of THREE.Material
		this.materials = [];

		// Not using THREE.Cache here because it returns the previous HTML error response instead of calling onError()
		// This also allows to handle the embedded text files ("0 FILE" lines)
		this.cache = new LDrawFileCache( this );

		// This object is a map from file names to paths. It agilizes the paths search. If it is not set then files will be searched by trial and error.
		this.fileMap = null;

		this.rootParseScope = this.newParseScopeLevel();

		// Add default main triangle and line edge materials (used in pieces that can be coloured with a main color)
		this.setMaterials( [
			this.parseColourMetaDirective( new LineParser( 'Main_Colour CODE 16 VALUE #FF8080 EDGE #333333' ) ),
			this.parseColourMetaDirective( new LineParser( 'Edge_Colour CODE 24 VALUE #A0A0A0 EDGE #333333' ) )
		] );

		// If this flag is set to true, each subobject will be a Object.
		// If not (the default), only one object which contains all the merged primitives will be created.
		this.separateObjects = false;

		// If this flag is set to true the vertex normals will be smoothed.
		this.smoothNormals = true;

		// The path to load parts from the LDraw parts library from.
		this.partsLibraryPath = '';

	}

	setPartsLibraryPath( path ) {

		this.partsLibraryPath = path;
		return this;

	}

	async preloadMaterials( url ) {

		const fileLoader = new FileLoader( this.manager );
		fileLoader.setPath( this.path );
		fileLoader.setRequestHeader( this.requestHeader );
		fileLoader.setWithCredentials( this.withCredentials );

		const text = await fileLoader.loadAsync( url );
		const colorLineRegex = /^0 !COLOUR/;
		const lines = text.split( /[\n\r]/g );
		const materials = [];
		for ( let i = 0, l = lines.length; i < l; i ++ ) {

			const line = lines[ i ];
			if ( colorLineRegex.test( line ) ) {

				const directive = line.replace( colorLineRegex, '' );
				const material = this.parseColourMetaDirective( new LineParser( directive ) );
				materials.push( material );

			}

		}

		this.setMaterials( materials );

	}

	load( url, onLoad, onProgress, onError ) {

		if ( ! this.fileMap ) {

			this.fileMap = {};

		}

		const fileLoader = new FileLoader( this.manager );
		fileLoader.setPath( this.path );
		fileLoader.setRequestHeader( this.requestHeader );
		fileLoader.setWithCredentials( this.withCredentials );
		fileLoader.load( url, text => {

			this.processObject( text, null, url, this.rootParseScope )
				.then( function ( result ) {

					onLoad( result.groupObject );

				} );

		}, onProgress, onError );

	}

	parse( text, path, onLoad ) {

		// Async parse.  This function calls onParse with the parsed THREE.Object3D as parameter
		this.processObject( text, null, path, this.rootParseScope )
			.then( function ( result ) {

				onLoad( result.groupObject );

			} );

	}

	setMaterials( materials ) {

		// Clears parse scopes stack, adds new scope with material library
		this.rootParseScope = this.newParseScopeLevel( materials );
		this.rootParseScope.isFromParse = false;

		this.materials = materials;

		return this;

	}

	setFileMap( fileMap ) {

		this.fileMap = fileMap;

		return this;

	}

	newParseScopeLevel( materials = null, parentScope = null ) {

		// Adds a new scope level, assign materials to it and returns it

		const matLib = {};

		if ( materials ) {

			for ( let i = 0, n = materials.length; i < n; i ++ ) {

				const material = materials[ i ];
				matLib[ material.userData.code ] = material;

			}

		}

		const newParseScope = {

			parentScope: parentScope,
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
			mainColourCode: parentScope ? parentScope.mainColourCode : '16',
			mainEdgeColourCode: parentScope ? parentScope.mainEdgeColourCode : '24',
			currentMatrix: new Matrix4(),
			matrix: new Matrix4(),
			type: 'Model',
			groupObject: null,

			// If false, it is a root material scope previous to parse
			isFromParse: true,

			faces: [],
			lineSegments: [],
			conditionalSegments: [],
			totalFaces: 0,

			// If true, this object is the start of a construction step
			startingConstructionStep: false
		};

		return newParseScope;

	}

	addMaterial( material, parseScope ) {

		// Adds a material to the material library which is on top of the parse scopes stack. And also to the materials array

		const matLib = parseScope.lib;

		if ( ! matLib[ material.userData.code ] ) {

			this.materials.push( material );

		}

		matLib[ material.userData.code ] = material;

		return this;

	}

	getMaterial( colourCode, parseScope = this.rootParseScope ) {

		// Given a colour code search its material in the parse scopes stack

		if ( colourCode.startsWith( '0x2' ) ) {

			// Special 'direct' material value (RGB colour)

			const colour = colourCode.substring( 3 );

			return this.parseColourMetaDirective( new LineParser( 'Direct_Color_' + colour + ' CODE -1 VALUE #' + colour + ' EDGE #' + colour + '' ) );

		}

		while ( parseScope ) {

			const material = parseScope.lib[ colourCode ];

			if ( material ) {

				return material;

			} else {

				parseScope = parseScope.parentScope;

			}

		}

		// Material was not found
		return null;

	}

	parseColourMetaDirective( lineParser ) {

		// Parses a colour definition and returns a THREE.Material

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

				// Try to imitate pearlescency by making the surface glossy
				material = new MeshStandardMaterial( { color: colour, roughness: 0.3, metalness: 0.25 } );
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

	objectParse( text, parseScope ) {

		// Retrieve data from the parent parse scope
		const currentParseScope = parseScope;
		const parentParseScope = currentParseScope.parentScope;

		// Main colour codes passed to this subobject (or default codes 16 and 24 if it is the root object)
		const mainColourCode = currentParseScope.mainColourCode;
		const mainEdgeColourCode = currentParseScope.mainEdgeColourCode;


		// Parse result variables
		let faces;
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

			const material = scope.getMaterial( colourCode, currentParseScope );

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
					this.cache.setData( currentEmbeddedFileName.toLowerCase(), currentEmbeddedText );

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
			let v0, v1, v2, v3, c0, c1, faceNormal;

			switch ( lineType ) {

				// Line type 0: Comment or META
				case '0':

					// Parse meta directive
					const meta = lp.getToken();

					if ( meta ) {

						switch ( meta ) {

							case '!LDRAW_ORG':

								type = lp.getToken();

								currentParseScope.type = type;

								// If the scale of the object is negated then the triangle winding order
								// needs to be flipped.
								if (
									currentParseScope.matrix.determinant() < 0 && (
										scope.separateObjects && isPrimitiveType( type ) ||
											! scope.separateObjects
									) ) {

									currentParseScope.inverted = ! currentParseScope.inverted;

								}

								faces = currentParseScope.faces;
								lineSegments = currentParseScope.lineSegments;
								conditionalSegments = currentParseScope.conditionalSegments;

								break;

							case '!COLOUR':

								material = this.parseColourMetaDirective( lp );
								if ( material ) {

									this.addMaterial( material, parseScope );

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

					} else {

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
						inverted: bfcInverted !== currentParseScope.inverted,
						startingConstructionStep: startingConstructionStep
					} );

					bfcInverted = false;

					break;

					// Line type 2: Line segment
				case '2':

					material = parseColourCode( lp, true );
					v0 = parseVector( lp );
					v1 = parseVector( lp );

					segment = {
						material: material.userData.edgeMaterial,
						colourCode: material.userData.code,
						v0: v0,
						v1: v1,

						vertices: [ v0, v1 ],
					};

					lineSegments.push( segment );

					break;

					// Line type 5: Conditional Line segment
				case '5':

					material = parseColourCode( lp, true );
					v0 = parseVector( lp );
					v1 = parseVector( lp );
					c0 = parseVector( lp );
					c1 = parseVector( lp );

					segment = {
						material: material.userData.edgeMaterial.userData.conditionalEdgeMaterial,
						colourCode: material.userData.code,
						vertices: [ v0, v1 ],
						controlPoints: [ c0, c1 ],
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

					faces.push( {
						material: material,
						colourCode: material.userData.code,
						faceNormal: faceNormal,
						vertices: [ v0, v1, v2 ],
						normals: [ null, null, null ],
					} );
					currentParseScope.totalFaces ++;

					if ( doubleSided === true ) {

						faces.push( {
							material: material,
							colourCode: material.userData.code,
							faceNormal: faceNormal,
							vertices: [ v2, v1, v0 ],
							normals: [ null, null, null ],
						} );
						currentParseScope.totalFaces ++;

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
					faces.push( {
						material: material,
						colourCode: material.userData.code,
						faceNormal: faceNormal,
						vertices: [ v0, v1, v2, v3 ],
						normals: [ null, null, null, null ],
					} );
					currentParseScope.totalFaces += 2;

					if ( doubleSided === true ) {

						faces.push( {
							material: material,
							colourCode: material.userData.code,
							faceNormal: faceNormal,
							vertices: [ v3, v2, v1, v0 ],
							normals: [ null, null, null, null ],
						} );
						currentParseScope.totalFaces += 2;

					}

					break;

				default:
					throw 'LDrawLoader: Unknown line type "' + lineType + '"' + lp.getLineNumberString() + '.';
					break;

			}

		}

		if ( parsingEmbeddedFiles ) {

			this.cache.setData( currentEmbeddedFileName.toLowerCase(), currentEmbeddedText );

		}

		currentParseScope.category = category;
		currentParseScope.keywords = keywords;
		currentParseScope.subobjects = subobjects;
		currentParseScope.numSubobjects = subobjects.length;
		currentParseScope.subobjectIndex = 0;

		const isRoot = ! parentParseScope.isFromParse;
		if ( isRoot || scope.separateObjects && ! isPrimitiveType( type ) ) {

			currentParseScope.groupObject = new Group();
			currentParseScope.groupObject.userData.startingConstructionStep = currentParseScope.startingConstructionStep;

		}

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

	finalizeObject( subobjectParseScope ) {

		// fail gracefully if an object could not be loaded
		if ( subobjectParseScope === null ) {

			return;

		}

		const parentParseScope = subobjectParseScope.parentScope;

		// Smooth the normals if this is a part or if this is a case where the subpart
		// is added directly into the parent model (meaning it will never get smoothed by
		// being added to a part)
		const doSmooth =
			isPartType( subobjectParseScope.type ) ||
			(
				! isPartType( subobjectParseScope.type ) &&
				! isModelType( subobjectParseScope.type ) &&
				isModelType( subobjectParseScope.parentScope.type )
			);

		if ( this.smoothNormals && doSmooth ) {

			smoothNormals( subobjectParseScope.faces, subobjectParseScope.lineSegments );

		}

		const isRoot = ! parentParseScope.isFromParse;
		if ( this.separateObjects && ! isPrimitiveType( subobjectParseScope.type ) || isRoot ) {

			const objGroup = subobjectParseScope.groupObject;

			if ( subobjectParseScope.faces.length > 0 ) {

				objGroup.add( createObject( subobjectParseScope.faces, 3, false, subobjectParseScope.totalFaces ) );

			}

			if ( subobjectParseScope.lineSegments.length > 0 ) {

				objGroup.add( createObject( subobjectParseScope.lineSegments, 2 ) );

			}

			if ( subobjectParseScope.conditionalSegments.length > 0 ) {

				objGroup.add( createObject( subobjectParseScope.conditionalSegments, 2, true ) );

			}

			if ( parentParseScope.groupObject ) {

				objGroup.name = subobjectParseScope.fileName;
				objGroup.userData.category = subobjectParseScope.category;
				objGroup.userData.keywords = subobjectParseScope.keywords;
				subobjectParseScope.matrix.decompose( objGroup.position, objGroup.quaternion, objGroup.scale );

				parentParseScope.groupObject.add( objGroup );

			}

		} else {

			const separateObjects = this.separateObjects;
			const parentLineSegments = parentParseScope.lineSegments;
			const parentConditionalSegments = parentParseScope.conditionalSegments;
			const parentFaces = parentParseScope.faces;

			const lineSegments = subobjectParseScope.lineSegments;
			const conditionalSegments = subobjectParseScope.conditionalSegments;
			const faces = subobjectParseScope.faces;

			for ( let i = 0, l = lineSegments.length; i < l; i ++ ) {

				const ls = lineSegments[ i ];

				if ( separateObjects ) {

					const vertices = ls.vertices;
					vertices[ 0 ].applyMatrix4( subobjectParseScope.matrix );
					vertices[ 1 ].applyMatrix4( subobjectParseScope.matrix );

				}

				parentLineSegments.push( ls );

			}

			for ( let i = 0, l = conditionalSegments.length; i < l; i ++ ) {

				const os = conditionalSegments[ i ];

				if ( separateObjects ) {

					const vertices = os.vertices;
					const controlPoints = os.controlPoints;
					vertices[ 0 ].applyMatrix4( subobjectParseScope.matrix );
					vertices[ 1 ].applyMatrix4( subobjectParseScope.matrix );
					controlPoints[ 0 ].applyMatrix4( subobjectParseScope.matrix );
					controlPoints[ 1 ].applyMatrix4( subobjectParseScope.matrix );

				}

				parentConditionalSegments.push( os );

			}

			for ( let i = 0, l = faces.length; i < l; i ++ ) {

				const tri = faces[ i ];

				if ( separateObjects ) {

					const vertices = tri.vertices;
					for ( let i = 0, l = vertices.length; i < l; i ++ ) {

						vertices[ i ] = vertices[ i ].clone().applyMatrix4( subobjectParseScope.matrix );

					}

					_tempVec0.subVectors( vertices[ 1 ], vertices[ 0 ] );
					_tempVec1.subVectors( vertices[ 2 ], vertices[ 1 ] );
					tri.faceNormal.crossVectors( _tempVec0, _tempVec1 ).normalize();

				}

				parentFaces.push( tri );

			}

			parentParseScope.totalFaces += subobjectParseScope.totalFaces;

		}

	}

	async processObject( text, subobject, url, parentScope ) {

		const scope = this;

		const parseScope = this.newParseScopeLevel( null, parentScope );
		parseScope.url = url;

		const parentParseScope = parseScope.parentScope;

		// Set current matrix
		if ( subobject ) {

			parseScope.currentMatrix.multiplyMatrices( parentParseScope.currentMatrix, subobject.matrix );
			parseScope.matrix.copy( subobject.matrix );
			parseScope.inverted = subobject.inverted;
			parseScope.startingConstructionStep = subobject.startingConstructionStep;
			parseScope.mainColourCode = subobject.material.userData.code;
			parseScope.mainEdgeColourCode = subobject.material.userData.edgeMaterial.userData.code;
			parseScope.fileName = subobject.fileName;

		}

		// Parse the object
		this.objectParse( text, parseScope );

		const subobjects = parseScope.subobjects;
		const promises = [];
		for ( let i = 0, l = subobjects.length; i < l; i ++ ) {

			promises.push( loadSubobject( parseScope.subobjects[ i ] ) );

		}

		// Kick off of the downloads in parallel but process all the subobjects
		// in order so all the assembly instructions are correct
		const subobjectScopes = await Promise.all( promises );
		for ( let i = 0, l = subobjectScopes.length; i < l; i ++ ) {

			this.finalizeObject( subobjectScopes[ i ] );

		}

		// If it is root object then finalize this object and compute construction steps
		if ( ! parentParseScope.isFromParse ) {

			this.finalizeObject( parseScope );
			this.computeConstructionSteps( parseScope.groupObject );

		}

		return parseScope;

		function loadSubobject( subobject ) {

			return scope.cache.loadData( subobject.fileName ).then( function ( text ) {

				return scope.processObject( text, subobject, url, parseScope );

			} ).catch( function () {

				console.warn( 'LDrawLoader: Subobject "' + subobject.fileName + '" could not be found.' );
				return null;

			} );

		}

	}

}

export { LDrawLoader };
