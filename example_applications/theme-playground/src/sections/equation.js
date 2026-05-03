/**
 * pict-section-equation — equation rendering / solver.
 */
const libPictSectionEquation = require('pict-section-equation');

const VIEW_ID = 'Playground-Equation';
const TARGET_ID = 'Playground-Equation-Container';

let _mounted = false;

module.exports =
{
	id: 'equation',
	name: 'Equation',
	group: 'Visualization',
	status: 'live',
	module: 'pict-section-equation',

	register: function () {},

	render: function (pContainer, pPict)
	{
		pContainer.innerHTML =
			'<h2 class="pg-section-title">pict-section-equation</h2>' +
			'<p class="pg-section-blurb">Equation rendering / solver. Mounted as smoke test.</p>' +
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
					libPictSectionEquation);
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
