/**
 * pict-section-tuigrid — TOAST UI Grid wrapper.
 *
 * Wraps tui-grid which has its own built-in CSS theme system.  For this
 * smoke test we mount with a small dataset and let TOAST UI's default
 * theme apply.
 */
// pict-section-tuigrid expects window.tui.Grid.  TOAST UI Grid is a UMD that
// doesn't browserify cleanly; index.html loads it via <script>+<link> from
// dist/vendor/tui-grid.min.* (copied by quack copy).
const libPictSectionTuiGrid = require('pict-section-tuigrid');

const VIEW_ID = 'Playground-TuiGrid';
const TARGET_ID = 'Playground-TuiGrid-Container';

let _mounted = false;

module.exports =
{
	id: 'tuigrid',
	name: 'TUI Grid',
	group: 'Data',
	status: 'live',
	module: 'pict-section-tuigrid',

	register: function () {},

	render: function (pContainer, pPict)
	{
		pContainer.innerHTML =
			'<h2 class="pg-section-title">pict-section-tuigrid</h2>' +
			'<p class="pg-section-blurb">TOAST UI Grid wrapper. Has its own built-in theme system; the playground demonstrates mount + sample data.</p>' +
			'<div class="gallery-card">' +
			'  <div id="' + TARGET_ID + '" style="min-height: 320px;"></div>' +
			'</div>';

		if (!pPict.AppData.Playground) pPict.AppData.Playground = {};
		pPict.AppData.Playground.GridData =
		[
			{ id: 1, name: 'Alpha',   status: 'active',  updated: '2026-05-03' },
			{ id: 2, name: 'Bravo',   status: 'idle',    updated: '2026-04-19' },
			{ id: 3, name: 'Charlie', status: 'active',  updated: '2026-04-12' },
			{ id: 4, name: 'Delta',   status: 'idle',    updated: '2026-03-29' },
			{ id: 5, name: 'Echo',    status: 'active',  updated: '2026-03-15' }
		];

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
						DataAddress: 'AppData.Playground.GridData',
						Columns:
						[
							{ name: 'id',      header: 'ID',      width: 60 },
							{ name: 'name',    header: 'Name',    width: 160 },
							{ name: 'status',  header: 'Status',  width: 120 },
							{ name: 'updated', header: 'Updated', width: 140 }
						]
					},
					libPictSectionTuiGrid);
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
