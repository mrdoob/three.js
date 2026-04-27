const ISSUE_CODES = {
	UNSUPPORTED_NODE: 'unsupported-node',
	IGNORED_SURFACE_INPUT: 'ignored-surface-input',
	MISSING_REFERENCE: 'missing-reference',
	MISSING_MATERIAL: 'missing-material',
	INVALID_VALUE: 'invalid-value',
};

const ISSUE_POLICIES = {
	WARN: 'warn',
	ERROR_CORE: 'error-core',
	ERROR_ALL: 'error-all',
};

const LEGACY_POLICY_ALIASES = {
	error: ISSUE_POLICIES.ERROR_CORE,
};

function normalizeIssuePolicy( policy ) {

	const normalized = policy && typeof policy === 'string' ? policy : ISSUE_POLICIES.WARN;
	if ( normalized in LEGACY_POLICY_ALIASES ) {

		return LEGACY_POLICY_ALIASES[ normalized ];

	}

	if ( normalized === ISSUE_POLICIES.WARN || normalized === ISSUE_POLICIES.ERROR_CORE || normalized === ISSUE_POLICIES.ERROR_ALL ) {

		return normalized;

	}

	return ISSUE_POLICIES.WARN;

}

class MaterialXIssueCollector {

	constructor( options = {} ) {

		this.issuePolicy = normalizeIssuePolicy( options.issuePolicy || options.unsupportedPolicy );
		this.onWarning = options.onWarning || null;
		this.issues = [];

	}

	addIssue( issue ) {

		const normalizedIssue = {
			code: issue.code || ISSUE_CODES.INVALID_VALUE,
			message: issue.message || 'Unknown MaterialX issue.',
			category: issue.category,
			nodeName: issue.nodeName,
			severity: issue.severity || 'warning',
		};

		this.issues.push( normalizedIssue );

		if ( normalizedIssue.severity === 'warning' ) {

			if ( this.issuePolicy === ISSUE_POLICIES.WARN ) {

				console.warn( `THREE.MaterialXLoader: ${normalizedIssue.message}` );

			}

			if ( this.onWarning ) {

				this.onWarning( normalizedIssue );

			}

		}

	}

	addUnsupportedNode( category, nodeName ) {

		this.addIssue( {
			code: ISSUE_CODES.UNSUPPORTED_NODE,
			category,
			nodeName,
			message: `Unsupported MaterialX node category "${category}"${nodeName ? ` on "${nodeName}"` : ''}.`,
		} );

	}

	addIgnoredSurfaceInput( category, nodeName, inputName ) {

		this.addIssue( {
			code: ISSUE_CODES.IGNORED_SURFACE_INPUT,
			category,
			nodeName,
			message: `${category} input "${inputName}" is currently ignored in MaterialX translation.`,
		} );

	}

	addMissingReference( nodeName, referencePath ) {

		this.addIssue( {
			code: ISSUE_CODES.MISSING_REFERENCE,
			nodeName,
			message: `Missing MaterialX reference "${referencePath}"${nodeName ? ` from "${nodeName}"` : ''}.`,
		} );

	}

	addInvalidValue( nodeName, message ) {

		this.addIssue( {
			code: ISSUE_CODES.INVALID_VALUE,
			nodeName,
			message,
		} );

	}

	addMissingMaterial( materialName ) {

		this.addIssue( {
			code: ISSUE_CODES.MISSING_MATERIAL,
			message: materialName
				? `Could not find surfacematerial named "${materialName}".`
				: 'Document does not include a surfacematerial node.',
		} );

	}

	buildReport() {

		const ignoredSurfaceInputs = this.issues.filter( ( issue ) => issue.code === ISSUE_CODES.IGNORED_SURFACE_INPUT );
		const missingReferences = this.issues.filter( ( issue ) => issue.code === ISSUE_CODES.MISSING_REFERENCE );
		const invalidValues = this.issues.filter( ( issue ) => issue.code === ISSUE_CODES.INVALID_VALUE );

		return {
			issues: this.issues,
			warnings: this.issues,
			ignoredSurfaceInputs,
			missingReferences,
			invalidValues,
		};

	}

	throwIfNeeded() {

		if ( this.issuePolicy === ISSUE_POLICIES.WARN ) return;

		const coreCodes = new Set( [ ISSUE_CODES.UNSUPPORTED_NODE, ISSUE_CODES.MISSING_REFERENCE, ISSUE_CODES.INVALID_VALUE ] );
		const fatalIssues = this.issues.filter( ( issue ) =>
			this.issuePolicy === ISSUE_POLICIES.ERROR_ALL ? true : coreCodes.has( issue.code ) );
		if ( fatalIssues.length === 0 ) return;

		const detailsByCode = new Map();
		for ( const issue of fatalIssues ) {

			const count = detailsByCode.get( issue.code ) || 0;
			detailsByCode.set( issue.code, count + 1 );

		}

		const details = [];
		const unsupportedNodes = this.issues.filter( ( issue ) => issue.code === ISSUE_CODES.UNSUPPORTED_NODE );
		if ( detailsByCode.has( ISSUE_CODES.UNSUPPORTED_NODE ) ) {

			const categoryList = [ ...new Set( unsupportedNodes.map( ( issue ) => issue.category ).filter( Boolean ) ) ].sort().join( ', ' );
			details.push( `unsupported node categories${categoryList ? `: ${categoryList}` : ''} (${detailsByCode.get( ISSUE_CODES.UNSUPPORTED_NODE )})` );

		}

		if ( detailsByCode.has( ISSUE_CODES.MISSING_REFERENCE ) ) {

			details.push( `missing references (${detailsByCode.get( ISSUE_CODES.MISSING_REFERENCE )})` );

		}

		if ( detailsByCode.has( ISSUE_CODES.INVALID_VALUE ) ) {

			details.push( `invalid values (${detailsByCode.get( ISSUE_CODES.INVALID_VALUE )})` );

		}

		if ( detailsByCode.has( ISSUE_CODES.IGNORED_SURFACE_INPUT ) ) {

			details.push( `ignored surface inputs (${detailsByCode.get( ISSUE_CODES.IGNORED_SURFACE_INPUT )})` );

		}

		if ( detailsByCode.has( ISSUE_CODES.MISSING_MATERIAL ) ) {

			details.push( `missing materials (${detailsByCode.get( ISSUE_CODES.MISSING_MATERIAL )})` );

		}

		throw new Error(
			`THREE.MaterialXLoader: MaterialX translation failed in ${this.issuePolicy} mode; ${details.join( '; ' )}.`,
		);

	}

}

export { ISSUE_CODES, ISSUE_POLICIES, MaterialXIssueCollector, normalizeIssuePolicy };
