import {
	AmbientLight,
	AnimationClip,
	Bone,
	BufferGeometry,
	ClampToEdgeWrapping,
	Color,
	ColorManagement,
	DirectionalLight,
	DoubleSide,
	Float32BufferAttribute,
	FrontSide,
	Group,
	InterpolateBezier,
	InterpolateDiscrete,
	Line,
	LineBasicMaterial,
	LineSegments,
	Loader,
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
	Skeleton,
	SkinnedMesh,
	SpotLight,
	Vector2,
	Vector3,
	VectorKeyframeTrack,
	SRGBColorSpace
} from 'three';

import { getElementsByTagName, parseFloats } from './ColladaParser.js';

/**
 * ColladaComposer converts parsed library data into Three.js objects.
 */
class ColladaComposer {

	constructor( library, collada, textureLoader, tgaLoader ) {

		this.library = library;
		this.collada = collada;
		this.textureLoader = textureLoader;
		this.tgaLoader = tgaLoader;

		this.tempColor = new Color();
		this.animations = [];
		this.kinematics = {};

		// Reusable objects for animation
		this.position = new Vector3();
		this.scale = new Vector3();
		this.quaternion = new Quaternion();
		this.matrix = new Matrix4();

		// Storage for deferred pivot animation data
		// Nodes with pivot transforms need all their animation channels collected
		// before building tracks, as channels may be split across animation elements
		this.deferredPivotAnimations = {};

		// Storage for transform node hierarchy
		// Maps nodeId -> transformSid -> Object3D for animation targeting
		this.transformNodes = {};

	}

	compose() {

		const library = this.library;

		this.buildLibrary( library.animations, this.buildAnimation.bind( this ) );
		this.buildLibrary( library.clips, this.buildAnimationClip.bind( this ) );
		this.buildLibrary( library.controllers, this.buildController.bind( this ) );
		this.buildLibrary( library.images, this.buildImage.bind( this ) );
		this.buildLibrary( library.effects, this.buildEffect.bind( this ) );
		this.buildLibrary( library.materials, this.buildMaterial.bind( this ) );
		this.buildLibrary( library.cameras, this.buildCamera.bind( this ) );
		this.buildLibrary( library.lights, this.buildLight.bind( this ) );
		this.buildLibrary( library.geometries, this.buildGeometry.bind( this ) );
		this.buildLibrary( library.visualScenes, this.buildVisualScene.bind( this ) );

		this.setupAnimations();
		this.setupKinematics();

		const scene = this.parseScene( getElementsByTagName( this.collada, 'scene' )[ 0 ] );
		scene.animations = this.animations;

		return {
			scene: scene,
			animations: this.animations,
			kinematics: this.kinematics
		};

	}

	buildLibrary( data, builder ) {

		for ( const name in data ) {

			const object = data[ name ];
			object.build = builder( data[ name ] );

		}

	}

	getBuild( data, builder ) {

		if ( data.build !== undefined ) return data.build;

		data.build = builder( data );

		return data.build;

	}

	isEmpty( object ) {

		return Object.keys( object ).length === 0;

	}

	buildAnimation( data ) {

		const tracks = [];

		const channels = data.channels;
		const samplers = data.samplers;
		const sources = data.sources;

		const aggregated = this.aggregateAnimationChannels( channels, samplers, sources );

		for ( const nodeId in aggregated ) {

			const nodeData = this.library.nodes[ nodeId ];
			if ( ! nodeData ) continue;

			const nodeChannels = aggregated[ nodeId ];

			if ( this.hasPivotTransforms( nodeData ) ) {

				// Defer - nodes haven't been built yet
				this.collectDeferredPivotAnimation( nodeId, nodeChannels );

			} else {

				const object3D = this.getNode( nodeId );
				let rotationTrackBuilt = false;

				for ( const sid in nodeChannels ) {

					const transformType = nodeData.transforms[ sid ];
					const transformInfo = nodeData.transformData[ sid ];
					const channelData = nodeChannels[ sid ];

					switch ( transformType ) {

						case 'matrix':
							this.buildMatrixTracks( object3D, channelData, nodeData, tracks );
							break;

						case 'translate':
							this.buildTranslateTrack( object3D, channelData, transformInfo, tracks );
							break;

						case 'rotate':
							if ( ! rotationTrackBuilt ) {

								this.buildRotateTrack( object3D, sid, channelData, transformInfo, nodeData, tracks );
								rotationTrackBuilt = true;

							}

							break;

						case 'scale':
							this.buildScaleTrack( object3D, channelData, transformInfo, tracks );
							break;

					}

				}

			}

		}

		return tracks;

	}

	collectDeferredPivotAnimation( nodeId, nodeChannels ) {

		if ( ! this.deferredPivotAnimations[ nodeId ] ) {

			this.deferredPivotAnimations[ nodeId ] = {};

		}

		const deferred = this.deferredPivotAnimations[ nodeId ];

		for ( const sid in nodeChannels ) {

			if ( ! deferred[ sid ] ) {

				deferred[ sid ] = {};

			}

			for ( const member in nodeChannels[ sid ] ) {

				deferred[ sid ][ member ] = nodeChannels[ sid ][ member ];

			}

		}

	}

	hasPivotTransforms( nodeData ) {

		const pivotSids = [
			'rotatePivot', 'rotatePivotInverse', 'rotatePivotTranslation',
			'scalePivot', 'scalePivotInverse', 'scalePivotTranslation'
		];

		for ( const sid of pivotSids ) {

			if ( nodeData.transforms[ sid ] !== undefined ) {

				return true;

			}

		}

		return false;

	}

	getAnimation( id ) {

		return this.getBuild( this.library.animations[ id ], this.buildAnimation.bind( this ) );

	}

