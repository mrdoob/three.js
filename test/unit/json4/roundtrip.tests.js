import { ObjectLoader } from '../../../src/loaders/ObjectLoader.js';
import { Scene } from '../../../src/scenes/Scene.js';
import { Mesh } from '../../../src/objects/Mesh.js';
import { Group } from '../../../src/objects/Group.js';
import { BoxGeometry } from '../../../src/geometries/BoxGeometry.js';
import { SphereGeometry } from '../../../src/geometries/SphereGeometry.js';
import { BufferGeometry } from '../../../src/core/BufferGeometry.js';
import { Float32BufferAttribute } from '../../../src/core/BufferAttribute.js';
import { MeshBasicMaterial } from '../../../src/materials/MeshBasicMaterial.js';
import { MeshStandardMaterial } from '../../../src/materials/MeshStandardMaterial.js';
import { AmbientLight } from '../../../src/lights/AmbientLight.js';
import { DirectionalLight } from '../../../src/lights/DirectionalLight.js';
import { PointLight } from '../../../src/lights/PointLight.js';
import { PerspectiveCamera } from '../../../src/cameras/PerspectiveCamera.js';
import { OrthographicCamera } from '../../../src/cameras/OrthographicCamera.js';
import { Color } from '../../../src/math/Color.js';
import { Fog } from '../../../src/scenes/Fog.js';

