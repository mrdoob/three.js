export class Style {

	static init( container ) {

		const css = /* css */`
@scope (.three-inspector) {

	:scope {
		--profiler-background: #1e1e24f5;
		--profiler-header-background: #2a2a33aa;
		--profiler-header: #2a2a33;
		--profiler-border: #4a4a5a;
		--text-primary: #e0e0e0;
		--text-secondary: #9a9aab;
		--color-accent: #00aaff;
		--color-green: #4caf50;
		--color-yellow: #ffc107;
		--color-red: #f44336;
		--color-fps: rgb(63, 81, 181);
		--color-call: rgba(255, 185, 34, 1);
		--font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		--font-mono: 'Courier New', Courier, monospace;
	}

	.profiler-panel, .profiler-toggle, .detached-tab-panel,
	.profiler-panel *, .profiler-toggle *, .detached-tab-panel * {
		text-transform: initial;
		line-height: normal;
		box-sizing: border-box;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		-webkit-tap-highlight-color: transparent;
	}

	.profiler-toggle {
		position: fixed;
		top: 15px;
		right: 15px;
		background-color: rgba(30, 30, 36, 0.85);
		border: 1px solid #4a4a5a54;
		border-radius: 12px 6px 6px 12px;
		color: var(--text-primary);
		cursor: pointer;
		z-index: 1001;
		transition: all 0.2s ease-in-out;
		/*font-size: 14px;*/
		font-size: 15px;
		backdrop-filter: blur(8px);
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
		display: flex;
		align-items: stretch;
		padding: 0;
		overflow: hidden;
		font-family: var(--font-family);
	}

	.profiler-toggle-graph {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 0;
		pointer-events: none;
		background: transparent;
		border: none;
		border-radius: inherit;
		opacity: 0.5;
	}

	.profiler-toggle.position-right.panel-open {
		right: auto;
		left: 15px;
		border-radius: 6px 12px 12px 6px;
		flex-direction: row-reverse;
	}

	.profiler-toggle.position-right.panel-open .builtin-tabs-container {
		border-right: none;
		border-left: 1px solid #262636;
	}

	.profiler-toggle:hover {
		border-color: var(--color-accent);
	}

	.profiler-toggle.panel-open .toggle-icon {
		background-color: rgba(0, 170, 255, 0.2);
		color: var(--color-accent);
	}

	.toggle-icon {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		font-size: 20px;
		transition: background-color 0.2s;
	}

	.console-badge-container {
		position: absolute;
		top: 2px;
		right: 2px;
		display: flex;
		gap: 2px;
		pointer-events: none;
	}

	.console-badge,
	.tab-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 14px;
		height: 14px;
		padding: 0 4px;
		border-radius: 7px;
		font-size: 9px;
		font-weight: bold;
		color: #ffffff;
		line-height: 1;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
		border: 1px solid rgba(0, 0, 0, 0.2);
	}

	.tab-badge-container {
		position: absolute;
		top: 2px;
		right: 3px;
		display: flex;
		gap: 2px;
		pointer-events: none;
	}

	.console-badge.error,
	.tab-badge.error {
		background-color: var(--color-red);
	}

	.console-badge.warn,
	.tab-badge.warn {
		background-color: var(--color-yellow);
		color: #111111;
	}

	.profiler-toggle:hover .toggle-icon {
		background-color: rgba(255, 255, 255, 0.05);
	}

	.profiler-toggle.panel-open:hover .toggle-icon {
		background-color: rgba(0, 170, 255, 0.3);
	}

	.toggle-separator {
		width: 1px;
		background-color: var(--profiler-border);
	}

	.toggle-text {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: baseline;
		padding: 8px 14px;
		min-width: 80px;
		justify-content: right;
	}

	.toggle-text .fps-label {
		font-size: 0.7em;
		margin-left: 10px;
		color: #999;
	}

	.builtin-tabs-container {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: stretch;
		gap: 0;
		border-right: 1px solid #262636;
		order: -1;
	}

	.builtin-tab-btn {
		background: transparent;
		border: none;
		color: var(--text-secondary);
		cursor: pointer;
		padding: 8px 14px;
		font-family: var(--font-family);
		font-size: 13px;
		font-weight: 600;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 32px;
		position: relative;
	}

	.builtin-tab-btn svg {
		width: 20px;
		height: 20px;
		stroke: currentColor;
	}

	.builtin-tab-btn:hover {
		background-color: rgba(255, 255, 255, 0.08);
		color: var(--color-accent);
	}

	.builtin-tab-btn:active {
		background-color: rgba(255, 255, 255, 0.12);
	}

	.builtin-tab-btn.active {
		background-color: rgba(0, 170, 255, 0.2);
		color: var(--color-accent);
	}

	.builtin-tab-btn.active:hover {
		background-color: rgba(0, 170, 255, 0.3);
	}

	.profiler-mini-panel {
		position: fixed;
		top: 60px;
		right: 15px;
		background-color: rgba(30, 30, 36, 0.85);
		border: 1px solid #4a4a5a54;
		border-radius: 8px;
		color: var(--text-primary);
		z-index: 9999;
		backdrop-filter: blur(8px);
		box-shadow: 0 6px 24px rgba(0, 0, 0, 0.5);
		font-family: var(--font-family);
		font-size: 11px;
		width: 350px;
		max-width: calc(100vw - 30px);
		min-width: 170px;
		max-height: calc(100vh - 100px);
		overflow-y: auto;
		overflow-x: hidden;
		display: none;
		opacity: 0;
		transform: translateY(-10px) scale(0.98);
		transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), 
					transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.profiler-mini-panel.position-right.panel-open {
		right: auto;
		left: 15px;
	}

	.profiler-mini-panel.visible {
		display: block;
		opacity: 1;
		transform: translateY(0) scale(1);
	}

	/* Position toggle and mini-panel at the bottom when maximized */
	:scope:has(.profiler-panel.maximized) .profiler-toggle,
	:scope.maximized .profiler-toggle {
		top: auto !important;
		bottom: 15px !important;
		z-index: 10005 !important;
	}

	:scope:has(.profiler-panel.maximized) .profiler-mini-panel,
	:scope.maximized .profiler-mini-panel {
		top: auto !important;
		bottom: 60px !important;
		max-height: calc(100vh - 120px) !important;
		z-index: 10006 !important;
	}

	.profiler-mini-panel::-webkit-scrollbar {
		width: 6px;
	}

	.profiler-mini-panel::-webkit-scrollbar-track {
		background: transparent;
	}

	.profiler-mini-panel::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.15);
		border-radius: 3px;
		transition: background 0.2s;
	}

	.profiler-mini-panel::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.25);
	}

	.mini-panel-content {
		padding: 0;
		font-size: 11px;
		line-height: 1.5;
		font-family: var(--font-mono);
		letter-spacing: 0.3px;
		user-select: none;
		-webkit-user-select: none;
	}

	.mini-panel-content .profiler-content {
		display: block !important;
		background: transparent;
	}

	.mini-panel-content .list-scroll-wrapper {
		max-height: calc(100vh - 120px);
		overflow-y: auto;
		overflow-x: hidden;
		width: 100%;
	}

	.mini-panel-content .list-scroll-wrapper::-webkit-scrollbar {
		width: 4px;
	}

	.mini-panel-content .list-scroll-wrapper::-webkit-scrollbar-track {
		background: transparent;
	}

	.mini-panel-content .list-scroll-wrapper::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 2px;
	}

	.mini-panel-content .list-scroll-wrapper::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.2);
	}

	.mini-panel-content .parameters {
		background: transparent;
		border: none;
		box-shadow: none;
		padding: 4px;
	}

	@media screen and (max-width: 340px) {

		.mini-panel-content .parameters {
			min-width: 0 !important;
		}

		.mini-panel-content .list-container.parameters .list-item-row,
		.mini-panel-content .list-container.parameters .list-header {
			grid-template-columns: minmax(0, .5fr) minmax(0, 1fr) !important;
		}

	}

	.mini-panel-content .list-container.parameters {
		padding: 2px 6px 0px 6px !important;
	}

	.mini-panel-content .list-header {
		display: none;
		padding: 2px 4px;
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.mini-panel-content .list-item {
		border-bottom: 1px solid rgba(74, 74, 90, 0.2);
		transition: background-color 0.15s;
	}

	.mini-panel-content .list-item:last-child {
		border-bottom: none;
	}

	.mini-panel-content .list-item:hover {
		background-color: rgba(255, 255, 255, 0.04);
	}

	.mini-panel-content .list-item.actionable:hover {
		background-color: rgba(255, 255, 255, 0.06);
		cursor: pointer;
	}

	.info-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background-color: rgba(255, 255, 255, 0.1);
		color: var(--text-secondary);
		font-size: 10px;
		font-style: italic;
		margin-left: 6px;
		cursor: help;
		position: relative;
	}

	.info-icon.active {
		background-color: var(--color-accent);
		color: white;
	}

	@media (hover: hover) {
		.info-icon:hover {
			background-color: var(--color-accent);
			color: white;
		}
	}

	.info-tooltip {
		position: fixed;
		transform: translate(-50%, -100%);
		background-color: rgba(30, 30, 36, 0.95);
		border: 1px solid var(--profiler-border);
		border-radius: 6px;
		padding: 10px 14px;
		color: var(--text-primary);
		font-size: 12px;
		width: max-content;
		max-width: 250px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
		opacity: 0;
		visibility: hidden;
		transition: opacity 0.2s, visibility 0.2s;
		z-index: 999999;
		font-style: normal;
		font-family: var(--font-family);
		text-align: left;
		white-space: normal;
	}

	.info-tooltip h3 {
		margin: 0 0 6px 0;
		font-size: 13px;
		color: var(--color-accent);
	}

	.info-tooltip strong {
		font-weight: 600;
		color: white;
	}

	/* Style adjustments for lil-gui look */
	.mini-panel-content .item-row {
		padding: 3px 8px;
		min-height: 24px;
	}

	.mini-panel-content .list-item-row {
		padding: 1px 4px;
		gap: 8px;
		min-height: 21px;
		align-items: center;
	}

	.mini-panel-content input[type="checkbox"] {
		width: 12px;
		height: 12px;
	}

	.mini-panel-content input[type="range"] {
		height: 18px;
	}

	.mini-panel-content .value-number input,
	.mini-panel-content .value-slider input {
		background-color: rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(74, 74, 90, 0.5);
		font-size: 10px;
	}

	.mini-panel-content .value-number input:focus,
	.mini-panel-content .value-slider input:focus {
		border-color: var(--color-accent);
	}

	.mini-panel-content .value-slider {
		gap: 6px;
	}

	/* Compact nested items */
	.mini-panel-content .list-item .list-item {
		margin-left: 8px;
	}

	.mini-panel-content .list-item .list-item .item-row,
	.mini-panel-content .list-item .list-item .list-item-row {
		padding: 2px 6px;
		min-height: 22px;
	}

	/* Compact collapsible headers */
	.mini-panel-content .collapsible .item-row,
	.mini-panel-content .list-item-row.collapsible {
		padding: 2px 8px;
		font-weight: 600;
		min-height: 16px;
		display: flex;
		align-items: center;
	}

	.mini-panel-content .collapsible-icon {
		font-size: 10px;
		width: 14px;
		height: 14px;
	}

	.mini-panel-content .param-control input[type="range"] {
		height: 12px;
		margin-top: 1px;
		padding-top: 5px;
		user-select: none;
		-webkit-user-select: none;
		outline: none;
	}

	.mini-panel-content .param-control input[type="range"]::-webkit-slider-thumb {
		width: 14px;
		height: 14px;
		margin-top: -5px;
		user-select: none;
		-webkit-user-select: none;
	}

	.mini-panel-content .param-control input[type="range"]::-moz-range-thumb {
		width: 14px;
		height: 14px;
		user-select: none;
		-moz-user-select: none;
	}

	.mini-panel-content .list-children-container {
		padding-left: 0;
	}

	.mini-panel-content .param-control input[type="number"] {
		flex-basis: 60px !important;
	}

	.mini-panel-content .param-control {
		align-items: center;
	}

	.mini-panel-content .param-control select {
		font-size: 11px;
	}

	.mini-panel-content .list-item-wrapper {
		margin-top: 0;
		margin-bottom: 0;
	}

	.profiler-panel {
		position: fixed;
		z-index: 1001 !important;
		bottom: 0;
		left: 0;
		right: 0;
		height: 350px;
		background-color: var(--profiler-background);
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

	.profiler-panel.resizing,
	.profiler-panel.dragging {
		transition: none;
	}

	.profiler-panel.visible {
		transform: translateY(0);
	}

	.profiler-panel.maximized {
		height: 100vh;
	}

	/* Position-specific styles */
	.profiler-panel.position-top {
		bottom: auto;
		top: 0;
		border-top: none;
		border-bottom: 2px solid var(--profiler-border);
		transform: translateY(-100%);
	}

	.profiler-panel.position-top.visible {
		transform: translateY(0);
	}

	.profiler-panel.position-bottom {
		/* Default position - already defined above */
	}

	.profiler-panel.position-left {
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

	.profiler-panel.position-left.visible {
		transform: translateX(0);
	}

	.profiler-panel.position-right {
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

	.profiler-panel.position-right.visible {
		transform: translateX(0);
	}

	.profiler-panel.position-floating {
		border: 2px solid var(--profiler-border);
		border-radius: 8px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
		transform: none !important;
		overflow: hidden;
	}

	.profiler-panel.position-floating.visible {
		transform: none !important;
	}

	.profiler-panel.position-floating .profiler-header {
		border-radius: 6px 6px 0 0;
	}

	.profiler-panel.position-floating .panel-resizer {
		bottom: 0;
		right: 0;
		top: auto;
		left: auto;
		width: 16px;
		height: 16px;
		cursor: nwse-resize;
		border-radius: 0 0 6px 0;
	}

	.profiler-panel.position-floating .panel-resizer::after {
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
		touch-action: none;
	}

	.profiler-panel.position-top .panel-resizer {
		top: auto;
		bottom: -2px;
	}

	.profiler-panel.position-left .panel-resizer {
		top: 0;
		left: auto;
		right: -2px;
		width: 5px;
		height: 100%;
		cursor: ew-resize;
	}

	.profiler-panel.position-right .panel-resizer {
		top: 0;
		left: -2px;
		right: auto;
		width: 5px;
		height: 100%;
		cursor: ew-resize;
	}

	.profiler-header {
		display: flex;
		background-color: var(--profiler-header-background);
		border-bottom: 1px solid var(--profiler-border);
		flex-shrink: 0;
		justify-content: space-between;
		align-items: stretch;

		overflow-x: auto;
		overflow-y: hidden;
		width: calc(100% - 120px);
		height: 32px;
		user-select: none;
		-webkit-user-select: none;
	}

	.profiler-panel.has-horizontal-scroll .profiler-header {
		height: 38px;
	}

	/* Adjust header width based on panel position */
	.profiler-panel.position-right .profiler-header,
	.profiler-panel.position-left .profiler-header {
		width: calc(100% - 120px);
	}

	.profiler-panel.position-bottom .profiler-header,
	.profiler-panel.position-top .profiler-header {
		width: calc(100% - 120px);
	}

	/* Adjust header width when position toggle button is hidden (mobile) */
	.profiler-panel.hide-position-toggle .profiler-header {
		width: calc(100% - 80px);
	}

	/* Adjust header width when maximized (floating position toggle button is hidden) */
	.profiler-panel.maximized .profiler-header {
		width: calc(100% - 80px);
	}

	/* ===== RULES FOR WHEN THERE ARE NO TABS ===== */

	/* Horizontal mode (bottom/top) without tabs */
	.profiler-panel.position-bottom.no-tabs:not(.maximized),
	.profiler-panel.position-top.no-tabs:not(.maximized) {
		height: 32px !important;
		min-height: 32px !important;
	}

	.profiler-panel.position-bottom.no-tabs .profiler-header,
	.profiler-panel.position-top.no-tabs .profiler-header {
		width: 100%;
		height: 32px;
		border-bottom: none;
	}

	.profiler-panel.position-bottom.no-tabs .profiler-content-wrapper,
	.profiler-panel.position-top.no-tabs .profiler-content-wrapper {
		display: none;
	}

	.profiler-panel.position-bottom.no-tabs .panel-resizer,
	.profiler-panel.position-top.no-tabs .panel-resizer {
		display: none;
	}

	/* Vertical mode (right/left) without tabs */
	.profiler-panel.position-right.no-tabs:not(.maximized),
	.profiler-panel.position-left.no-tabs:not(.maximized) {
		width: 40px !important;
		min-width: 40px !important;
	}

	/* Vertical layout for header when no tabs */
	.profiler-panel.position-right.no-tabs .profiler-header,
	.profiler-panel.position-left.no-tabs .profiler-header {
		width: 100%;
		flex-direction: column;
		height: 100%;
		border-bottom: none;
	}

	/* Vertical layout for controls when no tabs */
	.profiler-panel.position-right.no-tabs .profiler-controls,
	.profiler-panel.position-left.no-tabs .profiler-controls {
		position: static;
		flex-direction: column-reverse;
		justify-content: flex-end;
		width: 100%;
		height: 100%;
		border-bottom: none;
		border-left: none;
		background: transparent;
	}

	.profiler-panel.position-right.no-tabs .profiler-controls button,
	.profiler-panel.position-left.no-tabs .profiler-controls button {
		width: 100%;
		height: 40px;
		border-left: none;
		border-top: none;
		border-bottom: 1px solid var(--profiler-border);
	}

	.profiler-panel.position-right.no-tabs .profiler-content-wrapper,
	.profiler-panel.position-left.no-tabs .profiler-content-wrapper {
		display: none;
	}

	.profiler-panel.position-right.no-tabs .profiler-tabs,
	.profiler-panel.position-left.no-tabs .profiler-tabs {
		display: none;
		padding-left: 2px;
	}

	.profiler-panel.position-right.no-tabs .panel-resizer,
	.profiler-panel.position-left.no-tabs .panel-resizer {
		display: none;
	}

	/* Hide position toggle on mobile without tabs */
	.profiler-panel.hide-position-toggle.position-right.no-tabs:not(.maximized),
	.profiler-panel.hide-position-toggle.position-left.no-tabs:not(.maximized) {
		width: 40px !important;
		min-width: 40px !important;
	}

	/* Hide drag indicator on mobile devices */
	.profiler-panel.is-mobile .tab-btn.active::before {
		display: none;
	}

	.profiler-header::-webkit-scrollbar,
	.profiler-tabs::-webkit-scrollbar,
	.profiler-content::-webkit-scrollbar,
	.detached-tab-content::-webkit-scrollbar,
	.console-log::-webkit-scrollbar,
	.timelineTrack::-webkit-scrollbar,
	.list-scroll-wrapper::-webkit-scrollbar {
		width: 4px;
		height: 4px;
	}

	.profiler-header::-webkit-scrollbar-track,
	.profiler-tabs::-webkit-scrollbar-track,
	.profiler-content::-webkit-scrollbar-track,
	.detached-tab-content::-webkit-scrollbar-track,
	.console-log::-webkit-scrollbar-track,
	.timelineTrack::-webkit-scrollbar-track,
	.list-scroll-wrapper::-webkit-scrollbar-track {
		background: transparent;
	}

	.profiler-header::-webkit-scrollbar-thumb,
	.profiler-tabs::-webkit-scrollbar-thumb,
	.profiler-content::-webkit-scrollbar-thumb,
	.detached-tab-content::-webkit-scrollbar-thumb,
	.console-log::-webkit-scrollbar-thumb,
	.timelineTrack::-webkit-scrollbar-thumb,
	.list-scroll-wrapper::-webkit-scrollbar-thumb {
		background-color: rgba(255, 255, 255, 0.15);
		border-radius: 2px;
	}

	.profiler-header::-webkit-scrollbar-thumb:hover,
	.profiler-tabs::-webkit-scrollbar-thumb:hover,
	.profiler-content::-webkit-scrollbar-thumb:hover,
	.detached-tab-content::-webkit-scrollbar-thumb:hover,
	.console-log::-webkit-scrollbar-thumb:hover,
	.timelineTrack::-webkit-scrollbar-thumb:hover,
	.list-scroll-wrapper::-webkit-scrollbar-thumb:hover {
		background-color: rgba(255, 255, 255, 0.3);
	}

	.profiler-header::-webkit-scrollbar-corner,
	.profiler-tabs::-webkit-scrollbar-corner,
	.profiler-content::-webkit-scrollbar-corner,
	.detached-tab-content::-webkit-scrollbar-corner,
	.console-log::-webkit-scrollbar-corner,
	.timelineTrack::-webkit-scrollbar-corner,
	.list-scroll-wrapper::-webkit-scrollbar-corner {
		background: transparent;
	}

	.profiler-header,
	.profiler-tabs,
	.profiler-content,
	.detached-tab-content,
	.console-log,
	.timelineTrack,
	.list-scroll-wrapper {
		scrollbar-width: thin;
		scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
	}

	.profiler-panel.dragging .profiler-header {
		cursor: grabbing !important;
	}

	.profiler-panel.dragging {
		opacity: 0.8;
	}

	.profiler-tabs {
		display: flex;
		cursor: grab;
		position: relative;
		margin-left: 2px;
	}

	.profiler-tabs:active {
		cursor: grabbing;
	}


	.profiler-controls {
		display: flex;
		position: absolute;
		right: 0;
		top: 0;
		height: 32px;
		background: var(--profiler-header-background);
		border-bottom: 1px solid var(--profiler-border);
	}

	.profiler-panel.has-horizontal-scroll .profiler-controls {
		height: 38px;
	}

	.tab-btn {
		position: relative;
		background: transparent;
		border: none;
		/*border-right: 1px solid var(--profiler-border);*/
		color: var(--text-secondary);
		padding: 0 15px 2px 15px;
		height: 100%;
		box-sizing: border-box;
		cursor: default;
		display: flex;
		align-items: center;
		font-family: var(--font-family);
		font-weight: 600;
		font-size: 13px;
		user-select: none;
		transition: opacity 0.2s, transform 0.2s;
		touch-action: pan-x;
		white-space: nowrap;
	}

	.tab-btn.active {
		border-bottom: 2px solid var(--color-accent);
		color: white;
	}

	.tab-btn.active::before {
		content: '';
		position: absolute;
		left: 2px;
		top: 50%;
		transform: translateY(-50%);
		width: 8px;
		height: 14px;
		background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg width='8' height='14' viewBox='0 0 8 14' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='3' r='1' fill='%234a4a5a'/%3E%3Ccircle cx='2' cy='7' r='1' fill='%234a4a5a'/%3E%3Ccircle cx='2' cy='11' r='1' fill='%234a4a5a'/%3E%3Ccircle cx='6' cy='3' r='1' fill='%234a4a5a'/%3E%3Ccircle cx='6' cy='7' r='1' fill='%234a4a5a'/%3E%3Ccircle cx='6' cy='11' r='1' fill='%234a4a5a'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: center;
		opacity: 0.6;
	}

	.tab-btn.no-detach.active::before {
		display: none;
	}

	.floating-btn,
	.maximize-btn,
	.hide-panel-btn {
		background: transparent;
		border: none;
		border-left: 1px solid var(--profiler-border);
		color: var(--text-secondary);
		width: 40px;
		height: 100%;
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	/* Disable transitions in vertical mode to avoid broken animations */
	.profiler-panel.position-right .floating-btn,
	.profiler-panel.position-right .maximize-btn,
	.profiler-panel.position-right .hide-panel-btn,
	.profiler-panel.position-left .floating-btn,
	.profiler-panel.position-left .maximize-btn,
	.profiler-panel.position-left .hide-panel-btn {
		transition: background-color 0.2s, color 0.2s;
	}

	.floating-btn:hover,
	.maximize-btn:hover,
	.hide-panel-btn:hover {
		background-color: rgba(255, 255, 255, 0.1);
		color: var(--text-primary);
	}

	/* Hide maximize button when there are no tabs */
	.profiler-panel.position-right.no-tabs .maximize-btn,
	.profiler-panel.position-left.no-tabs .maximize-btn,
	.profiler-panel.position-bottom.no-tabs .maximize-btn,
	.profiler-panel.position-top.no-tabs .maximize-btn {
		display: none !important;
	}

	/* Hide floating button when maximized */
	.profiler-panel.maximized .floating-btn {
		display: none !important;
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
		user-select: none;
		-webkit-user-select: none;
	}

	.profiler-content.active {
		visibility: visible;
		opacity: 1;
	}

	.profiler-content {
		overflow: auto; /* make sure scrollbars can appear */
	}


	.list-item-row {
		display: grid;
		align-items: center;
		padding: 4px 8px;
		border-radius: 3px;
		transition: background-color 0.2s;
		gap: 10px;
		border-bottom: none;
		user-select: none;
		-webkit-user-select: none;
	}

	.parameters .list-item-row {
		min-height: 31px;
	}

	.mini-panel-content .parameters .list-item-row {
		min-height: 21px;
	}

	.list-item-wrapper {
		margin-top: 2px;
		margin-bottom: 2px;
		user-select: none;
		-webkit-user-select: none;
	}

	.list-item-wrapper:first-child {
		/*margin-top: 0;*/
	}

	.list-item-wrapper:not(.header-wrapper):nth-child(odd) > .list-item-row {
		background-color: rgba(0,0,0,0.1);
	}

	.list-item-wrapper.header-wrapper>.list-item-row {
		color: var(--color-accent);
		background-color: rgba(0, 170, 255, 0.1);
	}

	.list-item-wrapper.header-wrapper>.list-item-row>.list-item-cell:first-child {
		font-weight: 600;
		line-height: 1;
	}

	.list-item-row.collapsible,
	.list-item-row.actionable {
		cursor: pointer;
	}

	.list-item-row.collapsible {
		background-color: rgba(0, 170, 255, 0.15) !important;
		min-height: 23px;
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
		user-select: none;
		-webkit-user-select: none;
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
		user-select: none;
		-webkit-user-select: none;
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
		width: max-content;
		min-width: 100%;
		display: flex;
		flex-direction: column;
		min-height: 100%;
	}

	.list-container.parameters .list-item-row:not(.collapsible) {
	}

	.graph-container {
		width: 100%;
		box-sizing: border-box;
		padding: 8px 0;
		position: relative;
	}

	.graph-svg, .graph-canvas {
		width: 0;
		min-width: 100%;
		height: 80px;
		background-color: var(--profiler-header);
		border: 1px solid var(--profiler-border);
		border-radius: 4px;
		display: block;
	}

	.graph-path {
		stroke-width: 2;
		fill-opacity: 0.4;
	}

	.console-buttons-group {
		display: flex;
		gap: 20px;
	}

	.console-filter-input {
		background-color: var(--profiler-background);
		border: 1px solid var(--profiler-border);
		color: var(--text-primary);
		border-radius: 4px;
		padding: 4px 8px;
		font-family: var(--font-mono);
		flex-grow: 1;
		max-width: 300px;
		border-radius: 15px;
	}

	.console-filter-input:focus {
		outline: none;
		border-color: var(--text-secondary);
	}

	.console-copy-button {
		background: transparent;
		border: none;
		color: var(--text-secondary);
		cursor: pointer;
		padding: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
		transition: color 0.2s, background-color 0.2s;
	}

	.console-copy-button:hover {
		color: var(--text-primary);
		background-color: var(--profiler-hover);
	}

	.console-copy-button.copied {
		color: var(--color-green);
	}

	.console-log {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 10px;
		overflow-y: auto;
		flex-grow: 1;
		user-select: text;
		-webkit-user-select: text;
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
		background-color: var(--profiler-background);
		border: 1px solid var(--profiler-border);
		color: var(--text-primary);
		border-radius: 4px;
		padding: 4px 6px;
		padding-bottom: 2px;
		font-family: var(--font-mono);
		width: 100%;
		box-sizing: border-box;
	}

	.param-control input:focus {
		outline: none;
		border-color: var(--color-accent);
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
		will-change: transform;
	}

	.custom-checkbox input {
		display: none;
	}

	.custom-checkbox .checkmark {
		width: 14px;
		height: 14px;
		border: 1px solid var(--color-accent);
		border-radius: 3px;
		display: inline-flex;
		justify-content: center;
		align-items: center;
		transition: background-color 0.2s, border-color 0.2s;
	}

	.custom-checkbox .checkmark::after {
		content: '';
		width: 6px;
		height: 6px;
		background-color: var(--color-accent);
		border-radius: 1px;
		display: block;
		transform: scale(0);
		transition: transform 0.2s;
	}

	.custom-checkbox input:checked+.checkmark {
		border-color: var(--color-accent);
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
		background: var(--profiler-background);
		border: 1px solid var(--color-accent);
		border-radius: 3px;
		cursor: pointer;
		margin-top: -8px;
	}

	.param-control input[type="range"]::-moz-range-thumb {
		width: 18px;
		height: 18px;
		background: var(--profiler-background);
		border: 2px solid var(--color-accent);
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

	/* Override .param-control styles for mini-panel-content */
	.mini-panel-content input,
	.mini-panel-content select,
	.mini-panel-content button {
		padding: 2px 4px;
		height: 21px;
		line-height: 1.4;
		padding-top: 4px;
	}

	.mini-panel-content .param-control input,
	.mini-panel-content .param-control select,
	.mini-panel-content .param-control button {
		background-color: #1e1e24c2;
		line-height: 1.0;
	}

	.mini-panel-content .param-control select {
		padding: 2px 2px;
		padding-top: 3px;
	}

	.mini-panel-content .param-control input[type="number"]::-webkit-outer-spin-button,
	.mini-panel-content .param-control input[type="number"]::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	.mini-panel-content .param-control input[type="number"] {
		-moz-appearance: textfield;
	}

	.mini-panel-content .list-item-cell span {
		position: relative;
		top: 1px;
		margin-left: 2px;
	}

	@media screen and (max-width: 340px) {

		.mini-panel-content .list-item-cell:first-child {
			display: flex;
			align-items: center;
			min-width: 0;
			overflow: hidden;
			width: 100%;
		}

		.mini-panel-content .list-item-cell:first-child .value {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			flex: 1 1 0%;
			min-width: 0;
		}

		.mini-panel-content .list-item-cell:first-child .info-icon {
			flex-shrink: 0;
		}

	}

	.mini-panel-content .custom-checkbox .checkmark {
		width: 12px;
		height: 12px;
		margin-bottom: 2px;
		will-change: transform;
	}

	.mini-panel-content .list-container.parameters .list-item-row:not(.collapsible) {
		margin-bottom: 2px;
	}

	.mini-panel-content .list-container.parameters .list-children-container > .list-item-wrapper:first-child:has(> .list-item-row:not(.collapsible)) {
		margin-top: 2px;
	}

	.mini-panel-content .list-container.parameters .list-children-container > .list-item-wrapper:last-child:has(> .list-item-row:not(.collapsible)) {
		margin-bottom: 4px;
	}

	@media screen and (max-width: 450px) and (orientation: portrait) {

		.console-filter-input {
			max-width: 100px;
		}

	}

	/* Touch device optimizations */
	@media (hover: none) and (pointer: coarse) {

		.panel-resizer {
			top: -10px !important;
			height: 20px !important;
		}

		.profiler-panel.position-top .panel-resizer {
			top: auto !important;
			bottom: -10px !important;
			height: 20px !important;
		}

		.profiler-panel.position-left .panel-resizer {
			right: -10px !important;
			width: 20px !important;
			height: 100% !important;
		}

		.profiler-panel.position-right .panel-resizer {
			left: -10px !important;
			width: 20px !important;
			height: 100% !important;
		}

		.detached-tab-resizer-top,
		.detached-tab-resizer-bottom {
			height: 10px !important;
		}

		.detached-tab-resizer-left,
		.detached-tab-resizer-right {
			width: 10px !important;
		}

	}

	.drag-preview-indicator {
		position: fixed;
		background-color: rgba(0, 170, 255, 0.2);
		border: 2px dashed var(--color-accent);
		z-index: 999;
		pointer-events: none;
		transition: all 0.2s ease-out;
	}

	/* Detached Tab Windows */
	.detached-tab-panel {
		position: fixed;
		width: 500px;
		height: 400px;
		background: var(--profiler-background);
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
		font-family: var(--font-mono);
		font-size: 13px;
	}

	.profiler-panel:not(.visible) ~ * .detached-tab-panel,
	body:has(.profiler-panel:not(.visible)) .detached-tab-panel {
		opacity: 0;
		visibility: hidden;
		pointer-events: none;
	}

	.detached-tab-header {
		background: var(--profiler-header-background);
		padding: 0 3px 0 10px;
		font-family: var(--font-family);
		font-size: 13px;
		color: var(--text-primary);
		font-weight: 600;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid var(--profiler-border);
		cursor: grab;
		user-select: none;
		height: 32px;
		flex-shrink: 0;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		touch-action: none;
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
		color: var(--color-accent);
	}

	.detached-tab-content {
		flex: 1;
		overflow: hidden;
		position: relative;
		background: var(--profiler-background);
	}


	.detached-tab-content .profiler-content {
		display: flex !important;
		flex-direction: column !important;
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
		touch-action: none;
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
		border-color: var(--color-accent);
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
		touch-action: none;
	}

	.detached-tab-resizer-right {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		width: 5px;
		cursor: ew-resize;
		z-index: 10;
		touch-action: none;
	}

	.detached-tab-resizer-bottom {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 5px;
		cursor: ns-resize;
		z-index: 10;
		touch-action: none;
	}

	.detached-tab-resizer-left {
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		width: 5px;
		cursor: ew-resize;
		z-index: 10;
		touch-action: none;
	}

	/* Input number spin buttons - hide arrows */
	/* Chrome, Safari, Edge, Opera */
	.profiler-panel input[type="number"]::-webkit-outer-spin-button,
	.profiler-panel input[type="number"]::-webkit-inner-spin-button,
	.detached-tab-content input[type="number"]::-webkit-outer-spin-button,
	.detached-tab-content input[type="number"]::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	/* Firefox */
	.profiler-panel input[type="number"],
	.detached-tab-content input[type="number"] {
		-moz-appearance: textfield;
	}

	.panel-action-btn {
		background: transparent;
		color: var(--text-primary);
		border: 1px solid var(--profiler-border);
		border-radius: 4px;
		padding: 6px 12px;
		cursor: pointer;
		font-family: var(--font-family);
		font-size: 12px;
		transition: background-color 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.panel-action-btn:hover {
		background-color: rgba(255, 255, 255, 0.05);
	}

	.node-canvas-wrapper {
		touch-action: none;
	}

	.node-canvas-wrapper .node-canvas-detach-btn {
		position: absolute;
		top: 5px;
		right: 5px;
		background: rgba(30, 30, 36, 0.85);
		border: 1px solid var(--profiler-border);
		color: var(--text-primary);
		border-radius: 4px;
		padding: 4px;
		cursor: pointer;
		opacity: 1;
		transition: background-color 0.2s, border-color 0.2s, color 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10;
	}

	.node-canvas-wrapper .node-canvas-detach-btn:hover {
		background-color: var(--color-accent);
		border-color: var(--color-accent);
		color: white;
	}

	.node-canvas-wrapper .node-canvas-fullscreen-btn {
		position: absolute;
		bottom: 5px;
		right: 5px;
		background: rgba(30, 30, 36, 0.85);
		border: 1px solid var(--profiler-border);
		color: var(--text-primary);
		border-radius: 4px;
		padding: 4px;
		cursor: pointer;
		opacity: 1;
		transition: background-color 0.2s, border-color 0.2s, color 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10;
	}

	.node-canvas-wrapper .node-canvas-fullscreen-btn:hover {
		background-color: var(--color-accent);
		border-color: var(--color-accent);
		color: white;
	}

	.profiler-panel.maximized .node-canvas-fullscreen-btn {
		display: none;
	}

	.toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 6px 8px;
		border-bottom: 1px solid var(--profiler-border);
		background: var(--profiler-header-background);
		flex-shrink: 0;
		box-sizing: border-box;
		gap: 16px;
	}

	.toolbar span {
		margin-right: 8px;
		color: var(--text-secondary);
		font-size: 12px;
		font-weight: 600;
	}

	.viewer-content .toolbar {
		justify-content: flex-end;
	}

	.viewer-back-btn {
		background: transparent;
		border: none;
		color: var(--text-secondary);
		cursor: pointer;
		font-size: 16px;
		line-height: 1;
		padding: 4px 8px;
		border-radius: 4px;
		margin-right: auto;
		transition: color 0.2s, background-color 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.viewer-back-btn:hover {
		color: var(--text-primary);
		background-color: rgba(255, 255, 255, 0.05);
	}

	.select {
		background: var(--profiler-background);
		border: 1px solid var(--profiler-border);
		color: var(--text-primary);
		border-radius: 4px;
		padding: 4px 16px 2px 6px;
		font-family: var(--font-mono);
		font-size: 12px;
		outline: none;
		cursor: pointer;
		appearance: none;
		-webkit-appearance: none;
		-moz-appearance: none;
		background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23e0e0e0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 5px center;
		background-size: 10px;
	}

	.select:focus {
		border-color: var(--color-accent);
	}

	.full-viewer-container {
		display: none;
		flex-grow: 1;
		width: 100%;
		height: 100%;
		overflow: hidden;
		position: relative;
		touch-action: none;
	}

}
`;

		const styleElement = document.createElement( 'style' );
		styleElement.textContent = css;

		container.appendChild( styleElement );

	}

}