	aggregateAnimationChannels( channels, samplers, sources ) {

		const aggregated = {};

		for ( const target in channels ) {

			if ( ! channels.hasOwnProperty( target ) ) continue;

			const channel = channels[ target ];
			const sampler = samplers[ channel.sampler ];

			const inputId = sampler.inputs.INPUT;
			const outputId = sampler.inputs.OUTPUT;

			const inputSource = sources[ inputId ];
			const outputSource = sources[ outputId ];

			const interpolationId = sampler.inputs.INTERPOLATION;
			const inTangentId = sampler.inputs.IN_TANGENT;
			const outTangentId = sampler.inputs.OUT_TANGENT;

			const interpolationSource = interpolationId ? sources[ interpolationId ] : null;
			const inTangentSource = inTangentId ? sources[ inTangentId ] : null;
			const outTangentSource = outTangentId ? sources[ outTangentId ] : null;

			const nodeId = channel.id;
			const sid = channel.sid;
			const member = channel.member || 'default';

			if ( ! aggregated[ nodeId ] ) aggregated[ nodeId ] = {};
			if ( ! aggregated[ nodeId ][ sid ] ) aggregated[ nodeId ][ sid ] = {};

			aggregated[ nodeId ][ sid ][ member ] = {
				times: inputSource.array,
				values: outputSource.array,
				stride: outputSource.stride,
				arraySyntax: channel.arraySyntax,
				indices: channel.indices,
				interpolation: interpolationSource ? interpolationSource.array : null,
				inTangent: inTangentSource ? inTangentSource.array : null,
				outTangent: outTangentSource ? outTangentSource.array : null,
				inTangentStride: inTangentSource ? inTangentSource.stride : 0,
				outTangentStride: outTangentSource ? outTangentSource.stride : 0
			};

		}

		return aggregated;

	}

	buildMatrixTracks( object3D, channelData, nodeData, tracks ) {

		const defaultMatrix = nodeData.matrix.clone().transpose();
		const data = {};

		for ( const member in channelData ) {

			const component = channelData[ member ];
			const times = component.times;
			const values = component.values;
			const stride = component.stride;

			for ( let i = 0, il = times.length; i < il; i ++ ) {

				const time = times[ i ];
				const valueOffset = i * stride;

				if ( data[ time ] === undefined ) data[ time ] = {};

				if ( component.arraySyntax === true ) {

					const value = values[ valueOffset ];
					const index = component.indices[ 0 ] + 4 * component.indices[ 1 ];
					data[ time ][ index ] = value;

				} else {

					for ( let j = 0; j < stride; j ++ ) {

						data[ time ][ j ] = values[ valueOffset + j ];

					}

				}

			}

		}

		const keyframes = this.prepareAnimationData( data, defaultMatrix );
		const animation = { name: object3D.uuid, keyframes: keyframes };
		this.createKeyframeTracks( animation, tracks );

	}

	buildTranslateTrack( object3D, channelData, transformInfo, tracks ) {

		if ( channelData.default && channelData.default.stride === 3 ) {

			const data = channelData.default;
			const times = Array.from( data.times );
			const values = Array.from( data.values );

			const track = new VectorKeyframeTrack(
				object3D.uuid + '.position',
				times,
				values
			);

			const interpolationInfo = this.getInterpolationInfo( channelData );
			this.applyInterpolation( track, interpolationInfo, channelData );
			tracks.push( track );
			return;

		}

		const times = this.getTimesForAllAxes( channelData );
		if ( times.length === 0 ) return;

		const values = [];
		const interpolationInfo = this.getInterpolationInfo( channelData );

		for ( let i = 0; i < times.length; i ++ ) {

			const time = times[ i ];

			const x = this.getValueAtTime( channelData.X, time, transformInfo.x );
			const y = this.getValueAtTime( channelData.Y, time, transformInfo.y );
			const z = this.getValueAtTime( channelData.Z, time, transformInfo.z );

			values.push( x, y, z );

		}

		const track = new VectorKeyframeTrack(
			object3D.uuid + '.position',
			times,
			values
		);

		this.applyInterpolation( track, interpolationInfo );
		tracks.push( track );

	}

	buildRotateTrack( object3D, sid, channelData, transformInfo, nodeData, tracks ) {

		const angleData = channelData.ANGLE || channelData.default;
		if ( ! angleData ) return;

		const times = Array.from( angleData.times );
		if ( times.length === 0 ) return;

		// Collect all rotations to compose them in order
		const rotations = [];

		for ( const transformSid of nodeData.transformOrder ) {

			const transformType = nodeData.transforms[ transformSid ];

			if ( transformType === 'rotate' ) {

				const info = nodeData.transformData[ transformSid ];
				rotations.push( {
					sid: transformSid,
					axis: new Vector3( info.axis[ 0 ], info.axis[ 1 ], info.axis[ 2 ] ),
					defaultAngle: info.angle
				} );

			}

		}

		const quaternion = new Quaternion();
		const prevQuaternion = new Quaternion();
		const tempQuat = new Quaternion();
		const values = [];
		const interpolationInfo = this.getInterpolationInfo( channelData );

		for ( let i = 0; i < times.length; i ++ ) {

			const time = times[ i ];
			quaternion.identity();

			for ( const rotation of rotations ) {

				let angleDegrees;

				if ( rotation.sid === sid ) {

					angleDegrees = this.getValueAtTime( angleData, time, rotation.defaultAngle );

				} else {

					angleDegrees = rotation.defaultAngle;

				}

				const angleRadians = MathUtils.degToRad( angleDegrees );
				tempQuat.setFromAxisAngle( rotation.axis, angleRadians );
				quaternion.multiply( tempQuat );

			}

			// Ensure quaternion continuity
			if ( i > 0 && prevQuaternion.dot( quaternion ) < 0 ) {

				quaternion.x = - quaternion.x;
				quaternion.y = - quaternion.y;
				quaternion.z = - quaternion.z;
				quaternion.w = - quaternion.w;

			}

			prevQuaternion.copy( quaternion );

			values.push( quaternion.x, quaternion.y, quaternion.z, quaternion.w );

		}

		const track = new QuaternionKeyframeTrack(
			object3D.uuid + '.quaternion',
			times,
			values
		);

		this.applyInterpolation( track, interpolationInfo );
		tracks.push( track );

	}

