/**
 * 	SEA3D Legacy for Three.JS
 * 	@author Sunag / http://www.sunag.com.br/
 */

'use strict';

//
//	Header
//

Object.assign( THREE.SEA3D.prototype, {

	_onHead: THREE.SEA3D.prototype.onHead,
	_updateTransform: THREE.SEA3D.prototype.updateTransform,
	_readMorph: THREE.SEA3D.prototype.readMorph,
	_readVertexAnimation: THREE.SEA3D.prototype.readVertexAnimation,
	_readGeometryBuffer: THREE.SEA3D.prototype.readGeometryBuffer,
	_readLine: THREE.SEA3D.prototype.readLine,
	_getModifier: THREE.SEA3D.prototype.getModifier,
	_readAnimation: THREE.SEA3D.prototype.readAnimation

} );

//
//	Utils
//

THREE.SEA3D.prototype.isLegacy = function ( sea ) {

	var sea3d = sea.sea3d;

	if ( sea3d.sign === "S3D" ) {

		return sea3d.config.legacy;

	}

	return false;

};

THREE.SEA3D.prototype.flipVec3 = function ( v ) {

	if ( ! v ) return;

	var i = 2;

	while ( i < v.length ) {

		v[ i ] = - v[ i ];

		i += 3;

	}

	return v;

};

THREE.SEA3D.prototype.addVector = function ( v, t ) {

	if ( ! v ) return;

	for ( var i = 0; i < v.length; i ++ ) {

		v[ i ] += t[ i ];

	}

	return v;

};

THREE.SEA3D.prototype.expandJoints = function ( sea ) {

	var numJoints = sea.numVertex * 4;

	var joint = sea.isBig ? new Uint32Array( numJoints ) : new Uint16Array( numJoints );
	var weight = new Float32Array( numJoints );

	var w = 0, jpv = sea.jointPerVertex;

	for ( var i = 0; i < sea.numVertex; i ++ ) {

		var tjsIndex = i * 4;
		var seaIndex = i * jpv;

		joint[ tjsIndex ] = sea.joint[ seaIndex ];
		if ( jpv > 1 ) joint[ tjsIndex + 1 ] = sea.joint[ seaIndex + 1 ];
		if ( jpv > 2 ) joint[ tjsIndex + 2 ] = sea.joint[ seaIndex + 2 ];
		if ( jpv > 3 ) joint[ tjsIndex + 3 ] = sea.joint[ seaIndex + 3 ];

		weight[ tjsIndex ] = sea.weight[ seaIndex ];
		if ( jpv > 1 ) weight[ tjsIndex + 1 ] = sea.weight[ seaIndex + 1 ];
		if ( jpv > 2 ) weight[ tjsIndex + 2 ] = sea.weight[ seaIndex + 2 ];
		if ( jpv > 3 ) weight[ tjsIndex + 3 ] = sea.weight[ seaIndex + 3 ];

		w = weight[ tjsIndex ] + weight[ tjsIndex + 1 ] + weight[ tjsIndex + 2 ] + weight[ tjsIndex + 3 ];

		weight[ tjsIndex ] += 1 - w;

	}

	sea.joint = joint;
	sea.weight = weight;

	sea.jointPerVertex = 4;

};

