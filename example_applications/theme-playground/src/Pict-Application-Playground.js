/**
 * pict-provider-theme Playground — application bundle entry.
 *
 * Boot path (matches the canonical pict-section-modal example_applications
 * pattern):
 *   1. index.html loads pict.min.js (provides Pict global).
 *   2. index.html loads this bundle, which exposes
 *      window.PictProviderThemePlayground = PictApplicationPlayground.
 *   3. index.html calls Pict.safeLoadPictApplication(window.PictProviderThemePlayground, 2)
 *      which constructs Pict + this Application and runs the full
 *      initialize lifecycle so every registered view's onBeforeInitialize /
 *      onAfterInitializeAsync / onAfterInitialize fires.
 *
 * Section views are registered in the constructor.  The layout view
 * renders the shell + nav + theme editor + a destination div per section.
 * Navigation reveals the active section's destination and triggers its
 * view.render() the first time.
 */
const libPictApplication = require('pict-application');
const libPictRouter = require('pict-router');
const libPictProviderTheme = require('pict-provider-theme');

const libLayoutView = require('./views/PictView-Playground-Layout.js');
const _SectionRegistry = require('./sections/_registry.js');

class PictApplicationPlayground extends libPictApplication
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		// Convenience — expose the pict instance for browser-side probing.
		if (typeof window !== 'undefined') window.pict = this.pict;

		// Router — hash-based via Navigo, routes added by the layout view
		// in onAfterRender (after DOM exists).
		this.pict.addProvider('Pict-Router', libPictRouter.default_configuration, libPictRouter);

		// Theme provider — the runtime under test.
		this.pict.providers['Theme'] = new libPictProviderTheme(this.pict, {}, 'PlaygroundTheme');
		this.pict.providers['Theme'].pict = this.pict;

		// Stash the section registry on AppData so the layout view + sections
		// can read it without a separate require chain.
		this.pict.AppData.Playground = this.pict.AppData.Playground || {};
		this.pict.AppData.Playground.SectionRegistry = _SectionRegistry;

		// Pre-section setup hooks (e.g. service-type registration, manifest
		// stashing) — run BEFORE the addView so the view's init lifecycle
		// can rely on them.
		for (let i = 0; i < _SectionRegistry.length; i++)
		{
			let tmpEntry = _SectionRegistry[i];
			if (typeof tmpEntry.setup === 'function')
			{
				try { tmpEntry.setup(this.pict); }
				catch (pErr)
				{
					this.log.warn(`Playground: setup() for section [${tmpEntry.id}] threw: ${pErr.message}`);
				}
			}
		}

		// Register every section's view through the Pict view system so the
		// pict-application init lifecycle fires for each.  This is the key
		// difference from a bare-Pict bootstrap: views actually initialize.
		for (let i = 0; i < _SectionRegistry.length; i++)
		{
			let tmpEntry = _SectionRegistry[i];
			if (!tmpEntry.ViewIdentifier || !tmpEntry.ViewClass) continue;
			try
			{
				this.pict.addView(tmpEntry.ViewIdentifier, tmpEntry.ViewConfiguration, tmpEntry.ViewClass);
			}
			catch (pErr)
			{
				this.log.warn(`Playground: addView for section [${tmpEntry.id}] threw: ${pErr.message}`);
			}
		}

		// The shell.  MainViewportViewIdentifier in the application
		// configuration drives auto-render of this view after init.
		this.pict.addView('Playground-Layout', libLayoutView.default_configuration, libLayoutView);
	}
}

module.exports = PictApplicationPlayground;

module.exports.default_configuration =
{
	Name: 'PictProviderThemePlayground',
	Hash: 'PictProviderThemePlayground',

	MainViewportViewIdentifier: 'Playground-Layout',
	AutoSolveAfterInitialize: false,
	AutoRenderMainViewportViewAfterInitialize: true,

	pict_configuration:
	{
		Product: 'Playground',
		LogStreams: [{ streamtype: 'console', level: 'fatal' }],
		// pict-router skips auto-resolve on each addRoute so we can register
		// all routes up-front and resolve once at the end.
		RouterSkipRouteResolveOnAdd: true
	}
};
