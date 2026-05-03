/**
 * pict-section-recordset — full CRUD over a record collection.
 *
 * Builds on pict-section-form (now live in the playground) + pict-router.
 * Mounted with the playground's PictForm manifest; without a real data
 * provider it will show the empty list shell.
 */
const libPictSectionRecordSet = require('pict-section-recordset');

const VIEW_ID = 'Playground-RecordSet';
const TARGET_ID = 'Playground-RecordSet-Container';

let _mounted = false;

module.exports =
{
	id: 'recordset',
	name: 'Recordset',
	group: 'Data',
	status: 'live',
	module: 'pict-section-recordset',

	register: function () {},

	render: function (pContainer, pPict)
	{
		pContainer.innerHTML =
			'<h2 class="pg-section-title">pict-section-recordset</h2>' +
			'<p class="pg-section-blurb">Full CRUD UI over a record collection. Combines pict-section-form + pict-router. With no real data provider configured, expect an empty list shell.</p>' +
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
						TargetElementAddress: '#' + TARGET_ID,
						AutoRender: false
					},
					libPictSectionRecordSet);
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