THREE.SEA3D.prototype.compressJoints = function ( sea ) {

	var numJoints = sea.numVertex * 4;

	var joint = sea.isBig ? new Uint32Array( numJoints ) : new Uint16Array( numJoints );
	var weight = new Float32Array( numJoints );

	var w = 0, jpv = sea.jointPerVertex;

	for ( var i = 0; i < sea.numVertex; i ++ ) {

		var tjsIndex = i * 4;
		var seaIndex = i * jpv;

		joint[ tjsIndex ] = sea.joint[ seaIndex ];
		joint[ tjsIndex + 1 ] = sea.joint[ seaIndex + 1 ];
		joint[ tjsIndex + 2 ] = sea.joint[ seaIndex + 2 ];
		joint[ tjsIndex + 3 ] = sea.joint[ seaIndex + 3 ];

		weight[ tjsIndex ] = sea.weight[ seaIndex ];
		weight[ tjsIndex + 1 ] = sea.weight[ seaIndex + 1 ];
		weight[ tjsIndex + 2 ] = sea.weight[ seaIndex + 2 ];
		weight[ tjsIndex + 3 ] = sea.weight[ seaIndex + 3 ];

		w = weight[ tjsIndex ] + weight[ tjsIndex + 1 ] + weight[ tjsIndex + 2 ] + weight[ tjsIndex + 3 ];

		weight[ tjsIndex ] += 1 - w;

	}

	sea.joint = joint;
	sea.weight = weight;

	sea.jointPerVertex = 4;

};

THREE.SEA3D.prototype.flipIndexes = function ( v ) {

	var i = 1; // y >-< z

	while ( i < v.length ) {

		var idx = v[ i + 1 ];
		v[ i + 1 ] = v[ i ];
		v[ i ] = idx;

		i += 3;

	}

	return v;

};

THREE.SEA3D.prototype.flipBoneMatrix = function () {

	var zero = new THREE.Vector3();

	return function ( mtx ) {

		var pos = THREE.SEA3D.VECBUF.setFromMatrixPosition( mtx );
		pos.z = - pos.z;

		mtx.setPosition( zero );
		mtx.multiplyMatrices( THREE.SEA3D.MTXBUF.makeRotationZ( THREE.Math.degToRad( 180 ) ), mtx );
		mtx.setPosition( pos );

		return mtx;

	};

}();

THREE.SEA3D.prototype.flipScaleMatrix = function () {

	var pos = new THREE.Vector3();
	var qua = new THREE.Quaternion();
	var slc = new THREE.Vector3();

	return function ( local, rotate, parent, parentRotate ) {

		if ( parent ) local.multiplyMatrices( parent, local );

		local.decompose( pos, qua, slc );

		slc.z = - slc.z;

		local.compose( pos, qua, slc );

		if ( rotate ) {

			local.multiplyMatrices( local, THREE.SEA3D.MTXBUF.makeRotationZ( THREE.Math.degToRad( 180 ) ) );

		}

		if ( parent ) {

			parent = parent.clone();

			this.flipScaleMatrix( parent, parentRotate );

			local.multiplyMatrices( parent.getInverse( parent ), local );

		}

		return local;

	};

}();

//
//	Legacy
//

