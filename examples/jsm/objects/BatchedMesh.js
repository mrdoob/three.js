import {
	BufferAttribute,
	BufferGeometry,
	DataTexture,
	FloatType,
	MathUtils,
	Matrix4,
	Mesh,
	RGBAFormat
} from 'three';

const _identityMatrix = new Matrix4();
const _zeroScaleMatrix = new Matrix4().set(
	0, 0, 0, 0,
	0, 0, 0, 0,
	0, 0, 0, 0,
	0, 0, 0, 1,
);

// Custom shaders
const batchingParsVertex = `
#ifdef BATCHING
	attribute float id;
	uniform highp sampler2D batchingTexture;
	uniform int batchingTextureSize;
	mat4 getBatchingMatrix( const in float i ) {
		float j = i * 4.0;
		float x = mod( j, float( batchingTextureSize ) );
		float y = floor( j / float( batchingTextureSize ) );
		float dx = 1.0 / float( batchingTextureSize );
		float dy = 1.0 / float( batchingTextureSize );
		y = dy * ( y + 0.5 );
		vec4 v1 = texture2D( batchingTexture, vec2( dx * ( x + 0.5 ), y ) );
		vec4 v2 = texture2D( batchingTexture, vec2( dx * ( x + 1.5 ), y ) );
		vec4 v3 = texture2D( batchingTexture, vec2( dx * ( x + 2.5 ), y ) );
		vec4 v4 = texture2D( batchingTexture, vec2( dx * ( x + 3.5 ), y ) );
		return mat4( v1, v2, v3, v4 );
	}
#endif
`;

const batchingbaseVertex = `
#ifdef BATCHING
	mat4 batchingMatrix = getBatchingMatrix( id );
#endif
`;

const batchingnormalVertex = `
#ifdef BATCHING
	objectNormal = vec4( batchingMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( batchingMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif
`;

const batchingVertex = `
#ifdef BATCHING
	transformed = ( batchingMatrix * vec4( transformed, 1.0 ) ).xyz;
#endif
`;

// @TODO: SkinnedMesh support?
// @TODO: Future work if needed. Move into the core. Can be optimized more with WEBGL_multi_draw.

class BatchedMesh extends Mesh {

	constructor( maxGeometryCount, maxVertexCount, maxIndexCount = maxVertexCount * 2, material ) {

		super( new BufferGeometry(), material );

		this._vertexStarts = [];
		this._vertexCounts = [];
		this._indexStarts = [];
		this._indexCounts = [];

		this._visibles = [];
		this._alives = [];

		this._maxGeometryCount = maxGeometryCount;
		this._maxVertexCount = maxVertexCount;
		this._maxIndexCount = maxIndexCount;

		this._geometryInitialized = false;
		this._geometryCount = 0;
		this._vertexCount = 0;
		this._indexCount = 0;

		// Local matrix per geometry by using data texture
		// @TODO: Support uniform parameter per geometry

		this._matrices = [];
		this._matricesArray = null;
		this._matricesTexture = null;

		// @TODO: Calculate the entire binding box and make frustumCulled true
		this.frustumCulled = false;

		this._customUniforms = {
			batchingTexture: { value: null },
			batchingTextureSize: { value: 0 }
		};

		this._initMatricesTexture();
		this._initShader();

	}

	_initMatricesTexture() {

		// layout (1 matrix = 4 pixels)
		//      RGBA RGBA RGBA RGBA (=> column1, column2, column3, column4)
		//  with  8x8  pixel texture max   16 matrices * 4 pixels =  (8 * 8)
		//       16x16 pixel texture max   64 matrices * 4 pixels = (16 * 16)
		//       32x32 pixel texture max  256 matrices * 4 pixels = (32 * 32)
		//       64x64 pixel texture max 1024 matrices * 4 pixels = (64 * 64)

		let size = Math.sqrt( this._maxGeometryCount * 4 ); // 4 pixels needed for 1 matrix
		size = MathUtils.ceilPowerOfTwo( size );
		size = Math.max( size, 4 );

		const matricesArray = new Float32Array( size * size * 4 ); // 4 floats per RGBA pixel
		const matricesTexture = new DataTexture( matricesArray, size, size, RGBAFormat, FloatType );

		this._matricesArray = matricesArray;
		this._matricesTexture = matricesTexture;

		this._customUniforms.batchingTexture.value = this._matricesTexture;
		this._customUniforms.batchingTextureSize.value = size;

	}

