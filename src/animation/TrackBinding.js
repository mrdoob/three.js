/**
 *
 * A track bound to a real value in the scene graph.
 * 
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 */

THREE.TrackBinding = function ( rootNode, trackName ) {

	this.rootNode = rootNode;
	this.trackName = trackName;

	var parseResults = THREE.TrackBinding.parseTrackName( trackName );

	this.directoryName = parseResults.directoryName || null;
	this.nodeName = parseResults.nodeName;
	this.propertyName = parseResults.propertyName || null;
	this.propertyArrayIndex = parseResults.propertyArrayIndex || -1;

	this.node = THREE.TrackBinding.findNode( rootNode, this.nodeName );

};

THREE.TrackBinding.prototype = {

	constructor: THREE.TrackBinding,

	set: function( value ) {

		 console.log( "TrackBinding.set( " + value + ")" );

 		// ensure there is a value node
		if( ! this.node ) {
			console.log( "  trying to update node for track: " + this.trackName + " but it wasn't found." );
			continue;
		}

 		// ensure there is a value property on the node
		var nodeProperty = this.node[ this.propertyName ];
		if( ! nodeProperty ) {
			console.log( "  trying to update property for track: " + this.nodeName + '.' + this.propertyName + " but it wasn't found." );				
			continue;
		}

		// access a sub element of the property array (only primitives are supported right now)
		if( this.propertyArrayIndex >= 0 ) {
			console.log( '  update property array ' + this.propertyName + '[' + this.propertyArrayIndex + '] via assignment.' );				
			nodeProperty[ this.propertyArrayIndex ] = value;
		}
		// must use copy for Object3D.Euler/Quaternion		
		else if( nodeProperty.copy ) {
			console.log( '  update property ' + this.name + '.' + this.propertyName + ' via a set() function.' );				
			nodeProperty.copy( value );
		}
		// otherwise just set the property directly on the node (do not use nodeProperty as it may not be a reference object)
		else {
			console.log( '  update property ' + this.name + '.' + this.propertyName + ' via assignment.' );				
			node[ this.propertyName ] = value;	
		}

		// trigger node dirty			
		if( this.node.needsUpdate ) { // material
			console.log( '  triggering material as dirty' );
			this.node.needsUpdate = true;
		}			
		if( this.node.matrixWorldNeedsUpdate && ! this.node.matrixAutoUpdate ) { // node transform
			console.log( '  triggering node as dirty' );
			this.node.matrixWorldNeedsUpdate = true;
		}

	},

	get: function() {

		throw new Error( "TODO" );

	}

};


THREE.TrackBinding.parseTrackName = function( trackName ) {

	// matches strings in the form of:
	//    directory/directory/directory/filename.property[index]
	// created and tested via https://regex101.com/#javascript

	var re = /^(([\w]+\/)*)([\w]+)(\.([\w]+)(\[([\w]+)\])?)?$/; 
	var matches = re.exec(trackName);

	if( ! matches ) {
		throw new Error( "cannot parse trackName at all: " + trackName );
	}

    if (matches.index === re.lastIndex) {
        re.lastIndex++;
    }

	var parseResults = {
		directoryName: m[0],
		nodeName: m[2],
		propertyName: m[4],
		propertySubElement: m[6]
	};

	console.log( "TrackBinding.parseTrackName", trackName, parseResults );

	return parseResults;

};

// TODO: Cache this at some point
THREE.TrackBinding.findNode = function( root, nodeName ) {

	console.log( 'AnimationUtils.findNode( ' + root.name + ', nodeName: ' + nodeName + ')');
	
	if( ! nodeName || nodeName === "" || nodeName === "root" || nodeName === "." || nodeName === -1 ) {

		console.log( '  root.' );
		return root;

	}

	// (2) search into skeleton bones.
	if( root.skeleton ) {

		var searchSkeleton = function( skeleton ) {

			for( var i = 0; i < skeleton.bones.length; i ++ ) {

				var bone = skeleton.bones[i];

				if( bone.name === nodeName ) {

					return childNode;

				}
			}

			return null;

		};

		var boneNode = searchSkeleton( root.skeleton );

		if( boneNode ) {

			console.log( '  bone: ' + bone.name + '.' );
			return boneNode;

		}
	}

	// (3) search into node subtree.
	if( root.children ) {

		var searchNodeSubtree = function( children ) {

			for( var i = 0; i < children.length; i ++ ) {

				var childNode = children[i];

				if( childNode.name === nodeName ) {

					return childNode;

				}

				var result = searchNodeSubtree( childNode.children );

				if( result ) return result;

			}

			return null;	

		};

		var subTreeNode = searchNodeSubtree( root.children );

		if( subTreeNode ) {

			console.log( '  node: ' + subTreeNode.name + '.' );
			return subTreeNode;

		}

	}

	console.log( "   <null>.  No node found for name: " + name );

	return null;
}
