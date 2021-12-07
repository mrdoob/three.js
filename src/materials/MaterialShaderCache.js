let shadercount = 0;
const shaderToShaderID = {};
const shaderIDToMaterial = {};
function getShaderID( shader ) {

	let shaderID = shaderToShaderID[ shader ];
	if ( shaderID === undefined ) {

		shaderID = shadercount;
		shaderToShaderID[ shader ] = shaderID;
		shadercount ++;

	}

	return shaderID;

}

class MaterialShaderCache {

	static addShaderMaterial( material, shader ) {

		const shaderID = getShaderID( shader );
		shaderIDToMaterial[ shaderID ] = shaderIDToMaterial[ shaderID ] || [];
		shaderIDToMaterial[ shaderID ].push( material.uuid );
		return shaderID;

	}

	static removeShaderMaterial( material, shader ) {

		const shaderID = getShaderID( shader );

		if ( shaderIDToMaterial[ shaderID ] !== undefined ) {

			const materials = shaderIDToMaterial[ shaderID ];
			const index = materials.indexOf( material.uuid );
			if ( index !== - 1 ) {

				materials.splice( index, 1 );

			}

			if ( materials.length === 0 ) {

				delete shaderToShaderID[ shader ];
				delete shaderIDToMaterial[ shaderID ];

			}


		}

	}

}

export { MaterialShaderCache };
