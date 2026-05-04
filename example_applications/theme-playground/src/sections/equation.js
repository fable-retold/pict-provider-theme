/**
 * pict-section-equation — equation expression display via the
 * tokenized editor (which uses pict-section-code internally for syntax
 * highlighting; CodeJar is loaded via <script> in index.html).
 */
const libPictView = require('pict-view');
const libPictSectionEquation = require('pict-section-equation');

const SECTION_VIEW_ID = 'Playground-Equation';
const WRAPPER_VIEW_ID = 'Playground-EquationWrapper';
const TARGET_ID = 'Playground-EquationWrapper-Destination';
const EQUATION_TARGET_ID = 'Playground-Equation-Container';

class PictViewPlaygroundEquationWrapper extends libPictView
{
	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		this.pict.CSSMap.injectCSS();
		let tmpInner = this.pict.views[SECTION_VIEW_ID];
		if (tmpInner)
		{
			tmpInner.initialRenderComplete = false;
			try
			{
				tmpInner.render();
				if (typeof tmpInner.setExpression === 'function')
				{
					tmpInner.setExpression('Hypotenuse = sqrt(A ^ 2 + B ^ 2)');
				}
			}
			catch (pErr)
			{
				let tmpDest = document.getElementById(EQUATION_TARGET_ID);
				if (tmpDest) tmpDest.innerHTML = '<p style="color:var(--theme-color-status-warning);">Inner render failed: ' + pErr.message + '</p>';
			}
		}
		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}
}

module.exports = {
	id: 'equation', name: 'Equation', group: 'Visualization', module: 'pict-section-equation',
	ViewIdentifier: WRAPPER_VIEW_ID,
	ViewClass: PictViewPlaygroundEquationWrapper,
	DestinationId: TARGET_ID,
	ViewConfiguration:
	{
		ViewIdentifier: WRAPPER_VIEW_ID,
		DefaultRenderable: 'Playground-EquationWrapper-Content',
		DefaultDestinationAddress: '#' + TARGET_ID,
		AutoRender: false,
		Templates:
		[
			{
				Hash: 'Playground-EquationWrapper-Content',
				Template: /*html*/`
<h2 class="pg-section-title">pict-section-equation</h2>
<p class="pg-section-blurb">Tokenized equation editor (uses pict-section-code internally for syntax highlighting).</p>
<div class="gallery-card">
	<div id="${EQUATION_TARGET_ID}" style="min-height: 240px;"></div>
</div>`
			}
		],
		Renderables:
		[
			{
				RenderableHash: 'Playground-EquationWrapper-Content',
				TemplateHash: 'Playground-EquationWrapper-Content',
				DestinationAddress: '#' + TARGET_ID,
				RenderMethod: 'replace'
			}
		]
	},
	setup: function (pPict)
	{
		try
		{
			pPict.addView(SECTION_VIEW_ID,
				Object.assign({},
					libPictSectionEquation.PictViewExpressionTokenizedEditor.default_configuration,
					{
						ViewIdentifier: SECTION_VIEW_ID,
						DefaultDestinationAddress: '#' + EQUATION_TARGET_ID
					}),
				libPictSectionEquation.PictViewExpressionTokenizedEditor);
		}
		catch (pErr) { /* */ }
	}
};
