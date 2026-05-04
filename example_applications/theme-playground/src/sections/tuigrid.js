const libPictSectionTuiGrid = require('pict-section-tuigrid');
const { buildSection } = require('./_wrapper.js');

module.exports = buildSection({
	id: 'tuigrid', name: 'TUI Grid', group: 'Data', module: 'pict-section-tuigrid',
	WrapperViewId: 'Playground-TuiGridWrapper',
	WrapperTargetId: 'Playground-TuiGridWrapper-Destination',
	InnerViewId: 'Playground-TuiGrid',
	InnerTargetId: 'Playground-TuiGrid-Container',
	InnerViewClass: libPictSectionTuiGrid,
	InnerContainerStyle: 'min-height: 320px;',
	Title: 'pict-section-tuigrid',
	Blurb: 'TOAST UI Grid wrapper. Uses its own built-in theme; the playground demonstrates mount + sample data.',
	InnerViewConfiguration:
	{
		DataAddress: 'AppData.Playground.GridData',
		Columns:
		[
			{ name: 'id',      header: 'ID',      width: 60 },
			{ name: 'name',    header: 'Name',    width: 160 },
			{ name: 'status',  header: 'Status',  width: 120 },
			{ name: 'updated', header: 'Updated', width: 140 }
		]
	},
	AdditionalSetup: function (pPict)
	{
		if (!pPict.AppData.Playground) pPict.AppData.Playground = {};
		pPict.AppData.Playground.GridData =
		[
			{ id: 1, name: 'Alpha',   status: 'active',  updated: '2026-05-03' },
			{ id: 2, name: 'Bravo',   status: 'idle',    updated: '2026-04-19' },
			{ id: 3, name: 'Charlie', status: 'active',  updated: '2026-04-12' },
			{ id: 4, name: 'Delta',   status: 'idle',    updated: '2026-03-29' },
			{ id: 5, name: 'Echo',    status: 'active',  updated: '2026-03-15' }
		];
	},
	onShow: function (pPict)
	{
		// TUI Grid needs a layout refresh when its container becomes visible
		// after being display:none.
		let tmpView = pPict.views['Playground-TuiGrid'];
		if (tmpView && tmpView.tuiGrid && typeof tmpView.tuiGrid.refreshLayout === 'function')
		{
			try { tmpView.tuiGrid.refreshLayout(); }
			catch (pErr) { /* tolerate */ }
		}
	}
});