	buildScaleTrack( object3D, channelData, transformInfo, tracks ) {

		if ( channelData.default && channelData.default.stride === 3 ) {

			const data = channelData.default;
			const times = Array.from( data.times );
			const values = Array.from( data.values );

			const track = new VectorKeyframeTrack(
				object3D.uuid + '.scale',
				times,
				values
			);

			const interpolationInfo = this.getInterpolationInfo( channelData );
			this.applyInterpolation( track, interpolationInfo, channelData );
			tracks.push( track );
			return;

		}

		const times = this.getTimesForAllAxes( channelData );
		if ( times.length === 0 ) return;

		const values = [];
		const interpolationInfo = this.getInterpolationInfo( channelData );

		for ( let i = 0; i < times.length; i ++ ) {

			const time = times[ i ];

			const x = this.getValueAtTime( channelData.X, time, transformInfo.x );
			const y = this.getValueAtTime( channelData.Y, time, transformInfo.y );
			const z = this.getValueAtTime( channelData.Z, time, transformInfo.z );

			values.push( x, y, z );

		}

		const track = new VectorKeyframeTrack(
			object3D.uuid + '.scale',
			times,
			values
		);

		this.applyInterpolation( track, interpolationInfo );
		tracks.push( track );

	}

	getTimesForAllAxes( channelData ) {

		let times = [];

		if ( channelData.X ) times = times.concat( Array.from( channelData.X.times ) );
		if ( channelData.Y ) times = times.concat( Array.from( channelData.Y.times ) );
		if ( channelData.Z ) times = times.concat( Array.from( channelData.Z.times ) );
		if ( channelData.ANGLE ) times = times.concat( Array.from( channelData.ANGLE.times ) );
		if ( channelData.default ) times = times.concat( Array.from( channelData.default.times ) );

		times = [ ...new Set( times ) ].sort( ( a, b ) => a - b );

		return times;

	}

	getValueAtTime( componentData, time, defaultValue ) {

		if ( ! componentData ) return defaultValue;

		const times = componentData.times;
		const values = componentData.values;
		const interpolation = componentData.interpolation;

		for ( let i = 0; i < times.length; i ++ ) {

			if ( times[ i ] === time ) {

				return values[ i ];

			}

			if ( times[ i ] > time ) {

				if ( i === 0 ) {

					return values[ 0 ];

				}

				const i0 = i - 1;
				const i1 = i;
				const t0 = times[ i0 ];
				const t1 = times[ i1 ];
				const v0 = values[ i0 ];
				const v1 = values[ i1 ];

				const interp = interpolation ? interpolation[ i0 ] : 'LINEAR';

				if ( interp === 'STEP' ) {

					return v0;

				} else if ( interp === 'BEZIER' && componentData.inTangent && componentData.outTangent ) {

					return this.evaluateBezierComponent( componentData, i0, i1, t0, t1, time );

				} else {

					const t = ( time - t0 ) / ( t1 - t0 );
					return v0 + t * ( v1 - v0 );

				}

			}

		}

		return values[ values.length - 1 ];

	}

	evaluateBezierComponent( componentData, i0, i1, t0, t1, time ) {

		const values = componentData.values;
		const inTangent = componentData.inTangent;
		const outTangent = componentData.outTangent;
		const tangentStride = componentData.inTangentStride || 1;

		const v0 = values[ i0 ];
		const v1 = values[ i1 ];

		let c0x, c0y, c1x, c1y;

		if ( tangentStride === 2 ) {

			c0x = outTangent[ i0 * 2 ];
			c0y = outTangent[ i0 * 2 + 1 ];
			c1x = inTangent[ i1 * 2 ];
			c1y = inTangent[ i1 * 2 + 1 ];

		} else {

			c0x = t0 + ( t1 - t0 ) / 3;
			c0y = outTangent[ i0 ];
			c1x = t1 - ( t1 - t0 ) / 3;
			c1y = inTangent[ i1 ];

		}

		// Newton-Raphson to solve Bx(s) = time
		let s = ( time - t0 ) / ( t1 - t0 );

		for ( let iter = 0; iter < 8; iter ++ ) {

			const s2 = s * s;
			const s3 = s2 * s;
			const oneMinusS = 1 - s;
			const oneMinusS2 = oneMinusS * oneMinusS;
			const oneMinusS3 = oneMinusS2 * oneMinusS;

			const bx = oneMinusS3 * t0 + 3 * oneMinusS2 * s * c0x + 3 * oneMinusS * s2 * c1x + s3 * t1;
			const dbx = 3 * oneMinusS2 * ( c0x - t0 ) + 6 * oneMinusS * s * ( c1x - c0x ) + 3 * s2 * ( t1 - c1x );

			if ( Math.abs( dbx ) < 1e-10 ) break;

			const error = bx - time;
			if ( Math.abs( error ) < 1e-10 ) break;

			s = s - error / dbx;
			s = Math.max( 0, Math.min( 1, s ) );

		}

		const s2 = s * s;
		const s3 = s2 * s;
		const oneMinusS = 1 - s;
		const oneMinusS2 = oneMinusS * oneMinusS;
		const oneMinusS3 = oneMinusS2 * oneMinusS;

		return oneMinusS3 * v0 + 3 * oneMinusS2 * s * c0y + 3 * oneMinusS * s2 * c1y + s3 * v1;

	}

	getInterpolationInfo( channelData ) {

		const components = [ 'X', 'Y', 'Z', 'ANGLE', 'default' ];
		let interpolationType = null;
		let isUniform = true;

		for ( const comp of components ) {

			const data = channelData[ comp ];
			if ( ! data || ! data.interpolation ) continue;

			const interpArray = data.interpolation;

			for ( let i = 0; i < interpArray.length; i ++ ) {

				const interp = interpArray[ i ];

				if ( interpolationType === null ) {

					interpolationType = interp;

				} else if ( interp !== interpolationType ) {

					isUniform = false;

				}

			}

		}

		return {
			type: interpolationType || 'LINEAR',
			uniform: isUniform
		};

	}

