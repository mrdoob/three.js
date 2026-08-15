import { ThreeMFLoader } from '../../../../examples/jsm/loaders/3MFLoader.js';
import { strToU8, zipSync } from '../../../../examples/jsm/libs/fflate.module.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Loaders', () => {

		QUnit.module( '3MFLoader', () => {

			QUnit.test( 'parses Beam Lattice beams and balls', ( assert ) => {

				const rels = `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
	<Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel" />
</Relationships>`;
				const model = `<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02" xmlns:b="http://schemas.microsoft.com/3dmanufacturing/beamlattice/2017/02" xmlns:b2="http://schemas.microsoft.com/3dmanufacturing/beamlattice/balls/2020/07">
	<resources>
		<object id="1" type="model">
			<mesh>
				<vertices>
					<vertex x="0" y="0" z="0" />
					<vertex x="0" y="10" z="0" />
				</vertices>
				<triangles />
				<b:beamlattice minlength="0.1" radius="1" ballmode="mixed" ballradius="1.5">
					<b:beams>
						<b:beam v1="0" v2="1" r1="1" r2="2" cap1="butt" cap2="butt" />
					</b:beams>
					<b2:balls>
						<b2:ball vindex="0" r="3" />
						<b2:ball vindex="1" />
					</b2:balls>
				</b:beamlattice>
			</mesh>
		</object>
	</resources>
	<build>
		<item objectid="1" />
	</build>
</model>`;
				const data = zipSync( {
					'_rels/.rels': strToU8( rels ),
					'3D/3dmodel.model': strToU8( model )
				} );
				const object = new ThreeMFLoader().parse( data.buffer );
				const geometries = [];

				object.traverse( ( child ) => {

					if ( child.isMesh ) geometries.push( child.geometry );

				} );

				assert.strictEqual( geometries.length, 3, 'One beam and two balls are created.' );
				assert.strictEqual( geometries[ 0 ].type, 'CylinderGeometry', 'The beam is represented by a cylinder.' );
				assert.strictEqual( geometries[ 0 ].parameters.radiusBottom, 1, 'The beam uses r1 at its first vertex.' );
				assert.strictEqual( geometries[ 0 ].parameters.radiusTop, 2, 'The beam uses r2 at its second vertex.' );
				assert.strictEqual( geometries[ 1 ].type, 'SphereGeometry', 'The first ball is represented by a sphere.' );
				assert.strictEqual( geometries[ 1 ].parameters.radius, 3, 'The first ball uses its explicit radius.' );
				assert.strictEqual( geometries[ 2 ].parameters.radius, 1.5, 'The second ball uses the lattice default radius.' );

			} );

		} );

	} );

} );
