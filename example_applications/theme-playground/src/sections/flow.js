/**
 * pict-section-flow — bridges via a custom 'playground-flow' theme that
 * maps every --pf-* CSS var to var(--theme-*).
 */
const libPictView = require('pict-view');
const libPictSectionFlow = require('pict-section-flow');

const SECTION_VIEW_ID = 'Playground-FlowDiagram';
const WRAPPER_VIEW_ID = 'Playground-FlowWrapper';
const TARGET_ID = 'Playground-FlowWrapper-Destination';
const FLOW_TARGET_ID = 'Playground-Flow-Container';
const APPDATA_PATH = 'AppData.Playground.SampleFlow';

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

const SAMPLE_FLOW =
{
	Nodes:
	[
		{ Hash: 'n-start',    Type: 'default', X:  40, Y:  40, Width: 140, Height: 70, Title: 'Start',
			Ports: [{ Hash: 'p-start-out',     Direction: 'output', Side: 'right',  Label: 'Out' }], Data: {} },
		{ Hash: 'n-action',   Type: 'default', X: 240, Y:  40, Width: 160, Height: 80, Title: 'Process',
			Ports: [
				{ Hash: 'p-action-in',         Direction: 'input',  Side: 'left',  Label: 'In' },
				{ Hash: 'p-action-out',        Direction: 'output', Side: 'right', Label: 'Out' } ], Data: {} },
		{ Hash: 'n-decision', Type: 'default', X: 460, Y:  40, Width: 160, Height: 80, Title: 'Decide',
			Ports: [
				{ Hash: 'p-decision-in',       Direction: 'input',  Side: 'left',   Label: 'In' },
				{ Hash: 'p-decision-yes',      Direction: 'output', Side: 'right',  Label: 'Yes' },
				{ Hash: 'p-decision-no',       Direction: 'output', Side: 'bottom', Label: 'No' } ], Data: {} },
		{ Hash: 'n-end',      Type: 'default', X: 680, Y:  40, Width: 140, Height: 70, Title: 'End',
			Ports: [{ Hash: 'p-end-in',        Direction: 'input',  Side: 'left',  Label: 'In' }], Data: {} },
		{ Hash: 'n-retry',    Type: 'default', X: 460, Y: 200, Width: 160, Height: 70, Title: 'Retry',
			Ports: [
				{ Hash: 'p-retry-in',          Direction: 'input',  Side: 'top',   Label: 'In'  },
				{ Hash: 'p-retry-out',         Direction: 'output', Side: 'left',  Label: 'Out' } ], Data: {} }
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

class PictViewPlaygroundFlowWrapper extends libPictView
{
	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		this.pict.CSSMap.injectCSS();
		let tmpInner = this.pict.views[SECTION_VIEW_ID];
		if (tmpInner)
		{
			tmpInner.initialRenderComplete = false;
			try { tmpInner.render(); }
			catch (pErr)
			{
				let tmpDest = document.getElementById(FLOW_TARGET_ID);
				if (tmpDest) tmpDest.innerHTML = '<p style="color:var(--theme-color-status-warning);">Inner render failed: ' + pErr.message + '</p>';
			}

			// Register + apply the bridge theme AFTER first render so the
			// _ThemeProvider exists.
			if (tmpInner._ThemeProvider)
			{
				tmpInner._ThemeProvider.registerTheme('playground-flow',
				{
					Key: 'playground-flow', Label: 'Playground (theme-driven)',
					CSSVariables: _BridgeCSSVariables, AdditionalCSS: '',
					NodeBodyMode: 'rect', BracketConfig: null,
					ConnectionConfig: { StrokeDashArray: null, StrokeWidth: 1.5, ArrowheadStyle: 'triangle' },
					NoiseConfig: { Enabled: false, DefaultLevel: 0, MaxJitterPx: 0, AffectsNodes: false, AffectsConnections: false },
					ShapeOverrides: {}
				});
				tmpInner.setTheme('playground-flow');
			}
		}
		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}
}

module.exports = {
	id: 'flow', name: 'Flow Diagram', group: 'Visualization', module: 'pict-section-flow',
	ViewIdentifier: WRAPPER_VIEW_ID,
	ViewClass: PictViewPlaygroundFlowWrapper,
	DestinationId: TARGET_ID,
	ViewConfiguration:
	{
		ViewIdentifier: WRAPPER_VIEW_ID,
		DefaultRenderable: 'Playground-FlowWrapper-Content',
		DefaultDestinationAddress: '#' + TARGET_ID,
		AutoRender: false,
		Templates:
		[
			{
				Hash: 'Playground-FlowWrapper-Content',
				Template: /*html*/`
<h2 class="pg-section-title">pict-section-flow</h2>
<p class="pg-section-blurb">Real <code>pict-section-flow</code> embedded in this app. Bridges via a custom flow theme whose CSSVariables map every <code>--pf-*</code> to <code>var(--theme-*)</code>.</p>
<div class="gallery-card">
	<div id="${FLOW_TARGET_ID}" style="height: 360px; border: 1px solid var(--theme-color-border-default); border-radius: var(--theme-radius-md); overflow: hidden;"></div>
</div>`
			}
		],
		Renderables:
		[
			{
				RenderableHash: 'Playground-FlowWrapper-Content',
				TemplateHash: 'Playground-FlowWrapper-Content',
				DestinationAddress: '#' + TARGET_ID,
				RenderMethod: 'replace'
			}
		]
	},

	setup: function (pPict)
	{
		if (!pPict.AppData.Playground) pPict.AppData.Playground = {};
		pPict.AppData.Playground.SampleFlow = JSON.parse(JSON.stringify(SAMPLE_FLOW));

		try
		{
			pPict.addView(SECTION_VIEW_ID, {
				ViewIdentifier: SECTION_VIEW_ID,
				DefaultRenderable: 'Flow-Container',
				DefaultDestinationAddress: '#' + FLOW_TARGET_ID,
				AutoRender: false,
				FlowDataAddress: APPDATA_PATH,
				EnableToolbar: false,
				EnablePanning: true,
				EnableZooming: true,
				EnableNodeDragging: true,
				EnableConnectionCreation: false,
				MinZoom: 0.25, MaxZoom: 3.0,
				DefaultNodeType: 'default', DefaultNodeWidth: 160, DefaultNodeHeight: 70,
				Renderables:
				[
					{
						RenderableHash: 'Flow-Container',
						TemplateHash: 'Flow-Container-Template',
						DestinationAddress: '#' + FLOW_TARGET_ID,
						RenderMethod: 'replace'
					}
				]
			}, libPictSectionFlow);
		}
		catch (pErr) { /* */ }
	}
};
