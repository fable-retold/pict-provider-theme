/**
 * Logo Explorer — programmatic project-name → SVG logo generator playground.
 *
 * Reads the canonical retold module manifest (which carries `Type:
 * 'webapp' | 'library'`) and splits the UI into two streams:
 *
 *   - **Web apps** — modules that ship a real UI. Get the full logo
 *     treatment: 96px primary mark + 32px favicon preview side-by-side
 *     so you can spot which marks survive simplification.
 *
 *   - **Libraries** — backend modules with no UI surface. Just need brand
 *     colors. Render as a compact swatch row (primary + secondary chips
 *     and the project name).
 *
 * State lives under `pict.AppData.Playground.LogoExplorer`. Iteration is
 * template-driven via `{~TS:~}` tags; conditional rendering uses the
 * single-element-array trick. All interactions are inline `on*` handlers
 * routing through `_Pict.views['Playground-LogoExplorer']`.
 *
 * Iterate on the algorithm by editing
 * `src/lib/RetoldLogoGenerator.js`. Iterate on the categorization by
 * editing `Retold-Modules-Manifest.json`.
 */
const libPictView = require('pict-view');
const libRetoldLogoGenerator = require('../lib/RetoldLogoGenerator.js');
const libRetoldModules = require('../lib/retold-modules.js');

const VIEW_ID = 'Playground-LogoExplorer';
const TARGET_ID = 'Playground-LogoExplorer-Destination';

