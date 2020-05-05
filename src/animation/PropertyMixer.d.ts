export class PropertyMixer {

	constructor( binding: any, typeName: string, valueSize: number );

	binding: any;
	valueSize: number;
	buffer: any;
	cumulativeWeight: number;
	cumulativeWeightAdditive: number;
	useCount: number;
	referenceCount: number;

	accumulate( accuIndex: number, weight: number ): void;
	accumulateAdditive( weight: number ): void;
	apply( accuIndex: number ): void;
	saveOriginalState(): void;
	restoreOriginalState(): void;

}
