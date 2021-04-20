import {
	BufferAttribute,
	BufferGeometry,
	Float32BufferAttribute,
	InterleavedBuffer,
	InterleavedBufferAttribute,
	TriangleFanDrawMode,
	TriangleStripDrawMode,
	TrianglesDrawMode,
	Vector3
} from '../../../build/three.module.js';

class BufferGeometryUtils {

	static computeTangents( geometry ) {

		geometry.computeTangents();
		console.warn( 'THREE.BufferGeometryUtils: .computeTangents() has been removed. Use BufferGeometry.computeTangents() instead.' );

	}

	/**
	 * @param  {Array<BufferGeometry>} geometries
	 * @param  {Boolean} useGroups
	 * @return {BufferGeometry}
	 */
	static mergeBufferGeometries( geometries, useGroups = false ) {

		const isIndexed = geometries[ 0 ].index !== null;

		const attributesUsed = new Set( Object.keys( geometries[ 0 ].attributes ) );
		const morphAttributesUsed = new Set( Object.keys( geometries[ 0 ].morphAttributes ) );

		const attributes = {};
		const morphAttributes = {};

		const morphTargetsRelative = geometries[ 0 ].morphTargetsRelative;

		const mergedGeometry = new BufferGeometry();

		let offset = 0;

		for ( let i = 0; i < geometries.length; ++ i ) {

			const geometry = geometries[ i ];
			let attributesCount = 0;

			// ensure that all geometries are indexed, or none

			if ( isIndexed !== ( geometry.index !== null ) ) {

				console.error( 'THREE.BufferGeometryUtils: .mergeBufferGeometries() failed with geometry at index ' + i + '. All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them.' );
				return null;

			}

			// gather attributes, exit early if they're different

			for ( const name in geometry.attributes ) {

				if ( ! attributesUsed.has( name ) ) {

					console.error( 'THREE.BufferGeometryUtils: .mergeBufferGeometries() failed with geometry at index ' + i + '. All geometries must have compatible attributes; make sure "' + name + '" attribute exists among all geometries, or in none of them.' );
					return null;

				}

				if ( attributes[ name ] === undefined ) attributes[ name ] = [];

				attributes[ name ].push( geometry.attributes[ name ] );

				attributesCount ++;

			}

			// ensure geometries have the same number of attributes

			if ( attributesCount !== attributesUsed.size ) {

				console.error( 'THREE.BufferGeometryUtils: .mergeBufferGeometries() failed with geometry at index ' + i + '. Make sure all geometries have the same number of attributes.' );
				return null;

			}

			// gather morph attributes, exit early if they're different

			if ( morphTargetsRelative !== geometry.morphTargetsRelative ) {

				console.error( 'THREE.BufferGeometryUtils: .mergeBufferGeometries() failed with geometry at index ' + i + '. .morphTargetsRelative must be consistent throughout all geometries.' );
				return null;

			}

			for ( const name in geometry.morphAttributes ) {

				if ( ! morphAttributesUsed.has( name ) ) {

					console.error( 'THREE.BufferGeometryUtils: .mergeBufferGeometries() failed with geometry at index ' + i + '.  .morphAttributes must be consistent throughout all geometries.' );
					return null;

				}

				if ( morphAttributes[ name ] === undefined ) morphAttributes[ name ] = [];

				morphAttributes[ name ].push( geometry.morphAttributes[ name ] );

			}

			// gather .userData

			mergedGeometry.userData.mergedUserData = mergedGeometry.userData.mergedUserData || [];
			mergedGeometry.userData.mergedUserData.push( geometry.userData );

			if ( useGroups ) {

				let count;

				if ( isIndexed ) {

					count = geometry.index.count;

				} else if ( geometry.attributes.position !== undefined ) {

					count = geometry.attributes.position.count;

				} else {

					console.error( 'THREE.BufferGeometryUtils: .mergeBufferGeometries() failed with geometry at index ' + i + '. The geometry must have either an index or a position attribute' );
					return null;

				}

				mergedGeometry.addGroup( offset, count, i );

				offset += count;

			}

		}

		// merge indices

		if ( isIndexed ) {

			let indexOffset = 0;
			const mergedIndex = [];

			for ( let i = 0; i < geometries.length; ++ i ) {

				const index = geometries[ i ].index;

				for ( let j = 0; j < index.count; ++ j ) {

					mergedIndex.push( index.getX( j ) + indexOffset );

				}

				indexOffset += geometries[ i ].attributes.position.count;

			}

			mergedGeometry.setIndex( mergedIndex );

		}

		// merge attributes

		for ( const name in attributes ) {

			const mergedAttribute = this.mergeBufferAttributes( attributes[ name ] );

			if ( ! mergedAttribute ) {

				console.error( 'THREE.BufferGeometryUtils: .mergeBufferGeometries() failed while trying to merge the ' + name + ' attribute.' );
				return null;

			}

			mergedGeometry.setAttribute( name, mergedAttribute );

		}

		// merge morph attributes

		for ( const name in morphAttributes ) {

			const numMorphTargets = morphAttributes[ name ][ 0 ].length;

			if ( numMorphTargets === 0 ) break;

			mergedGeometry.morphAttributes = mergedGeometry.morphAttributes || {};
			mergedGeometry.morphAttributes[ name ] = [];

			for ( let i = 0; i < numMorphTargets; ++ i ) {

				const morphAttributesToMerge = [];

				for ( let j = 0; j < morphAttributes[ name ].length; ++ j ) {

					morphAttributesToMerge.push( morphAttributes[ name ][ j ][ i ] );

				}

				const mergedMorphAttribute = this.mergeBufferAttributes( morphAttributesToMerge );

				if ( ! mergedMorphAttribute ) {

					console.error( 'THREE.BufferGeometryUtils: .mergeBufferGeometries() failed while trying to merge the ' + name + ' morphAttribute.' );
					return null;

				}

				mergedGeometry.morphAttributes[ name ].push( mergedMorphAttribute );

			}

		}

		return mergedGeometry;

	}