class PictViewPlaygroundLogoExplorer extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onBeforeInitialize()
	{
		// Stage AppData. Always rebuild from the manifest so manual
		// re-categorizations show up after a refresh.
		let tmpRoot = this.pict.AppData.Playground = this.pict.AppData.Playground || {};
		let tmpState = tmpRoot.LogoExplorer || (tmpRoot.LogoExplorer = this._buildInitialState());

		let tmpCategorized = libRetoldModules.categorize();
		this._Categorized = tmpCategorized;
		tmpState.PaletteOptions = this._buildPaletteOptions(tmpState.Palette);

		this._rebuildAllTiles(tmpState);

		tmpState.VariantOptions = this._buildVariantOptions(tmpState.Variant);
		tmpState.DetailOpen = [];

		return super.onBeforeInitialize();
	}

	_rebuildAllTiles(pState)
	{
		let tmpCategorized = this._Categorized || libRetoldModules.categorize();
		pState.WebappTiles = tmpCategorized.Webapps.map((pM) =>
			this._buildAppTile(pM, pState.Variant, pState.Palette));
		pState.ExampleTiles = (tmpCategorized.Examples || []).map((pM) =>
			this._buildAppTile(pM, pState.Variant, pState.Palette));
		pState.LibraryGroups = tmpCategorized.Libraries.map((pGroup) =>
		({
			Name: pGroup.Name,
			Count: pGroup.Modules.length,
			Rows: pGroup.Modules.map((pM) => this._buildLibraryRow(pM, pState.Palette))
		}));
		pState.CustomTiles = this._buildCustomTiles(pState.Custom.Name, pState.Variant, pState.Palette);
	}

	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		this.pict.CSSMap.injectCSS();
		// Rasterize all favicons to real PNG bitmaps at their target sizes
		// — this is what browsers will actually show in a tab, not the
		// SVG scaled via CSS.
		this._rasterizeAllFavicons();
		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}

	/**
	 * Walk every `<span data-favicon-target>` placeholder in the rendered
	 * DOM and replace it with a real <img> backed by a canvas-rasterized
	 * PNG at the requested pixel size. Cached per (project, variant, size)
	 * so variant toggles only re-rasterize what changed.
	 */
	_rasterizeAllFavicons()
	{
		this._FaviconCache = this._FaviconCache || new Map();
		let tmpTargets = document.querySelectorAll('[data-favicon-target]');
		tmpTargets.forEach((pEl) => this._rasterizeOne(pEl));
	}

	_rasterizeOne(pEl)
	{
		let tmpName = pEl.getAttribute('data-favicon-target');
		let tmpTone = pEl.getAttribute('data-favicon-tone') || 'light';
		let tmpSize = parseInt(pEl.getAttribute('data-favicon-size') || '32', 10);
		// Palette is part of the cache key — same name/tone/size under
		// different palettes produces different bytes.
		let tmpPalette = this._state().Palette || 'default';
		let tmpKey = tmpName + '|' + tmpPalette + '|' + tmpTone + '|' + tmpSize;

		if (pEl.getAttribute('data-favicon-rendered') === tmpKey) return;

		let tmpCachedURL = this._FaviconCache.get(tmpKey);
		if (tmpCachedURL)
		{
			pEl.innerHTML = '<img src="' + tmpCachedURL + '" width="' + tmpSize + '" height="' + tmpSize
				+ '" alt="' + this._escapeAttr(tmpName) + ' favicon"/>';
			pEl.setAttribute('data-favicon-rendered', tmpKey);
			return;
		}

		let tmpResult = libRetoldLogoGenerator.generate(tmpName, { Palette: tmpPalette });
		let tmpSVG = tmpResult.Favicons[tmpTone] || tmpResult.Favicons.light;
		let tmpSelf = this;
		libRetoldLogoGenerator.svgToPNGBlob(tmpSVG, tmpSize).then((pBlob) =>
		{
			let tmpURL = URL.createObjectURL(pBlob);
			tmpSelf._FaviconCache.set(tmpKey, tmpURL);
			pEl.innerHTML = '<img src="' + tmpURL + '" width="' + tmpSize + '" height="' + tmpSize
				+ '" alt="' + tmpSelf._escapeAttr(tmpName) + ' favicon"/>';
			pEl.setAttribute('data-favicon-rendered', tmpKey);
		}).catch((pErr) =>
		{
			tmpSelf.log.warn('Favicon rasterization failed for ' + tmpName + ': ' + pErr.message);
		});
	}

	_escapeAttr(pStr)
	{
		return String(pStr).replace(/"/g, '&quot;');
	}

	// ── State construction ───────────────────────────────────────────────

	_buildInitialState()
	{
		return {
			Variant: 'filled-light',
			VariantOptions: this._buildVariantOptions('filled-light'),
			Palette: 'mix',
			PaletteOptions: this._buildPaletteOptions('mix'),
			WebappTiles: [],
			LibraryGroups: [],
			Custom: { Name: 'retold-remote' },
			CustomTiles: [],
			DetailOpen: []
		};
	}

	_buildPaletteOptions(pActive)
	{
		return libRetoldLogoGenerator.PALETTES.map((pP) => (
		{
			Key: pP.Key,
			Label: pP.Label,
			Description: pP.Description,
			IsActive: pP.Key === pActive
		}));
	}

	_buildVariantOptions(pActive)
	{
		const VARIANTS =
		[
			{ Key: 'filled-light',  Label: 'Filled · light' },
			{ Key: 'filled-dark',   Label: 'Filled · dark' },
			{ Key: 'outline-light', Label: 'Outline · light' },
			{ Key: 'outline-dark',  Label: 'Outline · dark' }
		];
		return VARIANTS.map((pV) => Object.assign({}, pV, { IsActive: pV.Key === pActive }));
	}

	_buildAppTile(pModule, pVariant, pPalette)
	{
		// Per-module Branding.Palette in the manifest wins over the
		// global selection. That's how every example app stays carnival
		// no matter which palette the user is exploring.
		let tmpResolvedPalette = (pModule.Branding && pModule.Branding.Palette) || pPalette;
		let tmpResult = libRetoldLogoGenerator.generate(pModule.Name, { Palette: tmpResolvedPalette });
		let tmpFaviconKey = (pVariant === 'filled-dark' || pVariant === 'outline-dark') ? 'dark' : 'light';
		let tmpPill = (tmpResult.Brand.Palette === 'mix')
			? tmpResult.Brand.ResolvedPalette
			: tmpResult.CompositionName;
		// Examples render their host module name + the example name
		// (e.g. "pict-section-flow / simple_cards") for context.
		let tmpDisplayName = pModule.DisplayName || pModule.Name;
		return {
			Name: pModule.Name,
			DisplayName: tmpDisplayName,
			HostModule: pModule.HostModule || null,
			Group: pModule.Group,
			Type: pModule.Type,
			Description: pModule.Description,
			Monogram: tmpResult.Monogram,
			Composition: tmpResult.CompositionName,
			ResolvedPalette: tmpResult.Brand.ResolvedPalette,
			Pill: tmpPill,
			SVG: tmpResult.Variants[pVariant] || tmpResult.SVG,
			Variants: tmpResult.Variants,
			Favicons: tmpResult.Favicons,
			FaviconTone: tmpFaviconKey,
			Brand: tmpResult.Brand,
			Hash: tmpResult.Hash,
			IDSafe: pModule.Name.replace(/[^a-zA-Z0-9_-]/g, '_'),
			VariantBg: this._variantBgClass(pVariant)
		};
	}

	_buildLibraryRow(pModule, pPalette)
	{
		let tmpResult = libRetoldLogoGenerator.generate(pModule.Name, { Palette: pPalette });
		return {
			Name: pModule.Name,
			Group: pModule.Group,
			Description: pModule.Description,
			Monogram: tmpResult.Monogram,
			Brand: tmpResult.Brand,
			PrimaryColor: tmpResult.Brand.Primary.LightTheme,
			SecondaryColor: tmpResult.Brand.Secondary.LightTheme,
			PrimaryHue: tmpResult.Brand.Primary.Hue,
			SecondaryHue: tmpResult.Brand.Secondary.Hue,
			Hash: tmpResult.Hash,
			IDSafe: pModule.Name.replace(/[^a-zA-Z0-9_-]/g, '_')
		};
	}

	_buildCustomTiles(pName, pVariant, pPalette)
	{
		let tmpName = (pName || '').trim();
		if (!tmpName) return [];
		return [this._buildAppTile({ Name: tmpName, Group: 'Custom', Type: 'webapp', Description: '' }, pVariant, pPalette)];
	}

	_buildDetail(pName, pPalette)
	{
		let tmpResult = libRetoldLogoGenerator.generate(pName, { Size: 144, Palette: pPalette });
		return {
			Name: pName,
			IDSafe: pName.replace(/[^a-zA-Z0-9_-]/g, '_'),
			Monogram: tmpResult.Monogram,
			Hash: tmpResult.Hash,
			FrameIndex: tmpResult.FrameIndex,
			CompositionIndex: tmpResult.CompositionIndex,
			CompositionName: tmpResult.CompositionName,
			RequestedPalette: tmpResult.Brand.Palette,
			ResolvedPalette: tmpResult.Brand.ResolvedPalette,
			IsMix: tmpResult.Brand.Palette === 'mix',
			Brand: tmpResult.Brand,
			Variants: tmpResult.Variants,
			VariantCells:
			[
				{ Key: 'filled-light',  Label: 'Filled · Light',  BgClass: 'logo-detail-cell-light', SVG: tmpResult.Variants['filled-light'],  Owner: pName },
				{ Key: 'filled-dark',   Label: 'Filled · Dark',   BgClass: 'logo-detail-cell-dark',  SVG: tmpResult.Variants['filled-dark'],   Owner: pName },
				{ Key: 'outline-light', Label: 'Outline · Light', BgClass: 'logo-detail-cell-light', SVG: tmpResult.Variants['outline-light'], Owner: pName },
				{ Key: 'outline-dark',  Label: 'Outline · Dark',  BgClass: 'logo-detail-cell-dark',  SVG: tmpResult.Variants['outline-dark'],  Owner: pName }
			],
			FaviconCells:
			[
				{ Label: '16 px',  Size: 16,  Tone: 'light', BgClass: 'logo-detail-cell-light', Owner: pName },
				{ Label: '24 px',  Size: 24,  Tone: 'light', BgClass: 'logo-detail-cell-light', Owner: pName },
				{ Label: '32 px',  Size: 32,  Tone: 'light', BgClass: 'logo-detail-cell-light', Owner: pName },
				{ Label: '48 px',  Size: 48,  Tone: 'light', BgClass: 'logo-detail-cell-light', Owner: pName },
				{ Label: '64 px',  Size: 64,  Tone: 'light', BgClass: 'logo-detail-cell-light', Owner: pName },
				{ Label: '180 px', Size: 180, Tone: 'light', BgClass: 'logo-detail-cell-light', Owner: pName }
			]
		};
	}

	_variantBgClass(pVariant)
	{
		return (pVariant === 'filled-light' || pVariant === 'outline-light')
			? 'logo-tile-bg-light'
			: 'logo-tile-bg-dark';
	}

	_state()
	{
		return this.pict.AppData.Playground.LogoExplorer;
	}

	// ── Inline-handler bridges ───────────────────────────────────────────

	_setVariant(pVariant)
	{
		let tmpState = this._state();
		if (tmpState.Variant === pVariant) return;
		tmpState.Variant = pVariant;
		let tmpFaviconKey = (pVariant === 'filled-dark' || pVariant === 'outline-dark') ? 'dark' : 'light';

		let tmpRetone = (pTile) =>
		{
			pTile.SVG = pTile.Variants[pVariant];
			pTile.FaviconTone = tmpFaviconKey;
			pTile.VariantBg = this._variantBgClass(pVariant);
		};
		tmpState.WebappTiles.forEach(tmpRetone);
		(tmpState.ExampleTiles || []).forEach(tmpRetone);
		tmpState.CustomTiles.forEach(tmpRetone);
		tmpState.VariantOptions = this._buildVariantOptions(pVariant);

		this._reassign('#Logo-VariantToggle', this.pict.parseTemplateByHash('Logo-VariantToggle-Inner', tmpState));
		this._reassign('#Logo-CustomTiles',   this.pict.parseTemplateByHash('Logo-CustomTiles-Inner', tmpState));
		this._reassign('#Logo-Webapps',       this.pict.parseTemplateByHash('Logo-Webapps-Inner', tmpState));
		this._reassign('#Logo-Examples',      this.pict.parseTemplateByHash('Logo-Examples-Inner', tmpState));
		this._rasterizeAllFavicons();
	}

	_setCustomName(pValue)
	{
		let tmpState = this._state();
		tmpState.Custom.Name = pValue;
		tmpState.CustomTiles = this._buildCustomTiles(pValue, tmpState.Variant, tmpState.Palette);
		this._reassign('#Logo-CustomTiles', this.pict.parseTemplateByHash('Logo-CustomTiles-Inner', tmpState));
		this._rasterizeAllFavicons();
	}

	/**
	 * Switch the active brand palette and rebuild every cached tile from
	 * scratch — the brand colors change but composition / frame / monogram
	 * stay identical (they're hash-driven, not palette-driven). The
	 * favicon cache must be cleared because the rasterized PNGs were keyed
	 * by name + tone + size, not palette; without the clear we'd serve
	 * stale colors from the cache.
	 */
	_setPalette(pPaletteKey)
	{
		let tmpState = this._state();
		if (tmpState.Palette === pPaletteKey) return;
		tmpState.Palette = pPaletteKey;
		tmpState.PaletteOptions = this._buildPaletteOptions(pPaletteKey);
		this._rebuildAllTiles(tmpState);
		// Bust the favicon rasterization cache: same project / tone / size
		// now produces different PNG bytes under the new palette.
		this._FaviconCache = new Map();
		// Re-render every section that depends on tile data.
		this._reassign('#Logo-PaletteToggle', this.pict.parseTemplateByHash('Logo-PaletteToggle-Inner', tmpState));
		this._reassign('#Logo-PaletteDescription', this.pict.parseTemplateByHash('Logo-PaletteDescription-Inner', tmpState));
		this._reassign('#Logo-CustomTiles',   this.pict.parseTemplateByHash('Logo-CustomTiles-Inner', tmpState));
		this._reassign('#Logo-Webapps',       this.pict.parseTemplateByHash('Logo-Webapps-Inner', tmpState));
		this._reassign('#Logo-Examples',      this.pict.parseTemplateByHash('Logo-Examples-Inner', tmpState));
		this._reassign('#Logo-Libraries',     this.pict.parseTemplateByHash('Logo-Libraries-Inner', tmpState));
		// If a detail card is open, refresh it under the new palette.
		if (tmpState.DetailOpen.length > 0)
		{
			let tmpName = tmpState.DetailOpen[0].Name;
			tmpState.DetailOpen = [this._buildDetail(tmpName, pPaletteKey)];
			this._reassign('#Logo-Detail', this.pict.parseTemplateByHash('Logo-Detail-Inner', tmpState));
		}
		this._rasterizeAllFavicons();
	}

	_openDetail(pName)
	{
		let tmpState = this._state();
		tmpState.DetailOpen = [this._buildDetail(pName, tmpState.Palette)];
		this._reassign('#Logo-Detail', this.pict.parseTemplateByHash('Logo-Detail-Inner', tmpState));
		this._rasterizeAllFavicons();
		setTimeout(() =>
		{
			let tmpEl = document.getElementById('Logo-Detail');
			if (tmpEl && typeof tmpEl.scrollIntoView === 'function')
			{
				tmpEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}
		}, 0);
	}

	_closeDetail()
	{
		let tmpState = this._state();
		tmpState.DetailOpen = [];
		this._reassign('#Logo-Detail', this.pict.parseTemplateByHash('Logo-Detail-Inner', tmpState));
	}

	_downloadVariant(pName, pVariant, pKind)
	{
		let tmpState = this._state();
		let tmpResult = libRetoldLogoGenerator.generate(pName, { Palette: tmpState.Palette });
		let tmpSVG = tmpResult.Variants[pVariant];
		let tmpSuffix = (tmpState.Palette === 'default') ? '' : ('-' + tmpState.Palette);
		let tmpBase = String(pName).replace(/[^a-zA-Z0-9_-]/g, '_') + tmpSuffix + '-' + pVariant;
		try
		{
			if (pKind === 'svg') libRetoldLogoGenerator.downloadSVG(tmpSVG, tmpBase + '.svg');
			else if (pKind === 'png-512') libRetoldLogoGenerator.downloadPNG(tmpSVG, tmpBase + '-512.png', 512);
			else if (pKind === 'png-32') libRetoldLogoGenerator.downloadPNG(tmpSVG, tmpBase + '-32.png', 32);
		}
		catch (pErr) { this.log.warn('Logo download failed: ' + pErr.message); }
	}

	_downloadFaviconSet(pName)
	{
		let tmpState = this._state();
		try { libRetoldLogoGenerator.downloadFaviconSet(pName, 'filled-light', { Palette: tmpState.Palette }); }
		catch (pErr) { this.log.warn('Favicon set download failed: ' + pErr.message); }
	}

	_reassign(pSelector, pHTML)
	{
		this.pict.ContentAssignment.assignContent(pSelector, pHTML);
	}
}

