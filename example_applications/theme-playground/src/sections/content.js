/**
 * pict-section-content — markdown rendering with KaTeX + Mermaid.
 *
 * Per pict-section-content's basic_content example:
 *   - register PictContentProvider as 'Content-Provider'
 *   - call provider.parseMarkdown(md) to get HTML
 *   - call view.displayContent(html) to paint into the destination
 */
const libPictView = require('pict-view');
const libPictSectionContent = require('pict-section-content');

const SECTION_VIEW_ID = 'Playground-Content';
const PROVIDER_ID = 'Content-Provider';
const WRAPPER_VIEW_ID = 'Playground-ContentWrapper';
const TARGET_ID = 'Playground-ContentWrapper-Destination';
const CONTENT_TARGET_ID = 'Playground-Content-Container';

const SAMPLE_MARKDOWN =
	'# Welcome to pict-section-content\n\n' +
	'This is **markdown** rendered live by `pict-section-content`. It uses\n' +
	'`--docuserve-*` CSS variables internally; the playground bridges them via Aliases.\n\n' +
	'## Code blocks\n\n' +
	'```javascript\nfunction greet(name) {\n    return `Hello, ${name}!`;\n}\n```\n\n' +
	'## Lists\n\n' +
	'- Tokens flow through aliases\n' +
	'- Code blocks pick up theme colors\n' +
	'- Switch theme above to see the cascade\n\n' +
	'## Inline math\n\n' +
	'The quadratic formula is $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$.\n\n' +
	'## Display math\n\n' +
	'$$\ne^{i\\pi} + 1 = 0\n$$\n\n' +
	'## A table\n\n' +
	'| Feature | Status |\n| --- | --- |\n| Markdown | yes |\n| KaTeX | yes |\n| Mermaid | yes |\n\n' +
	'> Block quotes work too.\n';

class PictViewPlaygroundContentWrapper extends libPictView
{
	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		this.pict.CSSMap.injectCSS();
		let tmpView = this.pict.views[SECTION_VIEW_ID];
		let tmpProvider = this.pict.providers[PROVIDER_ID];
		if (tmpView && tmpProvider)
		{
			try
			{
				tmpView.render();
				let tmpHTML = tmpProvider.parseMarkdown(SAMPLE_MARKDOWN);
				tmpView.displayContent(tmpHTML);
			}
			catch (pErr)
			{
				let tmpDest = document.getElementById(CONTENT_TARGET_ID);
				if (tmpDest) tmpDest.innerHTML = '<p style="color:var(--theme-color-status-warning);">Inner render failed: ' + pErr.message + '</p>';
			}
		}
		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}
}

module.exports = {
	id: 'content', name: 'Content / Markdown', group: 'Document', module: 'pict-section-content',
	ViewIdentifier: WRAPPER_VIEW_ID,
	ViewClass: PictViewPlaygroundContentWrapper,
	DestinationId: TARGET_ID,
	ViewConfiguration:
	{
		ViewIdentifier: WRAPPER_VIEW_ID,
		DefaultRenderable: 'Playground-ContentWrapper-Content',
		DefaultDestinationAddress: '#' + TARGET_ID,
		AutoRender: false,
		Templates:
		[
			{
				Hash: 'Playground-ContentWrapper-Content',
				Template: /*html*/`
<h2 class="pg-section-title">pict-section-content</h2>
<p class="pg-section-blurb">Markdown rendering with KaTeX + Mermaid. Uses <code>--docuserve-*</code> CSS variables internally; aliased to playground tokens.</p>
<div class="gallery-card">
	<div id="${CONTENT_TARGET_ID}" style="min-height: 280px;"></div>
</div>`
			}
		],
		Renderables:
		[
			{
				RenderableHash: 'Playground-ContentWrapper-Content',
				TemplateHash: 'Playground-ContentWrapper-Content',
				DestinationAddress: '#' + TARGET_ID,
				RenderMethod: 'replace'
			}
		]
	},
	setup: function (pPict)
	{
		try
		{
			pPict.addProvider(PROVIDER_ID,
				libPictSectionContent.PictContentProvider.default_configuration,
				libPictSectionContent.PictContentProvider);
		}
		catch (pErr) { /* */ }
		try
		{
			pPict.addView(SECTION_VIEW_ID,
				Object.assign({}, libPictSectionContent.default_configuration,
				{
					ViewIdentifier: SECTION_VIEW_ID,
					DefaultDestinationAddress: '#' + CONTENT_TARGET_ID,
					AutoRender: false
				}),
				libPictSectionContent);
		}
		catch (pErr) { /* */ }
	}
};
