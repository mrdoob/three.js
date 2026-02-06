import {
	AnimationClip,
	BufferAttribute,
	BufferGeometry,
	ClampToEdgeWrapping,
	Euler,
	Group,
	Matrix4,
	Mesh,
	MeshPhysicalMaterial,
	MirroredRepeatWrapping,
	NoColorSpace,
	Object3D,
	Quaternion,
	QuaternionKeyframeTrack,
	RepeatWrapping,
	ShapeUtils,
	SkinnedMesh,
	Skeleton,
	Bone,
	SRGBColorSpace,
	Texture,
	Vector2,
	Vector3,
	VectorKeyframeTrack
} from 'three';

// Pre-compiled regex patterns for performance
const VARIANT_PATH_REGEX = /^(.+?)\/\{(\w+)=(\w+)\}\/(.+)$/;

// Spec types (must match USDCParser)
const SpecType = {
	Unknown: 0,
	Attribute: 1,
	Connection: 2,
	Expression: 3,
	Mapper: 4,
	MapperArg: 5,
	Prim: 6,
	PseudoRoot: 7,
	Relationship: 8,
	RelationshipTarget: 9,
	Variant: 10,
	VariantSet: 11
};

/**
 * USDComposer handles scene composition from parsed USD data.
 * This includes reference resolution, variant selection, transform handling,
 * and building the Three.js scene graph.
 *
 * Works with specsByPath format from USDCParser.
 */
class USDComposer {

	constructor( manager = null ) {

		this.textureCache = {};
		this.skinnedMeshes = [];
		this.manager = manager;

	}

	/**
	 * Compose a Three.js scene from parsed USD data.
	 * @param {Object} parsedData - Data from USDCParser or USDAParser
	 * @param {Object} assets - Dictionary of referenced assets (specsByPath or blob URLs)
	 * @param {Object} variantSelections - External variant selections
	 * @param {string} basePath - Base path for resolving relative references
	 * @returns {Group} Three.js scene graph
	 */
	compose( parsedData, assets = {}, variantSelections = {}, basePath = '' ) {

		this.specsByPath = parsedData.specsByPath;
		this.assets = assets;
		this.externalVariantSelections = variantSelections;
		this.basePath = basePath;
		this.skinnedMeshes = [];
		this.skeletons = {};

		// Build indexes for O(1) lookups
		this._buildIndexes();

		// Get FPS from root spec
		const rootSpec = this.specsByPath[ '/' ];
		const rootFields = rootSpec ? rootSpec.fields : {};
		this.fps = rootFields.framesPerSecond || rootFields.timeCodesPerSecond || 30;

		const group = new Group();
		this._buildHierarchy( group, '/' );

		// Bind skeletons to skinned meshes
		this._bindSkeletons();

		// Build animations
		group.animations = this._buildAnimations();

		// Handle Z-up to Y-up conversion
		if ( rootSpec && rootSpec.fields && rootSpec.fields.upAxis === 'Z' ) {

			group.rotation.x = - Math.PI / 2;

		}

		return group;

	}

	/**
	 * Apply USD transforms to a Three.js object.
	 * Handles xformOpOrder with proper matrix composition.
	 * USD uses row-vector convention, Three.js uses column-vector.
	 */
	applyTransform( obj, fields, attrs = {} ) {

		const data = { ...fields, ...attrs };
		const xformOpOrder = data[ 'xformOpOrder' ];

		// If we have xformOpOrder, apply transforms using matrices
		if ( xformOpOrder && xformOpOrder.length > 0 ) {

			const matrix = new Matrix4();
			const tempMatrix = new Matrix4();

			// Track scale for handling negative scale with rotation
			let scaleValues = null;

			// Iterate FORWARD for Three.js column-vector convention
			for ( let i = 0; i < xformOpOrder.length; i ++ ) {

				const op = xformOpOrder[ i ];
				const isInverse = op.startsWith( '!invert!' );
				const opName = isInverse ? op.slice( 8 ) : op;

				if ( opName === 'xformOp:transform' ) {

					const m = data[ 'xformOp:transform' ];
					if ( m && m.length === 16 ) {

						tempMatrix.set(
							m[ 0 ], m[ 4 ], m[ 8 ], m[ 12 ],
							m[ 1 ], m[ 5 ], m[ 9 ], m[ 13 ],
							m[ 2 ], m[ 6 ], m[ 10 ], m[ 14 ],
							m[ 3 ], m[ 7 ], m[ 11 ], m[ 15 ]
						);
						if ( isInverse ) tempMatrix.invert();
						matrix.multiply( tempMatrix );

					}

				} else if ( opName === 'xformOp:translate' ) {

					const t = data[ 'xformOp:translate' ];
					if ( t ) {

						tempMatrix.makeTranslation( t[ 0 ], t[ 1 ], t[ 2 ] );
						if ( isInverse ) tempMatrix.invert();
						matrix.multiply( tempMatrix );

					}

				} else if ( opName === 'xformOp:translate:pivot' ) {

					const t = data[ 'xformOp:translate:pivot' ];
					if ( t ) {

						tempMatrix.makeTranslation( t[ 0 ], t[ 1 ], t[ 2 ] );
						if ( isInverse ) tempMatrix.invert();
						matrix.multiply( tempMatrix );

					}

				} else if ( opName === 'xformOp:scale' ) {

					const s = data[ 'xformOp:scale' ];
					if ( s ) {

						if ( Array.isArray( s ) ) {

							tempMatrix.makeScale( s[ 0 ], s[ 1 ], s[ 2 ] );
							scaleValues = [ s[ 0 ], s[ 1 ], s[ 2 ] ];

						} else {

							tempMatrix.makeScale( s, s, s );
							scaleValues = [ s, s, s ];

						}

						if ( isInverse ) tempMatrix.invert();
						matrix.multiply( tempMatrix );

					}

				} else if ( opName === 'xformOp:rotateXYZ' ) {

					const r = data[ 'xformOp:rotateXYZ' ];
					if ( r ) {

						// USD rotateXYZ: matrix = Rx * Ry * Rz
						// Three.js Euler 'ZYX' order produces same result
						const euler = new Euler(
							r[ 0 ] * Math.PI / 180,
							r[ 1 ] * Math.PI / 180,
							r[ 2 ] * Math.PI / 180,
							'ZYX'
						);
						tempMatrix.makeRotationFromEuler( euler );
						if ( isInverse ) tempMatrix.invert();
						matrix.multiply( tempMatrix );

					}

				} else if ( opName === 'xformOp:rotateX' ) {

					const r = data[ 'xformOp:rotateX' ];
					if ( r !== undefined ) {

						tempMatrix.makeRotationX( r * Math.PI / 180 );
						if ( isInverse ) tempMatrix.invert();
						matrix.multiply( tempMatrix );

					}

				} else if ( opName === 'xformOp:rotateY' ) {

					const r = data[ 'xformOp:rotateY' ];
					if ( r !== undefined ) {

						tempMatrix.makeRotationY( r * Math.PI / 180 );
						if ( isInverse ) tempMatrix.invert();
						matrix.multiply( tempMatrix );

					}

				} else if ( opName === 'xformOp:rotateZ' ) {

					const r = data[ 'xformOp:rotateZ' ];
					if ( r !== undefined ) {

						tempMatrix.makeRotationZ( r * Math.PI / 180 );
						if ( isInverse ) tempMatrix.invert();
						matrix.multiply( tempMatrix );

					}

				} else if ( opName === 'xformOp:orient' ) {

					const q = data[ 'xformOp:orient' ];
					if ( q && q.length === 4 ) {

						const quat = new Quaternion( q[ 0 ], q[ 1 ], q[ 2 ], q[ 3 ] );
						tempMatrix.makeRotationFromQuaternion( quat );
						if ( isInverse ) tempMatrix.invert();
						matrix.multiply( tempMatrix );

					}

				}

			}

			obj.matrix.copy( matrix );
			obj.matrix.decompose( obj.position, obj.quaternion, obj.scale );

			// Fix for negative scale: decompose() may absorb negative scale into quaternion
			// Restore original scale signs to keep animation consistent
			if ( scaleValues ) {

				const negX = scaleValues[ 0 ] < 0;
				const negY = scaleValues[ 1 ] < 0;
				const negZ = scaleValues[ 2 ] < 0;
				const negCount = ( negX ? 1 : 0 ) + ( negY ? 1 : 0 ) + ( negZ ? 1 : 0 );

				// decompose() absorbs pairs of negative scales into rotation
				// For [-1,-1,-1] → [-1,1,1], Y and Z were absorbed, flip quat.y and quat.w
				if ( negCount === 3 ) {

					obj.scale.set( scaleValues[ 0 ], scaleValues[ 1 ], scaleValues[ 2 ] );
					obj.quaternion.set(
						obj.quaternion.x,
						- obj.quaternion.y,
						obj.quaternion.z,
						- obj.quaternion.w
					);

				}

			}

			return;

		}

		// Fallback: handle individual transform ops without order
		if ( data[ 'xformOp:translate' ] ) {

			const t = data[ 'xformOp:translate' ];
			obj.position.set( t[ 0 ], t[ 1 ], t[ 2 ] );

		}

		if ( data[ 'xformOp:translate:pivot' ] ) {

			const p = data[ 'xformOp:translate:pivot' ];
			obj.pivot = new Vector3( p[ 0 ], p[ 1 ], p[ 2 ] );

		}

		if ( data[ 'xformOp:scale' ] ) {

			const s = data[ 'xformOp:scale' ];

			if ( Array.isArray( s ) ) {

				obj.scale.set( s[ 0 ], s[ 1 ], s[ 2 ] );

			} else {

				obj.scale.set( s, s, s );

			}

		}

		if ( data[ 'xformOp:rotateXYZ' ] ) {

			const r = data[ 'xformOp:rotateXYZ' ];
			obj.rotation.set(
				r[ 0 ] * Math.PI / 180,
				r[ 1 ] * Math.PI / 180,
				r[ 2 ] * Math.PI / 180
			);

		}

		if ( data[ 'xformOp:orient' ] ) {

			const q = data[ 'xformOp:orient' ];
			if ( q.length === 4 ) {

				obj.quaternion.set( q[ 0 ], q[ 1 ], q[ 2 ], q[ 3 ] );

			}

		}

	}

	/**
	 * Build indexes for efficient lookups.
	 * Called once during compose() to avoid O(n) scans per lookup.
	 */
	_buildIndexes() {

		// childrenByPath: parentPath -> [childName1, childName2, ...]
		this.childrenByPath = new Map();

		// attributesByPrimPath: primPath -> Map(attrName -> attrSpec)
		this.attributesByPrimPath = new Map();

		// materialsByRoot: rootPath -> [materialPath1, materialPath2, ...]
		this.materialsByRoot = new Map();

		// shadersByMaterialPath: materialPath -> [shaderPath1, shaderPath2, ...]
		this.shadersByMaterialPath = new Map();

		// geomSubsetsByMeshPath: meshPath -> [subsetPath1, subsetPath2, ...]
		this.geomSubsetsByMeshPath = new Map();

		for ( const path in this.specsByPath ) {

			const spec = this.specsByPath[ path ];

			if ( spec.specType === SpecType.Prim ) {

				// Build parent-child index
				const lastSlash = path.lastIndexOf( '/' );

				if ( lastSlash > 0 ) {

					const parentPath = path.slice( 0, lastSlash );
					const childName = path.slice( lastSlash + 1 );

					if ( ! this.childrenByPath.has( parentPath ) ) {

						this.childrenByPath.set( parentPath, [] );

					}

					this.childrenByPath.get( parentPath ).push( { name: childName, path: path } );

				} else if ( lastSlash === 0 && path.length > 1 ) {

					// Direct child of root
					const childName = path.slice( 1 );

					if ( ! this.childrenByPath.has( '/' ) ) {

						this.childrenByPath.set( '/', [] );

					}

					this.childrenByPath.get( '/' ).push( { name: childName, path: path } );

				}

				const typeName = spec.fields.typeName;

				// Build material index
				if ( typeName === 'Material' ) {

					const parts = path.split( '/' );
					const rootPath = parts.length > 1 ? '/' + parts[ 1 ] : '/';

					if ( ! this.materialsByRoot.has( rootPath ) ) {

						this.materialsByRoot.set( rootPath, [] );

					}

					this.materialsByRoot.get( rootPath ).push( path );

				}

				// Build shader index (shaders are children of materials)
				if ( typeName === 'Shader' && lastSlash > 0 ) {

					const materialPath = path.slice( 0, lastSlash );

					if ( ! this.shadersByMaterialPath.has( materialPath ) ) {

						this.shadersByMaterialPath.set( materialPath, [] );

					}

					this.shadersByMaterialPath.get( materialPath ).push( path );

				}

				// Build GeomSubset index (subsets are children of meshes)
				if ( typeName === 'GeomSubset' && lastSlash > 0 ) {

					const meshPath = path.slice( 0, lastSlash );

					if ( ! this.geomSubsetsByMeshPath.has( meshPath ) ) {

						this.geomSubsetsByMeshPath.set( meshPath, [] );

					}

					this.geomSubsetsByMeshPath.get( meshPath ).push( path );

				}

			} else if ( spec.specType === SpecType.Attribute || spec.specType === SpecType.Relationship ) {

				// Build attribute index
				const dotIndex = path.lastIndexOf( '.' );

				if ( dotIndex > 0 ) {

					const primPath = path.slice( 0, dotIndex );
					const attrName = path.slice( dotIndex + 1 );

					if ( ! this.attributesByPrimPath.has( primPath ) ) {

						this.attributesByPrimPath.set( primPath, new Map() );

					}

					this.attributesByPrimPath.get( primPath ).set( attrName, spec );

				}

			}

		}

	}

