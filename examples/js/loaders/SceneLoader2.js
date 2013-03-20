/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.SceneLoader2 = function () {

	THREE.EventDispatcher.call( this );

};

THREE.SceneLoader2.prototype = {

	constructor: THREE.SceneLoader2,

	load: function ( url ) {

		var scope = this;
		var request = new XMLHttpRequest();

		request.addEventListener( 'load', function ( event ) {

			var response = scope.parse( JSON.parse( event.target.responseText ) );

			scope.dispatchEvent( { type: 'load', content: response } );

		}, false );

		request.addEventListener( 'progress', function ( event ) {

			scope.dispatchEvent( { type: 'progress', loaded: event.loaded, total: event.total } );

		}, false );

		request.addEventListener( 'error', function () {

			scope.dispatchEvent( { type: 'error', message: 'Couldn\'t load URL [' + url + ']' } );

		}, false );

		request.open( 'GET', url, true );
		request.send( null );

	},

	parse: function ( json ) {

		// console.log( json );

		var scene = new THREE.Scene();

		// geometries

		var geometries = [];
		var loader = new THREE.JSONLoader();

		for ( var i = 0, l = json.geometries.length; i < l; i ++ ) {

			var geometry;
			var data = json.geometries[ i ];

			switch ( data.type ) {

				case 'PlaneGeometry':

					geometry = new THREE.PlaneGeometry(
						data.width,
						data.height,
						data.widthSegments,
						data.heightSegments
					);

					break;

				case 'CubeGeometry':

					geometry = new THREE.CubeGeometry(
						data.width,
						data.height,
						data.depth,
						data.widthSegments,
						data.heightSegments,
						data.depthSegments
					);

					break;

				case 'CylinderGeometry':

					geometry = new THREE.CylinderGeometry(
						data.radiusTop,
						data.radiusBottom,
						data.height,
						data.radiusSegments,
						data.heightSegments,
						data.openEnded
					);

					break;

				case 'SphereGeometry':

					geometry = new THREE.SphereGeometry(
						data.radius,
						data.widthSegments,
						data.heightSegments,
						data.phiStart,
						data.phiLength,
						data.thetaStart,
						data.thetaLength
					);

					break;

				case 'IcosahedronGeometry':

					geometry = new THREE.IcosahedronGeometry(
						data.radius,
						data.detail
					);

					break;

				case 'TorusGeometry':

					geometry = new THREE.TorusGeometry(
						data.radius,
						data.tube,
						data.radialSegments,
						data.tubularSegments,
						data.arc
					);

					break;

				case 'TorusKnotGeometry':

					geometry = new THREE.TorusKnotGeometry(
						data.radius,
						data.tube,
						data.radialSegments,
						data.tubularSegments,
						data.p,
						data.q,
						data.heightScale
					);

					break;

				case 'Geometry':

					geometry = loader.parse( data.data ).geometry;

					break;

			}

			geometry.name = data.name;
			geometries.push( geometry );

		}

		// materials

		var materials = [];
		var loader = new THREE.MaterialLoader();

		for ( var i = 0, l = json.materials.length; i < l; i ++ ) {

			var material;
			var data = json.materials[ i ];

			material = loader.parse( data.data );

			material.name = data.name;
			materials.push( material );

		}

		// objects

		var parseObject = function ( array, parent ) {

			for ( var i = 0, l = array.length; i < l; i ++ ) {

				var object;
				var data = array[ i ];

				switch ( data.type ) {

					case 'PerspectiveCamera':

						object = new THREE.PerspectiveCamera( data.fov, data.aspect, data.near, data.far );
						object.position.fromArray( data.position );
						object.rotation.fromArray( data.rotation );

						break;

					case 'OrthographicCamera':

						object = new THREE.OrthographicCamera( data.left, data.right, data.top, data.bottom, data.near, data.far );
						object.position.fromArray( data.position );
						object.rotation.fromArray( data.rotation );

						break;

					case 'AmbientLight':

						object = new THREE.AmbientLight( data.color );

						break;

					case 'DirectionalLight':

						object = new THREE.DirectionalLight( data.color, data.intensity );
						object.position.fromArray( data.position );

						break;

					case 'PointLight':

						object = new THREE.PointLight( data.color, data.intensity );
						object.position.fromArray( data.position );

						break;

					case 'SpotLight':

						object = new THREE.SpotLight( data.color, data.intensity, data.distance, data.angle, data.exponent );
						object.position.fromArray( data.position );

						break;

					case 'HemisphereLight':

						object = new THREE.HemisphereLight( data.color, data.groundColor, data.intensity );
						object.position.fromArray( data.position );

						break;

					case 'Mesh':

						object = new THREE.Mesh( geometries[ data.geometry ], materials[ data.material ] );
						object.position.fromArray( data.position );
						object.rotation.fromArray( data.rotation );
						object.scale.fromArray( data.scale );

						break;

					default:

						object = new THREE.Object3D();
						object.position.fromArray( data.position );
						object.rotation.fromArray( data.rotation );
						object.scale.fromArray( data.scale );

				}

				object.name = data.name;
				object.visible = data.visible;
				object.userData = data.userData;
				parent.add( object );

				if ( data.children !== undefined ) {

					parseObject( data.children, object );

				}

			}

		}

		parseObject( json.scene, scene );

		return scene;

	}

}
