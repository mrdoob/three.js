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

	this.directoryName = parseResults.directoryName;
	this.nodeName = parseResults.nodeName;
	this.objectName = parseResults.objectName;
	this.objectIndex = parseResults.objectIndex;
	this.propertyName = parseResults.propertyName;
	this.propertyIndex = parseResults.propertyIndex;

	this.node = THREE.PropertyBinding.findNode( rootNode, this.nodeName ) || rootNode;

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

		if ( ! this.isBound ) this.bind();

		if ( this.cumulativeWeight === 0 ) {

			if ( weight > 0 ) {

				if ( this.cumulativeValue === null ) {
					this.cumulativeValue = THREE.AnimationUtils.clone( value );
				}
				this.cumulativeWeight = weight;

			}

		} else {

			var lerpAlpha = weight / ( this.cumulativeWeight + weight );
			this.cumulativeValue = this.lerpValue( this.cumulativeValue, value, lerpAlpha );
			this.cumulativeWeight += weight;

		}

	},

	unbind: function() {

		if ( ! this.isBound ) return;

		this.setValue( this.originalValue );

		this.setValue = null;
		this.getValue = null;
		this.lerpValue = null;
		this.equalsValue = null;
		this.triggerDirty = null;
		this.isBound = false;

	},

	// bind to the real property in the scene graph, remember original value, memorize various accessors for speed/inefficiency
	bind: function() {

		if ( this.isBound ) return;

		var targetObject = this.node;

 		// ensure there is a value node
		if ( ! targetObject ) {
			console.error( "  trying to update node for track: " + this.trackName + " but it wasn't found." );
			return;
		}

		if ( this.objectName ) {
			// special case were we need to reach deeper into the hierarchy to get the face materials....
			if ( this.objectName === "materials" ) {
				if ( ! targetObject.material ) {
					console.error( '  can not bind to material as node does not have a material', this );
					return;
				}
				if ( ! targetObject.material.materials ) {
					console.error( '  can not bind to material.materials as node.material does not have a materials array', this );
					return;
				}
				targetObject = targetObject.material.materials;
			} else if ( this.objectName === "bones" ) {
				if ( ! targetObject.skeleton ) {
					console.error( '  can not bind to bones as node does not have a skeleton', this );
					return;
				}
				// potential future optimization: skip this if propertyIndex is already an integer, and convert the integer string to a true integer.

				targetObject = targetObject.skeleton.bones;

				// support resolving morphTarget names into indices.
				for ( var i = 0; i < targetObject.length; i ++ ) {
					if ( targetObject[i].name === this.objectIndex ) {
						this.objectIndex = i;
						break;
					}
				}
			} else {

				if ( targetObject[ this.objectName ] === undefined ) {
					console.error( '  can not bind to objectName of node, undefined', this );
					return;
				}
				targetObject = targetObject[ this.objectName ];
			}

			if ( this.objectIndex !== undefined ) {
				if ( targetObject[ this.objectIndex ] === undefined ) {
					console.error( "  trying to bind to objectIndex of objectName, but is undefined:", this, targetObject );
					return;
				}

				targetObject = targetObject[ this.objectIndex ];
			}

		}

 		// special case mappings
 		var nodeProperty = targetObject[ this.propertyName ];
		if ( ! nodeProperty ) {
			console.error( "  trying to update property for track: " + this.nodeName + '.' + this.propertyName + " but it wasn't found.", targetObject );
			return;
		}

		// access a sub element of the property array (only primitives are supported right now)
		if ( this.propertyIndex !== undefined ) {

			if ( this.propertyName === "morphTargetInfluences" ) {
				// potential optimization, skip this if propertyIndex is already an integer, and convert the integer string to a true integer.

				// support resolving morphTarget names into indices.
				if ( ! targetObject.geometry ) {
					console.error( '  can not bind to morphTargetInfluences becasuse node does not have a geometry', this );
				}
				if ( ! targetObject.geometry.morphTargets ) {
					console.error( '  can not bind to morphTargetInfluences becasuse node does not have a geometry.morphTargets', this );
				}

				for ( var i = 0; i < this.node.geometry.morphTargets.length; i ++ ) {
					if ( targetObject.geometry.morphTargets[i].name === this.propertyIndex ) {
						this.propertyIndex = i;
						break;
					}
				}
			}

			this.setValue = function setValue_propertyIndexed( value ) {
				if ( ! this.equalsValue( nodeProperty[ this.propertyIndex ], value ) ) {
					nodeProperty[ this.propertyIndex ] = value;
					return true;
				}
				return false;
			};

			this.getValue = function getValue_propertyIndexed() {
				return nodeProperty[ this.propertyIndex ];
			};

		}
		// must use copy for Object3D.Euler/Quaternion
		else if ( nodeProperty.copy ) {

			this.setValue = function setValue_propertyObject( value ) {
				if ( ! this.equalsValue( nodeProperty, value ) ) {
					nodeProperty.copy( value );
					return true;
				}
				return false;
			}

			this.getValue = function getValue_propertyObject() {
				return nodeProperty;
			};

		}
		// otherwise just set the property directly on the node (do not use nodeProperty as it may not be a reference object)
		else {

			this.setValue = function setValue_property( value ) {
				if ( ! this.equalsValue( targetObject[ this.propertyName ], value ) ) {
					targetObject[ this.propertyName ] = value;
					return true;
				}
				return false;
			}

			this.getValue = function getValue_property() {
				return targetObject[ this.propertyName ];
			};

		}

		// trigger node dirty
		if ( targetObject.needsUpdate !== undefined ) { // material

			this.triggerDirty = function triggerDirty_needsUpdate() {
				this.node.needsUpdate = true;
			}

		} else if ( targetObject.matrixWorldNeedsUpdate !== undefined ) { // node transform

			this.triggerDirty = function triggerDirty_matrixWorldNeedsUpdate() {
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
		if ( ! this.isBound ) this.bind();

		// early exit if there is nothing to apply.
		if ( this.cumulativeWeight > 0 ) {

			// blend with original value
			if ( this.cumulativeWeight < 1 ) {

				var remainingWeight = 1 - this.cumulativeWeight;
				var lerpAlpha = remainingWeight / ( this.cumulativeWeight + remainingWeight );
				this.cumulativeValue = this.lerpValue( this.cumulativeValue, this.originalValue, lerpAlpha );

			}

			var valueChanged = this.setValue( this.cumulativeValue );

			if ( valueChanged && this.triggerDirty ) {
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

	if ( ! matches ) {
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

	if ( results.propertyName === null || results.propertyName.length === 0 ) {
		throw new Error( "can not parse propertyName from trackName: " + trackName );
	}

	return results;

};

THREE.PropertyBinding.findNode = function( root, nodeName ) {

	function searchSkeleton( skeleton ) {

		for ( var i = 0; i < skeleton.bones.length; i ++ ) {

			var bone = skeleton.bones[i];

			if ( bone.name === nodeName ) {

				return bone;

			}
		}

		return null;

	}

	function searchNodeSubtree( children ) {

		for ( var i = 0; i < children.length; i ++ ) {

			var childNode = children[i];

			if ( childNode.name === nodeName || childNode.uuid === nodeName ) {

				return childNode;

			}

			var result = searchNodeSubtree( childNode.children );

			if ( result ) return result;

		}

		return null;

	}

	//

	if ( ! nodeName || nodeName === "" || nodeName === "root" || nodeName === "." || nodeName === -1 || nodeName === root.name || nodeName === root.uuid ) {

		return root;

	}

	// search into skeleton bones.
	if ( root.skeleton ) {

		var bone = searchSkeleton( root.skeleton );

		if ( bone ) {

			return bone;

		}
	}

	// search into node subtree.
	if ( root.children ) {

		var subTreeNode = searchNodeSubtree( root.children );

		if ( subTreeNode ) {

			return subTreeNode;

		}

	}

	return null;
}