	applyInterpolation( track, interpolationInfo, channelData = null ) {

		if ( interpolationInfo.type === 'STEP' && interpolationInfo.uniform ) {

			track.setInterpolation( InterpolateDiscrete );

		} else if ( interpolationInfo.type === 'BEZIER' && interpolationInfo.uniform && channelData ) {

			const data = channelData.default;

			if ( data && data.inTangent && data.outTangent ) {

				track.setInterpolation( InterpolateBezier );
				track.settings = {
					inTangents: new Float32Array( data.inTangent ),
					outTangents: new Float32Array( data.outTangent )
				};

			}

		}

	}

	prepareAnimationData( data, defaultMatrix ) {

		const keyframes = [];

		for ( const time in data ) {

			keyframes.push( { time: parseFloat( time ), value: data[ time ] } );

		}

		keyframes.sort( ( a, b ) => a.time - b.time );

		for ( let i = 0; i < 16; i ++ ) {

			this.transformAnimationData( keyframes, i, defaultMatrix.elements[ i ] );

		}

		return keyframes;

	}

	createKeyframeTracks( animation, tracks ) {

		const keyframes = animation.keyframes;
		const name = animation.name;

		const times = [];
		const positionData = [];
		const quaternionData = [];
		const scaleData = [];

		const position = this.position;
		const quaternion = this.quaternion;
		const scale = this.scale;
		const matrix = this.matrix;

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

	transformAnimationData( keyframes, property, defaultValue ) {

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

			this.createMissingKeyframes( keyframes, property );

		}

	}

	createMissingKeyframes( keyframes, property ) {

		let prev, next;

		for ( let i = 0, l = keyframes.length; i < l; i ++ ) {

			const keyframe = keyframes[ i ];

			if ( keyframe.value[ property ] === null ) {

				prev = this.getPrev( keyframes, i, property );
				next = this.getNext( keyframes, i, property );

				if ( prev === null ) {

					keyframe.value[ property ] = next.value[ property ];
					continue;

				}

				if ( next === null ) {

					keyframe.value[ property ] = prev.value[ property ];
					continue;

				}

				this.interpolate( keyframe, prev, next, property );

			}

		}

	}

	getPrev( keyframes, i, property ) {

		while ( i >= 0 ) {

			const keyframe = keyframes[ i ];

			if ( keyframe.value[ property ] !== null ) return keyframe;

			i --;

		}

		return null;

	}

	getNext( keyframes, i, property ) {

		while ( i < keyframes.length ) {

			const keyframe = keyframes[ i ];

			if ( keyframe.value[ property ] !== null ) return keyframe;

			i ++;

		}

		return null;

	}

	interpolate( key, prev, next, property ) {

		if ( ( next.time - prev.time ) === 0 ) {

			key.value[ property ] = prev.value[ property ];
			return;

		}

		key.value[ property ] = ( ( key.time - prev.time ) * ( next.value[ property ] - prev.value[ property ] ) / ( next.time - prev.time ) ) + prev.value[ property ];

	}


	buildAnimationClip( data ) {

		const tracks = [];

		const name = data.name;
		const duration = ( data.end - data.start ) || - 1;
		const animations = data.animations;

		for ( let i = 0, il = animations.length; i < il; i ++ ) {

			const animationTracks = this.getAnimation( animations[ i ] );

			for ( let j = 0, jl = animationTracks.length; j < jl; j ++ ) {

				tracks.push( animationTracks[ j ] );

			}

		}

		return new AnimationClip( name, duration, tracks );

	}

	getAnimationClip( id ) {

		return this.getBuild( this.library.clips[ id ], this.buildAnimationClip.bind( this ) );

	}


	buildController( data ) {

		const build = {
			id: data.id
		};

		const geometry = this.library.geometries[ build.id ];

		if ( data.skin !== undefined ) {

			build.skin = this.buildSkin( data.skin );

			// we enhance the 'sources' property of the corresponding geometry with our skin data

			geometry.sources.skinIndices = build.skin.indices;
			geometry.sources.skinWeights = build.skin.weights;

		}

		return build;

	}