THREE.SEA3D.prototype.flipDefaultAnimation = function () {

	var buf1 = new THREE.Matrix4();
	var buf2 = new THREE.Matrix4();

	var pos = new THREE.Vector3();
	var qua = new THREE.Quaternion();
	var slc = new THREE.Vector3();

	var to_pos = new THREE.Vector3();
	var to_qua = new THREE.Quaternion();
	var to_slc = new THREE.Vector3();

	return function ( animation, obj3d, relative ) {

		if ( animation.isFliped ) return;

		var dataList = animation.dataList,
			t_anm = [];

		for ( var i = 0; i < dataList.length; i ++ ) {

			var data = dataList[ i ],
				raw = data.data,
				kind = data.kind,
				numFrames = raw.length / data.blockSize;

			switch ( kind ) {

				case SEA3D.Animation.POSITION:
				case SEA3D.Animation.ROTATION:
				case SEA3D.Animation.SCALE:

					t_anm.push( {
						kind: kind,
						numFrames: numFrames,
						raw: raw
					} );

					break;

			}

		}

		if ( t_anm.length > 0 ) {

			var numFrames = t_anm[ 0 ].numFrames,
				parent = undefined;

			if ( relative ) {

				buf1.identity();
				parent = this.flipScaleMatrix( buf2.copy( obj3d.matrixWorld ) );

			} else {

				if ( obj3d.parent ) {

					parent = this.flipScaleMatrix( buf2.copy( obj3d.parent.matrixWorld ) );

				}

				this.flipScaleMatrix( buf1.copy( obj3d.matrix ), false, parent );

			}

			buf1.decompose( pos, qua, slc );

			for ( var f = 0, t, c; f < numFrames; f ++ ) {

				for ( t = 0; t < t_anm.length; t ++ ) {

					var raw = t_anm[ t ].raw,
						kind = t_anm[ t ].kind;

					switch ( kind ) {

						case SEA3D.Animation.POSITION:

							c = f * 3;

							pos.set(
								raw[ c ],
								raw[ c + 1 ],
								raw[ c + 2 ]
							);

							break;

						case SEA3D.Animation.ROTATION:

							c = f * 4;

							qua.set(
								raw[ c ],
								raw[ c + 1 ],
								raw[ c + 2 ],
								raw[ c + 3 ]
							);

							break;

						case SEA3D.Animation.SCALE:

							c = f * 4;

							slc.set(
								raw[ c ],
								raw[ c + 1 ],
								raw[ c + 2 ]
							);

							break;

					}

				}

				buf1.compose( pos, qua, slc );

				this.flipScaleMatrix( buf1, false, buf2 );

				buf1.decompose( to_pos, to_qua, to_slc );

				for ( t = 0; t < t_anm.length; t ++ ) {

					var raw = t_anm[ t ].raw,
						kind = t_anm[ t ].kind;

					switch ( kind ) {

						case SEA3D.Animation.POSITION:

							c = f * 3;

							raw[ c ] = to_pos.x;
							raw[ c + 1 ] = to_pos.y;
							raw[ c + 2 ] = to_pos.z;

							break;

						case SEA3D.Animation.ROTATION:

							c = f * 4;

							raw[ c ] = to_qua.x;
							raw[ c + 1 ] = to_qua.y;
							raw[ c + 2 ] = to_qua.z;
							raw[ c + 3 ] = to_qua.w;

							break;

						case SEA3D.Animation.SCALE:

							c = f * 3;

							raw[ c ] = to_slc.x;
							raw[ c + 1 ] = to_slc.y;
							raw[ c + 2 ] = to_slc.z;

							break;

					}

				}

			}

		}

		animation.isFliped = true;

	};

}();

THREE.SEA3D.prototype.readAnimation = function ( sea ) {

	if ( ! this.isLegacy( sea ) ) {

		this._readAnimation( sea );

	}

};

THREE.SEA3D.prototype.getModifier = function ( req ) {

	var sea = req.sea;

	if ( this.isLegacy( sea ) && ! sea.done ) {

		sea.done = true;

		switch ( sea.type ) {

			case SEA3D.SkeletonAnimation.prototype.type:

				this.readSkeletonAnimationLegacy( sea, req.skeleton );

				return sea.tag;

				break;

			case SEA3D.Animation.prototype.type:
			case SEA3D.MorphAnimation.prototype.type:
			case SEA3D.UVWAnimation.prototype.type:

				if ( req.scope instanceof THREE.Object3D ) {

					this.flipDefaultAnimation( sea, req.scope, req.relative );

				}

				this._readAnimation( sea );

				return sea.tag;

				break;

			case SEA3D.Morph.prototype.type:

				this.readMorphLegacy( sea, req.geometry );

				break;

		}

	}

	return this._getModifier( req );

};