module.exports = {
	id: 'logo',
	name: 'Logo Explorer',
	group: 'Brand',
	module: null,

	ViewIdentifier: VIEW_ID,
	ViewClass: PictViewPlaygroundLogoExplorer,
	DestinationId: TARGET_ID,
	ViewConfiguration:
	{
		ViewIdentifier: VIEW_ID,
		DefaultRenderable: 'Logo-Root',
		DefaultDestinationAddress: '#' + TARGET_ID,
		AutoRender: false,

		Templates:
		[
			{
				Hash: 'Logo-Root',
				Template: /*html*/`
<h2 class="pg-section-title">Logo Explorer</h2>
<p class="pg-section-blurb">
	Reads <code>Retold-Modules-Manifest.json</code> as the canonical source for which modules
	exist and which are web apps vs libraries. Web apps get the full logo
	treatment (96 px mark + 32 px favicon preview side-by-side); libraries
	get a brand-color swatch since they have no UI surface to bear a mark.
	Pick a <strong>palette</strong> below to constrain hue ranges across
	the whole ecosystem — same compositions, curated colors. Edit
	<code>src/lib/RetoldLogoGenerator.js</code> to add palettes or iterate
	on the algorithm; edit the manifest's <code>Type</code> field to
	recategorize.
</p>

<div class="logo-controls gallery-card">
	<div class="logo-controls-row">
		<label class="logo-controls-label">Custom name</label>
		<input type="text" id="Logo-CustomInput" class="demo-input logo-custom-input"
			placeholder="retold-remote"
			value="{~D:AppData.Playground.LogoExplorer.Custom.Name~}"
			oninput="_Pict.views['${VIEW_ID}']._setCustomName(this.value)" />
	</div>
	<div class="logo-controls-row">
		<label class="logo-controls-label">Palette</label>
		<div id="Logo-PaletteToggle" class="logo-palette-toggle">{~T:Logo-PaletteToggle-Inner:AppData.Playground.LogoExplorer~}</div>
	</div>
	<div id="Logo-PaletteDescription" class="logo-palette-description">{~T:Logo-PaletteDescription-Inner:AppData.Playground.LogoExplorer~}</div>
	<div class="logo-controls-row">
		<label class="logo-controls-label">Variant</label>
		<div id="Logo-VariantToggle" class="logo-variant-toggle">{~T:Logo-VariantToggle-Inner:AppData.Playground.LogoExplorer~}</div>
	</div>
</div>

<div id="Logo-CustomTiles" class="logo-custom-row">{~T:Logo-CustomTiles-Inner:AppData.Playground.LogoExplorer~}</div>

<div id="Logo-Detail" class="logo-detail-slot">{~T:Logo-Detail-Inner:AppData.Playground.LogoExplorer~}</div>

<section class="logo-section">
	<h3 class="logo-section-title">Web Applications<span class="logo-section-count">{~D:AppData.Playground.LogoExplorer.WebappTiles.length~} modules</span></h3>
	<p class="logo-section-blurb">Modules that ship a real UI. Each tile shows the 96 px primary mark plus the 32 px and 16 px favicon previews beside it.</p>
	<div id="Logo-Webapps">{~T:Logo-Webapps-Inner:AppData.Playground.LogoExplorer~}</div>
</section>

<section class="logo-section">
	<h3 class="logo-section-title">Example Applications<span class="logo-section-count">{~D:AppData.Playground.LogoExplorer.ExampleTiles.length~} examples</span></h3>
	<p class="logo-section-blurb">Runnable demos under each module's <code>example_applications/</code> folder. Branded with the carnival palette regardless of the global palette selection — a fairground for the rest of the ecosystem.</p>
	<div id="Logo-Examples">{~T:Logo-Examples-Inner:AppData.Playground.LogoExplorer~}</div>
</section>

<section class="logo-section">
	<h3 class="logo-section-title">Libraries<span class="logo-section-count">{~D:AppData.Playground.LogoExplorer.LibraryGroups.length~} groups</span></h3>
	<p class="logo-section-blurb">Backend / build / component modules with no end-user UI surface. Brand colors only — primary on the left chip, analogous secondary on the right.</p>
	<div id="Logo-Libraries">{~T:Logo-Libraries-Inner:AppData.Playground.LogoExplorer~}</div>
</section>`
			},

			// Palette selector (renders as a row of pill buttons).
			{
				Hash: 'Logo-PaletteToggle-Inner',
				Template: /*html*/`{~TS:Logo-PaletteToggle-Btn:Record.PaletteOptions~}`
			},
			{
				Hash: 'Logo-PaletteToggle-Btn',
				Template: /*html*/`<button type="button" class="logo-palette-btn{~NE:Record.IsActive^ is-active~}" onclick="_Pict.views['${VIEW_ID}']._setPalette('{~D:Record.Key~}')" title="{~D:Record.Description~}">{~D:Record.Label~}</button>`
			},
			{
				Hash: 'Logo-PaletteDescription-Inner',
				Template: /*html*/`{~TS:Logo-PaletteDescription-Active:Record.PaletteOptions~}`
			},
			{
				Hash: 'Logo-PaletteDescription-Active',
				Template: /*html*/`{~TIfAbs:Logo-PaletteDescription-Body:Record:Record.IsActive^TRUE^~}`
			},
			{
				Hash: 'Logo-PaletteDescription-Body',
				Template: /*html*/`<div class="logo-palette-blurb">{~D:Record.Description~}</div>`
			},

			// Libraries section gets its own re-renderable wrapper.
			{
				Hash: 'Logo-Libraries-Inner',
				Template: /*html*/`{~TS:Logo-LibraryGroup:Record.LibraryGroups~}`
			},

			// Variant toggle.
			{
				Hash: 'Logo-VariantToggle-Inner',
				Template: /*html*/`{~TS:Logo-VariantToggle-Btn:Record.VariantOptions~}`
			},
			{
				Hash: 'Logo-VariantToggle-Btn',
				Template: /*html*/`<button type="button" class="logo-variant-btn{~NE:Record.IsActive^ is-active~}" onclick="_Pict.views['${VIEW_ID}']._setVariant('{~D:Record.Key~}')">{~D:Record.Label~}</button>`
			},

			// Custom tile.
			{
				Hash: 'Logo-CustomTiles-Inner',
				Template: /*html*/`{~TS:Logo-CustomTileSection:Record.CustomTiles~}`
			},
			{
				Hash: 'Logo-CustomTileSection',
				Template: /*html*/`
<section class="logo-section">
	<h3 class="logo-section-title">Custom <span class="logo-section-count">{~D:Record.Name~}</span></h3>
	<div class="logo-grid">{~T:Logo-AppTile:Record~}</div>
</section>`
			},

			// Webapps grid.
			{
				Hash: 'Logo-Webapps-Inner',
				Template: /*html*/`<div class="logo-grid">{~TS:Logo-AppTile:Record.WebappTiles~}</div>`
			},

			// Examples grid.
			{
				Hash: 'Logo-Examples-Inner',
				Template: /*html*/`<div class="logo-grid">{~TS:Logo-AppTile:Record.ExampleTiles~}</div>`
			},

			// App tile (logo + true-pixel-size rasterized favicon).
			{
				Hash: 'Logo-AppTile',
				Template: /*html*/`
<div class="logo-tile logo-app-tile {~D:Record.VariantBg~}" data-name="{~D:Record.Name~}" onclick="_Pict.views['${VIEW_ID}']._openDetail('{~D:Record.Name~}')">
	<div class="logo-tile-marks">
		<div class="logo-tile-svg-primary">{~D:Record.SVG~}</div>
		<div class="logo-tile-favicon-stack">
			<span class="logo-tile-favicon-slot logo-tile-favicon-32" data-favicon-target="{~D:Record.Name~}" data-favicon-tone="{~D:Record.FaviconTone~}" data-favicon-size="32"></span>
			<span class="logo-tile-favicon-slot logo-tile-favicon-16" data-favicon-target="{~D:Record.Name~}" data-favicon-tone="{~D:Record.FaviconTone~}" data-favicon-size="16"></span>
		</div>
	</div>
	<div class="logo-tile-name">{~D:Record.DisplayName~}<span class="logo-tile-pill">{~D:Record.Pill~}</span></div>
</div>`
			},

			// Library group.
			{
				Hash: 'Logo-LibraryGroup',
				Template: /*html*/`
<div class="logo-library-group">
	<h4 class="logo-library-group-title">{~D:Record.Name~}<span class="logo-library-group-count">{~D:Record.Count~}</span></h4>
	<div class="logo-library-grid">{~TS:Logo-LibraryRow:Record.Rows~}</div>
</div>`
			},
			{
				Hash: 'Logo-LibraryRow',
				Template: /*html*/`
<div class="logo-library-row" data-name="{~D:Record.Name~}" onclick="_Pict.views['${VIEW_ID}']._openDetail('{~D:Record.Name~}')" title="{~D:Record.Description~}">
	<span class="logo-library-swatch logo-library-swatch-primary" style="background:{~D:Record.PrimaryColor~};" title="Primary {~D:Record.PrimaryHue~}°"></span>
	<span class="logo-library-swatch logo-library-swatch-secondary" style="background:{~D:Record.SecondaryColor~};" title="Secondary {~D:Record.SecondaryHue~}°"></span>
	<span class="logo-library-name">{~D:Record.Name~}</span>
	<span class="logo-library-mono">{~D:Record.Monogram~}</span>
</div>`
			},

			// Detail card.
			{
				Hash: 'Logo-Detail-Inner',
				Template: /*html*/`{~TS:Logo-DetailCard:Record.DetailOpen~}`
			},
			{
				Hash: 'Logo-DetailCard',
				Template: /*html*/`
<div class="logo-detail-card gallery-card">
	<div class="logo-detail-header">
		<h3 class="logo-detail-title">{~D:Record.Name~}</h3>
		<button type="button" class="demo-btn" onclick="_Pict.views['${VIEW_ID}']._closeDetail()">Close</button>
	</div>
	<h4 class="logo-detail-section">Logo variants</h4>
	<div class="logo-detail-matrix">{~TS:Logo-DetailCell:Record.VariantCells~}</div>
	<h4 class="logo-detail-section">Favicon scaling</h4>
	<div class="logo-detail-favmatrix">{~TS:Logo-DetailFavCell:Record.FaviconCells~}</div>
	<div class="logo-detail-info">
		<div>
			<h4 class="logo-detail-section">Brand colors</h4>
			<table class="logo-detail-table">
				<tr><td>Primary hue</td><td>{~D:Record.Brand.Primary.Hue~}°</td></tr>
				<tr><td>Primary · light</td><td><span class="logo-color-swatch" style="background:{~D:Record.Brand.Primary.LightTheme~}"></span><code>{~D:Record.Brand.Primary.LightTheme~}</code></td></tr>
				<tr><td>Primary · dark</td><td><span class="logo-color-swatch" style="background:{~D:Record.Brand.Primary.DarkTheme~}"></span><code>{~D:Record.Brand.Primary.DarkTheme~}</code></td></tr>
				<tr><td>Secondary hue</td><td>{~D:Record.Brand.Secondary.Hue~}°</td></tr>
				<tr><td>Secondary · light</td><td><span class="logo-color-swatch" style="background:{~D:Record.Brand.Secondary.LightTheme~}"></span><code>{~D:Record.Brand.Secondary.LightTheme~}</code></td></tr>
				<tr><td>Secondary · dark</td><td><span class="logo-color-swatch" style="background:{~D:Record.Brand.Secondary.DarkTheme~}"></span><code>{~D:Record.Brand.Secondary.DarkTheme~}</code></td></tr>
			</table>
		</div>
		<div>
			<h4 class="logo-detail-section">Generation knobs</h4>
			<table class="logo-detail-table">
				<tr><td>Monogram</td><td>{~D:Record.Monogram~}</td></tr>
				<tr><td>Frame variant</td><td>#{~D:Record.FrameIndex~}</td></tr>
				<tr><td>Composition</td><td>{~D:Record.CompositionName~} (#{~D:Record.CompositionIndex~})</td></tr>
				<tr><td>Palette</td><td>{~D:Record.ResolvedPalette~}{~NE:Record.IsMix^ <span class="logo-detail-mix-tag">via mix</span>~}</td></tr>
				<tr><td>Hash</td><td><code>{~D:Record.Hash~}</code></td></tr>
			</table>
		</div>
	</div>
	<div class="logo-detail-actions">
		<button type="button" class="demo-btn is-primary" onclick="_Pict.views['${VIEW_ID}']._downloadFaviconSet('{~D:Record.Name~}')">Download favicon set (SVG + 16/32/48/64/180/192/512 px PNG)</button>
	</div>
</div>`
			},
			{
				Hash: 'Logo-DetailCell',
				Template: /*html*/`
<div class="logo-detail-cell {~D:Record.BgClass~}">
	<div class="logo-detail-cell-label">{~D:Record.Label~}</div>
	<div class="logo-detail-cell-svg">{~D:Record.SVG~}</div>
	<div class="logo-detail-cell-actions">
		<button type="button" class="demo-btn" onclick="_Pict.views['${VIEW_ID}']._downloadVariant('{~D:Record.Owner~}', '{~D:Record.Key~}', 'svg')">SVG</button>
		<button type="button" class="demo-btn" onclick="_Pict.views['${VIEW_ID}']._downloadVariant('{~D:Record.Owner~}', '{~D:Record.Key~}', 'png-512')">512 px PNG</button>
	</div>
</div>`
			},
			{
				Hash: 'Logo-DetailFavCell',
				Template: /*html*/`
<div class="logo-detail-fav-cell {~D:Record.BgClass~}">
	<div class="logo-detail-cell-label">{~D:Record.Label~}</div>
	<span class="logo-detail-fav-img" style="width:{~D:Record.Size~}px;height:{~D:Record.Size~}px;display:inline-flex;align-items:center;justify-content:center;"
		data-favicon-target="{~D:Record.Owner~}" data-favicon-tone="{~D:Record.Tone~}" data-favicon-size="{~D:Record.Size~}"></span>
</div>`
			}
		],

		Renderables:
		[
			{
				RenderableHash: 'Logo-Root',
				TemplateHash: 'Logo-Root',
				DestinationAddress: '#' + TARGET_ID,
				RenderMethod: 'replace'
			}
		]
	}
};
