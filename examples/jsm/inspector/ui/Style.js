export class Style {

	static init() {

		if ( document.getElementById( 'profiler-styles' ) ) return;

		const css = `
:root {
	--profiler-bg: #1e1e24f5;
	--profiler-header-bg: #2a2a33aa;
	--profiler-header: #2a2a33;
	--profiler-border: #4a4a5a;
	--text-primary: #e0e0e0;
	--text-secondary: #9a9aab;
	--accent-color: #00aaff;
	--color-green: #4caf50;
	--color-yellow: #ffc107;
	--color-red: #f44336;
	--font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
	--font-mono: 'Fira Code', 'Courier New', Courier, monospace;
}

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Fira+Code&display=swap');

#profiler-panel *, #profiler-toggle * {
	text-transform: initial;
	line-height: normal;
	box-sizing: border-box;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}

#profiler-toggle {
	position: fixed;
	top: 15px;
	right: 15px;
	background-color: rgba(30, 30, 36, 0.85);
	border: 1px solid #4a4a5a54;
	border-radius: 6px 12px 12px 6px;
	color: var(--text-primary);
	cursor: pointer;
	z-index: 1001;
	transition: all 0.2s ease-in-out;
	font-size: 14px;
	backdrop-filter: blur(8px);
	box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
	display: flex;
	align-items: stretch;
	padding: 0;
	overflow: hidden;
	font-family: var(--font-family);
}

#profiler-toggle:hover {
	border-color: var(--accent-color);
}

#profiler-toggle.hidden {
	opacity: 0;
	pointer-events: none;
}

#toggle-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 40px;
	font-size: 20px;
	transition: background-color 0.2s;
}

#profiler-toggle:hover #toggle-icon {
	background-color: rgba(255, 255, 255, 0.05);
}

.toggle-separator {
	width: 1px;
	background-color: var(--profiler-border);
}

#toggle-text {
	display: flex;
	align-items: baseline;
	padding: 8px 14px;
	min-width: 80px;
	justify-content: right;
}

#toggle-text .fps-label {
	font-size: 0.7em;
	margin-left: 10px;
    color: #999;
}

#profiler-panel {
	position: fixed;
	z-index: 1001 !important;
	bottom: 0;
	left: 0;
	right: 0;
	height: 350px;
	background-color: var(--profiler-bg);
	backdrop-filter: blur(8px);
	border-top: 2px solid var(--profiler-border);
	color: var(--text-primary);
	display: flex;
	flex-direction: column;
	z-index: 1000;
	/*box-shadow: 0 -5px 25px rgba(0, 0, 0, 0.5);*/
	transform: translateY(100%);
	transition: transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94), height 0.3s ease-out, width 0.3s ease-out;
	font-family: var(--font-mono);
}

#profiler-panel.resizing,
#profiler-panel.dragging {
	transition: none;
}

#profiler-panel.visible {
	transform: translateY(0);
}

#profiler-panel.maximized {
	height: 100vh;
}

/* Position-specific styles */
#profiler-panel.position-top {
	bottom: auto;
	top: 0;
	border-top: none;
	border-bottom: 2px solid var(--profiler-border);
	transform: translateY(-100%);
}

#profiler-panel.position-top.visible {
	transform: translateY(0);
}

#profiler-panel.position-bottom {
	/* Default position - already defined above */
}

#profiler-panel.position-left {
	top: 0;
	bottom: 0;
	left: 0;
	right: auto;
	width: 350px;
	height: 100%;
	border-top: none;
	border-right: 2px solid var(--profiler-border);
	transform: translateX(-100%);
}

#profiler-panel.position-left.visible {
	transform: translateX(0);
}

#profiler-panel.position-right {
	top: 0;
	bottom: 0;
	left: auto;
	right: 0;
	width: 350px;
	height: 100%;
	border-top: none;
	border-left: 2px solid var(--profiler-border);
	transform: translateX(100%);
}

#profiler-panel.position-right.visible {
	transform: translateX(0);
}

#profiler-panel.position-floating {
	border: 2px solid var(--profiler-border);
	border-radius: 8px;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
	transform: none !important;
	overflow: hidden;
}

#profiler-panel.position-floating.visible {
	transform: none !important;
}

#profiler-panel.position-floating .profiler-header {
	border-radius: 6px 6px 0 0;
}

#profiler-panel.position-floating .panel-resizer {
	bottom: 0;
	right: 0;
	top: auto;
	left: auto;
	width: 16px;
	height: 16px;
	cursor: nwse-resize;
	border-radius: 0 0 6px 0;
}

#profiler-panel.position-floating .panel-resizer::after {
	content: '';
	position: absolute;
	right: 2px;
	bottom: 2px;
	width: 10px;
	height: 10px;
	background: linear-gradient(135deg, transparent 0%, transparent 45%, var(--profiler-border) 45%, var(--profiler-border) 55%, transparent 55%);
}


.panel-resizer {
	position: absolute;
	top: -2px;
	left: 0;
	width: 100%;
	height: 5px;
	cursor: ns-resize;
	z-index: 1001;
}

#profiler-panel.position-top .panel-resizer {
	top: auto;
	bottom: -2px;
}

#profiler-panel.position-left .panel-resizer {
	top: 0;
	left: auto;
	right: -2px;
	width: 5px;
	height: 100%;
	cursor: ew-resize;
}

#profiler-panel.position-right .panel-resizer {
	top: 0;
	left: -2px;
	right: auto;
	width: 5px;
	height: 100%;
	cursor: ew-resize;
}

.profiler-header {
	display: flex;
	background-color: var(--profiler-header-bg);
	border-bottom: 1px solid var(--profiler-border);
	flex-shrink: 0;
	justify-content: space-between;
	align-items: stretch;

	overflow-x: auto;
	overflow-y: hidden;
	width: calc(100% - 134px);
	height: 38px;
	user-select: none;
	-webkit-user-select: none;
}

/* Adjust header width based on panel position */
#profiler-panel.position-right .profiler-header,
#profiler-panel.position-left .profiler-header {
	width: calc(100% - 134px);
}

#profiler-panel.position-bottom .profiler-header,
#profiler-panel.position-top .profiler-header {
	width: calc(100% - 134px);
}

/* Adjust header width when position toggle button is hidden (mobile) */
#profiler-panel.hide-position-toggle .profiler-header {
	width: calc(100% - 90px);
}

/* ===== RULES FOR WHEN THERE ARE NO TABS ===== */

/* Horizontal mode (bottom/top) without tabs */
#profiler-panel.position-bottom.no-tabs:not(.maximized),
#profiler-panel.position-top.no-tabs:not(.maximized) {
	height: 38px !important;
	min-height: 38px !important;
}

#profiler-panel.position-bottom.no-tabs .profiler-header,
#profiler-panel.position-top.no-tabs .profiler-header {
	width: 100%;
	height: 38px;
	border-bottom: none;
}

#profiler-panel.position-bottom.no-tabs .profiler-content-wrapper,
#profiler-panel.position-top.no-tabs .profiler-content-wrapper {
	display: none;
}

#profiler-panel.position-bottom.no-tabs .panel-resizer,
#profiler-panel.position-top.no-tabs .panel-resizer {
	display: none;
}

/* Vertical mode (right/left) without tabs */
#profiler-panel.position-right.no-tabs:not(.maximized),
#profiler-panel.position-left.no-tabs:not(.maximized) {
	width: 45px !important;
	min-width: 45px !important;
}

/* Vertical layout for header when no tabs */
#profiler-panel.position-right.no-tabs .profiler-header,
#profiler-panel.position-left.no-tabs .profiler-header {
	width: 100%;
	flex-direction: column;
	height: 100%;
	border-bottom: none;
}

/* Vertical layout for controls when no tabs */
#profiler-panel.position-right.no-tabs .profiler-controls,
#profiler-panel.position-left.no-tabs .profiler-controls {
	position: static;
	flex-direction: column-reverse;
	justify-content: flex-end;
	width: 100%;
	height: 100%;
	border-bottom: none;
	border-left: none;
	background: transparent;
}

#profiler-panel.position-right.no-tabs .profiler-controls button,
#profiler-panel.position-left.no-tabs .profiler-controls button {
	width: 100%;
	height: 45px;
	border-left: none;
	border-top: none;
	border-bottom: 1px solid var(--profiler-border);
}

#profiler-panel.position-right.no-tabs #maximize-btn,
#profiler-panel.position-left.no-tabs #maximize-btn,
#profiler-panel.position-bottom.no-tabs #maximize-btn,
#profiler-panel.position-top.no-tabs #maximize-btn {
	display: none;
}

#profiler-panel.position-right.no-tabs .profiler-content-wrapper,
#profiler-panel.position-left.no-tabs .profiler-content-wrapper {
	display: none;
}

#profiler-panel.position-right.no-tabs .profiler-tabs,
#profiler-panel.position-left.no-tabs .profiler-tabs {
	display: none;
}

#profiler-panel.position-right.no-tabs .panel-resizer,
#profiler-panel.position-left.no-tabs .panel-resizer {
	display: none;
}

/* Hide position toggle on mobile without tabs */
#profiler-panel.hide-position-toggle.position-right.no-tabs:not(.maximized),
#profiler-panel.hide-position-toggle.position-left.no-tabs:not(.maximized) {
	width: 45px !important;
	min-width: 45px !important;
}

/* Hide drag indicator on mobile devices */
#profiler-panel.hide-position-toggle .tab-btn.active::before {
	display: none;
}

.profiler-header::-webkit-scrollbar {
	width: 8px;
	height: 8px;
}

.profiler-header::-webkit-scrollbar-track {
	background: transparent;
}

.profiler-header::-webkit-scrollbar-thumb {
	background-color: rgba(0, 0, 0, 0.25);
	border-radius: 10px;
	transition: background 0.3s ease;
}

.profiler-header::-webkit-scrollbar-thumb:hover {
	background-color: rgba(0, 0, 0, 0.4);
}

.profiler-header::-webkit-scrollbar-corner {
	background: transparent;
}

#profiler-panel.dragging .profiler-header {
	cursor: grabbing !important;
}

#profiler-panel.dragging {
	opacity: 0.8;
}

.profiler-tabs {
	display: flex;
	cursor: grab;
	position: relative;
}

.profiler-tabs:active {
	cursor: grabbing;
}

.profiler-tabs::-webkit-scrollbar {
	width: 8px;
	height: 8px;
}

.profiler-tabs::-webkit-scrollbar-track {
	background: transparent;
}

.profiler-tabs::-webkit-scrollbar-thumb {
	background-color: rgba(0, 0, 0, 0.25);
	border-radius: 10px;
	transition: background 0.3s ease;
}

.profiler-tabs::-webkit-scrollbar-thumb:hover {
	background-color: rgba(0, 0, 0, 0.4);
}

.profiler-tabs::-webkit-scrollbar-corner {
	background: transparent;
}

.profiler-controls {
	display: flex;
	position: absolute;
	right: 0;
	top: 0;
	height: 38px;
	background: var(--profiler-header-bg);
	border-bottom: 1px solid var(--profiler-border);
}

.tab-btn {
	position: relative;
	background: transparent;
	border: none;
	/*border-right: 1px solid var(--profiler-border);*/
	color: var(--text-secondary);
	padding: 8px 18px;
	cursor: default;
	display: flex;
	align-items: center;
	font-family: var(--font-family);
	font-weight: 600;
	font-size: 14px;
	user-select: none;
	transition: opacity 0.2s, transform 0.2s;
}

.tab-btn.active {
	border-bottom: 2px solid var(--accent-color);
	color: white;
}

.tab-btn.active::before {
	content: '⋮⋮';
	position: absolute;
	left: 3px;
	top: calc(50% - 2px);
	transform: translateY(-50%);
	color: var(--profiler-border);
	font-size: 18px;
	letter-spacing: -2px;
	opacity: 0.6;
}

.tab-btn.no-detach.active::before {
	display: none;
}

#floating-btn,
#maximize-btn,
#hide-panel-btn {
	background: transparent;
	border: none;
	border-left: 1px solid var(--profiler-border);
	color: var(--text-secondary);
	width: 45px;
	height: 100%;
	cursor: pointer;
	transition: all 0.2s;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

/* Disable transitions in vertical mode to avoid broken animations */
#profiler-panel.position-right #floating-btn,
#profiler-panel.position-right #maximize-btn,
#profiler-panel.position-right #hide-panel-btn,
#profiler-panel.position-left #floating-btn,
#profiler-panel.position-left #maximize-btn,
#profiler-panel.position-left #hide-panel-btn {
	transition: background-color 0.2s, color 0.2s;
}

#floating-btn:hover,
#maximize-btn:hover,
#hide-panel-btn:hover {
	background-color: rgba(255, 255, 255, 0.1);
	color: var(--text-primary);
}

.profiler-content-wrapper {
	flex-grow: 1;
	overflow: hidden;
	position: relative;
}

.profiler-content {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	overflow-y: auto;
	font-size: 13px;
	visibility: hidden;
	opacity: 0;
	transition: opacity 0.2s, visibility 0.2s;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
}

.profiler-content.active {
	visibility: visible;
	opacity: 1;
}

.profiler-content {
	overflow: auto; /* make sure scrollbars can appear */
}

.profiler-content::-webkit-scrollbar {
	width: 8px;
	height: 8px;
}

.profiler-content::-webkit-scrollbar-track {
	background: transparent;
}

.profiler-content::-webkit-scrollbar-thumb {
	background-color: rgba(0, 0, 0, 0.25);
	border-radius: 10px;
	transition: background 0.3s ease;
}

.profiler-content::-webkit-scrollbar-thumb:hover {
	background-color: rgba(0, 0, 0, 0.4);
}

.profiler-content::-webkit-scrollbar-corner {
	background: transparent;
}

.profiler-content {
	scrollbar-width: thin; /* "auto" | "thin" */
	scrollbar-color: rgba(0, 0, 0, 0.25) transparent;
}

.list-item-row {
	display: grid;
	align-items: center;
	padding: 4px 8px;
	border-radius: 3px;
	transition: background-color 0.2s;
	gap: 10px;
	border-bottom: none;
}

.list-item-wrapper {
	margin-top: 2px;
	margin-bottom: 2px;
}

.list-item-wrapper:first-child {
	/*margin-top: 0;*/
}

.list-item-wrapper:not(.header-wrapper):nth-child(odd) > .list-item-row {
	background-color: rgba(0,0,0,0.1);
}

.list-item-wrapper.header-wrapper>.list-item-row {
	color: var(--accent-color);
	background-color: rgba(0, 170, 255, 0.1);
}

.list-item-wrapper.header-wrapper>.list-item-row>.list-item-cell:first-child {
	font-weight: 600;
}

.list-item-row.collapsible,
.list-item-row.actionable {
	cursor: pointer;
}

.list-item-row.collapsible {
	background-color: rgba(0, 170, 255, 0.15) !important;
}

.list-item-row.collapsible.alert,
.list-item-row.alert {
	background-color: rgba(244, 67, 54, 0.1) !important;
}

@media (hover: hover) {

	.list-item-row:hover:not(.collapsible):not(.no-hover),
	.list-item-row:hover:not(.no-hover),
	.list-item-row.actionable:hover,
	.list-item-row.collapsible.actionable:hover {
		background-color: rgba(255, 255, 255, 0.05) !important;
	}

	.list-item-row.collapsible:hover {
		background-color: rgba(0, 170, 255, 0.25) !important;
	}

}

.list-item-cell {
	white-space: pre;
	display: flex;
	align-items: center;
}

.list-item-cell:not(:first-child) {
	justify-content: flex-end;
	font-weight: 600;
}

.list-header {
	display: grid;
	align-items: center;
	padding: 4px 8px;
	font-weight: 600;
	color: var(--text-secondary);
	padding-bottom: 6px;
	border-bottom: 1px solid var(--profiler-border);
	margin-bottom: 5px;
	gap: 10px;
}

.list-item-wrapper.section-start {
	margin-top: 5px;
	margin-bottom: 5px;
}

.list-header .list-header-cell:not(:first-child) {
	text-align: right;
}

.list-children-container {
	padding-left: 1.5em;
	overflow: hidden;
	transition: max-height 0.1s ease-out;
	margin-top: 2px;
}

.list-children-container.closed {
	max-height: 0;
}

.item-toggler {
	display: inline-block;
	margin-right: 0.8em;
	text-align: left;
}

.list-item-row.open .item-toggler::before {
	content: '-';
}

.list-item-row:not(.open) .item-toggler::before {
	content: '+';
}

.list-item-cell .value.good {
	color: var(--color-green);
}

.list-item-cell .value.warn {
	color: var(--color-yellow);
}

.list-item-cell .value.bad {
	color: var(--color-red);
}

.list-scroll-wrapper {
	overflow-x: auto;
	width: 100%;
}

.list-container.parameters .list-item-row:not(.collapsible) {
	height: 31px;
}

.graph-container {
	width: 100%;
	box-sizing: border-box;
	padding: 8px 0;
	position: relative;
}

.graph-svg {
	width: 100%;
	height: 80px;
	background-color: var(--profiler-header);
	border: 1px solid var(--profiler-border);
	border-radius: 4px;
}

.graph-path {
	stroke-width: 2;
	fill-opacity: 0.4;
}

.console-header {
	padding: 10px;
	border-bottom: 1px solid var(--profiler-border);
	display: flex;
	gap: 20px;
	flex-shrink: 0;
	align-items: center;
	justify-content: space-between;
}

.console-filters-group {
	display: flex;
	gap: 20px;
}

.console-filter-input {
	background-color: var(--profiler-bg);
	border: 1px solid var(--profiler-border);
	color: var(--text-primary);
	border-radius: 4px;
	padding: 4px 8px;
	font-family: var(--font-mono);
	flex-grow: 1;
	max-width: 300px;
	border-radius: 15px;
}

#console-log {
	display: flex;
	flex-direction: column;
	gap: 4px;
	padding: 10px;
	overflow-y: auto;
	flex-grow: 1;
}

.log-message {
	padding: 2px 5px;
	white-space: pre-wrap;
	word-break: break-all;
	border-radius: 3px;
	line-height: 1.5 !important;
}

.log-message.hidden {
	display: none;
}

.log-message.info {
	color: var(--text-primary);
}

.log-message.warn {
	color: var(--color-yellow);
}

.log-message.error {
	color: #f9dedc;
	background-color: rgba(244, 67, 54, 0.1);
}

.log-prefix {
	color: var(--text-secondary);
	margin-right: 8px;
}

.log-code {
	background-color: rgba(255, 255, 255, 0.1);
	border-radius: 3px;
	padding: 1px 4px;
}

.thumbnail-container {
	display: flex;
	align-items: center;
}

.thumbnail-svg {
	width: 40px;
	height: 22.5px;
	flex-shrink: 0;
	margin-right: 8px;
}

.param-control {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 10px;
	width: 100%;
}

.param-control input,
.param-control select,
.param-control button {
	background-color: var(--profiler-bg);
	border: 1px solid var(--profiler-border);
	color: var(--text-primary);
	border-radius: 4px;
	padding: 4px 6px;
	padding-bottom: 2px;
	font-family: var(--font-mono);
	width: 100%;
	box-sizing: border-box;
}

.param-control select {
	padding-top: 3px;
	padding-bottom: 1px;
}

.param-control input[type="number"] {
	cursor: ns-resize;
}

.param-control input[type="color"] {
	padding: 2px;
}

.param-control button {
	cursor: pointer;
	transition: background-color 0.2s;
}

.param-control button:hover {
	background-color: var(--profiler-header);
}

.param-control-vector {
	display: flex;
	gap: 5px;
}

.custom-checkbox {
	display: inline-flex;
	align-items: center;
	cursor: pointer;
	gap: 8px;
}

.custom-checkbox input {
	display: none;
}

.custom-checkbox .checkmark {
	width: 14px;
	height: 14px;
	border: 1px solid var(--profiler-border);
	border-radius: 3px;
	display: inline-flex;
	justify-content: center;
	align-items: center;
	transition: background-color 0.2s, border-color 0.2s;
}

.custom-checkbox .checkmark::after {
	content: '';
	width: 8px;
	height: 8px;
	background-color: var(--accent-color);
	border-radius: 1px;
	display: block;
	transform: scale(0);
	transition: transform 0.2s;
}

.custom-checkbox input:checked+.checkmark {
	border-color: var(--accent-color);
}

.custom-checkbox input:checked+.checkmark::after {
	transform: scale(1);
}

.param-control input[type="range"] {
	-webkit-appearance: none;
	appearance: none;
	width: 100%;
	height: 16px;
	background: var(--profiler-header);
	border-radius: 5px;
	border: 1px solid var(--profiler-border);
	outline: none;
	padding: 0px;
	padding-top: 8px;
}

.param-control input[type="range"]::-webkit-slider-thumb {
	-webkit-appearance: none;
	appearance: none;
	width: 18px;
	height: 18px;
	background: var(--profiler-bg);
	border: 1px solid var(--accent-color);
	border-radius: 3px;
	cursor: pointer;
	margin-top: -8px;
}

.param-control input[type="range"]::-moz-range-thumb {
	width: 18px;
	height: 18px;
	background: var(--profiler-bg);
	border: 2px solid var(--accent-color);
	border-radius: 3px;
	cursor: pointer;
}

.param-control input[type="range"]::-moz-range-track {
	width: 100%;
	height: 16px;
	background: var(--profiler-header);
	border-radius: 5px;
	border: 1px solid var(--profiler-border);
}

@media screen and (max-width: 450px) and (orientation: portrait) {

	.console-filter-input {
		max-width: 100px;
	}

}

.drag-preview-indicator {
	position: fixed;
	background-color: rgba(0, 170, 255, 0.2);
	border: 2px dashed var(--accent-color);
	z-index: 999;
	pointer-events: none;
	transition: all 0.2s ease-out;
}

/* Detached Tab Windows */
.detached-tab-panel {
	position: fixed;
	width: 500px;
	height: 400px;
	background: var(--profiler-bg);
	border: 1px solid var(--profiler-border);
	border-radius: 8px;
	box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
	z-index: 1002;
	display: flex;
	flex-direction: column;
	backdrop-filter: blur(10px);
	overflow: hidden;
	opacity: 1;
	visibility: visible;
	transition: opacity 0.2s, visibility 0.2s;
}

#profiler-panel:not(.visible) ~ * .detached-tab-panel,
body:has(#profiler-panel:not(.visible)) .detached-tab-panel {
	opacity: 0;
	visibility: hidden;
	pointer-events: none;
}

.detached-tab-header {
	background: var(--profiler-header-bg);
	padding: 0 7px 0 15px;
	font-family: var(--font-family);
	font-size: 14px;
	color: var(--text-primary);
	font-weight: 600;
	display: flex;
	justify-content: space-between;
	align-items: center;
	border-bottom: 1px solid var(--profiler-border);
	cursor: grab;
	user-select: none;
	height: 38px;
	flex-shrink: 0;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}

.detached-tab-header:active {
	cursor: grabbing;
}

.detached-header-controls {
	display: flex;
	gap: 5px;
}

.detached-reattach-btn {
	background: transparent;
	border: none;
	color: var(--text-secondary);
	font-family: var(--font-family);
	font-size: 18px;
	line-height: 1;
	cursor: pointer;
	padding: 4px 8px;
	border-radius: 4px;
	transition: all 0.2s;
	display: flex;
	align-items: center;
	justify-content: center;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}

.detached-reattach-btn:hover {
	background: rgba(0, 170, 255, 0.2);
	color: var(--accent-color);
}

.detached-tab-content {
	flex: 1;
	overflow: auto;
	position: relative;
	background: var(--profiler-bg);
}

.detached-tab-content::-webkit-scrollbar {
	width: 8px;
	height: 8px;
}

.detached-tab-content::-webkit-scrollbar-track {
	background: transparent;
}

.detached-tab-content::-webkit-scrollbar-thumb {
	background-color: rgba(0, 0, 0, 0.25);
	border-radius: 10px;
	transition: background 0.3s ease;
}

.detached-tab-content::-webkit-scrollbar-thumb:hover {
	background-color: rgba(0, 0, 0, 0.4);
}

.detached-tab-content::-webkit-scrollbar-corner {
	background: transparent;
}

.detached-tab-content .profiler-content {
	display: block !important;
	height: 100%;
	visibility: visible !important;
	opacity: 1 !important;
	position: relative !important;
}

.detached-tab-content .profiler-content > * {
	font-family: var(--font-mono);
	color: var(--text-primary);
}

.detached-tab-resizer {
	position: absolute;
	bottom: 0;
	right: 0;
	width: 20px;
	height: 20px;
	cursor: nwse-resize;
	z-index: 10;
}

.detached-tab-resizer::after {
	content: '';
	position: absolute;
	bottom: 2px;
	right: 2px;
	width: 12px;
	height: 12px;
	border-right: 2px solid var(--profiler-border);
	border-bottom: 2px solid var(--profiler-border);
	border-bottom-right-radius: 6px;
	opacity: 0.5;
}

.detached-tab-resizer:hover::after {
	opacity: 1;
	border-color: var(--accent-color);
}

/* Edge resizers */
.detached-tab-resizer-top {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 5px;
	cursor: ns-resize;
	z-index: 10;
}

.detached-tab-resizer-right {
	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	width: 5px;
	cursor: ew-resize;
	z-index: 10;
}

.detached-tab-resizer-bottom {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	height: 5px;
	cursor: ns-resize;
	z-index: 10;
}

.detached-tab-resizer-left {
	position: absolute;
	top: 0;
	left: 0;
	bottom: 0;
	width: 5px;
	cursor: ew-resize;
	z-index: 10;
}

/* Input number spin buttons - hide arrows */
/* Chrome, Safari, Edge, Opera */
#profiler-panel input[type="number"]::-webkit-outer-spin-button,
#profiler-panel input[type="number"]::-webkit-inner-spin-button,
.detached-tab-content input[type="number"]::-webkit-outer-spin-button,
.detached-tab-content input[type="number"]::-webkit-inner-spin-button {
	-webkit-appearance: none;
	margin: 0;
}

/* Firefox */
#profiler-panel input[type="number"],
.detached-tab-content input[type="number"] {
	-moz-appearance: textfield;
}
`;
		const styleElement = document.createElement( 'style' );
		styleElement.id = 'profiler-styles';
		styleElement.textContent = css;
		document.head.appendChild( styleElement );

	}

}