	/**
	 * Check if a path is a direct child of parentPath.
	 */
	_isDirectChild( parentPath, path, prefix ) {

		if ( ! path.startsWith( prefix ) ) return false;

		const remainder = path.slice( prefix.length );
		if ( remainder.length === 0 ) return false;

		// Check for variant paths or simple names
		if ( remainder.startsWith( '{' ) ) {

			return false; // Variant paths are not direct children

		}

		return ! remainder.includes( '/' );

	}

	/**
	 * Build the scene hierarchy recursively.
	 * Uses childrenByPath index for O(1) child lookup instead of O(n) iteration.
	 */
	_buildHierarchy( parent, parentPath ) {

		// Collect children from parentPath and any active variant paths
		const childEntries = [];
		const seenPaths = new Set();

		// Get direct children using the index
		const directChildren = this.childrenByPath.get( parentPath );

		if ( directChildren ) {

			for ( const child of directChildren ) {

				if ( ! seenPaths.has( child.path ) ) {

					seenPaths.add( child.path );
					childEntries.push( child );

				}

			}

		}

		// Also get children from active variant paths
		const variantPaths = this._getVariantPaths( parentPath );

		for ( const vp of variantPaths ) {

			const variantChildren = this.childrenByPath.get( vp );

			if ( variantChildren ) {

				for ( const child of variantChildren ) {

					if ( ! seenPaths.has( child.path ) ) {

						seenPaths.add( child.path );
						childEntries.push( child );

					}

				}

			}

		}

		// Process each child
		for ( const { name, path } of childEntries ) {

			const spec = this.specsByPath[ path ];
			if ( ! spec || spec.specType !== SpecType.Prim ) continue;

			const typeName = spec.fields.typeName;

			// Check for references/payloads
			const refValue = this._getReference( spec );
			if ( refValue ) {

				// Get local variant selections from this prim
				const localVariants = this._getLocalVariantSelections( spec.fields );

				// Resolve the reference
				const referencedGroup = this._resolveReference( refValue, localVariants );
				if ( referencedGroup ) {

					const attrs = this._getAttributes( path );

					// Check if the referenced content is a single mesh (or container with single mesh)
					// This handles the USDZExporter pattern: Xform references geometry file
					const singleMesh = this._findSingleMesh( referencedGroup );

					if ( singleMesh && ( typeName === 'Xform' || ! typeName ) ) {

						// Merge the mesh into this prim
						singleMesh.name = name;
						this.applyTransform( singleMesh, spec.fields, attrs );

						// Apply material binding from the referencing prim if present
						this._applyMaterialBinding( singleMesh, path );

						parent.add( singleMesh );

						// Still build local children (overrides)
						this._buildHierarchy( singleMesh, path );

					} else {

						// Create a container for the referenced content
						const obj = new Object3D();
						obj.name = name;
						this.applyTransform( obj, spec.fields, attrs );

						// Add all children from the referenced group
						while ( referencedGroup.children.length > 0 ) {

							obj.add( referencedGroup.children[ 0 ] );

						}

						parent.add( obj );

						// Still build local children (overrides)
						this._buildHierarchy( obj, path );

					}

					continue;

				}

			}

			// Build appropriate object based on type
			if ( typeName === 'SkelRoot' ) {

				// Skeletal root - treat as transform but track for skeleton binding
				const obj = new Object3D();
				obj.name = name;
				obj.userData.isSkelRoot = true;
				const attrs = this._getAttributes( path );
				this.applyTransform( obj, spec.fields, attrs );
				parent.add( obj );
				this._buildHierarchy( obj, path );

			} else if ( typeName === 'Skeleton' ) {

				// Build skeleton and store it
				const skeleton = this._buildSkeleton( path );
				if ( skeleton ) {

					this.skeletons[ path ] = skeleton;

				}

				// Recursively build children (may contain SkelAnimation)
				this._buildHierarchy( parent, path );

			} else if ( typeName === 'SkelAnimation' ) {

				// Skip - animations are processed separately in _buildAnimations

			} else if ( typeName === 'Mesh' ) {

				const obj = this._buildMesh( path, spec );
				if ( obj ) {

					parent.add( obj );

				}

			} else if ( typeName === 'Material' || typeName === 'Shader' ) {

				// Skip materials/shaders, they're referenced by meshes

			} else {

				// Transform node, group, or unknown type
				const obj = new Object3D();
				obj.name = name;
				const attrs = this._getAttributes( path );
				this.applyTransform( obj, spec.fields, attrs );
				parent.add( obj );
				this._buildHierarchy( obj, path );

			}

		}

	}

	/**
	 * Get variant paths for a parent path based on variant selections.
	 */
	_getVariantPaths( parentPath ) {

		const parentSpec = this.specsByPath[ parentPath ];
		const variantSetChildren = parentSpec?.fields?.variantSetChildren;
		const variantPaths = [];

		if ( ! variantSetChildren || variantSetChildren.length === 0 ) {

			return variantPaths;

		}

		for ( const variantSetName of variantSetChildren ) {

			// External selections take priority
			let selectedVariant = this.externalVariantSelections[ variantSetName ] || null;

			// Fall back to file's internal selection
			if ( ! selectedVariant ) {

				const variantSelection = parentSpec.fields.variantSelection;
				selectedVariant = variantSelection ? variantSelection[ variantSetName ] : null;

			}

			// Fall back to first variant child
			if ( ! selectedVariant ) {

				const variantSetPath = parentPath + '/{' + variantSetName + '=}';
				const variantSetSpec = this.specsByPath[ variantSetPath ];
				if ( variantSetSpec?.fields?.variantChildren ) {

					selectedVariant = variantSetSpec.fields.variantChildren[ 0 ];

				}

			}

			if ( selectedVariant ) {

				const variantPath = parentPath + '/{' + variantSetName + '=' + selectedVariant + '}';
				variantPaths.push( variantPath );

			}

		}

		return variantPaths;

	}

	/**
	 * Resolve a file path relative to basePath.
	 */
	_resolveFilePath( refPath ) {

		let cleanPath = refPath;

		// Remove ./ prefix
		if ( cleanPath.startsWith( './' ) ) {

			cleanPath = cleanPath.slice( 2 );

		}

		// Combine with base path
		if ( this.basePath ) {

			return this.basePath + '/' + cleanPath;

		}

		return cleanPath;

	}

	/**
	 * Resolve a USD reference and return the composed content.
	 * @param {string} refValue - Reference value like "@./path/to/file.usdc@"
	 * @param {Object} localVariants - Variant selections to apply
	 * @returns {Group|null} Composed content or null
	 */
	_resolveReference( refValue, localVariants = {} ) {

		if ( ! refValue ) return null;

		const match = refValue.match( /@([^@]+)@(?:<([^>]+)>)?/ );
		if ( ! match ) return null;

		const filePath = match[ 1 ];
		const primPath = match[ 2 ]; // e.g., "/Geometry"

		const resolvedPath = this._resolveFilePath( filePath );

		// Merge variant selections - external takes priority, then local
		const mergedVariants = { ...localVariants, ...this.externalVariantSelections };

		// Look up pre-parsed data in assets
		const referencedData = this.assets[ resolvedPath ];
		if ( ! referencedData ) return null;

		// If it's specsByPath data, compose it
		if ( referencedData.specsByPath ) {

			const composer = new USDComposer( this.manager );
			const newBasePath = this._getBasePath( resolvedPath );
			const composedGroup = composer.compose( referencedData, this.assets, mergedVariants, newBasePath );

			// If a primPath is specified, find and return just that subtree
			if ( primPath ) {

				const primName = primPath.split( '/' ).pop();

				// Find the direct child with this name (not a deep search)
				// This is important because there may be multiple objects with the same name
				let targetObject = null;
				for ( const child of composedGroup.children ) {

					if ( child.name === primName ) {

						targetObject = child;
						break;

					}

				}

				if ( targetObject ) {

					// Detach from parent for re-parenting
					composedGroup.remove( targetObject );

					// Wrap in a group to maintain consistent return type
					const wrapper = new Group();
					wrapper.add( targetObject );
					return wrapper;

				}

			}

			return composedGroup;

		}

		// If it's already a Three.js Group (legacy support), clone it
		if ( referencedData.isGroup || referencedData.isObject3D ) {

			return referencedData.clone();

		}

		return null;

	}

	/**
	 * Find a single mesh in the group's shallow hierarchy.
	 * Only returns a mesh if it's at depth 0 or 1, not deeply nested.
	 * This preserves transforms in complex hierarchies like Kitchen Set
	 * while supporting USDZExporter round-trip (Xform > Xform > Mesh pattern).
	 */
	_findSingleMesh( group ) {

		// Check direct children first
		for ( const child of group.children ) {

			if ( child.isMesh ) {

				group.remove( child );
				return child;

			}

		}

		// Check grandchildren (USDZExporter pattern: Xform > Geometry > Mesh)
		// Only if there's exactly one child with exactly one grandchild
		if ( group.children.length === 1 ) {

			const child = group.children[ 0 ];

			if ( child.children && child.children.length === 1 ) {

				const grandchild = child.children[ 0 ];

				if ( grandchild.isMesh && ! this._hasNonIdentityTransform( child ) ) {

					// Safe to merge - intermediate has identity transform
					child.remove( grandchild );
					return grandchild;

				}

			}

		}

		return null;

	}

	/**
	 * Check if an object has a non-identity local transform.
	 */
	_hasNonIdentityTransform( obj ) {

		const pos = obj.position;
		const rot = obj.rotation;
		const scale = obj.scale;

		const hasPosition = pos.x !== 0 || pos.y !== 0 || pos.z !== 0;
		const hasRotation = rot.x !== 0 || rot.y !== 0 || rot.z !== 0;
		const hasScale = scale.x !== 1 || scale.y !== 1 || scale.z !== 1;

		return hasPosition || hasRotation || hasScale;

	}

	/**
	 * Get the base path (directory) from a file path.
	 */
	_getBasePath( filePath ) {

		const lastSlash = filePath.lastIndexOf( '/' );
		return lastSlash >= 0 ? filePath.slice( 0, lastSlash ) : '';

	}

	/**
	 * Extract variant selections from a spec's fields.
	 */
	_getLocalVariantSelections( fields ) {

		const variants = {};

		if ( fields.variantSelection ) {

			for ( const key in fields.variantSelection ) {

				variants[ key ] = fields.variantSelection[ key ];

			}

		}

		return variants;

	}

	/**
	 * Get reference value from a prim spec.
	 */
	_getReference( spec ) {

		if ( spec.fields.references && spec.fields.references.length > 0 ) {

			const ref = spec.fields.references[ 0 ];
			if ( typeof ref === 'string' ) return ref;
			if ( ref.assetPath ) return '@' + ref.assetPath + '@';

		}

		if ( spec.fields.payload ) {

			const payload = spec.fields.payload;
			if ( typeof payload === 'string' ) return payload;
			if ( payload.assetPath ) return '@' + payload.assetPath + '@';

		}

		return null;

	}

	/**
	 * Get attributes for a path from attribute specs.
	 */
	_getAttributes( path ) {

		const attrs = {};

		this._collectAttributesFromPath( path, attrs );

		// Collect overrides from sibling variants (when path is inside a variant)
		const variantMatch = path.match( VARIANT_PATH_REGEX );
		if ( variantMatch ) {

			const basePath = variantMatch[ 1 ];
			const relativePath = variantMatch[ 4 ];
			const variantPaths = this._getVariantPaths( basePath );

			for ( const vp of variantPaths ) {

				if ( path.startsWith( vp ) ) continue;

				const overridePath = vp + '/' + relativePath;
				this._collectAttributesFromPath( overridePath, attrs );

			}

		} else {

			// Check for variant overrides at ancestor levels
			const parts = path.split( '/' );
			for ( let i = 1; i < parts.length - 1; i ++ ) {

				const ancestorPath = parts.slice( 0, i + 1 ).join( '/' );
				const relativePath = parts.slice( i + 1 ).join( '/' );
				const variantPaths = this._getVariantPaths( ancestorPath );

				for ( const vp of variantPaths ) {

					const overridePath = vp + '/' + relativePath;
					this._collectAttributesFromPath( overridePath, attrs );

				}

			}

		}

		return attrs;

	}

	_collectAttributesFromPath( path, attrs ) {

		// Use the attribute index for O(1) lookup instead of O(n) iteration
		const attrMap = this.attributesByPrimPath.get( path );

		if ( ! attrMap ) return;

		for ( const [ attrName, attrSpec ] of attrMap ) {

			if ( attrSpec.fields?.default !== undefined ) {

				attrs[ attrName ] = attrSpec.fields.default;

			} else if ( attrSpec.fields?.timeSamples ) {

				// For animated attributes without default, use the first time sample (rest pose)
				const { times, values } = attrSpec.fields.timeSamples;
				if ( times && values && times.length > 0 ) {

					// Find time 0, or use the first available time
					const idx = times.indexOf( 0 );
					attrs[ attrName ] = idx >= 0 ? values[ idx ] : values[ 0 ];

				}

			}

			if ( attrSpec.fields?.elementSize !== undefined ) {

				attrs[ attrName + ':elementSize' ] = attrSpec.fields.elementSize;

			}

			if ( attrName.startsWith( 'primvars:' ) && attrSpec.fields?.typeName !== undefined ) {

				attrs[ attrName + ':typeName' ] = attrSpec.fields.typeName;

			}

		}

	}

