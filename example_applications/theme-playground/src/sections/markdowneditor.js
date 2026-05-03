/**
 * pict-section-markdowneditor — segmented markdown editor with live preview.
 *
 * Uses --pict-mde-* CSS variables internally.  Aliases bridge them to the
 * playground's tokens.
 */
const libPictSectionMarkdownEditor = require('pict-section-markdowneditor');

const VIEW_ID = 'Playground-MarkdownEditor';
const TARGET_ID = 'Playground-MarkdownEditor-Container';

let _mounted = false;

module.exports =
{
	id: 'markdowneditor',
	name: 'Markdown Editor',
	group: 'Editor',
	status: 'live',
	module: 'pict-section-markdowneditor',

	register: function () {},

	render: function (pContainer, pPict)
	{
		pContainer.innerHTML =
			'<h2 class="pg-section-title">pict-section-markdowneditor</h2>' +
			'<p class="pg-section-blurb">Segmented markdown editor with live preview. Uses <code>--pict-mde-*</code> internally — aliased to playground tokens.</p>' +
			'<div class="gallery-card">' +
			'  <div id="' + TARGET_ID + '" style="min-height: 360px;"></div>' +
			'</div>';

		if (!pPict.AppData.Playground) pPict.AppData.Playground = {};
		pPict.AppData.Playground.MarkdownDocument =
		{
			Segments:
			[
				{ Content: '# Markdown Editor\n\nEdit me. Switch tabs to **preview**.' },
				{ Content: 'A second segment. Each one has its own editor + preview tab.' }
			]
		};

		if (!_mounted)
		{
			pPict.addView(VIEW_ID,
				{
					ViewIdentifier: VIEW_ID,
					DefaultDestinationAddress: '#' + TARGET_ID,
					TargetElementAddress: '#' + TARGET_ID,
					AutoRender: false,
					DocumentAddress: 'AppData.Playground.MarkdownDocument'
				},
				libPictSectionMarkdownEditor);
			_mounted = true;
		}

		let tmpView = pPict.views[VIEW_ID];
		if (tmpView)
		{
			tmpView.initialRenderComplete = false;
			tmpView.render();
		}
	}
};
