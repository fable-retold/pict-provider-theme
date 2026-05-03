/**
 * pict-section-flow — live demo with an interesting twist:
 *
 * pict-section-flow has a multi-axis theme system that's NOT just CSS:
 *   - CSSVariables (--pf-*)        affect SVG fills/strokes/panel chrome
 *   - AdditionalCSS                per-theme freeform CSS (fonts, conditional bracket colors, etc.)
 *   - NodeBodyMode                 'rect' | 'bracket'   (structural)
 *   - BracketConfig                serif length, title separator
 *   - ConnectionConfig             stroke width, dash array, arrowhead style
 *   - NoiseConfig                  hand-drawn wobble (sketch / whiteboard)
 *   - ShapeOverrides               raw SVG attributes on shape primitives
 *                                  (e.g. arrowhead Fill — NOT CSS-addressable)
 *
 * Two strategies for theming flow:
 *
 *   (a) Pure aliases at :root.  Won't work — flow declares its --pf-*
 *       defaults inside `.pict-flow-container { ... }`, which is more
 *       specific than :root and overrides them.
 *
 *   (b) Register a custom flow theme whose CSSVariables map every --pf-*
 *       to `var(--theme-*)` references.  Flow injects those at the
 *       `.pict-flow-container` scope where they win, and the var()
 *       indirection means our :root tokens still drive the actual colors.
 *
 * We use (b).  As a bonus, ShapeOverrides + NoiseConfig + NodeBodyMode
 * can be tweaked per playground theme too.
 */
const libPictSectionFlow = require('pict-section-flow');

const VIEW_ID = 'Playground-FlowDiagram';
const APPDATA_PATH = 'AppData.Playground.SampleFlow';

// Map every --pf-* variable to var(--theme-*) so flow's CSS provider
// emits them at .pict-flow-container scope, beating its own defaults.
const _BridgeCSSVariables =
{
	'--pf-text-primary':                'var(--theme-color-text-primary)',
	'--pf-text-heading':                'var(--theme-color-text-primary)',
	'--pf-text-secondary':              'var(--theme-color-text-secondary)',
	'--pf-text-tertiary':               'var(--theme-color-text-muted)',
	'--pf-text-placeholder':            'var(--theme-color-text-muted)',

	'--pf-node-body-fill':              'var(--theme-color-background-panel)',
	'--pf-node-body-stroke':            'var(--theme-color-border-default)',
	'--pf-node-body-stroke-width':      '1.5',
	'--pf-node-body-radius':            '6px',
	'--pf-node-shadow':                 'none',
	'--pf-node-shadow-hover':           'none',
	'--pf-node-shadow-selected':        'none',
	'--pf-node-shadow-dragging':        'none',
	'--pf-node-title-fill':             'var(--theme-color-text-on-brand)',
	'--pf-node-title-size':             '12px',
	'--pf-node-title-weight':           '600',
	'--pf-node-title-bar-color':        'var(--theme-color-brand-primary)',
	'--pf-node-type-label-fill':        'var(--theme-color-text-muted)',
	'--pf-node-selected-stroke':        'var(--theme-color-brand-accent)',

	'--pf-port-input-fill':             'var(--theme-color-brand-primary)',
	'--pf-port-output-fill':            'var(--theme-color-status-success)',
	'--pf-port-stroke':                 'var(--theme-color-background-panel)',

	'--pf-connection-stroke':           'var(--theme-color-text-muted)',
	'--pf-connection-selected-stroke':  'var(--theme-color-brand-accent)',

	'--pf-canvas-bg':                   'var(--theme-color-background-secondary)',
	'--pf-grid-stroke':                 'var(--theme-color-border-light)',

	'--pf-panel-bg':                    'var(--theme-color-background-panel)',
	'--pf-panel-border':                'var(--theme-color-border-default)',
	'--pf-panel-radius':                '6px',
	'--pf-panel-shadow':                'none',
	'--pf-panel-titlebar-bg':           'var(--theme-color-background-secondary)',
	'--pf-panel-titlebar-border':       'var(--theme-color-border-default)',
	'--pf-panel-title-color':           'var(--theme-color-text-primary)'
};

