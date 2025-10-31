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

const outdir = path.normalize( env.opts.destination );
const themeOpts = ( env.opts.themeOpts ) || {};
const categoryMap = {}; // Maps class names to their categories (Core, Addons, TSL)

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

	return params.filter( ( { name } ) => name && ! name.includes( '.' ) ).map( param => {

		let itemName = updateItemName( param );

		if ( param.type && param.type.names && param.type.names.length ) {

			const escapedTypes = param.type.names.map( name => linkto( name, htmlsafe( name ) ) );
			itemName += ' : <span class="param-type">' + escapedTypes.join( ' | ' ) + '</span>';

		}

		return itemName;

	} );

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

	const categories = {
		'Core': [],
		'Addons': [],
		'Global': [],
		'TSL': []
	};

	data().each( ( item ) => {

		if ( item.kind !== 'package' && item.kind !== 'typedef' && ! item.inherited ) {

			// Extract the class name from the longname (e.g., "Animation#getAnimationLoop" -> "Animation")
			const parts = item.longname.split( /[#~]/ );
			const className = parts[ 0 ];

			// If this item is a member/method of a class, check if the parent class exists
			if ( parts.length > 1 ) {

				// Find the parent class/module
				const parentClass = find( { longname: className, kind: [ 'class', 'module' ] } );

				// Only include if parent exists and is not private
				if ( parentClass && parentClass.length > 0 && parentClass[ 0 ].access !== 'private' ) {

					const category = categoryMap[ className ];
					const entry = {
						title: item.longname,
						kind: item.kind
					};

					if ( category ) {

						categories[ category ].push( entry );

					}

				}

			} else {

				// This is a top-level class/module/function - include if not private
				if ( item.access !== 'private' ) {

					let category = categoryMap[ className ];

					// If not in categoryMap, determine category from @tsl tag
					if ( ! category ) {

						const hasTslTag = Array.isArray( item.tags ) && item.tags.some( tag => tag.title === 'tsl' );

						if ( hasTslTag ) {

							category = 'TSL';

						} else {

							category = 'Global';

						}

					}

					const entry = {
						title: item.longname,
						kind: item.kind
					};

					categories[ category ].push( entry );

				}

			}

		}

	} );

	return categories;

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
	const paramsString = params.join( ', ' );

	f.signature = util.format( '%s(%s)', ( f.signature || '' ), paramsString ? ' ' + paramsString + ' ' : '' );

}

function addSignatureReturns( f ) {

	let returnTypes = [];
	let returnTypesString = '';
	const source = f.yields || f.returns;

	if ( source ) {

		returnTypes = addNonParamAttributes( source );

	}

	if ( returnTypes.length ) {

		returnTypesString = util.format( ' : %s', returnTypes.join( ' | ' ) );

	}

	f.signature = `<span class="signature">${f.signature || ''}</span>${returnTypesString ? `<span class="type-signature">${returnTypesString}</span>` : ''}`;

}

function addSignatureTypes( f ) {

	const types = f.type ? buildItemTypeStrings( f ) : [];

	f.signature = `${f.signature || ''}${types.length ? `<span class="type-signature"> : ${types.join( ' | ' )}</span>` : ''}`;

}

function addAttribs( f ) {

	const attribs = helper.getAttribs( f ).filter( attrib => attrib !== 'static' && attrib !== 'nullable' );
	const attribsString = buildAttribsString( attribs );

	f.attribs = attribsString ? util.format( '<span class="type-signature">%s</span>', attribsString ) : '';

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

function getFullAugmentsChain( doclet ) {

	const chain = [];

	if ( ! doclet || ! doclet.augments || ! doclet.augments.length ) {

		return chain;

	}

	// Start with the immediate parent
	const parentName = doclet.augments[0];
	chain.push( parentName );

	// Recursively find the parent's ancestors
	const parentDoclet = find( { longname: parentName } );

	if ( parentDoclet && parentDoclet.length > 0 ) {

		const parentChain = getFullAugmentsChain( parentDoclet[0] );
		chain.unshift( ...parentChain );

	}

	return chain;

}

function generate( title, docs, filename, resolveLinks ) {

	let html;

	resolveLinks = resolveLinks !== false;

	const docData = {
		env: env,
		title: title,
		docs: docs,
		augments: docs && docs[0] ? getFullAugmentsChain( docs[0] ) : null
	};

	// Put HTML files in pages/ subdirectory
	const pagesDir = path.join( outdir, 'pages' );
	mkdirSync( pagesDir );
	const outpath = path.join( pagesDir, filename );
	html = view.render( 'container.tmpl', docData );

	if ( resolveLinks ) {

		html = helper.resolveLinks( html ); // turn {@link foo} into <a href="foodoc.html">foo</a>

	}

	// Convert Prettify classes to Highlight.js format
	html = html.replace( /<pre class="prettyprint source linenums"><code>/g, '<pre><code>' );
	html = html.replace( /<pre class="prettyprint source lang-(\w+)"[^>]*><code>/g, '<pre><code class="language-$1">' );
	html = html.replace( /<pre class="prettyprint"><code>/g, '<pre><code>' );

	// Remove lines that only contain whitespace
	html = html.replace( /^\s*\n/gm, '' );

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

function buildMainNav( items, itemsSeen, linktoFn ) {

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

				itemNav += `<li>${linktoFn( item.longname, displayName.replace( /\b(module|event):/g, '' ) )}</li>\n`;

				itemsSeen[ item.longname ] = true;

				const path = item.meta.shortpath;

				if ( path.startsWith( coreDirectory ) ) {

					const subCategory = path.split( '/' )[ 1 ];

					pushNavItem( hierarchy, 'Core', subCategory, itemNav );
					categoryMap[ item.longname ] = 'Core';

				} else if ( path.startsWith( addonsDirectory ) ) {

					const subCategory = path.split( '/' )[ 2 ];

					pushNavItem( hierarchy, 'Addons', subCategory, itemNav );
					categoryMap[ item.longname ] = 'Addons';

				}

			}

		} );

		for ( const [ mainCategory, map ] of hierarchy ) {

			nav += `\t\t\t\t\t<h2>${mainCategory}</h2>\n`;

			const sortedMap = new Map( [ ...map.entries() ].sort() ); // sort sub categories

			for ( const [ subCategory, links ] of sortedMap ) {

				nav += `\t\t\t\t\t<h3>${subCategory}</h3>\n`;
				nav += '\t\t\t\t\t<ul>\n';

				links.sort();

				for ( const link of links ) {

					nav += '\t\t\t\t\t\t' + link;

				}

				nav += '\t\t\t\t\t</ul>\n';

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

			if ( kind !== 'typedef' && ! hasOwnProp.call( seen, longname ) ) {

				const hasTslTag = Array.isArray( tags ) && tags.some( tag => tag.title === 'tsl' );

				if ( hasTslTag ) {

					tslNav += `\t\t\t\t\t\t<li>${linkto( longname, name )}</li>\n`;

					seen[ longname ] = true;

				}

			}

		} );

		nav += '\t\t\t\t\t<h2>TSL</h2>\n';
		nav += '\t\t\t\t\t<ul>\n';
		nav += tslNav;
		nav += '\t\t\t\t\t</ul>\n';

		// Globals

		globalNav = '';

		globals.forEach( ( { kind, longname, name } ) => {

			if ( kind !== 'typedef' && ! hasOwnProp.call( seen, longname ) ) {

				globalNav += `\t\t\t\t\t\t<li>${linkto( longname, name )}</li>\n`;

			}

			seen[ longname ] = true;

		} );

		if ( ! globalNav ) {

			// turn the heading into a link so you can actually get to the global page
			nav += `\t\t\t\t\t<h3>${linkto( 'global', 'Global' )}</h3>\n`;

		} else {

			nav += '\t\t\t\t\t<h2>Global</h2>\n';
			nav += '\t\t\t\t\t<ul>\n';
			nav += globalNav;
			nav += '\t\t\t\t\t</ul>\n';

		}

	}

	return nav;

}

