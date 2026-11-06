import * as fs from 'node:fs/promises';

export default async function setup() {

	await fs.rm( 'test/e2e/output-screenshots', { recursive: true, force: true } );
	await fs.mkdir( 'test/e2e/output-screenshots', { recursive: true } );

}