	_initShader() {

		const material = this.material;
		const currentOnBeforeCompile = material.onBeforeCompile;
		const customUniforms = this._customUniforms;

		material.onBeforeCompile = function onBeforeCompile( parameters, renderer ) {

			// Is this replacement stable across any materials?
			parameters.vertexShader = parameters.vertexShader
				.replace(
					'#include <skinning_pars_vertex>',
					'#include <skinning_pars_vertex>\n'
						+ batchingParsVertex
				)
				.replace(
					'#include <skinnormal_vertex>',
					'#include <skinnormal_vertex>\n'
						+ batchingbaseVertex
						+ batchingnormalVertex
				)
				.replace(
					'#include <skinning_vertex>',
					'#include <skinning_vertex>\n'
						+ batchingVertex
				);

			for ( const uniformName in customUniforms ) {

				parameters.uniforms[ uniformName ] = customUniforms[ uniformName ];

			}

			currentOnBeforeCompile.call( this, parameters, renderer );

		};

		material.defines = material.defines || {};
		material.defines.BATCHING = false;

	}

	_initializeGeometry( reference ) {

		// @TODO: geometry.groups support?
		// @TODO: geometry.drawRange support?
		// @TODO: geometry.morphAttributes support?

		const geometry = this.geometry;
		const maxVertexCount = this._maxVertexCount;
		const maxGeometryCount = this._maxGeometryCount;
		const maxIndexCount = this._maxIndexCount;
		if ( this._geometryInitialized === false ) {

			for ( const attributeName in reference.attributes ) {

				const srcAttribute = reference.getAttribute( attributeName );
				const { array, itemSize, normalized } = srcAttribute;

				const dstArray = new array.constructor( maxVertexCount * itemSize );
				const dstAttribute = new srcAttribute.constructor( dstArray, itemSize, normalized );
				dstAttribute.setUsage( srcAttribute.usage );

				geometry.setAttribute( attributeName, dstAttribute );

			}

			if ( reference.getIndex() !== null ) {

				const indexArray = maxVertexCount > 65536
					? new Uint32Array( maxIndexCount )
					: new Uint16Array( maxIndexCount );

				geometry.setIndex( new BufferAttribute( indexArray, 1 ) );

			}

			const idArray = maxGeometryCount > 65536
				? new Uint32Array( maxVertexCount )
				: new Uint16Array( maxVertexCount );
			// @TODO: What if attribute name 'id' is already used?
			geometry.setAttribute( 'id', new BufferAttribute( idArray, 1 ) );

			this._geometryInitialized = true;

		} else {

			// @TODO: Check if geometry has the same attributes set

		}

	}

	getGeometryCount() {

		return this._geometryCount;

	}

	getVertexCount() {

		return this._vertexCount;

	}

	getIndexCount() {

		return this._indexCount;

	}

	applyGeometry( geometry ) {

		this._initializeGeometry( geometry );

		// @TODO: Error handling if exceeding maxVertexCount or maxIndexCount
		if ( this._geometryCount >= this._maxGeometryCount ) {

			// @TODO: Error handling

		}

		const batchGeometry = this.geometry;
		const visibles = this._visibles;
		const alives = this._alives;
		const matricesTexture = this._matricesTexture;
		const matrices = this._matrices;
		const matricesArray = this._matricesArray;
		const vertexCount = this._vertexCount;
		const indexCount = this._indexCount;

		const indexCounts = this._indexCounts;
		const indexStarts = this._indexStarts;
		const vertexCounts = this._vertexCounts;
		const vertexStarts = this._vertexStarts;

		const hasIndex = batchGeometry.getIndex() !== null;
		const dstIndex = batchGeometry.getIndex();
		const srcIndex = geometry.getIndex();

		// Assuming geometry has position attribute
		const srcPositionAttribute = geometry.getAttribute( 'position' );

		// push new geometry data range
		vertexStarts.push( vertexCount );
		vertexCounts.push( srcPositionAttribute.count );

		// copy attribute data over
		// @TODO: Handle case where geometry does not have common attributes
		for ( const attributeName in geometry.attributes ) {

			const srcAttribute = geometry.getAttribute( attributeName );
			const dstAttribute = batchGeometry.getAttribute( attributeName );

			dstAttribute.array.set( srcAttribute.array, vertexCount * dstAttribute.itemSize );
			dstAttribute.needsUpdate = true;

		}

		if ( hasIndex ) {

			// push new index range
			indexStarts.push( indexCount );
			indexCounts.push( srcIndex.count );

			// copy index data over
			for ( let i = 0; i < srcIndex.count; i ++ ) {

				dstIndex.setX( indexCount + i, vertexCount + srcIndex.getX( i ) );

			}

			this._indexCount += srcIndex.count;
			dstIndex.needsUpdate = true;

		}

		// fill in the geometry ids
		const geometryId = this._geometryCount;
		this._geometryCount ++;

		const idAttribute = batchGeometry.getAttribute( 'id' );
		for ( let i = 0; i < srcPositionAttribute.count; i ++ ) {

			idAttribute.setX( this._vertexCount + i, geometryId );

		}

		idAttribute.needsUpdate = true;

		// extend new range
		this._vertexCount += srcPositionAttribute.count;

		// push new visibility states
		visibles.push( true );
		alives.push( true );

		// initialize matrix information
		matrices.push( new Matrix4() );
		_identityMatrix.toArray( matricesArray, geometryId * 16 );
		matricesTexture.needsUpdate = true;

		return geometryId;

	}