	/**
	 * @param {Array<BufferAttribute>} attributes
	 * @return {BufferAttribute}
	 */
	static mergeBufferAttributes( attributes ) {

		let TypedArray;
		let itemSize;
		let normalized;
		let arrayLength = 0;

		for ( let i = 0; i < attributes.length; ++ i ) {

			const attribute = attributes[ i ];

			if ( attribute.isInterleavedBufferAttribute ) {

				console.error( 'THREE.BufferGeometryUtils: .mergeBufferAttributes() failed. InterleavedBufferAttributes are not supported.' );
				return null;

			}

			if ( TypedArray === undefined ) TypedArray = attribute.array.constructor;
			if ( TypedArray !== attribute.array.constructor ) {

				console.error( 'THREE.BufferGeometryUtils: .mergeBufferAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes.' );
				return null;

			}

			if ( itemSize === undefined ) itemSize = attribute.itemSize;
			if ( itemSize !== attribute.itemSize ) {

				console.error( 'THREE.BufferGeometryUtils: .mergeBufferAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes.' );
				return null;

			}

			if ( normalized === undefined ) normalized = attribute.normalized;
			if ( normalized !== attribute.normalized ) {

				console.error( 'THREE.BufferGeometryUtils: .mergeBufferAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes.' );
				return null;

			}

			arrayLength += attribute.array.length;

		}

		const array = new TypedArray( arrayLength );
		let offset = 0;

		for ( let i = 0; i < attributes.length; ++ i ) {

			array.set( attributes[ i ].array, offset );

			offset += attributes[ i ].array.length;

		}

		return new BufferAttribute( array, itemSize, normalized );

	}

