import {
	AmbientLight,
	AnimationClip,
	Bone,
	BufferGeometry,
	ClampToEdgeWrapping,
	Color,
	DirectionalLight,
	DoubleSide,
	Euler,
	FileLoader,
	Float32BufferAttribute,
	FrontSide,
	Group,
	Line,
	LineBasicMaterial,
	LineSegments,
	Loader,
	LoaderUtils,
	MathUtils,
	Matrix4,
	Mesh,
	MeshBasicMaterial,
	MeshLambertMaterial,
	MeshPhongMaterial,
	OrthographicCamera,
	PerspectiveCamera,
	PointLight,
	Quaternion,
	QuaternionKeyframeTrack,
	RepeatWrapping,
	Scene,
	Skeleton,
	SkinnedMesh,
	SpotLight,
	TextureLoader,
	Vector2,
	Vector3,
	VectorKeyframeTrack
} from '../../../build/three.module.js';
import { TGALoader } from '../loaders/TGALoader.js';

class ColladaLoader extends Loader {

	constructor( manager ) {

		super( manager );

	}

	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const path = ( scope.path === '' ) ? LoaderUtils.extractUrlBase( url ) : scope.path;

		const loader = new FileLoader( scope.manager );
		loader.setPath( scope.path );
		loader.setRequestHeader( scope.requestHeader );
		loader.setWithCredentials( scope.withCredentials );
		loader.load( url, function ( text ) {

			try {

				onLoad( scope.parse( text, path ) );

			} catch ( e ) {

				if ( onError ) {

					onError( e );

				} else {

					console.error( e );

				}

				scope.manager.itemError( url );

			}

		}, onProgress, onError );

	}

	parse( text, path ) {

		function getElementsByTagName( xml, name ) {

			// Non recursive xml.getElementsByTagName() ...

			const array = [];
			const childNodes = xml.childNodes;

			for ( let i = 0, l = childNodes.length; i < l; i ++ ) {

				const child = childNodes[ i ];

				if ( child.nodeName === name ) {

					array.push( child );

				}

			}

			return array;

		}

		function parseStrings( text ) {

			if ( text.length === 0 ) return [];

			const parts = text.trim().split( /\s+/ );
			const array = new Array( parts.length );

			for ( let i = 0, l = parts.length; i < l; i ++ ) {

				array[ i ] = parts[ i ];

			}

			return array;

		}

		function parseFloats( text ) {

			if ( text.length === 0 ) return [];

			const parts = text.trim().split( /\s+/ );
			const array = new Array( parts.length );

			for ( let i = 0, l = parts.length; i < l; i ++ ) {

				array[ i ] = parseFloat( parts[ i ] );

			}

			return array;

		}

		function parseInts( text ) {

			if ( text.length === 0 ) return [];

			const parts = text.trim().split( /\s+/ );
			const array = new Array( parts.length );

			for ( let i = 0, l = parts.length; i < l; i ++ ) {

				array[ i ] = parseInt( parts[ i ] );

			}

			return array;

		}

		function parseId( text ) {

			return text.substring( 1 );

		}

		function generateId() {

			return 'three_default_' + ( count ++ );

		}

		function isEmpty( object ) {

			return Object.keys( object ).length === 0;

		}

		// asset

		function parseAsset( xml ) {

			return {
				unit: parseAssetUnit( getElementsByTagName( xml, 'unit' )[ 0 ] ),
				upAxis: parseAssetUpAxis( getElementsByTagName( xml, 'up_axis' )[ 0 ] )
			};

		}

		function parseAssetUnit( xml ) {

			if ( ( xml !== undefined ) && ( xml.hasAttribute( 'meter' ) === true ) ) {

				return parseFloat( xml.getAttribute( 'meter' ) );

			} else {

				return 1; // default 1 meter

			}

		}

		function parseAssetUpAxis( xml ) {

			return xml !== undefined ? xml.textContent : 'Y_UP';

		}

		// library

		function parseLibrary( xml, libraryName, nodeName, parser ) {

			const library = getElementsByTagName( xml, libraryName )[ 0 ];

			if ( library !== undefined ) {

				const elements = getElementsByTagName( library, nodeName );

				for ( let i = 0; i < elements.length; i ++ ) {

					parser( elements[ i ] );

				}

			}

		}

		function buildLibrary( data, builder ) {

			for ( const name in data ) {

				const object = data[ name ];
				object.build = builder( data[ name ] );

			}

		}

		// get

		function getBuild( data, builder ) {

			if ( data.build !== undefined ) return data.build;

			data.build = builder( data );

			return data.build;

		}

		// animation

		function parseAnimation( xml ) {

			const data = {
				sources: {},
				samplers: {},
				channels: {}
			};

			let hasChildren = false;

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				let id;

				switch ( child.nodeName ) {

					case 'source':
						id = child.getAttribute( 'id' );
						data.sources[ id ] = parseSource( child );
						break;

					case 'sampler':
						id = child.getAttribute( 'id' );
						data.samplers[ id ] = parseAnimationSampler( child );
						break;

					case 'channel':
						id = child.getAttribute( 'target' );
						data.channels[ id ] = parseAnimationChannel( child );
						break;

					case 'animation':
						// hierarchy of related animations
						parseAnimation( child );
						hasChildren = true;
						break;

					default:
						console.log( child );

				}

			}

			if ( hasChildren === false ) {

				// since 'id' attributes can be optional, it's necessary to generate a UUID for unqiue assignment

				library.animations[ xml.getAttribute( 'id' ) || MathUtils.generateUUID() ] = data;

			}

		}

		function parseAnimationSampler( xml ) {

			const data = {
				inputs: {},
			};

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'input':
						const id = parseId( child.getAttribute( 'source' ) );
						const semantic = child.getAttribute( 'semantic' );
						data.inputs[ semantic ] = id;
						break;

				}

			}

			return data;

		}

		function parseAnimationChannel( xml ) {

			const data = {};

			const target = xml.getAttribute( 'target' );

			// parsing SID Addressing Syntax

			let parts = target.split( '/' );

			const id = parts.shift();
			let sid = parts.shift();

			// check selection syntax

			const arraySyntax = ( sid.indexOf( '(' ) !== - 1 );
			const memberSyntax = ( sid.indexOf( '.' ) !== - 1 );

			if ( memberSyntax ) {

				//  member selection access

				parts = sid.split( '.' );
				sid = parts.shift();
				data.member = parts.shift();

			} else if ( arraySyntax ) {

				// array-access syntax. can be used to express fields in one-dimensional vectors or two-dimensional matrices.

				const indices = sid.split( '(' );
				sid = indices.shift();

				for ( let i = 0; i < indices.length; i ++ ) {

					indices[ i ] = parseInt( indices[ i ].replace( /\)/, '' ) );

				}

				data.indices = indices;

			}

			data.id = id;
			data.sid = sid;

			data.arraySyntax = arraySyntax;
			data.memberSyntax = memberSyntax;

			data.sampler = parseId( xml.getAttribute( 'source' ) );

			return data;

		}

		function buildAnimation( data ) {

			const tracks = [];

			const channels = data.channels;
			const samplers = data.samplers;
			const sources = data.sources;

			for ( const target in channels ) {

				if ( channels.hasOwnProperty( target ) ) {

					const channel = channels[ target ];
					const sampler = samplers[ channel.sampler ];

					const inputId = sampler.inputs.INPUT;
					const outputId = sampler.inputs.OUTPUT;

					const inputSource = sources[ inputId ];
					const outputSource = sources[ outputId ];

					const animation = buildAnimationChannel( channel, inputSource, outputSource );

					createKeyframeTracks( animation, tracks );

				}

			}

			return tracks;

		}

		function getAnimation( id ) {

			return getBuild( library.animations[ id ], buildAnimation );

		}

		function buildAnimationChannel( channel, inputSource, outputSource ) {

			const node = library.nodes[ channel.id ];
			const object3D = getNode( node.id );

			const transform = node.transforms[ channel.sid ];
			const defaultMatrix = node.matrix.clone().transpose();

			let time, stride;
			let i, il, j, jl;

			const data = {};

			// the collada spec allows the animation of data in various ways.
			// depending on the transform type (matrix, translate, rotate, scale), we execute different logic

			switch ( transform ) {

				case 'matrix':

					for ( i = 0, il = inputSource.array.length; i < il; i ++ ) {

						time = inputSource.array[ i ];
						stride = i * outputSource.stride;

						if ( data[ time ] === undefined ) data[ time ] = {};

						if ( channel.arraySyntax === true ) {

							const value = outputSource.array[ stride ];
							const index = channel.indices[ 0 ] + 4 * channel.indices[ 1 ];

							data[ time ][ index ] = value;

						} else {

							for ( j = 0, jl = outputSource.stride; j < jl; j ++ ) {

								data[ time ][ j ] = outputSource.array[ stride + j ];

							}

						}

					}

					break;

				case 'translate':
					console.warn( 'THREE.ColladaLoader: Animation transform type "%s" not yet implemented.', transform );
					break;

				case 'rotate':
					console.warn( 'THREE.ColladaLoader: Animation transform type "%s" not yet implemented.', transform );
					break;

				case 'scale':
					console.warn( 'THREE.ColladaLoader: Animation transform type "%s" not yet implemented.', transform );
					break;

			}

			const keyframes = prepareAnimationData( data, defaultMatrix );

			const animation = {
				name: object3D.uuid,
				keyframes: keyframes
			};

			return animation;

		}

		function prepareAnimationData( data, defaultMatrix ) {

			const keyframes = [];

			// transfer data into a sortable array

			for ( const time in data ) {

				keyframes.push( { time: parseFloat( time ), value: data[ time ] } );

			}

			// ensure keyframes are sorted by time

			keyframes.sort( ascending );

			// now we clean up all animation data, so we can use them for keyframe tracks

			for ( let i = 0; i < 16; i ++ ) {

				transformAnimationData( keyframes, i, defaultMatrix.elements[ i ] );

			}

			return keyframes;

			// array sort function

			function ascending( a, b ) {

				return a.time - b.time;

			}

		}

		const position = new Vector3();
		const scale = new Vector3();
		const quaternion = new Quaternion();

		function createKeyframeTracks( animation, tracks ) {

			const keyframes = animation.keyframes;
			const name = animation.name;

			const times = [];
			const positionData = [];
			const quaternionData = [];
			const scaleData = [];

			for ( let i = 0, l = keyframes.length; i < l; i ++ ) {

				const keyframe = keyframes[ i ];

				const time = keyframe.time;
				const value = keyframe.value;

				matrix.fromArray( value ).transpose();
				matrix.decompose( position, quaternion, scale );

				times.push( time );
				positionData.push( position.x, position.y, position.z );
				quaternionData.push( quaternion.x, quaternion.y, quaternion.z, quaternion.w );
				scaleData.push( scale.x, scale.y, scale.z );

			}

			if ( positionData.length > 0 ) tracks.push( new VectorKeyframeTrack( name + '.position', times, positionData ) );
			if ( quaternionData.length > 0 ) tracks.push( new QuaternionKeyframeTrack( name + '.quaternion', times, quaternionData ) );
			if ( scaleData.length > 0 ) tracks.push( new VectorKeyframeTrack( name + '.scale', times, scaleData ) );

			return tracks;

		}

		function transformAnimationData( keyframes, property, defaultValue ) {

			let keyframe;

			let empty = true;
			let i, l;

			// check, if values of a property are missing in our keyframes

			for ( i = 0, l = keyframes.length; i < l; i ++ ) {

				keyframe = keyframes[ i ];

				if ( keyframe.value[ property ] === undefined ) {

					keyframe.value[ property ] = null; // mark as missing

				} else {

					empty = false;

				}

			}

			if ( empty === true ) {

				// no values at all, so we set a default value

				for ( i = 0, l = keyframes.length; i < l; i ++ ) {

					keyframe = keyframes[ i ];

					keyframe.value[ property ] = defaultValue;

				}

			} else {

				// filling gaps

				createMissingKeyframes( keyframes, property );

			}

		}

		function createMissingKeyframes( keyframes, property ) {

			let prev, next;

			for ( let i = 0, l = keyframes.length; i < l; i ++ ) {

				const keyframe = keyframes[ i ];

				if ( keyframe.value[ property ] === null ) {

					prev = getPrev( keyframes, i, property );
					next = getNext( keyframes, i, property );

					if ( prev === null ) {

						keyframe.value[ property ] = next.value[ property ];
						continue;

					}

					if ( next === null ) {

						keyframe.value[ property ] = prev.value[ property ];
						continue;

					}

					interpolate( keyframe, prev, next, property );

				}

			}

		}

		function getPrev( keyframes, i, property ) {

			while ( i >= 0 ) {

				const keyframe = keyframes[ i ];

				if ( keyframe.value[ property ] !== null ) return keyframe;

				i --;

			}

			return null;

		}

		function getNext( keyframes, i, property ) {

			while ( i < keyframes.length ) {

				const keyframe = keyframes[ i ];

				if ( keyframe.value[ property ] !== null ) return keyframe;

				i ++;

			}

			return null;

		}

		function interpolate( key, prev, next, property ) {

			if ( ( next.time - prev.time ) === 0 ) {

				key.value[ property ] = prev.value[ property ];
				return;

			}

			key.value[ property ] = ( ( key.time - prev.time ) * ( next.value[ property ] - prev.value[ property ] ) / ( next.time - prev.time ) ) + prev.value[ property ];

		}

		// animation clips

		function parseAnimationClip( xml ) {

			const data = {
				name: xml.getAttribute( 'id' ) || 'default',
				start: parseFloat( xml.getAttribute( 'start' ) || 0 ),
				end: parseFloat( xml.getAttribute( 'end' ) || 0 ),
				animations: []
			};

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'instance_animation':
						data.animations.push( parseId( child.getAttribute( 'url' ) ) );
						break;

				}

			}

			library.clips[ xml.getAttribute( 'id' ) ] = data;

		}

		function buildAnimationClip( data ) {

			const tracks = [];

			const name = data.name;
			const duration = ( data.end - data.start ) || - 1;
			const animations = data.animations;

			for ( let i = 0, il = animations.length; i < il; i ++ ) {

				const animationTracks = getAnimation( animations[ i ] );

				for ( let j = 0, jl = animationTracks.length; j < jl; j ++ ) {

					tracks.push( animationTracks[ j ] );

				}

			}

			return new AnimationClip( name, duration, tracks );

		}

		function getAnimationClip( id ) {

			return getBuild( library.clips[ id ], buildAnimationClip );

		}

		// controller

		function parseController( xml ) {

			const data = {};

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'skin':
						// there is exactly one skin per controller
						data.id = parseId( child.getAttribute( 'source' ) );
						data.skin = parseSkin( child );
						break;

					case 'morph':
						data.id = parseId( child.getAttribute( 'source' ) );
						console.warn( 'THREE.ColladaLoader: Morph target animation not supported yet.' );
						break;

				}

			}

			library.controllers[ xml.getAttribute( 'id' ) ] = data;

		}

		function parseSkin( xml ) {

			const data = {
				sources: {}
			};

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'bind_shape_matrix':
						data.bindShapeMatrix = parseFloats( child.textContent );
						break;

					case 'source':
						const id = child.getAttribute( 'id' );
						data.sources[ id ] = parseSource( child );
						break;

					case 'joints':
						data.joints = parseJoints( child );
						break;

					case 'vertex_weights':
						data.vertexWeights = parseVertexWeights( child );
						break;

				}

			}

			return data;

		}

		function parseJoints( xml ) {

			const data = {
				inputs: {}
			};

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'input':
						const semantic = child.getAttribute( 'semantic' );
						const id = parseId( child.getAttribute( 'source' ) );
						data.inputs[ semantic ] = id;
						break;

				}

			}

			return data;

		}

		function parseVertexWeights( xml ) {

			const data = {
				inputs: {}
			};

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'input':
						const semantic = child.getAttribute( 'semantic' );
						const id = parseId( child.getAttribute( 'source' ) );
						const offset = parseInt( child.getAttribute( 'offset' ) );
						data.inputs[ semantic ] = { id: id, offset: offset };
						break;

					case 'vcount':
						data.vcount = parseInts( child.textContent );
						break;

					case 'v':
						data.v = parseInts( child.textContent );
						break;

				}

			}

			return data;

		}

		function buildController( data ) {

			const build = {
				id: data.id
			};

			const geometry = library.geometries[ build.id ];

			if ( data.skin !== undefined ) {

				build.skin = buildSkin( data.skin );

				// we enhance the 'sources' property of the corresponding geometry with our skin data

				geometry.sources.skinIndices = build.skin.indices;
				geometry.sources.skinWeights = build.skin.weights;

			}

			return build;

		}

		function buildSkin( data ) {

			const BONE_LIMIT = 4;

			const build = {
				joints: [], // this must be an array to preserve the joint order
				indices: {
					array: [],
					stride: BONE_LIMIT
				},
				weights: {
					array: [],
					stride: BONE_LIMIT
				}
			};

			const sources = data.sources;
			const vertexWeights = data.vertexWeights;

			const vcount = vertexWeights.vcount;
			const v = vertexWeights.v;
			const jointOffset = vertexWeights.inputs.JOINT.offset;
			const weightOffset = vertexWeights.inputs.WEIGHT.offset;

			const jointSource = data.sources[ data.joints.inputs.JOINT ];
			const inverseSource = data.sources[ data.joints.inputs.INV_BIND_MATRIX ];

			const weights = sources[ vertexWeights.inputs.WEIGHT.id ].array;
			let stride = 0;

			let i, j, l;

			// procces skin data for each vertex

			for ( i = 0, l = vcount.length; i < l; i ++ ) {

				const jointCount = vcount[ i ]; // this is the amount of joints that affect a single vertex
				const vertexSkinData = [];

				for ( j = 0; j < jointCount; j ++ ) {

					const skinIndex = v[ stride + jointOffset ];
					const weightId = v[ stride + weightOffset ];
					const skinWeight = weights[ weightId ];

					vertexSkinData.push( { index: skinIndex, weight: skinWeight } );

					stride += 2;

				}

				// we sort the joints in descending order based on the weights.
				// this ensures, we only procced the most important joints of the vertex

				vertexSkinData.sort( descending );

				// now we provide for each vertex a set of four index and weight values.
				// the order of the skin data matches the order of vertices

				for ( j = 0; j < BONE_LIMIT; j ++ ) {

					const d = vertexSkinData[ j ];

					if ( d !== undefined ) {

						build.indices.array.push( d.index );
						build.weights.array.push( d.weight );

					} else {

						build.indices.array.push( 0 );
						build.weights.array.push( 0 );

					}

				}

			}

			// setup bind matrix

			if ( data.bindShapeMatrix ) {

				build.bindMatrix = new Matrix4().fromArray( data.bindShapeMatrix ).transpose();

			} else {

				build.bindMatrix = new Matrix4().identity();

			}

			// process bones and inverse bind matrix data

			for ( i = 0, l = jointSource.array.length; i < l; i ++ ) {

				const name = jointSource.array[ i ];
				const boneInverse = new Matrix4().fromArray( inverseSource.array, i * inverseSource.stride ).transpose();

				build.joints.push( { name: name, boneInverse: boneInverse } );

			}

			return build;

			// array sort function

			function descending( a, b ) {

				return b.weight - a.weight;

			}

		}

		function getController( id ) {

			return getBuild( library.controllers[ id ], buildController );

		}

		// image

		function parseImage( xml ) {

			const data = {
				init_from: getElementsByTagName( xml, 'init_from' )[ 0 ].textContent
			};

			library.images[ xml.getAttribute( 'id' ) ] = data;

		}

		function buildImage( data ) {

			if ( data.build !== undefined ) return data.build;

			return data.init_from;

		}

		function getImage( id ) {

			const data = library.images[ id ];

			if ( data !== undefined ) {

				return getBuild( data, buildImage );

			}

			console.warn( 'THREE.ColladaLoader: Couldn\'t find image with ID:', id );

			return null;

		}

		// effect

		function parseEffect( xml ) {

			const data = {};

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'profile_COMMON':
						data.profile = parseEffectProfileCOMMON( child );
						break;

				}

			}

			library.effects[ xml.getAttribute( 'id' ) ] = data;

		}

		function parseEffectProfileCOMMON( xml ) {

			const data = {
				surfaces: {},
				samplers: {}
			};

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'newparam':
						parseEffectNewparam( child, data );
						break;

					case 'technique':
						data.technique = parseEffectTechnique( child );
						break;

					case 'extra':
						data.extra = parseEffectExtra( child );
						break;

				}

			}

			return data;

		}

		function parseEffectNewparam( xml, data ) {

			const sid = xml.getAttribute( 'sid' );

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'surface':
						data.surfaces[ sid ] = parseEffectSurface( child );
						break;

					case 'sampler2D':
						data.samplers[ sid ] = parseEffectSampler( child );
						break;

				}

			}

		}

		function parseEffectSurface( xml ) {

			const data = {};

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'init_from':
						data.init_from = child.textContent;
						break;

				}

			}

			return data;

		}

		function parseEffectSampler( xml ) {

			const data = {};

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'source':
						data.source = child.textContent;
						break;

				}

			}

			return data;

		}

		function parseEffectTechnique( xml ) {

			const data = {};

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'constant':
					case 'lambert':
					case 'blinn':
					case 'phong':
						data.type = child.nodeName;
						data.parameters = parseEffectParameters( child );
						break;

					case 'extra':
						data.extra = parseEffectExtra( child );
						break;

				}

			}

			return data;

		}

		function parseEffectParameters( xml ) {

			const data = {};

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'emission':
					case 'diffuse':
					case 'specular':
					case 'bump':
					case 'ambient':
					case 'shininess':
					case 'transparency':
						data[ child.nodeName ] = parseEffectParameter( child );
						break;
					case 'transparent':
						data[ child.nodeName ] = {
							opaque: child.hasAttribute( 'opaque' ) ? child.getAttribute( 'opaque' ) : 'A_ONE',
							data: parseEffectParameter( child )
						};
						break;

				}

			}

			return data;

		}

		function parseEffectParameter( xml ) {

			const data = {};

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'color':
						data[ child.nodeName ] = parseFloats( child.textContent );
						break;

					case 'float':
						data[ child.nodeName ] = parseFloat( child.textContent );
						break;

					case 'texture':
						data[ child.nodeName ] = { id: child.getAttribute( 'texture' ), extra: parseEffectParameterTexture( child ) };
						break;

				}

			}

			return data;

		}

		function parseEffectParameterTexture( xml ) {

			const data = {
				technique: {}
			};

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'extra':
						parseEffectParameterTextureExtra( child, data );
						break;

				}

			}

			return data;

		}

		function parseEffectParameterTextureExtra( xml, data ) {

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'technique':
						parseEffectParameterTextureExtraTechnique( child, data );
						break;

				}

			}

		}

		function parseEffectParameterTextureExtraTechnique( xml, data ) {

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'repeatU':
					case 'repeatV':
					case 'offsetU':
					case 'offsetV':
						data.technique[ child.nodeName ] = parseFloat( child.textContent );
						break;

					case 'wrapU':
					case 'wrapV':

						// some files have values for wrapU/wrapV which become NaN via parseInt

						if ( child.textContent.toUpperCase() === 'TRUE' ) {

							data.technique[ child.nodeName ] = 1;

						} else if ( child.textContent.toUpperCase() === 'FALSE' ) {

							data.technique[ child.nodeName ] = 0;

						} else {

							data.technique[ child.nodeName ] = parseInt( child.textContent );

						}

						break;

					case 'bump':
						data[ child.nodeName ] = parseEffectExtraTechniqueBump( child );
						break;

				}

			}

		}

		function parseEffectExtra( xml ) {

			const data = {};

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'technique':
						data.technique = parseEffectExtraTechnique( child );
						break;

				}

			}

			return data;

		}

		function parseEffectExtraTechnique( xml ) {

			const data = {};

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'double_sided':
						data[ child.nodeName ] = parseInt( child.textContent );
						break;

					case 'bump':
						data[ child.nodeName ] = parseEffectExtraTechniqueBump( child );
						break;

				}

			}

			return data;

		}

		function parseEffectExtraTechniqueBump( xml ) {

			var data = {};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'texture':
						data[ child.nodeName ] = { id: child.getAttribute( 'texture' ), texcoord: child.getAttribute( 'texcoord' ), extra: parseEffectParameterTexture( child ) };
						break;

				}

			}

			return data;

		}

		function buildEffect( data ) {

			return data;

		}

		function getEffect( id ) {

			return getBuild( library.effects[ id ], buildEffect );

		}

		// material

		function parseMaterial( xml ) {

			const data = {
				name: xml.getAttribute( 'name' )
			};

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'instance_effect':
						data.url = parseId( child.getAttribute( 'url' ) );
						break;

				}

			}

			library.materials[ xml.getAttribute( 'id' ) ] = data;

		}

		function getTextureLoader( image ) {

			let loader;

			let extension = image.slice( ( image.lastIndexOf( '.' ) - 1 >>> 0 ) + 2 ); // http://www.jstips.co/en/javascript/get-file-extension/
			extension = extension.toLowerCase();

			switch ( extension ) {

				case 'tga':
					loader = tgaLoader;
					break;

				default:
					loader = textureLoader;

			}

			return loader;

		}

		function buildMaterial( data ) {

			const effect = getEffect( data.url );
			const technique = effect.profile.technique;

			let material;

			switch ( technique.type ) {

				case 'phong':
				case 'blinn':
					material = new MeshPhongMaterial();
					break;

				case 'lambert':
					material = new MeshLambertMaterial();
					break;

				default:
					material = new MeshBasicMaterial();
					break;

			}

			material.name = data.name || '';

			function getTexture( textureObject ) {

				const sampler = effect.profile.samplers[ textureObject.id ];
				let image = null;

				// get image

				if ( sampler !== undefined ) {

					const surface = effect.profile.surfaces[ sampler.source ];
					image = getImage( surface.init_from );

				} else {

					console.warn( 'THREE.ColladaLoader: Undefined sampler. Access image directly (see #12530).' );
					image = getImage( textureObject.id );

				}

				// create texture if image is avaiable

				if ( image !== null ) {

					const loader = getTextureLoader( image );

					if ( loader !== undefined ) {

						const texture = loader.load( image );

						const extra = textureObject.extra;

						if ( extra !== undefined && extra.technique !== undefined && isEmpty( extra.technique ) === false ) {

							const technique = extra.technique;

							texture.wrapS = technique.wrapU ? RepeatWrapping : ClampToEdgeWrapping;
							texture.wrapT = technique.wrapV ? RepeatWrapping : ClampToEdgeWrapping;

							texture.offset.set( technique.offsetU || 0, technique.offsetV || 0 );
							texture.repeat.set( technique.repeatU || 1, technique.repeatV || 1 );

						} else {

							texture.wrapS = RepeatWrapping;
							texture.wrapT = RepeatWrapping;

						}

						return texture;

					} else {

						console.warn( 'THREE.ColladaLoader: Loader for texture %s not found.', image );

						return null;

					}

				} else {

					console.warn( 'THREE.ColladaLoader: Couldn\'t create texture with ID:', textureObject.id );

					return null;

				}

			}

			const parameters = technique.parameters;

			for ( const key in parameters ) {

				const parameter = parameters[ key ];

				switch ( key ) {

					case 'diffuse':
						if ( parameter.color ) material.color.fromArray( parameter.color );
						if ( parameter.texture ) material.map = getTexture( parameter.texture );
						break;
					case 'specular':
						if ( parameter.color && material.specular ) material.specular.fromArray( parameter.color );
						if ( parameter.texture ) material.specularMap = getTexture( parameter.texture );
						break;
					case 'bump':
						if ( parameter.texture ) material.normalMap = getTexture( parameter.texture );
						break;
					case 'ambient':
						if ( parameter.texture ) material.lightMap = getTexture( parameter.texture );
						break;
					case 'shininess':
						if ( parameter.float && material.shininess ) material.shininess = parameter.float;
						break;
					case 'emission':
						if ( parameter.color && material.emissive ) material.emissive.fromArray( parameter.color );
						if ( parameter.texture ) material.emissiveMap = getTexture( parameter.texture );
						break;

				}

			}

			//

			let transparent = parameters[ 'transparent' ];
			let transparency = parameters[ 'transparency' ];

			// <transparency> does not exist but <transparent>

			if ( transparency === undefined && transparent ) {

				transparency = {
					float: 1
				};

			}

			// <transparent> does not exist but <transparency>

			if ( transparent === undefined && transparency ) {

				transparent = {
					opaque: 'A_ONE',
					data: {
						color: [ 1, 1, 1, 1 ]
					} };

			}

			if ( transparent && transparency ) {

				// handle case if a texture exists but no color

				if ( transparent.data.texture ) {

					// we do not set an alpha map (see #13792)

					material.transparent = true;

				} else {

					const color = transparent.data.color;

					switch ( transparent.opaque ) {

						case 'A_ONE':
							material.opacity = color[ 3 ] * transparency.float;
							break;
						case 'RGB_ZERO':
							material.opacity = 1 - ( color[ 0 ] * transparency.float );
							break;
						case 'A_ZERO':
							material.opacity = 1 - ( color[ 3 ] * transparency.float );
							break;
						case 'RGB_ONE':
							material.opacity = color[ 0 ] * transparency.float;
							break;
						default:
							console.warn( 'THREE.ColladaLoader: Invalid opaque type "%s" of transparent tag.', transparent.opaque );

					}

					if ( material.opacity < 1 ) material.transparent = true;

				}

			}

			//


			if ( technique.extra !== undefined && technique.extra.technique !== undefined ) {

				const techniques = technique.extra.technique;

				for ( const k in techniques ) {

					const v = techniques[ k ];

					switch ( k ) {

						case 'double_sided':
							material.side = ( v === 1 ? DoubleSide : FrontSide );
							break;

						case 'bump':
							material.normalMap = getTexture( v.texture );
							material.normalScale = new Vector2( 1, 1 );
							break;

					}

				}

			}

			return material;

		}

		function getMaterial( id ) {

			return getBuild( library.materials[ id ], buildMaterial );

		}

		// camera

		function parseCamera( xml ) {

			const data = {
				name: xml.getAttribute( 'name' )
			};

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'optics':
						data.optics = parseCameraOptics( child );
						break;

				}

			}

			library.cameras[ xml.getAttribute( 'id' ) ] = data;

		}

		function parseCameraOptics( xml ) {

			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

				const child = xml.childNodes[ i ];

				switch ( child.nodeName ) {

					case 'technique_common':
						return parseCameraTechnique( child );

				}

			}

			return {};

		}

		function parseCameraTechnique( xml ) {

			const data = {};

			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

				const child = xml.childNodes[ i ];

				switch ( child.nodeName ) {

					case 'perspective':
					case 'orthographic':

						data.technique = child.nodeName;
						data.parameters = parseCameraParameters( child );

						break;

				}

			}

			return data;

		}

		function parseCameraParameters( xml ) {

			const data = {};

			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

				const child = xml.childNodes[ i ];

				switch ( child.nodeName ) {

					case 'xfov':
					case 'yfov':
					case 'xmag':
					case 'ymag':
					case 'znear':
					case 'zfar':
					case 'aspect_ratio':
						data[ child.nodeName ] = parseFloat( child.textContent );
						break;

				}

			}

			return data;

		}

		function buildCamera( data ) {

			let camera;

			switch ( data.optics.technique ) {

				case 'perspective':
					camera = new PerspectiveCamera(
						data.optics.parameters.yfov,
						data.optics.parameters.aspect_ratio,
						data.optics.parameters.znear,
						data.optics.parameters.zfar
					);
					break;

				case 'orthographic':
					let ymag = data.optics.parameters.ymag;
					let xmag = data.optics.parameters.xmag;
					const aspectRatio = data.optics.parameters.aspect_ratio;

					xmag = ( xmag === undefined ) ? ( ymag * aspectRatio ) : xmag;
					ymag = ( ymag === undefined ) ? ( xmag / aspectRatio ) : ymag;

					xmag *= 0.5;
					ymag *= 0.5;

					camera = new OrthographicCamera(
						- xmag, xmag, ymag, - ymag, // left, right, top, bottom
						data.optics.parameters.znear,
						data.optics.parameters.zfar
					);
					break;

				default:
					camera = new PerspectiveCamera();
					break;

			}

			camera.name = data.name || '';

			return camera;

		}

		function getCamera( id ) {

			const data = library.cameras[ id ];

			if ( data !== undefined ) {

				return getBuild( data, buildCamera );

			}

			console.warn( 'THREE.ColladaLoader: Couldn\'t find camera with ID:', id );

			return null;

		}

		// light

		function parseLight( xml ) {

			let data = {};

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'technique_common':
						data = parseLightTechnique( child );
						break;

				}

			}

			library.lights[ xml.getAttribute( 'id' ) ] = data;

		}

		function parseLightTechnique( xml ) {

			const data = {};

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'directional':
					case 'point':
					case 'spot':
					case 'ambient':

						data.technique = child.nodeName;
						data.parameters = parseLightParameters( child );

				}

			}

			return data;

		}

		function parseLightParameters( xml ) {

			const data = {};

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'color':
						const array = parseFloats( child.textContent );
						data.color = new Color().fromArray( array );
						break;

					case 'falloff_angle':
						data.falloffAngle = parseFloat( child.textContent );
						break;

					case 'quadratic_attenuation':
						const f = parseFloat( child.textContent );
						data.distance = f ? Math.sqrt( 1 / f ) : 0;
						break;

				}

			}

			return data;

		}

		function buildLight( data ) {

			let light;

			switch ( data.technique ) {

				case 'directional':
					light = new DirectionalLight();
					break;

				case 'point':
					light = new PointLight();
					break;

				case 'spot':
					light = new SpotLight();
					break;

				case 'ambient':
					light = new AmbientLight();
					break;

			}

			if ( data.parameters.color ) light.color.copy( data.parameters.color );
			if ( data.parameters.distance ) light.distance = data.parameters.distance;

			return light;

		}

		function getLight( id ) {

			const data = library.lights[ id ];

			if ( data !== undefined ) {

				return getBuild( data, buildLight );

			}

			console.warn( 'THREE.ColladaLoader: Couldn\'t find light with ID:', id );

			return null;

		}

		// geometry

		function parseGeometry( xml ) {

			const data = {
				name: xml.getAttribute( 'name' ),
				sources: {},
				vertices: {},
				primitives: []
			};

			const mesh = getElementsByTagName( xml, 'mesh' )[ 0 ];

			// the following tags inside geometry are not supported yet (see https://github.com/mrdoob/three.js/pull/12606): convex_mesh, spline, brep
			if ( mesh === undefined ) return;

			for ( let i = 0; i < mesh.childNodes.length; i ++ ) {

				const child = mesh.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				const id = child.getAttribute( 'id' );

				switch ( child.nodeName ) {

					case 'source':
						data.sources[ id ] = parseSource( child );
						break;

					case 'vertices':
						// data.sources[ id ] = data.sources[ parseId( getElementsByTagName( child, 'input' )[ 0 ].getAttribute( 'source' ) ) ];
						data.vertices = parseGeometryVertices( child );
						break;

					case 'polygons':
						console.warn( 'THREE.ColladaLoader: Unsupported primitive type: ', child.nodeName );
						break;

					case 'lines':
					case 'linestrips':
					case 'polylist':
					case 'triangles':
						data.primitives.push( parseGeometryPrimitive( child ) );
						break;

					default:
						console.log( child );

				}

			}

			library.geometries[ xml.getAttribute( 'id' ) ] = data;

		}

		function parseSource( xml ) {

			const data = {
				array: [],
				stride: 3
			};

			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'float_array':
						data.array = parseFloats( child.textContent );
						break;

					case 'Name_array':
						data.array = parseStrings( child.textContent );
						break;

					case 'technique_common':
						const accessor = getElementsByTagName( child, 'accessor' )[ 0 ];

						if ( accessor !== undefined ) {

							data.stride = parseInt( accessor.getAttribute( 'stride' ) );

						}

						break;

				}

			}

			return data;

		}

		function parseGeometryVertices( xml ) {

			const data = {};

			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				data[ child.getAttribute( 'semantic' ) ] = parseId( child.getAttribute( 'source' ) );

			}

			return data;

		}

		function parseGeometryPrimitive( xml ) {

			const primitive = {
				type: xml.nodeName,
				material: xml.getAttribute( 'material' ),
				count: parseInt( xml.getAttribute( 'count' ) ),
				inputs: {},
				stride: 0,
				hasUV: false
			};

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'input':
						const id = parseId( child.getAttribute( 'source' ) );
						const semantic = child.getAttribute( 'semantic' );
						const offset = parseInt( child.getAttribute( 'offset' ) );
						const set = parseInt( child.getAttribute( 'set' ) );
						const inputname = ( set > 0 ? semantic + set : semantic );
						primitive.inputs[ inputname ] = { id: id, offset: offset };
						primitive.stride = Math.max( primitive.stride, offset + 1 );
						if ( semantic === 'TEXCOORD' ) primitive.hasUV = true;
						break;

					case 'vcount':
						primitive.vcount = parseInts( child.textContent );
						break;

					case 'p':
						primitive.p = parseInts( child.textContent );
						break;

				}

			}

			return primitive;

		}

		function groupPrimitives( primitives ) {

			const build = {};

			for ( let i = 0; i < primitives.length; i ++ ) {

				const primitive = primitives[ i ];

				if ( build[ primitive.type ] === undefined ) build[ primitive.type ] = [];

				build[ primitive.type ].push( primitive );

			}

			return build;

		}

		function checkUVCoordinates( primitives ) {

			let count = 0;

			for ( let i = 0, l = primitives.length; i < l; i ++ ) {

				const primitive = primitives[ i ];

				if ( primitive.hasUV === true ) {

					count ++;

				}

			}

			if ( count > 0 && count < primitives.length ) {

				primitives.uvsNeedsFix = true;

			}

		}

		function buildGeometry( data ) {

			const build = {};

			const sources = data.sources;
			const vertices = data.vertices;
			const primitives = data.primitives;

			if ( primitives.length === 0 ) return {};

			// our goal is to create one buffer geometry for a single type of primitives
			// first, we group all primitives by their type

			const groupedPrimitives = groupPrimitives( primitives );

			for ( const type in groupedPrimitives ) {

				const primitiveType = groupedPrimitives[ type ];

				// second, ensure consistent uv coordinates for each type of primitives (polylist,triangles or lines)

				checkUVCoordinates( primitiveType );

				// third, create a buffer geometry for each type of primitives

				build[ type ] = buildGeometryType( primitiveType, sources, vertices );

			}

			return build;

		}

		function buildGeometryType( primitives, sources, vertices ) {

			const build = {};

			const position = { array: [], stride: 0 };
			const normal = { array: [], stride: 0 };
			const uv = { array: [], stride: 0 };
			const uv2 = { array: [], stride: 0 };
			const color = { array: [], stride: 0 };

			const skinIndex = { array: [], stride: 4 };
			const skinWeight = { array: [], stride: 4 };

			const geometry = new BufferGeometry();

			const materialKeys = [];

			let start = 0;

			for ( let p = 0; p < primitives.length; p ++ ) {

				const primitive = primitives[ p ];
				const inputs = primitive.inputs;

				// groups

				let count = 0;

				switch ( primitive.type ) {

					case 'lines':
					case 'linestrips':
						count = primitive.count * 2;
						break;

					case 'triangles':
						count = primitive.count * 3;
						break;

					case 'polylist':

						for ( let g = 0; g < primitive.count; g ++ ) {

							const vc = primitive.vcount[ g ];

							switch ( vc ) {

								case 3:
									count += 3; // single triangle
									break;

								case 4:
									count += 6; // quad, subdivided into two triangles
									break;

								default:
									count += ( vc - 2 ) * 3; // polylist with more than four vertices
									break;

							}

						}

						break;

					default:
						console.warn( 'THREE.ColladaLoader: Unknow primitive type:', primitive.type );

				}

				geometry.addGroup( start, count, p );
				start += count;

				// material

				if ( primitive.material ) {

					materialKeys.push( primitive.material );

				}

				// geometry data

				for ( const name in inputs ) {

					const input = inputs[ name ];

					switch ( name )	{

						case 'VERTEX':
							for ( const key in vertices ) {

								const id = vertices[ key ];

								switch ( key ) {

									case 'POSITION':
										const prevLength = position.array.length;
										buildGeometryData( primitive, sources[ id ], input.offset, position.array );
										position.stride = sources[ id ].stride;

										if ( sources.skinWeights && sources.skinIndices ) {

											buildGeometryData( primitive, sources.skinIndices, input.offset, skinIndex.array );
											buildGeometryData( primitive, sources.skinWeights, input.offset, skinWeight.array );

										}

										// see #3803

										if ( primitive.hasUV === false && primitives.uvsNeedsFix === true ) {

											const count = ( position.array.length - prevLength ) / position.stride;

											for ( let i = 0; i < count; i ++ ) {

												// fill missing uv coordinates

												uv.array.push( 0, 0 );

											}

										}

										break;

									case 'NORMAL':
										buildGeometryData( primitive, sources[ id ], input.offset, normal.array );
										normal.stride = sources[ id ].stride;
										break;

									case 'COLOR':
										buildGeometryData( primitive, sources[ id ], input.offset, color.array );
										color.stride = sources[ id ].stride;
										break;

									case 'TEXCOORD':
										buildGeometryData( primitive, sources[ id ], input.offset, uv.array );
										uv.stride = sources[ id ].stride;
										break;

									case 'TEXCOORD1':
										buildGeometryData( primitive, sources[ id ], input.offset, uv2.array );
										uv.stride = sources[ id ].stride;
										break;

									default:
										console.warn( 'THREE.ColladaLoader: Semantic "%s" not handled in geometry build process.', key );

								}

							}

							break;

						case 'NORMAL':
							buildGeometryData( primitive, sources[ input.id ], input.offset, normal.array );
							normal.stride = sources[ input.id ].stride;
							break;

						case 'COLOR':
							buildGeometryData( primitive, sources[ input.id ], input.offset, color.array );
							color.stride = sources[ input.id ].stride;
							break;

						case 'TEXCOORD':
							buildGeometryData( primitive, sources[ input.id ], input.offset, uv.array );
							uv.stride = sources[ input.id ].stride;
							break;

						case 'TEXCOORD1':
							buildGeometryData( primitive, sources[ input.id ], input.offset, uv2.array );
							uv2.stride = sources[ input.id ].stride;
							break;

					}

				}

			}

			// build geometry

			if ( position.array.length > 0 ) geometry.setAttribute( 'position', new Float32BufferAttribute( position.array, position.stride ) );
			if ( normal.array.length > 0 ) geometry.setAttribute( 'normal', new Float32BufferAttribute( normal.array, normal.stride ) );
			if ( color.array.length > 0 ) geometry.setAttribute( 'color', new Float32BufferAttribute( color.array, color.stride ) );
			if ( uv.array.length > 0 ) geometry.setAttribute( 'uv', new Float32BufferAttribute( uv.array, uv.stride ) );
			if ( uv2.array.length > 0 ) geometry.setAttribute( 'uv2', new Float32BufferAttribute( uv2.array, uv2.stride ) );

			if ( skinIndex.array.length > 0 ) geometry.setAttribute( 'skinIndex', new Float32BufferAttribute( skinIndex.array, skinIndex.stride ) );
			if ( skinWeight.array.length > 0 ) geometry.setAttribute( 'skinWeight', new Float32BufferAttribute( skinWeight.array, skinWeight.stride ) );

			build.data = geometry;
			build.type = primitives[ 0 ].type;
			build.materialKeys = materialKeys;

			return build;

		}

		function buildGeometryData( primitive, source, offset, array ) {

			const indices = primitive.p;
			const stride = primitive.stride;
			const vcount = primitive.vcount;

			function pushVector( i ) {

				let index = indices[ i + offset ] * sourceStride;
				const length = index + sourceStride;

				for ( ; index < length; index ++ ) {

					array.push( sourceArray[ index ] );

				}

			}

			const sourceArray = source.array;
			const sourceStride = source.stride;

			if ( primitive.vcount !== undefined ) {

				let index = 0;

				for ( let i = 0, l = vcount.length; i < l; i ++ ) {

					const count = vcount[ i ];

					if ( count === 4 ) {

						const a = index + stride * 0;
						const b = index + stride * 1;
						const c = index + stride * 2;
						const d = index + stride * 3;

						pushVector( a ); pushVector( b ); pushVector( d );
						pushVector( b ); pushVector( c ); pushVector( d );

					} else if ( count === 3 ) {

						const a = index + stride * 0;
						const b = index + stride * 1;
						const c = index + stride * 2;

						pushVector( a ); pushVector( b ); pushVector( c );

					} else if ( count > 4 ) {

						for ( let k = 1, kl = ( count - 2 ); k <= kl; k ++ ) {

							const a = index + stride * 0;
							const b = index + stride * k;
							const c = index + stride * ( k + 1 );

							pushVector( a ); pushVector( b ); pushVector( c );

						}

					}

					index += stride * count;

				}

			} else {

				for ( let i = 0, l = indices.length; i < l; i += stride ) {

					pushVector( i );

				}

			}

		}

		function getGeometry( id ) {

			return getBuild( library.geometries[ id ], buildGeometry );

		}

		// kinematics

		function parseKinematicsModel( xml ) {

			const data = {
				name: xml.getAttribute( 'name' ) || '',
				joints: {},
				links: []
			};

			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'technique_common':
						parseKinematicsTechniqueCommon( child, data );
						break;

				}

			}

			library.kinematicsModels[ xml.getAttribute( 'id' ) ] = data;

		}

		function buildKinematicsModel( data ) {

			if ( data.build !== undefined ) return data.build;

			return data;

		}

		function getKinematicsModel( id ) {

			return getBuild( library.kinematicsModels[ id ], buildKinematicsModel );

		}

		function parseKinematicsTechniqueCommon( xml, data ) {

			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'joint':
						data.joints[ child.getAttribute( 'sid' ) ] = parseKinematicsJoint( child );
						break;

					case 'link':
						data.links.push( parseKinematicsLink( child ) );
						break;

				}

			}

		}

		function parseKinematicsJoint( xml ) {

			let data;

			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'prismatic':
					case 'revolute':
						data = parseKinematicsJointParameter( child );
						break;

				}

			}

			return data;

		}

		function parseKinematicsJointParameter( xml ) {

			const data = {
				sid: xml.getAttribute( 'sid' ),
				name: xml.getAttribute( 'name' ) || '',
				axis: new Vector3(),
				limits: {
					min: 0,
					max: 0
				},
				type: xml.nodeName,
				static: false,
				zeroPosition: 0,
				middlePosition: 0
			};

			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'axis':
						const array = parseFloats( child.textContent );
						data.axis.fromArray( array );
						break;
					case 'limits':
						const max = child.getElementsByTagName( 'max' )[ 0 ];
						const min = child.getElementsByTagName( 'min' )[ 0 ];

						data.limits.max = parseFloat( max.textContent );
						data.limits.min = parseFloat( min.textContent );
						break;

				}

			}

			// if min is equal to or greater than max, consider the joint static

			if ( data.limits.min >= data.limits.max ) {

				data.static = true;

			}

			// calculate middle position

			data.middlePosition = ( data.limits.min + data.limits.max ) / 2.0;

			return data;

		}

		function parseKinematicsLink( xml ) {

			const data = {
				sid: xml.getAttribute( 'sid' ),
				name: xml.getAttribute( 'name' ) || '',
				attachments: [],
				transforms: []
			};

			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'attachment_full':
						data.attachments.push( parseKinematicsAttachment( child ) );
						break;

					case 'matrix':
					case 'translate':
					case 'rotate':
						data.transforms.push( parseKinematicsTransform( child ) );
						break;

				}

			}

			return data;

		}

		function parseKinematicsAttachment( xml ) {

			const data = {
				joint: xml.getAttribute( 'joint' ).split( '/' ).pop(),
				transforms: [],
				links: []
			};

			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'link':
						data.links.push( parseKinematicsLink( child ) );
						break;

					case 'matrix':
					case 'translate':
					case 'rotate':
						data.transforms.push( parseKinematicsTransform( child ) );
						break;

				}

			}

			return data;

		}

		function parseKinematicsTransform( xml ) {

			const data = {
				type: xml.nodeName
			};

			const array = parseFloats( xml.textContent );

			switch ( data.type ) {

				case 'matrix':
					data.obj = new Matrix4();
					data.obj.fromArray( array ).transpose();
					break;

				case 'translate':
					data.obj = new Vector3();
					data.obj.fromArray( array );
					break;

				case 'rotate':
					data.obj = new Vector3();
					data.obj.fromArray( array );
					data.angle = MathUtils.degToRad( array[ 3 ] );
					break;

			}

			return data;

		}

		// physics

		function parsePhysicsModel( xml ) {

			const data = {
				name: xml.getAttribute( 'name' ) || '',
				rigidBodies: {}
			};

			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'rigid_body':
						data.rigidBodies[ child.getAttribute( 'name' ) ] = {};
						parsePhysicsRigidBody( child, data.rigidBodies[ child.getAttribute( 'name' ) ] );
						break;

				}

			}

			library.physicsModels[ xml.getAttribute( 'id' ) ] = data;

		}

		function parsePhysicsRigidBody( xml, data ) {

			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'technique_common':
						parsePhysicsTechniqueCommon( child, data );
						break;

				}

			}

		}

		function parsePhysicsTechniqueCommon( xml, data ) {

			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'inertia':
						data.inertia = parseFloats( child.textContent );
						break;

					case 'mass':
						data.mass = parseFloats( child.textContent )[ 0 ];
						break;

				}

			}

		}

		// scene

		function parseKinematicsScene( xml ) {

			const data = {
				bindJointAxis: []
			};

			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'bind_joint_axis':
						data.bindJointAxis.push( parseKinematicsBindJointAxis( child ) );
						break;

				}

			}

			library.kinematicsScenes[ parseId( xml.getAttribute( 'url' ) ) ] = data;

		}

		function parseKinematicsBindJointAxis( xml ) {

			const data = {
				target: xml.getAttribute( 'target' ).split( '/' ).pop()
			};

			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'axis':
						const param = child.getElementsByTagName( 'param' )[ 0 ];
						data.axis = param.textContent;
						const tmpJointIndex = data.axis.split( 'inst_' ).pop().split( 'axis' )[ 0 ];
						data.jointIndex = tmpJointIndex.substr( 0, tmpJointIndex.length - 1 );
						break;

				}

			}

			return data;

		}

		function buildKinematicsScene( data ) {

			if ( data.build !== undefined ) return data.build;

			return data;

		}

		function getKinematicsScene( id ) {

			return getBuild( library.kinematicsScenes[ id ], buildKinematicsScene );

		}

		function setupKinematics() {

			const kinematicsModelId = Object.keys( library.kinematicsModels )[ 0 ];
			const kinematicsSceneId = Object.keys( library.kinematicsScenes )[ 0 ];
			const visualSceneId = Object.keys( library.visualScenes )[ 0 ];

			if ( kinematicsModelId === undefined || kinematicsSceneId === undefined ) return;

			const kinematicsModel = getKinematicsModel( kinematicsModelId );
			const kinematicsScene = getKinematicsScene( kinematicsSceneId );
			const visualScene = getVisualScene( visualSceneId );

			const bindJointAxis = kinematicsScene.bindJointAxis;
			const jointMap = {};

			for ( let i = 0, l = bindJointAxis.length; i < l; i ++ ) {

				const axis = bindJointAxis[ i ];

				// the result of the following query is an element of type 'translate', 'rotate','scale' or 'matrix'

				const targetElement = collada.querySelector( '[sid="' + axis.target + '"]' );

				if ( targetElement ) {

					// get the parent of the transform element

					const parentVisualElement = targetElement.parentElement;

					// connect the joint of the kinematics model with the element in the visual scene

					connect( axis.jointIndex, parentVisualElement );

				}

			}

			function connect( jointIndex, visualElement ) {

				const visualElementName = visualElement.getAttribute( 'name' );
				const joint = kinematicsModel.joints[ jointIndex ];

				visualScene.traverse( function ( object ) {

					if ( object.name === visualElementName ) {

						jointMap[ jointIndex ] = {
							object: object,
							transforms: buildTransformList( visualElement ),
							joint: joint,
							position: joint.zeroPosition
						};

					}

				} );

			}

			const m0 = new Matrix4();

			kinematics = {

				joints: kinematicsModel && kinematicsModel.joints,

				getJointValue: function ( jointIndex ) {

					const jointData = jointMap[ jointIndex ];

					if ( jointData ) {

						return jointData.position;

					} else {

						console.warn( 'THREE.ColladaLoader: Joint ' + jointIndex + ' doesn\'t exist.' );

					}

				},

				setJointValue: function ( jointIndex, value ) {

					const jointData = jointMap[ jointIndex ];

					if ( jointData ) {

						const joint = jointData.joint;

						if ( value > joint.limits.max || value < joint.limits.min ) {

							console.warn( 'THREE.ColladaLoader: Joint ' + jointIndex + ' value ' + value + ' outside of limits (min: ' + joint.limits.min + ', max: ' + joint.limits.max + ').' );

						} else if ( joint.static ) {

							console.warn( 'THREE.ColladaLoader: Joint ' + jointIndex + ' is static.' );

						} else {

							const object = jointData.object;
							const axis = joint.axis;
							const transforms = jointData.transforms;

							matrix.identity();

							// each update, we have to apply all transforms in the correct order

							for ( let i = 0; i < transforms.length; i ++ ) {

								const transform = transforms[ i ];

								// if there is a connection of the transform node with a joint, apply the joint value

								if ( transform.sid && transform.sid.indexOf( jointIndex ) !== - 1 ) {

									switch ( joint.type ) {

										case 'revolute':
											matrix.multiply( m0.makeRotationAxis( axis, MathUtils.degToRad( value ) ) );
											break;

										case 'prismatic':
											matrix.multiply( m0.makeTranslation( axis.x * value, axis.y * value, axis.z * value ) );
											break;

										default:
											console.warn( 'THREE.ColladaLoader: Unknown joint type: ' + joint.type );
											break;

									}

								} else {

									switch ( transform.type ) {

										case 'matrix':
											matrix.multiply( transform.obj );
											break;

										case 'translate':
											matrix.multiply( m0.makeTranslation( transform.obj.x, transform.obj.y, transform.obj.z ) );
											break;

										case 'scale':
											matrix.scale( transform.obj );
											break;

										case 'rotate':
											matrix.multiply( m0.makeRotationAxis( transform.obj, transform.angle ) );
											break;

									}

								}

							}

							object.matrix.copy( matrix );
							object.matrix.decompose( object.position, object.quaternion, object.scale );

							jointMap[ jointIndex ].position = value;

						}

					} else {

						console.log( 'THREE.ColladaLoader: ' + jointIndex + ' does not exist.' );

					}

				}

			};

		}

		function buildTransformList( node ) {

			const transforms = [];

			const xml = collada.querySelector( '[id="' + node.id + '"]' );

			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				let array, vector;

				switch ( child.nodeName ) {

					case 'matrix':
						array = parseFloats( child.textContent );
						const matrix = new Matrix4().fromArray( array ).transpose();
						transforms.push( {
							sid: child.getAttribute( 'sid' ),
							type: child.nodeName,
							obj: matrix
						} );
						break;

					case 'translate':
					case 'scale':
						array = parseFloats( child.textContent );
						vector = new Vector3().fromArray( array );
						transforms.push( {
							sid: child.getAttribute( 'sid' ),
							type: child.nodeName,
							obj: vector
						} );
						break;

					case 'rotate':
						array = parseFloats( child.textContent );
						vector = new Vector3().fromArray( array );
						const angle = MathUtils.degToRad( array[ 3 ] );
						transforms.push( {
							sid: child.getAttribute( 'sid' ),
							type: child.nodeName,
							obj: vector,
							angle: angle
						} );
						break;

				}

			}

			return transforms;

		}

		// nodes

		function prepareNodes( xml ) {

			const elements = xml.getElementsByTagName( 'node' );

			// ensure all node elements have id attributes

			for ( let i = 0; i < elements.length; i ++ ) {

				const element = elements[ i ];

				if ( element.hasAttribute( 'id' ) === false ) {

					element.setAttribute( 'id', generateId() );

				}

			}

		}

		const matrix = new Matrix4();
		const vector = new Vector3();

		function parseNode( xml ) {

			const data = {
				name: xml.getAttribute( 'name' ) || '',
				type: xml.getAttribute( 'type' ),
				id: xml.getAttribute( 'id' ),
				sid: xml.getAttribute( 'sid' ),
				matrix: new Matrix4(),
				nodes: [],
				instanceCameras: [],
				instanceControllers: [],
				instanceLights: [],
				instanceGeometries: [],
				instanceNodes: [],
				transforms: {}
			};

			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				let array;

				switch ( child.nodeName ) {

					case 'node':
						data.nodes.push( child.getAttribute( 'id' ) );
						parseNode( child );
						break;

					case 'instance_camera':
						data.instanceCameras.push( parseId( child.getAttribute( 'url' ) ) );
						break;

					case 'instance_controller':
						data.instanceControllers.push( parseNodeInstance( child ) );
						break;

					case 'instance_light':
						data.instanceLights.push( parseId( child.getAttribute( 'url' ) ) );
						break;

					case 'instance_geometry':
						data.instanceGeometries.push( parseNodeInstance( child ) );
						break;

					case 'instance_node':
						data.instanceNodes.push( parseId( child.getAttribute( 'url' ) ) );
						break;

					case 'matrix':
						array = parseFloats( child.textContent );
						data.matrix.multiply( matrix.fromArray( array ).transpose() );
						data.transforms[ child.getAttribute( 'sid' ) ] = child.nodeName;
						break;

					case 'translate':
						array = parseFloats( child.textContent );
						vector.fromArray( array );
						data.matrix.multiply( matrix.makeTranslation( vector.x, vector.y, vector.z ) );
						data.transforms[ child.getAttribute( 'sid' ) ] = child.nodeName;
						break;

					case 'rotate':
						array = parseFloats( child.textContent );
						const angle = MathUtils.degToRad( array[ 3 ] );
						data.matrix.multiply( matrix.makeRotationAxis( vector.fromArray( array ), angle ) );
						data.transforms[ child.getAttribute( 'sid' ) ] = child.nodeName;
						break;

					case 'scale':
						array = parseFloats( child.textContent );
						data.matrix.scale( vector.fromArray( array ) );
						data.transforms[ child.getAttribute( 'sid' ) ] = child.nodeName;
						break;

					case 'extra':
						break;

					default:
						console.log( child );

				}

			}

			if ( hasNode( data.id ) ) {

				console.warn( 'THREE.ColladaLoader: There is already a node with ID %s. Exclude current node from further processing.', data.id );

			} else {

				library.nodes[ data.id ] = data;

			}

			return data;

		}

		function parseNodeInstance( xml ) {

			const data = {
				id: parseId( xml.getAttribute( 'url' ) ),
				materials: {},
				skeletons: []
			};

			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

				const child = xml.childNodes[ i ];

				switch ( child.nodeName ) {

					case 'bind_material':
						const instances = child.getElementsByTagName( 'instance_material' );

						for ( let j = 0; j < instances.length; j ++ ) {

							const instance = instances[ j ];
							const symbol = instance.getAttribute( 'symbol' );
							const target = instance.getAttribute( 'target' );

							data.materials[ symbol ] = parseId( target );

						}

						break;

					case 'skeleton':
						data.skeletons.push( parseId( child.textContent ) );
						break;

					default:
						break;

				}

			}

			return data;

		}

		function buildSkeleton( skeletons, joints ) {

			const boneData = [];
			const sortedBoneData = [];

			let i, j, data;

			// a skeleton can have multiple root bones. collada expresses this
			// situtation with multiple "skeleton" tags per controller instance

			for ( i = 0; i < skeletons.length; i ++ ) {

				const skeleton = skeletons[ i ];

				let root;

				if ( hasNode( skeleton ) ) {

					root = getNode( skeleton );
					buildBoneHierarchy( root, joints, boneData );

				} else if ( hasVisualScene( skeleton ) ) {

					// handle case where the skeleton refers to the visual scene (#13335)

					const visualScene = library.visualScenes[ skeleton ];
					const children = visualScene.children;

					for ( let j = 0; j < children.length; j ++ ) {

						const child = children[ j ];

						if ( child.type === 'JOINT' ) {

							const root = getNode( child.id );
							buildBoneHierarchy( root, joints, boneData );

						}

					}

				} else {

					console.error( 'THREE.ColladaLoader: Unable to find root bone of skeleton with ID:', skeleton );

				}

			}

			// sort bone data (the order is defined in the corresponding controller)

			for ( i = 0; i < joints.length; i ++ ) {

				for ( j = 0; j < boneData.length; j ++ ) {

					data = boneData[ j ];

					if ( data.bone.name === joints[ i ].name ) {

						sortedBoneData[ i ] = data;
						data.processed = true;
						break;

					}

				}

			}

			// add unprocessed bone data at the end of the list

			for ( i = 0; i < boneData.length; i ++ ) {

				data = boneData[ i ];

				if ( data.processed === false ) {

					sortedBoneData.push( data );
					data.processed = true;

				}

			}

			// setup arrays for skeleton creation

			const bones = [];
			const boneInverses = [];

			for ( i = 0; i < sortedBoneData.length; i ++ ) {

				data = sortedBoneData[ i ];

				bones.push( data.bone );
				boneInverses.push( data.boneInverse );

			}

			return new Skeleton( bones, boneInverses );

		}

		function buildBoneHierarchy( root, joints, boneData ) {

			// setup bone data from visual scene

			root.traverse( function ( object ) {

				if ( object.isBone === true ) {

					let boneInverse;

					// retrieve the boneInverse from the controller data

					for ( let i = 0; i < joints.length; i ++ ) {

						const joint = joints[ i ];

						if ( joint.name === object.name ) {

							boneInverse = joint.boneInverse;
							break;

						}

					}

					if ( boneInverse === undefined ) {

						// Unfortunately, there can be joints in the visual scene that are not part of the
						// corresponding controller. In this case, we have to create a dummy boneInverse matrix
						// for the respective bone. This bone won't affect any vertices, because there are no skin indices
						// and weights defined for it. But we still have to add the bone to the sorted bone list in order to
						// ensure a correct animation of the model.

						boneInverse = new Matrix4();

					}

					boneData.push( { bone: object, boneInverse: boneInverse, processed: false } );

				}

			} );

		}

		function buildNode( data ) {

			const objects = [];

			const matrix = data.matrix;
			const nodes = data.nodes;
			const type = data.type;
			const instanceCameras = data.instanceCameras;
			const instanceControllers = data.instanceControllers;
			const instanceLights = data.instanceLights;
			const instanceGeometries = data.instanceGeometries;
			const instanceNodes = data.instanceNodes;

			// nodes

			for ( let i = 0, l = nodes.length; i < l; i ++ ) {

				objects.push( getNode( nodes[ i ] ) );

			}

			// instance cameras

			for ( let i = 0, l = instanceCameras.length; i < l; i ++ ) {

				const instanceCamera = getCamera( instanceCameras[ i ] );

				if ( instanceCamera !== null ) {

					objects.push( instanceCamera.clone() );

				}

			}

			// instance controllers

			for ( let i = 0, l = instanceControllers.length; i < l; i ++ ) {

				const instance = instanceControllers[ i ];
				const controller = getController( instance.id );
				const geometries = getGeometry( controller.id );
				const newObjects = buildObjects( geometries, instance.materials );

				const skeletons = instance.skeletons;
				const joints = controller.skin.joints;

				const skeleton = buildSkeleton( skeletons, joints );

				for ( let j = 0, jl = newObjects.length; j < jl; j ++ ) {

					const object = newObjects[ j ];

					if ( object.isSkinnedMesh ) {

						object.bind( skeleton, controller.skin.bindMatrix );
						object.normalizeSkinWeights();

					}

					objects.push( object );

				}

			}

			// instance lights

			for ( let i = 0, l = instanceLights.length; i < l; i ++ ) {

				const instanceLight = getLight( instanceLights[ i ] );

				if ( instanceLight !== null ) {

					objects.push( instanceLight.clone() );

				}

			}

			// instance geometries

			for ( let i = 0, l = instanceGeometries.length; i < l; i ++ ) {

				const instance = instanceGeometries[ i ];

				// a single geometry instance in collada can lead to multiple object3Ds.
				// this is the case when primitives are combined like triangles and lines

				const geometries = getGeometry( instance.id );
				const newObjects = buildObjects( geometries, instance.materials );

				for ( let j = 0, jl = newObjects.length; j < jl; j ++ ) {

					objects.push( newObjects[ j ] );

				}

			}

			// instance nodes

			for ( let i = 0, l = instanceNodes.length; i < l; i ++ ) {

				objects.push( getNode( instanceNodes[ i ] ).clone() );

			}

			let object;

			if ( nodes.length === 0 && objects.length === 1 ) {

				object = objects[ 0 ];

			} else {

				object = ( type === 'JOINT' ) ? new Bone() : new Group();

				for ( let i = 0; i < objects.length; i ++ ) {

					object.add( objects[ i ] );

				}

			}

			object.name = ( type === 'JOINT' ) ? data.sid : data.name;
			object.matrix.copy( matrix );
			object.matrix.decompose( object.position, object.quaternion, object.scale );

			return object;

		}

		const fallbackMaterial = new MeshBasicMaterial( { color: 0xff00ff } );

		function resolveMaterialBinding( keys, instanceMaterials ) {

			const materials = [];

			for ( let i = 0, l = keys.length; i < l; i ++ ) {

				const id = instanceMaterials[ keys[ i ] ];

				if ( id === undefined ) {

					console.warn( 'THREE.ColladaLoader: Material with key %s not found. Apply fallback material.', keys[ i ] );
					materials.push( fallbackMaterial );

				} else {

					materials.push( getMaterial( id ) );

				}

			}

			return materials;

		}

		function buildObjects( geometries, instanceMaterials ) {

			const objects = [];

			for ( const type in geometries ) {

				const geometry = geometries[ type ];

				const materials = resolveMaterialBinding( geometry.materialKeys, instanceMaterials );

				// handle case if no materials are defined

				if ( materials.length === 0 ) {

					if ( type === 'lines' || type === 'linestrips' ) {

						materials.push( new LineBasicMaterial() );

					} else {

						materials.push( new MeshPhongMaterial() );

					}

				}

				// regard skinning

				const skinning = ( geometry.data.attributes.skinIndex !== undefined );

				// choose between a single or multi materials (material array)

				const material = ( materials.length === 1 ) ? materials[ 0 ] : materials;

				// now create a specific 3D object

				let object;

				switch ( type ) {

					case 'lines':
						object = new LineSegments( geometry.data, material );
						break;

					case 'linestrips':
						object = new Line( geometry.data, material );
						break;

					case 'triangles':
					case 'polylist':
						if ( skinning ) {

							object = new SkinnedMesh( geometry.data, material );

						} else {

							object = new Mesh( geometry.data, material );

						}

						break;

				}

				objects.push( object );

			}

			return objects;

		}

		function hasNode( id ) {

			return library.nodes[ id ] !== undefined;

		}

		function getNode( id ) {

			return getBuild( library.nodes[ id ], buildNode );

		}

		// visual scenes

		function parseVisualScene( xml ) {

			const data = {
				name: xml.getAttribute( 'name' ),
				children: []
			};

			prepareNodes( xml );

			const elements = getElementsByTagName( xml, 'node' );

			for ( let i = 0; i < elements.length; i ++ ) {

				data.children.push( parseNode( elements[ i ] ) );

			}

			library.visualScenes[ xml.getAttribute( 'id' ) ] = data;

		}

		function buildVisualScene( data ) {

			const group = new Group();
			group.name = data.name;

			const children = data.children;

			for ( let i = 0; i < children.length; i ++ ) {

				const child = children[ i ];

				group.add( getNode( child.id ) );

			}

			return group;

		}

		function hasVisualScene( id ) {

			return library.visualScenes[ id ] !== undefined;

		}

		function getVisualScene( id ) {

			return getBuild( library.visualScenes[ id ], buildVisualScene );

		}

		// scenes

		function parseScene( xml ) {

			const instance = getElementsByTagName( xml, 'instance_visual_scene' )[ 0 ];
			return getVisualScene( parseId( instance.getAttribute( 'url' ) ) );

		}

		function setupAnimations() {

			const clips = library.clips;

			if ( isEmpty( clips ) === true ) {

				if ( isEmpty( library.animations ) === false ) {

					// if there are animations but no clips, we create a default clip for playback

					const tracks = [];

					for ( const id in library.animations ) {

						const animationTracks = getAnimation( id );

						for ( let i = 0, l = animationTracks.length; i < l; i ++ ) {

							tracks.push( animationTracks[ i ] );

						}

					}

					animations.push( new AnimationClip( 'default', - 1, tracks ) );

				}

			} else {

				for ( const id in clips ) {

					animations.push( getAnimationClip( id ) );

				}

			}

		}

		// convert the parser error element into text with each child elements text
		// separated by new lines.

		function parserErrorToText( parserError ) {

			let result = '';
			const stack = [ parserError ];

			while ( stack.length ) {

				const node = stack.shift();

				if ( node.nodeType === Node.TEXT_NODE ) {

					result += node.textContent;

				} else {

					result += '\n';
					stack.push.apply( stack, node.childNodes );

				}

			}

			return result.trim();

		}

		if ( text.length === 0 ) {

			return { scene: new Scene() };

		}

		const xml = new DOMParser().parseFromString( text, 'application/xml' );

		const collada = getElementsByTagName( xml, 'COLLADA' )[ 0 ];

		const parserError = xml.getElementsByTagName( 'parsererror' )[ 0 ];
		if ( parserError !== undefined ) {

			// Chrome will return parser error with a div in it

			const errorElement = getElementsByTagName( parserError, 'div' )[ 0 ];
			let errorText;

			if ( errorElement ) {

				errorText = errorElement.textContent;

			} else {

				errorText = parserErrorToText( parserError );

			}

			console.error( 'THREE.ColladaLoader: Failed to parse collada file.\n', errorText );

			return null;

		}

		// metadata

		const version = collada.getAttribute( 'version' );
		console.log( 'THREE.ColladaLoader: File version', version );

		const asset = parseAsset( getElementsByTagName( collada, 'asset' )[ 0 ] );
		const textureLoader = new TextureLoader( this.manager );
		textureLoader.setPath( this.resourcePath || path ).setCrossOrigin( this.crossOrigin );

		let tgaLoader;

		if ( TGALoader ) {

			tgaLoader = new TGALoader( this.manager );
			tgaLoader.setPath( this.resourcePath || path );

		}

		//

		const animations = [];
		let kinematics = {};
		let count = 0;

		//

		const library = {
			animations: {},
			clips: {},
			controllers: {},
			images: {},
			effects: {},
			materials: {},
			cameras: {},
			lights: {},
			geometries: {},
			nodes: {},
			visualScenes: {},
			kinematicsModels: {},
			physicsModels: {},
			kinematicsScenes: {}
		};

		parseLibrary( collada, 'library_animations', 'animation', parseAnimation );
		parseLibrary( collada, 'library_animation_clips', 'animation_clip', parseAnimationClip );
		parseLibrary( collada, 'library_controllers', 'controller', parseController );
		parseLibrary( collada, 'library_images', 'image', parseImage );
		parseLibrary( collada, 'library_effects', 'effect', parseEffect );
		parseLibrary( collada, 'library_materials', 'material', parseMaterial );
		parseLibrary( collada, 'library_cameras', 'camera', parseCamera );
		parseLibrary( collada, 'library_lights', 'light', parseLight );
		parseLibrary( collada, 'library_geometries', 'geometry', parseGeometry );
		parseLibrary( collada, 'library_nodes', 'node', parseNode );
		parseLibrary( collada, 'library_visual_scenes', 'visual_scene', parseVisualScene );
		parseLibrary( collada, 'library_kinematics_models', 'kinematics_model', parseKinematicsModel );
		parseLibrary( collada, 'library_physics_models', 'physics_model', parsePhysicsModel );
		parseLibrary( collada, 'scene', 'instance_kinematics_scene', parseKinematicsScene );

		buildLibrary( library.animations, buildAnimation );
		buildLibrary( library.clips, buildAnimationClip );
		buildLibrary( library.controllers, buildController );
		buildLibrary( library.images, buildImage );
		buildLibrary( library.effects, buildEffect );
		buildLibrary( library.materials, buildMaterial );
		buildLibrary( library.cameras, buildCamera );
		buildLibrary( library.lights, buildLight );
		buildLibrary( library.geometries, buildGeometry );
		buildLibrary( library.visualScenes, buildVisualScene );

		setupAnimations();
		setupKinematics();

		const scene = parseScene( getElementsByTagName( collada, 'scene' )[ 0 ] );
		scene.animations = animations;

		if ( asset.upAxis === 'Z_UP' ) {

			scene.quaternion.setFromEuler( new Euler( - Math.PI / 2, 0, 0 ) );

		}

		scene.scale.multiplyScalar( asset.unit );

		return {
			get animations() {

				console.warn( 'THREE.ColladaLoader: Please access animations over scene.animations now.' );
				return animations;

			},
			kinematics: kinematics,
			library: library,
			scene: scene
		};

	}

}

export { ColladaLoader };
