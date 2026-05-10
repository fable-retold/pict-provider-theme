/**
 * pict-section-theme — wrapper view that smoke-tests the new theme
 * picker / mode toggle / topbar button views.
 *
 * setup() calls pict-section-theme.install() to:
 *   - reuse the playground's existing Theme provider (install() detects it)
 *   - register the full bundled theme catalog
 *   - register the three pict-section-theme views
 *
 * The wrapper view paints destination divs (#Theme-Picker,
 * #Theme-ModeToggle, #Theme-Button) where the section's own views render
 * themselves. Click the button → a pict-section-modal popup opens with
 * the picker + toggle inside.
 */
const libPictView = require('pict-view');
const libPictSectionTheme = require('pict-section-theme');

const DEMO_VIEW_ID = 'Playground-ThemeDemo';
const TARGET_ID = 'Playground-ThemeDemo-Destination';

class PictViewPlaygroundThemeDemo extends libPictView
{
	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		this.pict.CSSMap.injectCSS();

		// Render each pict-section-theme view into the destination divs we
		// just painted. The views look up their own destinations via their
		// configured DefaultDestinationAddress.
		let tmpPicker = this.pict.views['Theme-Picker'];
		if (tmpPicker) tmpPicker.render();
		let tmpToggle = this.pict.views['Theme-ModeToggle'];
		if (tmpToggle) tmpToggle.render();
		let tmpButton = this.pict.views['Theme-Button'];
		if (tmpButton) tmpButton.render();

		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}
}

module.exports = {
	id: 'theme',
	name: 'Theme Picker',
	group: 'Theme',
	module: 'pict-section-theme',

	ViewIdentifier: DEMO_VIEW_ID,
	ViewClass: PictViewPlaygroundThemeDemo,
	DestinationId: TARGET_ID,
	ViewConfiguration:
	{
		ViewIdentifier: DEMO_VIEW_ID,
		DefaultRenderable: 'Playground-ThemeDemo-Content',
		DefaultDestinationAddress: '#' + TARGET_ID,
		AutoRender: false,
		CSS: /*css*/`
.theme-demo-grid { display: grid; grid-template-columns: 1fr; gap: 22px; max-width: 720px; }
.theme-demo-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.theme-demo-row > .theme-demo-label {
	min-width: 110px;
	font-size: 11px; font-weight: 600;
	letter-spacing: 0.4px; text-transform: uppercase;
	color: var(--theme-color-text-muted, #6b6b6b);
}
.theme-demo-note {
	font-size: 12px; line-height: 1.5;
	color: var(--theme-color-text-secondary, #4a5568);
}`,
		CSSPriority: 500,
		Templates:
		[
			{
				Hash: 'Playground-ThemeDemo-Content',
				Template: /*html*/`
<h2 class="pg-section-title">pict-section-theme</h2>
<p class="pg-section-blurb">
	Three reusable views from <code>pict-section-theme</code>: a theme picker
	dropdown, a light/dark/system mode toggle, and an SVG topbar button that
	opens a modal popup containing both. Every change here drives the same
	<code>pict-provider-theme</code> runtime as the editor in the header — so
	the rest of the playground reflows immediately.
</p>
<div class="gallery-card">
	<div class="theme-demo-grid">
		<div class="theme-demo-row">
			<span class="theme-demo-label">Picker</span>
			<div id="Theme-Picker"></div>
		</div>
		<div class="theme-demo-row">
			<span class="theme-demo-label">Mode</span>
			<div id="Theme-ModeToggle"></div>
		</div>
		<div class="theme-demo-row">
			<span class="theme-demo-label">Topbar Button</span>
			<div id="Theme-Button"></div>
			<span class="theme-demo-note">Click the button to open a modal popup containing the picker + toggle.</span>
		</div>
	</div>
</div>`
			}
		],
		Renderables:
		[
			{
				RenderableHash: 'Playground-ThemeDemo-Content',
				TemplateHash: 'Playground-ThemeDemo-Content',
				DestinationAddress: '#' + TARGET_ID,
				RenderMethod: 'replace'
			}
		]
	},

	setup: function (pPict)
	{
		try
		{
			// install() detects the existing Theme provider attached by the
			// application bootstrap and reuses it. RegisterCatalog: true (the
			// default) populates the provider with every bundled theme so the
			// picker dropdown is fully populated.
			libPictSectionTheme.install(pPict);
		}
		catch (pErr)
		{
			pPict.log.warn('Playground theme section: install() failed: ' + pErr.message);
		}
	}
};