function buildPlaygroundFlowTheme(pNoiseEnabled)
{
	return {
		Key: 'playground-flow',
		Label: 'Playground (theme-driven)',
		CSSVariables: _BridgeCSSVariables,
		AdditionalCSS: '',
		NodeBodyMode: pNoiseEnabled ? 'bracket' : 'rect',
		BracketConfig: pNoiseEnabled ? { SerifLength: 18, TitleSeparator: true } : null,
		ConnectionConfig: { StrokeDashArray: null, StrokeWidth: 1.5, ArrowheadStyle: 'triangle' },
		NoiseConfig: pNoiseEnabled
			? { Enabled: true, DefaultLevel: 0.4, MaxJitterPx: 4, AffectsNodes: true, AffectsConnections: true }
			: { Enabled: false, DefaultLevel: 0, MaxJitterPx: 0, AffectsNodes: false, AffectsConnections: false },
		ShapeOverrides: {}
	};
}

const SAMPLE_FLOW =
{
	Nodes:
	[
		{
			Hash: 'n-start', Type: 'default', X: 40, Y: 40, Width: 140, Height: 70, Title: 'Start',
			Ports: [{ Hash: 'p-start-out', Direction: 'output', Side: 'right', Label: 'Out' }], Data: {}
		},
		{
			Hash: 'n-action', Type: 'default', X: 240, Y: 40, Width: 160, Height: 80, Title: 'Process',
			Ports:
			[
				{ Hash: 'p-action-in', Direction: 'input',  Side: 'left',  Label: 'In' },
				{ Hash: 'p-action-out', Direction: 'output', Side: 'right', Label: 'Out' }
			], Data: {}
		},
		{
			Hash: 'n-decision', Type: 'default', X: 460, Y: 40, Width: 160, Height: 80, Title: 'Decide',
			Ports:
			[
				{ Hash: 'p-decision-in', Direction: 'input',  Side: 'left',  Label: 'In' },
				{ Hash: 'p-decision-yes', Direction: 'output', Side: 'right', Label: 'Yes' },
				{ Hash: 'p-decision-no',  Direction: 'output', Side: 'bottom', Label: 'No' }
			], Data: {}
		},
		{
			Hash: 'n-end', Type: 'default', X: 680, Y: 40, Width: 140, Height: 70, Title: 'End',
			Ports: [{ Hash: 'p-end-in', Direction: 'input', Side: 'left', Label: 'In' }], Data: {}
		},
		{
			Hash: 'n-retry', Type: 'default', X: 460, Y: 200, Width: 160, Height: 70, Title: 'Retry',
			Ports:
			[
				{ Hash: 'p-retry-in',  Direction: 'input',  Side: 'top',   Label: 'In'  },
				{ Hash: 'p-retry-out', Direction: 'output', Side: 'left',  Label: 'Out' }
			], Data: {}
		}
	],
	Connections:
	[
		{ Hash: 'c1', SourceNodeHash: 'n-start',    SourcePortHash: 'p-start-out',    TargetNodeHash: 'n-action',   TargetPortHash: 'p-action-in' },
		{ Hash: 'c2', SourceNodeHash: 'n-action',   SourcePortHash: 'p-action-out',   TargetNodeHash: 'n-decision', TargetPortHash: 'p-decision-in' },
		{ Hash: 'c3', SourceNodeHash: 'n-decision', SourcePortHash: 'p-decision-yes', TargetNodeHash: 'n-end',      TargetPortHash: 'p-end-in' },
		{ Hash: 'c4', SourceNodeHash: 'n-decision', SourcePortHash: 'p-decision-no',  TargetNodeHash: 'n-retry',    TargetPortHash: 'p-retry-in' },
		{ Hash: 'c5', SourceNodeHash: 'n-retry',    SourcePortHash: 'p-retry-out',    TargetNodeHash: 'n-action',   TargetPortHash: 'p-action-in' }
	]
};

let _flowView = null;
let _noiseEnabled = false;

