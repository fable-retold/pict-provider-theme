/**
 * pict-section-content — markdown rendering with syntax-highlighted code blocks.
 *
 * Uses --docuserve-* CSS variables internally.  Aliases for those live in
 * both starter themes' Aliases blocks (added when this section was wired).
 */
const libPictSectionContent = require('pict-section-content');

const VIEW_ID = 'Playground-Content';
const TARGET_ID = 'Playground-Content-Container';

const SAMPLE_MARKDOWN =
	'# Welcome to pict-section-content\n' +
	'\n' +
	'This is **markdown** rendered live by `pict-section-content`. The renderer uses\n' +
	'`--docuserve-*` CSS variables internally; the playground bridges them to our\n' +
	'theme tokens via Aliases.\n' +
	'\n' +
	'## Code blocks\n' +
	'\n' +
	'```javascript\n' +
	'function greet(name) {\n' +
	'    return `Hello, ${name}!`;\n' +
	'}\n' +
	'```\n' +
	'\n' +
	'## Lists\n' +
	'\n' +
	'- Tokens flow through aliases\n' +
	'- Code blocks pick up theme colors\n' +
	'- Switch theme above to see the cascade\n' +
	'\n' +
	'> Block quotes work too.\n';

let _mounted = false;

module.exports =
{
	id: 'content',
	name: 'Content / Markdown',
	group: 'Document',
	status: 'live',
	module: 'pict-section-content',

	register: function () {},

	render: function (pContainer, pPict)
	{
		pContainer.innerHTML =
			'<h2 class="pg-section-title">pict-section-content</h2>' +
			'<p class="pg-section-blurb">Markdown rendering. Internally uses <code>--docuserve-*</code> CSS variables; the playground bridges them to our tokens via the starter themes\' Aliases.</p>' +
			'<div class="gallery-card">' +
			'  <div id="' + TARGET_ID + '" style="min-height: 280px;"></div>' +
			'</div>';

		if (!_mounted)
		{
			pPict.addView(VIEW_ID,
				{
					ViewIdentifier: VIEW_ID,
					DefaultDestinationAddress: '#' + TARGET_ID,
					AutoRender: false,
					ContentDataAddress: 'AppData.Playground.SampleMarkdown'
				},
				libPictSectionContent);
			_mounted = true;
		}

		if (!pPict.AppData.Playground) pPict.AppData.Playground = {};
		pPict.AppData.Playground.SampleMarkdown = SAMPLE_MARKDOWN;

		let tmpView = pPict.views[VIEW_ID];
		if (tmpView)
		{
			let tmpEl = document.getElementById(TARGET_ID);
			if (tmpEl && typeof tmpView.parseMarkdown === 'function')
			{
				try { tmpEl.innerHTML = tmpView.parseMarkdown(SAMPLE_MARKDOWN); }
				catch (pErr) { tmpEl.textContent = 'parseMarkdown error: ' + pErr.message; }
			}
			else
			{
				tmpView.initialRenderComplete = false;
				tmpView.render();
			}
		}
	}
};
