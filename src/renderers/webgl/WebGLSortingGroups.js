/**
 * @author Mugen87 / https://github.com/Mugen87
 */

function WebGLSortingGroups() {

	var sortingGroups = [];

	function update( scene ) {

		sortingGroups.length = 0;

		findSortingGroups( scene );

		//

		if ( sortingGroups.length > 1 ) {

			sortingGroups.sort( groupSortStable );

			for ( var i = 0, l = sortingGroups.length; i < l; i ++ ) {

				var sortingGroup = sortingGroups[ i ];
				sortingGroup.__groupOrder = i;

			}

		}

	}

	function findSortingGroups( object ) {

		var children = object.children;

		if ( object.isSortingGroup ) sortingGroups.push( object );

		for ( var i = 0, l = children.length; i < l; i ++ ) {

			findSortingGroups( children[ i ] );

		}

	}

	return {

		update: update

	};

}

function groupSortStable( a, b ) {

	if ( a.renderOrder !== b.renderOrder ) {

	 return a.renderOrder - b.renderOrder;

	}

}


export { WebGLSortingGroups };
