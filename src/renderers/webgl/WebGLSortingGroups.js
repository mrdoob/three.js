/**
 * @author Mugen87 / https://github.com/Mugen87
 */

function WebGLSortingGroups() {

	var currentGroupOrder;
	var arrays = {};

	function init() {

		currentGroupOrder = 0;

	}

	function update( object, level ) {

		if ( object.children.length === 0 ) return;

		level = level || 0;

		if ( arrays[ level ] === undefined ) arrays[ level ] = [];

		var children = arrays[ level ];
		children.length = 0;

		Array.prototype.push.apply( children, object.children );

		//

		children.sort( groupSortStable );

		//

		for ( var i = 0, l = children.length; i < l; i ++ ) {

			var child = children[ i ];

			if ( child.isMesh || child.isLine || child.isPoints || child.isImmediateRenderObject || child.isSprite ) {

				if ( child.parent.isSortingGroup ) {

					child.__groupOrder = currentGroupOrder;

				} else {

					child.__groupOrder = ++ currentGroupOrder;

				}

			} else if ( child.isSortingGroup ) {

				currentGroupOrder = ++ currentGroupOrder;

			}

			update( child, level + 1 );

		}

	}

	function finish() {

		for ( var key in arrays ) {

			arrays[ key ].length = 0;

		}

	}

	function dispose() {

		arrays = {};

	}

	return {

		dispose: dispose,
		finish: finish,
		init: init,
		update: update

	};

}

function groupSortStable( a, b ) {

	if ( a.renderOrder !== b.renderOrder ) {

	 return a.renderOrder - b.renderOrder;

	}

}


export { WebGLSortingGroups };