	/**
	 * @param {Array<BufferAttribute>} attributes
	 * @return {Array<InterleavedBufferAttribute>}
	 */
	static interleaveAttributes( attributes ) {

		// Interleaves the provided attributes into an InterleavedBuffer and returns
		// a set of InterleavedBufferAttributes for each attribute
		let TypedArray;
		let arrayLength = 0;
		let stride = 0;

		// calculate the the length and type of the interleavedBuffer
		for ( let i = 0, l = attributes.length; i < l; ++ i ) {

			const attribute = attributes[ i ];

			if ( TypedArray === undefined ) TypedArray = attribute.array.constructor;
			if ( TypedArray !== attribute.array.constructor ) {

				console.error( 'AttributeBuffers of different types cannot be interleaved' );
				return null;

			}

			arrayLength += attribute.array.length;
			stride += attribute.itemSize;

		}

		// Create the set of buffer attributes
		const interleavedBuffer = new InterleavedBuffer( new TypedArray( arrayLength ), stride );
		let offset = 0;
		const res = [];
		const getters = [ 'getX', 'getY', 'getZ', 'getW' ];
		const setters = [ 'setX', 'setY', 'setZ', 'setW' ];

		for ( let j = 0, l = attributes.length; j < l; j ++ ) {

			const attribute = attributes[ j ];
			const itemSize = attribute.itemSize;
			const count = attribute.count;
			const iba = new InterleavedBufferAttribute( interleavedBuffer, itemSize, offset, attribute.normalized );
			res.push( iba );

			offset += itemSize;

			// Move the data for each attribute into the new interleavedBuffer
			// at the appropriate offset
			for ( let c = 0; c < count; c ++ ) {

				for ( let k = 0; k < itemSize; k ++ ) {

					iba[ setters[ k ] ]( c, attribute[ getters[ k ] ]( c ) );

				}

			}

		}

		return res;

	}

	/**
	 * @param {Array<BufferGeometry>} geometry
	 * @return {number}
	 */
	static estimateBytesUsed( geometry ) {

		// Return the estimated memory used by this geometry in bytes
		// Calculate using itemSize, count, and BYTES_PER_ELEMENT to account
		// for InterleavedBufferAttributes.
		let mem = 0;
		for ( const name in geometry.attributes ) {

			const attr = geometry.getAttribute( name );
			mem += attr.count * attr.itemSize * attr.array.BYTES_PER_ELEMENT;

		}

		const indices = geometry.getIndex();
		mem += indices ? indices.count * indices.itemSize * indices.array.BYTES_PER_ELEMENT : 0;
		return mem;

	}