THREE.SEA3D.prototype.updateTransform = function () {

	var buf1 = new THREE.Matrix4();
	var identity = new THREE.Matrix4();

	return function ( obj3d, sea ) {

		if ( this.isLegacy( sea ) ) {

			if ( sea.transform ) buf1.fromArray( sea.transform );
			else buf1.makeTranslation( sea.position.x, sea.position.y, sea.position.z );

			this.flipScaleMatrix(
				buf1, false,
				obj3d.parent ? obj3d.parent.matrixWorld : identity,
				obj3d.parent instanceof THREE.Bone
			);

			obj3d.position.setFromMatrixPosition( buf1 );
			obj3d.scale.setFromMatrixScale( buf1 );

			// ignore rotation scale

			buf1.scale( THREE.SEA3D.VECBUF.set( 1 / obj3d.scale.x, 1 / obj3d.scale.y, 1 / obj3d.scale.z ) );
			obj3d.rotation.setFromRotationMatrix( buf1 );

			obj3d.updateMatrixWorld();

		} else {

			this._updateTransform( obj3d, sea );

		}

	};

}();

THREE.SEA3D.prototype.readSkeleton = function () {

	var mtx_tmp_inv = new THREE.Matrix4(),
		mtx_local = new THREE.Matrix4(),
		mtx_parent = new THREE.Matrix4(),
		pos = new THREE.Vector3(),
		qua = new THREE.Quaternion();

	return function ( sea ) {

		var bones = [],
			isLegacy = sea.sea3d.config.legacy;

		for ( var i = 0; i < sea.joint.length; i ++ ) {

			var bone = sea.joint[ i ];

			// get world inverse matrix

			mtx_tmp_inv.fromArray( bone.inverseBindMatrix );

			// convert to world matrix

			mtx_local.getInverse( mtx_tmp_inv );

			// convert to three.js order

			if ( isLegacy ) this.flipBoneMatrix( mtx_local );

			if ( bone.parentIndex > - 1 ) {

				// to world

				mtx_tmp_inv.fromArray( sea.joint[ bone.parentIndex ].inverseBindMatrix );
				mtx_parent.getInverse( mtx_tmp_inv );

				// convert parent to three.js order

				if ( isLegacy ) this.flipBoneMatrix( mtx_parent );

				// to local

				mtx_parent.getInverse( mtx_parent );

				mtx_local.multiplyMatrices( mtx_parent, mtx_local );

			}

			// apply matrix

			pos.setFromMatrixPosition( mtx_local );
			qua.setFromRotationMatrix( mtx_local );

			bones[ i ] = {
				name: bone.name,
				pos: [ pos.x, pos.y, pos.z ],
				rotq: [ qua.x, qua.y, qua.z, qua.w ],
				parent: bone.parentIndex
			};

		}

		this.domain.bones = this.bones = this.bones || [];
		this.bones.push( this.objects[ sea.name + '.sklq' ] = sea.tag = bones );

		return bones;

	};

}();

