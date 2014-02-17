/*!
 *
 * threeoctree.js (r60) / https://github.com/collinhover/threeoctree
 * (sparse) dynamic 3D spatial representation structure for fast searches.
 *
 * @author Collin Hover / http://collinhover.com/
 * based on Dynamic Octree by Piko3D @ http://www.piko3d.com/ and Octree by Marek Pawlowski @ pawlowski.it
 *
 */
 ( function ( THREE ) { "use strict";
	
	/*===================================================

	utility

	=====================================================*/
	
	function isNumber ( n ) {
		return !isNaN( n ) && isFinite( n );
	}
	
	function isArray ( target ) {
		return Object.prototype.toString.call( target ) === '[object Array]';
	}
	
	function toArray ( target ) {
		return target ? ( isArray ( target ) !== true ? [ target ] : target ) : [];
	}
	
	function indexOfValue( array, value ) {
		
		for ( var i = 0, il = array.length; i < il; i++ ) {
			
			if ( array[ i ] === value ) {
				
				return i;
				
			}
			
		}
		
		return -1;
		
	}
	
	function indexOfPropertyWithValue( array, property, value ) {
		
		for ( var i = 0, il = array.length; i < il; i++ ) {
			
			if ( array[ i ][ property ] === value ) {
				
				return i;
				
			}
			
		}
		
		return -1;
		
	}

	/*===================================================

	octree

	=====================================================*/

	THREE.Octree = function ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.tree = this;
		
		// static properties ( modification is not recommended )
		
		this.nodeCount = 0;
		
		this.INDEX_INSIDE_CROSS = -1;
		this.INDEX_OUTSIDE_OFFSET = 2;
		
		this.INDEX_OUTSIDE_POS_X = isNumber( parameters.INDEX_OUTSIDE_POS_X ) ? parameters.INDEX_OUTSIDE_POS_X : 0;
		this.INDEX_OUTSIDE_NEG_X = isNumber( parameters.INDEX_OUTSIDE_NEG_X ) ? parameters.INDEX_OUTSIDE_NEG_X : 1;
		this.INDEX_OUTSIDE_POS_Y = isNumber( parameters.INDEX_OUTSIDE_POS_Y ) ? parameters.INDEX_OUTSIDE_POS_Y : 2;
		this.INDEX_OUTSIDE_NEG_Y = isNumber( parameters.INDEX_OUTSIDE_NEG_Y ) ? parameters.INDEX_OUTSIDE_NEG_Y : 3;
		this.INDEX_OUTSIDE_POS_Z = isNumber( parameters.INDEX_OUTSIDE_POS_Z ) ? parameters.INDEX_OUTSIDE_POS_Z : 4;
		this.INDEX_OUTSIDE_NEG_Z = isNumber( parameters.INDEX_OUTSIDE_NEG_Z ) ? parameters.INDEX_OUTSIDE_NEG_Z : 5;
		
		this.INDEX_OUTSIDE_MAP = [];
		this.INDEX_OUTSIDE_MAP[ this.INDEX_OUTSIDE_POS_X ] = { index: this.INDEX_OUTSIDE_POS_X, count: 0, x: 1, y: 0, z: 0 };
		this.INDEX_OUTSIDE_MAP[ this.INDEX_OUTSIDE_NEG_X ] = { index: this.INDEX_OUTSIDE_NEG_X, count: 0, x: -1, y: 0, z: 0 };
		this.INDEX_OUTSIDE_MAP[ this.INDEX_OUTSIDE_POS_Y ] = { index: this.INDEX_OUTSIDE_POS_Y, count: 0, x: 0, y: 1, z: 0 };
		this.INDEX_OUTSIDE_MAP[ this.INDEX_OUTSIDE_NEG_Y ] = { index: this.INDEX_OUTSIDE_NEG_Y, count: 0, x: 0, y: -1, z: 0 };
		this.INDEX_OUTSIDE_MAP[ this.INDEX_OUTSIDE_POS_Z ] = { index: this.INDEX_OUTSIDE_POS_Z, count: 0, x: 0, y: 0, z: 1 };
		this.INDEX_OUTSIDE_MAP[ this.INDEX_OUTSIDE_NEG_Z ] = { index: this.INDEX_OUTSIDE_NEG_Z, count: 0, x: 0, y: 0, z: -1 };
		
		this.FLAG_POS_X = 1 << ( this.INDEX_OUTSIDE_POS_X + 1 );
		this.FLAG_NEG_X = 1 << ( this.INDEX_OUTSIDE_NEG_X + 1 );
		this.FLAG_POS_Y = 1 << ( this.INDEX_OUTSIDE_POS_Y + 1 );
		this.FLAG_NEG_Y = 1 << ( this.INDEX_OUTSIDE_NEG_Y + 1 );
		this.FLAG_POS_Z = 1 << ( this.INDEX_OUTSIDE_POS_Z + 1 );
		this.FLAG_NEG_Z = 1 << ( this.INDEX_OUTSIDE_NEG_Z + 1 );
		
		this.utilVec31Search = new THREE.Vector3();
		this.utilVec32Search = new THREE.Vector3();
		
		// pass scene to see octree structure
		
		this.scene = parameters.scene;
		
		if ( this.scene ) {
			
			this.visualGeometry = new THREE.BoxGeometry( 1, 1, 1 );
			this.visualMaterial = new THREE.MeshBasicMaterial( { color: 0xFF0066, wireframe: true, wireframeLinewidth: 1 } );
			
		}
		
		// properties
		
		this.objects = [];
		this.objectsMap = {};
		this.objectsData = [];
		this.objectsDeferred = [];
		
		this.depthMax = isNumber( parameters.depthMax ) ? parameters.depthMax : Infinity;
		this.objectsThreshold = isNumber( parameters.objectsThreshold ) ? parameters.objectsThreshold : 8;
		this.overlapPct = isNumber( parameters.overlapPct ) ? parameters.overlapPct : 0.15;
		this.undeferred = parameters.undeferred || false;
		
		this.root = parameters.root instanceof THREE.OctreeNode ? parameters.root : new THREE.OctreeNode( parameters );
		
	};

	THREE.Octree.prototype = {
		
		update: function () {
			
			// add any deferred objects that were waiting for render cycle
			
			if ( this.objectsDeferred.length > 0 ) {
				
				for ( var i = 0, il = this.objectsDeferred.length; i < il; i++ ) {
					
					var deferred = this.objectsDeferred[ i ];
					
					this.addDeferred( deferred.object, deferred.options );
					
				}
				
				this.objectsDeferred.length = 0;
				
			}
			
		},
		
		add: function ( object, options ) {
			
			// add immediately
			
			if ( this.undeferred ) {
				
				this.updateObject( object );
				
				this.addDeferred( object, options );
				
			} else {
				
				// defer add until update called
				
				this.objectsDeferred.push( { object: object, options: options } );
				
			}
			
		},
		
		addDeferred: function ( object, options ) {
			
			var i, l,
				geometry,
				faces,
				useFaces,
				vertices,
				useVertices,
				objectData;
			
			// ensure object is not object data
			
			if ( object instanceof THREE.OctreeObjectData ) {
				
				object = object.object;
				
			}
			
			// check uuid to avoid duplicates
			
			if ( !object.uuid ) {
				
				object.uuid = THREE.Math.generateUUID();
				
			}
			
			if ( !this.objectsMap[ object.uuid ] ) {
				
				// store
				
				this.objects.push( object );
				this.objectsMap[ object.uuid ] = object;
				
				// check options
				
				if ( options ) {
					
					useFaces = options.useFaces;
					useVertices = options.useVertices;
					
				}
				
				if ( useVertices === true ) {
					
					geometry = object.geometry;
					vertices = geometry.vertices;
					
					for ( i = 0, l = vertices.length; i < l; i++ ) {
						
						this.addObjectData( object, vertices[ i ] );
						
					}
					
				} else if ( useFaces === true ) {
					
					geometry = object.geometry;
					faces = geometry.faces;
					
					for ( i = 0, l = faces.length; i < l; i++ ) {
						
						this.addObjectData( object, faces[ i ] );
						
					}
					
				} else {
					
					this.addObjectData( object );
					
				}
				
			}
			
		},
		
		addObjectData: function ( object, part ) {
			
			var objectData = new THREE.OctreeObjectData( object, part );
			
			// add to tree objects data list
			
			this.objectsData.push( objectData );
			
			// add to nodes
			
			this.root.addObject( objectData );
			
		},
		
		remove: function ( object ) {
			
			var i, l,
				objectData = object,
				index,
				objectsDataRemoved;
			
			// ensure object is not object data for index search
			
			if ( object instanceof THREE.OctreeObjectData ) {
				
				object = object.object;
				
			}
			
			// check uuid
			
			if ( this.objectsMap[ object.uuid ] ) {
				
				this.objectsMap[ object.uuid ] = undefined;
				
				// check and remove from objects, nodes, and data lists
				
				index = indexOfValue( this.objects, object );
				
				if ( index !== -1 ) {
					
					this.objects.splice( index, 1 );
					
					// remove from nodes
					
					objectsDataRemoved = this.root.removeObject( objectData );
					
					// remove from objects data list
					
					for ( i = 0, l = objectsDataRemoved.length; i < l; i++ ) {
						
						objectData = objectsDataRemoved[ i ];
						
						index = indexOfValue( this.objectsData, objectData );
						
						if ( index !== -1 ) {
							
							this.objectsData.splice( index, 1 );
							
						}
						
					}
					
				}
				
			} else if ( this.objectsDeferred.length > 0 ) {
				
				// check and remove from deferred
				
				index = indexOfPropertyWithValue( this.objectsDeferred, 'object', object );
				
				if ( index !== -1 ) {
					
					this.objectsDeferred.splice( index, 1 );
					
				}
				
			}
			
		},
		
		extend: function ( octree ) {
			
			var i, l,
				objectsData,
				objectData;
				
			if ( octree instanceof THREE.Octree ) {
				
				// for each object data
				
				objectsData = octree.objectsData;
				
				for ( i = 0, l = objectsData.length; i < l; i++ ) {
					
					objectData = objectsData[ i ];
					
					this.add( objectData, { useFaces: objectData.faces, useVertices: objectData.vertices } );
					
				}
				
			}
			
		},
		
		rebuild: function () {
			
			var i, l,
				node,
				object,
				objectData,
				indexOctant,
				indexOctantLast,
				objectsUpdate = [];
			
			// check all object data for changes in position
			// assumes all object matrices are up to date
			
			for ( i = 0, l = this.objectsData.length; i < l; i++ ) {
				
				objectData = this.objectsData[ i ];
				
				node = objectData.node;
				
				// update object
				
				objectData.update();
				
				// if position has changed since last organization of object in tree
				
				if ( node instanceof THREE.OctreeNode && !objectData.positionLast.equals( objectData.position ) ) {
					
					// get octant index of object within current node
					
					indexOctantLast = objectData.indexOctant;
					
					indexOctant = node.getOctantIndex( objectData );
					
					// if object octant index has changed
					
					if ( indexOctant !== indexOctantLast ) {
						
						// add to update list
						
						objectsUpdate.push( objectData );
						
					}
					
				}
				
			}
			
			// update changed objects
			
			for ( i = 0, l = objectsUpdate.length; i < l; i++ ) {
				
				objectData = objectsUpdate[ i ];
				
				// remove object from current node
				
				objectData.node.removeObject( objectData );
				
				// add object to tree root
				
				this.root.addObject( objectData );
				
			}
			
		},
		
		updateObject: function ( object ) {
			
			var i, l,
				parentCascade = [ object ],
				parent,
				parentUpdate;
			
			// search all parents between object and root for world matrix update
			
			parent = object.parent;
			
			while( parent ) {
				
				parentCascade.push( parent );
				parent = parent.parent;
				
			}
			
			for ( i = 0, l = parentCascade.length; i < l; i++ ) {
				
				parent = parentCascade[ i ];
				
				if ( parent.matrixWorldNeedsUpdate === true ) {
					
					parentUpdate = parent;
					
				}
				
			}
			
			// update world matrix starting at uppermost parent that needs update
			
			if ( typeof parentUpdate !== 'undefined' ) {
				
				parentUpdate.updateMatrixWorld();
				
			}
			
		},
		
		search: function ( position, radius, organizeByObject, direction ) {
			
			var i, l,
				node,
				objects,
				objectData,
				object,
				results,
				resultData,
				resultsObjectsIndices,
				resultObjectIndex,
				directionPct;
			
			// add root objects
			
			objects = [].concat( this.root.objects );
			
			// ensure radius (i.e. distance of ray) is a number
			
			if ( !( radius > 0 ) ) {
				
				radius = Number.MAX_VALUE;
				
			}
			
			// if direction passed, normalize and find pct
			
			if ( direction instanceof THREE.Vector3 ) {
				
				direction = this.utilVec31Search.copy( direction ).normalize();
				directionPct = this.utilVec32Search.set( 1, 1, 1 ).divide( direction );
				
			}
			
			// search each node of root
			
			for ( i = 0, l = this.root.nodesIndices.length; i < l; i++ ) {
				
				node = this.root.nodesByIndex[ this.root.nodesIndices[ i ] ];
				
				objects = node.search( position, radius, objects, direction, directionPct );
				
			}
			
			// if should organize results by object
			
			if ( organizeByObject === true ) {
				
				results = [];
				resultsObjectsIndices = [];
				
				// for each object data found
				
				for ( i = 0, l = objects.length; i < l; i++ ) {
					
					objectData = objects[ i ];
					object = objectData.object;
					
					resultObjectIndex = indexOfValue( resultsObjectsIndices, object );
					
					// if needed, create new result data
					
					if ( resultObjectIndex === -1 ) {
						
						resultData = {
							object: object,
							faces: [],
							vertices: []
						};
						
						results.push( resultData );
						
						resultsObjectsIndices.push( object );
						
					} else {
						
						resultData = results[ resultObjectIndex ];
						
					}
					
					// object data has faces or vertices, add to list
					
					if ( objectData.faces ) {
						
						resultData.faces.push( objectData.faces );
						
					} else if ( objectData.vertices ) {
						
						resultData.vertices.push( objectData.vertices );
						
					}
					
				}
				
			} else {
				
				results = objects;
				
			}
			
			return results;
			
		},
		
		setRoot: function ( root ) { 
			
			if ( root instanceof THREE.OctreeNode ) {
				
				// store new root
				
				this.root = root;
				
				// update properties
				
				this.root.updateProperties();
				
			}
			
		},
		
		getDepthEnd: function () {
			
			return this.root.getDepthEnd();
			
		},
		
		getNodeCountEnd: function () {
			
			return this.root.getNodeCountEnd();
			
		},
		
		getObjectCountEnd: function () {
			
			return this.root.getObjectCountEnd();
			
		},
		
		toConsole: function () {
			
			this.root.toConsole();
			
		}
		
	};

	/*===================================================

	object data

	=====================================================*/

	THREE.OctreeObjectData = function ( object, part ) {
		
		// properties
		
		this.object = object;
		
		// handle part by type
		
		if ( part instanceof THREE.Face3 ) {
			
			this.faces = part;
			this.face3 = true;
			this.utilVec31FaceBounds = new THREE.Vector3();
			
		} else if ( part instanceof THREE.Face4 ) {
			
			this.face4 = true;
			this.faces = part;
			this.utilVec31FaceBounds = new THREE.Vector3();
			
		} else if ( part instanceof THREE.Vector3 ) {
			
			this.vertices = part;
			
		}
		
		this.radius = 0;
		this.position = new THREE.Vector3();
			
		// initial update
		
		if ( this.object instanceof THREE.Object3D ) {
			
			this.update();
			
		}
		
		this.positionLast = this.position.clone();
		
	};

	THREE.OctreeObjectData.prototype = {
		
		update: function () {
			
			if ( this.face3 ) {
				
				this.radius = this.getFace3BoundingRadius( this.object, this.faces );
				this.position.copy( this.faces.centroid ).applyMatrix4( this.object.matrixWorld );
				
			} else if ( this.face4 ) {
				
				this.radius = this.getFace4BoundingRadius( this.object, this.faces );
				this.position.copy( this.faces.centroid ).applyMatrix4( this.object.matrixWorld );
				
			} else if ( this.vertices ) {
				
				this.radius = this.object.material.size || 1;
				this.position.copy( this.vertices ).applyMatrix4( this.object.matrixWorld );
				
			} else {
				
				if ( this.object.geometry ) {
					
					if ( this.object.geometry.boundingSphere === null ) {
						
						this.object.geometry.computeBoundingSphere();
						
					}
					
					this.radius = this.object.geometry.boundingSphere.radius;
					this.position.copy( this.object.geometry.boundingSphere.center ).applyMatrix4( this.object.matrixWorld );
					
				} else {
					
					this.radius = this.object.boundRadius;
					this.position.setFromMatrixPosition( this.object.matrixWorld );
					
				}
				
			}
			
			this.radius = this.radius * Math.max( this.object.scale.x, this.object.scale.y, this.object.scale.z );
			
		},
		
		getFace3BoundingRadius: function ( object, face ) {
			
			var geometry = object.geometry || object,
				vertices = geometry.vertices,
				centroid = face.centroid,
				va = vertices[ face.a ], vb = vertices[ face.b ], vc = vertices[ face.c ],
				centroidToVert = this.utilVec31FaceBounds,
				radius;
				
			centroid.addVectors( va, vb ).add( vc ).divideScalar( 3 );
			radius = Math.max( centroidToVert.subVectors( centroid, va ).length(), centroidToVert.subVectors( centroid, vb ).length(), centroidToVert.subVectors( centroid, vc ).length() );
			
			return radius;
			
		},
		
		getFace4BoundingRadius: function ( object, face ) {
			
			var geometry = object.geometry || object,
				vertices = geometry.vertices,
				centroid = face.centroid,
				va = vertices[ face.a ], vb = vertices[ face.b ], vc = vertices[ face.c ], vd = vertices[ face.d ],
				centroidToVert = this.utilVec31FaceBounds,
				radius;
				
			centroid.addVectors( va, vb ).add( vc ).add( vd ).divideScalar( 4 );
			radius = Math.max( centroidToVert.subVectors( centroid, va ).length(), centroidToVert.subVectors( centroid, vb ).length(), centroidToVert.subVectors( centroid, vc ).length(), centroidToVert.subVectors( centroid, vd ).length() );
			
			return radius;
			
		}
		
	};

	/*===================================================

	node

	=====================================================*/

	THREE.OctreeNode = function ( parameters ) {
		
		// utility
		
		this.utilVec31Branch = new THREE.Vector3();
		this.utilVec31Expand = new THREE.Vector3();
		this.utilVec31Ray = new THREE.Vector3();
		
		// handle parameters
		
		parameters = parameters || {};
		
		// store or create tree
		
		if ( parameters.tree instanceof THREE.Octree ) {
			
			this.tree = parameters.tree;
			
		} else if ( parameters.parent instanceof THREE.OctreeNode !== true ) {
			
			parameters.root = this;
			
			this.tree = new THREE.Octree( parameters );
			
		}
		
		// basic properties
		
		this.id = this.tree.nodeCount++;
		this.position = parameters.position instanceof THREE.Vector3 ? parameters.position : new THREE.Vector3();
		this.radius = parameters.radius > 0 ? parameters.radius : 1;
		this.indexOctant = parameters.indexOctant;
		this.depth = 0;
		
		// reset and assign parent
		
		this.reset();
		this.setParent( parameters.parent );
		
		// additional properties
		
		this.overlap = this.radius * this.tree.overlapPct;
		this.radiusOverlap = this.radius + this.overlap;
		this.left = this.position.x - this.radiusOverlap;
		this.right = this.position.x + this.radiusOverlap;
		this.bottom = this.position.y - this.radiusOverlap;
		this.top = this.position.y + this.radiusOverlap;
		this.back = this.position.z - this.radiusOverlap;
		this.front = this.position.z + this.radiusOverlap;
		
		// visual
		
		if ( this.tree.scene ) {
			
			this.visual = new THREE.Mesh( this.tree.visualGeometry, this.tree.visualMaterial );
			this.visual.scale.set( this.radiusOverlap * 2, this.radiusOverlap * 2, this.radiusOverlap * 2 );
			this.visual.position.copy( this.position );
			this.tree.scene.add( this.visual );
			
		}
		
	};

	THREE.OctreeNode.prototype = {
		
		setParent: function ( parent ) {
			
			// store new parent
			
			if ( parent !== this && this.parent !== parent ) {
				
				this.parent = parent;
				
				// update properties
				
				this.updateProperties();
				
			}
			
		},
		
		updateProperties: function () {
			
			var i, l;
			
			// properties
			
			if ( this.parent instanceof THREE.OctreeNode ) {
				
				this.tree = this.parent.tree;
				this.depth = this.parent.depth + 1;
				
			} else {
				
				this.depth = 0;
				
			}
			
			// cascade
			
			for ( i = 0, l = this.nodesIndices.length; i < l; i++ ) {
				
				this.nodesByIndex[ this.nodesIndices[ i ] ].updateProperties();
				
			}
			
		},
		
		reset: function ( cascade, removeVisual ) {
			
			var i, l,
				node,
				nodesIndices = this.nodesIndices || [],
				nodesByIndex = this.nodesByIndex;
			
			this.objects = [];
			this.nodesIndices = [];
			this.nodesByIndex = {};
			
			// unset parent in nodes
			
			for ( i = 0, l = nodesIndices.length; i < l; i++ ) {
				
				node = nodesByIndex[ nodesIndices[ i ] ];
				
				node.setParent( undefined );
				
				if ( cascade === true ) {
					
					node.reset( cascade, removeVisual );
					
				}
				
			}
			
			// visual
			
			if ( removeVisual === true && this.visual && this.visual.parent ) {
				
				this.visual.parent.remove( this.visual );
				
			}
			
		},
		
		addNode: function ( node, indexOctant ) {
			
			node.indexOctant = indexOctant;
			
			if ( indexOfValue( this.nodesIndices, indexOctant ) === -1 ) {
				
				this.nodesIndices.push( indexOctant );
				
			}
			
			this.nodesByIndex[ indexOctant ] = node;
			
			if ( node.parent !== this ) {
				
				node.setParent( this );
				
			}
			
		},
		
		removeNode: function ( indexOctant ) {
			
			var index,
				node;
				
			index = indexOfValue( this.nodesIndices, indexOctant );
			
			this.nodesIndices.splice( index, 1 );
			
			node = node || this.nodesByIndex[ indexOctant ];
			
			delete this.nodesByIndex[ indexOctant ];
			
			if ( node.parent === this ) {
				
				node.setParent( undefined );
				
			}
			
		},
		
		addObject: function ( object ) {
			
			var index,
				indexOctant,
				node;
			
			// get object octant index
			
			indexOctant = this.getOctantIndex( object );
			
			// if object fully contained by an octant, add to subtree
			if ( indexOctant > -1 && this.nodesIndices.length > 0 ) {
				
				node = this.branch( indexOctant );
				
				node.addObject( object );
				
			} else if ( indexOctant < -1 && this.parent instanceof THREE.OctreeNode ) {
				
				// if object lies outside bounds, add to parent node
				
				this.parent.addObject( object );
				
			} else {
				
				// add to this objects list
				
				index = indexOfValue( this.objects, object );
				
				if ( index === -1 ) {
					
					this.objects.push( object );
					
				}
				
				// node reference
				
				object.node = this;
				
				// check if need to expand, split, or both
				
				this.checkGrow();
				
			}
			
		},
		
		addObjectWithoutCheck: function ( objects ) {
			
			var i, l,
				object;

			for ( i = 0, l = objects.length; i < l; i++ ) {
				
				object = objects[ i ];
				
				this.objects.push( object );
				
				object.node = this;
				
			}
			
		},
		
		removeObject: function ( object ) {
			
			var i, l,
				nodesRemovedFrom,
				removeData;
			
			// cascade through tree to find and remove object
			
			removeData = this.removeObjectRecursive( object, { searchComplete: false, nodesRemovedFrom: [], objectsDataRemoved: [] } );
			
			// if object removed, try to shrink the nodes it was removed from
			
			nodesRemovedFrom = removeData.nodesRemovedFrom;
			
			if ( nodesRemovedFrom.length > 0 ) {
				
				for ( i = 0, l = nodesRemovedFrom.length; i < l; i++ ) {
					
					nodesRemovedFrom[ i ].shrink();
					
				}
				
			}
			
			return removeData.objectsDataRemoved;
			
		},
		
		removeObjectRecursive: function ( object, removeData ) {
			
			var i, l,
				index = -1,
				objectData,
				node,
				objectRemoved;
			
			// find index of object in objects list
			
			// search and remove object data (fast)
			if ( object instanceof THREE.OctreeObjectData ) {
				
				// remove from this objects list
				
				index = indexOfValue( this.objects, object );
				
				if ( index !== -1 ) {
					
					this.objects.splice( index, 1 );
					object.node = undefined;
					
					removeData.objectsDataRemoved.push( object );
					
					removeData.searchComplete = objectRemoved = true;
					
				}
				
			} else {
			
				// search each object data for object and remove (slow)
				
				for ( i = this.objects.length - 1; i >= 0; i-- ) {
					
					objectData = this.objects[ i ];
					
					if ( objectData.object === object ) {
						
						this.objects.splice( i, 1 );
						objectData.node = undefined;
						
						removeData.objectsDataRemoved.push( objectData );
						
						objectRemoved = true;
						
						if ( !objectData.faces && !objectData.vertices ) {
							
							removeData.searchComplete = true;
							break;
							
						}
						
					}
					
				}
				
			}
			
			// if object data removed and this is not on nodes removed from
			
			if ( objectRemoved === true ) {
				
				removeData.nodesRemovedFrom.push( this );
				
			}
			
			// if search not complete, search nodes
			
			if ( removeData.searchComplete !== true ) {
				
				for ( i = 0, l = this.nodesIndices.length; i < l; i++ ) {
					
					node = this.nodesByIndex[ this.nodesIndices[ i ] ];
					
					// try removing object from node
					
					removeData = node.removeObjectRecursive( object, removeData );
					
					if ( removeData.searchComplete === true ) {
						
						break;
						
					}
					
				}
				
			}
			
			return removeData;
			
		},
		
		checkGrow: function () {
			
			// if object count above max
			
			if ( this.objects.length > this.tree.objectsThreshold && this.tree.objectsThreshold > 0 ) {
				
				this.grow();
				
			}
			
		},
		
		grow: function () {
			
			var indexOctant,
				object,
				objectsExpand = [],
				objectsExpandOctants = [],
				objectsSplit = [],
				objectsSplitOctants = [],
				objectsRemaining = [],
				i, l;
			
			// for each object
			
			for ( i = 0, l = this.objects.length; i < l; i++ ) {
				
				object = this.objects[ i ];
				
				// get object octant index
				
				indexOctant = this.getOctantIndex( object );
				
				// if lies within octant
				if ( indexOctant > -1 ) {
					
					objectsSplit.push( object );
					objectsSplitOctants.push( indexOctant );
				
				} else if ( indexOctant < -1 ) {
					
					// lies outside radius
					
					objectsExpand.push( object );
					objectsExpandOctants.push( indexOctant );
					
				} else {
				
					// lies across bounds between octants
					
					objectsRemaining.push( object );
					
				}
				
			}
			
			// if has objects to split
			
			if ( objectsSplit.length > 0) {
				
				objectsRemaining = objectsRemaining.concat( this.split( objectsSplit, objectsSplitOctants ) );
				
			}
			
			// if has objects to expand
			
			if ( objectsExpand.length > 0) {
				
				objectsRemaining = objectsRemaining.concat( this.expand( objectsExpand, objectsExpandOctants ) );
				
			}
			
			// store remaining
			
			this.objects = objectsRemaining;
			
			// merge check
			
			this.checkMerge();
			
		},
		
		split: function ( objects, octants ) {
			
			var i, l,
				indexOctant,
				object,
				node,
				objectsRemaining;
			
			// if not at max depth
			
			if ( this.depth < this.tree.depthMax ) {
				
				objects = objects || this.objects;
				
				octants = octants || [];
				
				objectsRemaining = [];
				
				// for each object
				
				for ( i = 0, l = objects.length; i < l; i++ ) {
					
					object = objects[ i ];
					
					// get object octant index
					
					indexOctant = octants[ i ];
					
					// if object contained by octant, branch this tree
					
					if ( indexOctant > -1 ) {
						
						node = this.branch( indexOctant );
						
						node.addObject( object );
						
					} else {
						
						objectsRemaining.push( object );
						
					}
					
				}
				
				// if all objects, set remaining as new objects
				
				if ( objects === this.objects ) {
					
					this.objects = objectsRemaining;
					
				}
				
			} else {
				
				objectsRemaining = this.objects;
				
			}
			
			return objectsRemaining;
			
		},
		
		branch: function ( indexOctant ) {
			
			var node,
				overlap,
				radius,
				radiusOffset,
				offset,
				position;
			
			// node exists
			
			if ( this.nodesByIndex[ indexOctant ] instanceof THREE.OctreeNode ) {
				
				node = this.nodesByIndex[ indexOctant ];
				
			} else {
				
				// properties
				
				radius = ( this.radiusOverlap ) * 0.5;
				overlap = radius * this.tree.overlapPct;
				radiusOffset = radius - overlap;
				offset = this.utilVec31Branch.set( indexOctant & 1 ? radiusOffset : -radiusOffset, indexOctant & 2 ? radiusOffset : -radiusOffset, indexOctant & 4 ? radiusOffset : -radiusOffset );
				position = new THREE.Vector3().addVectors( this.position, offset );
				
				// node
				
				node = new THREE.OctreeNode( {
					tree: this.tree,
					parent: this,
					position: position,
					radius: radius,
					indexOctant: indexOctant
				} );
				
				// store
				
				this.addNode( node, indexOctant );
			
			}
			
			return node;
			
		},
		
		expand: function ( objects, octants ) {
			
			var i, l,
				object,
				objectsRemaining,
				objectsExpand,
				indexOctant,
				flagsOutside,
				indexOutside,
				indexOctantInverse,
				iom = this.tree.INDEX_OUTSIDE_MAP,
				indexOutsideCounts,
				infoIndexOutside1,
				infoIndexOutside2,
				infoIndexOutside3,
				indexOutsideBitwise1,
				indexOutsideBitwise2,
				infoPotential1,
				infoPotential2,
				infoPotential3,
				indexPotentialBitwise1,
				indexPotentialBitwise2,
				octantX, octantY, octantZ,
				overlap,
				radius,
				radiusOffset,
				radiusParent,
				overlapParent,
				offset = this.utilVec31Expand,
				position,
				parent;
			
			// handle max depth down tree
			
			if ( this.tree.root.getDepthEnd() < this.tree.depthMax ) {
				
				objects = objects || this.objects;
				octants = octants || [];
				
				objectsRemaining = [];
				objectsExpand = [];
				
				// reset counts
				
				for ( i = 0, l = iom.length; i < l; i++ ) {
					
					iom[ i ].count = 0;
					
				}
				
				// for all outside objects, find outside octants containing most objects
				
				for ( i = 0, l = objects.length; i < l; i++ ) {
					
					object = objects[ i ];
					
					// get object octant index
					
					indexOctant = octants[ i ] ;
					
					// if object outside this, include in calculations
					
					if ( indexOctant < -1 ) {
						
						// convert octant index to outside flags
						
						flagsOutside = -indexOctant - this.tree.INDEX_OUTSIDE_OFFSET;
						
						// check against bitwise flags
						
						// x
						
						if ( flagsOutside & this.tree.FLAG_POS_X ) {
							
							iom[ this.tree.INDEX_OUTSIDE_POS_X ].count++;
							
						} else if ( flagsOutside & this.tree.FLAG_NEG_X ) {
							
							iom[ this.tree.INDEX_OUTSIDE_NEG_X ].count++;
							
						}
						
						// y
						
						if ( flagsOutside & this.tree.FLAG_POS_Y ) {
							
							iom[ this.tree.INDEX_OUTSIDE_POS_Y ].count++;
							
						} else if ( flagsOutside & this.tree.FLAG_NEG_Y ) {
							
							iom[ this.tree.INDEX_OUTSIDE_NEG_Y ].count++;
							
						}
						
						// z
						
						if ( flagsOutside & this.tree.FLAG_POS_Z ) {
							
							iom[ this.tree.INDEX_OUTSIDE_POS_Z ].count++;
							
						} else if ( flagsOutside & this.tree.FLAG_NEG_Z ) {
							
							iom[ this.tree.INDEX_OUTSIDE_NEG_Z ].count++;
							
						}
						
						// store in expand list
						
						objectsExpand.push( object );
						
					} else {
						
						objectsRemaining.push( object );
						
					}
					
				}
				
				// if objects to expand
				
				if ( objectsExpand.length > 0 ) {
					
					// shallow copy index outside map
					
					indexOutsideCounts = iom.slice( 0 );
					
					// sort outside index count so highest is first
					
					indexOutsideCounts.sort( function ( a, b ) {
						
						return b.count - a.count;
						
					} );
					
					// get highest outside indices
					
					// first is first
					infoIndexOutside1 = indexOutsideCounts[ 0 ];
					indexOutsideBitwise1 = infoIndexOutside1.index | 1;
					
					// second is ( one of next two bitwise OR 1 ) that is not opposite of ( first bitwise OR 1 )
					
					infoPotential1 = indexOutsideCounts[ 1 ];
					infoPotential2 = indexOutsideCounts[ 2 ];
					
					infoIndexOutside2 = ( infoPotential1.index | 1 ) !== indexOutsideBitwise1 ? infoPotential1 : infoPotential2;
					indexOutsideBitwise2 = infoIndexOutside2.index | 1;
					
					// third is ( one of next three bitwise OR 1 ) that is not opposite of ( first or second bitwise OR 1 )
					
					infoPotential1 = indexOutsideCounts[ 2 ];
					infoPotential2 = indexOutsideCounts[ 3 ];
					infoPotential3 = indexOutsideCounts[ 4 ];
					
					indexPotentialBitwise1 = infoPotential1.index | 1;
					indexPotentialBitwise2 = infoPotential2.index | 1;
					
					infoIndexOutside3 = indexPotentialBitwise1 !== indexOutsideBitwise1 && indexPotentialBitwise1 !== indexOutsideBitwise2 ? infoPotential1 : indexPotentialBitwise2 !== indexOutsideBitwise1 && indexPotentialBitwise2 !== indexOutsideBitwise2 ? infoPotential2 : infoPotential3;
					
					// get this octant normal based on outside octant indices
					
					octantX = infoIndexOutside1.x + infoIndexOutside2.x + infoIndexOutside3.x;
					octantY = infoIndexOutside1.y + infoIndexOutside2.y + infoIndexOutside3.y;
					octantZ = infoIndexOutside1.z + infoIndexOutside2.z + infoIndexOutside3.z;
					
					// get this octant indices based on octant normal
					
					indexOctant = this.getOctantIndexFromPosition( octantX, octantY, octantZ );
					indexOctantInverse = this.getOctantIndexFromPosition( -octantX, -octantY, -octantZ );
					
					// properties
					
					overlap = this.overlap;
					radius = this.radius;
					
					// radius of parent comes from reversing overlap of this, unless overlap percent is 0
					
					radiusParent = this.tree.overlapPct > 0 ? overlap / ( ( 0.5 * this.tree.overlapPct ) * ( 1 + this.tree.overlapPct ) ) : radius * 2; 
					overlapParent = radiusParent * this.tree.overlapPct;
					
					// parent offset is difference between radius + overlap of parent and child
					
					radiusOffset = ( radiusParent + overlapParent ) - ( radius + overlap );
					offset.set( indexOctant & 1 ? radiusOffset : -radiusOffset, indexOctant & 2 ? radiusOffset : -radiusOffset, indexOctant & 4 ? radiusOffset : -radiusOffset );
					position = new THREE.Vector3().addVectors( this.position, offset );
					
					// parent
					
					parent = new THREE.OctreeNode( {
						tree: this.tree,
						position: position,
						radius: radiusParent
					} );
					
					// set self as node of parent
					
					parent.addNode( this, indexOctantInverse );
					
					// set parent as root
					
					this.tree.setRoot( parent );
					
					// add all expand objects to parent
					
					for ( i = 0, l = objectsExpand.length; i < l; i++ ) {
						
						this.tree.root.addObject( objectsExpand[ i ] );
						
					}
					
				}
				
				// if all objects, set remaining as new objects
				
				if ( objects === this.objects ) {
					
					this.objects = objectsRemaining;
					
				}
				
			} else {
				
				objectsRemaining = objects;
				
			}
			
			return objectsRemaining;
			
		},
		
		shrink: function () {
			
			// merge check
			
			this.checkMerge();
			
			// contract check
			
			this.tree.root.checkContract();
			
		},
		
		checkMerge: function () {
			
			var nodeParent = this,
				nodeMerge;
			
			// traverse up tree as long as node + entire subtree's object count is under minimum
			
			while ( nodeParent.parent instanceof THREE.OctreeNode && nodeParent.getObjectCountEnd() < this.tree.objectsThreshold ) {
				
				nodeMerge = nodeParent;
				nodeParent = nodeParent.parent;
				
			}
			
			// if parent node is not this, merge entire subtree into merge node
			
			if ( nodeParent !== this ) {
				
				nodeParent.merge( nodeMerge );
				
			}
			
		},
		
		merge: function ( nodes ) {
			
			var i, l,
				j, k,
				node;
			
			// handle nodes
			
			nodes = toArray( nodes );
			
			for ( i = 0, l = nodes.length; i < l; i++ ) {
				
				node = nodes[ i ];
				
				// gather node + all subtree objects
				
				this.addObjectWithoutCheck( node.getObjectsEnd() );
				
				// reset node + entire subtree
				
				node.reset( true, true );
				
				// remove node
				
				this.removeNode( node.indexOctant, node );
				
			}
			
			// merge check
			
			this.checkMerge();
			
		},
		
		checkContract: function () {
			
			var i, l,
				node,
				nodeObjectsCount,
				nodeHeaviest,
				nodeHeaviestObjectsCount,
				outsideHeaviestObjectsCount;
			
			// find node with highest object count
			
			if ( this.nodesIndices.length > 0 ) {
				
				nodeHeaviestObjectsCount = 0;
				outsideHeaviestObjectsCount = this.objects.length;
				
				for ( i = 0, l = this.nodesIndices.length; i < l; i++ ) {
					
					node = this.nodesByIndex[ this.nodesIndices[ i ] ];
					
					nodeObjectsCount = node.getObjectCountEnd();
					outsideHeaviestObjectsCount += nodeObjectsCount;
					
					if ( nodeHeaviest instanceof THREE.OctreeNode === false || nodeObjectsCount > nodeHeaviestObjectsCount ) {
						
						nodeHeaviest = node;
						nodeHeaviestObjectsCount = nodeObjectsCount;
						
					}
					
				}
				
				// subtract heaviest count from outside count
				
				outsideHeaviestObjectsCount -= nodeHeaviestObjectsCount;
				
				// if should contract
				
				if ( outsideHeaviestObjectsCount < this.tree.objectsThreshold && nodeHeaviest instanceof THREE.OctreeNode ) {
					
					this.contract( nodeHeaviest );
					
				}
				
			}
			
		},
		
		contract: function ( nodeRoot ) {
			
			var i, l,
				node;
			
			// handle all nodes
			
			for ( i = 0, l = this.nodesIndices.length; i < l; i++ ) {
				
				node = this.nodesByIndex[ this.nodesIndices[ i ] ];
				
				// if node is not new root
				
				if ( node !== nodeRoot ) {
					
					// add node + all subtree objects to root
					
					nodeRoot.addObjectWithoutCheck( node.getObjectsEnd() );
					
					// reset node + entire subtree
					
					node.reset( true, true );
					
				}
				
			}
			
			// add own objects to root
			
			nodeRoot.addObjectWithoutCheck( this.objects );
			
			// reset self
			
			this.reset( false, true );
			
			// set new root
			
			this.tree.setRoot( nodeRoot );
			
			// contract check on new root
			
			nodeRoot.checkContract();
			
		},
		
		getOctantIndex: function ( objectData ) {
			
			var i, l,
				positionObj,
				radiusObj,
				position = this.position,
				radiusOverlap = this.radiusOverlap,
				overlap = this.overlap,
				deltaX, deltaY, deltaZ,
				distX, distY, distZ, 
				distance,
				indexOctant = 0;
			
			// handle type
			
			if ( objectData instanceof THREE.OctreeObjectData ) {
				
				radiusObj = objectData.radius;
				
				positionObj = objectData.position;
				
				// update object data position last
				
				objectData.positionLast.copy( positionObj );
				
			} else if ( objectData instanceof THREE.OctreeNode ) {
				
				positionObj = objectData.position;
				
				radiusObj = 0;
				
			}
			
			// find delta and distance
			
			deltaX = positionObj.x - position.x;
			deltaY = positionObj.y - position.y;
			deltaZ = positionObj.z - position.z;
			
			distX = Math.abs( deltaX );
			distY = Math.abs( deltaY );
			distZ = Math.abs( deltaZ );
			distance = Math.max( distX, distY, distZ );
			
			// if outside, use bitwise flags to indicate on which sides object is outside of
			
			if ( distance + radiusObj > radiusOverlap ) {
				
				// x
				
				if ( distX + radiusObj > radiusOverlap ) {
					
					indexOctant = indexOctant ^ ( deltaX > 0 ? this.tree.FLAG_POS_X : this.tree.FLAG_NEG_X );
					
				}
				
				// y
				
				if ( distY + radiusObj > radiusOverlap ) {
					
					indexOctant = indexOctant ^ ( deltaY > 0 ? this.tree.FLAG_POS_Y : this.tree.FLAG_NEG_Y );
					
				}
				
				// z
				
				if ( distZ + radiusObj > radiusOverlap ) {
					
					indexOctant = indexOctant ^ ( deltaZ > 0 ? this.tree.FLAG_POS_Z : this.tree.FLAG_NEG_Z );
					
				}
				
				objectData.indexOctant = -indexOctant - this.tree.INDEX_OUTSIDE_OFFSET;
				
				return objectData.indexOctant;
				
			}
			
			// return octant index from delta xyz
			
			if ( deltaX - radiusObj > -overlap ) {
				
				// x right
				
				indexOctant = indexOctant | 1;
				
			} else if ( !( deltaX + radiusObj < overlap ) ) {
				
				// x left
				
				objectData.indexOctant = this.tree.INDEX_INSIDE_CROSS;
				return objectData.indexOctant;
				
			}
			
			if ( deltaY - radiusObj > -overlap ) {
				
				// y right
				
				indexOctant = indexOctant | 2;
				
			} else if ( !( deltaY + radiusObj < overlap ) ) {
				
				// y left
				
				objectData.indexOctant = this.tree.INDEX_INSIDE_CROSS;
				return objectData.indexOctant;
				
			}
			
			
			if ( deltaZ - radiusObj > -overlap ) {
				
				// z right
				
				indexOctant = indexOctant | 4;
				
			} else if ( !( deltaZ + radiusObj < overlap ) ) {
				
				// z left
				
				objectData.indexOctant = this.tree.INDEX_INSIDE_CROSS;
				return objectData.indexOctant;
				
			}
			
			objectData.indexOctant = indexOctant;
			return objectData.indexOctant;
			
		},
		
		getOctantIndexFromPosition: function ( x, y, z ) {
			
			var indexOctant = 0;
			
			if ( x > 0 ) {
				
				indexOctant = indexOctant | 1;
				
			}
			
			if ( y > 0 ) {
				
				indexOctant = indexOctant | 2;
				
			}
			
			if ( z > 0 ) {
				
				indexOctant = indexOctant | 4;
				
			}
			
			return indexOctant;
			
		},
		
		search: function ( position, radius, objects, direction, directionPct ) {
			
			var i, l,
				node,
				intersects;
			
			// test intersects by parameters
			
			if ( direction ) {
				
				intersects = this.intersectRay( position, direction, radius, directionPct );
				
			} else {
				
				intersects = this.intersectSphere( position, radius );
				
			}
			
			// if intersects
			
			if ( intersects === true ) {
				
				// gather objects
				
				objects = objects.concat( this.objects );
				
				// search subtree
				
				for ( i = 0, l = this.nodesIndices.length; i < l; i++ ) {
					
					node = this.nodesByIndex[ this.nodesIndices[ i ] ];
					
					objects = node.search( position, radius, objects, direction );
					
				}
				
			}
			
			return objects;
			
		},
		
		intersectSphere: function ( position, radius ) {
			
			var	distance = radius * radius,
				px = position.x,
				py = position.y,
				pz = position.z;
			
			if ( px < this.left ) {
				distance -= Math.pow( px - this.left, 2 );
			} else if ( px > this.right ) {
				distance -= Math.pow( px - this.right, 2 );
			}
			
			if ( py < this.bottom ) {
				distance -= Math.pow( py - this.bottom, 2 );
			} else if ( py > this.top ) {
				distance -= Math.pow( py - this.top, 2 );
			}
			
			if ( pz < this.back ) {
				distance -= Math.pow( pz - this.back, 2 );
			} else if ( pz > this.front ) {
				distance -= Math.pow( pz - this.front, 2 );
			}
			
			return distance >= 0;
			
		},
		
		intersectRay: function ( origin, direction, distance, directionPct ) {
			
			if ( typeof directionPct === 'undefined' ) {
				
				directionPct = this.utilVec31Ray.set( 1, 1, 1 ).divide( direction );
				
			}
			
			var t1 = ( this.left - origin.x ) * directionPct.x,
				t2 = ( this.right - origin.x ) * directionPct.x,
				t3 = ( this.bottom - origin.y ) * directionPct.y,
				t4 = ( this.top - origin.y ) * directionPct.y,
				t5 = ( this.back - origin.z ) * directionPct.z,
				t6 = ( this.front - origin.z ) * directionPct.z,
				tmax = Math.min( Math.min( Math.max( t1, t2), Math.max( t3, t4) ), Math.max( t5, t6) ),
				tmin;

			// ray would intersect in reverse direction, i.e. this is behind ray
			if (tmax < 0)
			{
				return false;
			}
			
			tmin = Math.max( Math.max( Math.min( t1, t2), Math.min( t3, t4)), Math.min( t5, t6));
			
			// if tmin > tmax or tmin > ray distance, ray doesn't intersect AABB
			if( tmin > tmax || tmin > distance ) {
				return false;
			}
			
			return true;
			
		},
		
		getDepthEnd: function ( depth ) {
			
			var i, l,
				node;

			if ( this.nodesIndices.length > 0 ) {
				
				for ( i = 0, l = this.nodesIndices.length; i < l; i++ ) {

					node = this.nodesByIndex[ this.nodesIndices[ i ] ];

					depth = node.getDepthEnd( depth );

				}
				
			} else {

				depth = !depth || this.depth > depth ? this.depth : depth;

			}

			return depth;
			
		},
		
		getNodeCountEnd: function () {
			
			return this.tree.root.getNodeCountRecursive() + 1;
			
		},
		
		getNodeCountRecursive: function () {
			
			var i, l,
				count = this.nodesIndices.length;
			
			for ( i = 0, l = this.nodesIndices.length; i < l; i++ ) {
				
				count += this.nodesByIndex[ this.nodesIndices[ i ] ].getNodeCountRecursive();
				
			}
			
			return count;
			
		},
		
		getObjectsEnd: function ( objects ) {
			
			var i, l,
				node;
			
			objects = ( objects || [] ).concat( this.objects );
			
			for ( i = 0, l = this.nodesIndices.length; i < l; i++ ) {
				
				node = this.nodesByIndex[ this.nodesIndices[ i ] ];
				
				objects = node.getObjectsEnd( objects );
				
			}
			
			return objects;
			
		},
		
		getObjectCountEnd: function () {
			
			var i, l,
				count = this.objects.length;
			
			for ( i = 0, l = this.nodesIndices.length; i < l; i++ ) {
				
				count += this.nodesByIndex[ this.nodesIndices[ i ] ].getObjectCountEnd();
				
			}
			
			return count;
			
		},
		
		getObjectCountStart: function () {
			
			var count = this.objects.length,
				parent = this.parent;
			
			while( parent instanceof THREE.OctreeNode ) {
				
				count += parent.objects.length;
				parent = parent.parent;
				
			}
			
			return count;
			
		},
		
		toConsole: function ( space ) {
			
			var i, l,
				node,
				spaceAddition = '   ';
			
			space = typeof space === 'string' ? space : spaceAddition;
			
			console.log( ( this.parent ? space + ' octree NODE > ' : ' octree ROOT > ' ), this, ' // id: ', this.id, ' // indexOctant: ', this.indexOctant, ' // position: ', this.position.x, this.position.y, this.position.z, ' // radius: ', this.radius, ' // depth: ', this.depth );
			console.log( ( this.parent ? space + ' ' : ' ' ), '+ objects ( ', this.objects.length, ' ) ', this.objects );
			console.log( ( this.parent ? space + ' ' : ' ' ), '+ children ( ', this.nodesIndices.length, ' )', this.nodesIndices, this.nodesByIndex );
			
			for ( i = 0, l = this.nodesIndices.length; i < l; i++ ) {
				
				node = this.nodesByIndex[ this.nodesIndices[ i ] ];
				
				node.toConsole( space + spaceAddition );
				
			}
			
		}
		
	};

	/*===================================================

	raycaster additional functionality

	=====================================================*/
	
	THREE.Raycaster.prototype.intersectOctreeObject = function ( object, recursive ) {
		
		var intersects,
			octreeObject,
			facesAll,
			facesSearch;
		
		if ( object.object instanceof THREE.Object3D ) {
			
			octreeObject = object;
			object = octreeObject.object;
			
			// temporarily replace object geometry's faces with octree object faces
			
			facesSearch = octreeObject.faces;
			facesAll = object.geometry.faces;
			
			if ( facesSearch.length > 0 ) {
				
				object.geometry.faces = facesSearch;
				
			}
			
			// intersect
			
			intersects = this.intersectObject( object, recursive );
			
			// revert object geometry's faces
			
			if ( facesSearch.length > 0 ) {
				
				object.geometry.faces = facesAll;
				
			}
			
		} else {
			
			intersects = this.intersectObject( object, recursive );
			
		}
		
		return intersects;
		
	};
	
	THREE.Raycaster.prototype.intersectOctreeObjects = function ( objects, recursive ) {
		
		var i, il,
			intersects = [];
		
		for ( i = 0, il = objects.length; i < il; i++ ) {
			
			intersects = intersects.concat( this.intersectOctreeObject( objects[ i ], recursive ) );
		
		}
		
		return intersects;
		
	};

}( THREE ) );