/**
 * pict-section-openseadragon — high-resolution image / DZI viewer.
 *
 * Requires OpenSeadragon + Annotorious + Annotorious-SelectorPack +
 * Annotorious-BetterPolygon as <script> globals (loaded in index.html).
 */
const libPictSectionOSD = require('pict-section-openseadragon');

const VIEW_ID = 'Playground-OpenSeaDragon';
const TARGET_ID = 'OpenSeaDragon-Container-Div';

const SAMPLE_TILE_SOURCE =
{
	type: 'image',
	url: 'data:image/svg+xml;utf8,' + encodeURIComponent(
		'<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">' +
		'<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3357c7"/><stop offset="1" stop-color="#c75033"/></linearGradient></defs>' +
		'<rect width="800" height="600" fill="url(#g)"/>' +
		'<text x="400" y="290" font-family="sans-serif" font-size="42" fill="#fff" text-anchor="middle">OpenSeadragon</text>' +
		'<text x="400" y="340" font-family="sans-serif" font-size="22" fill="#ffffffcc" text-anchor="middle">scroll to zoom &middot; drag to pan</text>' +
		'</svg>')
};

let _mounted = false;

module.exports =
{
	id: 'openseadragon',
	name: 'OpenSeadragon Viewer',
	group: 'Visualization',
	status: 'live',
	module: 'pict-section-openseadragon',

	register: function () {},

	render: function (pContainer, pPict)
	{
		pContainer.innerHTML =
			'<h2 class="pg-section-title">pict-section-openseadragon</h2>' +
			'<p class="pg-section-blurb">High-resolution / deep-zoom image viewer. OpenSeadragon + the Annotorious plugin family are loaded via <code>&lt;script&gt;</code> tags in <code>index.html</code> (the section calls <code>OpenSeadragon.Annotorious(...)</code> unconditionally during render).</p>' +
			'<div class="gallery-card">' +
			'  <div id="' + TARGET_ID + '" style="min-height: 360px; background: var(--theme-color-background-primary);"></div>' +
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
						AutoRender: false,
						TileSources: SAMPLE_TILE_SOURCE
					},
					libPictSectionOSD);
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