THREE.SEA3D.prototype.readSkeletonAnimationLegacy = function () {

	var mtx_tmp_inv = new THREE.Matrix4(),
		mtx_local = new THREE.Matrix4(),
		mtx_global = new THREE.Matrix4(),
		mtx_parent = new THREE.Matrix4();

	return function ( sea, skl ) {

		if ( sea.tag ) return sea.tag;

		var animations = [],
			delta = ( 1000 / sea.frameRate ) / 1000,
			scale = [ 1, 1, 1 ];

		for ( var i = 0; i < sea.sequence.length; i ++ ) {

			var seq = sea.sequence[ i ];

			var start = seq.start;
			var end = start + seq.count;

			var animation = {
				name: seq.name,
				repeat: seq.repeat,
				fps: sea.frameRate,
				JIT: 0,
				length: delta * seq.count,
				hierarchy: []
			};

			var numJoints = sea.numJoints,
				raw = sea.raw;

			for ( var j = 0; j < numJoints; j ++ ) {

				var bone = skl.joint[ j ],
					node = { parent: bone.parentIndex, keys: [] },
					keys = node.keys,
					time = 0;

				for ( var frame = start; frame < end; frame ++ ) {

					var idx = ( frame * numJoints * 7 ) + ( j * 7 );

					mtx_local.makeRotationFromQuaternion( THREE.SEA3D.QUABUF.set( raw[ idx + 3 ], raw[ idx + 4 ], raw[ idx + 5 ], raw[ idx + 6 ] ) );
					mtx_local.setPosition( THREE.SEA3D.VECBUF.set( raw[ idx ], raw[ idx + 1 ], raw[ idx + 2 ] ) );

					if ( bone.parentIndex > - 1 ) {

						// to global

						mtx_tmp_inv.fromArray( skl.joint[ bone.parentIndex ].inverseBindMatrix );

						mtx_parent.getInverse( mtx_tmp_inv );

						mtx_global.multiplyMatrices( mtx_parent, mtx_local );

						// convert to three.js matrix

						this.flipBoneMatrix( mtx_global );

						// flip parent inverse

						this.flipBoneMatrix( mtx_parent );

						// to local

						mtx_parent.getInverse( mtx_parent );

						mtx_local.multiplyMatrices( mtx_parent, mtx_global );

					} else {

						this.flipBoneMatrix( mtx_local );

					}

					var posQ = THREE.SEA3D.VECBUF.setFromMatrixPosition( mtx_local );
					var newQ = THREE.SEA3D.QUABUF.setFromRotationMatrix( mtx_local );

					keys.push( {
						time: time,
						pos: [ posQ.x, posQ.y, posQ.z ],
						rot: [ newQ.x, newQ.y, newQ.z, newQ.w ],
						scl: scale
					} );

					time += delta;

				}

				animation.hierarchy[ j ] = node;

			}

			animations.push( THREE.SEA3D.AnimationClip.fromClip( THREE.AnimationClip.parseAnimation( animation, skl.tag ), seq.repeat ) );

		}

		this.domain.clips = this.clips = this.clips || [];
		this.clips.push( this.objects[ sea.name + '.anm' ] = sea.tag = animations );

	};

}();

THREE.SEA3D.prototype.readMorphLegacy = function ( sea, geo ) {

	for ( var i = 0; i < sea.node.length; i ++ ) {

		var node = sea.node[ i ];

		this.flipVec3( node.vertex );
		this.flipVec3( node.normal );

		this.addVector( node.vertex, geo.vertex );
		this.addVector( node.normal, geo.normal );

	}

	this._readMorph( sea );

};

THREE.SEA3D.prototype.readMorph = function ( sea ) {

	if ( ! this.isLegacy( sea ) ) {

		this._readMorph( sea );

	}

};

THREE.SEA3D.prototype.readVertexAnimation = function ( sea ) {

	if ( this.isLegacy( sea ) ) {

		for ( var i = 0, l = sea.frame.length; i < l; i ++ ) {

			var frame = sea.frame[ i ];

			this.flipVec3( frame.vertex );
			this.flipVec3( frame.normal );

		}

	}

	this._readVertexAnimation( sea );

};

THREE.SEA3D.prototype.readGeometryBuffer = function ( sea ) {

	if ( this.isLegacy( sea ) ) {

		this.flipVec3( sea.vertex );
		this.flipVec3( sea.normal );

		this.flipIndexes( sea.indexes );

		if ( sea.jointPerVertex > 4 ) this.compressJoints( sea );
		else if ( sea.jointPerVertex < 4 ) this.expandJoints( sea );

	}

	this._readGeometryBuffer( sea );

};

THREE.SEA3D.prototype.readLines = function ( sea ) {

	if ( this.isLegacy( sea ) ) {

		this.flipVec3( sea.vertex );

	}

	this._readLines( sea );

};

THREE.SEA3D.prototype.onHead = function ( args ) {

	if ( args.sign != "S3D" && args.sign != "TJS" ) {

		throw new Error( "Sign '" + args.sign + "' unknown." );

	}

};

THREE.SEA3D.EXTENSIONS_LOADER.push( { setTypeRead: function () {

	// CONFIG

	this.config.legacy = this.config.legacy == undefined ? true : this.config.legacy;

	this.file.typeRead[ SEA3D.Skeleton.prototype.type ] = this.readSkeleton;

} } );
