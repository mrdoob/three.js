/**
 * LUT3DStyle.js - Unified CSS stylesheet module for 3D LUT Generator extension
 */

export class LUT3DStyle {

	static init() {

		if ( document.getElementById( 'lut3d-generator-style' ) ) return;

		const style = document.createElement( 'style' );
		style.id = 'lut3d-generator-style';
		style.textContent = /* css */`
@scope (.lut-container) {

	:scope {
		position: relative !important;
		flex-grow: 1;
		height: 100%;
		overflow-y: auto;
		overflow-x: hidden;
		padding: 8px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		box-sizing: border-box;

		/* Ultra-Subtle Transparent Blueprint / Checkerboard Grid Background */
		background-color: transparent;
		background-image:
			linear-gradient(45deg, rgba(255, 255, 255, 0.008) 25%, transparent 25%),
			linear-gradient(-45deg, rgba(255, 255, 255, 0.008) 25%, transparent 25%),
			linear-gradient(45deg, transparent 75%, rgba(255, 255, 255, 0.008) 75%),
			linear-gradient(-45deg, transparent 75%, rgba(255, 255, 255, 0.008) 75%),
			linear-gradient(rgba(0, 170, 255, 0.015) 1px, transparent 1px),
			linear-gradient(90deg, rgba(0, 170, 255, 0.015) 1px, transparent 1px);
		background-size: 24px 24px, 24px 24px, 24px 24px, 24px 24px, 12px 12px, 12px 12px;
		background-position: 0 0, 0 12px, 12px -12px, -12px 0px, -1px -1px, -1px -1px;
	}

	.lut-toolbar {
		display: none !important;
	}

	/* Ultra-Premium Floating Glass Control Dock inside lut-container */
	.lut-dock-container {
		position: absolute !important;
		top: 12px !important;
		left: 50% !important;
		transform: translateX(-50%) !important;
		display: flex !important;
		align-items: center !important;
		justify-content: space-between !important;
		padding: 6px 14px !important;
		background: rgba(22, 22, 28, 0.85) !important;
		backdrop-filter: blur(12px) !important;
		border: 1px solid rgba(74, 74, 90, 0.4) !important;
		border-radius: 8px !important;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4) !important;
		z-index: 100 !important;
		gap: 12px !important;
		user-select: none !important;
		box-sizing: border-box !important;
		width: calc(100% - 32px) !important;
		max-width: 960px !important;
	}

	.lut-dock-container.is-compact .lut-dock-label,
	.lut-dock-container.is-compact .lut-dock-text {
		display: none !important;
	}

	.lut-dock-group {
		display: flex !important;
		align-items: center !important;
		gap: 6px !important;
		flex-wrap: wrap !important;
	}

	.lut-dock-label {
		font-family: var(--font-family, sans-serif);
		font-size: 11px;
		font-weight: 500;
		color: var(--text-secondary, #9a9aab);
		white-space: nowrap;
	}

	.lut-dock-select {
		height: 24px;
		padding: 0 4px;
		font-family: var(--font-family, sans-serif);
		font-size: 11px;
		font-weight: 600;
		color: var(--text-primary, #e0e0e0);
		background: transparent !important;
		border: none !important;
		outline: none;
		cursor: pointer;
		transition: color 0.15s;
	}

	.lut-dock-select option,
	.lut-container select option {
		background-color: #1e1e24;
		color: #e0e0e0;
	}

	.lut-dock-select:hover {
		color: var(--color-accent, #00aaff);
	}

	.lut-dock-btn {
		height: 24px;
		padding: 0 6px;
		font-family: var(--font-family, sans-serif);
		font-size: 11px;
		font-weight: 600;
		color: var(--text-primary, #e0e0e0);
		background: transparent !important;
		border: none !important;
		outline: none;
		cursor: pointer;
		transition: color 0.15s ease, opacity 0.15s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 4px;
		white-space: nowrap;
	}

	.lut-dock-btn.lut-dock-icon-btn {
		width: 20px !important;
		padding: 0 !important;
	}

	.lut-dock-btn:hover {
		color: var(--color-accent, #00aaff) !important;
	}

	.lut-dock-btn:active:not(:has(.lut-context-menu)) {
		transform: scale(0.95);
	}

	.lut-dock-btn.active {
		color: var(--color-accent, #00aaff) !important;
		text-shadow: 0 0 8px rgba(0, 170, 255, 0.6);
	}

	/* Glass Context Menu Popover */
	.lut-context-menu {
		position: absolute;
		top: calc(100% + 4px);
		right: 0;
		background: rgba(22, 22, 28, 0.95);
		border: 1px solid rgba(74, 74, 90, 0.5);
		border-radius: 6px;
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5), 0 0 10px rgba(0, 170, 255, 0.2);
		padding: 4px;
		display: flex;
		flex-direction: column;
		gap: 2px;
		z-index: 100;
		min-width: 165px;
		backdrop-filter: blur(12px);
		animation: lutMenuFadeIn 0.15s ease-out;
		text-align: left !important;
	}

	.lut-submenu {
		top: -4px !important;
		left: calc(100% + 4px) !important;
		right: auto !important;
		min-width: 155px !important;
	}

	@keyframes lutMenuFadeIn {
		from { opacity: 0; transform: translateY(-4px); }
		to { opacity: 1; transform: translateY(0); }
	}

	.lut-menu-item {
		display: flex !important;
		align-items: center !important;
		justify-content: flex-start !important;
		text-align: left !important;
		gap: 8px;
		padding: 6px 10px;
		font-family: var(--font-family, sans-serif);
		font-size: 11px;
		font-weight: 500;
		color: var(--text-primary, #e0e0e0);
		border-radius: 4px;
		cursor: pointer;
		transition: background 0.12s, color 0.12s;
		white-space: nowrap;
	}

	.lut-menu-item span {
		text-align: left !important;
	}

	.lut-menu-item:hover {
		background: rgba(0, 170, 255, 0.15);
		color: var(--color-accent, #00aaff);
	}

	.lut-menu-item:active:not(:has(.lut-context-menu)) {
		transform: scale(0.98);
	}

	.lut-menu-item svg {
		color: var(--text-secondary, #9a9aab);
		transition: color 0.12s;
		flex-shrink: 0;
	}

	.lut-menu-item:hover svg {
		color: var(--color-accent, #00aaff);
	}

	.lut-menu-divider {
		height: 1px;
		background: rgba(74, 74, 90, 0.4);
		margin: 2px 0;
	}

	.lut-toolbar-group {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.lut-toolbar-center {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		display: flex;
		gap: 2px;
		background: rgba(30, 30, 36, 0.6);
		padding: 2px;
		border-radius: 6px;
		border: 1px solid var(--profiler-border, rgba(74, 74, 90, 0.4));
	}

	.lut-toolbar-label {
		font-size: 11px;
		color: var(--text-secondary, #9a9aab);
	}

	.lut-panel {
		display: flex;
		flex-direction: column;
		justify-content: stretch;
		align-items: stretch;
		width: 100%;
		height: 100%;
		min-height: 100%;
		flex-grow: 1;
		box-sizing: border-box;
		position: relative;
	}

	.lut-container, .lut-cards-row {
		cursor: grab;
	}

	.lut-container.is-panning, .lut-cards-row.is-panning {
		cursor: grabbing !important;
		user-select: none !important;
	}

	.lut-cards-row {
		display: flex !important;
		flex-direction: row !important;
		justify-content: center !important;
		align-items: center !important;
		align-content: center !important;
		gap: 12px !important;
		flex-wrap: nowrap !important;
		overflow-x: auto !important;
		overflow-y: hidden !important;
		padding: 50px 32px 10px 32px !important;
		background: transparent !important;
		border: none !important;
		width: 100% !important;
		height: 100% !important;
		flex-grow: 1 !important;
		box-sizing: border-box !important;
		margin: 0 !important;
		touch-action: pan-x pan-y !important;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: thin;
		scrollbar-color: var(--profiler-border, rgba(74, 74, 90, 0.6)) transparent;
	}

	.lut-cards-row > .lut-card:first-child {
		margin-left: 24px !important;
	}

	.lut-cards-row > .lut-card:last-child {
		margin-right: 24px !important;
	}

	.lut-cards-row::-webkit-scrollbar,
	.lut-wheels-row::-webkit-scrollbar,
	.lut-modules-row::-webkit-scrollbar,
	.lut-container::-webkit-scrollbar {
		width: 5px;
		height: 5px;
	}

	.lut-cards-row::-webkit-scrollbar-track,
	.lut-wheels-row::-webkit-scrollbar-track,
	.lut-modules-row::-webkit-scrollbar-track,
	.lut-container::-webkit-scrollbar-track {
		background: rgba(0, 0, 0, 0.2);
		border-radius: 3px;
	}

	.lut-cards-row::-webkit-scrollbar-thumb,
	.lut-wheels-row::-webkit-scrollbar-thumb,
	.lut-modules-row::-webkit-scrollbar-thumb,
	.lut-container::-webkit-scrollbar-thumb {
		background: var(--profiler-border, rgba(74, 74, 90, 0.6));
		border-radius: 3px;
	}

	.lut-cards-row::-webkit-scrollbar-thumb:hover,
	.lut-wheels-row::-webkit-scrollbar-thumb:hover,
	.lut-modules-row::-webkit-scrollbar-thumb:hover,
	.lut-container::-webkit-scrollbar-thumb:hover {
		background: var(--color-accent, #00aaff);
	}

	.lut-wheels-row, .lut-modules-row {
		display: flex !important;
		flex-direction: row !important;
		justify-content: flex-start !important;
		align-items: stretch !important;
		gap: 12px !important;
		flex-wrap: nowrap !important;
		overflow-x: auto !important;
		overflow-y: hidden !important;
		padding: 6px 4px !important;
		background: transparent !important;
		border: none !important;
		width: 100% !important;
		box-sizing: border-box !important;
	}

	/* Modular Cards - Standard Unified Card Specification */
	.lut-card, .mini-module-card {
		display: flex !important;
		flex-direction: column !important;
		justify-content: space-between !important;
		align-items: center !important;
		background: rgba(30, 30, 36, 0.85) !important;
		border: 1px solid rgba(74, 74, 90, 0.4) !important;
		border-radius: 8px !important;
		padding: 1px 10px 8px 10px !important;
		width: 175px !important;
		min-width: 175px !important;
		max-width: 175px !important;
		flex-shrink: 0 !important;
		flex-grow: 0 !important;
		user-select: none !important;
		box-sizing: border-box !important;
		gap: 6px !important;
		backdrop-filter: blur(8px) !important;
		transition: opacity 0.2s, border-color 0.25s ease, box-shadow 0.25s ease !important;
	}

	/* Subtle Blue Glow when Hovered, Focused or Edited */
	.lut-card:hover,
	.lut-card:focus-within,
	.lut-card.lut-card-active {
		border-color: rgba(0, 170, 255, 0.6) !important;
		box-shadow: 0 0 14px rgba(0, 170, 255, 0.3), 0 0 2px rgba(0, 170, 255, 0.6) !important;
	}

	.lut-card.curves-card,
	.lut-card.preview-card {
		width: 225px !important;
		min-width: 225px !important;
		max-width: 225px !important;
	}

	/* Renderer (Start Node) & Output (End Node) Cards Glowing Highlights */
	.lut-card.renderer-card {
		border: 1px solid rgba(0, 170, 255, 0.6) !important;
		box-shadow: 0 0 12px rgba(0, 170, 255, 0.25), inset 0 0 8px rgba(0, 170, 255, 0.1) !important;
	}

	.lut-card.output-card {
		border: 1px solid rgba(0, 220, 180, 0.6) !important;
		box-shadow: 0 0 12px rgba(0, 220, 180, 0.25), inset 0 0 8px rgba(0, 220, 180, 0.1) !important;
	}

	.lut-card.renderer-card .lut-card-title {
		color: #00aaff !important;
	}

	.lut-card.output-card .lut-card-title {
		color: #00dcb4 !important;
	}

	.lut-output-info {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 6px 4px;
		width: 100%;
		box-sizing: border-box;
	}

	.lut-output-line {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 11px;
		line-height: 16px;
	}

	.lut-output-label {
		color: var(--text-secondary, #9a9aab);
		font-weight: 500;
	}

	.lut-output-val {
		color: var(--text-primary, #e0e0e0);
		font-weight: 600;
	}

	.lut-output-badge {
		background: rgba(0, 220, 180, 0.2);
		border: 1px solid rgba(0, 220, 180, 0.5);
		color: #00dcb4;
		padding: 1px 6px;
		border-radius: 4px;
		font-size: 10px;
	}

	.lut-card-header {
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		position: relative !important;
		width: calc(100% + 16px) !important;
		min-height: 28px !important;
		margin-bottom: 6px !important;
		padding: 0 20px !important;
		border-bottom: 1px solid rgba(74, 74, 90, 0.3) !important;
		box-sizing: border-box !important;
	}

	.lut-card-drag-handle {
		position: absolute !important;
		left: 4px !important;
		top: 0px !important;
		bottom: 0px !important;
		margin: 0 !important;
		height: 100% !important;
		display: flex !important;
		align-items: center !important;
		z-index: 5 !important;
	}

	.lut-card-remove-btn {
		position: absolute !important;
		right: 4px !important;
		top: 0px !important;
		bottom: 0px !important;
		margin: 0 !important;
		height: 100% !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		background: transparent !important;
		border: none !important;
		color: var(--text-secondary, #9a9aab) !important;
		cursor: pointer !important;
		padding: 0 !important;
		width: 18px !important;
		opacity: 0.6;
		z-index: 5 !important;
		transition: color 0.15s, opacity 0.15s !important;
	}

	.lut-card-remove-btn:hover {
		color: var(--color-accent, #00aaff) !important;
		opacity: 1 !important;
	}

	.lut-card-title {
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		width: 100% !important;
		height: 100% !important;
		text-align: center !important;
		font-family: var(--font-family, sans-serif) !important;
		font-size: 11px !important;
		font-weight: 600 !important;
		color: var(--text-primary, #e0e0e0) !important;
		letter-spacing: 0.3px !important;
		margin: 0 !important;
		padding: 0 !important;
		white-space: nowrap !important;
		overflow: hidden !important;
		text-overflow: ellipsis !important;
	}

	.lut-card-reset-btn, .lut-container .card-reset-btn {
		background: transparent !important;
		border: none !important;
		color: var(--text-secondary, #9a9aab) !important;
		cursor: pointer !important;
		padding: 0 !important;
		margin: 0 !important;
		width: 20px !important;
		height: 100% !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		opacity: 0.6;
		transition: color 0.15s, opacity 0.15s, transform 0.15s !important;
	}

	.lut-card-reset-btn:hover, .lut-container .card-reset-btn:hover {
		color: var(--color-accent, #00aaff) !important;
		opacity: 1 !important;
		transform: scale(1.1);
	}

	/* Flow Connector Nodes between Cards */
	.lut-flow-connector {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 12px;
		min-width: 12px;
		height: 100%;
		position: relative;
		flex-shrink: 0;
		user-select: none;
		pointer-events: none;
	}

	.lut-flow-connector::before {
		content: '';
		position: absolute;
		top: 50%;
		left: -6px;
		right: -6px;
		height: 2px;
		background: repeating-linear-gradient(90deg, rgba(74, 74, 90, 0.4) 0px, rgba(74, 74, 90, 0.4) 3px, transparent 3px, transparent 6px);
		transform: translateY(-50%);
	}

	@keyframes lutDashMarch {
		0% { background-position: 0 0; }
		100% { background-position: 12px 0; }
	}

	:scope.is-live-active .lut-flow-connector::before {
		background: repeating-linear-gradient(90deg, #00aaff 0px, #00aaff 4px, transparent 4px, transparent 8px);
		background-size: 12px 100%;
		animation: lutDashMarch 0.5s linear infinite;
		box-shadow: 0 0 8px rgba(0, 170, 255, 0.6);
	}

	/* Drag & Drop Moving Card State */
	.lut-card {
		cursor: default;
		transition: transform 0.15s ease, opacity 0.15s ease;
	}

	.lut-card-header {
		cursor: grab !important;
	}

	.lut-card-header:active {
		cursor: grabbing !important;
	}

	.lut-card-nodrag .lut-card-header {
		cursor: default !important;
	}

	.lut-card.lut-card-moving {
		opacity: 0.2 !important;
		border: 1px solid var(--color-accent, #00aaff) !important;
		box-shadow: 0 4px 16px rgba(0, 170, 255, 0.3) !important;
		z-index: 10;
	}

	/* Controls, Inputs & Sliders */
	.lut-param-box {
		display: flex;
		flex-direction: column;
		gap: 3px;
		width: 100%;
	}

	.lut-param-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		gap: 6px;
	}

	.lut-param-label {
		font-family: var(--font-family, sans-serif);
		font-size: 11px;
		color: var(--text-secondary, #9a9aab);
		font-weight: 500;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.lut-select, .lut-container select, .lut-toolbar select {
		height: 22px;
		font-family: var(--font-family, sans-serif);
		font-size: 11px;
		background: transparent !important;
		border: none !important;
		color: var(--text-primary, #e0e0e0);
		padding: 0 4px;
		outline: none;
		cursor: pointer;
		flex-shrink: 1;
		min-width: 40px;
	}

	.lut-select-compact {
		height: 20px;
		font-size: 10.5px;
		max-width: 92px;
		min-width: 40px;
		padding: 0 2px;
		flex-shrink: 1;
	}

	/* Slider Controls inside Cards */
	.lut-card input[type="range"].inspector-slider,
	.lut-container input[type="range"].inspector-slider {
		-webkit-appearance: none;
		appearance: none;
		width: 100%;
		height: 6px !important;
		background: rgba(0, 0, 0, 0.4) !important;
		border-radius: 3px !important;
		border: 1px solid rgba(74, 74, 90, 0.5) !important;
		outline: none !important;
		margin: 6px 0 !important;
		padding: 0 !important;
	}

	.lut-card input[type="range"].inspector-slider::-webkit-slider-thumb,
	.lut-container input[type="range"].inspector-slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 13px !important;
		height: 13px !important;
		background: var(--profiler-background, #1e1e24) !important;
		border: 1.5px solid var(--color-accent, #00aaff) !important;
		border-radius: 3px !important;
		cursor: pointer !important;
		margin-top: -0.5px !important;
	}

	.lut-card input[type="range"].inspector-slider::-moz-range-thumb,
	.lut-container input[type="range"].inspector-slider::-moz-range-thumb {
		width: 13px !important;
		height: 13px !important;
		background: var(--profiler-background, #1e1e24) !important;
		border: 1.5px solid var(--color-accent, #00aaff) !important;
		border-radius: 3px !important;
		cursor: pointer !important;
	}

	.lut-card input[type="range"].inspector-slider::-moz-range-track,
	.lut-container input[type="range"].inspector-slider::-moz-range-track {
		width: 100%;
		height: 6px !important;
		background: rgba(0, 0, 0, 0.4) !important;
		border-radius: 3px !important;
		border: 1px solid rgba(74, 74, 90, 0.5) !important;
	}

	.lut-num-input {
		width: 52px;
		min-width: 36px;
		flex-shrink: 1;
		background: transparent;
		border: none !important;
		color: var(--text-primary, #e0e0e0);
		font-family: var(--font-mono, monospace);
		font-size: 11px;
		font-weight: 600;
		text-align: right !important;
		outline: none;
		padding: 0 2px;
		transition: color 0.15s;
	}

	.lut-num-input:focus {
		color: var(--color-accent, #00aaff);
	}

	.lut-rgb-input {
		width: 100%;
		background: transparent;
		border: none;
		color: var(--text-primary, #e0e0e0);
		font-family: var(--font-mono, monospace);
		font-size: 10px;
		font-weight: 600;
		text-align: center !important;
		border-radius: 0 !important;
		outline: none;
		padding: 2px 2px 2px 0;
		transition: border-color 0.15s;
	}

	.lut-rgb-input:focus {
		border-bottom-color: var(--color-accent, #00aaff) !important;
	}

	.lut-rgb-input-y { border-bottom: 1px solid #aaaaaa; }
	.lut-rgb-input-r { border-bottom: 1px solid #ff4d4d; }
	.lut-rgb-input-g { border-bottom: 1px solid #4dff4d; }
	.lut-rgb-input-b { border-bottom: 1px solid #4d88ff; }

	.lut-wheel-canvas {
		width: 110px;
		height: 110px;
		cursor: crosshair;
		touch-action: none;
		border-radius: 50%;
		margin-bottom: 5px;
	}

	.lut-wheel-inputs-row {
		display: flex;
		gap: 3px;
		width: 100%;
		margin-top: 4px;
		justify-content: space-between;
	}

	.lut-wheel-input-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex: 1;
		min-width: 0;
	}

	/* Preview Tab UI */
	.lut-preview-box {
		background: rgba(30, 30, 36, 0.85);
		padding: 10px;
		border-radius: 8px;
		border: 1px solid rgba(74, 74, 90, 0.4);
		display: flex;
		flex-direction: column;
		gap: 8px;
		backdrop-filter: blur(8px);
	}

	.lut-preview-title {
		font-size: 11px;
		font-weight: 700;
		color: #e0e0e0;
		border-bottom: 1px solid #2a2a36;
		padding-bottom: 4px;
	}

	.lut-preview-canvas {
		width: 100%;
		height: 56px;
		min-height: 56px;
		border-radius: 4px;
		border: 1px solid #2a2a36;
		background: #000;
		image-rendering: pixelated;
	}

	.lut-btn-group {
		display: flex;
		gap: 8px;
	}

	/* Vertical Mode Layout */
	.profiler-panel.position-left .lut-container,
	.profiler-panel.position-right .lut-container,
	.lut-container.is-vertical {
		overflow-y: auto !important;
		overflow-x: hidden !important;
	}

	.profiler-panel.position-left .lut-panel,
	.profiler-panel.position-right .lut-panel,
	.lut-panel.is-vertical {
		height: auto !important;
		min-height: 100% !important;
	}

	.profiler-panel.position-left .lut-cards-row,
	.profiler-panel.position-right .lut-cards-row,
	.lut-container.is-vertical .lut-cards-row,
	.lut-cards-row.is-vertical {
		flex-direction: column !important;
		justify-content: flex-start !important;
		align-items: center !important;
		overflow-x: hidden !important;
		overflow-y: auto !important;
		padding: 56px 12px 24px 12px !important;
		gap: 12px !important;
		width: 100% !important;
		height: 100% !important;
	}

	.profiler-panel.position-left .lut-cards-row > .lut-card,
	.profiler-panel.position-right .lut-cards-row > .lut-card,
	.lut-container.is-vertical .lut-cards-row > .lut-card,
	.lut-cards-row.is-vertical > .lut-card {
		flex-shrink: 0 !important;
	}

	.profiler-panel.position-left .lut-cards-row > .lut-card:first-child,
	.profiler-panel.position-right .lut-cards-row > .lut-card:first-child,
	.lut-container.is-vertical .lut-cards-row > .lut-card:first-child,
	.lut-cards-row.is-vertical > .lut-card:first-child {
		margin-left: 0 !important;
		margin-top: 0 !important;
	}

	.profiler-panel.position-left .lut-cards-row > .lut-card:last-child,
	.profiler-panel.position-right .lut-cards-row > .lut-card:last-child,
	.lut-container.is-vertical .lut-cards-row > .lut-card:last-child,
	.lut-cards-row.is-vertical > .lut-card:last-child {
		margin-right: 0 !important;
		margin-bottom: 24px !important;
	}



	@keyframes lutDashMarchVertical {
		0% { background-position: 0 0; }
		100% { background-position: 0 12px; }
	}

	.profiler-panel.position-left .lut-flow-connector,
	.profiler-panel.position-right .lut-flow-connector,
	.lut-container.is-vertical .lut-flow-connector,
	.lut-cards-row.is-vertical .lut-flow-connector {
		width: 100% !important;
		min-width: 0 !important;
		height: 16px !important;
		min-height: 16px !important;
		margin: 2px 0 !important;
	}

	.profiler-panel.position-left .lut-flow-connector::before,
	.profiler-panel.position-right .lut-flow-connector::before,
	.lut-container.is-vertical .lut-flow-connector::before,
	.lut-cards-row.is-vertical .lut-flow-connector::before {
		top: -6px !important;
		bottom: -6px !important;
		left: 50% !important;
		right: auto !important;
		width: 2px !important;
		height: auto !important;
		background-image: repeating-linear-gradient(180deg, rgba(74, 74, 90, 0.4) 0px, rgba(74, 74, 90, 0.4) 3px, transparent 3px, transparent 6px) !important;
		transform: translateX(-50%) !important;
	}

	:scope.is-live-active.is-vertical .lut-flow-connector::before,
	:scope.is-live-active .lut-cards-row.is-vertical .lut-flow-connector::before {
		background-image: repeating-linear-gradient(180deg, #00aaff 0px, #00aaff 4px, transparent 4px, transparent 8px) !important;
		background-size: 100% 12px !important;
		animation: lutDashMarchVertical 0.5s linear infinite !important;
		box-shadow: 0 0 8px rgba(0, 170, 255, 0.6) !important;
	}

	/* Interactive Add Card Connector [+] Button */
	.lut-flow-connector {
		pointer-events: auto !important;
		width: 24px !important;
		min-width: 24px !important;
		z-index: 5;
	}

	.lut-connector-add-btn {
		width: 20px;
		height: 20px;
		border-radius: 6px;
		background: rgba(22, 22, 28, 0.95);
		border: 1px solid rgba(74, 74, 90, 0.7);
		color: var(--text-secondary, #9a9aab);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		z-index: 6;
		transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), background 0.2s, border-color 0.2s, color 0.2s, box-shadow 0.2s;
		padding: 0;
		outline: none;
		user-select: none;
	}

	:scope.is-live-active .lut-connector-add-btn {
		border-color: var(--color-accent, #00aaff);
		color: var(--color-accent, #00aaff);
	}

	.lut-connector-add-btn svg {
		width: 12px;
		height: 12px;
		display: block;
	}

	.lut-connector-add-btn:hover {
		transform: scale(1.15);
		background: #00aaff !important;
		border-color: #00aaff !important;
		color: #ffffff !important;
		box-shadow: 0 0 6px rgba(0, 170, 255, 0.4);
	}

	.lut-connector-add-btn:active {
		transform: scale(1.05);
	}

	/* Header Card Close Button at top-right (where reset button was) */
	.lut-card-remove-btn {
		position: absolute !important;
		right: 4px !important;
		top: 0px !important;
		bottom: 0px !important;
		margin: auto 0 !important;
		width: 20px !important;
		height: 100% !important;
		font-size: 11px !important;
		line-height: 23px !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		background: transparent !important;
		border: none !important;
		color: var(--text-secondary, #9a9aab) !important;
		cursor: pointer !important;
		padding: 0 !important;
		z-index: 5;
		opacity: 0.6;
		transition: color 0.15s, opacity 0.15s, transform 0.15s !important;
	}

	.lut-card-remove-btn:hover {
		color: var(--color-accent, #00aaff) !important;
		opacity: 1 !important;
		transform: scale(1.1);
	}

	/* Add Card Modal Window Overlay */
	.lut-modal-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(10, 10, 14, 0.75);
		backdrop-filter: blur(8px);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		animation: lutModalFadeIn 0.2s ease-out;
		padding: 16px;
		box-sizing: border-box;
	}

	@keyframes lutModalFadeIn {
		from { opacity: 0; transform: scale(0.97); }
		to { opacity: 1; transform: scale(1); }
	}

	.lut-modal-content {
		background: rgba(22, 22, 28, 0.95);
		border: 1px solid rgba(74, 74, 90, 0.6);
		border-radius: 12px;
		box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
		width: 480px;
		max-width: 92%;
		height: 70% !important;
		max-height: 70% !important;
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 16px 20px;
		box-sizing: border-box;
		backdrop-filter: blur(16px);
		user-select: none;
	}

	.lut-modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1px solid rgba(74, 74, 90, 0.4);
		padding-bottom: 10px;
		flex-shrink: 0;
	}

	.lut-modal-title {
		font-family: var(--font-family, sans-serif);
		font-size: 14px;
		font-weight: 700;
		color: var(--text-primary, #ffffff);
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.lut-modal-close-btn {
		background: transparent;
		border: none;
		color: var(--text-secondary, #9a9aab);
		font-size: 16px;
		cursor: pointer;
		padding: 4px;
		border-radius: 4px;
		transition: color 0.15s, background 0.15s;
	}

	.lut-modal-close-btn:hover {
		color: #ffffff;
	}

	.lut-modal-filter-box {
		display: flex;
		align-items: center;
		gap: 8px;
		background: rgba(30, 30, 38, 0.9);
		border: 1px solid rgba(74, 74, 90, 0.5);
		border-radius: 8px;
		padding: 7px 12px;
		transition: border-color 0.15s, box-shadow 0.15s;
		flex-shrink: 0;
	}

	.lut-modal-filter-box:focus-within {
		border-color: #00aaff;
		box-shadow: 0 0 6px rgba(0, 170, 255, 0.25);
	}

	.lut-modal-filter-icon {
		color: var(--text-secondary, #9a9aab);
		font-size: 13px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.lut-modal-filter-input {
		background: transparent !important;
		border: none !important;
		outline: none !important;
		color: var(--text-primary, #ffffff) !important;
		font-family: var(--font-family, sans-serif) !important;
		font-size: 12px !important;
		width: 100% !important;
		padding: 0 !important;
		margin: 0 !important;
	}

	.lut-modal-filter-input::placeholder {
		color: var(--text-secondary, #6c6c7d) !important;
	}

	.lut-modal-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: 10px;
		overflow-y: auto;
		padding-right: 4px;
		flex: 1 !important;
		min-height: 0 !important;
		align-content: start;
		scrollbar-width: thin;
		scrollbar-color: var(--profiler-border, rgba(74, 74, 90, 0.6)) transparent;
	}

	.lut-modal-grid::-webkit-scrollbar {
		width: 4px;
		height: 4px;
	}

	.lut-modal-grid::-webkit-scrollbar-track {
		background: rgba(0, 0, 0, 0.2);
		border-radius: 2px;
	}

	.lut-modal-grid::-webkit-scrollbar-thumb {
		background: var(--profiler-border, rgba(74, 74, 90, 0.6));
		border-radius: 2px;
	}

	.lut-modal-grid::-webkit-scrollbar-thumb:hover {
		background: var(--color-accent, #00aaff);
	}

	.lut-modal-empty-msg {
		text-align: center;
		font-family: var(--font-family, sans-serif);
		font-size: 12px;
		color: var(--text-secondary, #9a9aab);
		padding: 24px 12px;
		grid-column: 1 / -1;
	}

	.lut-modal-option {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		gap: 8px;
		background: rgba(30, 30, 38, 0.85);
		border: 1px solid transparent;
		border-radius: 10px;
		padding: 14px 8px;
		cursor: pointer;
		box-sizing: border-box;
		transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
	}

	.lut-modal-option:hover,
	.lut-modal-option.is-focused {
		border-color: var(--color-accent, #00aaff);
		box-shadow: 0 0 10px rgba(0, 170, 255, 0.2);
	}

	.lut-modal-option-icon {
		width: 28px;
		height: 28px;
		background: transparent !important;
		color: #d0d0dc;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: color 0.15s;
	}

	.lut-modal-option:hover .lut-modal-option-icon,
	.lut-modal-option.is-focused .lut-modal-option-icon {
		color: var(--color-accent, #00aaff);
	}

	.lut-modal-option-title {
		font-family: var(--font-family, sans-serif);
		font-size: 11px;
		font-weight: 600;
		color: var(--text-primary, #e0e0e0);
		text-align: center;
		line-height: 1.3;
		word-break: break-word;
	}

}
`;

		document.head.appendChild( style );

	}

}
