/**
 * Base Components — hand-rendered kitchen sink demonstrating that the active
 * theme drives every primitive (button/input/badge/alert/tab/table/modal-card).
 *
 * Uses only --theme-* custom properties.  No pict-section-* dependency.
 */
module.exports =
{
	id: 'base-components',
	name: 'Base Components',
	group: 'Overview',
	status: 'live',
	register: function () {},
	render: function (pContainer)
	{
		pContainer.innerHTML =
			'<h2 class="pg-section-title">Base Components</h2>' +
			'<div class="gallery">' +
			'  <div class="gallery-card">' +
			'    <h3 class="gallery-card-title">Brand</h3>' +
			'    <div class="demo-brand">' +
			'      <div id="demo-brand-logo" class="demo-brand-logo">P</div>' +
			'      <div>' +
			'        <div class="demo-brand-name" id="demo-brand-name">Playground</div>' +
			'        <div style="color: var(--theme-color-text-muted); font-size: var(--theme-typography-size-sm);">Drop a logo on the right to see it here</div>' +
			'      </div>' +
			'    </div>' +
			'  </div>' +
			'  <div class="gallery-card">' +
			'    <h3 class="gallery-card-title">Buttons</h3>' +
			'    <div class="gallery-row">' +
			'      <button class="demo-btn">Default</button>' +
			'      <button class="demo-btn is-primary">Primary</button>' +
			'      <button class="demo-btn is-danger">Danger</button>' +
			'    </div>' +
			'  </div>' +
			'  <div class="gallery-card">' +
			'    <h3 class="gallery-card-title">Inputs</h3>' +
			'    <div class="gallery-row">' +
			'      <input class="demo-input" type="text" placeholder="Type here">' +
			'      <select class="demo-select"><option>Option A</option><option>Option B</option></select>' +
			'    </div>' +
			'  </div>' +
			'  <div class="gallery-card">' +
			'    <h3 class="gallery-card-title">Badges</h3>' +
			'    <div class="gallery-row">' +
			'      <span class="demo-badge">Default</span>' +
			'      <span class="demo-badge is-brand">Brand</span>' +
			'    </div>' +
			'  </div>' +
			'  <div class="gallery-card">' +
			'    <h3 class="gallery-card-title">Alerts</h3>' +
			'    <div class="demo-alert is-info">Info: this is themable.</div>' +
			'    <div class="demo-alert is-success">Success: token-driven.</div>' +
			'    <div class="demo-alert is-warning">Warning: paired modes work.</div>' +
			'    <div class="demo-alert is-error">Error: also paired.</div>' +
			'  </div>' +
			'  <div class="gallery-card">' +
			'    <h3 class="gallery-card-title">Tabs</h3>' +
			'    <div class="demo-tabs">' +
			'      <div class="demo-tab is-active">Overview</div>' +
			'      <div class="demo-tab">Detail</div>' +
			'      <div class="demo-tab">Settings</div>' +
			'    </div>' +
			'    <p style="color: var(--theme-color-text-secondary); margin: 0;">Active tab uses brand color.</p>' +
			'  </div>' +
			'  <div class="gallery-card">' +
			'    <h3 class="gallery-card-title">Table</h3>' +
			'    <table class="demo-table">' +
			'      <thead><tr><th>Name</th><th>Status</th><th>Updated</th></tr></thead>' +
			'      <tbody>' +
			'        <tr><td>Alpha</td><td><span class="demo-badge is-brand">Active</span></td><td>2026-05-03</td></tr>' +
			'        <tr><td>Bravo</td><td><span class="demo-badge">Idle</span></td><td>2026-04-19</td></tr>' +
			'        <tr><td>Charlie</td><td><span class="demo-badge">Idle</span></td><td>2026-03-02</td></tr>' +
			'      </tbody>' +
			'    </table>' +
			'  </div>' +
			'  <div class="gallery-card">' +
			'    <h3 class="gallery-card-title">Modal-card (static)</h3>' +
			'    <div class="demo-modal">' +
			'      <h4 class="demo-modal-title">Save changes?</h4>' +
			'      <p class="demo-modal-body">Token edits are kept in memory. Export the bundle to persist.</p>' +
			'      <div class="gallery-row" style="margin-bottom:0;">' +
			'        <button class="demo-btn">Cancel</button>' +
			'        <button class="demo-btn is-primary">Save</button>' +
			'      </div>' +
			'    </div>' +
			'  </div>' +
			'</div>';
	}
};