	/**
	 * Build a mesh from a Mesh spec.
	 */
	_buildMesh( path, spec ) {

		const attrs = this._getAttributes( path );

		// Check for skinning data
		const jointIndices = attrs[ 'primvars:skel:jointIndices' ];
		const jointWeights = attrs[ 'primvars:skel:jointWeights' ];
		const hasSkinning = jointIndices && jointWeights &&
			jointIndices.length > 0 && jointWeights.length > 0;

		// Collect GeomSubsets for multi-material support
		const geomSubsets = this._getGeomSubsets( path );

		let geometry, material;

		if ( geomSubsets.length > 0 ) {

			geometry = this._buildGeometryWithSubsets( attrs, geomSubsets, hasSkinning );

			const meshMaterialPath = this._getMaterialPath( path, spec.fields );

			material = geomSubsets.map( subset => {

				const matPath = subset.materialPath || meshMaterialPath;
				return this._buildMaterialForPath( matPath );

			} );

		} else {

			geometry = this._buildGeometry( path, attrs, hasSkinning );
			material = this._buildMaterial( path, spec.fields );

		}

		const displayColor = attrs[ 'primvars:displayColor' ];
		if ( displayColor && displayColor.length >= 3 ) {

			const applyDisplayColor = ( mat ) => {

				if ( mat.color && mat.color.r === 1 && mat.color.g === 1 && mat.color.b === 1 && ! mat.map ) {

					mat.color.setRGB( displayColor[ 0 ], displayColor[ 1 ], displayColor[ 2 ], SRGBColorSpace );

				}

			};

			if ( Array.isArray( material ) ) {

				material.forEach( applyDisplayColor );

			} else {

				applyDisplayColor( material );

			}

		}

		const displayOpacity = attrs[ 'primvars:displayOpacity' ];
		if ( displayOpacity && displayOpacity.length >= 1 ) {

			const opacity = displayOpacity[ 0 ];

			const applyDisplayOpacity = ( mat ) => {

				if ( opacity < 1 ) {

					mat.opacity = opacity;
					mat.transparent = true;

				}

			};

			if ( Array.isArray( material ) ) {

				material.forEach( applyDisplayOpacity );

			} else {

				applyDisplayOpacity( material );

			}

		}

		let mesh;

		if ( hasSkinning ) {

			mesh = new SkinnedMesh( geometry, material );

			// Find skeleton path from skel:skeleton relationship
			let skelBindingSpec = this.specsByPath[ path + '.skel:skeleton' ];
			if ( ! skelBindingSpec ) {

				skelBindingSpec = this.specsByPath[ path + '.rel skel:skeleton' ];

			}

			let skeletonPath = null;

			if ( skelBindingSpec ) {

				if ( skelBindingSpec.fields.targetPaths && skelBindingSpec.fields.targetPaths.length > 0 ) {

					skeletonPath = skelBindingSpec.fields.targetPaths[ 0 ];

				} else if ( skelBindingSpec.fields.default ) {

					skeletonPath = skelBindingSpec.fields.default.replace( /<|>/g, '' );

				}

			}

			// Get per-mesh joint mapping
			const localJoints = attrs[ 'skel:joints' ];

			// Get geomBindTransform if present
			const geomBindTransform = attrs[ 'primvars:skel:geomBindTransform' ];

			this.skinnedMeshes.push( { mesh, skeletonPath, path, localJoints, geomBindTransform } );

		} else {

			mesh = new Mesh( geometry, material );

		}

		mesh.name = path.split( '/' ).pop();
		this.applyTransform( mesh, spec.fields, attrs );

		return mesh;

	}

	_getGeomSubsets( meshPath ) {

		const subsets = [];
		const subsetPaths = this.geomSubsetsByMeshPath.get( meshPath );
		if ( ! subsetPaths ) return subsets;

		for ( const p of subsetPaths ) {

			const attrs = this._getAttributes( p );
			const indices = attrs[ 'indices' ];
			if ( ! indices || indices.length === 0 ) continue;

			// Get material binding - check direct path and variant paths
			let materialPath = this._getMaterialBindingTarget( p );

			subsets.push( {
				name: p.split( '/' ).pop(),
				indices: indices,
				materialPath: materialPath
			} );

		}

		return subsets;

	}

	/**
	 * Get material binding target path, checking variant paths if needed.
	 */
	_getMaterialBindingTarget( primPath ) {

		const attrName = 'material:binding';

		// First check direct path
		const directPath = primPath + '.' + attrName;
		const directSpec = this.specsByPath[ directPath ];
		if ( directSpec?.fields?.targetPaths?.length > 0 ) {

			return directSpec.fields.targetPaths[ 0 ];

		}

		// Check variant paths at ancestor levels
		const parts = primPath.split( '/' );
		for ( let i = 1; i < parts.length; i ++ ) {

			const ancestorPath = parts.slice( 0, i + 1 ).join( '/' );
			const relativePath = parts.slice( i + 1 ).join( '/' );
			const variantPaths = this._getVariantPaths( ancestorPath );

			for ( const vp of variantPaths ) {

				const overridePath = relativePath ? vp + '/' + relativePath + '.' + attrName : vp + '.' + attrName;
				const overrideSpec = this.specsByPath[ overridePath ];

				if ( overrideSpec?.fields?.targetPaths?.length > 0 ) {

					return overrideSpec.fields.targetPaths[ 0 ];

				}

			}

		}

		return null;

	}