	deleteGeometry( geometryId ) {

		// Note: User needs to call optimize() afterward to pack the data.

		const alives = this._alives;
		const matricesArray = this._matricesArray;
		const matricesTexture = this._matricesTexture;
		if ( geometryId >= alives.length || alives[ geometryId ] === false ) {

			return this;

		}

		alives[ geometryId ] = false;
		_zeroScaleMatrix.toArray( matricesArray, geometryId * 16 );
		matricesTexture.needsUpdate = true;

		return this;

	}

	optimize() {

		// @TODO: Implement

		return this;

	}

	setMatrixAt( geometryId, matrix ) {

		// @TODO: Map geometryId to index of the arrays because
		//        optimize() can make geometryId mismatch the index

		const visibles = this._visibles;
		const alives = this._alives;
		const matricesTexture = this._matricesTexture;
		const matrices = this._matrices;
		const matricesArray = this._matricesArray;
		if ( geometryId >= matrices.length || alives[ geometryId ] === false ) {

			return this;

		}

		if ( visibles[ geometryId ] === true ) {

			matrix.toArray( matricesArray, geometryId * 16 );
			matricesTexture.needsUpdate = true;

		}

		matrices[ geometryId ].copy( matrix );

		return this;

	}

	getMatrixAt( geometryId, matrix ) {

		const matrices = this._matrices;
		const alives = this._alives;
		if ( geometryId >= matrices.length || alives[ geometryId ] === false ) {

			return matrix;

		}

		return matrix.copy( matrices[ geometryId ] );

	}

	setVisibleAt( geometryId, visible ) {

		const visibles = this._visibles;
		const alives = this._alives;
		const matricesTexture = this._matricesTexture;
		const matrices = this._matrices;
		const matricesArray = this._matricesArray;

		// if the geometry is out of range, not active, or visibility state
		// does not change then return early
		if (
			geometryId >= visibles.length ||
			alives[ geometryId ] === false ||
			visibles[ geometryId ] === visible
		) {

			return this;

		}

		// scale the matrix to zero if it's hidden
		if ( visible === true ) {

			matrices[ geometryId ].toArray( matricesArray, geometryId * 16 );

		} else {

			_zeroScaleMatrix.toArray( matricesArray, geometryId * 16 );

		}

		matricesTexture.needsUpdate = true;
		visibles[ geometryId ] = visible;
		return this;

	}

	getVisibleAt( geometryId ) {

		const visibles = this._visibles;
		const alives = this._alives;

		// return early if the geometry is out of range or not active
		if ( geometryId >= visibles.length || alives[ geometryId ] === false ) {

			return false;

		}

		return visibles[ geometryId ];

	}

	copy( source ) {

		super.copy( source );

		// @TODO: Implement

		return this;

	}

	toJSON( meta ) {

		// @TODO: Implement

		return super.toJSON( meta );

	}

	dispose() {

		// Assuming the geometry is not shared with other meshes
		this.geometry.dispose();

		this._matricesTexture.dispose();
		this._matricesTexture = null;
		return this;

	}

	onBeforeRender( _renderer, _scene, _camera, _geometry, material/*, _group*/ ) {

		material.defines.BATCHING = true;

		// @TODO: Implement frustum culling for each geometry

	}

	onAfterRender( _renderer, _scene, _camera, _geometry, material/*, _group*/ ) {

		material.defines.BATCHING = false;

	}

}

export { BatchedMesh };
