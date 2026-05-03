/**
 * pict-section-filebrowser — sidebar file/folder navigator.
 */
const libPictSectionFileBrowser = require('pict-section-filebrowser');

const VIEW_ID = 'Playground-FileBrowser';
const TARGET_ID = 'Pict-FileBrowser-Container';

let _mounted = false;

module.exports =
{
	id: 'filebrowser',
	name: 'File Browser',
	group: 'Navigation',
	status: 'live',
	module: 'pict-section-filebrowser',

	register: function () {},

	render: function (pContainer, pPict)
	{
		pContainer.innerHTML =
			'<h2 class="pg-section-title">pict-section-filebrowser</h2>' +
			'<p class="pg-section-blurb">Sidebar file/folder navigator. Mounted with no backing service — shows empty state.</p>' +
			'<div class="gallery-card">' +
			'  <div id="' + TARGET_ID + '" style="min-height: 320px;"></div>' +
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
					libPictSectionFileBrowser);
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
