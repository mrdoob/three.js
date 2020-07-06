/**
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / https://github.com/Mugen87
 */

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
	ShaderMaterial,
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
	Vector4,
	UniformsUtils,
	UniformsLib,
	LinearFilter,
	VectorKeyframeTrack,
	BooleanKeyframeTrack,
	UniformKeyframeTrack
} from "../../../build/three.module.js";
import { TGALoader } from "../loaders/TGALoader.js";

var ColladaLoader = function ( manager ) {

	Loader.call( this, manager );

};

ColladaLoader.prototype = Object.assign( Object.create( Loader.prototype ), {

	constructor: ColladaLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var path = ( scope.path === '' ) ? LoaderUtils.extractUrlBase( url ) : scope.path;

		var loader = new FileLoader( scope.manager );
		loader.setPath( scope.path );
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

	},

	options: {

		set convertUpAxis( value ) {

			console.warn( 'THREE.ColladaLoader: options.convertUpAxis() has been removed. Up axis is converted automatically.' );

		}

	},

	parse: function ( text, path ) {

		function getElementsByTagName( xml, name ) {

			// Non recursive xml.getElementsByTagName() ...

			var array = [];
			var childNodes = xml.childNodes;

			for ( var i = 0, l = childNodes.length; i < l; i ++ ) {

				var child = childNodes[ i ];

				if ( child.nodeName === name ) {

					array.push( child );

				}

			}

			return array;

		}

		function parseStrings( text ) {

			if ( text.length === 0 ) return [];

			var parts = text.trim().split( /\s+/ );
			var array = new Array( parts.length );

			for ( var i = 0, l = parts.length; i < l; i ++ ) {

				array[ i ] = parts[ i ];

			}

			return array;

		}

		function parseFloats( text ) {

			if ( text.length === 0 ) return [];

			var parts = text.trim().split( /\s+/ );
			var array = new Array( parts.length );

			for ( var i = 0, l = parts.length; i < l; i ++ ) {

				array[ i ] = parseFloat( parts[ i ] );

			}

			return array;

		}

		function parseInts( text ) {

			if ( text.length === 0 ) return [];

			var parts = text.trim().split( /\s+/ );
			var array = new Array( parts.length );

			for ( var i = 0, l = parts.length; i < l; i ++ ) {

				array[ i ] = parseInt( parts[ i ] );

			}

			return array;

		}

		function parseBooli( str ) {

			var raw = parseStrings( str );
			return ( raw[ 0 ] === 'true' || raw[ 0 ] === '1' ) ? 1 : 0;

		}

		function parseBool( str ) {

			var raw = parseStrings( str );
			return ( raw[ 0 ] === 'true' || raw[ 0 ] === '1' ) ? true : false;

		}

		function parseBools( str ) {

			var raw = parseStrings( str );
			var array = [];

			for ( var i = 0, l = raw.length; i < l; i ++ ) {

				array.push( parseBool( raw[ i ] ) );

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

			var library = getElementsByTagName( xml, libraryName )[ 0 ];

			if ( library !== undefined ) {

				var elements = getElementsByTagName( library, nodeName );

				for ( var i = 0; i < elements.length; i ++ ) {

					parser( elements[ i ] );

				}

			}

		}

		function buildLibrary( data, builder ) {

			for ( var name in data ) {

				var object = data[ name ];
				object.build = builder( data[ name ] );

			}

		}

		// get

		function getBuild( data, builder ) {

			if ( data.build !== undefined ) return data.build;
			//context = modifier example: for materials what geom_instance does it belong
			data.build =data.context? builder( data.value, data.context ) :builder( data);

			return data.build;

		}

		// animation

		function parseAnimation( xml ) {

			var data = {
				sources: {},
				samplers: {},
				channels: {}
			};

			var hasChildren = false;

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				var id;

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

			var data = {
				inputs: {},
			};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'input':
						var id = parseId( child.getAttribute( 'source' ) );
						var semantic = child.getAttribute( 'semantic' );
						data.inputs[ semantic ] = id;
						break;

				}

			}

			return data;

		}

		function parseAnimationChannel( xml ) {

			var data = {};

			var target = xml.getAttribute( 'target' );

			// parsing SID Addressing Syntax

			var parts = target.split( '/' );

			var id = parts.shift();
			var sid = parts.shift();

			// check selection syntax

			var arraySyntax = ( sid.indexOf( '(' ) !== - 1 );
			var memberSyntax = ( sid.indexOf( '.' ) !== - 1 );

			if ( memberSyntax ) {

				//  member selection access

				parts = sid.split( '.' );
				sid = parts.shift();
				data.member = parts.shift();

			} else if ( arraySyntax ) {

				// array-access syntax. can be used to express fields in one-dimensional vectors or two-dimensional matrices.

				var indices = sid.split( '(' );
				sid = indices.shift();

				for ( var i = 0; i < indices.length; i ++ ) {

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

			var tracks = [];

			var channels = data.channels;
			var samplers = data.samplers;
			var sources = data.sources;
			var mergedAnimations={};
			for ( var target in channels ) {

				if ( channels.hasOwnProperty( target ) ) {

					var channel = channels[ target ];
					var sampler = samplers[ channel.sampler ];

					var inputId = sampler.inputs.INPUT;
					var outputId = sampler.inputs.OUTPUT;
					var interpolation;
					var inputSource = sources[ inputId ];
					var outputSource = sources[ outputId ];
					if ( sampler.inputs.INTERPOLATION )
						interpolation = sources[ sampler.inputs.INTERPOLATION ];
					buildAnimationChannel( channel, inputSource, outputSource, interpolation, mergedAnimations );

					//createKeyframeTracks( animation, tracks );

				}

			}

			createKeyframeTracks( mergedAnimations, tracks );
			return tracks;

		}

		function getAnimation( id ) {

			return getBuild( library.animations[ id ], buildAnimation );

		}

		function buildTransformChannel( node, channel, inputSource, outputSource, transform, data ) {

			// depending on the transform type (matrix, translate, rotate, scale), we execute different logic
				let defaultMatrix = node.matrix.clone();
				let transposedMat = defaultMatrix.clone().transpose();//three js and collada have diferent representations			
				let tmpTransl=new Vector3(),tmpQuat=new Quaternion(),tmpScale=new Vector3();
				defaultMatrix.decompose(tmpTransl,tmpQuat,tmpScale);
			switch ( transform ) {

				case 'matrix':
					
					for ( var i = 0; i < inputSource.array.length; i ++ ) {

						let time = inputSource.array[ i ];
						let stride = i * outputSource.stride;

						if ( data[ time ] === undefined ) data[ time ] = {matrix:[]};

						if ( channel.arraySyntax === true ) {

							var value = outputSource.array[ stride ];
							var index = channel.indices[ 0 ] + 4 * channel.indices[ 1 ];

							data[ time ].matrix[ index ] = value;

						} else {

							for (var j = 0; j < outputSource.stride; j ++ ) {

								data[ time ].matrix[ j ] = outputSource.array[ stride + j ];

							}

						}

					}
					for ( var i = 0; i < 16; i ++ )
						transformAnimationData( data, i, transposedMat.elements[ i ] );

					break;

				case 'translate':
					for ( var inputIdx = 0; inputIdx < inputSource.array.length; inputIdx ++ ) {
						let time = inputSource.array[ inputIdx ];
						if ( data[ time ] === undefined ) data[ time ] = {translation:null};
						if(outputSource.stride!=3){
							console.warn( 'THREE.ColladaLoader: translate should be Vector3.');
							return;
						}
						let stride = inputIdx * outputSource.stride;
						data[ time ].translation=new Vector3(outputSource.array[ stride],outputSource.array[ stride + 1 ],outputSource.array[ stride + 2]);
						data[ time ].translation.applyQuaternion(tmpQuat);
						data[ time ].translation.add(tmpTransl.clone());
					}
					break;

				case 'rotate':
					for ( var inputIdx = 0; inputIdx < inputSource.array.length; inputIdx ++ ) {
						let time = inputSource.array[ inputIdx ];
						if ( data[ time ] === undefined ) data[ time ] = {quaternion:null};
						if(outputSource.stride!=4){
							console.warn( 'THREE.ColladaLoader: Angle rotate should be Vector3.');
							return;
						}
						let stride = inputIdx * outputSource.stride;
						let baseVec = new Vector3(outputSource.array[ stride],outputSource.array[ stride + 1 ],outputSource.array[ stride + 2]);
						
						data[ time ].quaternion =tmpQuat.clone();
						data[ time ].quaternion.multiply(new Quaternion().setFromAxisAngle(baseVec,MathUtils.degToRad(outputSource.array[ stride+3])));
					}
					break;

				case 'scale':
					console.warn( 'THREE.ColladaLoader: Animation transform type "%s" not yet implemented.', transform );
					break;
				case 'visibility':
					for ( var inputIdx = 0; inputIdx < inputSource.array.length; inputIdx ++ ) {
						let time = inputSource.array[ inputIdx ];
						if ( data[ time ] === undefined ) data[ time ] = {visibility:null};
						let stride = inputIdx * outputSource.stride;
						if(outputSource.stride!=1){
							console.warn( 'THREE.ColladaLoader: visibility should be single int val.');
							return;
						}
						data[ time ].visibility = outputSource.array[ stride];
					}
				break;

			}
		}
		function parseComplexUniformData (type,outputSource, ndx) {
	   
			var result = [];
			var inneIdx = 0;
			switch (type) {
	
				case 'iv1':
					ndx *= outputSource.stride;
					for (var idx = 0; idx < outputSource.stride;idx++){
						if (outputSource.array[ndx + idx] === 'true')
							result[idx]= 1;
						else if (outputSource.array[ndx + idx] === 'false')
							result[idx]= 0;
						else
							result[idx]= outputSource.array[ndxidx + idx];
					}
					break;
				case 'fv1':
					ndx *= outputSource.stride;
					for (var idx = 0; idx < outputSource.stride; idx++) {
							result[idx] = outputSource.array[ndx+idx];
					}
					break;
				case 'iv'://3 ints per step
					ndx *= outputSource.stride*3;
					for (var idx = 0; idx < outputSource.stride; idx++) {
						result[idx] = [outputSource.array[ndx + inneIdx], outputSource.array[ndx + inneIdx + 1], outputSource.array[ndx + inneIdx + 2]];
						inneIdx += 3;
					}
					break;
				case 'v2v'://2 floats per step
					ndx *= outputSource.stride*2;
					for (var idx = 0; idx < outputSource.stride; idx++) {
						result[idx] = new Vector2(outputSource.array[ndx + inneIdx], outputSource.array[ndx + inneIdx + 1]);
						inneIdx += 2;
					}
					break;
				case 'v3v'://3 floats per step
					ndx *= outputSource.stride*3;
					for (var idx = 0; idx < outputSource.stride; idx ++) {
						result[idx] = new Vector3(outputSource.array[ndx + inneIdx], outputSource.array[ndx + inneIdx + 1], outputSource.array[ndx + inneIdx + 2]);
						inneIdx += 3;
					}
					break;
				case 'v4v':
					ndx *= outputSource.stride*4;
					for (var idx = 0; idx < outputSource.stride; idx ++) {
						result[idx] = new Vector4(outputSource.array[ndx + inneIdx], outputSource.array[ndx + inneIdx + 1], outputSource.array[ndx + inneIdx + 2], outputSource.array[ndx + inneIdx + 3]);
						inneIdx += 4;
					}
					break;
				case 'm2v':
					ndx *= outputSource.stride*4;
					for (var idx = 0; idx < outputSource.stride; idx++) {
						result[idx] = getConvertedMat2(outputSource.array[ndx + idx]);
						inneIdx += 4;
					}
					break;
				case 'm3v':
					ndx *= outputSource.stride*9;
					for (var idx = 0; idx < outputSource.stride; idx++) {
						result[idx] = getConvertedMat3(outputSource.array[ndx + idx]);
						inneIdx += 9;
					}
					break;
				case 'm4v':
					ndx *= outputSource.stride*16;
					for (var idx = 0; idx <= outputSource.stride; idx++) {
						result[idx] = getConvertedMat4(outputSource.array[ndx + idx]);
						inneIdx += 16;
					}
					break;
					
				default:
					break;
			}
			return result;
		};
		function getUniformData (type ,outputSource, ndx) {
			if (isComplexUniformType(type)){
				return parseComplexUniformData(type,outputSource, ndx);
			}
			else {
	
				switch (type) {
					case '1i':
						if (outputSource.array[ndx] === 'true')
							return 1;
						else if (outputSource.array[ndx] === 'false')
							return 0;
						else
							return outputSource.array[ndx];
					case '3iv':
						ndx *= outputSource.stride*3;
						return [outputSource.array[ndx], outputSource.array[ ndx +1], outputSource.array[ ndx +2]];
					
					case '1f':
						return outputSource.array[ndx];
					case '2fv':
						ndx *= outputSource.stride*2;
						return new Vector2(outputSource.array[ndx], outputSource.array[ndx + 1]);
					case '3fv':
						ndx *= outputSource.stride*3;
						return new Vector3(outputSource.array[ndx], outputSource.array[ndx + 1], outputSource.array[ndx + 2]);
					case '4fv':
						ndx *= outputSource.stride*4;
						return new Vector4(outputSource.array[ndx], outputSource.array[ndx + 1], outputSource.array[ndx + 2], outputSource.array[ndx + 3]);
					case 'Matrix2fv'://not sure this is supported but webgl does
						ndx *= outputSource.stride * 4;
						return getConvertedMat2(outputSource.array[ndx]);
					case 'Matrix3fv':
						ndx *= outputSource.stride * 9;
						return getConvertedMat3(outputSource.array[ndx]);
					case 'Matrix4fv':
						ndx *= outputSource.stride * 16;
						return getConvertedMat4(outputSource.array[ndx]);
			   
					default:
						return null;
				}
	
			}
	
		};
		function buildUniformChannel(targUniforms,channel,inputSource,outputSource,interpolation,data){
			
			for(var uni in targUniforms){
				if(targUniforms[uni].sid==channel.sid){
					
					//var res={uniName:channel.sid,value:{}};
					data[channel.sid]={type: targUniforms[uni].type ,value:{}};
					for ( var inputIdx = 0; inputIdx < inputSource.array.length; inputIdx ++ ) {
						let time = inputSource.array[ inputIdx ];
						data[channel.sid].value[time]=getUniformData(targUniforms[uni].type,outputSource,inputIdx);
					}

				}
			}
		}

		function buildAnimationChannel( channel, inputSource, outputSource,interpolation , mergedAnimations) {

			var node = library.nodes[ channel.id ];
			var object3D = getNode( node.id );

			var transform = node.transforms[ channel.sid ];
			//var uniform=node.instanceGeometries.material_uniforms;//node.uniforms[ channel.sid ];//uniforms are extraxted from the material of the geometry inside
			// the collada spec allows the animation of data in various ways.
			
			if(!mergedAnimations[object3D.uuid])
				mergedAnimations[object3D.uuid]={};
				if(node.build.material)
					mergedAnimations[object3D.uuid].numMat=node.build.material.length? node.build.material.length : 1;//multiple materials are array in the node else its an object
				
			if(transform){
				if(!mergedAnimations[object3D.uuid].position)
					mergedAnimations[object3D.uuid].position={}
				buildTransformChannel(node,channel,inputSource,outputSource,transform,mergedAnimations[object3D.uuid].position);
			}
			else {
				for(var instGeom in node.instanceGeometries){
					if(!mergedAnimations[object3D.uuid].uniforms)
						mergedAnimations[object3D.uuid].uniforms={}
					var uniforms=node.instanceGeometries[instGeom].material_uniforms;
					
					buildUniformChannel(uniforms,channel,inputSource , outputSource,interpolation ,mergedAnimations[object3D.uuid].uniforms);
				}
			}
		}
		function ascending( a, b ) {

			return a - b;

		}
		
		function createPositionTracks(key,data,tracks){
			var times = [];
			var positionData = [];
			var quaternionData = [];
			var visibilityData=[];
			var scaleData = [];
			var sumPosition = new Vector3();
			var sumscale = new Vector3();
			var sumQuaternion = new Quaternion();
			var keyframe = data.position;
			var matrix,transl,quat;

			times=Object.keys(keyframe);	
			times.sort(ascending);
			for(var i in times){
				var time=times[i];
				if(keyframe[time]['visibility']!==undefined)
					visibilityData.push(keyframe[time]['visibility']>0);
				else{
					if(keyframe[time]['translation']!==undefined)
						transl=keyframe[time]['translation'];
					if(keyframe[time]['quaternion']!==undefined)
						quat=keyframe[time]['quaternion'];
					
					if(keyframe[time]['matrix']!==undefined)
						matrix=new Matrix4().fromArray( keyframe[time]['matrix']).transpose();
	
				
					else if(matrix){
						let tmMat=new Matrix4().compose(transl,quat,new Vector3());
						matrix.multiply(tmMat);						
						matrix.decompose( sumPosition, sumQuaternion, sumscale );
						scaleData.push( sumscale.x, sumscale.y, sumscale.z );
					}
					else{
						sumPosition=transl;
						sumQuaternion=quat;
						//Todo scale
					}
					
					positionData.push( sumPosition.x, sumPosition.y, sumPosition.z );
					quaternionData.push( sumQuaternion.x, sumQuaternion.y, sumQuaternion.z, sumQuaternion.w );
				}
			}				
			if ( positionData.length > 0 ) tracks.push( new VectorKeyframeTrack( key + '.position', times, positionData ) );
			if ( quaternionData.length > 0 ) tracks.push( new QuaternionKeyframeTrack( key + '.quaternion', times, quaternionData ) );
			if ( scaleData.length > 0 ) tracks.push( new VectorKeyframeTrack( key + '.scale', times, scaleData ) );
			if ( visibilityData.length > 0 ) tracks.push( new BooleanKeyframeTrack( key + '.visible', times, visibilityData ) );
			
		}

		
		function createUniformsTracks(key,data,tracks){
			var keyframe = data.uniforms;

			function makeTrackFromPath(path){
				for(var uni in keyframe){
					var times = [];
					var curentUniAnim=keyframe[uni];
					times=Object.keys(curentUniAnim.value);
					times.sort(ascending);
					var curentTrackData=[];
					for(var i in times){
						var time=times[i];
						if(isComplexUniformType(curentUniAnim.type))
							curentTrackData.push.apply(curentTrackData,curentUniAnim.value[time]);
						else
							curentTrackData.push(curentUniAnim.value[time]);
					}
					if ( curentTrackData.length > 0 ) tracks.push( new UniformKeyframeTrack( path+'['+uni+']', times, curentTrackData,curentUniAnim.type));
				}
			}
			if(data.numMat!=1){
				for(var matIdx=0;matIdx<data.numMat;matIdx++){
					var trackPath=key + '.material'+'['+matIdx+']'+'.uniforms';	
					makeTrackFromPath(trackPath);
				}
			}
			else{
				var trackPath=key + '.material.uniforms';
				makeTrackFromPath(trackPath);
			}
			
			
		
		}
		function createKeyframeTracks( mergedAnimations, tracks ) {

			
			for(var key in mergedAnimations){
				
				var data = mergedAnimations[key];
				//var name = key;
				if(data){
					//collada supports multiple transformation at the same time we must apply the sum value of them.
					for ( var animation in data) {
						if(animation=='position')
							createPositionTracks(key,data,tracks);							
						else if(animation=='uniforms')
							createUniformsTracks(key,data,tracks);
						}
				}
			}

			return tracks;

		}

		function transformAnimationData( keyframes, property, defaultValue ) {

			var keyframe;

			var empty = true;
			var i, l;

			// check, if values of a property are missing in our keyframes

			for ( i = 0, l = keyframes.length; i < l; i ++ ) {

				keyframe = keyframes[ i ];

				if ( keyframe.matrix[ property ] === undefined ) {

					keyframe.matrix[ property ] = null; // mark as missing

				} else {

					empty = false;

				}

			}

			if ( empty === true ) {

				// no values at all, so we set a default value

				for ( i = 0, l = keyframes.length; i < l; i ++ ) {

					keyframe = keyframes[ i ];

					keyframe.matrix[ property ] = defaultValue;

				}

			} else {

				// filling gaps

				createMissingKeyframes( keyframes, property );

			}

		}

		function createMissingKeyframes( keyframes, property ) {

			var prev, next;

			for ( var i = 0, l = keyframes.length; i < l; i ++ ) {

				var keyframe = keyframes[ i ];

				if ( keyframe.matrix[ property ] === null ) {

					prev = getPrev( keyframes, i, property );
					next = getNext( keyframes, i, property );

					if ( prev === null ) {

						keyframe.matrix[ property ] = next.matrix[ property ];
						continue;

					}

					if ( next === null ) {

						keyframe.matrix[ property ] = prev.matrix[ property ];
						continue;

					}

					interpolate( keyframe, prev, next, property );

				}

			}

		}

		function getPrev( keyframes, i, property ) {

			while ( i >= 0 ) {

				var keyframe = keyframes[ i ];

				if ( keyframe.matrix[ property ] !== null ) return keyframe;

				i --;

			}

			return null;

		}

		function getNext( keyframes, i, property ) {

			while ( i < keyframes.length ) {

				var keyframe = keyframes[ i ];

				if ( keyframe.matrix[ property ] !== null ) return keyframe;

				i ++;

			}

			return null;

		}

		function interpolate( key, prev, next, property ) {

			if ( ( next.time - prev.time ) === 0 ) {

				key.matrix[ property ] = prev.matrix[ property ];
				return;

			}

			key.matrix[ property ] = ( ( key.time - prev.time ) * ( next.matrix[ property ] - prev.matrix[ property ] ) / ( next.time - prev.time ) ) + prev.matrix[ property ];

		}

		// animation clips

		function parseAnimationClip( xml ) {

			var data = {
				name: xml.getAttribute( 'id' ) || 'default',
				start: parseFloat( xml.getAttribute( 'start' ) || 0 ),
				end: parseFloat( xml.getAttribute( 'end' ) || 0 ),
				animations: []
			};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

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

			var tracks = [];

			var name = data.name;
			var duration = ( data.end - data.start ) || - 1;
			var animations = data.animations;

			for ( var i = 0, il = animations.length; i < il; i ++ ) {

				var animationTracks = getAnimation( animations[ i ] );

				for ( var j = 0, jl = animationTracks.length; j < jl; j ++ ) {

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

			var data = {};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

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

			var data = {
				sources: {}
			};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'bind_shape_matrix':
						data.bindShapeMatrix = parseFloats( child.textContent );
						break;

					case 'source':
						var id = child.getAttribute( 'id' );
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

			var data = {
				inputs: {}
			};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'input':
						var semantic = child.getAttribute( 'semantic' );
						var id = parseId( child.getAttribute( 'source' ) );
						data.inputs[ semantic ] = id;
						break;

				}

			}

			return data;

		}

		function parseVertexWeights( xml ) {

			var data = {
				inputs: {}
			};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'input':
						var semantic = child.getAttribute( 'semantic' );
						var id = parseId( child.getAttribute( 'source' ) );
						var offset = parseInt( child.getAttribute( 'offset' ) );
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

			var build = {
				id: data.id
			};

			var geometry = library.geometries[ build.id ];

			if ( data.skin !== undefined ) {

				build.skin = buildSkin( data.skin );

				// we enhance the 'sources' property of the corresponding geometry with our skin data

				geometry.sources.skinIndices = build.skin.indices;
				geometry.sources.skinWeights = build.skin.weights;

			}

			return build;

		}

		function buildSkin( data ) {

			var BONE_LIMIT = 4;

			var build = {
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

			var sources = data.sources;
			var vertexWeights = data.vertexWeights;

			var vcount = vertexWeights.vcount;
			var v = vertexWeights.v;
			var jointOffset = vertexWeights.inputs.JOINT.offset;
			var weightOffset = vertexWeights.inputs.WEIGHT.offset;

			var jointSource = data.sources[ data.joints.inputs.JOINT ];
			var inverseSource = data.sources[ data.joints.inputs.INV_BIND_MATRIX ];

			var weights = sources[ vertexWeights.inputs.WEIGHT.id ].array;
			var stride = 0;

			var i, j, l;

			// procces skin data for each vertex

			for ( i = 0, l = vcount.length; i < l; i ++ ) {

				var jointCount = vcount[ i ]; // this is the amount of joints that affect a single vertex
				var vertexSkinData = [];

				for ( j = 0; j < jointCount; j ++ ) {

					var skinIndex = v[ stride + jointOffset ];
					var weightId = v[ stride + weightOffset ];
					var skinWeight = weights[ weightId ];

					vertexSkinData.push( { index: skinIndex, weight: skinWeight } );

					stride += 2;

				}

				// we sort the joints in descending order based on the weights.
				// this ensures, we only procced the most important joints of the vertex

				vertexSkinData.sort( descending );

				// now we provide for each vertex a set of four index and weight values.
				// the order of the skin data matches the order of vertices

				for ( j = 0; j < BONE_LIMIT; j ++ ) {

					var d = vertexSkinData[ j ];

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

				var name = jointSource.array[ i ];
				var boneInverse = new Matrix4().fromArray( inverseSource.array, i * inverseSource.stride ).transpose();

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

			var data = {
				init_from: getElementsByTagName( xml, 'init_from' )[ 0 ].textContent
			};

			library.images[ xml.getAttribute( 'id' ) ] = data;

		}

		function buildImage( data ) {

			if ( data.build !== undefined ) return data.build;

			return data.init_from;

		}

		function getImage( id ) {

			var data = library.images[ id ];

			if ( data !== undefined ) {

				return getBuild( data, buildImage );

			}

			console.warn( 'THREE.ColladaLoader: Couldn\'t find image with ID:', id );

			return null;

		}

		// effect

		function parseEffect( xml ) {

			var data = {};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'profile_COMMON':
						data.profile = parseEffectProfileCOMMON( child );
						break;
					case 'profile_GLSL':
						data.profile = parseProfileGLSL(child);
						break;
					
				}

			}

			library.effects[ xml.getAttribute( 'id' ) ] = data;

		}
		function isComplexUniformType(type) {
			switch (type) {
	
				case 'iv1':
				case 'fv1':
				case 'iv':
				case 'v2v':
				case 'v3v':
				case 'v4v':
				case 'm2v':
				case 'm3v':
				case 'm4v':
					return true;
				default:
					return false;
			}
		};
	
		function isVectorUniform(type) {
			switch (type) {
				case '2fv':
				case '3fv':
				case '4fv':
					return true;
				default:
					return false;
			}
		};
		function parseGLSLParamType(name){
			switch (name) {
				case 'bool':
					return "1i";
				case 'int':
					return "1i";
				case 'int2':
					return "2iv";
				case 'int3':
					return "3iv";
				case 'int4':
					return "4iv";
				case 'float':
					return "1f";
				case 'float2':
					return "2fv";
				case 'float3':
					return "3fv";
				case 'float4':
					return "4fv";
				case 'float2x2'://not sure this is supported but webgl does
					return "Matrix2fv";
				case 'float3x3':
					return "Matrix3fv";
				case 'float4x4':
					return "Matrix4fv";
				case 'float4x2':
				case 'float2x4':
					console.warn('WEBGL supports only squre matrixes.');
					return null;
				default:
					console.warn('Not supported uniform type.');
					return null;
					
			}
	
		};

		function parseEffectProfileCOMMON( xml ) {

			var data = {
				surfaces: {},
				samplers: {}
			};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

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

		function _attr_as_string( element, name, defaultValue ) {

			if ( element.hasAttribute( name ) ) {
	
				return element.getAttribute( name );
	
			} else {
	
				return defaultValue;
	
			}
	
		}

		function initRenderPass (element, sidToFind,data) {

			var foundChild = null;
			for (var pasIdx = 0; pasIdx < element.childNodes.length; pasIdx++) {

				var shaderChild = element.childNodes[pasIdx];
				for (var shaderIdx = 0; shaderIdx < shaderChild.childNodes.length; shaderIdx++) {

					var shaderSettings = shaderChild.childNodes[shaderIdx];
					if (shaderSettings.nodeName == 'name') {

						var source = shaderSettings.getAttribute('source');
						if (source == sidToFind)
							foundChild = shaderChild;

					}
					else if (shaderSettings.nodeName == 'bind') {

						var attr=_attr_as_string(shaderSettings , 'symbol', null);
						if (attr != null) {

							for (var paramIdx = 0; paramIdx < shaderSettings.childNodes.length; paramIdx++) {

								var param = shaderSettings.childNodes[paramIdx];
								if (param.nodeName == 'param') {

									var ref =_attr_as_string( param,'ref',null);
									data.boundUniforms[attr] = ref;
								}
							}

						}
					}
				}
			}

			if (foundChild!=null)
				return foundChild.getAttribute('stage');
			else
				return null;
		}

		function parseShader (element, sidToFind, data) {
			for (var i = 0; i < element.childNodes.length; i++) {
	
				var child = element.childNodes[i];
				if (child.nodeName == 'technique') {
	
					for (var childIdx = 0; childIdx < child.childNodes.length; childIdx++) {
	
						var passChild = child.childNodes[childIdx];
						if (passChild.nodeName == "pass") {
							data.technique.type="pass";
							return initRenderPass(passChild, sidToFind, data);
	
						}
					}
				}
			}
			return null;
		};

		function GetGLSLMatTransp(element){
			for (var index = 0; index < element.childNodes.length; index++) {
	
				var child = element.childNodes[index];
				if (child.nodeType != 1) continue;
				if (child.nodeName == 'transparent') {
					var raw = parseStrings(child.textContent);
					return  (raw[0] === 'true' || raw[0] === '1') ? true : false;
				}
			}
			return false;
	
		};

		function parseProfileGLSL(element){
			var data = {
				surfaces: {},
				samplers: {},
				//uniformsGLSL: {},
				boundUniforms: {},
				params : {},
				technique:{type : null},
				vertexShader : null,
				fragmentShader : null,
				transparent : false
			};
			for (var i = 0; i < element.childNodes.length; i++) {
	
				var child = element.childNodes[i];
				if (child.nodeType != 1) continue;
				var sid = child.getAttribute('sid');
				switch (child.nodeName){
					case 'code':
						var type = parseShader(element, sid, data);
						if (type == 'VERTEXPROGRAM')
							data.vertexShader = child.textContent;
						else if (type == 'FRAGMENTPROGRAM')
							data.fragmentShader = child.textContent;
						break;
					case 'newparam':
						parseGLSLParameters(child, data, sid);
						//this.parseNewparam(child);
						break;
					case 'extra':
						for (var index = 0; index < child.childNodes.length; index++) {

							var extraChild=child.childNodes[index];
							if(extraChild.nodeName=='technique')
							{
								var profile =extraChild.getAttribute('profile')
								if(profile=='three.js')
								data.transparent=GetGLSLMatTransp(extraChild);
							}
						}
 						break;
					default:
						break;
				}
			};
			
			return data;
		}
		
		function getConvertedMat2(data) {
		
			return  new Float32Array([

				data[0], data[1],
				data[2],data[3]

			]);
		}

		function getConvertedMat3(data) {

			return new Matrix3().set(
				data[0], data[3], data[6],
				data[1], data[4], data[7],
				data[2], data[5], data[8]
				);

		}
		function getConvertedMat4(data) {

				// First fix rotation and scale
	
				// Columns first
				var arr = [ data[ 0 ], data[ 4 ], data[ 8 ] ];
				data[ 0 ] = arr[ 0 ];
				data[ 4 ] = arr[ 1 ];
				data[ 8 ] = arr[ 2 ];
				arr = [ data[ 1 ], data[ 5 ], data[ 9 ] ];
				data[ 1 ] = arr[ 0 ];
				data[ 5 ] = arr[ 1 ];
				data[ 9 ] = arr[ 2 ];
				arr = [ data[ 2 ], data[ 6 ], data[ 10 ] ];
				data[ 2 ] = arr[ 0 ];
				data[ 6 ] = arr[ 1 ];
				data[ 10 ] = arr[ 2 ];
				// Rows secondtranslate
				arr = [ data[ 0 ], data[ 1 ], data[ 2 ] ];
				data[ 0 ] = arr[ 0 ];
				data[ 1 ] = arr[ 1 ];
				data[ 2 ] = arr[ 2 ];
				arr = [ data[ 4 ], data[ 5 ], data[ 6 ] ];
				data[ 4 ] = arr[ 0 ];
				data[ 5 ] = arr[ 1 ];
				data[ 6 ] = arr[ 2 ];
				arr = [ data[ 8 ], data[ 9 ], data[ 10 ] ];
				data[ 8 ] = arr[ 0 ];
				data[ 9 ] = arr[ 1 ];
				data[ 10 ] = arr[ 2 ];
	
				// Now fix translation
				arr = [ data[ 3 ], data[ 7 ], data[ 11 ] ];
				data[ 3 ] = arr[ 0 ];
				data[ 7 ] = arr[ 1 ];
				data[ 11 ] = arr[ 2 ];
	
			return new Matrix4().set(
				data[0], data[1], data[2], data[3],
				data[4], data[5], data[6], data[7],
				data[8], data[9], data[10], data[11],
				data[12], data[13], data[14], data[15]
				);
	
		}
		function parseSimpleGLSLParam(name,text) {
			var param={val:0,type:'int'};
			switch (name) {
				case 'bool':
					param.type = "1i";
					var raw = parseStrings(text);
					param.val =parseBooli(raw[0]);
					break;
				case 'bool2':
				case 'bool3':
				case 'bool4':
					param.val = parseBools(text);
					param.type = null;
					break;
				case 'int':
					var raw = parseStrings(text);
					param.val = parseInt(raw[0]);
					param.type = "1i";
					break;
				case 'int2':
					param.type = "2iv";
					param.val = parseInts(text);
				case 'int3':
					param.type = "3iv";
					param.val = parseInts(text);
				case 'int4':
					param.type = "4iv";
					param.val = parseInts(text);
					break;
				case 'float':
					var raw = parseStrings(text);
					param.type = "1f";
					param.val = parseFloat(raw[0]);
					break;
				case 'float2':
					param.type = "2fv";
					var vals = parseFloats(text);
					param.val = new Vector2(vals[0], vals[1]);
					break;
				case 'float3':
					param.type = "3fv";
					var vals = parseFloats(text);
					param.val = new Vector3(vals[0], vals[1], vals[2]);
					break;
				case 'float4':
					param.type = "4fv";
					var vals = parseFloats(text);
					param.val = new Vector4(vals[0], vals[1], vals[2], vals[3]);
					break; 
				case 'float2x2'://not sure this is supported but webgl does
					param.type = "Matrix2fv";
					var data = parseFloats(text);
					param.val = getConvertedMat2(data);
				case 'float3x3':
					param.type = "Matrix3fv";
					var data = parseFloats(text);
					param.val = getConvertedMat3(data);
					break;
				case 'float4x4':
					param.type = "Matrix4fv";
					var data = parseFloats(text);
					param.val = getConvertedMat4(data);
					break;
				case 'float4x2':
				case 'float2x4':
					console.warn('WEBGL supports only squre matrixes.');
					type = null;
					param.val = null;
					break;
				default:
					type = null;
					param.val = null;
					break;
			}
			return param;
		}
		
		function parseArrayParam(element) {
			//single dimension array 
			//if its needed make it multy dimensional
			var param={val:[],type:'1i'};
			for (var index = 0; index < element.childNodes.length; index++) {
	
				var child = element.childNodes[index];
				if (child.nodeType != 1) continue;
				
				var singleVal=parseSimpleGLSLParam(child.nodeName, child.textContent);
				param.val.push(singleVal.val);
				param.type=singleVal.type;
			}
			switch (param.type) {//change collada type with the glsl type mapping
	
				case '1i':
					param.type = "iv1";
					break;
	
				case '1f':
					param.type = "fv1";
					break;
				case '2iv':
				case '3iv':
				case '4iv':
					param.type = "iv";
					break;
	
				case '2fv':
					param.type = "v2v";
					break;
	
				case '3fv':
					param.type = "v3v";
					break;
	
				case '4fv':
					param.type = "v4v";
					break;
	
				case 'Matrix2fv':
					param.type = "m2v";
					break;
				case 'Matrix3fv':
					param.type = "m3v";
					break;
	
				case 'Matrix4fv':
					param.type = "m4v";
					break;
	
			}
			return param;
		}

		function parseGLSLParameters(element, data, id) {
	 
			for (var index = 0 ; index < element.childNodes.length ; index++) {
				var child = element.childNodes[index];
				if (child.nodeType != 1) continue;
				switch(child.nodeName ) {
					case 'sampler2D':
					data.samplers[id] = parseEffectSampler(child);
						return;
					case 'surface':
					data.surfaces[id] = parseEffectSurface(child);
						return;
					case 'array':
						var param = parseArrayParam(child);
						data.params[id] = param;						
						return;
					default:
						var param = parseSimpleGLSLParam(child.nodeName, child.textContent);
						data.params[id] = param;
						return;
				}
			}
	
			return null;
		}
		function parseEffectNewparam( xml, data ) {

			var sid = xml.getAttribute( 'sid' );

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

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

			var data = {};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

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

			var data = {};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'source':
						data.source = child.textContent;
						break;
					case 'wrap_s':
						data.wrap_s = child.textContent;
						break;
					case 'wrap_t':
						data.wrap_t = child.textContent;
						break;

				}

			}

			return data;

		}

		function parseEffectTechnique( xml ) {

			var data = {};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'constant':
					case 'lambert':
					case 'blinn':
					case 'phong':
						data.type = child.nodeName;
						data.parameters = parseEffectParameters( child );
						break;

				}

			}

			return data;

		}

		function parseEffectParameters( xml ) {

			var data = {};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

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
							opaque: child.getAttribute( 'opaque' ),
							data: parseEffectParameter( child )
						};
						break;

				}

			}

			return data;

		}

		function parseEffectParameter( xml ) {

			var data = {};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

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

			var data = {
				technique: {}
			};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

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

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'technique':
						parseEffectParameterTextureExtraTechnique( child, data );
						break;

				}

			}

		}

		function parseEffectParameterTextureExtraTechnique( xml, data ) {

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

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

				}

			}

		}

		function parseEffectExtra( xml ) {

			var data = {};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

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

			var data = {};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'double_sided':
						data[ child.nodeName ] = parseInt( child.textContent );
						break;
					case 'transparent':
						data[ child.nodeName ] = parseBool( child.textContent );
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

			var data = {
				name: xml.getAttribute( 'name' ),
				surfaces: {},
				samplers: {},
				params:{}
			};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'instance_effect':
						data.url = parseId( child.getAttribute( 'url' ) );

						for (var index = 0 ;index < child.childNodes.length ; index++) {
							var effect_child=child.childNodes[index];
							if (effect_child.nodeType != 1) continue;
							if (effect_child.nodeName == 'setparam') {
								var ref = effect_child.getAttribute('ref');//ref is used to identify the parameter in the array
								parseGLSLParameters(effect_child, data, ref);
							}
						}
						break;

				}

			}

			library.materials[ xml.getAttribute( 'id' ) ] = data;

		}

		function getTextureLoader( image ) {

			var loader;

			var extension = image.slice( ( image.lastIndexOf( '.' ) - 1 >>> 0 ) + 2 ); // http://www.jstips.co/en/javascript/get-file-extension/
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
		
		
		function loatTextureForUniform(sampler, surface) {

			if (surface !== undefined) {
	
				var image = getImage(surface.init_from);
				if (image) {
					var url;
					if(path)
					{
						var parts = path.split( '/' );
						parts.pop();
						let baseUrl = ( parts.length < 1 ? '.' : parts.join( '/' ) ) + '/';
			
						url = baseUrl + image;
					}
					else
						url = image;
	
					var texture = getTextureLoader(url).load( url);					
					texture.minFilter = LinearFilter;
					texture.wrapS = sampler.wrap_s=='WRAP' ? RepeatWrapping : ClampToEdgeWrapping;
					texture.wrapT = sampler.wrap_t=='WRAP' ? RepeatWrapping : ClampToEdgeWrapping;
					return texture;
				}
			}
			return null;
	
		}
		function updateSamplerUniforms(effect, instance_effect, uniformsGLSL) {

			for (var boundUniform in effect.boundUniforms) {
	
				var samplerId = effect.boundUniforms[boundUniform];	        //EnvSpec1_Uni
	
				var sampler = instance_effect.samplers[samplerId];
				if (sampler == undefined)
				  sampler = effect.samplers[samplerId];         //newparam in effect
	
			  if (sampler !== undefined) {
	
				var surface = instance_effect.surfaces[sampler.source];
				if (surface==undefined)
					  surface = effect.surfaces[sampler.source];
	
				if (surface !== undefined) {
					var tex = loatTextureForUniform(sampler, surface);
					uniformsGLSL[boundUniform] = { value: tex };
				}
			  }
			}
	
		}
		function buildMaterial( data ,geomType) {

			var effect = getEffect( data.url );
			var technique = effect.profile.technique;
			var extra = effect.profile.extra;

			var material;
			if(geomType && (geomType=='lines'||geomType=='linestrips'))
				material = new LineBasicMaterial();
			else{
				switch ( technique.type ) {

					case 'phong':
					case 'blinn':
						material = new MeshPhongMaterial();
						break;
	
					case 'lambert':
						material = new MeshLambertMaterial();
						break;
					case 'pass':
	
					var uniformsGLSL = {};
					uniformsGLSL = UniformsUtils.merge([
						UniformsLib['lights'], uniformsGLSL]);
					//<bind symbol="TestParam">  ----->//boundUniform
					//	<param ref="TestParam_uni"/> ----->this.boundUniforms[boundUniform]
					//</bind>
					//<newparam sid="TestParam_uni"> ---->key of uniformsGLSL
					//  <float>1.0</float>
					//</newparam>
			
					for (var boundUniform in effect.profile.boundUniforms) {
	
						var uni_bind=effect.profile.boundUniforms[boundUniform];
						var uni_data = data.params[uni_bind];
						if (uni_data == undefined) {
							uni_data= effect.profile.params[uni_bind];
							
						}
						if (uni_data !== undefined) {
							if (uni_data.type !== undefined)
								uniformsGLSL[boundUniform] = { type: uni_data.type, value: uni_data.val };
							else
								uniformsGLSL[boundUniform] = { value: uni_data.val };
						}						
					}
	
					updateSamplerUniforms(effect.profile,data,uniformsGLSL);
					material = new ShaderMaterial({
						uniforms: uniformsGLSL,
						vertexShader: effect.profile.vertexShader,
						fragmentShader: effect.profile.fragmentShader,
						transparent: effect.profile.transparent,
						lights:true
					});
					material.transparent=effect.profile.transparent;
						break;
					default:
						material = new MeshBasicMaterial();
						break;
	
				}
			}
			

			material.name = data.name || '';

			function getTexture( textureObject ) {

				var sampler = effect.profile.samplers[ textureObject.id ];
				var image = null;

				// get image

				if ( sampler !== undefined ) {

					var surface = effect.profile.surfaces[ sampler.source ];
					image = getImage( surface.init_from );

				} else {

					console.warn( 'THREE.ColladaLoader: Undefined sampler. Access image directly (see #12530).' );
					image = getImage( textureObject.id );

				}

				// create texture if image is avaiable

				if ( image !== null ) {

					var loader = getTextureLoader( image );

					if ( loader !== undefined ) {

						var texture = loader.load( image );

						var extra = textureObject.extra;

						if ( extra !== undefined && extra.technique !== undefined && isEmpty( extra.technique ) === false ) {

							var technique = extra.technique;

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

			var parameters = technique.parameters;//glsl dosent have params it has binded uniforms that are in the material
			if(parameters){
				for ( var key in parameters ) {

					var parameter = parameters[ key ];

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

				var transparent = parameters[ 'transparent' ];
				var transparency = parameters[ 'transparency' ];

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

						var color = transparent.data.color;

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
			}

			//

			if ( extra !== undefined && extra.technique !== undefined ) {

				if(extra.technique.double_sided === 1 )
					material.side = DoubleSide;
				if(extra.technique.transparent)
					material.transparent =extra.technique.transparent;

			}

			return material;

		}

		function getMaterial( id ,type) {

			return getBuild( {value:library.materials[ id ] , context:type}, buildMaterial );

		}

		// camera

		function parseCamera( xml ) {

			var data = {
				name: xml.getAttribute( 'name' )
			};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

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

			for ( var i = 0; i < xml.childNodes.length; i ++ ) {

				var child = xml.childNodes[ i ];

				switch ( child.nodeName ) {

					case 'technique_common':
						return parseCameraTechnique( child );

				}

			}

			return {};

		}

		function parseCameraTechnique( xml ) {

			var data = {};

			for ( var i = 0; i < xml.childNodes.length; i ++ ) {

				var child = xml.childNodes[ i ];

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

			var data = {};

			for ( var i = 0; i < xml.childNodes.length; i ++ ) {

				var child = xml.childNodes[ i ];

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

			var camera;

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
					var ymag = data.optics.parameters.ymag;
					var xmag = data.optics.parameters.xmag;
					var aspectRatio = data.optics.parameters.aspect_ratio;

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

			var data = library.cameras[ id ];

			if ( data !== undefined ) {

				return getBuild( data, buildCamera );

			}

			console.warn( 'THREE.ColladaLoader: Couldn\'t find camera with ID:', id );

			return null;

		}

		// light

		function parseLight( xml ) {

			var data = {};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

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

			var data = {};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

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

			var data = {};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'color':
						var array = parseFloats( child.textContent );
						data.color = new Color().fromArray( array );
						break;

					case 'falloff_angle':
						data.falloffAngle = parseFloat( child.textContent );
						break;

					case 'quadratic_attenuation':
						var f = parseFloat( child.textContent );
						data.distance = f ? Math.sqrt( 1 / f ) : 0;
						break;

				}

			}

			return data;

		}

		function buildLight( data ) {

			var light;

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

			var data = library.lights[ id ];

			if ( data !== undefined ) {

				return getBuild( data, buildLight );

			}

			console.warn( 'THREE.ColladaLoader: Couldn\'t find light with ID:', id );

			return null;

		}

		// geometry

		function parseGeometry( xml ) {

			var data = {
				name: xml.getAttribute( 'name' ),
				sources: {},
				vertices: {},
				primitives: []
			};

			var mesh = getElementsByTagName( xml, 'mesh' )[ 0 ];

			// the following tags inside geometry are not supported yet (see https://github.com/mrdoob/three.js/pull/12606): convex_mesh, spline, brep
			if ( mesh === undefined ) return;

			for ( var i = 0; i < mesh.childNodes.length; i ++ ) {

				var child = mesh.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				var id = child.getAttribute( 'id' );

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

			var data = {
				array: [],
				stride: 3
			};

			for ( var i = 0; i < xml.childNodes.length; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'float_array':
						data.array = parseFloats( child.textContent );
						break;

					case 'Name_array':
						data.array = parseStrings( child.textContent );
						break;

					case 'technique_common':
						var accessor = getElementsByTagName( child, 'accessor' )[ 0 ];

						if ( accessor !== undefined ) {

							data.stride = parseInt( accessor.getAttribute( 'stride' ) );

						}

						break;

				}

			}

			return data;

		}

		function parseGeometryVertices( xml ) {

			var data = {};

			for ( var i = 0; i < xml.childNodes.length; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				data[ child.getAttribute( 'semantic' ) ] = parseId( child.getAttribute( 'source' ) );

			}

			return data;

		}

		function parseGeometryPrimitive( xml ) {

			var primitive = {
				type: xml.nodeName,
				material: xml.getAttribute( 'material' ),
				count: parseInt( xml.getAttribute( 'count' ) ),
				inputs: {},
				stride: 0,
				hasUV: false
			};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'input':
						var id = parseId( child.getAttribute( 'source' ) );
						var semantic = child.getAttribute( 'semantic' );
						var offset = parseInt( child.getAttribute( 'offset' ) );
						var set = parseInt( child.getAttribute( 'set' ) );
						var inputname = ( set > 0 ? semantic + set : semantic );
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

			var build = {};

			for ( var i = 0; i < primitives.length; i ++ ) {

				var primitive = primitives[ i ];

				if ( build[ primitive.type ] === undefined ) build[ primitive.type ] = [];

				build[ primitive.type ].push( primitive );

			}

			return build;

		}

		function checkUVCoordinates( primitives ) {

			var count = 0;

			for ( var i = 0, l = primitives.length; i < l; i ++ ) {

				var primitive = primitives[ i ];

				if ( primitive.hasUV === true ) {

					count ++;

				}

			}

			if ( count > 0 && count < primitives.length ) {

				primitives.uvsNeedsFix = true;

			}

		}

		function buildGeometry( data ) {

			var build = {};

			var sources = data.sources;
			var vertices = data.vertices;
			var primitives = data.primitives;

			if ( primitives.length === 0 ) return {};

			// our goal is to create one buffer geometry for a single type of primitives
			// first, we group all primitives by their type

			var groupedPrimitives = groupPrimitives( primitives );

			for ( var type in groupedPrimitives ) {

				var primitiveType = groupedPrimitives[ type ];

				// second, ensure consistent uv coordinates for each type of primitives (polylist,triangles or lines)

				checkUVCoordinates( primitiveType );

				// third, create a buffer geometry for each type of primitives

				build[ type ] = buildGeometryType( primitiveType, sources, vertices );

			}

			return build;

		}
		function isCustomtAttribName(semantic) {

			if (semantic != 'POSITION' && semantic != 'NORMAL' && semantic != 'COLOR'
					   && semantic != 'TEXCOORD' && semantic!='TEXCOORD1') {
				return true;
			}
			return false;
		};

		function buildGeometryType( primitives, sources, vertices ) {

			var build = {};

			var position = { array: [], stride: 0 };
			var normal = { array: [], stride: 0 };
			var uv = { array: [], stride: 0 };
			var uv2 = { array: [], stride: 0 };
			var color = { array: [], stride: 0 };
			var vertAttributes={};
			var skinIndex = { array: [], stride: 4 };
			var skinWeight = { array: [], stride: 4 };

			var geometry = new BufferGeometry();

			var materialKeys = [];

			var start = 0;

			for ( var p = 0; p < primitives.length; p ++ ) {

				var primitive = primitives[ p ];
				var inputs = primitive.inputs;

				// groups

				var count = 0;

				switch ( primitive.type ) {

					case 'lines':
					case 'linestrips':
						count = primitive.count * 2;
						break;

					case 'triangles':
						count = primitive.count * 3;
						break;

					case 'polylist':

						for ( var g = 0; g < primitive.count; g ++ ) {

							var vc = primitive.vcount[ g ];

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

				for ( var name in inputs ) {

					var input = inputs[ name ];

					switch ( name )	{

						case 'VERTEX':
							for ( var key in vertices ) {

								var id = vertices[ key ];
								var curSource=sources[ id ];
								switch ( key ) {

									case 'POSITION':
										var prevLength = position.array.length;
										buildGeometryData( primitive, curSource, input.offset, position.array );
										position.stride = curSource.stride;

										if ( sources.skinWeights && sources.skinIndices ) {

											buildGeometryData( primitive, sources.skinIndices, input.offset, skinIndex.array );
											buildGeometryData( primitive, sources.skinWeights, input.offset, skinWeight.array );

										}

										// see #3803

										if ( primitive.hasUV === false && primitives.uvsNeedsFix === true ) {

											var count = ( position.array.length - prevLength ) / position.stride;

											for ( var i = 0; i < count; i ++ ) {

												// fill missing uv coordinates

												uv.array.push( 0, 0 );

											}

										}

										break;

									case 'NORMAL':
										buildGeometryData( primitive, curSource, input.offset, normal.array );
										normal.stride = curSource.stride;
										break;

									case 'COLOR':
										buildGeometryData( primitive, curSource, input.offset, color.array );
										color.stride = curSource.stride;
										break;

									case 'TEXCOORD':
										buildGeometryData( primitive, curSource, input.offset, uv.array );
										uv.stride = curSource.stride;
										break;

									case 'TEXCOORD1':
										buildGeometryData( primitive, curSource, input.offset, uv2.array );
										uv.stride = curSource.stride;
										break;
									
									default:
									if(isCustomtAttribName(key)){//everything should be custom attrib here i think
										let custAttr = { array: [], stride: curSource.stride };
										buildGeometryData( primitive, curSource, input.offset, custAttr.array );
										if(!vertAttributes[key])
											vertAttributes[key]=custAttr;
										else
											vertAttributes[key].array.push.apply(vertAttributes[key].array,custAttr.array);
									}
									else
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
			
			for(var key in vertAttributes ){
				var attr=vertAttributes[key];
				if(attr.array.length>0){
					geometry.setAttribute( key,new Float32BufferAttribute(attr.array,attr.stride));
				}
			}
			build.data = geometry;
			build.type = primitives[ 0 ].type;
			build.materialKeys = materialKeys;

			return build;

		}

		function buildGeometryData( primitive, source, offset, array ) {

			var indices = primitive.p;
			var stride = primitive.stride;
			var vcount = primitive.vcount;

			function pushVector( i ) {

				var index = indices[ i + offset ] * sourceStride;
				var length = index + sourceStride;

				for ( ; index < length; index ++ ) {

					array.push( sourceArray[ index ] );

				}

			}

			var sourceArray = source.array;
			var sourceStride = source.stride;

			if ( primitive.vcount !== undefined ) {

				var index = 0;

				for ( var i = 0, l = vcount.length; i < l; i ++ ) {

					var count = vcount[ i ];

					if ( count === 4 ) {

						var a = index + stride * 0;
						var b = index + stride * 1;
						var c = index + stride * 2;
						var d = index + stride * 3;

						pushVector( a ); pushVector( b ); pushVector( d );
						pushVector( b ); pushVector( c ); pushVector( d );

					} else if ( count === 3 ) {

						var a = index + stride * 0;
						var b = index + stride * 1;
						var c = index + stride * 2;

						pushVector( a ); pushVector( b ); pushVector( c );

					} else if ( count > 4 ) {

						for ( var k = 1, kl = ( count - 2 ); k <= kl; k ++ ) {

							var a = index + stride * 0;
							var b = index + stride * k;
							var c = index + stride * ( k + 1 );

							pushVector( a ); pushVector( b ); pushVector( c );

						}

					}

					index += stride * count;

				}

			} else {

				for ( var i = 0, l = indices.length; i < l; i += stride ) {

					pushVector( i );

				}

			}

		}

		function getGeometry( id ) {

			return getBuild( library.geometries[ id ], buildGeometry );

		}

		// kinematics

		function parseKinematicsModel( xml ) {

			var data = {
				name: xml.getAttribute( 'name' ) || '',
				joints: {},
				links: []
			};

			for ( var i = 0; i < xml.childNodes.length; i ++ ) {

				var child = xml.childNodes[ i ];

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

			for ( var i = 0; i < xml.childNodes.length; i ++ ) {

				var child = xml.childNodes[ i ];

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

			var data;

			for ( var i = 0; i < xml.childNodes.length; i ++ ) {

				var child = xml.childNodes[ i ];

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

		function parseKinematicsJointParameter( xml, data ) {

			var data = {
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

			for ( var i = 0; i < xml.childNodes.length; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'axis':
						var array = parseFloats( child.textContent );
						data.axis.fromArray( array );
						break;
					case 'limits':
						var max = child.getElementsByTagName( 'max' )[ 0 ];
						var min = child.getElementsByTagName( 'min' )[ 0 ];

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

			var data = {
				sid: xml.getAttribute( 'sid' ),
				name: xml.getAttribute( 'name' ) || '',
				attachments: [],
				transforms: []
			};

			for ( var i = 0; i < xml.childNodes.length; i ++ ) {

				var child = xml.childNodes[ i ];

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

			var data = {
				joint: xml.getAttribute( 'joint' ).split( '/' ).pop(),
				transforms: [],
				links: []
			};

			for ( var i = 0; i < xml.childNodes.length; i ++ ) {

				var child = xml.childNodes[ i ];

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

			var data = {
				type: xml.nodeName
			};

			var array = parseFloats( xml.textContent );

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

			var data = {
				name: xml.getAttribute( 'name' ) || '',
				rigidBodies: {}
			};

			for ( var i = 0; i < xml.childNodes.length; i ++ ) {

				var child = xml.childNodes[ i ];

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

			for ( var i = 0; i < xml.childNodes.length; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'technique_common':
						parsePhysicsTechniqueCommon( child, data );
						break;

				}

			}

		}

		function parsePhysicsTechniqueCommon( xml, data ) {

			for ( var i = 0; i < xml.childNodes.length; i ++ ) {

				var child = xml.childNodes[ i ];

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

			var data = {
				bindJointAxis: []
			};

			for ( var i = 0; i < xml.childNodes.length; i ++ ) {

				var child = xml.childNodes[ i ];

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

			var data = {
				target: xml.getAttribute( 'target' ).split( '/' ).pop()
			};

			for ( var i = 0; i < xml.childNodes.length; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'axis':
						var param = child.getElementsByTagName( 'param' )[ 0 ];
						data.axis = param.textContent;
						var tmpJointIndex = data.axis.split( 'inst_' ).pop().split( 'axis' )[ 0 ];
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

			var kinematicsModelId = Object.keys( library.kinematicsModels )[ 0 ];
			var kinematicsSceneId = Object.keys( library.kinematicsScenes )[ 0 ];
			var visualSceneId = Object.keys( library.visualScenes )[ 0 ];

			if ( kinematicsModelId === undefined || kinematicsSceneId === undefined ) return;

			var kinematicsModel = getKinematicsModel( kinematicsModelId );
			var kinematicsScene = getKinematicsScene( kinematicsSceneId );
			var visualScene = getVisualScene( visualSceneId );

			var bindJointAxis = kinematicsScene.bindJointAxis;
			var jointMap = {};

			for ( var i = 0, l = bindJointAxis.length; i < l; i ++ ) {

				var axis = bindJointAxis[ i ];

				// the result of the following query is an element of type 'translate', 'rotate','scale' or 'matrix'

				var targetElement = collada.querySelector( '[sid="' + axis.target + '"]' );

				if ( targetElement ) {

					// get the parent of the transform element

					var parentVisualElement = targetElement.parentElement;

					// connect the joint of the kinematics model with the element in the visual scene

					connect( axis.jointIndex, parentVisualElement );

				}

			}

			function connect( jointIndex, visualElement ) {

				var visualElementName = visualElement.getAttribute( 'name' );
				var joint = kinematicsModel.joints[ jointIndex ];

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

			var m0 = new Matrix4();

			kinematics = {

				joints: kinematicsModel && kinematicsModel.joints,

				getJointValue: function ( jointIndex ) {

					var jointData = jointMap[ jointIndex ];

					if ( jointData ) {

						return jointData.position;

					} else {

						console.warn( 'THREE.ColladaLoader: Joint ' + jointIndex + ' doesn\'t exist.' );

					}

				},

				setJointValue: function ( jointIndex, value ) {

					var jointData = jointMap[ jointIndex ];

					if ( jointData ) {

						var joint = jointData.joint;

						if ( value > joint.limits.max || value < joint.limits.min ) {

							console.warn( 'THREE.ColladaLoader: Joint ' + jointIndex + ' value ' + value + ' outside of limits (min: ' + joint.limits.min + ', max: ' + joint.limits.max + ').' );

						} else if ( joint.static ) {

							console.warn( 'THREE.ColladaLoader: Joint ' + jointIndex + ' is static.' );

						} else {

							var object = jointData.object;
							var axis = joint.axis;
							var transforms = jointData.transforms;

							matrix.identity();

							// each update, we have to apply all transforms in the correct order

							for ( var i = 0; i < transforms.length; i ++ ) {

								var transform = transforms[ i ];

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

			var transforms = [];

			var xml = collada.querySelector( '[id="' + node.id + '"]' );

			for ( var i = 0; i < xml.childNodes.length; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'matrix':
						var array = parseFloats( child.textContent );
						var matrix = new Matrix4().fromArray( array ).transpose();
						transforms.push( {
							sid: child.getAttribute( 'sid' ),
							type: child.nodeName,
							obj: matrix
						} );
						break;

					case 'translate':
					case 'scale':
						var array = parseFloats( child.textContent );
						var vector = new Vector3().fromArray( array );
						transforms.push( {
							sid: child.getAttribute( 'sid' ),
							type: child.nodeName,
							obj: vector
						} );
						break;

					case 'rotate':
						var array = parseFloats( child.textContent );
						var vector = new Vector3().fromArray( array );
						var angle = MathUtils.degToRad( array[ 3 ] );
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

			var elements = xml.getElementsByTagName( 'node' );

			// ensure all node elements have id attributes

			for ( var i = 0; i < elements.length; i ++ ) {

				var element = elements[ i ];

				if ( element.hasAttribute( 'id' ) === false ) {

					element.setAttribute( 'id', generateId() );

				}

			}

		}

		//var matrix = new Matrix4();
		//var vector = new Vector3();

		function parseNode( xml ) {

			var data = {
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
				transforms: {},
				visibility: true
			};
			let matrix= new Matrix4();
			let vector= new Vector3();
			for ( var i = 0; i < xml.childNodes.length; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

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
						var array = parseFloats( child.textContent );
						data.matrix.multiply( matrix.fromArray( array ).transpose() );
						data.transforms[ child.getAttribute( 'sid' ) ] = child.nodeName;
						break;

					case 'translate':
						var array = parseFloats( child.textContent );
						vector.fromArray( array );
						data.matrix.multiply( matrix.makeTranslation( vector.x, vector.y, vector.z ) );
						data.transforms[ child.getAttribute( 'sid' ) ] = child.nodeName;
						break;

					case 'rotate':
						var array = parseFloats( child.textContent );
						var angle = MathUtils.degToRad( array[ 3 ] );
						data.matrix.multiply( matrix.makeRotationAxis( vector.fromArray( array ), angle ) );
						data.transforms[ child.getAttribute( 'sid' ) ] = child.nodeName;
						break;

					case 'scale':
						var array = parseFloats( child.textContent );
						data.matrix.scale( vector.fromArray( array ) );
						data.transforms[ child.getAttribute( 'sid' ) ] = child.nodeName;
						break;

					case 'extra':
						for (var i = 0; i < child.childNodes.length; i++) {

							var extras = child.childNodes[i];
							if (extras.nodeType != 1) continue;
				
							if (extras.nodeName == 'technique') {
								var sourceId = extras.getAttribute('profile');
								if (sourceId === 'FCOLLADA') {//FCOLLADA writes float not bool from the files i have seen
									for (var j = 0; j < extras.childNodes.length; j++) {
				
										var extraItem = extras.childNodes[j];
										if (extraItem.nodeType != 1) continue;
										if (extraItem.nodeName == 'visibility'){
											data.visibility= parseFloat( extraItem.textContent )>0;
											data.transforms[ 'visibility'] ='visibility';
										}
									}
								}
							}
				
						}
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

			var data = {
				id: parseId( xml.getAttribute( 'url' ) ),
				materials: {},
				skeletons: [],
				material_uniforms:[]
			};

			for ( var i = 0; i < xml.childNodes.length; i ++ ) {

				var child = xml.childNodes[ i ];

				switch ( child.nodeName ) {
					case 'bind_material':
						let params = child.getElementsByTagName( 'param' );
						let uniform;
						for ( var j = 0; j < params.length; j ++ ) {
							if (isComplexUniformType(params[j].getAttribute('type')))
								uniform={sid:params[j].getAttribute('sid'),type:params[j].getAttribute('type')};
							else {
								var glslType = parseGLSLParamType(params[j].getAttribute('type'));
								uniform={sid:params[j].getAttribute('sid'),type:glslType};
							}
							data.material_uniforms.push(uniform);
						}
						var instances = child.getElementsByTagName( 'instance_material' );

						for ( var j = 0; j < instances.length; j ++ ) {

							var instance = instances[ j ];
							var symbol = instance.getAttribute( 'symbol' );
							var target = instance.getAttribute( 'target' );

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

			var boneData = [];
			var sortedBoneData = [];

			var i, j, data;

			// a skeleton can have multiple root bones. collada expresses this
			// situtation with multiple "skeleton" tags per controller instance

			for ( i = 0; i < skeletons.length; i ++ ) {

				var skeleton = skeletons[ i ];

				var root;

				if ( hasNode( skeleton ) ) {

					root = getNode( skeleton );
					buildBoneHierarchy( root, joints, boneData );

				} else if ( hasVisualScene( skeleton ) ) {

					// handle case where the skeleton refers to the visual scene (#13335)

					var visualScene = library.visualScenes[ skeleton ];
					var children = visualScene.children;

					for ( var j = 0; j < children.length; j ++ ) {

						var child = children[ j ];

						if ( child.type === 'JOINT' ) {

							var root = getNode( child.id );
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

			var bones = [];
			var boneInverses = [];

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

					var boneInverse;

					// retrieve the boneInverse from the controller data

					for ( var i = 0; i < joints.length; i ++ ) {

						var joint = joints[ i ];

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

			var objects = [];

			var matrix = data.matrix;
			var nodes = data.nodes;
			var type = data.type;
			var instanceCameras = data.instanceCameras;
			var instanceControllers = data.instanceControllers;
			var instanceLights = data.instanceLights;
			var instanceGeometries = data.instanceGeometries;
			var instanceNodes = data.instanceNodes;

			// nodes

			for ( var i = 0, l = nodes.length; i < l; i ++ ) {

				objects.push( getNode( nodes[ i ] ) );

			}

			// instance cameras

			for ( var i = 0, l = instanceCameras.length; i < l; i ++ ) {

				var instanceCamera = getCamera( instanceCameras[ i ] );

				if ( instanceCamera !== null ) {

					objects.push( instanceCamera.clone() );

				}

			}

			// instance controllers

			for ( var i = 0, l = instanceControllers.length; i < l; i ++ ) {

				var instance = instanceControllers[ i ];
				var controller = getController( instance.id );
				var geometries = getGeometry( controller.id );
				var newObjects = buildObjects( geometries, instance.materials );

				var skeletons = instance.skeletons;
				var joints = controller.skin.joints;

				var skeleton = buildSkeleton( skeletons, joints );

				for ( var j = 0, jl = newObjects.length; j < jl; j ++ ) {

					var object = newObjects[ j ];

					if ( object.isSkinnedMesh ) {

						object.bind( skeleton, controller.skin.bindMatrix );
						object.normalizeSkinWeights();

					}

					objects.push( object );

				}

			}

			// instance lights

			for ( var i = 0, l = instanceLights.length; i < l; i ++ ) {

				var instanceLight = getLight( instanceLights[ i ] );

				if ( instanceLight !== null ) {

					objects.push( instanceLight.clone() );

				}

			}

			// instance geometries

			for ( var i = 0, l = instanceGeometries.length; i < l; i ++ ) {

				var instance = instanceGeometries[ i ];

				// a single geometry instance in collada can lead to multiple object3Ds.
				// this is the case when primitives are combined like triangles and lines

				var geometries = getGeometry( instance.id );
				var newObjects = buildObjects( geometries, instance.materials );

				for ( var j = 0, jl = newObjects.length; j < jl; j ++ ) {

					objects.push( newObjects[ j ] );

				}

			}

			// instance nodes

			for ( var i = 0, l = instanceNodes.length; i < l; i ++ ) {

				objects.push( getNode( instanceNodes[ i ] ).clone() );

			}

			var object;

			if ( nodes.length === 0 && objects.length === 1 ) {

				object = objects[ 0 ];

			} else {

				object = ( type === 'JOINT' ) ? new Bone() : new Group();

				for ( var i = 0; i < objects.length; i ++ ) {

					object.add( objects[ i ] );

				}

			}

			object.name = ( type === 'JOINT' ) ? data.sid : data.name;
			object.matrix.copy( matrix );
			object.matrix.decompose( object.position, object.quaternion, object.scale );

			return object;

		}

		var fallbackMaterial = new MeshBasicMaterial( { color: 0xff00ff } );

		function resolveMaterialBinding( keys,type, instanceMaterials ) {

			var materials = [];

			for ( var i = 0, l = keys.length; i < l; i ++ ) {

				var id = instanceMaterials[ keys[ i ] ];

				if ( id === undefined ) {

					console.warn( 'THREE.ColladaLoader: Material with key %s not found. Apply fallback material.', keys[ i ] );
					materials.push( fallbackMaterial );

				} else {

					materials.push( getMaterial( id ,type) );

				}

			}

			return materials;

		}

		function buildObjects( geometries, instanceMaterials ) {

			var objects = [];

			for ( var type in geometries ) {

				var geometry = geometries[ type ];

				var materials = resolveMaterialBinding( geometry.materialKeys,type, instanceMaterials );

				// handle case if no materials are defined

				if ( materials.length === 0 ) {

					if ( type === 'lines' || type === 'linestrips' ) {

						materials.push( new LineBasicMaterial() );

					} else {

						materials.push( new MeshPhongMaterial() );

					}

				}

				// regard skinning

				var skinning = ( geometry.data.attributes.skinIndex !== undefined );

				if ( skinning ) {

					for ( var i = 0, l = materials.length; i < l; i ++ ) {

						materials[ i ].skinning = true;

					}

				}

				// choose between a single or multi materials (material array)

				var material = ( materials.length === 1 ) ? materials[ 0 ] : materials;

				// now create a specific 3D object

				var object;

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

			var data = {
				name: xml.getAttribute( 'name' ),
				children: []
			};

			prepareNodes( xml );

			var elements = getElementsByTagName( xml, 'node' );

			for ( var i = 0; i < elements.length; i ++ ) {

				data.children.push( parseNode( elements[ i ] ) );

			}

			library.visualScenes[ xml.getAttribute( 'id' ) ] = data;

		}

		function buildVisualScene( data ) {

			var group = new Group();
			group.name = data.name;

			var children = data.children;

			for ( var i = 0; i < children.length; i ++ ) {

				var child = children[ i ];

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

			var instance = getElementsByTagName( xml, 'instance_visual_scene' )[ 0 ];
			return getVisualScene( parseId( instance.getAttribute( 'url' ) ) );

		}

		function setupAnimations() {

			var clips = library.clips;

			if ( isEmpty( clips ) === true ) {

				if ( isEmpty( library.animations ) === false ) {

					// if there are animations but no clips, we create a default clip for playback

					var tracks = [];

					for ( var id in library.animations ) {

						var animationTracks = getAnimation( id );

						for ( var i = 0, l = animationTracks.length; i < l; i ++ ) {

							tracks.push( animationTracks[ i ] );

						}

					}

					animations.push( new AnimationClip( 'default', - 1, tracks ) );

				}

			} else {

				for ( var id in clips ) {

					animations.push( getAnimationClip( id ) );

				}

			}

		}

		// convert the parser error element into text with each child elements text
		// separated by new lines.

		function parserErrorToText( parserError ) {

			var result = '';
			var stack = [ parserError ];

			while ( stack.length ) {

				var node = stack.shift();

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

		var xml = new DOMParser().parseFromString( text, 'application/xml' );

		var collada = getElementsByTagName( xml, 'COLLADA' )[ 0 ];

		var parserError = xml.getElementsByTagName( 'parsererror' )[ 0 ];
		if ( parserError !== undefined ) {

			// Chrome will return parser error with a div in it

			var errorElement = getElementsByTagName( parserError, 'div' )[ 0 ];
			var errorText;

			if ( errorElement ) {

				errorText = errorElement.textContent;

			} else {

				errorText = parserErrorToText( parserError );

			}

			console.error( 'THREE.ColladaLoader: Failed to parse collada file.\n', errorText );

			return null;

		}

		// metadata

		var version = collada.getAttribute( 'version' );
		console.log( 'THREE.ColladaLoader: File version', version );

		var asset = parseAsset( getElementsByTagName( collada, 'asset' )[ 0 ] );
		var textureLoader = new TextureLoader( this.manager );
		textureLoader.setPath( this.resourcePath || path ).setCrossOrigin( this.crossOrigin );

		var tgaLoader;

		if ( TGALoader ) {

			tgaLoader = new TGALoader( this.manager );
			tgaLoader.setPath( this.resourcePath || path );

		}

		//

		var animations = [];
		var kinematics = {};
		var count = 0;

		//

		var library = {
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

		var scene = parseScene( getElementsByTagName( collada, 'scene' )[ 0 ] );

		if ( asset.upAxis === 'Z_UP' ) {

			scene.quaternion.setFromEuler( new Euler( - Math.PI / 2, 0, 0 ) );

		}

		scene.scale.multiplyScalar( asset.unit );

		return {
			animations: animations,
			kinematics: kinematics,
			library: library,
			scene: scene
		};

	}

} );

export { ColladaLoader };
