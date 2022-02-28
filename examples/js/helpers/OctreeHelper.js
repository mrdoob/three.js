( function () {

	class OctreeHelper extends THREE.LineSegments {

		constructor( octree, color = 0xffff00 ) {

			const vertices = [];

			function traverse( tree ) {

				for ( let i = 0; i < tree.length; i ++ ) {

					const min = tree[ i ].box.min;
					const max = tree[ i ].box.max;
					vertices.push( max.x, max.y, max.z );
					vertices.push( min.x, max.y, max.z ); // 0, 1

					vertices.push( min.x, max.y, max.z );
					vertices.push( min.x, min.y, max.z ); // 1, 2

					vertices.push( min.x, min.y, max.z );
					vertices.push( max.x, min.y, max.z ); // 2, 3

					vertices.push( max.x, min.y, max.z );
					vertices.push( max.x, max.y, max.z ); // 3, 0

					vertices.push( max.x, max.y, min.z );
					vertices.push( min.x, max.y, min.z ); // 4, 5

					vertices.push( min.x, max.y, min.z );
					vertices.push( min.x, min.y, min.z ); // 5, 6

					vertices.push( min.x, min.y, min.z );
					vertices.push( max.x, min.y, min.z ); // 6, 7

					vertices.push( max.x, min.y, min.z );
					vertices.push( max.x, max.y, min.z ); // 7, 4

					vertices.push( max.x, max.y, max.z );
					vertices.push( max.x, max.y, min.z ); // 0, 4

					vertices.push( min.x, max.y, max.z );
					vertices.push( min.x, max.y, min.z ); // 1, 5

					vertices.push( min.x, min.y, max.z );
					vertices.push( min.x, min.y, min.z ); // 2, 6

					vertices.push( max.x, min.y, max.z );
					vertices.push( max.x, min.y, min.z ); // 3, 7

					traverse( tree[ i ].subTrees );

				}

			}

			traverse( octree.subTrees );
			const geometry = new THREE.BufferGeometry();
			geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
			super( geometry, new THREE.LineBasicMaterial( {
				color: color,
				toneMapped: false
			} ) );
			this.octree = octree;
			this.color = color;
			this.type = 'OctreeHelper';

		}

	}

	THREE.OctreeHelper = OctreeHelper;

} )();
