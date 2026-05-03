/**
 * pict-section-histogram — histogram/distribution chart.
 */
const libPictSectionHistogram = require('pict-section-histogram');

const VIEW_ID = 'Playground-Histogram';
const TARGET_ID = 'Histogram-Container-Div';

let _mounted = false;

module.exports =
{
	id: 'histogram',
	name: 'Histogram',
	group: 'Visualization',
	status: 'live',
	module: 'pict-section-histogram',

	register: function () {},

	render: function (pContainer, pPict)
	{
		pContainer.innerHTML =
			'<h2 class="pg-section-title">pict-section-histogram</h2>' +
			'<p class="pg-section-blurb">Histogram chart. Mounted with sample data.</p>' +
			'<div class="gallery-card">' +
			'  <div id="' + TARGET_ID + '" style="min-height: 320px;"></div>' +
			'</div>';

		if (!pPict.AppData.Playground) pPict.AppData.Playground = {};
		pPict.AppData.Playground.HistogramData = [3, 7, 12, 18, 25, 34, 42, 38, 28, 19, 11, 6, 3, 1];

		if (!_mounted)
		{
			try
			{
				pPict.addView(VIEW_ID,
					{
						ViewIdentifier: VIEW_ID,
						DefaultDestinationAddress: '#' + TARGET_ID,
						TargetElementAddress: '#' + TARGET_ID,
						AutoRender: false,
						DataAddress: 'AppData.Playground.HistogramData'
					},
					libPictSectionHistogram);
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