function pushNavItem( hierarchy, mainCategory, subCategory, itemNav ) {

	// Special case for TSL - keep it all uppercase
	if ( subCategory.toLowerCase() === 'tsl' ) {

		subCategory = 'TSL';

	} else {

		subCategory = subCategory[ 0 ].toUpperCase() + subCategory.slice( 1 ); // capitalize

	}

	if ( hierarchy.get( mainCategory ).get( subCategory ) === undefined ) {

		hierarchy.get( mainCategory ).set( subCategory, [] );

	}

	const categoryList = hierarchy.get( mainCategory ).get( subCategory );

	categoryList.push( itemNav );

}

/**
 * Create the navigation sidebar.
 * @param {Object} members The members that will be used to create the sidebar.
 * @return {string} The HTML for the navigation sidebar.
 */
function buildNav( members ) {

	let nav = '\n';
	const seen = {};

	nav += buildMainNav( [ ...members.classes, ...members.modules ], seen, linkto );
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

	// prepare import statements, demo tags, and extract code examples
	data().each( doclet => {

		if ( doclet.kind === 'class' || doclet.kind === 'module' ) {

			const tags = doclet.tags;

			if ( Array.isArray( tags ) ) {

				const importTag = tags.find( tag => tag.title === 'three_import' );
				doclet.import = ( importTag !== undefined ) ? importTag.text : null;

				const demoTag = tags.find( tag => tag.title === 'demo' );
				doclet.demo = ( demoTag !== undefined ) ? demoTag.text : null;

			}

			// Extract code example from classdesc
			if ( doclet.classdesc ) {

				const codeBlockRegex = /<pre class="prettyprint source[^"]*"><code>([\s\S]*?)<\/code><\/pre>/;
				const match = doclet.classdesc.match( codeBlockRegex );

				if ( match ) {

					doclet.codeExample = match[ 0 ];
					// Remove the code example from classdesc
					doclet.classdesc = doclet.classdesc.replace( codeBlockRegex, '' ).trim();

				}

			}

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

	// Empty nav in templates - will be loaded from nav.html client-side
	view.nav = '';

	// generate the pretty-printed source files first so other pages can link to them
	if ( outputSourceFiles ) {

		generateSourceFiles( sourceFiles, opts.encoding );

	}

	if ( members.globals.length ) {

		// Split globals into TSL and non-TSL
		const tslGlobals = [];
		const nonTslGlobals = [];
		const originalGlobals = members.globals;

		originalGlobals.forEach( item => {

			const hasTslTag = Array.isArray( item.tags ) && item.tags.some( tag => tag.title === 'tsl' );

			if ( hasTslTag ) {

				tslGlobals.push( item );

				// Register each TSL item to link to TSL.html
				helper.registerLink( item.longname, 'TSL.html#' + item.name );

			} else {

				nonTslGlobals.push( item );

			}

		} );

		// Generate TSL.html for TSL functions
		if ( tslGlobals.length ) {

			generate( 'TSL', [ { kind: 'globalobj', isTSL: true } ], 'TSL.html' );

		}

		// Generate global.html for remaining globals
		if ( nonTslGlobals.length ) {

			generate( 'Global', [ { kind: 'globalobj' } ], globalUrl );

		}

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
	const modules = taffy( members.modules );

	Object.keys( helper.longnameToUrl ).forEach( longname => {

		const myClasses = helper.find( classes, { longname: longname } );
		const myModules = helper.find( modules, { longname: longname } );

		if ( myClasses.length ) {

			generate( `${myClasses[ 0 ].name}`, myClasses, helper.longnameToUrl[ longname ] );

		}

		if ( myModules.length ) {

			generate( `${myModules[ 0 ].name}`, myModules, helper.longnameToUrl[ longname ] );

		}

	} );

	// Build navigation HTML
	const navHtml = buildNav( members );

	// Generate index.html with embedded navigation
	const indexTemplatePath = path.join( templatePath, 'static', 'index.html' );
	let indexHtml = fs.readFileSync( indexTemplatePath, 'utf8' );

	// Replace placeholder with actual navigation
	indexHtml = indexHtml.replace( '<!--NAV_PLACEHOLDER-->', navHtml );

	fs.writeFileSync(
		path.join( outdir, 'index.html' ),
		indexHtml,
		'utf8'
	);

	// search

	const searchList = buildSearchListForData();

	fs.writeFileSync(
		path.join( outdir, 'search.json' ),
		JSON.stringify( searchList, null, '\t' )
	);

};
