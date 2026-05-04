/**
 * pict-section-inlinedocumentation — in-app documentation viewer.
 *
 * Per the bookshop example: register the section as a PROVIDER (it
 * exports the provider as default), seed AppData.InlineDocumentation.Topics,
 * then call provider.initializeDocumentation({...}, callback) once.
 */
const libPictView = require('pict-view');
const libInlineDoc = require('pict-section-inlinedocumentation');

const PROVIDER_ID = 'Pict-InlineDocumentation';
const WRAPPER_VIEW_ID = 'Playground-InlineDocWrapper';
const TARGET_ID = 'Playground-InlineDocWrapper-Destination';
const INLINEDOC_TARGET_ID = 'Playground-InlineDoc-Container';

const SAMPLE_TOPICS =
{
	'PG-WELCOME': {
		Code: 'PG-WELCOME', Title: 'Playground Welcome',
		Path: 'pg-welcome.md',
		Content: '# Playground Welcome\n\nThis is **inline documentation** for the playground itself.\n\n## What is this?\n\npict-section-inlinedocumentation provides in-app docs that travel with the application — markdown content keyed by short codes, with optional editing and search.'
	}
};

class PictViewPlaygroundInlineDocWrapper extends libPictView
{
	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		this.pict.CSSMap.injectCSS();
		let tmpProvider = this.pict.providers[PROVIDER_ID];
		if (!tmpProvider) return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);

		let tmpDest = document.getElementById(INLINEDOC_TARGET_ID);
		try
		{
			let tmpInit = function () {
				if (typeof tmpProvider.navigateToTopic === 'function')
				{
					try { tmpProvider.navigateToTopic('PG-WELCOME'); }
					catch (pNavErr) { /* */ }
				}
				if (tmpDest && (!tmpDest.innerHTML || tmpDest.innerHTML.trim() === ''))
				{
					// Fallback: render the topic body directly so we always
					// see SOMETHING in the destination.
					let tmpTopic = SAMPLE_TOPICS['PG-WELCOME'];
					tmpDest.innerHTML = '<div style="padding: 12px;"><h3 style="margin-top:0;">' + tmpTopic.Title + '</h3><pre style="white-space:pre-wrap; font-family:inherit;">' + tmpTopic.Content + '</pre></div>';
				}
			};

			if (typeof tmpProvider.initializeDocumentation === 'function' && !tmpProvider._initialized)
			{
				tmpProvider._initialized = true;
				tmpProvider.initializeDocumentation({ DocsBaseURL: '' }, tmpInit);
			}
			else
			{
				tmpInit();
			}
		}
		catch (pErr)
		{
			if (tmpDest) tmpDest.innerHTML = '<p style="color:var(--theme-color-status-warning);">Inner render failed: ' + pErr.message + '</p>';
		}
		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}
}

module.exports = {
	id: 'inlinedocumentation', name: 'Inline Documentation', group: 'Document', module: 'pict-section-inlinedocumentation',
	ViewIdentifier: WRAPPER_VIEW_ID,
	ViewClass: PictViewPlaygroundInlineDocWrapper,
	DestinationId: TARGET_ID,
	ViewConfiguration:
	{
		ViewIdentifier: WRAPPER_VIEW_ID,
		DefaultRenderable: 'Playground-InlineDocWrapper-Content',
		DefaultDestinationAddress: '#' + TARGET_ID,
		AutoRender: false,
		Templates:
		[
			{
				Hash: 'Playground-InlineDocWrapper-Content',
				Template: /*html*/`
<h2 class="pg-section-title">pict-section-inlinedocumentation</h2>
<p class="pg-section-blurb">In-app documentation viewer. Topics are pre-seeded into AppData.InlineDocumentation.Topics.</p>
<div class="gallery-card">
	<div id="${INLINEDOC_TARGET_ID}" style="min-height: 280px;"></div>
</div>`
			}
		],
		Renderables:
		[
			{
				RenderableHash: 'Playground-InlineDocWrapper-Content',
				TemplateHash: 'Playground-InlineDocWrapper-Content',
				DestinationAddress: '#' + TARGET_ID,
				RenderMethod: 'replace'
			}
		]
	},
	setup: function (pPict)
	{
		try { pPict.addProvider(PROVIDER_ID, libInlineDoc.default_configuration, libInlineDoc); }
		catch (pErr) { /* */ }
		if (!pPict.AppData.InlineDocumentation) pPict.AppData.InlineDocumentation = {};
		pPict.AppData.InlineDocumentation.Topics = SAMPLE_TOPICS;
	}
};
