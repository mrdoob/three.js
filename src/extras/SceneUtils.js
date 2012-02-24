/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.SceneUtils = {

	showHierarchy : function ( root, visible ) {

		THREE.SceneUtils.traverseHierarchy( root, function( node ) { node.visible = visible; } );

	},

	traverseHierarchy : function ( root, callback ) {

		var n, i, l = root.children.length;

		for ( i = 0; i < l; i ++ ) {

			n = root.children[ i ];

			callback( n );

			THREE.SceneUtils.traverseHierarchy( n, callback );

		}

	},

	createMultiMaterialObject : function ( geometry, materials ) {

		var i, il = materials.length,
			group = new THREE.Object3D();

		for ( i = 0; i < il; i ++ ) {

			var object = new THREE.Mesh( geometry, materials[ i ] );
			group.add( object );

		}

		return group;

	},

	cloneObject: function ( source ) {

		var object;

		// subclass specific properties
		// (must process in order from more specific subclasses to more abstract classes)

		if ( source instanceof THREE.MorphAnimMesh ) {

			object = new THREE.MorphAnimMesh( source.geometry, source.material );

			object.duration = source.duration;
			object.mirroredLoop = source.mirroredLoop;
			object.time = source.time;

			object.lastKeyframe = source.lastKeyframe;
			object.currentKeyframe = source.currentKeyframe;

			object.direction = source.direction;
			object.directionBackwards = source.directionBackwards;

		} else if ( source instanceof THREE.SkinnedMesh ) {

			object = new THREE.SkinnedMesh( source.geometry, source.material );

		} else if ( source instanceof THREE.Mesh ) {

			object = new THREE.Mesh( source.geometry, source.material );

		} else if ( source instanceof THREE.Line ) {

			object = new THREE.Line( source.geometry, source.material, source.type );

		} else if ( source instanceof THREE.Ribbon ) {

			object = new THREE.Ribbon( source.geometry, source.material );

		} else if ( source instanceof THREE.ParticleSystem ) {

			object = new THREE.ParticleSystem( source.geometry, source.material );
			object.sortParticles = source.sortParticles;

		} else if ( source instanceof THREE.Particle ) {

			object = new THREE.Particle( source.material );

		} else if ( source instanceof THREE.Sprite ) {

			object = new THREE.Sprite( {} );

			object.color.copy( source.color );
			object.map = source.map;
			object.blending = source.blending;

			object.useScreenCoordinates = source.useScreenCoordinates;
			object.mergeWith3D = source.mergeWith3D;
			object.affectedByDistance = source.affectedByDistance;
			object.scaleByViewport = source.scaleByViewport;
			object.alignment = source.alignment;

			object.rotation3d.copy( source.rotation3d );
			object.rotation = source.rotation;
			object.opacity = source.opacity;

			object.uvOffset.copy( source.uvOffset );
			object.uvScale.copy( source.uvScale);

		} else if ( source instanceof THREE.LOD ) {

			object = new THREE.LOD();

		} else if ( source instanceof THREE.MarchingCubes ) {

			object = new THREE.MarchingCubes( source.resolution, source.material );
			object.field.set( source.field );
			object.isolation = source.isolation;

		} else if ( source instanceof THREE.Object3D ) {

			object = new THREE.Object3D();

		}

		// base class properties

		object.name = source.name;

		object.parent = source.parent;

		object.up.copy( source.up );

		object.position.copy( source.position );

		// because of Sprite madness

		if ( object.rotation instanceof THREE.Vector3 )
			object.rotation.copy( source.rotation );

		object.eulerOrder = source.eulerOrder;

		object.scale.copy( source.scale );

		object.dynamic = source.dynamic;

		object.doubleSided = source.doubleSided;
		object.flipSided = source.flipSided;

		object.renderDepth = source.renderDepth;

		object.rotationAutoUpdate = source.rotationAutoUpdate;

		object.matrix.copy( source.matrix );
		object.matrixWorld.copy( source.matrixWorld );
		object.matrixRotationWorld.copy( source.matrixRotationWorld );

		object.matrixAutoUpdate = source.matrixAutoUpdate;
		object.matrixWorldNeedsUpdate = source.matrixWorldNeedsUpdate;

		object.quaternion.copy( source.quaternion );
		object.useQuaternion = source.useQuaternion;

		object.boundRadius = source.boundRadius;
		object.boundRadiusScale = source.boundRadiusScale;

		object.visible = source.visible;

		object.castShadow = source.castShadow;
		object.receiveShadow = source.receiveShadow;

		object.frustumCulled = source.frustumCulled;

		// children

		for ( var i = 0; i < source.children.length; i ++ ) {

			var child = THREE.SceneUtils.cloneObject( source.children[ i ] );
			object.children[ i ] = child;

			child.parent = object;

		}

		// LODs need to be patched separately to use cloned children

		if ( source instanceof THREE.LOD ) {

			for ( var i = 0; i < source.LODs.length; i ++ ) {

				var lod = source.LODs[ i ];
				object.LODs[ i ] = { visibleAtDistance: lod.visibleAtDistance, object3D: object.children[ i ] };

			}

		}

		return object;

	},

	detach : function ( child, parent, scene ) {

		child.applyMatrix( parent.matrixWorld );
		parent.remove( child );
		scene.add( child );

	},

	attach: function ( child, scene, parent ) {

		var matrixWorldInverse = new THREE.Matrix4();
		matrixWorldInverse.getInverse( parent.matrixWorld );
		child.applyMatrix( matrixWorldInverse );

		scene.remove( child );
		parent.add( child );

	}

};