	/**
	 * @param {BufferGeometry} geometry
	 * @param {number} tolerance
	 * @return {BufferGeometry>}
	 */
	static mergeVertices( geometry, tolerance = 1e-4 ) {

		tolerance = Math.max( tolerance, Number.EPSILON );

		// Generate an index buffer if the geometry doesn't have one, or optimize it
		// if it's already available.
		const hashToIndex = {};
		const indices = geometry.getIndex();
		const positions = geometry.getAttribute( 'position' );
		const vertexCount = indices ? indices.count : positions.count;

		// next value for triangle indices
		let nextIndex = 0;

		// attributes and new attribute arrays
		const attributeNames = Object.keys( geometry.attributes );
		const attrArrays = {};
		const morphAttrsArrays = {};
		const newIndices = [];
		const getters = [ 'getX', 'getY', 'getZ', 'getW' ];

		// initialize the arrays
		for ( let i = 0, l = attributeNames.length; i < l; i ++ ) {

			const name = attributeNames[ i ];

			attrArrays[ name ] = [];

			const morphAttr = geometry.morphAttributes[ name ];
			if ( morphAttr ) {

				morphAttrsArrays[ name ] = new Array( morphAttr.length ).fill().map( () => [] );

			}

		}

		// convert the error tolerance to an amount of decimal places to truncate to
		const decimalShift = Math.log10( 1 / tolerance );
		const shiftMultiplier = Math.pow( 10, decimalShift );
		for ( let i = 0; i < vertexCount; i ++ ) {

			const index = indices ? indices.getX( i ) : i;

			// Generate a hash for the vertex attributes at the current index 'i'
			let hash = '';
			for ( let j = 0, l = attributeNames.length; j < l; j ++ ) {

				const name = attributeNames[ j ];
				const attribute = geometry.getAttribute( name );
				const itemSize = attribute.itemSize;

				for ( let k = 0; k < itemSize; k ++ ) {

					// double tilde truncates the decimal value
					hash += `${ ~ ~ ( attribute[ getters[ k ] ]( index ) * shiftMultiplier ) },`;

				}

			}

			// Add another reference to the vertex if it's already
			// used by another index
			if ( hash in hashToIndex ) {

				newIndices.push( hashToIndex[ hash ] );

			} else {

				// copy data to the new index in the attribute arrays
				for ( let j = 0, l = attributeNames.length; j < l; j ++ ) {

					const name = attributeNames[ j ];
					const attribute = geometry.getAttribute( name );
					const morphAttr = geometry.morphAttributes[ name ];
					const itemSize = attribute.itemSize;
					const newarray = attrArrays[ name ];
					const newMorphArrays = morphAttrsArrays[ name ];

					for ( let k = 0; k < itemSize; k ++ ) {

						const getterFunc = getters[ k ];
						newarray.push( attribute[ getterFunc ]( index ) );

						if ( morphAttr ) {

							for ( let m = 0, ml = morphAttr.length; m < ml; m ++ ) {

								newMorphArrays[ m ].push( morphAttr[ m ][ getterFunc ]( index ) );

							}

						}

					}

				}

				hashToIndex[ hash ] = nextIndex;
				newIndices.push( nextIndex );
				nextIndex ++;

			}

		}

		// Generate typed arrays from new attribute arrays and update
		// the attributeBuffers
		const result = geometry.clone();
		for ( let i = 0, l = attributeNames.length; i < l; i ++ ) {

			const name = attributeNames[ i ];
			const oldAttribute = geometry.getAttribute( name );

			const buffer = new oldAttribute.array.constructor( attrArrays[ name ] );
			const attribute = new BufferAttribute( buffer, oldAttribute.itemSize, oldAttribute.normalized );

			result.setAttribute( name, attribute );

			// Update the attribute arrays
			if ( name in morphAttrsArrays ) {

				for ( let j = 0; j < morphAttrsArrays[ name ].length; j ++ ) {

					const oldMorphAttribute = geometry.morphAttributes[ name ][ j ];

					const buffer = new oldMorphAttribute.array.constructor( morphAttrsArrays[ name ][ j ] );
					const morphAttribute = new BufferAttribute( buffer, oldMorphAttribute.itemSize, oldMorphAttribute.normalized );
					result.morphAttributes[ name ][ j ] = morphAttribute;

				}

			}

		}

		// indices

		result.setIndex( newIndices );

		return result;

	}

	/**
	 * @param {BufferGeometry} geometry
	 * @param {number} drawMode
	 * @return {BufferGeometry>}
	 */
	static toTrianglesDrawMode( geometry, drawMode ) {

		if ( drawMode === TrianglesDrawMode ) {

			console.warn( 'THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles.' );
			return geometry;

		}

		if ( drawMode === TriangleFanDrawMode || drawMode === TriangleStripDrawMode ) {

			let index = geometry.getIndex();

			// generate index if not present

			if ( index === null ) {

				const indices = [];

				const position = geometry.getAttribute( 'position' );

				if ( position !== undefined ) {

					for ( let i = 0; i < position.count; i ++ ) {

						indices.push( i );

					}

					geometry.setIndex( indices );
					index = geometry.getIndex();

				} else {

					console.error( 'THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible.' );
					return geometry;

				}

			}

			//

			const numberOfTriangles = index.count - 2;
			const newIndices = [];

			if ( drawMode === TriangleFanDrawMode ) {

				// gl.TRIANGLE_FAN

				for ( let i = 1; i <= numberOfTriangles; i ++ ) {

					newIndices.push( index.getX( 0 ) );
					newIndices.push( index.getX( i ) );
					newIndices.push( index.getX( i + 1 ) );

				}

			} else {

				// gl.TRIANGLE_STRIP

				for ( let i = 0; i < numberOfTriangles; i ++ ) {

					if ( i % 2 === 0 ) {

						newIndices.push( index.getX( i ) );
						newIndices.push( index.getX( i + 1 ) );
						newIndices.push( index.getX( i + 2 ) );

					} else {

						newIndices.push( index.getX( i + 2 ) );
						newIndices.push( index.getX( i + 1 ) );
						newIndices.push( index.getX( i ) );

					}

				}

			}

			if ( ( newIndices.length / 3 ) !== numberOfTriangles ) {

				console.error( 'THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.' );

			}

			// build final geometry

			const newGeometry = geometry.clone();
			newGeometry.setIndex( newIndices );
			newGeometry.clearGroups();

			return newGeometry;

		} else {

			console.error( 'THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:', drawMode );
			return geometry;

		}

	}