module.exports =
{
	id: 'flow',
	name: 'Flow Diagram',
	group: 'Visualization',
	status: 'live',
	module: 'pict-section-flow',

	register: function (pPict)
	{
		// FlowView is constructed lazily in render() because pict-section-flow
		// expects its DOM container to exist at addView time.
		// Stage sample data here so it's available regardless of mount order.
		if (!pPict.AppData.Playground) pPict.AppData.Playground = {};
		pPict.AppData.Playground.SampleFlow = JSON.parse(JSON.stringify(SAMPLE_FLOW));
	},

	render: function (pContainer, pPict)
	{
		pContainer.innerHTML =
			'<h2 class="pg-section-title">pict-section-flow</h2>' +
			'<p class="pg-section-blurb">' +
			'  Real <code>pict-section-flow</code> embedded in this app. Flow has a' +
			'  multi-axis theme system (CSS vars + AdditionalCSS + structural' +
			'  settings + raw SVG ShapeOverrides). The playground bridges them by' +
			'  registering a custom flow theme whose CSSVariables map every' +
			'  <code>--pf-*</code> to <code>var(--theme-*)</code> — flow injects' +
			'  these at <code>.pict-flow-container</code> scope so they win over' +
			'  flow\'s built-in defaults.' +
			'</p>' +
			'<div class="gallery-card">' +
			'  <div class="gallery-row">' +
			'    <button id="demo-flow-noise-toggle" class="demo-btn">Toggle sketch wobble</button>' +
			'    <button id="demo-flow-builtin-sketch" class="demo-btn">Built-in: sketch</button>' +
			'    <button id="demo-flow-builtin-blueprint" class="demo-btn">Built-in: blueprint</button>' +
			'    <button id="demo-flow-restore" class="demo-btn is-primary">Restore playground theme</button>' +
			'  </div>' +
			'  <div id="Playground-Flow-Container" style="height: 360px; border: 1px solid var(--theme-color-border-default); border-radius: var(--theme-radius-md); margin-top: var(--theme-spacing-md); overflow: hidden;"></div>' +
			'</div>';

		mountFlow(pPict);
		wireDemoButtons(pPict);
	}
};

function mountFlow(pPict)
{
	if (!_flowView)
	{
		_flowView = pPict.addView(VIEW_ID,
			{
				ViewIdentifier: VIEW_ID,
				DefaultRenderable: 'Flow-Container',
				DefaultDestinationAddress: '#Playground-Flow-Container',
				AutoRender: false,
				FlowDataAddress: APPDATA_PATH,
				EnableToolbar: false,
				EnablePanning: true,
				EnableZooming: true,
				EnableNodeDragging: true,
				EnableConnectionCreation: false,
				MinZoom: 0.25,
				MaxZoom: 3.0,
				DefaultNodeType: 'default',
				DefaultNodeWidth: 160,
				DefaultNodeHeight: 70,
				Renderables:
				[
					{
						RenderableHash: 'Flow-Container',
						TemplateHash: 'Flow-Container-Template',
						DestinationAddress: '#Playground-Flow-Container',
						RenderMethod: 'replace'
					}
				]
			},
			libPictSectionFlow);
	}

	_flowView.initialRenderComplete = false;
	_flowView.render();

	// _ThemeProvider is constructed during render() (onBeforeInitialize).
	// Register our bridge theme + apply, AFTER render so it exists.
	if (_flowView._ThemeProvider)
	{
		_flowView._ThemeProvider.registerTheme('playground-flow', buildPlaygroundFlowTheme(_noiseEnabled));
		_flowView.setTheme('playground-flow');
	}
}

function wireDemoButtons(pPict)
{
	let tmpToggle = document.getElementById('demo-flow-noise-toggle');
	if (tmpToggle) tmpToggle.addEventListener('click', () =>
	{
		_noiseEnabled = !_noiseEnabled;
		if (_flowView && _flowView._ThemeProvider)
		{
			_flowView._ThemeProvider.registerTheme('playground-flow', buildPlaygroundFlowTheme(_noiseEnabled));
			_flowView.setTheme('playground-flow');
			if (typeof _flowView.setNoiseLevel === 'function')
			{
				_flowView.setNoiseLevel(_noiseEnabled ? 0.4 : 0);
			}
		}
	});

	let tmpSketch = document.getElementById('demo-flow-builtin-sketch');
	if (tmpSketch) tmpSketch.addEventListener('click', () =>
	{
		if (_flowView) _flowView.setTheme('sketch');
	});

	let tmpBlue = document.getElementById('demo-flow-builtin-blueprint');
	if (tmpBlue) tmpBlue.addEventListener('click', () =>
	{
		if (_flowView) _flowView.setTheme('blueprint');
	});

	let tmpRestore = document.getElementById('demo-flow-restore');
	if (tmpRestore) tmpRestore.addEventListener('click', () =>
	{
		if (_flowView) _flowView.setTheme('playground-flow');
	});
}
