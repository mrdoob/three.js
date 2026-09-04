class ProjectsManager {

	constructor( tour ) {

		this.tour = tour;
		this.storageKey = 'tsl_playground_saved_projects';
		this.currentProjectIdKey = 'tsl_playground_current_project_id';
		this.currentProjectId = localStorage.getItem( this.currentProjectIdKey ) || null;
		this.modalElement = null;
		this.confirmModalElement = null;

	}

	setCurrentProjectId( id ) {

		this.currentProjectId = id || null;
		if ( id ) {

			try {

				localStorage.setItem( this.currentProjectIdKey, id );

			} catch ( e ) {

				console.error( 'Error saving currentProjectId to localStorage:', e );

			}

		} else {

			try {

				localStorage.removeItem( this.currentProjectIdKey );

			} catch ( e ) {

				console.error( 'Error removing currentProjectId from localStorage:', e );

			}

		}

	}

	getDraftProject() {

		const rawTabs = this.tour.playgroundManager.playgroundTabs;
		const tabs = ( rawTabs && rawTabs.length > 0 )
			? rawTabs.filter( t => ! t.readOnly )
			: [ { name: 'main', code: '// Tour of TSL\n' } ];

		if ( tabs.length === 0 ) {

			tabs.push( { name: 'main', code: '// Tour of TSL\n' } );

		}

		let name = 'Draft';
		if ( this.tour.playgroundManager.currentExampleName ) {

			const cleanName = this.tour.playgroundManager.currentExampleName.replace( /\s*\(Draft\)$/i, '' ).trim();
			if ( cleanName ) {

				name = `${cleanName} (Draft)`;

			}

		}

		return {
			id: 'draft',
			isDraft: true,
			name: name,
			updatedAt: Date.now(),
			tabs: JSON.parse( JSON.stringify( tabs ) )
		};

	}

	getAllDisplayProjects() {

		const savedProjects = this.getProjects();
		const hasActiveSavedProject = this.currentProjectId && savedProjects.some( p => p.id === this.currentProjectId );

		if ( ! hasActiveSavedProject ) {

			const draft = this.getDraftProject();
			return [ draft, ...savedProjects ];

		}

		return savedProjects;

	}

	resetDraft() {

		const emptyTabs = [ { name: 'main', code: '// Tour of TSL\n' } ];
		this.tour.playgroundManager.playgroundTabs = emptyTabs;
		this.tour.playgroundManager.activePlaygroundTabName = 'main';
		this.tour.playgroundManager.currentExampleName = null;
		this.tour.playgroundManager.initialTabsSnapshot = JSON.stringify( emptyTabs );
		this.setCurrentProjectId( null );

		if ( this.tour.codeEditor ) {

			this.tour.codeEditor.setValue( emptyTabs[ 0 ].code );

		}

		this.tour.playgroundManager.renderPlaygroundTabs();
		this.tour.playgroundManager.runPlayground();
		this.tour.playgroundManager.updatePlaygroundHash( true );

	}

	isProjectCurrent( project ) {

		if ( ! project ) return false;

		if ( project.isDraft ) {

			const savedProjects = this.getProjects();
			return ! this.currentProjectId || ! savedProjects.some( p => p.id === this.currentProjectId );

		}

		if ( this.currentProjectId ) {

			return this.currentProjectId === project.id;

		}

		return false;

	}

	formatDate( timestamp ) {

		if ( ! timestamp ) return '';
		const d = new Date( timestamp );
		const year = d.getFullYear();
		const month = String( d.getMonth() + 1 ).padStart( 2, '0' );
		const day = String( d.getDate() ).padStart( 2, '0' );
		const hours = String( d.getHours() ).padStart( 2, '0' );
		const mins = String( d.getMinutes() ).padStart( 2, '0' );
		return `${year} - ${month}/${day} ${hours}:${mins}`;

	}

	getProjects() {

		try {

			const raw = localStorage.getItem( this.storageKey );
			if ( ! raw ) return [];
			const parsed = JSON.parse( raw );
			if ( Array.isArray( parsed ) ) {

				return parsed.sort( ( a, b ) => ( b.updatedAt || 0 ) - ( a.updatedAt || 0 ) );

			}

		} catch ( e ) {

			console.error( 'Error reading saved projects from localStorage:', e );

		}

		return [];

	}

	saveProjectsList( list ) {

		try {

			localStorage.setItem( this.storageKey, JSON.stringify( list ) );

		} catch ( e ) {

			console.error( 'Error saving projects list to localStorage:', e );

		}

	}

	getDefaultTemplateTabs() {

		const templates = this.tour.templates || [];
		const defaultTmpl = templates.find( t => t.default === true ) || templates[ 0 ];

		if ( defaultTmpl && Array.isArray( defaultTmpl.tabs ) && defaultTmpl.tabs.length > 0 ) {

			return JSON.parse( JSON.stringify( defaultTmpl.tabs ) );

		}

		return [ { name: 'main', code: '// Tour of TSL\n' } ];

	}

	getNextProjectName() {

		const projects = this.getProjects();
		let maxNum = 0;
		const regex = /^Project\s+(\d+)$/i;

		for ( const project of projects ) {

			const match = ( project.name || '' ).trim().match( regex );
			if ( match ) {

				const num = parseInt( match[ 1 ], 10 );
				if ( num > maxNum ) maxNum = num;

			}

		}

		return `Project ${maxNum + 1}`;

	}

	autoSaveCurrentProject() {

		if ( ! this.currentProjectId ) return;

		const tabs = ( this.tour.playgroundManager.playgroundTabs || [] ).filter( t => ! t.readOnly );
		if ( ! tabs || tabs.length === 0 ) return;

		const projects = this.getProjects();
		const index = projects.findIndex( p => p.id === this.currentProjectId );
		if ( index === - 1 ) return;

		projects[ index ].tabs = JSON.parse( JSON.stringify( tabs ) );
		projects[ index ].updatedAt = Date.now();

		this.saveProjectsList( projects );

	}

	saveCurrentProject( name ) {

		const rawTabs = this.tour.playgroundManager.playgroundTabs || [ { name: 'main', code: '// Tour of TSL\n' } ];
		const tabs = rawTabs.filter( t => ! t.readOnly );
		if ( tabs.length === 0 ) tabs.push( { name: 'main', code: '// Tour of TSL\n' } );
		const projects = this.getProjects();

		let existingIndex = - 1;
		if ( this.currentProjectId ) {

			existingIndex = projects.findIndex( p => p.id === this.currentProjectId );

		}

		const defaultName = ( existingIndex !== - 1 ? projects[ existingIndex ].name : null )
			|| ( this.tour.playgroundManager.currentExampleName ? this.tour.playgroundManager.currentExampleName.replace( /\s*\(Draft\)$/i, '' ).trim() : null )
			|| this.getNextProjectName();

		const cleanName = ( name || '' ).trim() || defaultName;

		if ( existingIndex === - 1 ) {

			existingIndex = projects.findIndex( p => p.name.toLowerCase() === cleanName.toLowerCase() );

		}

		const now = Date.now();
		const projectData = {
			id: existingIndex !== - 1 ? projects[ existingIndex ].id : `proj_${now}_${Math.random().toString( 36 ).substring( 2, 7 )}`,
			name: cleanName,
			createdAt: existingIndex !== - 1 ? projects[ existingIndex ].createdAt : now,
			updatedAt: now,
			tabs: JSON.parse( JSON.stringify( tabs ) )
		};

		if ( existingIndex !== - 1 ) {

			projects[ existingIndex ] = projectData;

		} else {

			projects.unshift( projectData );

		}

		this.setCurrentProjectId( projectData.id );
		this.tour.playgroundManager.currentExampleName = projectData.name;
		this.tour.playgroundManager.initialTabsSnapshot = JSON.stringify( tabs );
		this.saveProjectsList( projects );
		return projectData;

	}

	renameProject( id, newName ) {

		const cleanName = ( newName || '' ).trim();
		if ( ! cleanName ) return false;

		if ( id === 'draft' ) {

			this.saveCurrentProject( cleanName );
			return true;

		}

		const projects = this.getProjects();
		const project = projects.find( p => p.id === id );
		if ( ! project ) return false;

		project.name = cleanName;
		project.updatedAt = Date.now();

		this.saveProjectsList( projects );
		return true;

	}

	deleteProject( id ) {

		if ( id === 'draft' ) {

			return;

		}

		const isDeletingCurrent = ( this.currentProjectId === id );

		let projects = this.getProjects();
		projects = projects.filter( p => p.id !== id );
		this.saveProjectsList( projects );

		if ( isDeletingCurrent ) {

			this.resetDraft();

		}

	}

	duplicateProject( project ) {

		const projects = this.getProjects();
		const now = Date.now();
		const id = `proj_${now}_${Math.random().toString( 36 ).substring( 2, 7 )}`;
		const clonedTabs = ( project.tabs || [] ).map( t => ( {
			name: t.name,
			code: t.code
		} ) );

		const baseName = ( project.name || 'Project' ).replace( /\s*\(Draft\)$/i, '' ).trim();
		const name = project.isDraft ? this.getNextProjectName() : `${baseName} (Copy)`;

		const newProject = {
			id,
			name,
			createdAt: now,
			updatedAt: now,
			tabs: clonedTabs
		};

		if ( project.isDraft ) {

			projects.unshift( newProject );

		} else {

			const targetIndex = projects.findIndex( p => p.id === project.id );
			if ( targetIndex !== - 1 ) {

				projects.splice( targetIndex + 1, 0, newProject );

			} else {

				projects.unshift( newProject );

			}

		}

		this.saveProjectsList( projects );

		return newProject;

	}

	loadProject( project ) {

		if ( ! project || ! Array.isArray( project.tabs ) || project.tabs.length === 0 ) {

			console.error( 'Invalid project data to load' );
			return;

		}

		this.setCurrentProjectId( project.id );
		this.tour.playgroundManager.currentExampleName = project.name;
		this.tour.playgroundManager.playgroundTabs = JSON.parse( JSON.stringify( project.tabs ) );
		this.tour.playgroundManager.activePlaygroundTabName = this.tour.playgroundManager.playgroundTabs[ 0 ].name;
		this.tour.playgroundManager.initialTabsSnapshot = JSON.stringify( this.tour.playgroundManager.playgroundTabs );

		this.tour.playgroundManager.togglePlayground( true );
		this.tour.playgroundManager.renderPlaygroundTabs();

		const activeTab = this.tour.playgroundManager.playgroundTabs.find( t => t.name === this.tour.playgroundManager.activePlaygroundTabName ) || this.tour.playgroundManager.playgroundTabs[ 0 ];

		if ( this.tour.codeEditor ) {

			this.tour.codeEditor.setValue( activeTab.code );

		}

		this.tour.playgroundManager.runPlayground();
		this.tour.playgroundManager.updatePlaygroundHash( true );

		this.closeProjectsModal();

	}

	exportProjectJSON( project ) {

		if ( ! project ) return;

		const safeTabs = ( project.tabs || [] ).map( t => ( {
			name: t.name,
			code: t.code
		} ) );

		const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent( JSON.stringify( {
			name: project.name || 'project',
			version: 1,
			exportedAt: new Date().toISOString(),
			tabs: safeTabs
		}, null, 2 ) );

		const downloadAnchor = document.createElement( 'a' );
		const safeName = ( project.name || 'project' ).toLowerCase().replace( /[^a-z0-9_-]/g, '_' );
		downloadAnchor.setAttribute( 'href', dataStr );
		downloadAnchor.setAttribute( 'download', `${safeName}.json` );
		document.body.appendChild( downloadAnchor );
		downloadAnchor.click();
		downloadAnchor.remove();

	}

	exportAllProjectsJSON() {

		const projects = this.getProjects();
		if ( projects.length === 0 ) {

			return;

		}

		const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent( JSON.stringify( {
			type: 'tsl_playground_backup',
			version: 1,
			exportedAt: new Date().toISOString(),
			projects: projects
		}, null, 2 ) );

		const downloadAnchor = document.createElement( 'a' );
		downloadAnchor.setAttribute( 'href', dataStr );
		downloadAnchor.setAttribute( 'download', 'tsl_playground_all_projects.json' );
		document.body.appendChild( downloadAnchor );
		downloadAnchor.click();
		downloadAnchor.remove();

	}

	importProjectJSON( file ) {

		return new Promise( ( resolve, reject ) => {

			const reader = new FileReader();
			reader.onload = ( e ) => {

				try {

					const parsed = JSON.parse( e.target.result );
					let importedCount = 0;
					let firstImportedProject = null;

					if ( ! parsed || typeof parsed !== 'object' ) {

						throw new Error( 'Invalid JSON format. Please ensure it contains valid tabs or projects.' );

					}

					const projects = this.getProjects();
					const now = Date.now();

					if ( parsed.type === 'tsl_playground_backup' && Array.isArray( parsed.projects ) ) {

						for ( const proj of parsed.projects ) {

							if ( proj && proj.name && Array.isArray( proj.tabs ) && proj.tabs.length > 0 ) {

								const id = `proj_${now}_${Math.random().toString( 36 ).substring( 2, 7 )}`;
								const newProj = {
									id,
									name: proj.name,
									createdAt: proj.createdAt || now,
									updatedAt: proj.updatedAt || now,
									tabs: proj.tabs
								};
								projects.unshift( newProj );
								if ( ! firstImportedProject ) firstImportedProject = newProj;
								importedCount ++;

							}

						}

					} else if ( Array.isArray( parsed ) ) {

						for ( const proj of parsed ) {

							if ( proj && Array.isArray( proj.tabs ) && proj.tabs.length > 0 ) {

								const id = `proj_${now}_${Math.random().toString( 36 ).substring( 2, 7 )}`;
								const newProj = {
									id,
									name: proj.name || 'Imported Project',
									createdAt: now,
									updatedAt: now,
									tabs: proj.tabs
								};
								projects.unshift( newProj );
								if ( ! firstImportedProject ) firstImportedProject = newProj;
								importedCount ++;

							}

						}

					} else if ( Array.isArray( parsed.tabs ) || parsed.name || parsed.code ) {

						const tabs = Array.isArray( parsed.tabs ) ? parsed.tabs : [ { name: 'main', code: parsed.code || '// Tour of TSL\n' } ];
						const name = parsed.name || file.name.replace( /\.json$/i, '' ) || 'Imported Project';
						const id = `proj_${now}_${Math.random().toString( 36 ).substring( 2, 7 )}`;

						const newProj = {
							id,
							name,
							createdAt: now,
							updatedAt: now,
							tabs
						};
						projects.unshift( newProj );
						firstImportedProject = newProj;
						importedCount = 1;

					} else {

						throw new Error( 'Invalid JSON format. Please ensure it contains valid tabs or projects.' );

					}

					this.saveProjectsList( projects );
					resolve( { importedCount, project: firstImportedProject } );

				} catch ( err ) {

					reject( err );

				}

			};

			reader.onerror = reject;
			reader.readAsText( file );

		} );

	}

	openProjectsModal() {

		this.closeProjectsModal();

		const overlay = document.createElement( 'div' );
		overlay.className = 'tsl-modal-overlay';
		overlay.id = 'tsl-projects-modal-overlay';

		const modal = document.createElement( 'div' );
		modal.className = 'tsl-modal-container tsl-projects-modal';

		// Header
		const header = document.createElement( 'div' );
		header.className = 'tsl-modal-header';
		header.innerHTML = `
			<div class="tsl-modal-title-group">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px; color: #9ca3af; flex-shrink: 0;"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/><polyline points="10 11 8 13 10 15"/><polyline points="14 11 16 13 14 15"/></svg>
				<span class="tsl-modal-title-main">Playground Projects</span>
			</div>
			<button class="tsl-modal-close-btn" title="Close">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 15px; height: 15px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
			</button>
		`;
		modal.appendChild( header );

		// Modal body
		const bodyContainer = document.createElement( 'div' );
		bodyContainer.className = 'tsl-projects-body';

		// 1. Templates / Empty Project Section (top of modal)
		const templates = this.tour.templates || [];

		// Hidden file input for importing JSON
		const fileInput = document.createElement( 'input' );
		fileInput.type = 'file';
		fileInput.id = 'tsl-project-file-input';
		fileInput.accept = '.json';
		fileInput.style.display = 'none';
		bodyContainer.appendChild( fileInput );

		if ( templates.length > 0 ) {

			templates.forEach( ( tmpl, index ) => {

				const templateItem = document.createElement( 'div' );
				templateItem.className = 'tsl-project-item tsl-project-template-item';
				templateItem.innerHTML = `
					<div class="tsl-project-info">
						<div class="tsl-project-name-row">
							<span class="tsl-project-name">${tmpl.name}</span>
							<span class="tsl-project-tag-template">Template</span>
						</div>
						<div class="tsl-project-meta">
							<span class="tsl-project-date">${tmpl.description || 'Create a project from template'}</span>
						</div>
					</div>
					<div class="tsl-project-item-actions">
						<button class="tsl-btn tsl-btn-sm tsl-btn-primary tsl-template-new-btn" title="Create a new project from this template">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 12px; height: 12px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
							<span>New</span>
						</button>
						${index === 0 ? `
						<button class="tsl-btn tsl-btn-sm tsl-btn-secondary tsl-project-import-btn" title="Import project from JSON file">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-upload" style="width: 12px; height: 12px;"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" /><path d="M7 9l5 -5l5 5" /><path d="M12 4l0 12" /></svg>
							<span>Import</span>
						</button>` : ''}
					</div>
				`;

				templateItem.querySelector( '.tsl-template-new-btn' ).onclick = () => {

					const tabs = JSON.parse( JSON.stringify( tmpl.tabs && tmpl.tabs.length > 0 ? tmpl.tabs : [ { name: 'main', code: '// Tour of TSL\n' } ] ) );
					this.tour.playgroundManager.playgroundTabs = tabs;
					this.tour.playgroundManager.activePlaygroundTabName = tabs[ 0 ].name;
					this.setCurrentProjectId( null );
					this.tour.playgroundManager.currentExampleName = tmpl.name && tmpl.name !== 'Empty Project' ? tmpl.name : null;
					this.tour.playgroundManager.initialTabsSnapshot = JSON.stringify( tabs );

					this.tour.playgroundManager.togglePlayground( true );
					this.tour.playgroundManager.renderPlaygroundTabs();

					if ( this.tour.codeEditor ) {

						this.tour.codeEditor.setValue( tabs[ 0 ].code );

					}

					this.tour.playgroundManager.runPlayground();
					this.tour.playgroundManager.updatePlaygroundHash( true );

					this.closeProjectsModal();

				};

				const importBtn = templateItem.querySelector( '.tsl-project-import-btn' );
				if ( importBtn ) {

					importBtn.onclick = () => {

						fileInput.value = '';
						fileInput.click();

					};

				}

				bodyContainer.appendChild( templateItem );

			} );

		} else {

			const templateItem = document.createElement( 'div' );
			templateItem.className = 'tsl-project-item tsl-project-template-item';
			templateItem.innerHTML = `
				<div class="tsl-project-info">
					<div class="tsl-project-name-row">
						<span class="tsl-project-name">Empty Project</span>
					</div>
					<div class="tsl-project-meta">
						<span class="tsl-project-date">Create a blank project or import from JSON</span>
					</div>
				</div>
				<div class="tsl-project-item-actions">
					<button class="tsl-btn tsl-btn-sm tsl-btn-primary tsl-template-new-btn" title="Create and open a new empty project">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 12px; height: 12px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
						<span>New</span>
					</button>
					<button class="tsl-btn tsl-btn-sm tsl-btn-secondary tsl-project-import-btn" title="Import project from JSON file">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-upload" style="width: 12px; height: 12px;"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" /><path d="M7 9l5 -5l5 5" /><path d="M12 4l0 12" /></svg>
						<span>Import</span>
					</button>
				</div>
			`;

			templateItem.querySelector( '.tsl-template-new-btn' ).onclick = () => {

				const emptyTabs = [ { name: 'main', code: '// Tour of TSL\n' } ];
				this.tour.playgroundManager.playgroundTabs = emptyTabs;
				this.tour.playgroundManager.activePlaygroundTabName = 'main';
				this.setCurrentProjectId( null );
				this.tour.playgroundManager.currentExampleName = null;
				this.tour.playgroundManager.initialTabsSnapshot = JSON.stringify( emptyTabs );

				this.tour.playgroundManager.togglePlayground( true );
				this.tour.playgroundManager.renderPlaygroundTabs();

				if ( this.tour.codeEditor ) {

					this.tour.codeEditor.setValue( emptyTabs[ 0 ].code );

				}

				this.tour.playgroundManager.runPlayground();
				this.tour.playgroundManager.updatePlaygroundHash( true );

				this.closeProjectsModal();

			};

			templateItem.querySelector( '.tsl-project-import-btn' ).onclick = () => {

				fileInput.value = '';
				fileInput.click();

			};

			bodyContainer.appendChild( templateItem );

		}

		fileInput.onchange = async ( e ) => {

			const file = e.target.files[ 0 ];
			if ( ! file ) return;

			try {

				const result = await this.importProjectJSON( file );
				if ( result && result.project ) {

					this.loadProject( result.project );

				} else {

					renderList();

				}

			} catch ( err ) {

				console.error( 'Failed to import project:', err );

			}

		};

		// 2. Section Header
		const sectionHeader = document.createElement( 'div' );
		sectionHeader.className = 'tsl-projects-section-header';
		sectionHeader.innerHTML = `
			<span>Saved Projects</span>
			<span id="tsl-projects-count-badge" class="tsl-projects-count-badge">0</span>
		`;
		bodyContainer.appendChild( sectionHeader );

		// 3. Projects List Container
		const listContainer = document.createElement( 'div' );
		listContainer.className = 'tsl-projects-list custom-scrollbar';
		bodyContainer.appendChild( listContainer );

		modal.appendChild( bodyContainer );
		overlay.appendChild( modal );
		document.body.appendChild( overlay );
		this.modalElement = overlay;

		const countBadge = sectionHeader.querySelector( '#tsl-projects-count-badge' );

		const renderList = ( filterQuery = '' ) => {

			listContainer.innerHTML = '';
			const allProjects = this.getAllDisplayProjects();

			// Always pin the current project to the top of the list
			allProjects.sort( ( a, b ) => {

				const aIsCurrent = this.isProjectCurrent( a );
				const bIsCurrent = this.isProjectCurrent( b );

				if ( aIsCurrent && ! bIsCurrent ) return - 1;
				if ( ! aIsCurrent && bIsCurrent ) return 1;

				return ( b.updatedAt || 0 ) - ( a.updatedAt || 0 );

			} );

			const query = filterQuery.toLowerCase().trim();
			const projects = query ? allProjects.filter( p => p.name.toLowerCase().includes( query ) ) : allProjects;

			const savedCount = this.getProjects().length;
			countBadge.textContent = `${savedCount} saved`;

			if ( projects.length === 0 ) {

				const emptyEl = document.createElement( 'div' );
				emptyEl.className = 'tsl-projects-empty';
				emptyEl.innerHTML = `
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width: 38px; height: 38px; opacity: 0.35;"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/><line x1="9" y1="13" x2="15" y2="13"/></svg>
					<p>${query ? 'No projects found matching your search.' : 'No saved projects yet.'}</p>
					<span>${query ? '' : 'Click "New" above to create a blank project, or import a .json file.'}</span>
				`;
				listContainer.appendChild( emptyEl );
				return;

			}

			projects.forEach( project => {

				const isCurrent = this.isProjectCurrent( project );
				const isDraft = !! project.isDraft;
				const item = document.createElement( 'div' );
				item.className = 'tsl-project-item' + ( isCurrent ? ' tsl-project-item-current' : '' ) + ( isDraft ? ' tsl-project-item-draft' : '' );

				const dateStr = isDraft ? 'Current unsaved draft' : this.formatDate( project.updatedAt );

				const tabBadges = ( project.tabs || [] ).map( t => `<span class="tsl-project-tab-badge">${t.name}</span>` ).join( '' );

				item.innerHTML = `
					<div class="tsl-project-info">
						<div class="tsl-project-name-row">
							<span class="tsl-project-name" title="${isDraft ? 'Double-click to save and rename' : 'Double-click to rename'}">${project.name}</span>
							${isDraft ? '<span class="tsl-project-tag-draft">Draft</span>' : ''}
							${isCurrent ? '<span class="tsl-project-tag-active">Current</span>' : ''}
							<button class="tsl-project-rename-btn" title="${isDraft ? 'Save as project' : 'Rename'}">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 12px; height: 12px;"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
							</button>
						</div>
						<div class="tsl-project-meta">
							<span class="tsl-project-date">${dateStr}</span>
							<div class="tsl-project-tabs-badges">${tabBadges}</div>
						</div>
					</div>
					<div class="tsl-project-item-actions">
						${isDraft ? `
						<button class="tsl-btn tsl-btn-sm tsl-btn-primary tsl-save-draft-btn" title="Save this draft as a project">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 12px; height: 12px;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
							<span>Save</span>
						</button>` : ''}
						${! isCurrent ? `
						<button class="tsl-btn tsl-btn-sm tsl-btn-primary tsl-load-btn" title="Load project into playground">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width: 12px; height: 12px;"><polygon points="6 3 20 12 6 21 6 3"/></svg>
							<span>Load</span>
						</button>` : ''}
						<button class="tsl-btn tsl-btn-sm tsl-btn-secondary tsl-duplicate-btn" title="${isDraft ? 'Duplicate as saved project' : 'Duplicate project'}">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-copy" style="width: 12px; height: 12px;"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z"/><path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1"/></svg>
							<span>Duplicate</span>
						</button>
						<button class="tsl-btn tsl-btn-sm tsl-btn-secondary tsl-export-btn" title="Download JSON for this project">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 12px; height: 12px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
							<span>JSON</span>
						</button>
						${! isDraft ? `
						<button class="tsl-btn tsl-btn-sm tsl-btn-danger tsl-delete-btn" title="Delete project">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 12px; height: 12px;"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
						</button>` : ''}
					</div>
				`;

				// Save Draft button
				const saveDraftBtn = item.querySelector( '.tsl-save-draft-btn' );
				if ( saveDraftBtn ) {

					saveDraftBtn.onclick = () => {

						const defaultName = this.tour.playgroundManager.currentExampleName
							? this.tour.playgroundManager.currentExampleName.replace( /\s*\(Draft\)$/i, '' ).trim()
							: this.getNextProjectName();
						this.saveCurrentProject( defaultName );
						renderList();

					};

				}

				// Load button
				const loadBtn = item.querySelector( '.tsl-load-btn' );
				if ( loadBtn ) {

					loadBtn.onclick = () => {

						this.loadProject( project );

					};

				}

				// Duplicate button
				const duplicateBtn = item.querySelector( '.tsl-duplicate-btn' );
				if ( duplicateBtn ) {

					duplicateBtn.onclick = () => {

						if ( isDraft ) {

							const defaultName = this.getNextProjectName();
							this.saveCurrentProject( defaultName );

						} else {

							this.duplicateProject( project );

						}

						renderList();

					};

				}

				// Export button
				item.querySelector( '.tsl-export-btn' ).onclick = () => {

					this.exportProjectJSON( project );

				};

				// Delete button (only for saved projects)
				const deleteBtn = item.querySelector( '.tsl-delete-btn' );
				if ( deleteBtn ) {

					deleteBtn.onclick = () => {

						this.deleteProject( project.id );
						renderList();

					};

				}

				// Inline Rename / Save
				const startRename = () => {

					const nameSpan = item.querySelector( '.tsl-project-name' );
					if ( ! nameSpan || item.querySelector( '.tsl-project-rename-input' ) ) return;

					const oldName = isDraft
						? ( this.tour.playgroundManager.currentExampleName ? this.tour.playgroundManager.currentExampleName.replace( /\s*\(Draft\)$/i, '' ).trim() : this.getNextProjectName() )
						: project.name;
					const input = document.createElement( 'input' );
					input.type = 'text';
					input.className = 'tsl-project-rename-input';
					input.value = oldName;

					nameSpan.replaceWith( input );
					input.focus();
					input.select();

					let isDone = false;
					const commitRename = () => {

						if ( isDone ) return;
						isDone = true;
						const newName = input.value.trim();
						if ( isDraft ) {

							this.saveCurrentProject( newName || oldName );

						} else if ( newName && newName !== oldName ) {

							this.renameProject( project.id, newName );

						}

						renderList();

					};

					input.onblur = commitRename;
					input.onkeydown = ( e ) => {

						if ( e.key === 'Enter' ) commitRename();
						if ( e.key === 'Escape' ) {

							isDone = true;
							renderList();

						}

					};

				};

				item.querySelector( '.tsl-project-name' ).ondblclick = startRename;
				item.querySelector( '.tsl-project-rename-btn' ).onclick = startRename;

				listContainer.appendChild( item );

			} );

		};

		renderList();

		// Close button Action
		header.querySelector( '.tsl-modal-close-btn' ).onclick = () => {

			this.closeProjectsModal();

		};

		// Backdrop click to close
		overlay.onclick = ( e ) => {

			if ( e.target === overlay ) {

				this.closeProjectsModal();

			}

		};

		// ESC to close
		this._escListener = ( e ) => {

			if ( e.key === 'Escape' ) {

				this.closeProjectsModal();

			}

		};

		window.addEventListener( 'keydown', this._escListener );

	}

	closeProjectsModal() {

		if ( document.activeElement && typeof document.activeElement.blur === 'function' ) {

			document.activeElement.blur();

		}

		if ( this.modalElement ) {

			this.modalElement.remove();
			this.modalElement = null;

		}

		if ( this._escListener ) {

			window.removeEventListener( 'keydown', this._escListener );
			this._escListener = null;

		}

		if ( this.tour.codeEditor ) {

			this.tour.codeEditor.focus();

		}

	}

	confirmCloseCurrentProject( onSaveAndConfirm ) {

		this.closeConfirmModal();

		const overlay = document.createElement( 'div' );
		overlay.className = 'tsl-modal-overlay';
		overlay.id = 'tsl-confirm-modal-overlay';

		const modal = document.createElement( 'div' );
		modal.className = 'tsl-modal-container tsl-confirm-modal';

		modal.innerHTML = `
			<div class="tsl-modal-header">
				<div class="tsl-modal-title-group">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px; color: #f59e0b; flex-shrink: 0;"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
					<span class="tsl-modal-title-main">Open Example in Playground</span>
				</div>
				<button class="tsl-modal-close-btn" title="Close">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 15px; height: 15px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
				</button>
			</div>
			<div class="tsl-confirm-body">
				<p>You already have an open project in Playground.<br><br>Do you want to save the current project and load this example?</p>
			</div>
			<div class="tsl-confirm-actions">
				<button id="tsl-confirm-save-btn" class="tsl-btn tsl-btn-primary">Save & Open</button>
				<button id="tsl-confirm-cancel-btn" class="tsl-btn tsl-btn-secondary">Cancel</button>
			</div>
		`;

		overlay.appendChild( modal );
		document.body.appendChild( overlay );
		this.confirmModalElement = overlay;

		const close = () => {

			this.closeConfirmModal();

		};

		modal.querySelector( '.tsl-modal-close-btn' ).onclick = close;
		modal.querySelector( '#tsl-confirm-cancel-btn' ).onclick = close;

		modal.querySelector( '#tsl-confirm-save-btn' ).onclick = () => {

			this.saveCurrentProject();
			close();
			if ( onSaveAndConfirm ) onSaveAndConfirm();

		};

		overlay.onclick = ( e ) => {

			if ( e.target === overlay ) close();

		};

		this._confirmEscListener = ( e ) => {

			if ( e.key === 'Escape' ) close();

		};

		window.addEventListener( 'keydown', this._confirmEscListener );

	}

	closeConfirmModal() {

		if ( this.confirmModalElement ) {

			this.confirmModalElement.remove();
			this.confirmModalElement = null;

		}

		if ( this._confirmEscListener ) {

			window.removeEventListener( 'keydown', this._confirmEscListener );
			this._confirmEscListener = null;

		}

	}

}

export { ProjectsManager };