	/**
	 * Calculates the morphed attributes of a morphed/skinned BufferGeometry.
	 * Helpful for Raytracing or Decals.
	 * @param {Mesh | Line | Points} object An instance of Mesh, Line or Points.
	 * @return {Object} An Object with original position/normal attributes and morphed ones.
	 */
	static computeMorphedAttributes( object ) {

		if ( object.geometry.isBufferGeometry !== true ) {

			console.error( 'THREE.BufferGeometryUtils: Geometry is not of type BufferGeometry.' );
			return null;

		}

		const _vA = new Vector3();
		const _vB = new Vector3();
		const _vC = new Vector3();

		const _tempA = new Vector3();
		const _tempB = new Vector3();
		const _tempC = new Vector3();

		const _morphA = new Vector3();
		const _morphB = new Vector3();
		const _morphC = new Vector3();

		function _calculateMorphedAttributeData(
			object,
			material,
			attribute,
			morphAttribute,
			morphTargetsRelative,
			a,
			b,
			c,
			modifiedAttributeArray
		) {

			_vA.fromBufferAttribute( attribute, a );
			_vB.fromBufferAttribute( attribute, b );
			_vC.fromBufferAttribute( attribute, c );

			const morphInfluences = object.morphTargetInfluences;

			if ( material.morphTargets && morphAttribute && morphInfluences ) {

				_morphA.set( 0, 0, 0 );
				_morphB.set( 0, 0, 0 );
				_morphC.set( 0, 0, 0 );

				for ( let i = 0, il = morphAttribute.length; i < il; i ++ ) {

					const influence = morphInfluences[ i ];
					const morph = morphAttribute[ i ];

					if ( influence === 0 ) continue;

					_tempA.fromBufferAttribute( morph, a );
					_tempB.fromBufferAttribute( morph, b );
					_tempC.fromBufferAttribute( morph, c );

					if ( morphTargetsRelative ) {

						_morphA.addScaledVector( _tempA, influence );
						_morphB.addScaledVector( _tempB, influence );
						_morphC.addScaledVector( _tempC, influence );

					} else {

						_morphA.addScaledVector( _tempA.sub( _vA ), influence );
						_morphB.addScaledVector( _tempB.sub( _vB ), influence );
						_morphC.addScaledVector( _tempC.sub( _vC ), influence );

					}

				}

				_vA.add( _morphA );
				_vB.add( _morphB );
				_vC.add( _morphC );

			}

			if ( object.isSkinnedMesh ) {

				object.boneTransform( a, _vA );
				object.boneTransform( b, _vB );
				object.boneTransform( c, _vC );

			}

			modifiedAttributeArray[ a * 3 + 0 ] = _vA.x;
			modifiedAttributeArray[ a * 3 + 1 ] = _vA.y;
			modifiedAttributeArray[ a * 3 + 2 ] = _vA.z;
			modifiedAttributeArray[ b * 3 + 0 ] = _vB.x;
			modifiedAttributeArray[ b * 3 + 1 ] = _vB.y;
			modifiedAttributeArray[ b * 3 + 2 ] = _vB.z;
			modifiedAttributeArray[ c * 3 + 0 ] = _vC.x;
			modifiedAttributeArray[ c * 3 + 1 ] = _vC.y;
			modifiedAttributeArray[ c * 3 + 2 ] = _vC.z;

		}

		const geometry = object.geometry;
		const material = object.material;

		let a, b, c;
		const index = geometry.index;
		const positionAttribute = geometry.attributes.position;
		const morphPosition = geometry.morphAttributes.position;
		const morphTargetsRelative = geometry.morphTargetsRelative;
		const normalAttribute = geometry.attributes.normal;
		const morphNormal = geometry.morphAttributes.position;

		const groups = geometry.groups;
		const drawRange = geometry.drawRange;
		let i, j, il, jl;
		let group, groupMaterial;
		let start, end;

		const modifiedPosition = new Float32Array( positionAttribute.count * positionAttribute.itemSize );
		const modifiedNormal = new Float32Array( normalAttribute.count * normalAttribute.itemSize );

		if ( index !== null ) {

			// indexed buffer geometry

			if ( Array.isArray( material ) ) {

				for ( i = 0, il = groups.length; i < il; i ++ ) {

					group = groups[ i ];
					groupMaterial = material[ group.materialIndex ];

					start = Math.max( group.start, drawRange.start );
					end = Math.min( ( group.start + group.count ), ( drawRange.start + drawRange.count ) );

					for ( j = start, jl = end; j < jl; j += 3 ) {

						a = index.getX( j );
						b = index.getX( j + 1 );
						c = index.getX( j + 2 );

						_calculateMorphedAttributeData(
							object,
							groupMaterial,
							positionAttribute,
							morphPosition,
							morphTargetsRelative,
							a, b, c,
							modifiedPosition
						);

						_calculateMorphedAttributeData(
							object,
							groupMaterial,
							normalAttribute,
							morphNormal,
							morphTargetsRelative,
							a, b, c,
							modifiedNormal
						);

					}

				}

			} else {

				start = Math.max( 0, drawRange.start );
				end = Math.min( index.count, ( drawRange.start + drawRange.count ) );

				for ( i = start, il = end; i < il; i += 3 ) {

					a = index.getX( i );
					b = index.getX( i + 1 );
					c = index.getX( i + 2 );

					_calculateMorphedAttributeData(
						object,
						material,
						positionAttribute,
						morphPosition,
						morphTargetsRelative,
						a, b, c,
						modifiedPosition
					);

					_calculateMorphedAttributeData(
						object,
						material,
						normalAttribute,
						morphNormal,
						morphTargetsRelative,
						a, b, c,
						modifiedNormal
					);

				}

			}

		} else if ( positionAttribute !== undefined ) {

			// non-indexed buffer geometry

			if ( Array.isArray( material ) ) {

				for ( i = 0, il = groups.length; i < il; i ++ ) {

					group = groups[ i ];
					groupMaterial = material[ group.materialIndex ];

					start = Math.max( group.start, drawRange.start );
					end = Math.min( ( group.start + group.count ), ( drawRange.start + drawRange.count ) );

					for ( j = start, jl = end; j < jl; j += 3 ) {

						a = j;
						b = j + 1;
						c = j + 2;

						_calculateMorphedAttributeData(
							object,
							groupMaterial,
							positionAttribute,
							morphPosition,
							morphTargetsRelative,
							a, b, c,
							modifiedPosition
						);

						_calculateMorphedAttributeData(
							object,
							groupMaterial,
							normalAttribute,
							morphNormal,
							morphTargetsRelative,
							a, b, c,
							modifiedNormal
						);

					}

				}

			} else {

				start = Math.max( 0, drawRange.start );
				end = Math.min( positionAttribute.count, ( drawRange.start + drawRange.count ) );

				for ( i = start, il = end; i < il; i += 3 ) {

					a = i;
					b = i + 1;
					c = i + 2;

					_calculateMorphedAttributeData(
						object,
						material,
						positionAttribute,
						morphPosition,
						morphTargetsRelative,
						a, b, c,
						modifiedPosition
					);

					_calculateMorphedAttributeData(
						object,
						material,
						normalAttribute,
						morphNormal,
						morphTargetsRelative,
						a, b, c,
						modifiedNormal
					);

				}

			}

		}

		const morphedPositionAttribute = new Float32BufferAttribute( modifiedPosition, 3 );
		const morphedNormalAttribute = new Float32BufferAttribute( modifiedNormal, 3 );

		return {

			positionAttribute: positionAttribute,
			normalAttribute: normalAttribute,
			morphedPositionAttribute: morphedPositionAttribute,
			morphedNormalAttribute: morphedNormalAttribute

		};

	}

}

export { BufferGeometryUtils };
