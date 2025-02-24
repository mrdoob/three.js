const env = require( 'jsdoc/env' );
const fs = require( 'jsdoc/fs' );
const helper = require( 'jsdoc/util/templateHelper' );
const logger = require( 'jsdoc/util/logger' );
const path = require( 'jsdoc/path' );
const { taffy } = require( '@jsdoc/salty' );
const template = require( 'jsdoc/template' );
const util = require( 'util' );

const htmlsafe = helper.htmlsafe;
const linkto = helper.linkto;
const resolveAuthorLinks = helper.resolveAuthorLinks;
const hasOwnProp = Object.prototype.hasOwnProperty;

let data;
let view;

let outdir = path.normalize( env.opts.destination );
const themeOpts = ( env.opts.themeOpts ) || {};

function mkdirSync( filepath ) {

	return fs.mkdirSync( filepath, { recursive: true } );

}

function find( spec ) {

	return helper.find( data, spec );

}

function getAncestorLinks( doclet ) {

	return helper.getAncestorLinks( data, doclet );

}

function hashToLink( doclet, hash ) {

	let url;

	if ( ! /^(#.+)/.test( hash ) ) {

		return hash;

	}

	url = helper.createLink( doclet );
	url = url.replace( /(#.+|$)/, hash );

	return `<a href="${url}">${hash}</a>`;

}

function needsSignature( { kind, type, meta } ) {

	let needsSig = false;

	// function and class definitions always get a signature
	if ( kind === 'function' || kind === 'class' ) {

		needsSig = true;

	} else if ( kind === 'typedef' && type && type.names && type.names.length ) {

		// typedefs that contain functions get a signature, too

		for ( let i = 0, l = type.names.length; i < l; i ++ ) {

			if ( type.names[ i ].toLowerCase() === 'function' ) {

				needsSig = true;
				break;

			}

		}

	} else if ( kind === 'namespace' && meta && meta.code && meta.code.type && meta.code.type.match( /[Ff]unction/ ) ) {

		// and namespaces that are functions get a signature (but finding them is a
		// bit messy)

		needsSig = true;

	}

	return needsSig;

}

function updateItemName( item ) {

	let itemName = item.name || '';

	if ( item.variable ) {

		itemName = `&hellip;${itemName}`;

	}

	return itemName;

}

function addParamAttributes( params ) {

	return params.filter( ( { name } ) => name && ! name.includes( '.' ) ).map( updateItemName );

}

function buildItemTypeStrings( item ) {

	const types = [];

	if ( item && item.type && item.type.names ) {

		item.type.names.forEach( name => {

			types.push( linkto( name, htmlsafe( name ) ) );

		} );

	}

	return types;

}

function buildSearchListForData() {

	const searchList = [];

	data().each( ( item ) => {

		if ( item.kind !== 'package' && ! item.inherited ) {

			searchList.push( {
				title: item.longname,
				link: linkto( item.longname, item.name ),
				description: item.description,
			} );

		}

	} );

	return searchList;

}

function buildAttribsString( attribs ) {

	let attribsString = '';

	if ( attribs && attribs.length ) {

		attribsString = htmlsafe( util.format( '(%s) ', attribs.join( ', ' ) ) );

	}

	return attribsString;

}

function addNonParamAttributes( items ) {

	let types = [];

	items.forEach( item => {

		types = types.concat( buildItemTypeStrings( item ) );

	} );

	return types;

}

function addSignatureParams( f ) {

	const params = f.params ? addParamAttributes( f.params ) : [];

	f.signature = util.format( '%s(%s)', ( f.signature || '' ), params.join( ', ' ) );

}

function addSignatureReturns( f ) {

	const attribs = [];
	let attribsString = '';
	let returnTypes = [];
	let returnTypesString = '';
	const source = f.yields || f.returns;

	// jam all the return-type attributes into an array. this could create odd results (for example,
	// if there are both nullable and non-nullable return types), but let's assume that most people
	// who use multiple @return tags aren't using Closure Compiler type annotations, and vice-versa.
	if ( source ) {

		source.forEach( item => {

			helper.getAttribs( item ).forEach( attrib => {

				if ( ! attribs.includes( attrib ) ) {

					attribs.push( attrib );

				}

			} );

		} );

		attribsString = buildAttribsString( attribs );

	}

	if ( source ) {

		returnTypes = addNonParamAttributes( source );

	}

	if ( returnTypes.length ) {

		returnTypesString = util.format( ' &rarr; %s{%s}', attribsString, returnTypes.join( '|' ) );

	}

	f.signature = `<span class="signature">${f.signature || ''}</span><span class="type-signature">${returnTypesString}</span>`;

}

function addSignatureTypes( f ) {

	const types = f.type ? buildItemTypeStrings( f ) : [];

	f.signature = `${f.signature || ''}<span class="type-signature">${types.length ? ` :${types.join( '|' )}` : ''}</span>`;

}

function addAttribs( f ) {

	const attribs = helper.getAttribs( f );
	const attribsString = buildAttribsString( attribs );

	f.attribs = util.format( '<span class="type-signature">%s</span>', attribsString );

}

function shortenPaths( files, commonPrefix ) {

	Object.keys( files ).forEach( file => {

		files[ file ].shortened = files[ file ].resolved.replace( commonPrefix, '' )
		// always use forward slashes
			.replace( /\\/g, '/' );

	} );

	return files;

}

function getPathFromDoclet( { meta } ) {

	if ( ! meta ) {

		return null;

	}

	return meta.path && meta.path !== 'null' ?
		path.join( meta.path, meta.filename ) :
		meta.filename;

}

function generate( title, docs, filename, resolveLinks ) {

	let html;

	resolveLinks = resolveLinks !== false;

	const docData = {
		env: env,
		title: title,
		docs: docs
	};

	const outpath = path.join( outdir, filename );
	html = view.render( 'container.tmpl', docData );

	if ( resolveLinks ) {

		html = helper.resolveLinks( html ); // turn {@link foo} into <a href="foodoc.html">foo</a>

	}

	fs.writeFileSync( outpath, html, 'utf8' );

}

function generateSourceFiles( sourceFiles, encoding = 'utf8' ) {

	Object.keys( sourceFiles ).forEach( file => {

		let source;
		// links are keyed to the shortened path in each doclet's `meta.shortpath` property
		const sourceOutfile = helper.getUniqueFilename( sourceFiles[ file ].shortened );

		helper.registerLink( sourceFiles[ file ].shortened, sourceOutfile );

		try {

			source = {
				kind: 'source',
				code: helper.htmlsafe( fs.readFileSync( sourceFiles[ file ].resolved, encoding ) )
			};

		} catch ( e ) {

			logger.error( 'Error while generating source file %s: %s', file, e.message );

		}

		generate( `Source: ${sourceFiles[ file ].shortened}`, [ source ], sourceOutfile,
			false );

	} );

}

function buildClassNav( items, itemsSeen, linktoFn ) {

	const coreDirectory = 'src';
	const addonsDirectory = 'examples/jsm';

	const hierarchy = new Map();
	hierarchy.set( 'Core', new Map() );
	hierarchy.set( 'Addons', new Map() );

	let nav = '';

	if ( items.length ) {

		items.forEach( item => {

			let displayName;
			let itemNav = '';

			if ( ! hasOwnProp.call( itemsSeen, item.longname ) ) {

				if ( env.conf.templates.default.useLongnameInNav ) {

					displayName = item.longname;

				} else {

					displayName = item.name;

				}

				itemNav += `<li data-name="${item.longname}">${linktoFn( item.longname, displayName.replace( /\b(module|event):/g, '' ) )}</li>`;

				itemsSeen[ item.longname ] = true;

				const path = item.meta.shortpath;

				if ( path.startsWith( coreDirectory ) ) {

					const subCategory = path.split( '/' )[ 1 ];

					pushNavItem( hierarchy, 'Core', subCategory, itemNav );

				} else if ( path.startsWith( addonsDirectory ) ) {

					const subCategory = path.split( '/' )[ 2 ];

					pushNavItem( hierarchy, 'Addons', subCategory, itemNav );

				}

			}

		} );

		for ( const [ mainCategory, map ] of hierarchy ) {

			nav += `<h2>${mainCategory}</h2>`;

			const sortedMap = new Map( [ ...map.entries() ].sort() ); // sort sub categories

			for ( const [ subCategory, links ] of sortedMap ) {

				nav += `<h3>${subCategory}</h3>`;

				let navItems = '';

				for ( const link of links ) {

					navItems += link;

				}

				nav += `<ul>${navItems}</ul>`;

			}

		}

	}

	return nav;

}

function buildGlobalsNav( globals, seen ) {

	let globalNav;
	let nav = '';

	if ( globals.length ) {

		// TSL

		let tslNav = '';

		globals.forEach( ( { kind, longname, name, tags } ) => {

			if ( kind !== 'typedef' && ! hasOwnProp.call( seen, longname ) && Array.isArray( tags ) && tags[ 0 ].title === 'tsl' ) {

				tslNav += `<li data-name="${longname}">${linkto( longname, name )}</li>`;

				seen[ longname ] = true;

			}

		} );

		nav += `<h2>TSL</h2><ul>${tslNav}</ul>`;

		// Globals

		globalNav = '';

		globals.forEach( ( { kind, longname, name } ) => {

			if ( kind !== 'typedef' && ! hasOwnProp.call( seen, longname ) ) {

				globalNav += `<li data-name="${longname}">${linkto( longname, name )}</li>`;

			}

			seen[ longname ] = true;

		} );

		if ( ! globalNav ) {

			// turn the heading into a link so you can actually get to the global page
			nav += `<h3>${linkto( 'global', 'Global' )}</h3>`;

		} else {

			nav += `<h2>Global</h2><ul>${globalNav}</ul>`;

		}

	}

	return nav;

}

function pushNavItem( hierarchy, mainCategory, subCategory, itemNav ) {

	subCategory = subCategory[ 0 ].toUpperCase() + subCategory.slice( 1 ); // capitalize

	if ( hierarchy.get( mainCategory ).get( subCategory ) === undefined ) {

		hierarchy.get( mainCategory ).set( subCategory, [] );

	}

	const categoryList = hierarchy.get( mainCategory ).get( subCategory );

	categoryList.push( itemNav );

}

/**
 * Create the navigation sidebar.
 * @param {Object} members The members that will be used to create the sidebar.
 * @param {Array<Object>} members.classes
 * @return {string} The HTML for the navigation sidebar.
 */
function buildNav( members ) {

	let nav = '';
	const seen = {};

	nav += buildClassNav( members.classes, seen, linkto );
	nav += buildGlobalsNav( members.globals, seen );

	return nav;

}

/**
    @param {TAFFY} taffyData See <http://taffydb.com/>.
    @param {Object} opts
    @param {Tutorial} tutorials
 */
exports.publish = ( taffyData, opts, tutorials ) => {

	const sourceFilePaths = [];
	let sourceFiles = {};
	let staticFileFilter;
	let staticFilePaths;
	let staticFileScanner;

	data = taffyData;

	const conf = env.conf.templates || {};
	conf.default = conf.default || {};

	const templatePath = path.normalize( opts.template );
	view = new template.Template( path.join( templatePath, 'tmpl' ) );

	// claim some special filenames in advance, so the All-Powerful Overseer of Filename Uniqueness
	// doesn't try to hand them out later
	const indexUrl = helper.getUniqueFilename( 'index' );
	// don't call registerLink() on this one! 'index' is also a valid longname

	const globalUrl = helper.getUniqueFilename( 'global' );
	helper.registerLink( 'global', globalUrl );

	// set up templating
	view.layout = conf.default.layoutFile ?
		path.getResourcePath( path.dirname( conf.default.layoutFile ),
			path.basename( conf.default.layoutFile ) ) :
		'layout.tmpl';

	// set up tutorials for helper
	helper.setTutorials( tutorials );

	data = helper.prune( data );
	data.sort( 'longname, version, since' );
	helper.addEventListeners( data );

	data().each( doclet => {

		let sourcePath;

		doclet.attribs = '';

		if ( doclet.see ) {

			doclet.see.forEach( ( seeItem, i ) => {

				doclet.see[ i ] = hashToLink( doclet, seeItem );

			} );

		}

		// build a list of source files
		if ( doclet.meta ) {

			sourcePath = getPathFromDoclet( doclet );
			sourceFiles[ sourcePath ] = {
				resolved: sourcePath,
				shortened: null
			};
			if ( ! sourceFilePaths.includes( sourcePath ) ) {

				sourceFilePaths.push( sourcePath );

			}

		}

	} );

	// update outdir if necessary, then create outdir
	const packageInfo = ( find( { kind: 'package' } ) || [] )[ 0 ];
	if ( packageInfo && packageInfo.name ) {

		outdir = path.join( outdir, packageInfo.name, ( packageInfo.version || '' ) );

	}

	fs.mkPath( outdir );

	// copy the template's static files to outdir
	const fromDir = path.join( templatePath, 'static' );
	const staticFiles = fs.ls( fromDir, 3 );

	staticFiles.forEach( fileName => {

		const toDir = fs.toDir( fileName.replace( fromDir, outdir ) );

		fs.mkPath( toDir );
		fs.copyFileSync( fileName, toDir );

	} );

	// copy user-specified static files to outdir
	if ( conf.default.staticFiles ) {

		// The canonical property name is `include`. We accept `paths` for backwards compatibility
		// with a bug in JSDoc 3.2.x.
		staticFilePaths = conf.default.staticFiles.include ||
            conf.default.staticFiles.paths ||
            [];
		staticFileFilter = new ( require( 'jsdoc/src/filter' ).Filter )( conf.default.staticFiles );
		staticFileScanner = new ( require( 'jsdoc/src/scanner' ).Scanner )();

		staticFilePaths.forEach( filePath => {

			filePath = path.resolve( env.pwd, filePath );
			const extraStaticFiles = staticFileScanner.scan( [ filePath ], 10, staticFileFilter );

			extraStaticFiles.forEach( fileName => {

				const sourcePath = fs.toDir( filePath );
				const toDir = fs.toDir( fileName.replace( sourcePath, outdir ) );

				fs.mkPath( toDir );
				fs.copyFileSync( fileName, toDir );

			} );

		} );

	}

	if ( sourceFilePaths.length ) {

		sourceFiles = shortenPaths( sourceFiles, path.commonPrefix( sourceFilePaths ) );

	}

	data().each( doclet => {

		let docletPath;
		const url = helper.createLink( doclet );

		helper.registerLink( doclet.longname, url );

		// add a shortened version of the full path
		if ( doclet.meta ) {

			docletPath = getPathFromDoclet( doclet );
			docletPath = sourceFiles[ docletPath ].shortened;
			if ( docletPath ) {

				doclet.meta.shortpath = docletPath;

			}

		}

	} );

	data().each( doclet => {

		const url = helper.longnameToUrl[ doclet.longname ];

		if ( url.includes( '#' ) ) {

			doclet.id = helper.longnameToUrl[ doclet.longname ].split( /#/ ).pop();

		} else {

			doclet.id = doclet.name;

		}

		if ( needsSignature( doclet ) ) {

			addSignatureParams( doclet );
			addSignatureReturns( doclet );
			addAttribs( doclet );

		}

	} );

	// do this after the urls have all been generated
	data().each( doclet => {

		doclet.ancestors = getAncestorLinks( doclet );

		if ( doclet.kind === 'member' ) {

			addSignatureTypes( doclet );
			addAttribs( doclet );

		}

		if ( doclet.kind === 'constant' ) {

			addSignatureTypes( doclet );
			addAttribs( doclet );
			doclet.kind = 'member';

		}

	} );

	const members = helper.getMembers( data );
	members.tutorials = tutorials.children;

	// output pretty-printed source files by default
	const outputSourceFiles = conf.default && conf.default.outputSourceFiles !== false;

	// add template helpers
	view.find = find;
	view.linkto = linkto;
	view.resolveAuthorLinks = resolveAuthorLinks;
	view.htmlsafe = htmlsafe;
	view.outputSourceFiles = outputSourceFiles;
	view.ignoreInheritedSymbols = themeOpts.ignoreInheritedSymbols;

	// once for all
	view.nav = buildNav( members );

	// generate the pretty-printed source files first so other pages can link to them
	if ( outputSourceFiles ) {

		generateSourceFiles( sourceFiles, opts.encoding );

	}

	if ( members.globals.length ) {

		generate( 'Global', [ { kind: 'globalobj' } ], globalUrl );

	}

	// index page displays information from package.json and lists files
	const files = find( { kind: 'file' } );
	const packages = find( { kind: 'package' } );

	generate( '', // MODIFIED (Remove Home title)
		packages.concat(
			[ {
				kind: 'mainpage',
				readme: opts.readme,
				longname: ( opts.mainpagetitle ) ? opts.mainpagetitle : 'Main Page'
			} ]
		).concat( files ), indexUrl );

	// set up the lists that we'll use to generate pages
	const classes = taffy( members.classes );

	Object.keys( helper.longnameToUrl ).forEach( longname => {

		const myClasses = helper.find( classes, { longname: longname } );

		if ( myClasses.length ) {

			generate( `${myClasses[ 0 ].name}`, myClasses, helper.longnameToUrl[ longname ] );

		}

	} );

	// search

	const searchList = buildSearchListForData();

	mkdirSync( path.join( outdir, 'data' ) );

	fs.writeFileSync(
		path.join( outdir, 'data', 'search.json' ),
		JSON.stringify( {
			list: searchList,
		} )
	);

};