export default QUnit.module( 'JSON4 Format', () => {

	QUnit.module( 'Round-trip', () => {

		QUnit.test( 'Simple Mesh round-trip', ( assert ) => {

			const geometry = new BoxGeometry( 2, 3, 4 );
			const material = new MeshBasicMaterial( { color: 0xff0000 } );
			const mesh = new Mesh( geometry, material );
			mesh.position.set( 1, 2, 3 );
			mesh.name = 'TestMesh';
			mesh.updateMatrix();

			const json = mesh.toJSON();
			const loader = new ObjectLoader();
			const restored = loader.parse( json );

			assert.ok( restored.isMesh, 'Restored is Mesh' );
			assert.strictEqual( restored.name, 'TestMesh', 'Name preserved' );
			assert.strictEqual( restored.position.x, 1, 'Position.x preserved' );
			assert.strictEqual( restored.position.y, 2, 'Position.y preserved' );
			assert.strictEqual( restored.position.z, 3, 'Position.z preserved' );
			assert.strictEqual( restored.geometry.parameters.width, 2, 'Geometry width preserved' );
			assert.strictEqual( restored.material.color.getHex(), 0xff0000, 'Material color preserved' );

		} );

		QUnit.test( 'Scene with multiple objects round-trip', ( assert ) => {

			const scene = new Scene();
			scene.name = 'TestScene';
			scene.background = new Color( 0x87ceeb );

			const geometry = new BoxGeometry( 1, 1, 1 );
			const material = new MeshBasicMaterial( { color: 0xff0000 } );

			const mesh1 = new Mesh( geometry, material );
			mesh1.name = 'Mesh1';
			mesh1.position.set( 0, 0, 0 );

			const mesh2 = new Mesh( geometry, material );
			mesh2.name = 'Mesh2';
			mesh2.position.set( 2, 0, 0 );

			scene.add( mesh1, mesh2 );

			const json = scene.toJSON();
			const loader = new ObjectLoader();
			const restored = loader.parse( json );

			assert.ok( restored.isScene, 'Restored is Scene' );
			assert.strictEqual( restored.name, 'TestScene', 'Scene name preserved' );
			assert.strictEqual( restored.background.getHex(), 0x87ceeb, 'Background preserved' );
			assert.strictEqual( restored.children.length, 2, 'Has 2 children' );
			assert.strictEqual( restored.children[ 0 ].name, 'Mesh1', 'First child name' );
			assert.strictEqual( restored.children[ 1 ].name, 'Mesh2', 'Second child name' );

		} );

		QUnit.test( 'Hierarchy round-trip', ( assert ) => {

			const scene = new Scene();

			const parent = new Group();
			parent.name = 'Parent';
			parent.position.set( 1, 0, 0 );

			const child = new Group();
			child.name = 'Child';
			child.position.set( 0, 1, 0 );

			const grandchild = new Mesh(
				new BoxGeometry( 1, 1, 1 ),
				new MeshBasicMaterial( { color: 0xff0000 } )
			);
			grandchild.name = 'Grandchild';
			grandchild.position.set( 0, 0, 1 );

			child.add( grandchild );
			parent.add( child );
			scene.add( parent );

			const json = scene.toJSON();
			const loader = new ObjectLoader();
			const restored = loader.parse( json );

			const restoredParent = restored.children[ 0 ];
			const restoredChild = restoredParent.children[ 0 ];
			const restoredGrandchild = restoredChild.children[ 0 ];

			assert.strictEqual( restoredParent.name, 'Parent', 'Parent name' );
			assert.strictEqual( restoredChild.name, 'Child', 'Child name' );
			assert.strictEqual( restoredGrandchild.name, 'Grandchild', 'Grandchild name' );
			assert.strictEqual( restoredGrandchild.parent, restoredChild, 'Parent-child relation' );

		} );

		QUnit.test( 'BufferGeometry with custom attributes round-trip', ( assert ) => {

			const geometry = new BufferGeometry();
			geometry.setAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0, 1, 0, 0, 0, 1, 0 ], 3 ) );
			geometry.setAttribute( 'normal', new Float32BufferAttribute( [ 0, 0, 1, 0, 0, 1, 0, 0, 1 ], 3 ) );
			geometry.setAttribute( 'uv', new Float32BufferAttribute( [ 0, 0, 1, 0, 0.5, 1 ], 2 ) );

			const material = new MeshBasicMaterial( { color: 0xff0000 } );
			const mesh = new Mesh( geometry, material );

			const json = mesh.toJSON();
			const loader = new ObjectLoader();
			const restored = loader.parse( json );

			assert.ok( restored.geometry.attributes.position, 'Has position' );
			assert.ok( restored.geometry.attributes.normal, 'Has normal' );
			assert.ok( restored.geometry.attributes.uv, 'Has uv' );
			assert.strictEqual( restored.geometry.attributes.position.count, 3, 'Position count' );
			assert.strictEqual( restored.geometry.attributes.uv.itemSize, 2, 'UV itemSize' );

		} );

		QUnit.test( 'MeshStandardMaterial round-trip', ( assert ) => {

			const material = new MeshStandardMaterial( {
				color: 0xff0000,
				roughness: 0.3,
				metalness: 0.8,
				emissive: 0x00ff00,
				emissiveIntensity: 0.5
			} );

			const mesh = new Mesh( new BoxGeometry( 1, 1, 1 ), material );

			const json = mesh.toJSON();
			const loader = new ObjectLoader();
			const restored = loader.parse( json );

			assert.ok( restored.material.isMeshStandardMaterial, 'Is MeshStandardMaterial' );
			assert.strictEqual( restored.material.color.getHex(), 0xff0000, 'Color preserved' );
			assert.strictEqual( restored.material.roughness, 0.3, 'Roughness preserved' );
			assert.strictEqual( restored.material.metalness, 0.8, 'Metalness preserved' );
			assert.strictEqual( restored.material.emissive.getHex(), 0x00ff00, 'Emissive preserved' );
			assert.strictEqual( restored.material.emissiveIntensity, 0.5, 'EmissiveIntensity preserved' );

		} );

		QUnit.test( 'Lights round-trip', ( assert ) => {

			const scene = new Scene();

			const ambient = new AmbientLight( 0xffffff, 0.5 );
			ambient.name = 'Ambient';

			const directional = new DirectionalLight( 0xffffff, 1 );
			directional.name = 'Directional';
			directional.position.set( 5, 10, 5 );

			const point = new PointLight( 0xff0000, 2, 50, 2 );
			point.name = 'Point';
			point.position.set( 0, 5, 0 );

			scene.add( ambient, directional, point );
			scene.updateMatrixWorld( true );

			const json = scene.toJSON();
			const loader = new ObjectLoader();
			const restored = loader.parse( json );

			const restoredAmbient = restored.getObjectByName( 'Ambient' );
			const restoredDirectional = restored.getObjectByName( 'Directional' );
			const restoredPoint = restored.getObjectByName( 'Point' );

			assert.ok( restoredAmbient.isAmbientLight, 'Ambient is AmbientLight' );
			assert.strictEqual( restoredAmbient.intensity, 0.5, 'Ambient intensity' );

			assert.ok( restoredDirectional.isDirectionalLight, 'Directional is DirectionalLight' );
			assert.strictEqual( restoredDirectional.position.x, 5, 'Directional position.x' );

			assert.ok( restoredPoint.isPointLight, 'Point is PointLight' );
			assert.strictEqual( restoredPoint.color.getHex(), 0xff0000, 'Point color' );
			assert.strictEqual( restoredPoint.distance, 50, 'Point distance' );
			assert.strictEqual( restoredPoint.decay, 2, 'Point decay' );

		} );

		QUnit.test( 'Cameras round-trip', ( assert ) => {

			const scene = new Scene();

			const perspective = new PerspectiveCamera( 75, 16 / 9, 0.1, 1000 );
			perspective.name = 'Perspective';
			perspective.position.set( 0, 0, 5 );
			perspective.zoom = 1.5;

			const ortho = new OrthographicCamera( - 10, 10, 10, - 10, 0.1, 100 );
			ortho.name = 'Ortho';
			ortho.position.set( 0, 10, 0 );

			scene.add( perspective, ortho );

			const json = scene.toJSON();
			const loader = new ObjectLoader();
			const restored = loader.parse( json );

			const restoredPerspective = restored.getObjectByName( 'Perspective' );
			const restoredOrtho = restored.getObjectByName( 'Ortho' );

			assert.ok( restoredPerspective.isPerspectiveCamera, 'Is PerspectiveCamera' );
			assert.strictEqual( restoredPerspective.fov, 75, 'FOV preserved' );
			assert.strictEqual( restoredPerspective.zoom, 1.5, 'Zoom preserved' );

			assert.ok( restoredOrtho.isOrthographicCamera, 'Is OrthographicCamera' );
			assert.strictEqual( restoredOrtho.left, - 10, 'Left preserved' );
			assert.strictEqual( restoredOrtho.right, 10, 'Right preserved' );

		} );

		QUnit.test( 'Scene with Fog round-trip', ( assert ) => {

			const scene = new Scene();
			scene.fog = new Fog( 0xffffff, 10, 100 );
			scene.fog.name = 'TestFog';

			const json = scene.toJSON();
			const loader = new ObjectLoader();
			const restored = loader.parse( json );

			assert.ok( restored.fog.isFog, 'Has Fog' );
			assert.strictEqual( restored.fog.color.getHex(), 0xffffff, 'Fog color' );
			assert.strictEqual( restored.fog.near, 10, 'Fog near' );
			assert.strictEqual( restored.fog.far, 100, 'Fog far' );
			assert.strictEqual( restored.fog.name, 'TestFog', 'Fog name' );

		} );

		QUnit.test( 'Object transforms round-trip', ( assert ) => {

			const mesh = new Mesh(
				new BoxGeometry( 1, 1, 1 ),
				new MeshBasicMaterial( { color: 0xff0000 } )
			);

			mesh.position.set( 1, 2, 3 );
			mesh.rotation.set( Math.PI / 4, Math.PI / 2, 0 );
			mesh.scale.set( 2, 2, 2 );
			mesh.updateMatrix();

			const json = mesh.toJSON();
			const loader = new ObjectLoader();
			const restored = loader.parse( json );

			assert.ok( Math.abs( restored.position.x - 1 ) < 0.0001, 'Position.x' );
			assert.ok( Math.abs( restored.position.y - 2 ) < 0.0001, 'Position.y' );
			assert.ok( Math.abs( restored.position.z - 3 ) < 0.0001, 'Position.z' );
			assert.ok( Math.abs( restored.scale.x - 2 ) < 0.0001, 'Scale.x' );
			assert.ok( Math.abs( restored.scale.y - 2 ) < 0.0001, 'Scale.y' );
			assert.ok( Math.abs( restored.scale.z - 2 ) < 0.0001, 'Scale.z' );

		} );

		QUnit.test( 'userData round-trip', ( assert ) => {

			const mesh = new Mesh(
				new BoxGeometry( 1, 1, 1 ),
				new MeshBasicMaterial( { color: 0xff0000 } )
			);

			mesh.userData = {
				customString: 'hello',
				customNumber: 42,
				customBool: true,
				customArray: [ 1, 2, 3 ],
				customObject: { nested: 'value' }
			};

			const json = mesh.toJSON();
			const loader = new ObjectLoader();
			const restored = loader.parse( json );

			assert.strictEqual( restored.userData.customString, 'hello', 'String preserved' );
			assert.strictEqual( restored.userData.customNumber, 42, 'Number preserved' );
			assert.strictEqual( restored.userData.customBool, true, 'Bool preserved' );
			assert.deepEqual( restored.userData.customArray, [ 1, 2, 3 ], 'Array preserved' );
			assert.deepEqual( restored.userData.customObject, { nested: 'value' }, 'Object preserved' );

		} );

		QUnit.test( 'Object properties round-trip', ( assert ) => {

			const mesh = new Mesh(
				new BoxGeometry( 1, 1, 1 ),
				new MeshBasicMaterial( { color: 0xff0000 } )
			);

			mesh.visible = false;
			mesh.castShadow = true;
			mesh.receiveShadow = true;
			mesh.frustumCulled = false;
			mesh.renderOrder = 5;

			const json = mesh.toJSON();
			const loader = new ObjectLoader();
			const restored = loader.parse( json );

			assert.strictEqual( restored.visible, false, 'Visible' );
			assert.strictEqual( restored.castShadow, true, 'CastShadow' );
			assert.strictEqual( restored.receiveShadow, true, 'ReceiveShadow' );
			assert.strictEqual( restored.frustumCulled, false, 'FrustumCulled' );
			assert.strictEqual( restored.renderOrder, 5, 'RenderOrder' );

		} );

		QUnit.test( 'Shared geometry/material round-trip', ( assert ) => {

			const scene = new Scene();

			const geometry = new BoxGeometry( 1, 1, 1 );
			const material = new MeshBasicMaterial( { color: 0xff0000 } );

			const mesh1 = new Mesh( geometry, material );
			mesh1.name = 'Mesh1';

			const mesh2 = new Mesh( geometry, material );
			mesh2.name = 'Mesh2';
			mesh2.position.x = 2;

			scene.add( mesh1, mesh2 );

			const json = scene.toJSON();
			const loader = new ObjectLoader();
			const restored = loader.parse( json );

			const restoredMesh1 = restored.getObjectByName( 'Mesh1' );
			const restoredMesh2 = restored.getObjectByName( 'Mesh2' );

			assert.strictEqual( restoredMesh1.geometry, restoredMesh2.geometry, 'Geometry shared' );
			assert.strictEqual( restoredMesh1.material, restoredMesh2.material, 'Material shared' );

		} );

		QUnit.test( 'Complex scene round-trip', ( assert ) => {

			const scene = new Scene();
			scene.name = 'ComplexScene';
			scene.background = new Color( 0x333333 );
			scene.fog = new Fog( 0x333333, 10, 100 );

			const group = new Group();
			group.name = 'ObjectsGroup';

			const geometry1 = new BoxGeometry( 1, 1, 1 );
			const geometry2 = new SphereGeometry( 0.5, 16, 8 );

			const material1 = new MeshBasicMaterial( { color: 0xff0000 } );
			const material2 = new MeshStandardMaterial( { color: 0x00ff00, roughness: 0.5 } );

			const box = new Mesh( geometry1, material1 );
			box.name = 'Box';
			box.position.set( - 2, 0, 0 );

			const sphere = new Mesh( geometry2, material2 );
			sphere.name = 'Sphere';
			sphere.position.set( 2, 0, 0 );

			group.add( box, sphere );
			scene.add( group );

			const ambient = new AmbientLight( 0xffffff, 0.3 );
			scene.add( ambient );

			const directional = new DirectionalLight( 0xffffff, 1 );
			directional.position.set( 5, 10, 5 );
			scene.add( directional );

			const camera = new PerspectiveCamera( 75, 1, 0.1, 1000 );
			camera.name = 'MainCamera';
			camera.position.set( 0, 0, 10 );
			scene.add( camera );

			const json = scene.toJSON();
			const loader = new ObjectLoader();
			const restored = loader.parse( json );

			assert.ok( restored.isScene, 'Is Scene' );
			assert.strictEqual( restored.name, 'ComplexScene', 'Scene name' );
			assert.strictEqual( restored.background.getHex(), 0x333333, 'Background' );
			assert.ok( restored.fog.isFog, 'Has Fog' );

			const restoredGroup = restored.getObjectByName( 'ObjectsGroup' );
			assert.ok( restoredGroup.isGroup, 'Group found' );
			assert.strictEqual( restoredGroup.children.length, 2, 'Group has 2 children' );

			const restoredBox = restored.getObjectByName( 'Box' );
			const restoredSphere = restored.getObjectByName( 'Sphere' );
			assert.ok( restoredBox.isMesh, 'Box found' );
			assert.ok( restoredSphere.isMesh, 'Sphere found' );

			const restoredCamera = restored.getObjectByName( 'MainCamera' );
			assert.ok( restoredCamera.isPerspectiveCamera, 'Camera found' );

		} );

	} );

} );
