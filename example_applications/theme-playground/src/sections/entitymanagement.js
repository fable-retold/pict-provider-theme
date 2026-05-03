/**
 * pict-section-entitymanagement — high-level entity browser/editor.
 *
 * Builds on pict-section-recordset + pict-section-form.
 */
const libPictSectionEM = require('pict-section-entitymanagement');

const VIEW_ID = 'Playground-EntityManagement';
const TARGET_ID = 'Playground-EM-Container';

let _mounted = false;

module.exports =
{
	id: 'entitymanagement',
	name: 'Entity Management',
	group: 'Data',
	status: 'live',
	module: 'pict-section-entitymanagement',

	register: function () {},

	render: function (pContainer, pPict)
	{
		pContainer.innerHTML =
			'<h2 class="pg-section-title">pict-section-entitymanagement</h2>' +
			'<p class="pg-section-blurb">High-level entity browser/editor. Builds on pict-section-recordset + pict-section-form.</p>' +
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
					libPictSectionEM);
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
