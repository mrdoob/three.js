import * as Materials from '../materials/Materials.js';

function fromType( type ) {

	return new Materials[ type ]();

}

export { fromType };
