/**
 *
 * A track bound to a real value in the scene graph.
 * 
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 */

THREE.PropertyBinding = function ( rootNode, trackName ) {

	this.rootNode = rootNode;
	this.trackName = trackName;
	this.referenceCount = 0;
	this.originalValue = null; // the value of the property before it was controlled by this binding

	var parseResults = THREE.PropertyBinding.parseTrackName( trackName );

	//console.log( parseResults );
	this.directoryName = parseResults.directoryName;
	this.nodeName = parseResults.nodeName;
	this.objectName = parseResults.objectName;
	this.objectIndex = parseResults.objectIndex;
	this.propertyName = parseResults.propertyName;
	this.propertyIndex = parseResults.propertyIndex;

	this.node = THREE.PropertyBinding.findNode( rootNode, this.nodeName );

	this.cumulativeValue = null;
	this.cumulativeWeight = 0;
};

THREE.PropertyBinding.prototype = {

	constructor: THREE.PropertyBinding,

	reset: function() {

		this.cumulativeValue = null;
		this.cumulativeWeight = 0;

	},

	accumulate: function( value, weight ) {
		
		if( ! this.isBound ) this.bind();

		if( this.cumulativeWeight === 0 ) {

			if( this.cumulativeValue === null ) {
				this.cumulativeValue = THREE.AnimationUtils.clone( value );
			}
			this.cumulativeWeight = weight;
			//console.log( this );

		}
		else {

			var lerpAlpha = weight / ( this.cumulativeWeight + weight );
			this.cumulativeValue = this.lerpValue( this.cumulativeValue, value, lerpAlpha );
			this.cumulativeWeight += weight;
			//console.log( this );

		}

	},

	unbind: function() {

		if( ! this.isBound ) return;

		this.setValue( this.originalValue );

		this.setValue = null;
		this.getValue = null;
		this.lerpValue = null;
		this.equalsValue = null;
		this.triggerDirty = null;	
		this.isBound = false;

	},

	// creates the member functions:
	//	- setValue( value )
	//  - getValue()
	//  - triggerDirty()

	bind: function() {

		if( this.isBound ) return;
		
		//console.log( "PropertyBinding", this );

		var targetObject = this.node;

 		// ensure there is a value node
		if( ! targetObject ) {
			console.error( "  trying to update node for track: " + this.trackName + " but it wasn't found." );
			return;
		}

		if( this.objectName ) {
			// special case were we need to reach deeper into the hierarchy to get the face materials....
			if( this.objectName === "materials" ) {
				if( ! targetObject.material ) {
					console.error( '  can not bind to material as node does not have a material', this );
					return;				
				}
				if( ! targetObject.material.materials ) {
					console.error( '  can not bind to material.materials as node.material does not have a materials array', this );
					return;				
				}
				targetObject = targetObject.material.materials;
			}
			else if( this.objectName === "bones" ) {
				if( ! targetObject.skeleton ) {
					console.error( '  can not bind to bones as node does not have a skeleton', this );
				}
				targetObject = targetObject.skeleton.bones;

				// TODO/OPTIMIZE, skip this if propertyIndex is already an integer, and convert the integer string to a true integer.
				
				// support resolving morphTarget names into indices.
				//console.log( "  resolving bone name: ", this.objectIndex );
				for( var i = 0; i < this.node.skeleton.bones.length; i ++ ) {
					if( this.node.skeleton.bones[i].name === this.objectIndex ) {
						//console.log( "  resolved to index: ", i );
						this.objectIndex = i;
						break;
					}
				}
			}
			else {

				if( targetObject[ this.objectName ] === undefined ) {
					console.error( '  can not bind to objectName of node, undefined', this );			
					return;
				}
				targetObject = targetObject[ this.objectName ];
			}
			
			if( this.objectIndex !== undefined ) {
				if( targetObject[ this.objectIndex ] === undefined ) {
					console.error( "  trying to bind to objectIndex of objectName, but is undefined:", this, targetObject );
					return;				
				}

				targetObject = targetObject[ this.objectIndex ];
			}

		}

 		// special case mappings
 		var nodeProperty = targetObject[ this.propertyName ];
		if( ! nodeProperty ) {
			console.error( "  trying to update property for track: " + this.nodeName + '.' + this.propertyName + " but it wasn't found.", targetObject );				
			return;
		}

		// access a sub element of the property array (only primitives are supported right now)
		if( this.propertyIndex !== undefined ) {

			if( this.propertyName === "morphTargetInfluences" ) {
				// TODO/OPTIMIZE, skip this if propertyIndex is already an integer, and convert the integer string to a true integer.
				
				// support resolving morphTarget names into indices.
				//console.log( "  resolving morphTargetInfluence name: ", this.propertyIndex );
				if( ! this.node.geometry ) {
					console.error( '  can not bind to morphTargetInfluences becasuse node does not have a geometry', this );				
				}
				if( ! this.node.geometry.morphTargets ) {
					console.error( '  can not bind to morphTargetInfluences becasuse node does not have a geometry.morphTargets', this );				
				}
				
				for( var i = 0; i < this.node.geometry.morphTargets.length; i ++ ) {
					if( this.node.geometry.morphTargets[i].name === this.propertyIndex ) {
						//console.log( "  resolved to index: ", i );
						this.propertyIndex = i;
						break;
					}
				}
			}

			//console.log( '  update property array ' + this.propertyName + '[' + this.propertyIndex + '] via assignment.' );				
			this.setValue = function( value ) {
				if( ! this.equalsValue( nodeProperty[ this.propertyIndex ], value ) ) {
					nodeProperty[ this.propertyIndex ] = value;
					return true;
				}
				return false;
			};

			this.getValue = function() {
				return nodeProperty[ this.propertyIndex ];
			};

		}
		// must use copy for Object3D.Euler/Quaternion		
		else if( nodeProperty.copy ) {
			
			//console.log( '  update property ' + this.name + '.' + this.propertyName + ' via a set() function.' );				
			this.setValue = function( value ) {
				if( ! this.equalsValue( nodeProperty, value ) ) {
					nodeProperty.copy( value );
					return true;
				}
				return false;
			}

			this.getValue = function() {
				return nodeProperty;
			};

		}
		// otherwise just set the property directly on the node (do not use nodeProperty as it may not be a reference object)
		else {

			//console.log( '  update property ' + this.name + '.' + this.propertyName + ' via assignment.' );				
			this.setValue = function( value ) {
				if( ! this.equalsValue( targetObject[ this.propertyName ], value ) ) {
					targetObject[ this.propertyName ] = value;	
					return true;
				}
				return false;
			}

			this.getValue = function() {
				return targetObject[ this.propertyName ];
			};

		}

		// trigger node dirty			
		if( targetObject.needsUpdate !== undefined ) { // material
			
			//console.log( '  triggering material as dirty' );
			this.triggerDirty = function() {
				this.node.needsUpdate = true;
			}

		}			
		else if( targetObject.matrixWorldNeedsUpdate !== undefined ) { // node transform
			
			//console.log( '  triggering node as dirty' );
			this.triggerDirty = function() {
				targetObject.matrixWorldNeedsUpdate = true;
			}

		}

		this.originalValue = this.getValue();

		this.equalsValue = THREE.AnimationUtils.getEqualsFunc( this.originalValue );
		this.lerpValue = THREE.AnimationUtils.getLerpFunc( this.originalValue, true );

		this.isBound = true;

	},

	apply: function() {

		// for speed capture the setter pattern as a closure (sort of a memoization pattern: https://en.wikipedia.org/wiki/Memoization)
		if( ! this.isBound ) this.bind();

		// early exit if there is nothing to apply.
		if( this.cumulativeWeight > 0 ) {
		
			// blend with original value
			if( this.cumulativeWeight < 1 ) {

				var remainingWeight = 1 - this.cumulativeWeight;
				var lerpAlpha = remainingWeight / ( this.cumulativeWeight + remainingWeight );
				this.cumulativeValue = this.lerpValueler( this.cumulativeValue, this.originalValue, lerpAlpha );

			}

			var valueChanged = this.setValue( this.cumulativeValue );

			if( valueChanged && this.triggerDirty ) {
				this.triggerDirty();
			}

			// reset accumulator
			this.cumulativeValue = null;
			this.cumulativeWeight = 0;

		}
	}

};


