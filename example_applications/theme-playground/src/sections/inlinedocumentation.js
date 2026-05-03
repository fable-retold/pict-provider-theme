/**
 * pict-section-inlinedocumentation — embeds in-app documentation rendering.
 */
const libPictSectionInlineDoc = require('pict-section-inlinedocumentation');

const VIEW_ID = 'Playground-InlineDoc';
const TARGET_ID = 'Playground-InlineDoc-Container';

let _mounted = false;

module.exports =
{
	id: 'inlinedocumentation',
	name: 'Inline Documentation',
	group: 'Document',
	status: 'live',
	module: 'pict-section-inlinedocumentation',

	register: function () {},

	render: function (pContainer, pPict)
	{
		pContainer.innerHTML =
			'<h2 class="pg-section-title">pict-section-inlinedocumentation</h2>' +
			'<p class="pg-section-blurb">In-app documentation viewer. Inherits styles from pict-section-content.</p>' +
			'<div class="gallery-card">' +
			'  <div id="' + TARGET_ID + '" style="min-height: 280px;"></div>' +
			'</div>';

		if (!_mounted)
		{
			try
			{
				pPict.addView(VIEW_ID,
					{
						ViewIdentifier: VIEW_ID,
						DefaultDestinationAddress: '#' + TARGET_ID,
						AutoRender: false
					},
					libPictSectionInlineDoc);
				_mounted = true;
			}
			catch (pErr)
			{
				document.getElementById(TARGET_ID).innerHTML =
					'<p style="color: var(--theme-color-status-warning);">Mount failed: ' + pErr.message + '</p>';
				return;
			}
		}

		let tmpView = pPict.views[VIEW_ID];
		if (tmpView)
		{
			tmpView.initialRenderComplete = false;
			try { tmpView.render(); }
			catch (pErr)
			{
				document.getElementById(TARGET_ID).innerHTML =
					'<p style="color: var(--theme-color-status-warning);">Render failed: ' + pErr.message + '</p>';
			}
		}
	}
};