	buildSkin( data ) {

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

		// process skin data for each vertex

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
			// this ensures, we only proceed the most important joints of the vertex

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

	getController( id ) {

		return this.getBuild( this.library.controllers[ id ], this.buildController.bind( this ) );

	}


	buildImage( data ) {

		if ( data.build !== undefined ) return data.build;

		return data.init_from;

	}

	getImage( id ) {

		const data = this.library.images[ id ];

		if ( data !== undefined ) {

			return this.getBuild( data, this.buildImage.bind( this ) );

		}

		console.warn( 'THREE.ColladaLoader: Couldn\'t find image with ID:', id );

		return null;

	}


	buildEffect( data ) {

		return data;

	}

	getEffect( id ) {

		return this.getBuild( this.library.effects[ id ], this.buildEffect.bind( this ) );

	}


	getTextureLoader( image ) {

		let loader;

		let extension = image.slice( ( image.lastIndexOf( '.' ) - 1 >>> 0 ) + 2 ); // http://www.jstips.co/en/javascript/get-file-extension/
		extension = extension.toLowerCase();

		switch ( extension ) {

			case 'tga':
				loader = this.tgaLoader;
				break;

			default:
				loader = this.textureLoader;

		}

		return loader;

	}

	buildMaterial( data ) {

		const effect = this.getEffect( data.url );
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

		const self = this;

		function getTexture( textureObject, colorSpace = null ) {

			const sampler = effect.profile.samplers[ textureObject.id ];
			let image = null;

			// get image

			if ( sampler !== undefined ) {

				const surface = effect.profile.surfaces[ sampler.source ];
				image = self.getImage( surface.init_from );

			} else {

				console.warn( 'THREE.ColladaLoader: Undefined sampler. Access image directly (see #12530).' );
				image = self.getImage( textureObject.id );

			}

			// create texture if image is available

			if ( image !== null ) {

				const loader = self.getTextureLoader( image );

				if ( loader !== undefined ) {

					const texture = loader.load( image );

					const extra = textureObject.extra;

					if ( extra !== undefined && extra.technique !== undefined && self.isEmpty( extra.technique ) === false ) {

						const technique = extra.technique;

						texture.wrapS = technique.wrapU ? RepeatWrapping : ClampToEdgeWrapping;
						texture.wrapT = technique.wrapV ? RepeatWrapping : ClampToEdgeWrapping;

						texture.offset.set( technique.offsetU || 0, technique.offsetV || 0 );
						texture.repeat.set( technique.repeatU || 1, technique.repeatV || 1 );

					} else {

						texture.wrapS = RepeatWrapping;
						texture.wrapT = RepeatWrapping;

					}

					if ( colorSpace !== null ) {

						texture.colorSpace = colorSpace;

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
					if ( parameter.texture ) material.map = getTexture( parameter.texture, SRGBColorSpace );
					break;
				case 'specular':
					if ( parameter.color && material.specular ) material.specular.fromArray( parameter.color );
					if ( parameter.texture ) material.specularMap = getTexture( parameter.texture );
					break;
				case 'bump':
					if ( parameter.texture ) material.normalMap = getTexture( parameter.texture );
					break;
				case 'ambient':
					if ( parameter.texture ) material.lightMap = getTexture( parameter.texture, SRGBColorSpace );
					break;
				case 'shininess':
					if ( parameter.float && material.shininess ) material.shininess = parameter.float;
					break;
				case 'emission':
					if ( parameter.color && material.emissive ) material.emissive.fromArray( parameter.color );
					if ( parameter.texture ) material.emissiveMap = getTexture( parameter.texture, SRGBColorSpace );
					break;

			}

		}

		ColorManagement.colorSpaceToWorking( material.color, SRGBColorSpace );
		if ( material.specular ) ColorManagement.colorSpaceToWorking( material.specular, SRGBColorSpace );
		if ( material.emissive ) ColorManagement.colorSpaceToWorking( material.emissive, SRGBColorSpace );

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

	getMaterial( id ) {

		return this.getBuild( this.library.materials[ id ], this.buildMaterial.bind( this ) );

	}


	buildCamera( data ) {

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

	getCamera( id ) {

		const data = this.library.cameras[ id ];

		if ( data !== undefined ) {

			return this.getBuild( data, this.buildCamera.bind( this ) );

		}

		console.warn( 'THREE.ColladaLoader: Couldn\'t find camera with ID:', id );

		return null;

	}


	buildLight( data ) {

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
		if ( data.parameters.falloffAngle ) light.angle = MathUtils.degToRad( data.parameters.falloffAngle );

		return light;

	}

	getLight( id ) {

		const data = this.library.lights[ id ];

		if ( data !== undefined ) {

			return this.getBuild( data, this.buildLight.bind( this ) );

		}

		console.warn( 'THREE.ColladaLoader: Couldn\'t find light with ID:', id );

		return null;

	}


	groupPrimitives( primitives ) {

		const build = {};

		for ( let i = 0; i < primitives.length; i ++ ) {

			const primitive = primitives[ i ];

			if ( build[ primitive.type ] === undefined ) build[ primitive.type ] = [];

			build[ primitive.type ].push( primitive );

		}

		return build;

	}

	checkUVCoordinates( primitives ) {

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

	buildGeometry( data ) {

		const build = {};

		const sources = data.sources;
		const vertices = data.vertices;
		const primitives = data.primitives;

		if ( primitives.length === 0 ) return {};

		// our goal is to create one buffer geometry for a single type of primitives
		// first, we group all primitives by their type

		const groupedPrimitives = this.groupPrimitives( primitives );

		for ( const type in groupedPrimitives ) {

			const primitiveType = groupedPrimitives[ type ];

			// second, ensure consistent uv coordinates for each type of primitives (polylist,triangles or lines)

			this.checkUVCoordinates( primitiveType );

			// third, create a buffer geometry for each type of primitives

			build[ type ] = this.buildGeometryType( primitiveType, sources, vertices );

		}

		return build;

	}

	buildGeometryType( primitives, sources, vertices ) {

		const build = {};

		const position = { array: [], stride: 0 };
		const normal = { array: [], stride: 0 };
		const uv = { array: [], stride: 0 };
		const uv1 = { array: [], stride: 0 };
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
					console.warn( 'THREE.ColladaLoader: Unknown primitive type:', primitive.type );

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
									this.buildGeometryData( primitive, sources[ id ], input.offset, position.array );
									position.stride = sources[ id ].stride;

									if ( sources.skinWeights && sources.skinIndices ) {

										this.buildGeometryData( primitive, sources.skinIndices, input.offset, skinIndex.array );
										this.buildGeometryData( primitive, sources.skinWeights, input.offset, skinWeight.array );

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
									this.buildGeometryData( primitive, sources[ id ], input.offset, normal.array );
									normal.stride = sources[ id ].stride;
									break;

								case 'COLOR':
									this.buildGeometryData( primitive, sources[ id ], input.offset, color.array );
									color.stride = sources[ id ].stride;
									break;

								case 'TEXCOORD':
									this.buildGeometryData( primitive, sources[ id ], input.offset, uv.array );
									uv.stride = sources[ id ].stride;
									break;

								case 'TEXCOORD1':
									this.buildGeometryData( primitive, sources[ id ], input.offset, uv1.array );
									uv.stride = sources[ id ].stride;
									break;

								default:
									console.warn( 'THREE.ColladaLoader: Semantic "%s" not handled in geometry build process.', key );

							}

						}

						break;

					case 'NORMAL':
						this.buildGeometryData( primitive, sources[ input.id ], input.offset, normal.array );
						normal.stride = sources[ input.id ].stride;
						break;

					case 'COLOR':
						this.buildGeometryData( primitive, sources[ input.id ], input.offset, color.array, true );
						color.stride = sources[ input.id ].stride;
						break;

					case 'TEXCOORD':
						this.buildGeometryData( primitive, sources[ input.id ], input.offset, uv.array );
						uv.stride = sources[ input.id ].stride;
						break;

					case 'TEXCOORD1':
						this.buildGeometryData( primitive, sources[ input.id ], input.offset, uv1.array );
						uv1.stride = sources[ input.id ].stride;
						break;

				}

			}

		}

		// build geometry

		if ( position.array.length > 0 ) geometry.setAttribute( 'position', new Float32BufferAttribute( position.array, position.stride ) );
		if ( normal.array.length > 0 ) geometry.setAttribute( 'normal', new Float32BufferAttribute( normal.array, normal.stride ) );
		if ( color.array.length > 0 ) geometry.setAttribute( 'color', new Float32BufferAttribute( color.array, color.stride ) );
		if ( uv.array.length > 0 ) geometry.setAttribute( 'uv', new Float32BufferAttribute( uv.array, uv.stride ) );
		if ( uv1.array.length > 0 ) geometry.setAttribute( 'uv1', new Float32BufferAttribute( uv1.array, uv1.stride ) );

		if ( skinIndex.array.length > 0 ) geometry.setAttribute( 'skinIndex', new Float32BufferAttribute( skinIndex.array, skinIndex.stride ) );
		if ( skinWeight.array.length > 0 ) geometry.setAttribute( 'skinWeight', new Float32BufferAttribute( skinWeight.array, skinWeight.stride ) );

		build.data = geometry;
		build.type = primitives[ 0 ].type;
		build.materialKeys = materialKeys;

		return build;

	}

	buildGeometryData( primitive, source, offset, array, isColor = false ) {

		const indices = primitive.p;
		const stride = primitive.stride;
		const vcount = primitive.vcount;

		const tempColor = this.tempColor;

		function pushVector( i ) {

			let index = indices[ i + offset ] * sourceStride;
			const length = index + sourceStride;

			for ( ; index < length; index ++ ) {

				array.push( sourceArray[ index ] );

			}

			if ( isColor ) {

				// convert the vertex colors from srgb to linear if present
				const startIndex = array.length - sourceStride - 1;
				tempColor.setRGB(
					array[ startIndex + 0 ],
					array[ startIndex + 1 ],
					array[ startIndex + 2 ],
					SRGBColorSpace
				);

				array[ startIndex + 0 ] = tempColor.r;
				array[ startIndex + 1 ] = tempColor.g;
				array[ startIndex + 2 ] = tempColor.b;

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

	getGeometry( id ) {

		return this.getBuild( this.library.geometries[ id ], this.buildGeometry.bind( this ) );

	}


	buildKinematicsModel( data ) {

		if ( data.build !== undefined ) return data.build;

		return data;

	}

	getKinematicsModel( id ) {

		return this.getBuild( this.library.kinematicsModels[ id ], this.buildKinematicsModel.bind( this ) );

	}

	buildKinematicsScene( data ) {

		if ( data.build !== undefined ) return data.build;

		return data;

	}

	getKinematicsScene( id ) {

		return this.getBuild( this.library.kinematicsScenes[ id ], this.buildKinematicsScene.bind( this ) );

	}

	setupKinematics() {

		const kinematicsModelId = Object.keys( this.library.kinematicsModels )[ 0 ];
		const kinematicsSceneId = Object.keys( this.library.kinematicsScenes )[ 0 ];
		const visualSceneId = Object.keys( this.library.visualScenes )[ 0 ];

		if ( kinematicsModelId === undefined || kinematicsSceneId === undefined ) return;

		const kinematicsModel = this.getKinematicsModel( kinematicsModelId );
		const kinematicsScene = this.getKinematicsScene( kinematicsSceneId );
		const visualScene = this.getVisualScene( visualSceneId );

		const bindJointAxis = kinematicsScene.bindJointAxis;
		const jointMap = {};

		const collada = this.collada;
		const self = this;

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
			const transforms = self.buildTransformList( visualElement );

			visualScene.traverse( function ( object ) {

				if ( object.name === visualElementName ) {

					jointMap[ jointIndex ] = {
						object: object,
						transforms: transforms,
						joint: joint,
						position: joint.zeroPosition
					};

				}

			} );

		}

		const m0 = new Matrix4();
		const matrix = this.matrix;

		this.kinematics = {

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

					console.warn( 'THREE.ColladaLoader: Joint ' + jointIndex + ' does not exist.' );

				}

			}

		};

	}

	buildTransformList( node ) {

		const transforms = [];

		const xml = this.collada.querySelector( '[id="' + node.id + '"]' );

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


	buildSkeleton( skeletons, joints ) {

		const boneData = [];
		const sortedBoneData = [];

		let i, j, data;

		// a skeleton can have multiple root bones. collada expresses this
		// situation with multiple "skeleton" tags per controller instance

		for ( i = 0; i < skeletons.length; i ++ ) {

			const skeleton = skeletons[ i ];

			let root;

			if ( this.hasNode( skeleton ) ) {

				root = this.getNode( skeleton );
				this.buildBoneHierarchy( root, joints, boneData );

			} else if ( this.hasVisualScene( skeleton ) ) {

				// handle case where the skeleton refers to the visual scene (#13335)

				const visualScene = this.library.visualScenes[ skeleton ];
				const children = visualScene.children;

				for ( let j = 0; j < children.length; j ++ ) {

					const child = children[ j ];

					if ( child.type === 'JOINT' ) {

						const root = this.getNode( child.id );
						this.buildBoneHierarchy( root, joints, boneData );

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

	buildBoneHierarchy( root, joints, boneData ) {

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

	buildNode( data ) {

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

			objects.push( this.getNode( nodes[ i ] ) );

		}

		// instance cameras

		for ( let i = 0, l = instanceCameras.length; i < l; i ++ ) {

			const instanceCamera = this.getCamera( instanceCameras[ i ] );

			if ( instanceCamera !== null ) {

				objects.push( instanceCamera.clone() );

			}

		}

		// instance controllers

		for ( let i = 0, l = instanceControllers.length; i < l; i ++ ) {

			const instance = instanceControllers[ i ];
			const controller = this.getController( instance.id );
			const geometries = this.getGeometry( controller.id );
			const newObjects = this.buildObjects( geometries, instance.materials );

			const skeletons = instance.skeletons;
			const joints = controller.skin.joints;

			const skeleton = this.buildSkeleton( skeletons, joints );

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

			const instanceLight = this.getLight( instanceLights[ i ] );

			if ( instanceLight !== null ) {

				objects.push( instanceLight.clone() );

			}

		}

		// instance geometries

		for ( let i = 0, l = instanceGeometries.length; i < l; i ++ ) {

			const instance = instanceGeometries[ i ];

			// a single geometry instance in collada can lead to multiple object3Ds.
			// this is the case when primitives are combined like triangles and lines

			const geometries = this.getGeometry( instance.id );
			const newObjects = this.buildObjects( geometries, instance.materials );

			for ( let j = 0, jl = newObjects.length; j < jl; j ++ ) {

				objects.push( newObjects[ j ] );

			}

		}

		// instance nodes

		for ( let i = 0, l = instanceNodes.length; i < l; i ++ ) {

			objects.push( this.getNode( instanceNodes[ i ] ).clone() );

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

		if ( type !== 'JOINT' && this.hasPivotTransforms( data ) ) {

			return this.wrapWithTransformHierarchy( object, data );

		}

		object.matrix.copy( matrix );
		object.matrix.decompose( object.position, object.quaternion, object.scale );

		return object;

	}

	wrapWithTransformHierarchy( contentObject, nodeData ) {

		const nodeId = nodeData.id;
		this.transformNodes[ nodeId ] = {};

		const transformOrder = nodeData.transformOrder;
		const transformData = nodeData.transformData;

		const rootNode = new Group();
		rootNode.name = nodeData.name;

		let currentParent = rootNode;

		for ( let i = 0; i < transformOrder.length; i ++ ) {

			const sid = transformOrder[ i ];
			const info = transformData[ sid ];

			const transformNode = new Group();
			transformNode.name = nodeData.name + '_' + sid;

			switch ( info.type ) {

				case 'translate':
					transformNode.position.set( info.x, info.y, info.z );
					break;

				case 'rotate': {

					const axis = new Vector3( info.axis[ 0 ], info.axis[ 1 ], info.axis[ 2 ] );
					const angle = MathUtils.degToRad( info.angle );
					transformNode.quaternion.setFromAxisAngle( axis, angle );
					transformNode.userData.rotationAxis = axis;
					break;

				}

				case 'scale':
					transformNode.scale.set( info.x, info.y, info.z );
					break;

				case 'matrix': {

					const matrix = new Matrix4().fromArray( info.array ).transpose();
					matrix.decompose( transformNode.position, transformNode.quaternion, transformNode.scale );
					break;

				}

			}

			this.transformNodes[ nodeId ][ sid ] = transformNode;

			currentParent.add( transformNode );
			currentParent = transformNode;

		}

		currentParent.add( contentObject );

		return rootNode;

	}

	resolveMaterialBinding( keys, instanceMaterials ) {

		const materials = [];

		for ( let i = 0, l = keys.length; i < l; i ++ ) {

			const id = instanceMaterials[ keys[ i ] ];

			if ( id === undefined ) {

				console.warn( 'THREE.ColladaLoader: Material with key %s not found. Apply fallback material.', keys[ i ] );
				materials.push( this.fallbackMaterial );

			} else {

				materials.push( this.getMaterial( id ) );

			}

		}

		return materials;

	}

	get fallbackMaterial() {

		if ( this._fallbackMaterial === undefined ) {

			this._fallbackMaterial = new MeshBasicMaterial( {
				name: Loader.DEFAULT_MATERIAL_NAME,
				color: 0xff00ff
			} );

		}

		return this._fallbackMaterial;

	}

	buildObjects( geometries, instanceMaterials ) {

		const objects = [];

		for ( const type in geometries ) {

			const geometry = geometries[ type ];

			const materials = this.resolveMaterialBinding( geometry.materialKeys, instanceMaterials );

			// handle case if no materials are defined

			if ( materials.length === 0 ) {

				if ( type === 'lines' || type === 'linestrips' ) {

					materials.push( new LineBasicMaterial() );

				} else {

					materials.push( new MeshPhongMaterial() );

				}

			}

			// Collada allows to use phong and lambert materials with lines. Replacing these cases with LineBasicMaterial.

			if ( type === 'lines' || type === 'linestrips' ) {

				for ( let i = 0, l = materials.length; i < l; i ++ ) {

					const material = materials[ i ];

					if ( material.isMeshPhongMaterial === true || material.isMeshLambertMaterial === true ) {

						const lineMaterial = new LineBasicMaterial();

						// copy compatible properties

						lineMaterial.color.copy( material.color );
						lineMaterial.opacity = material.opacity;
						lineMaterial.transparent = material.transparent;

						// replace material

						materials[ i ] = lineMaterial;

					}

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

	hasNode( id ) {

		return this.library.nodes[ id ] !== undefined;

	}

	getNode( id ) {

		return this.getBuild( this.library.nodes[ id ], this.buildNode.bind( this ) );

	}


	buildVisualScene( data ) {

		const group = new Group();
		group.name = data.name;

		const children = data.children;

		for ( let i = 0; i < children.length; i ++ ) {

			const child = children[ i ];

			group.add( this.getNode( child.id ) );

		}

		return group;

	}

	hasVisualScene( id ) {

		return this.library.visualScenes[ id ] !== undefined;

	}

	getVisualScene( id ) {

		return this.getBuild( this.library.visualScenes[ id ], this.buildVisualScene.bind( this ) );

	}


	parseScene( xml ) {

		const instance = getElementsByTagName( xml, 'instance_visual_scene' )[ 0 ];
		return this.getVisualScene( this.parseId( instance.getAttribute( 'url' ) ) );

	}

	parseId( text ) {

		return text.substring( 1 );

	}

	setupAnimations() {

		const clips = this.library.clips;

		if ( this.isEmpty( clips ) === true ) {

			if ( this.isEmpty( this.library.animations ) === false ) {

				// if there are animations but no clips, we create a default clip for playback

				const tracks = [];

				for ( const id in this.library.animations ) {

					const animationTracks = this.getAnimation( id );

					for ( let i = 0, l = animationTracks.length; i < l; i ++ ) {

						tracks.push( animationTracks[ i ] );

					}

				}

				this.buildDeferredPivotAnimationTracks( tracks );

				this.animations.push( new AnimationClip( 'default', - 1, tracks ) );

			}

		} else {

			for ( const id in clips ) {

				this.animations.push( this.getAnimationClip( id ) );

			}

		}

	}

	buildDeferredPivotAnimationTracks( tracks ) {

		for ( const nodeId in this.deferredPivotAnimations ) {

			const nodeData = this.library.nodes[ nodeId ];
			if ( ! nodeData ) continue;

			const mergedChannels = this.deferredPivotAnimations[ nodeId ];
			this.buildTransformHierarchyTracks( nodeId, mergedChannels, nodeData, tracks );

		}

	}

	buildTransformHierarchyTracks( nodeId, nodeChannels, nodeData, tracks ) {

		const transformNodes = this.transformNodes[ nodeId ];

		if ( ! transformNodes ) {

			console.warn( 'THREE.ColladaLoader: Transform hierarchy not found for node:', nodeId );
			return;

		}

		for ( const sid in nodeChannels ) {

			const transformNode = transformNodes[ sid ];
			if ( ! transformNode ) continue;

			const transformType = nodeData.transforms[ sid ];
			const transformInfo = nodeData.transformData[ sid ];
			const channelData = nodeChannels[ sid ];

			switch ( transformType ) {

				case 'translate':
					this.buildHierarchyTranslateTrack( transformNode, channelData, transformInfo, tracks );
					break;

				case 'rotate':
					this.buildHierarchyRotateTrack( transformNode, channelData, transformInfo, tracks );
					break;

				case 'scale':
					this.buildHierarchyScaleTrack( transformNode, channelData, transformInfo, tracks );
					break;

			}

		}

	}

	buildHierarchyTranslateTrack( transformNode, channelData, transformInfo, tracks ) {

		if ( channelData.default && channelData.default.stride === 3 ) {

			const data = channelData.default;
			const track = new VectorKeyframeTrack(
				transformNode.uuid + '.position',
				Array.from( data.times ),
				Array.from( data.values )
			);

			const interpolationInfo = this.getInterpolationInfo( channelData );
			this.applyInterpolation( track, interpolationInfo, channelData );
			tracks.push( track );
			return;

		}

		const times = this.getTimesForAllAxes( channelData );
		if ( times.length === 0 ) return;

		const values = [];
		const interpolationInfo = this.getInterpolationInfo( channelData );

		for ( let i = 0; i < times.length; i ++ ) {

			const time = times[ i ];
			const x = this.getValueAtTime( channelData.X, time, transformInfo.x );
			const y = this.getValueAtTime( channelData.Y, time, transformInfo.y );
			const z = this.getValueAtTime( channelData.Z, time, transformInfo.z );
			values.push( x, y, z );

		}

		const track = new VectorKeyframeTrack(
			transformNode.uuid + '.position',
			times,
			values
		);

		this.applyInterpolation( track, interpolationInfo );
		tracks.push( track );

	}

	buildHierarchyRotateTrack( transformNode, channelData, transformInfo, tracks ) {

		const angleData = channelData.ANGLE || channelData.default;
		if ( ! angleData ) return;

		const times = Array.from( angleData.times );
		if ( times.length === 0 ) return;

		const axis = transformNode.userData.rotationAxis ||
			new Vector3( transformInfo.axis[ 0 ], transformInfo.axis[ 1 ], transformInfo.axis[ 2 ] );

		const quaternion = new Quaternion();
		const prevQuaternion = new Quaternion();
		const values = [];

		const interpolationInfo = this.getInterpolationInfo( channelData );

		for ( let i = 0; i < times.length; i ++ ) {

			const time = times[ i ];
			const angleDegrees = this.getValueAtTime( angleData, time, transformInfo.angle );
			const angleRadians = MathUtils.degToRad( angleDegrees );

			quaternion.setFromAxisAngle( axis, angleRadians );

			// Ensure quaternion continuity
			if ( i > 0 && prevQuaternion.dot( quaternion ) < 0 ) {

				quaternion.x = - quaternion.x;
				quaternion.y = - quaternion.y;
				quaternion.z = - quaternion.z;
				quaternion.w = - quaternion.w;

			}

			prevQuaternion.copy( quaternion );
			values.push( quaternion.x, quaternion.y, quaternion.z, quaternion.w );

		}

		const track = new QuaternionKeyframeTrack(
			transformNode.uuid + '.quaternion',
			times,
			values
		);

		this.applyInterpolation( track, interpolationInfo );
		tracks.push( track );

	}

	buildHierarchyScaleTrack( transformNode, channelData, transformInfo, tracks ) {

		if ( channelData.default && channelData.default.stride === 3 ) {

			const data = channelData.default;
			const track = new VectorKeyframeTrack(
				transformNode.uuid + '.scale',
				Array.from( data.times ),
				Array.from( data.values )
			);

			const interpolationInfo = this.getInterpolationInfo( channelData );
			this.applyInterpolation( track, interpolationInfo, channelData );
			tracks.push( track );
			return;

		}

		const times = this.getTimesForAllAxes( channelData );
		if ( times.length === 0 ) return;

		const values = [];
		const interpolationInfo = this.getInterpolationInfo( channelData );

		for ( let i = 0; i < times.length; i ++ ) {

			const time = times[ i ];
			const x = this.getValueAtTime( channelData.X, time, transformInfo.x );
			const y = this.getValueAtTime( channelData.Y, time, transformInfo.y );
			const z = this.getValueAtTime( channelData.Z, time, transformInfo.z );
			values.push( x, y, z );

		}

		const track = new VectorKeyframeTrack(
			transformNode.uuid + '.scale',
			times,
			values
		);

		this.applyInterpolation( track, interpolationInfo );
		tracks.push( track );

	}

}

export { ColladaComposer };
