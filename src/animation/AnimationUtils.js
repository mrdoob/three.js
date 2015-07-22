/**
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 */

 THREE.AnimationUtils = {

 	lerp: function( a, b, alpha ) {

		if( a.lerp ) {

			return a.clone().lerp( b, alpha );

		}
		else if( a.slerp ) {

			return a.clone().lerp( b, alpha );

		}
		else {

			return a * ( 1 - alpha ) + b * alpha;
			
		}
	},



	// TODO: Cache this at some point
	findNode: function( root, nodeName ) {

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
};