THREE.PropertyBinding.parseTrackName = function( trackName ) {

	// matches strings in the form of:
	//    nodeName.property
	//    nodeName.property[accessor]
	//    nodeName.material.property[accessor]
	//    uuid.property[accessor]
	//    uuid.objectName[objectIndex].propertyName[propertyIndex]
	//    parentName/nodeName.property
	//    parentName/parentName/nodeName.property[index]
	//	  .bone[Armature.DEF_cog].position
	// created and tested via https://regex101.com/#javascript

	var re = /^(([\w]+\/)*)([\w-\d]+)?(\.([\w]+)(\[([\w\d\[\]\_. ]+)\])?)?(\.([\w.]+)(\[([\w\d\[\]\_. ]+)\])?)$/; 
	var matches = re.exec(trackName);

	if( ! matches ) {
		throw new Error( "cannot parse trackName at all: " + trackName );
	}

    if (matches.index === re.lastIndex) {
        re.lastIndex++;
    }

	var results = {
		directoryName: matches[1],
		nodeName: matches[3], 	// allowed to be null, specified root node.
		objectName: matches[5],
		objectIndex: matches[7],
		propertyName: matches[9],
		propertyIndex: matches[11]	// allowed to be null, specifies that the whole property is set.
	};

	//console.log( "PropertyBinding.parseTrackName", trackName, results, matches );

	if( results.propertyName === null || results.propertyName.length === 0 ) {
		throw new Error( "can not parse propertyName from trackName: " + trackName );
	}

	return results;

};

// TODO: Cache this at some point
THREE.PropertyBinding.findNode = function( root, nodeName ) {

	//console.log( 'AnimationUtils.findNode( ' + root.name + ', nodeName: ' + nodeName + ')');
	
	if( ! nodeName || nodeName === "" || nodeName === "root" || nodeName === "." || nodeName === -1 || nodeName === root.name || nodeName === root.uuid ) {

		//console.log( '  root.' );
		return root;

	}

	// (2) search into skeleton bones.
	if( root.skeleton ) {

		var searchSkeleton = function( skeleton ) {

			for( var i = 0; i < skeleton.bones.length; i ++ ) {

				var bone = skeleton.bones[i];

				if( bone.name === nodeName ) {

					return bone;

				}
			}

			return null;

		};

		var bone = searchSkeleton( root.skeleton );

		if( bone ) {

			//console.log( '  bone: ' + bone.name + '.' );
			return bone;

		}
	}

	// (3) search into node subtree.
	if( root.children ) {

		var searchNodeSubtree = function( children ) {

			for( var i = 0; i < children.length; i ++ ) {

				var childNode = children[i];

				if( childNode.name === nodeName || childNode.uuid === nodeName ) {

					return childNode;

				}

				var result = searchNodeSubtree( childNode.children );

				if( result ) return result;

			}

			return null;	

		};

		var subTreeNode = searchNodeSubtree( root.children );

		if( subTreeNode ) {

			//console.log( '  node: ' + subTreeNode.name + '.' );
			return subTreeNode;

		}

	}

	//console.log( "   <null>.  No node found for name: " + nodeName );

	return null;
}