	_buildGeometry( path, fields, hasSkinning = false ) {

		const geometry = new BufferGeometry();

		const points = fields[ 'points' ];
		if ( ! points || points.length === 0 ) return geometry;

		const faceVertexIndices = fields[ 'faceVertexIndices' ];
		const faceVertexCounts = fields[ 'faceVertexCounts' ];

		// Parse polygon holes (Arnold format: [holeFaceIdx, parentFaceIdx, ...])
		const polygonHoles = fields[ 'primvars:arnold:polygon_holes' ];
		const holeMap = this._buildHoleMap( polygonHoles );

		// Compute triangulation pattern once using actual vertex positions
		// This pattern will be reused for normals, UVs, etc.
		let indices = faceVertexIndices;
		let triPattern = null;

		if ( faceVertexCounts && faceVertexCounts.length > 0 ) {

			const result = this._triangulateIndicesWithPattern( faceVertexIndices, faceVertexCounts, points, holeMap );
			indices = result.indices;
			triPattern = result.pattern;

		}

		let positions = points;
		if ( indices && indices.length > 0 ) {

			positions = this._expandAttribute( points, indices, 3 );

		}

		geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( positions ), 3 ) );

		const normals = fields[ 'normals' ] || fields[ 'primvars:normals' ];
		const normalIndicesRaw = fields[ 'normals:indices' ] || fields[ 'primvars:normals:indices' ];

		if ( normals && normals.length > 0 ) {

			let normalData = normals;

			if ( normalIndicesRaw && normalIndicesRaw.length > 0 && triPattern ) {

				// Indexed normals - apply triangulation pattern to indices
				const triangulatedNormalIndices = this._applyTriangulationPattern( normalIndicesRaw, triPattern );
				normalData = this._expandAttribute( normals, triangulatedNormalIndices, 3 );

			} else if ( normals.length === points.length ) {

				// Per-vertex normals
				if ( indices && indices.length > 0 ) {

					normalData = this._expandAttribute( normals, indices, 3 );

				}

			} else if ( triPattern ) {

				// Per-face-vertex normals (no separate indices) - use same triangulation pattern
				const normalIndices = this._applyTriangulationPattern(
					Array.from( { length: normals.length / 3 }, ( _, i ) => i ),
					triPattern
				);
				normalData = this._expandAttribute( normals, normalIndices, 3 );

			}

			geometry.setAttribute( 'normal', new BufferAttribute( new Float32Array( normalData ), 3 ) );

		} else {

			geometry.computeVertexNormals();

		}

		const { uvs, uvIndices } = this._findUVPrimvar( fields );
		const numFaceVertices = faceVertexIndices ? faceVertexIndices.length : 0;

		if ( uvs && uvs.length > 0 ) {

			let uvData = uvs;

			if ( uvIndices && uvIndices.length > 0 && triPattern ) {

				const triangulatedUvIndices = this._applyTriangulationPattern( uvIndices, triPattern );
				uvData = this._expandAttribute( uvs, triangulatedUvIndices, 2 );

			} else if ( indices && uvs.length / 2 === points.length / 3 ) {

				uvData = this._expandAttribute( uvs, indices, 2 );

			} else if ( triPattern && uvs.length / 2 === numFaceVertices ) {

				// Per-face-vertex UVs (faceVarying, no separate indices)
				const uvIndicesFromPattern = this._applyTriangulationPattern(
					Array.from( { length: numFaceVertices }, ( _, i ) => i ),
					triPattern
				);
				uvData = this._expandAttribute( uvs, uvIndicesFromPattern, 2 );

			}

			geometry.setAttribute( 'uv', new BufferAttribute( new Float32Array( uvData ), 2 ) );

		}

		// Second UV set (st1) for lightmaps/AO
		const { uvs2, uv2Indices } = this._findUV2Primvar( fields );

		if ( uvs2 && uvs2.length > 0 ) {

			let uv2Data = uvs2;

			if ( uv2Indices && uv2Indices.length > 0 && triPattern ) {

				const triangulatedUv2Indices = this._applyTriangulationPattern( uv2Indices, triPattern );
				uv2Data = this._expandAttribute( uvs2, triangulatedUv2Indices, 2 );

			} else if ( indices && uvs2.length / 2 === points.length / 3 ) {

				uv2Data = this._expandAttribute( uvs2, indices, 2 );

			} else if ( triPattern && uvs2.length / 2 === numFaceVertices ) {

				// Per-face-vertex UV2 (faceVarying, no separate indices)
				const uv2IndicesFromPattern = this._applyTriangulationPattern(
					Array.from( { length: numFaceVertices }, ( _, i ) => i ),
					triPattern
				);
				uv2Data = this._expandAttribute( uvs2, uv2IndicesFromPattern, 2 );

			}

			geometry.setAttribute( 'uv1', new BufferAttribute( new Float32Array( uv2Data ), 2 ) );

		}

		// Add skinning attributes
		if ( hasSkinning ) {

			const jointIndices = fields[ 'primvars:skel:jointIndices' ];
			const jointWeights = fields[ 'primvars:skel:jointWeights' ];
			const elementSize = fields[ 'primvars:skel:jointIndices:elementSize' ] || 4;

			if ( jointIndices && jointWeights ) {

				const numVertices = positions.length / 3;

				let skinIndexData, skinWeightData;

				if ( indices && indices.length > 0 ) {

					skinIndexData = this._expandAttribute( jointIndices, indices, elementSize );
					skinWeightData = this._expandAttribute( jointWeights, indices, elementSize );

				} else {

					skinIndexData = jointIndices;
					skinWeightData = jointWeights;

				}

				const skinIndices = new Uint16Array( numVertices * 4 );
				const skinWeights = new Float32Array( numVertices * 4 );

				for ( let i = 0; i < numVertices; i ++ ) {

					for ( let j = 0; j < 4; j ++ ) {

						if ( j < elementSize ) {

							skinIndices[ i * 4 + j ] = skinIndexData[ i * elementSize + j ] || 0;
							skinWeights[ i * 4 + j ] = skinWeightData[ i * elementSize + j ] || 0;

						} else {

							skinIndices[ i * 4 + j ] = 0;
							skinWeights[ i * 4 + j ] = 0;

						}

					}

				}

				geometry.setAttribute( 'skinIndex', new BufferAttribute( skinIndices, 4 ) );
				geometry.setAttribute( 'skinWeight', new BufferAttribute( skinWeights, 4 ) );

			}

		}

		return geometry;

	}

	_buildGeometryWithSubsets( fields, geomSubsets, hasSkinning = false ) {

		const geometry = new BufferGeometry();

		const points = fields[ 'points' ];
		if ( ! points || points.length === 0 ) return geometry;

		const faceVertexIndices = fields[ 'faceVertexIndices' ];
		const faceVertexCounts = fields[ 'faceVertexCounts' ];

		if ( ! faceVertexCounts || faceVertexCounts.length === 0 ) return geometry;

		const polygonHoles = fields[ 'primvars:arnold:polygon_holes' ];
		const holeMap = this._buildHoleMap( polygonHoles );
		const holeFaces = holeMap.holeFaces;
		const parentToHoles = holeMap.parentToHoles;

		const { uvs, uvIndices } = this._findUVPrimvar( fields );
		const { uvs2, uv2Indices } = this._findUV2Primvar( fields );
		const normals = fields[ 'normals' ] || fields[ 'primvars:normals' ];
		const normalIndicesRaw = fields[ 'normals:indices' ] || fields[ 'primvars:normals:indices' ];

		const jointIndices = hasSkinning ? fields[ 'primvars:skel:jointIndices' ] : null;
		const jointWeights = hasSkinning ? fields[ 'primvars:skel:jointWeights' ] : null;
		const elementSize = fields[ 'primvars:skel:jointIndices:elementSize' ] || 4;

		// Build face-to-triangle mapping (accounting for holes)
		const faceTriangleOffset = [];
		let triangleCount = 0;

		for ( let i = 0; i < faceVertexCounts.length; i ++ ) {

			faceTriangleOffset.push( triangleCount );

			// Skip hole faces - they're triangulated with their parent
			if ( holeFaces.has( i ) ) continue;

			const count = faceVertexCounts[ i ];
			const holes = parentToHoles.get( i );

			if ( holes && holes.length > 0 ) {

				// For faces with holes, count triangles based on total vertices
				// Earcut produces (total_vertices - 2) triangles for any polygon including holes
				let totalVerts = count;
				for ( const holeIdx of holes ) {

					totalVerts += faceVertexCounts[ holeIdx ];

				}

				triangleCount += totalVerts - 2;

			} else if ( count >= 3 ) {

				triangleCount += count - 2;

			}

		}

		const triangleToSubset = new Int32Array( triangleCount ).fill( - 1 );

		for ( let si = 0; si < geomSubsets.length; si ++ ) {

			const subset = geomSubsets[ si ];

			for ( let i = 0; i < subset.indices.length; i ++ ) {

				const faceIdx = subset.indices[ i ];
				if ( faceIdx >= faceVertexCounts.length ) continue;

				const triStart = faceTriangleOffset[ faceIdx ];
				const triCount = faceVertexCounts[ faceIdx ] - 2;

				for ( let t = 0; t < triCount; t ++ ) {

					triangleToSubset[ triStart + t ] = si;

				}

			}

		}

		// Sort triangles by subset
		const sortedTriangles = [];

		for ( let tri = 0; tri < triangleCount; tri ++ ) {

			sortedTriangles.push( { original: tri, subset: triangleToSubset[ tri ] } );

		}

		sortedTriangles.sort( ( a, b ) => a.subset - b.subset );

		const groups = [];
		let currentSubset = sortedTriangles.length > 0 ? sortedTriangles[ 0 ].subset : - 1;
		let groupStart = 0;

		for ( let i = 0; i < sortedTriangles.length; i ++ ) {

			if ( sortedTriangles[ i ].subset !== currentSubset ) {

				if ( currentSubset >= 0 ) {

					groups.push( {
						start: groupStart * 3,
						count: ( i - groupStart ) * 3,
						materialIndex: currentSubset
					} );

				}

				currentSubset = sortedTriangles[ i ].subset;
				groupStart = i;

			}

		}

		if ( currentSubset >= 0 && sortedTriangles.length > groupStart ) {

			groups.push( {
				start: groupStart * 3,
				count: ( sortedTriangles.length - groupStart ) * 3,
				materialIndex: currentSubset
			} );

		}

		for ( const group of groups ) {

			geometry.addGroup( group.start, group.count, group.materialIndex );

		}

		// Triangulate original data using consistent pattern
		const { indices: origIndices, pattern: triPattern } = this._triangulateIndicesWithPattern( faceVertexIndices, faceVertexCounts, points, holeMap );
		const origUvIndices = uvIndices ? this._applyTriangulationPattern( uvIndices, triPattern ) : null;
		const origUv2Indices = uv2Indices ? this._applyTriangulationPattern( uv2Indices, triPattern ) : null;

		const numFaceVertices = faceVertexCounts.reduce( ( a, b ) => a + b, 0 );
		const hasIndexedNormals = normals && normalIndicesRaw && normalIndicesRaw.length > 0;
		const hasFaceVaryingNormals = normals && normals.length / 3 === numFaceVertices;
		const origNormalIndices = hasIndexedNormals
			? this._applyTriangulationPattern( normalIndicesRaw, triPattern )
			: ( hasFaceVaryingNormals
				? this._applyTriangulationPattern( Array.from( { length: numFaceVertices }, ( _, i ) => i ), triPattern )
				: null );

		// Build reordered vertex data
		const vertexCount = triangleCount * 3;
		const positions = new Float32Array( vertexCount * 3 );
		const uvData = uvs ? new Float32Array( vertexCount * 2 ) : null;
		const uv1Data = uvs2 ? new Float32Array( vertexCount * 2 ) : null;
		const normalData = normals ? new Float32Array( vertexCount * 3 ) : null;
		const skinIndexData = jointIndices ? new Uint16Array( vertexCount * 4 ) : null;
		const skinWeightData = jointWeights ? new Float32Array( vertexCount * 4 ) : null;

		for ( let i = 0; i < sortedTriangles.length; i ++ ) {

			const origTri = sortedTriangles[ i ].original;

			for ( let v = 0; v < 3; v ++ ) {

				const origIdx = origTri * 3 + v;
				const newIdx = i * 3 + v;

				const pointIdx = origIndices[ origIdx ];
				positions[ newIdx * 3 ] = points[ pointIdx * 3 ];
				positions[ newIdx * 3 + 1 ] = points[ pointIdx * 3 + 1 ];
				positions[ newIdx * 3 + 2 ] = points[ pointIdx * 3 + 2 ];

				if ( uvData && uvs ) {

					if ( origUvIndices ) {

						const uvIdx = origUvIndices[ origIdx ];
						uvData[ newIdx * 2 ] = uvs[ uvIdx * 2 ];
						uvData[ newIdx * 2 + 1 ] = uvs[ uvIdx * 2 + 1 ];

					} else if ( uvs.length / 2 === points.length / 3 ) {

						uvData[ newIdx * 2 ] = uvs[ pointIdx * 2 ];
						uvData[ newIdx * 2 + 1 ] = uvs[ pointIdx * 2 + 1 ];

					}

				}

				if ( uv1Data && uvs2 ) {

					if ( origUv2Indices ) {

						const uv2Idx = origUv2Indices[ origIdx ];
						uv1Data[ newIdx * 2 ] = uvs2[ uv2Idx * 2 ];
						uv1Data[ newIdx * 2 + 1 ] = uvs2[ uv2Idx * 2 + 1 ];

					} else if ( uvs2.length / 2 === points.length / 3 ) {

						uv1Data[ newIdx * 2 ] = uvs2[ pointIdx * 2 ];
						uv1Data[ newIdx * 2 + 1 ] = uvs2[ pointIdx * 2 + 1 ];

					}

				}

				if ( normalData && normals ) {

					if ( origNormalIndices ) {

						const normalIdx = origNormalIndices[ origIdx ];
						normalData[ newIdx * 3 ] = normals[ normalIdx * 3 ];
						normalData[ newIdx * 3 + 1 ] = normals[ normalIdx * 3 + 1 ];
						normalData[ newIdx * 3 + 2 ] = normals[ normalIdx * 3 + 2 ];

					} else if ( normals.length === points.length ) {

						normalData[ newIdx * 3 ] = normals[ pointIdx * 3 ];
						normalData[ newIdx * 3 + 1 ] = normals[ pointIdx * 3 + 1 ];
						normalData[ newIdx * 3 + 2 ] = normals[ pointIdx * 3 + 2 ];

					}

				}

				if ( skinIndexData && skinWeightData && jointIndices && jointWeights ) {

					for ( let j = 0; j < 4; j ++ ) {

						if ( j < elementSize ) {

							skinIndexData[ newIdx * 4 + j ] = jointIndices[ pointIdx * elementSize + j ] || 0;
							skinWeightData[ newIdx * 4 + j ] = jointWeights[ pointIdx * elementSize + j ] || 0;

						} else {

							skinIndexData[ newIdx * 4 + j ] = 0;
							skinWeightData[ newIdx * 4 + j ] = 0;

						}

					}

				}

			}

		}

		geometry.setAttribute( 'position', new BufferAttribute( positions, 3 ) );

		if ( uvData ) {

			geometry.setAttribute( 'uv', new BufferAttribute( uvData, 2 ) );

		}

		if ( uv1Data ) {

			geometry.setAttribute( 'uv1', new BufferAttribute( uv1Data, 2 ) );

		}

		if ( normalData ) {

			geometry.setAttribute( 'normal', new BufferAttribute( normalData, 3 ) );

		} else {

			geometry.computeVertexNormals();

		}

		if ( skinIndexData ) {

			geometry.setAttribute( 'skinIndex', new BufferAttribute( skinIndexData, 4 ) );

		}

		if ( skinWeightData ) {

			geometry.setAttribute( 'skinWeight', new BufferAttribute( skinWeightData, 4 ) );

		}

		return geometry;

	}

	_findUVPrimvar( fields ) {

		for ( const key in fields ) {

			if ( ! key.startsWith( 'primvars:' ) ) continue;
			if ( key.endsWith( ':typeName' ) || key.endsWith( ':elementSize' ) || key.endsWith( ':indices' ) ) continue;
			if ( key.includes( 'skel:' ) ) continue;

			const typeName = fields[ key + ':typeName' ];
			if ( typeName && typeName.includes( 'texCoord' ) ) {

				return {
					uvs: fields[ key ],
					uvIndices: fields[ key + ':indices' ]
				};

			}

		}

		const uvs = fields[ 'primvars:st' ] || fields[ 'primvars:UVMap' ];
		const uvIndices = fields[ 'primvars:st:indices' ];
		return { uvs, uvIndices };

	}

	_findUV2Primvar( fields ) {

		const uvs2 = fields[ 'primvars:st1' ];
		const uv2Indices = fields[ 'primvars:st1:indices' ];
		return { uvs2, uv2Indices };

	}

	_buildHoleMap( polygonHoles ) {

		// polygonHoles is in Arnold format: [holeFaceIdx, parentFaceIdx, holeFaceIdx, parentFaceIdx, ...]
		// Returns a map: parentFaceIdx -> [holeFaceIdx1, holeFaceIdx2, ...]
		// Also returns a set of hole face indices to skip during triangulation
		if ( ! polygonHoles || polygonHoles.length === 0 ) {

			return { parentToHoles: new Map(), holeFaces: new Set() };

		}

		const parentToHoles = new Map();
		const holeFaces = new Set();

		for ( let i = 0; i < polygonHoles.length; i += 2 ) {

			const holeFaceIdx = polygonHoles[ i ];
			const parentFaceIdx = polygonHoles[ i + 1 ];

			holeFaces.add( holeFaceIdx );

			if ( ! parentToHoles.has( parentFaceIdx ) ) {

				parentToHoles.set( parentFaceIdx, [] );

			}

			parentToHoles.get( parentFaceIdx ).push( holeFaceIdx );

		}

		return { parentToHoles, holeFaces };

	}

	_triangulateIndicesWithPattern( indices, counts, points = null, holeMap = null ) {

		const triangulated = [];
		const pattern = []; // Stores face-local indices for each triangle vertex

		// Build face offset lookup for accessing hole face data
		const faceOffsets = [];
		let offsetAccum = 0;
		for ( let i = 0; i < counts.length; i ++ ) {

			faceOffsets.push( offsetAccum );
			offsetAccum += counts[ i ];

		}

		const parentToHoles = holeMap?.parentToHoles || new Map();
		const holeFaces = holeMap?.holeFaces || new Set();

		let offset = 0;

		for ( let i = 0; i < counts.length; i ++ ) {

			const count = counts[ i ];

			// Skip faces that are holes - they will be triangulated with their parent
			if ( holeFaces.has( i ) ) {

				offset += count;
				continue;

			}

			// Check if this face has holes
			const holes = parentToHoles.get( i );

			if ( holes && holes.length > 0 && points && points.length > 0 ) {

				// Triangulate face with holes using vertex -> face-vertex mapping
				const vertexToFaceVertex = new Map();

				const faceIndices = [];
				for ( let j = 0; j < count; j ++ ) {

					const vertIdx = indices[ offset + j ];
					faceIndices.push( vertIdx );
					vertexToFaceVertex.set( vertIdx, offset + j );

				}

				const holeContours = [];
				for ( const holeFaceIdx of holes ) {

					const holeOffset = faceOffsets[ holeFaceIdx ];
					const holeCount = counts[ holeFaceIdx ];
					const holeIndices = [];
					for ( let j = 0; j < holeCount; j ++ ) {

						const vertIdx = indices[ holeOffset + j ];
						holeIndices.push( vertIdx );
						vertexToFaceVertex.set( vertIdx, holeOffset + j );

					}

					holeContours.push( holeIndices );

				}

				const triangles = this._triangulateNGonWithHoles( faceIndices, holeContours, points );

				for ( const tri of triangles ) {

					triangulated.push( tri[ 0 ], tri[ 1 ], tri[ 2 ] );
					pattern.push(
						vertexToFaceVertex.get( tri[ 0 ] ),
						vertexToFaceVertex.get( tri[ 1 ] ),
						vertexToFaceVertex.get( tri[ 2 ] )
					);

				}

			} else if ( count === 3 ) {

				triangulated.push(
					indices[ offset ],
					indices[ offset + 1 ],
					indices[ offset + 2 ]
				);
				pattern.push( offset, offset + 1, offset + 2 );

			} else if ( count === 4 ) {

				triangulated.push(
					indices[ offset ],
					indices[ offset + 1 ],
					indices[ offset + 2 ],
					indices[ offset ],
					indices[ offset + 2 ],
					indices[ offset + 3 ]
				);
				pattern.push(
					offset, offset + 1, offset + 2,
					offset, offset + 2, offset + 3
				);

			} else if ( count > 4 ) {

				// Use ear-clipping for complex n-gons if we have vertex positions
				if ( points && points.length > 0 ) {

					const faceIndices = [];
					for ( let j = 0; j < count; j ++ ) {

						faceIndices.push( indices[ offset + j ] );

					}

					const triangles = this._triangulateNGon( faceIndices, points );

					for ( const tri of triangles ) {

						triangulated.push( tri[ 0 ], tri[ 1 ], tri[ 2 ] );
						// Find local indices within the face
						pattern.push(
							offset + faceIndices.indexOf( tri[ 0 ] ),
							offset + faceIndices.indexOf( tri[ 1 ] ),
							offset + faceIndices.indexOf( tri[ 2 ] )
						);

					}

				} else {

					// Fallback to fan triangulation
					for ( let j = 1; j < count - 1; j ++ ) {

						triangulated.push(
							indices[ offset ],
							indices[ offset + j ],
							indices[ offset + j + 1 ]
						);
						pattern.push( offset, offset + j, offset + j + 1 );

					}

				}

			}

			offset += count;

		}

		return { indices: triangulated, pattern };

	}

	_applyTriangulationPattern( indices, pattern ) {

		const result = [];
		for ( let i = 0; i < pattern.length; i ++ ) {

			result.push( indices[ pattern[ i ] ] );

		}

		return result;

	}

	_triangulateNGon( faceIndices, points ) {

		// Project 3D polygon to 2D for triangulation using Newell's method for normal
		const contour2D = [];
		const contour3D = [];

		for ( const idx of faceIndices ) {

			contour3D.push( new Vector3(
				points[ idx * 3 ],
				points[ idx * 3 + 1 ],
				points[ idx * 3 + 2 ]
			) );

		}

		// Calculate polygon normal using Newell's method
		const normal = new Vector3();
		for ( let i = 0; i < contour3D.length; i ++ ) {

			const curr = contour3D[ i ];
			const next = contour3D[ ( i + 1 ) % contour3D.length ];
			normal.x += ( curr.y - next.y ) * ( curr.z + next.z );
			normal.y += ( curr.z - next.z ) * ( curr.x + next.x );
			normal.z += ( curr.x - next.x ) * ( curr.y + next.y );

		}

		normal.normalize();

		// Create tangent basis for projection
		const tangent = new Vector3();
		const bitangent = new Vector3();

		if ( Math.abs( normal.y ) > 0.9 ) {

			tangent.set( 1, 0, 0 );

		} else {

			tangent.set( 0, 1, 0 );

		}

		bitangent.crossVectors( normal, tangent ).normalize();
		tangent.crossVectors( bitangent, normal ).normalize();

		// Project to 2D
		for ( const p of contour3D ) {

			contour2D.push( new Vector2( p.dot( tangent ), p.dot( bitangent ) ) );

		}

		// Triangulate using ShapeUtils
		const triangles = ShapeUtils.triangulateShape( contour2D, [] );

		// Map back to original indices
		const result = [];
		for ( const tri of triangles ) {

			result.push( [
				faceIndices[ tri[ 0 ] ],
				faceIndices[ tri[ 1 ] ],
				faceIndices[ tri[ 2 ] ]
			] );

		}

		return result;

	}

	_triangulateNGonWithHoles( outerIndices, holeContours, points ) {

		// Project 3D polygon with holes to 2D for triangulation
		const outer3D = [];

		for ( const idx of outerIndices ) {

			outer3D.push( new Vector3(
				points[ idx * 3 ],
				points[ idx * 3 + 1 ],
				points[ idx * 3 + 2 ]
			) );

		}

		// Calculate polygon normal using Newell's method
		const normal = new Vector3();
		for ( let i = 0; i < outer3D.length; i ++ ) {

			const curr = outer3D[ i ];
			const next = outer3D[ ( i + 1 ) % outer3D.length ];
			normal.x += ( curr.y - next.y ) * ( curr.z + next.z );
			normal.y += ( curr.z - next.z ) * ( curr.x + next.x );
			normal.z += ( curr.x - next.x ) * ( curr.y + next.y );

		}

		normal.normalize();

		// Create tangent basis for projection
		const tangent = new Vector3();
		const bitangent = new Vector3();

		if ( Math.abs( normal.y ) > 0.9 ) {

			tangent.set( 1, 0, 0 );

		} else {

			tangent.set( 0, 1, 0 );

		}

		bitangent.crossVectors( normal, tangent ).normalize();
		tangent.crossVectors( bitangent, normal ).normalize();

		// Project outer contour to 2D
		const outer2D = [];
		for ( const p of outer3D ) {

			outer2D.push( new Vector2( p.dot( tangent ), p.dot( bitangent ) ) );

		}

		// Project hole contours to 2D
		const holes2D = [];

		for ( const holeIndices of holeContours ) {

			const hole2D = [];

			for ( const idx of holeIndices ) {

				const p = new Vector3(
					points[ idx * 3 ],
					points[ idx * 3 + 1 ],
					points[ idx * 3 + 2 ]
				);
				hole2D.push( new Vector2( p.dot( tangent ), p.dot( bitangent ) ) );

			}

			holes2D.push( hole2D );

		}

		// Build combined index array: outer contour followed by all holes
		const allIndices = [ ...outerIndices ];
		for ( const holeIndices of holeContours ) {

			allIndices.push( ...holeIndices );

		}

		// Triangulate using ShapeUtils with holes
		const triangles = ShapeUtils.triangulateShape( outer2D, holes2D );

		// Map back to original vertex indices
		const result = [];
		for ( const tri of triangles ) {

			result.push( [
				allIndices[ tri[ 0 ] ],
				allIndices[ tri[ 1 ] ],
				allIndices[ tri[ 2 ] ]
			] );

		}

		return result;

	}

	_triangulateIndices( indices, counts ) {

		const triangulated = [];
		let offset = 0;

		for ( let i = 0; i < counts.length; i ++ ) {

			const count = counts[ i ];

			if ( count === 3 ) {

				triangulated.push(
					indices[ offset ],
					indices[ offset + 1 ],
					indices[ offset + 2 ]
				);

			} else if ( count === 4 ) {

				triangulated.push(
					indices[ offset ],
					indices[ offset + 1 ],
					indices[ offset + 2 ],
					indices[ offset ],
					indices[ offset + 2 ],
					indices[ offset + 3 ]
				);

			} else if ( count > 4 ) {

				// Fan triangulation for n-gons
				for ( let j = 1; j < count - 1; j ++ ) {

					triangulated.push(
						indices[ offset ],
						indices[ offset + j ],
						indices[ offset + j + 1 ]
					);

				}

			}

			offset += count;

		}

		return triangulated;

	}

	_expandAttribute( data, indices, itemSize ) {

		const expanded = new Array( indices.length * itemSize );

		for ( let i = 0; i < indices.length; i ++ ) {

			const srcIdx = indices[ i ];

			for ( let j = 0; j < itemSize; j ++ ) {

				expanded[ i * itemSize + j ] = data[ srcIdx * itemSize + j ];

			}

		}

		return expanded;

	}

	/**
	 * Get the material path for a mesh, checking various binding sources.
	 */
	_getMaterialPath( meshPath, fields ) {

		let materialPath = null;
		let materialBinding = fields[ 'material:binding' ];

		if ( materialBinding ) {

			materialPath = Array.isArray( materialBinding ) ? materialBinding[ 0 ] : materialBinding;

		}

		// Use variant-aware lookup if no direct binding in fields
		if ( ! materialPath ) {

			materialPath = this._getMaterialBindingTarget( meshPath );

		}

		return materialPath;

	}

	_buildMaterial( meshPath, fields ) {

		const material = new MeshPhysicalMaterial();

		let materialPath = null;
		let materialBinding = fields[ 'material:binding' ];

		if ( materialBinding ) {

			materialPath = Array.isArray( materialBinding ) ? materialBinding[ 0 ] : materialBinding;

		}

		// Use variant-aware lookup if no direct binding in fields
		if ( ! materialPath ) {

			materialPath = this._getMaterialBindingTarget( meshPath );

		}

		if ( ! materialPath ) {

			const materialPaths = [];
			const prefix = meshPath + '/';

			for ( const path in this.specsByPath ) {

				if ( ! path.startsWith( prefix ) ) continue;
				if ( ! path.endsWith( '.material:binding' ) ) continue;

				const bindingSpec = this.specsByPath[ path ];
				if ( ! bindingSpec ) continue;

				const targetPaths = bindingSpec.fields.targetPaths;
				if ( targetPaths && targetPaths.length > 0 ) {

					materialPaths.push( targetPaths[ 0 ] );

				}

			}

			if ( materialPaths.length > 0 ) {

				materialPath = this._pickBestMaterial( materialPaths );

			}

		}

		if ( ! materialPath ) {

			// Use material index for O(1) lookup instead of O(n) iteration
			const meshParts = meshPath.split( '/' );
			const rootPath = '/' + meshParts[ 1 ];

			const materialsInRoot = this.materialsByRoot.get( rootPath );

			if ( materialsInRoot ) {

				for ( const path of materialsInRoot ) {

					if ( path.startsWith( rootPath + '/Looks/' ) ||
						path.startsWith( rootPath + '/Materials/' ) ) {

						materialPath = path;
						break;

					}

				}

			}

		}

		if ( materialPath ) {

			this._applyMaterial( material, materialPath );

		}

		return material;

	}

	_buildMaterialForPath( materialPath ) {

		const material = new MeshPhysicalMaterial();

		if ( materialPath ) {

			this._applyMaterial( material, materialPath );

		}

		return material;

	}

	/**
	 * Apply material binding from a prim path to a mesh.
	 * Used when merging referenced geometry into a prim that has material binding.
	 */
	_applyMaterialBinding( mesh, primPath ) {

		// Look for material:binding on this prim
		const bindingPath = primPath + '.material:binding';
		const bindingSpec = this.specsByPath[ bindingPath ];

		if ( ! bindingSpec ) return;

		let materialPath = null;
		const targetPaths = bindingSpec.fields?.targetPaths || bindingSpec.fields?.default;

		if ( targetPaths ) {

			materialPath = Array.isArray( targetPaths ) ? targetPaths[ 0 ] : targetPaths;

		}

		if ( ! materialPath ) return;

		// Clean the material path
		materialPath = String( materialPath ).replace( /^<|>$/g, '' );

		// Build and apply the material
		const material = new MeshPhysicalMaterial();
		this._applyMaterial( material, materialPath );
		mesh.material = material;

	}

	_pickBestMaterial( materialPaths ) {

		for ( const materialPath of materialPaths ) {

			const shaderPaths = this.shadersByMaterialPath.get( materialPath );
			if ( ! shaderPaths ) continue;

			for ( const path of shaderPaths ) {

				const attrs = this._getAttributes( path );
				if ( attrs[ 'info:id' ] === 'UsdUVTexture' && attrs[ 'inputs:file' ] ) {

					return materialPath;

				}

			}

		}

		return materialPaths[ 0 ];

	}

	_applyMaterial( material, materialPath ) {

		const materialSpec = this.specsByPath[ materialPath ];
		if ( ! materialSpec ) return;

		const shaderPaths = this.shadersByMaterialPath.get( materialPath );
		if ( ! shaderPaths ) return;

		for ( const path of shaderPaths ) {

			const spec = this.specsByPath[ path ];
			if ( ! spec ) continue;

			const shaderAttrs = this._getAttributes( path );
			const infoId = shaderAttrs[ 'info:id' ] || spec.fields[ 'info:id' ];

			if ( infoId === 'UsdPreviewSurface' ) {

				this._applyPreviewSurface( material, path );

			} else if ( infoId === 'arnold:openpbr_surface' ) {

				this._applyOpenPBRSurface( material, path );

			}

		}

	}

	/**
	 * Shared helper for applying texture or value from shader attribute.
	 * Reduces duplication between _applyPreviewSurface and _applyOpenPBRSurface.
	 */
	_applyTextureOrValue( material, shaderPath, fields, attrName, textureProperty, colorSpace, valueCallback, textureGetter ) {

		const attrPath = shaderPath + '.' + attrName;
		const spec = this.specsByPath[ attrPath ];

		if ( spec && spec.fields.connectionPaths && spec.fields.connectionPaths.length > 0 ) {

			// For OpenPBR, try all connection paths; for PreviewSurface, just the first
			const paths = textureGetter === this._getTextureFromOpenPBRConnection
				? spec.fields.connectionPaths
				: [ spec.fields.connectionPaths[ 0 ] ];

			for ( const connPath of paths ) {

				const texture = textureGetter.call( this, connPath );

				if ( texture ) {

					texture.colorSpace = colorSpace;
					material[ textureProperty ] = texture;
					return true;

				}

			}

		}

		if ( fields[ attrName ] !== undefined && valueCallback ) {

			valueCallback( fields[ attrName ] );

		}

		return false;

	}

	_applyPreviewSurface( material, shaderPath ) {

		const fields = this._getAttributes( shaderPath );

		const applyTexture = ( attrName, textureProperty, colorSpace, valueCallback ) => {

			return this._applyTextureOrValue(
				material, shaderPath, fields, attrName, textureProperty, colorSpace, valueCallback,
				this._getTextureFromConnection
			);

		};

		const getAttrSpec = ( attrName ) => {

			const attrPath = shaderPath + '.' + attrName;
			return this.specsByPath[ attrPath ];

		};

		// Diffuse color / base color map
		applyTexture(
			'inputs:diffuseColor',
			'map',
			SRGBColorSpace,
			( color ) => {

				if ( Array.isArray( color ) && color.length >= 3 ) {

					material.color.setRGB( color[ 0 ], color[ 1 ], color[ 2 ], SRGBColorSpace );

				}

			}
		);

		// Apply UsdUVTexture scale to diffuse color (output = texture * scale + bias)
		if ( material.map && material.map.userData.scale ) {

			const scale = material.map.userData.scale;
			if ( Array.isArray( scale ) && scale.length >= 3 ) {

				material.color.setRGB( scale[ 0 ], scale[ 1 ], scale[ 2 ], SRGBColorSpace );

			}

		}

		// Emissive
		applyTexture(
			'inputs:emissiveColor',
			'emissiveMap',
			SRGBColorSpace,
			( color ) => {

				if ( Array.isArray( color ) && color.length >= 3 ) {

					material.emissive.setRGB( color[ 0 ], color[ 1 ], color[ 2 ], SRGBColorSpace );

				}

			}
		);

		if ( material.emissiveMap ) {

			if ( material.emissiveMap.userData.scale ) {

				const scale = material.emissiveMap.userData.scale;
				if ( Array.isArray( scale ) && scale.length >= 3 ) {

					material.emissive.setRGB( scale[ 0 ], scale[ 1 ], scale[ 2 ], SRGBColorSpace );

				}

			} else {

				material.emissive.set( 0xffffff );

			}

		}

		// Normal map
		applyTexture( 'inputs:normal', 'normalMap', NoColorSpace, null );

		// Apply normal map scale from UsdUVTexture scale input
		if ( material.normalMap && material.normalMap.userData.scale ) {

			const scale = material.normalMap.userData.scale;
			// UsdUVTexture scale is float4 (r,g,b,a), use first two components for normalScale
			material.normalScale = new Vector2( scale[ 0 ], scale[ 1 ] );

		}

		// Roughness
		const hasRoughnessMap = applyTexture(
			'inputs:roughness',
			'roughnessMap',
			NoColorSpace,
			( value ) => {

				material.roughness = value;

			}
		);

		if ( hasRoughnessMap ) {

			material.roughness = 1.0;

		}

		// Metallic
		const hasMetalnessMap = applyTexture(
			'inputs:metallic',
			'metalnessMap',
			NoColorSpace,
			( value ) => {

				material.metalness = value;

			}
		);

		if ( hasMetalnessMap ) {

			material.metalness = 1.0;

		}

		// Occlusion
		applyTexture( 'inputs:occlusion', 'aoMap', NoColorSpace, null );

		// IOR
		if ( fields[ 'inputs:ior' ] !== undefined ) {

			material.ior = fields[ 'inputs:ior' ];

		}

		// Specular color
		applyTexture(
			'inputs:specularColor',
			'specularColorMap',
			SRGBColorSpace,
			( color ) => {

				if ( Array.isArray( color ) && color.length >= 3 ) {

					material.specularColor.setRGB( color[ 0 ], color[ 1 ], color[ 2 ], SRGBColorSpace );

				}

			}
		);

		// Apply UsdUVTexture scale to specular color
		if ( material.specularColorMap && material.specularColorMap.userData.scale ) {

			const scale = material.specularColorMap.userData.scale;
			if ( Array.isArray( scale ) && scale.length >= 3 ) {

				material.specularColor.setRGB( scale[ 0 ], scale[ 1 ], scale[ 2 ], SRGBColorSpace );

			}

		}

		// Clearcoat
		if ( fields[ 'inputs:clearcoat' ] !== undefined ) {

			material.clearcoat = fields[ 'inputs:clearcoat' ];

		}

		// Clearcoat roughness
		if ( fields[ 'inputs:clearcoatRoughness' ] !== undefined ) {

			material.clearcoatRoughness = fields[ 'inputs:clearcoatRoughness' ];

		}

		// Opacity and opacity modes
		const opacityThreshold = fields[ 'inputs:opacityThreshold' ] !== undefined ? fields[ 'inputs:opacityThreshold' ] : 0.0;

		// Check if opacity is connected to a texture (e.g., diffuse texture's alpha)
		const opacitySpec = getAttrSpec( 'inputs:opacity' );
		const hasOpacityConnection = opacitySpec?.fields?.connectionPaths?.length > 0;

		if ( hasOpacityConnection ) {

			// Opacity from texture alpha - use the diffuse map's alpha channel
			if ( opacityThreshold > 0 ) {

				// Alpha cutoff mode
				material.alphaTest = opacityThreshold;
				material.transparent = false;

			} else {

				// Alpha blend mode
				material.transparent = true;

			}

		} else {

			// Direct opacity value
			const opacity = fields[ 'inputs:opacity' ] !== undefined ? fields[ 'inputs:opacity' ] : 1.0;

			if ( opacity < 1.0 ) {

				material.transparent = true;
				material.opacity = opacity;

			}

		}

	}

	_applyOpenPBRSurface( material, shaderPath ) {

		const fields = this._getAttributes( shaderPath );

		const applyTexture = ( attrName, textureProperty, colorSpace, valueCallback ) => {

			return this._applyTextureOrValue(
				material, shaderPath, fields, attrName, textureProperty, colorSpace, valueCallback,
				this._getTextureFromOpenPBRConnection
			);

		};

		// Base color (diffuse)
		applyTexture(
			'inputs:base_color',
			'map',
			SRGBColorSpace,
			( color ) => {

				if ( Array.isArray( color ) && color.length >= 3 ) {

					material.color.setRGB( color[ 0 ], color[ 1 ], color[ 2 ], SRGBColorSpace );

				}

			}
		);

		// Apply UsdUVTexture scale to base color
		if ( material.map && material.map.userData.scale ) {

			const scale = material.map.userData.scale;
			if ( Array.isArray( scale ) && scale.length >= 3 ) {

				material.color.setRGB( scale[ 0 ], scale[ 1 ], scale[ 2 ], SRGBColorSpace );

			}

		}

		// Base metalness
		applyTexture(
			'inputs:base_metalness',
			'metalnessMap',
			NoColorSpace,
			( value ) => {

				if ( typeof value === 'number' ) {

					material.metalness = value;

				}

			}
		);

		// Specular roughness
		applyTexture(
			'inputs:specular_roughness',
			'roughnessMap',
			NoColorSpace,
			( value ) => {

				if ( typeof value === 'number' ) {

					material.roughness = value;

				}

			}
		);

		// Emission color
		const hasEmissionMap = applyTexture(
			'inputs:emission_color',
			'emissiveMap',
			SRGBColorSpace,
			( color ) => {

				if ( Array.isArray( color ) && color.length >= 3 ) {

					material.emissive.setRGB( color[ 0 ], color[ 1 ], color[ 2 ], SRGBColorSpace );

				}

			}
		);

		// Emission luminance/weight - multiply emissive by this factor
		const emissionLuminance = fields[ 'inputs:emission_luminance' ];

		if ( emissionLuminance !== undefined && emissionLuminance > 0 ) {

			if ( hasEmissionMap ) {

				material.emissiveIntensity = emissionLuminance;

			} else {

				// Scale the emissive color by luminance
				material.emissive.multiplyScalar( emissionLuminance );

			}

		}

		// Transmission (transparency)
		const transmissionWeight = fields[ 'inputs:transmission_weight' ];

		if ( transmissionWeight !== undefined && transmissionWeight > 0 ) {

			material.transmission = transmissionWeight;

			const transmissionDepth = fields[ 'inputs:transmission_depth' ];

			if ( transmissionDepth !== undefined ) {

				material.thickness = transmissionDepth;

			}

			const transmissionColor = fields[ 'inputs:transmission_color' ];

			if ( transmissionColor !== undefined && Array.isArray( transmissionColor ) ) {

				material.attenuationColor.setRGB( transmissionColor[ 0 ], transmissionColor[ 1 ], transmissionColor[ 2 ] );
				material.attenuationDistance = transmissionDepth || 1.0;

			}

		}

		// Geometry opacity (overall surface opacity)
		const geometryOpacity = fields[ 'inputs:geometry_opacity' ];

		if ( geometryOpacity !== undefined && geometryOpacity < 1.0 ) {

			material.opacity = geometryOpacity;
			material.transparent = true;

		}

		// Specular IOR
		const specularIOR = fields[ 'inputs:specular_ior' ];

		if ( specularIOR !== undefined ) {

			material.ior = specularIOR;

		}

		// Coat (clearcoat)
		const coatWeight = fields[ 'inputs:coat_weight' ];

		if ( coatWeight !== undefined && coatWeight > 0 ) {

			material.clearcoat = coatWeight;

			const coatRoughness = fields[ 'inputs:coat_roughness' ];

			if ( coatRoughness !== undefined ) {

				material.clearcoatRoughness = coatRoughness;

			}

		}

		// Thin film (iridescence)
		const thinFilmWeight = fields[ 'inputs:thin_film_weight' ];

		if ( thinFilmWeight !== undefined && thinFilmWeight > 0 ) {

			material.iridescence = thinFilmWeight;

			const thinFilmIOR = fields[ 'inputs:thin_film_ior' ];

			if ( thinFilmIOR !== undefined ) {

				material.iridescenceIOR = thinFilmIOR;

			}

			const thinFilmThickness = fields[ 'inputs:thin_film_thickness' ];

			if ( thinFilmThickness !== undefined ) {

				// OpenPBR uses micrometers, Three.js uses nanometers
				const thicknessNm = thinFilmThickness * 1000;
				material.iridescenceThicknessRange = [ thicknessNm, thicknessNm ];

			}

		}

		// Specular
		const specularWeight = fields[ 'inputs:specular_weight' ];

		if ( specularWeight !== undefined ) {

			material.specularIntensity = specularWeight;

		}

		const specularColor = fields[ 'inputs:specular_color' ];

		if ( specularColor !== undefined && Array.isArray( specularColor ) ) {

			material.specularColor.setRGB( specularColor[ 0 ], specularColor[ 1 ], specularColor[ 2 ] );

		}

		// Anisotropy
		const anisotropy = fields[ 'inputs:specular_roughness_anisotropy' ];

		if ( anisotropy !== undefined && anisotropy > 0 ) {

			material.anisotropy = anisotropy;

		}

		// Geometry normal (normal map)
		applyTexture(
			'inputs:geometry_normal',
			'normalMap',
			NoColorSpace,
			null
		);

	}

	_getTextureFromOpenPBRConnection( connPath ) {

		// connPath is like /Material/NodeGraph.outputs:baseColor or /Material/Shader.outputs:out
		const cleanPath = connPath.replace( /<|>/g, '' );
		const shaderPath = cleanPath.split( '.' )[ 0 ];
		const shaderSpec = this.specsByPath[ shaderPath ];

		if ( ! shaderSpec ) return null;

		const attrs = this._getAttributes( shaderPath );
		const infoId = attrs[ 'info:id' ] || shaderSpec.fields[ 'info:id' ];
		const typeName = shaderSpec.fields.typeName;

		// Handle NodeGraph - follow output connection to internal shader
		if ( typeName === 'NodeGraph' ) {

			// Get the output attribute that's connected
			const outputName = cleanPath.split( '.' )[ 1 ]; // e.g., "outputs:baseColor"
			const outputAttrPath = shaderPath + '.' + outputName;
			const outputSpec = this.specsByPath[ outputAttrPath ];

			if ( outputSpec?.fields?.connectionPaths?.length > 0 ) {

				// Follow the internal connection
				return this._getTextureFromOpenPBRConnection( outputSpec.fields.connectionPaths[ 0 ] );

			}

			return null;

		}

		// Handle arnold:image - Arnold's texture node
		if ( infoId === 'arnold:image' ) {

			const filePath = attrs[ 'inputs:filename' ];
			if ( ! filePath ) return null;

			return this._loadTextureFromPath( filePath );

		}

		// Handle MaterialX image nodes (ND_image_color4, ND_image_color3, etc.)
		if ( infoId && infoId.startsWith( 'ND_image_' ) ) {

			const filePath = attrs[ 'inputs:file' ];
			if ( ! filePath ) return null;

			return this._loadTextureFromPath( filePath );

		}

		// Handle Maya file texture - follow the inColor connection to the actual image
		if ( infoId === 'MayaND_fileTexture_color4' ) {

			const inColorPath = shaderPath + '.inputs:inColor';
			const inColorSpec = this.specsByPath[ inColorPath ];

			if ( inColorSpec?.fields?.connectionPaths?.length > 0 ) {

				return this._getTextureFromOpenPBRConnection( inColorSpec.fields.connectionPaths[ 0 ] );

			}

			return null;

		}

		// Handle color conversion nodes - follow the input connection
		if ( infoId && infoId.startsWith( 'ND_convert_' ) ) {

			const inPath = shaderPath + '.inputs:in';
			const inSpec = this.specsByPath[ inPath ];

			if ( inSpec?.fields?.connectionPaths?.length > 0 ) {

				return this._getTextureFromOpenPBRConnection( inSpec.fields.connectionPaths[ 0 ] );

			}

			return null;

		}

		// Handle Arnold bump2d - follow the bump_map input
		if ( infoId === 'arnold:bump2d' ) {

			const bumpMapPath = shaderPath + '.inputs:bump_map';
			const bumpMapSpec = this.specsByPath[ bumpMapPath ];

			if ( bumpMapSpec?.fields?.connectionPaths?.length > 0 ) {

				return this._getTextureFromOpenPBRConnection( bumpMapSpec.fields.connectionPaths[ 0 ] );

			}

			return null;

		}

		// Handle Arnold color_correct - follow the input connection
		if ( infoId === 'arnold:color_correct' ) {

			const inputPath = shaderPath + '.inputs:input';
			const inputSpec = this.specsByPath[ inputPath ];

			if ( inputSpec?.fields?.connectionPaths?.length > 0 ) {

				return this._getTextureFromOpenPBRConnection( inputSpec.fields.connectionPaths[ 0 ] );

			}

			return null;

		}

		// Handle nested shader paths (e.g., /Material/file2/cc.outputs:a)
		// Check if parent path is an image node
		const parentPath = shaderPath.substring( 0, shaderPath.lastIndexOf( '/' ) );

		if ( parentPath ) {

			const parentSpec = this.specsByPath[ parentPath ];

			if ( parentSpec ) {

				const parentAttrs = this._getAttributes( parentPath );
				const parentInfoId = parentAttrs[ 'info:id' ] || parentSpec.fields[ 'info:id' ];

				if ( parentInfoId === 'arnold:image' ) {

					const filePath = parentAttrs[ 'inputs:filename' ];
					if ( filePath ) return this._loadTextureFromPath( filePath );

				}

			}

		}

		return null;

	}

	_loadTextureFromPath( filePath ) {

		if ( ! filePath ) return null;

		// Check cache first
		if ( this.textureCache[ filePath ] ) {

			return this.textureCache[ filePath ];

		}

		const texture = this._loadTexture( filePath, null, null );

		if ( texture ) {

			this.textureCache[ filePath ] = texture;

		}

		return texture;

	}

	_getTextureFromConnection( connPath ) {

		// connPath is like /Material/Shader.outputs:rgb
		const shaderPath = connPath.split( '.' )[ 0 ];
		const shaderSpec = this.specsByPath[ shaderPath ];

		if ( ! shaderSpec ) return null;

		const attrs = this._getAttributes( shaderPath );
		const infoId = attrs[ 'info:id' ] || shaderSpec.fields[ 'info:id' ];

		if ( infoId !== 'UsdUVTexture' ) return null;

		const filePath = attrs[ 'inputs:file' ];
		if ( ! filePath ) return null;

		// Check for UsdTransform2d connection via inputs:st and trace to PrimvarReader
		let transformAttrs = null;
		let uvChannel = 0; // Default to first UV set
		const stAttrPath = shaderPath + '.inputs:st';
		const stAttrSpec = this.specsByPath[ stAttrPath ];

		if ( stAttrSpec?.fields?.connectionPaths?.length > 0 ) {

			const stConnPath = stAttrSpec.fields.connectionPaths[ 0 ];
			const stPath = stConnPath.replace( /<|>/g, '' ).split( '.' )[ 0 ];
			const stSpec = this.specsByPath[ stPath ];

			if ( stSpec ) {

				const stAttrs = this._getAttributes( stPath );
				const stInfoId = stAttrs[ 'info:id' ] || stSpec.fields[ 'info:id' ];

				if ( stInfoId === 'UsdTransform2d' ) {

					transformAttrs = stAttrs;

					// Trace to PrimvarReader to find UV set
					const inAttrPath = stPath + '.inputs:in';
					const inAttrSpec = this.specsByPath[ inAttrPath ];

					if ( inAttrSpec?.fields?.connectionPaths?.length > 0 ) {

						const inConnPath = inAttrSpec.fields.connectionPaths[ 0 ];
						const primvarPath = inConnPath.replace( /<|>/g, '' ).split( '.' )[ 0 ];
						const primvarAttrs = this._getAttributes( primvarPath );

						// Check varname to determine UV channel
						const varname = primvarAttrs[ 'inputs:varname' ];
						if ( varname === 'st1' ) uvChannel = 1;
						else if ( varname === 'st2' ) uvChannel = 2;

					}

				} else if ( stInfoId === 'UsdPrimvarReader_float2' ) {

					// Direct connection to PrimvarReader
					const varname = stAttrs[ 'inputs:varname' ];
					if ( varname === 'st1' ) uvChannel = 1;
					else if ( varname === 'st2' ) uvChannel = 2;

				}

			}

		}

		// Extract scale and bias for texture value modification
		const scale = attrs[ 'inputs:scale' ];
		const bias = attrs[ 'inputs:bias' ];

		// Create cache key that includes scale/bias if present
		let cacheKey = filePath;
		if ( scale ) cacheKey += ':s' + scale.join( ',' );
		if ( bias ) cacheKey += ':b' + bias.join( ',' );

		if ( this.textureCache[ cacheKey ] ) {

			return this.textureCache[ cacheKey ];

		}

		const texture = this._loadTexture( filePath, attrs, transformAttrs );

		if ( texture ) {

			// Store scale/bias and UV channel in userData
			if ( scale ) texture.userData.scale = scale;
			if ( bias ) texture.userData.bias = bias;
			if ( uvChannel !== 0 ) texture.channel = uvChannel;

			this.textureCache[ cacheKey ] = texture;

		}

		return texture;

	}

	_applyTextureTransforms( texture, attrs ) {

		if ( ! attrs ) return;

		const scale = attrs[ 'inputs:scale' ];
		if ( scale && Array.isArray( scale ) && scale.length >= 2 ) {

			texture.repeat.set( scale[ 0 ], scale[ 1 ] );

		}

		const translation = attrs[ 'inputs:translation' ];
		if ( translation && Array.isArray( translation ) && translation.length >= 2 ) {

			texture.offset.set( translation[ 0 ], translation[ 1 ] );

		}

		const rotation = attrs[ 'inputs:rotation' ];
		if ( typeof rotation === 'number' ) {

			texture.rotation = rotation * Math.PI / 180;

		}

	}

	_loadTexture( filePath, textureAttrs, transformAttrs ) {

		let cleanPath = filePath;
		if ( cleanPath.startsWith( '@' ) ) cleanPath = cleanPath.slice( 1 );
		if ( cleanPath.endsWith( '@' ) ) cleanPath = cleanPath.slice( 0, - 1 );

		// Resolve relative to basePath first
		const resolvedPath = this._resolveFilePath( cleanPath );
		let assetData = this.assets[ resolvedPath ];

		// Fallback to unresolved path
		if ( ! assetData ) {

			assetData = this.assets[ cleanPath ];

		}

		// Last resort: search by basename
		if ( ! assetData ) {

			const baseName = cleanPath.split( '/' ).pop();

			for ( const key in this.assets ) {

				if ( key.endsWith( baseName ) || key.endsWith( '/' + baseName ) ) {

					return this._createTextureFromData( this.assets[ key ], textureAttrs, transformAttrs );

				}

			}

			// Try loading via LoadingManager if available
			if ( this.manager ) {

				const url = this.manager.resolveURL( baseName );
				if ( url !== baseName ) {

					// URL modifier found a match - load it
					return this._createTextureFromData( url, textureAttrs, transformAttrs );

				}

			}

			console.warn( 'USDLoader: Texture not found:', cleanPath );
			return null;

		}

		return this._createTextureFromData( assetData, textureAttrs, transformAttrs );

	}

	_createTextureFromData( data, textureAttrs, transformAttrs ) {

		if ( ! data ) return null;

		const scope = this;
		const texture = new Texture();

		let url;

		if ( typeof data === 'string' ) {

			url = data;

		} else if ( data instanceof Uint8Array || data instanceof ArrayBuffer ) {

			const blob = new Blob( [ data ] );
			url = URL.createObjectURL( blob );

		} else {

			return null;

		}

		const image = new Image();
		image.onload = function () {

			texture.image = image;

			if ( textureAttrs ) {

				texture.wrapS = scope._getWrapMode( textureAttrs[ 'inputs:wrapS' ] );
				texture.wrapT = scope._getWrapMode( textureAttrs[ 'inputs:wrapT' ] );

			}

			scope._applyTextureTransforms( texture, transformAttrs );
			texture.needsUpdate = true;

			if ( typeof data !== 'string' ) {

				URL.revokeObjectURL( url );

			}

		};
		image.src = url;

		return texture;

	}

	_getWrapMode( wrapValue ) {

		if ( wrapValue === 'repeat' ) return RepeatWrapping;
		if ( wrapValue === 'mirror' ) return MirroredRepeatWrapping;
		if ( wrapValue === 'clamp' ) return ClampToEdgeWrapping;
		return RepeatWrapping;

	}

	// ========================================================================
	// Skeletal Animation
	// ========================================================================

	_buildSkeleton( path ) {

		const attrs = this._getAttributes( path );

		// Get joint names (paths like "root", "root/body_joint", etc.)
		const joints = attrs[ 'joints' ];
		if ( ! joints || joints.length === 0 ) return null;

		// Get bind transforms (world-space bind pose matrices)
		// These can be nested arrays (USDA) or flat arrays (USDC)
		const rawBindTransforms = attrs[ 'bindTransforms' ];
		const rawRestTransforms = attrs[ 'restTransforms' ];

		const bindTransforms = this._flattenMatrixArray( rawBindTransforms, joints.length );
		const restTransforms = this._flattenMatrixArray( rawRestTransforms, joints.length );

		// Build bones
		const bones = [];
		const bonesByPath = {};
		const boneInverses = [];

		for ( let i = 0; i < joints.length; i ++ ) {

			const jointPath = joints[ i ];
			const jointName = jointPath.split( '/' ).pop();

			const bone = new Bone();
			bone.name = jointName;
			bones.push( bone );
			bonesByPath[ jointPath ] = { bone, index: i };

			// Compute inverse bind matrix
			if ( bindTransforms && bindTransforms.length >= ( i + 1 ) * 16 ) {

				const bindMatrix = new Matrix4();
				// USD matrices are row-major, Three.js is column-major - need to transpose
				const m = bindTransforms.slice( i * 16, ( i + 1 ) * 16 );
				bindMatrix.set(
					m[ 0 ], m[ 4 ], m[ 8 ], m[ 12 ],
					m[ 1 ], m[ 5 ], m[ 9 ], m[ 13 ],
					m[ 2 ], m[ 6 ], m[ 10 ], m[ 14 ],
					m[ 3 ], m[ 7 ], m[ 11 ], m[ 15 ]
				);
				const inverseBindMatrix = bindMatrix.clone().invert();
				boneInverses.push( inverseBindMatrix );

			} else {

				boneInverses.push( new Matrix4() );

			}

		}

		// Build parent-child relationships based on joint paths
		for ( let i = 0; i < joints.length; i ++ ) {

			const jointPath = joints[ i ];
			const parts = jointPath.split( '/' );

			if ( parts.length > 1 ) {

				const parentPath = parts.slice( 0, - 1 ).join( '/' );
				const parentData = bonesByPath[ parentPath ];

				if ( parentData ) {

					parentData.bone.add( bones[ i ] );

				}

			}

		}

		// Apply rest transforms to bones (local transforms)
		if ( restTransforms && restTransforms.length >= joints.length * 16 ) {

			for ( let i = 0; i < joints.length; i ++ ) {

				const matrix = new Matrix4();
				// USD matrices are row-major, Three.js is column-major - need to transpose
				const m = restTransforms.slice( i * 16, ( i + 1 ) * 16 );
				matrix.set(
					m[ 0 ], m[ 4 ], m[ 8 ], m[ 12 ],
					m[ 1 ], m[ 5 ], m[ 9 ], m[ 13 ],
					m[ 2 ], m[ 6 ], m[ 10 ], m[ 14 ],
					m[ 3 ], m[ 7 ], m[ 11 ], m[ 15 ]
				);
				matrix.decompose( bones[ i ].position, bones[ i ].quaternion, bones[ i ].scale );

			}

		}

		// Find root bone(s) - bones without a parent bone
		const rootBones = bones.filter( bone => ! bone.parent || ! bone.parent.isBone );

		// Get animation source path
		const animSourceSpec = this.specsByPath[ path + '.skel:animationSource' ];
		let animationPath = null;
		if ( animSourceSpec && animSourceSpec.fields.targetPaths && animSourceSpec.fields.targetPaths.length > 0 ) {

			animationPath = animSourceSpec.fields.targetPaths[ 0 ];

		}

		return {
			skeleton: new Skeleton( bones, boneInverses ),
			joints: joints,
			rootBones: rootBones,
			animationPath: animationPath,
			path: path
		};

	}

	_bindSkeletons() {

		for ( const meshData of this.skinnedMeshes ) {

			const { mesh, skeletonPath, localJoints, geomBindTransform } = meshData;

			let skeletonData = null;

			// Try exact match first
			if ( skeletonPath && this.skeletons[ skeletonPath ] ) {

				skeletonData = this.skeletons[ skeletonPath ];

			}

			// Try includes match as fallback
			if ( ! skeletonData ) {

				for ( const skelPath in this.skeletons ) {

					if ( skeletonPath && ( skeletonPath.includes( skelPath ) || skelPath.includes( skeletonPath ) ) ) {

						skeletonData = this.skeletons[ skelPath ];
						break;

					}

				}

			}

			// Fallback to first skeleton for single-skeleton files
			if ( ! skeletonData ) {

				const skeletonPaths = Object.keys( this.skeletons );
				if ( skeletonPaths.length > 0 ) {

					skeletonData = this.skeletons[ skeletonPaths[ 0 ] ];

				}

			}

			if ( ! skeletonData ) {

				console.warn( 'USDComposer: No skeleton found for skinned mesh', mesh.name );
				continue;

			}

			const { skeleton, rootBones, joints } = skeletonData;

			if ( localJoints && localJoints.length > 0 ) {

				const skinIndex = mesh.geometry.attributes.skinIndex;
				if ( skinIndex ) {

					const localToGlobal = [];
					for ( let i = 0; i < localJoints.length; i ++ ) {

						const jointName = localJoints[ i ];
						const globalIdx = joints.indexOf( jointName );
						localToGlobal[ i ] = globalIdx >= 0 ? globalIdx : 0;

					}

					const arr = skinIndex.array;
					for ( let i = 0; i < arr.length; i ++ ) {

						const localIdx = arr[ i ];
						if ( localIdx < localToGlobal.length ) {

							arr[ i ] = localToGlobal[ localIdx ];

						}

					}

				}

			}

			for ( const rootBone of rootBones ) {

				mesh.add( rootBone );

			}

			// Use geomBindTransform if available, otherwise compute from mesh/skeleton alignment
			let bindMatrix = new Matrix4();

			if ( geomBindTransform && geomBindTransform.length === 16 ) {

				// USD matrices are row-major, Three.js is column-major - need to transpose
				const m = geomBindTransform;
				bindMatrix.set(
					m[ 0 ], m[ 4 ], m[ 8 ], m[ 12 ],
					m[ 1 ], m[ 5 ], m[ 9 ], m[ 13 ],
					m[ 2 ], m[ 6 ], m[ 10 ], m[ 14 ],
					m[ 3 ], m[ 7 ], m[ 11 ], m[ 15 ]
				);

			} else {

				// Compute geomBindTransform by comparing mesh vertices with skeleton bind positions
				bindMatrix = this._computeGeomBindTransform( mesh, skeleton );

			}

			mesh.bind( skeleton, bindMatrix );

		}

	}

	_computeGeomBindTransform( mesh, skeleton ) {

		const bindMatrix = new Matrix4();
		const geometry = mesh.geometry;
		const position = geometry.attributes.position;
		const skinIndex = geometry.attributes.skinIndex;

		if ( ! position || ! skinIndex || position.count === 0 ) {

			return bindMatrix;

		}

		// Sample vertices and their influencing joints to compute average scale
		const boneInverses = skeleton.boneInverses;
		const sampleCount = Math.min( 50, position.count );
		let sumRatioX = 0, sumRatioY = 0, sumRatioZ = 0;
		let validSamples = 0;

		for ( let i = 0; i < sampleCount; i ++ ) {

			const vi = Math.floor( i * position.count / sampleCount );
			const vx = position.getX( vi );
			const vy = position.getY( vi );
			const vz = position.getZ( vi );

			// Get primary joint for this vertex
			const jointIdx = skinIndex.getX( vi );
			if ( jointIdx >= boneInverses.length ) continue;

			// Get joint bind position from inverse bind matrix
			const inverseBindMatrix = boneInverses[ jointIdx ];
			const bindTransform = inverseBindMatrix.clone().invert();
			const jx = bindTransform.elements[ 12 ];
			const jy = bindTransform.elements[ 13 ];
			const jz = bindTransform.elements[ 14 ];

			// Compute ratio if both values are non-zero
			if ( Math.abs( vx ) > 0.001 && Math.abs( jx ) > 0.001 ) {

				sumRatioX += jx / vx;
				sumRatioY += jy / vy;
				sumRatioZ += jz / vz;
				validSamples ++;

			}

		}

		if ( validSamples > 0 ) {

			// Use average scale to create geomBindTransform
			const avgScale = ( sumRatioX + sumRatioY + sumRatioZ ) / ( validSamples * 3 );

			// Only apply if scale is significantly different from 1
			if ( Math.abs( avgScale - 1 ) > 0.1 ) {

				bindMatrix.makeScale( avgScale, avgScale, avgScale );

			}

		}

		return bindMatrix;

	}

	_buildAnimations() {

		const animations = [];

		// Find all SkelAnimation prims
		for ( const path in this.specsByPath ) {

			const spec = this.specsByPath[ path ];
			if ( spec.specType !== SpecType.Prim ) continue;
			if ( spec.fields.typeName !== 'SkelAnimation' ) continue;

			const clip = this._buildAnimationClip( path );
			if ( clip ) {

				animations.push( clip );

			}

		}

		// Build transform animations from time-sampled xformOps
		const transformTracks = this._buildTransformAnimations();
		if ( transformTracks.length > 0 ) {

			animations.push( new AnimationClip( 'TransformAnimation', - 1, transformTracks ) );

		}

		return animations;

	}

	_buildTransformAnimations() {

		const tracks = [];

		for ( const path in this.specsByPath ) {

			const spec = this.specsByPath[ path ];
			if ( spec.specType !== SpecType.Prim ) continue;

			const typeName = spec.fields?.typeName;
			if ( typeName !== 'Xform' && typeName !== 'Scope' && typeName !== 'Mesh' ) continue;

			const objectName = path.split( '/' ).pop();

			// Check for animated xformOp:orient
			const orientPath = path + '.xformOp:orient';
			const orientSpec = this.specsByPath[ orientPath ];
			if ( orientSpec?.fields?.timeSamples ) {

				const { times, values } = orientSpec.fields.timeSamples;
				const keyframeTimes = [];
				const keyframeValues = [];

				for ( let i = 0; i < times.length; i ++ ) {

					keyframeTimes.push( times[ i ] / this.fps );

					const q = values[ i ];
					keyframeValues.push( q[ 0 ], q[ 1 ], q[ 2 ], q[ 3 ] );

				}

				if ( keyframeTimes.length > 0 ) {

					tracks.push( new QuaternionKeyframeTrack(
						objectName + '.quaternion',
						new Float32Array( keyframeTimes ),
						new Float32Array( keyframeValues )
					) );

				}

			}

			// Check for animated xformOp:rotateXYZ
			const rotateXYZPath = path + '.xformOp:rotateXYZ';
			const rotateXYZSpec = this.specsByPath[ rotateXYZPath ];
			if ( rotateXYZSpec?.fields?.timeSamples ) {

				const { times, values } = rotateXYZSpec.fields.timeSamples;
				const keyframeTimes = [];
				const keyframeValues = [];
				const tempEuler = new Euler();
				const tempQuat = new Quaternion();

				for ( let i = 0; i < times.length; i ++ ) {

					keyframeTimes.push( times[ i ] / this.fps );

					const r = values[ i ];
					// USD rotateXYZ: matrix = Rx * Ry * Rz, use 'ZYX' order in Three.js
					tempEuler.set(
						r[ 0 ] * Math.PI / 180,
						r[ 1 ] * Math.PI / 180,
						r[ 2 ] * Math.PI / 180,
						'ZYX'
					);
					tempQuat.setFromEuler( tempEuler );
					keyframeValues.push( tempQuat.x, tempQuat.y, tempQuat.z, tempQuat.w );

				}

				if ( keyframeTimes.length > 0 ) {

					tracks.push( new QuaternionKeyframeTrack(
						objectName + '.quaternion',
						new Float32Array( keyframeTimes ),
						new Float32Array( keyframeValues )
					) );

				}

			}

			// Check for animated xformOp:translate
			const translatePath = path + '.xformOp:translate';
			const translateSpec = this.specsByPath[ translatePath ];
			if ( translateSpec?.fields?.timeSamples ) {

				const { times, values } = translateSpec.fields.timeSamples;
				const keyframeTimes = [];
				const keyframeValues = [];

				for ( let i = 0; i < times.length; i ++ ) {

					keyframeTimes.push( times[ i ] / this.fps );

					const t = values[ i ];
					keyframeValues.push( t[ 0 ], t[ 1 ], t[ 2 ] );

				}

				if ( keyframeTimes.length > 0 ) {

					tracks.push( new VectorKeyframeTrack(
						objectName + '.position',
						new Float32Array( keyframeTimes ),
						new Float32Array( keyframeValues )
					) );

				}

			}

			// Check for animated xformOp:scale
			const scalePath = path + '.xformOp:scale';
			const scaleSpec = this.specsByPath[ scalePath ];
			if ( scaleSpec?.fields?.timeSamples ) {

				const { times, values } = scaleSpec.fields.timeSamples;
				const keyframeTimes = [];
				const keyframeValues = [];

				for ( let i = 0; i < times.length; i ++ ) {

					keyframeTimes.push( times[ i ] / this.fps );

					const s = values[ i ];
					keyframeValues.push( s[ 0 ], s[ 1 ], s[ 2 ] );

				}

				if ( keyframeTimes.length > 0 ) {

					tracks.push( new VectorKeyframeTrack(
						objectName + '.scale',
						new Float32Array( keyframeTimes ),
						new Float32Array( keyframeValues )
					) );

				}

			}

			// Check for animated xformOp:transform (matrix animations)
			// These can have suffixes like xformOp:transform:transform
			const properties = spec.fields?.properties || [];
			for ( const prop of properties ) {

				if ( ! prop.startsWith( 'xformOp:transform' ) ) continue;

				const transformPath = path + '.' + prop;
				const transformSpec = this.specsByPath[ transformPath ];

				if ( ! transformSpec?.fields?.timeSamples ) continue;

				const { times, values } = transformSpec.fields.timeSamples;
				const positionTimes = [];
				const positionValues = [];
				const quaternionTimes = [];
				const quaternionValues = [];
				const scaleTimes = [];
				const scaleValues = [];

				const matrix = new Matrix4();
				const position = new Vector3();
				const quaternion = new Quaternion();
				const scale = new Vector3();

				for ( let i = 0; i < times.length; i ++ ) {

					const m = values[ i ];
					if ( ! m || m.length < 16 ) continue;

					const t = times[ i ] / this.fps;

					// USD matrices are row-major, Three.js is column-major
					matrix.set(
						m[ 0 ], m[ 4 ], m[ 8 ], m[ 12 ],
						m[ 1 ], m[ 5 ], m[ 9 ], m[ 13 ],
						m[ 2 ], m[ 6 ], m[ 10 ], m[ 14 ],
						m[ 3 ], m[ 7 ], m[ 11 ], m[ 15 ]
					);

					matrix.decompose( position, quaternion, scale );

					positionTimes.push( t );
					positionValues.push( position.x, position.y, position.z );

					quaternionTimes.push( t );
					quaternionValues.push( quaternion.x, quaternion.y, quaternion.z, quaternion.w );

					scaleTimes.push( t );
					scaleValues.push( scale.x, scale.y, scale.z );

				}

				if ( positionTimes.length > 0 ) {

					tracks.push( new VectorKeyframeTrack(
						objectName + '.position',
						new Float32Array( positionTimes ),
						new Float32Array( positionValues )
					) );

					tracks.push( new QuaternionKeyframeTrack(
						objectName + '.quaternion',
						new Float32Array( quaternionTimes ),
						new Float32Array( quaternionValues )
					) );

					tracks.push( new VectorKeyframeTrack(
						objectName + '.scale',
						new Float32Array( scaleTimes ),
						new Float32Array( scaleValues )
					) );

				}

				break; // Only process first transform op

			}

		}

		return tracks;

	}

	_buildAnimationClip( path ) {

		const attrs = this._getAttributes( path );
		const joints = attrs[ 'joints' ];

		if ( ! joints || joints.length === 0 ) return null;

		const tracks = [];

		// Get rotation time samples
		const rotationsAttr = this._getTimeSampledAttribute( path, 'rotations' );
		if ( rotationsAttr && rotationsAttr.times && rotationsAttr.values ) {

			const { times, values } = rotationsAttr;

			for ( let jointIdx = 0; jointIdx < joints.length; jointIdx ++ ) {

				const jointName = joints[ jointIdx ].split( '/' ).pop();
				const keyframeTimes = [];
				const keyframeValues = [];

				for ( let t = 0; t < times.length; t ++ ) {

					const quatData = values[ t ];
					if ( ! quatData || quatData.length < ( jointIdx + 1 ) * 4 ) continue;

					keyframeTimes.push( times[ t ] / this.fps );

					// USD GfQuatf stores imaginary (x,y,z) first, then real (w)
					// This matches Three.js quaternion order (x,y,z,w)
					const x = quatData[ jointIdx * 4 + 0 ];
					const y = quatData[ jointIdx * 4 + 1 ];
					const z = quatData[ jointIdx * 4 + 2 ];
					const w = quatData[ jointIdx * 4 + 3 ];
					keyframeValues.push( x, y, z, w );

				}

				if ( keyframeTimes.length > 0 ) {

					tracks.push( new QuaternionKeyframeTrack(
						jointName + '.quaternion',
						new Float32Array( keyframeTimes ),
						new Float32Array( keyframeValues )
					) );

				}

			}

		}

		// Get translation time samples
		const translationsAttr = this._getTimeSampledAttribute( path, 'translations' );
		if ( translationsAttr && translationsAttr.times && translationsAttr.values ) {

			const { times, values } = translationsAttr;

			for ( let jointIdx = 0; jointIdx < joints.length; jointIdx ++ ) {

				const jointName = joints[ jointIdx ].split( '/' ).pop();
				const keyframeTimes = [];
				const keyframeValues = [];

				for ( let t = 0; t < times.length; t ++ ) {

					const transData = values[ t ];
					if ( ! transData || transData.length < ( jointIdx + 1 ) * 3 ) continue;

					keyframeTimes.push( times[ t ] / this.fps );
					keyframeValues.push(
						transData[ jointIdx * 3 + 0 ],
						transData[ jointIdx * 3 + 1 ],
						transData[ jointIdx * 3 + 2 ]
					);

				}

				if ( keyframeTimes.length > 0 ) {

					tracks.push( new VectorKeyframeTrack(
						jointName + '.position',
						new Float32Array( keyframeTimes ),
						new Float32Array( keyframeValues )
					) );

				}

			}

		}

		// Get scale time samples
		const scalesAttr = this._getTimeSampledAttribute( path, 'scales' );
		if ( scalesAttr && scalesAttr.times && scalesAttr.values ) {

			const { times, values } = scalesAttr;

			for ( let jointIdx = 0; jointIdx < joints.length; jointIdx ++ ) {

				const jointName = joints[ jointIdx ].split( '/' ).pop();
				const keyframeTimes = [];
				const keyframeValues = [];

				for ( let t = 0; t < times.length; t ++ ) {

					const scaleData = values[ t ];
					if ( ! scaleData || scaleData.length < ( jointIdx + 1 ) * 3 ) continue;

					keyframeTimes.push( times[ t ] / this.fps );
					keyframeValues.push(
						scaleData[ jointIdx * 3 + 0 ],
						scaleData[ jointIdx * 3 + 1 ],
						scaleData[ jointIdx * 3 + 2 ]
					);

				}

				if ( keyframeTimes.length > 0 ) {

					tracks.push( new VectorKeyframeTrack(
						jointName + '.scale',
						new Float32Array( keyframeTimes ),
						new Float32Array( keyframeValues )
					) );

				}

			}

		}

		if ( tracks.length === 0 ) return null;

		const clipName = path.split( '/' ).pop();
		return new AnimationClip( clipName, - 1, tracks );

	}

	_getTimeSampledAttribute( primPath, attrName ) {

		// Look for the attribute spec with time samples
		const attrPath = primPath + '.' + attrName;
		const attrSpec = this.specsByPath[ attrPath ];

		if ( attrSpec && attrSpec.fields.timeSamples ) {

			const timeSamples = attrSpec.fields.timeSamples;
			if ( timeSamples.times && timeSamples.values ) {

				return timeSamples;

			}

		}

		return null;

	}

	_flattenMatrixArray( matrices, numMatrices ) {

		if ( ! matrices || matrices.length === 0 ) return null;

		if ( typeof matrices[ 0 ] === 'number' ) return matrices;

		const flatArray = [];

		for ( let m = 0; m < numMatrices; m ++ ) {

			for ( let row = 0; row < 4; row ++ ) {

				const rowData = matrices[ m * 4 + row ];

				if ( rowData && rowData.length === 4 ) {

					flatArray.push( rowData[ 0 ], rowData[ 1 ], rowData[ 2 ], rowData[ 3 ] );

				} else {

					flatArray.push( row === 0 ? 1 : 0, row === 1 ? 1 : 0, row === 2 ? 1 : 0, row === 3 ? 1 : 0 );

				}

			}

		}

		return flatArray;

	}

}

export { USDComposer, SpecType };
