/**
 * Playground Layout View — top-level shell.
 *
 * Provides the 3-column shell + per-section destination divs.  After
 * render, wires the chrome (theme picker, mode buttons, export, theme
 * editor inputs) and the section nav.
 */
const libPictView = require('pict-view');

const STARTER_THEMES = ['playground-starter', 'playground-corp'];

class PictViewPlaygroundLayout extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this._activeBundle = null;
		this._activeHash = null;
		this._renderedSectionIds = new Set();
		this._initialBootDone = false;
	}

	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		// Inject all view CSS into the document — required so section CSS
		// (registered via auto-CSS during their init) actually lands.
		this.pict.CSSMap.injectCSS();

		if (!this._initialBootDone)
		{
			this._initialBootDone = true;
			this._bootChromeAndRoutes();
		}

		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}

	// ============================================================
	// Boot
	// ============================================================

	async _bootChromeAndRoutes()
	{
		await this._loadStarterThemes();
		this._wireHeaderControls();
		this._wireImageDrop();
		this._buildNav();
		this._wireRoutes();

		if (this._activeHash)
		{
			this._setActive(this._activeHash, 'system');
		}

		// Honor a deep-linked hash if present, otherwise land on welcome.
		let tmpRouter = this.pict.providers['Pict-Router'];
		if (!tmpRouter.navigateCurrent())
		{
			tmpRouter.navigate('/section/welcome');
		}
	}

	async _loadStarterThemes()
	{
		let tmpProvider = this.pict.providers['Theme'];
		let tmpSelect = document.getElementById('pg-theme-select');
		let tmpFirst = null;
		for (let i = 0; i < STARTER_THEMES.length; i++)
		{
			try
			{
				let tmpResp = await fetch('themes/' + STARTER_THEMES[i] + '.json');
				let tmpBundle = await tmpResp.json();
				tmpProvider.registerTheme(tmpBundle);
				let tmpOpt = document.createElement('option');
				tmpOpt.value = tmpBundle.Hash;
				tmpOpt.textContent = tmpBundle.Name || tmpBundle.Hash;
				tmpSelect.appendChild(tmpOpt);
				if (i === 0) tmpFirst = tmpBundle.Hash;
			}
			catch (pErr)
			{
				this.log.warn('Playground layout: failed to load starter theme ' + STARTER_THEMES[i] + ': ' + pErr.message);
			}
		}

		// External theme injection — used by pict-theme-screenshot and any
		// other tool that wants to preview a specific bundle.  ?themeUrl=<url>
		// fetches and registers a single bundle and makes it the initial
		// active theme.
		let tmpExternal = this._readQueryParam('themeUrl');
		if (tmpExternal)
		{
			try
			{
				let tmpResp = await fetch(tmpExternal);
				let tmpBundle = await tmpResp.json();
				tmpProvider.registerTheme(tmpBundle);
				let tmpOpt = document.createElement('option');
				tmpOpt.value = tmpBundle.Hash;
				tmpOpt.textContent = (tmpBundle.Name || tmpBundle.Hash) + ' (external)';
				tmpSelect.appendChild(tmpOpt);
				tmpSelect.value = tmpBundle.Hash;
				tmpFirst = tmpBundle.Hash;
			}
			catch (pErr)
			{
				this.log.warn('Playground layout: failed to load external theme [' + tmpExternal + ']: ' + pErr.message);
			}
		}

		this._activeHash = tmpFirst;
	}

	_readQueryParam(pName)
	{
		try { return new URLSearchParams(window.location.search).get(pName); }
		catch (pErr) { return null; }
	}

	// ============================================================
	// Chrome (header controls)
	// ============================================================

	_wireHeaderControls()
	{
		document.getElementById('pg-theme-select').addEventListener('change', (pEvt) =>
		{
			let tmpMode = (this.pict.providers['Theme'].getActiveTheme().Mode) || 'system';
			this._setActive(pEvt.target.value, tmpMode);
		});

		document.querySelectorAll('.pg-mode-button').forEach((pBtn) =>
		{
			pBtn.addEventListener('click', () =>
			{
				let tmpMode = pBtn.dataset.mode;
				this.pict.providers['Theme'].setMode(tmpMode);
				this._updateModeButtons(tmpMode);
			});
		});

		document.getElementById('pg-export').addEventListener('click', () => this._exportBundle());
	}

	_updateModeButtons(pMode)
	{
		document.querySelectorAll('.pg-mode-button').forEach((pBtn) =>
		{
			pBtn.classList.toggle('is-active', pBtn.dataset.mode === pMode);
		});
	}

	// ============================================================
	// Theme application + working bundle
	// ============================================================

	_setActive(pHash, pMode)
	{
		let tmpProvider = this.pict.providers['Theme'];
		this._activeHash = pHash;
		// Working copy so token edits don't mutate the registered original.
		this._activeBundle = JSON.parse(JSON.stringify(tmpProvider.getTheme(pHash)));
		tmpProvider.registerTheme(this._activeBundle);
		tmpProvider.applyTheme(pHash, pMode);

		this._updateModeButtons(pMode);
		this._renderTokenEditor();
		this._renderCSSEditor();
		this._renderImagePreviews();
		this._updateBrandUI();
	}

	_reapply()
	{
		let tmpProvider = this.pict.providers['Theme'];
		tmpProvider.registerTheme(this._activeBundle);
		let tmpMode = (tmpProvider.getActiveTheme().Mode) || (this._activeBundle.Modes && this._activeBundle.Modes.Default) || 'light';
		tmpProvider.applyTheme(this._activeHash, tmpMode);
		this._updateBrandUI();
	}

	// ============================================================
	// Section nav + routing
	// ============================================================

	_buildNav()
	{
		let tmpRegistry = this.pict.AppData.Playground.SectionRegistry;
		let tmpNav = document.getElementById('pg-nav');
		let tmpStage = document.getElementById('pg-stage');

		let tmpGroups = {};
		let tmpGroupOrder = [];
		for (let i = 0; i < tmpRegistry.length; i++)
		{
			let tmpEntry = tmpRegistry[i];
			if (!tmpGroups[tmpEntry.group])
			{
				tmpGroups[tmpEntry.group] = [];
				tmpGroupOrder.push(tmpEntry.group);
			}
			tmpGroups[tmpEntry.group].push(tmpEntry);

			// Pre-create each section's destination div in the stage so view
			// renderables have something to target.  display:none until nav
			// reveals it.
			let tmpPanel = document.createElement('div');
			tmpPanel.className = 'pg-section-panel';
			tmpPanel.id = 'pg-section-' + tmpEntry.id;
			tmpPanel.style.display = 'none';
			let tmpInner = document.createElement('div');
			tmpInner.id = tmpEntry.DestinationId || ('Playground-Section-' + tmpEntry.id + '-Destination');
			tmpPanel.appendChild(tmpInner);
			tmpStage.appendChild(tmpPanel);
		}

		tmpNav.innerHTML = '';
		for (let g = 0; g < tmpGroupOrder.length; g++)
		{
			let tmpGroupName = tmpGroupOrder[g];
			let tmpHeader = document.createElement('div');
			tmpHeader.className = 'pg-nav-group';
			tmpHeader.textContent = tmpGroupName;
			tmpNav.appendChild(tmpHeader);

			let tmpItems = tmpGroups[tmpGroupName];
			for (let i = 0; i < tmpItems.length; i++)
			{
				let tmpEntry = tmpItems[i];
				let tmpBtn = document.createElement('button');
				tmpBtn.className = 'pg-nav-item';
				tmpBtn.dataset.sectionId = tmpEntry.id;
				tmpBtn.textContent = tmpEntry.name;
				tmpBtn.addEventListener('click', () =>
				{
					this.pict.providers['Pict-Router'].navigate('/section/' + tmpEntry.id);
				});
				tmpNav.appendChild(tmpBtn);
			}
		}
	}

	_highlightNav(pSectionId)
	{
		document.querySelectorAll('.pg-nav-item').forEach((pBtn) =>
		{
			pBtn.classList.toggle('is-active', pBtn.dataset.sectionId === pSectionId);
		});
	}

	_wireRoutes()
	{
		let tmpRouter = this.pict.providers['Pict-Router'];
		let tmpRegistry = this.pict.AppData.Playground.SectionRegistry;
		for (let i = 0; i < tmpRegistry.length; i++)
		{
			let tmpEntry = tmpRegistry[i];
			tmpRouter.addRoute('/section/' + tmpEntry.id, () => this._dispatchSection(tmpEntry.id));
		}
		tmpRouter.addRoute('/', () => this._dispatchSection('welcome'));
	}

	_dispatchSection(pSectionId)
	{
		let tmpRegistry = this.pict.AppData.Playground.SectionRegistry;
		let tmpEntry = tmpRegistry.find((e) => e.id === pSectionId) || tmpRegistry[0];

		// Show the active panel, hide others.
		document.querySelectorAll('.pg-section-panel').forEach((pEl) =>
		{
			pEl.style.display = (pEl.id === 'pg-section-' + tmpEntry.id) ? 'block' : 'none';
		});
		this._highlightNav(tmpEntry.id);

		// Render the section's view exactly once (init has already happened
		// at app boot via the addView lifecycle; render() paints the DOM).
		if (!this._renderedSectionIds.has(tmpEntry.id))
		{
			this._renderedSectionIds.add(tmpEntry.id);
			let tmpView = tmpEntry.ViewIdentifier ? this.pict.views[tmpEntry.ViewIdentifier] : null;
			if (tmpView)
			{
				try { tmpView.render(); }
				catch (pErr)
				{
					let tmpDest = document.getElementById(tmpEntry.DestinationId || ('Playground-Section-' + tmpEntry.id + '-Destination'));
					if (tmpDest)
					{
						tmpDest.innerHTML =
							'<p style="color: var(--theme-color-status-warning);">Render failed: ' + pErr.message + '</p>';
					}
				}
			}
		}

		// Section-specific post-render hook (e.g. layout refresh on re-show).
		if (typeof tmpEntry.onShow === 'function')
		{
			try { tmpEntry.onShow(this.pict); }
			catch (pErr)
			{
				this.log.warn('Playground: onShow for section [' + tmpEntry.id + '] threw: ' + pErr.message);
			}
		}

		// Update brand UI in case a section's render replaced the brand mark.
		this._updateBrandUI();
	}

	// ============================================================
	// Token editor
	// ============================================================

	_renderTokenEditor()
	{
		let tmpEl = document.getElementById('pg-token-editor');
		tmpEl.innerHTML = '';
		let tmpFlat = this._flattenTokens(this._activeBundle.Tokens || {}, '');
		for (let i = 0; i < tmpFlat.length; i++)
		{
			tmpEl.appendChild(this._buildTokenRow(tmpFlat[i].Path, tmpFlat[i].Value));
		}
	}

	_buildTokenRow(pPath, pValue)
	{
		let tmpRow = document.createElement('div');
		tmpRow.className = 'pg-token';
		let tmpLabel = document.createElement('span');
		tmpLabel.className = 'pg-token-label';
		tmpLabel.title = pPath;
		tmpLabel.textContent = pPath;
		tmpRow.appendChild(tmpLabel);

		if (this._isPaired(pValue))
		{
			let tmpModeWrap = document.createElement('div');
			tmpModeWrap.className = 'pg-token-mode';
			tmpModeWrap.appendChild(this._buildValueInput(pPath, pValue.Light, 'Light'));
			tmpModeWrap.appendChild(this._buildValueInput(pPath, pValue.Dark, 'Dark'));
			tmpRow.appendChild(tmpModeWrap);
		}
		else
		{
			tmpRow.appendChild(this._buildValueInput(pPath, pValue, null));
		}
		return tmpRow;
	}

	_buildValueInput(pPath, pValue, pModeKey)
	{
		let tmpSelf = this;
		let tmpWrap = document.createElement('span');
		tmpWrap.style.display = 'inline-flex';
		tmpWrap.style.alignItems = 'center';
		tmpWrap.style.gap = '4px';

		let tmpText = document.createElement('input');
		tmpText.type = 'text';
		tmpText.className = 'pg-token-input';
		tmpText.value = pValue == null ? '' : String(pValue);

		if (this._looksLikeColor(pValue))
		{
			let tmpColor = document.createElement('input');
			tmpColor.type = 'color';
			tmpColor.className = 'pg-token-color';
			tmpColor.value = this._normalizeColorForPicker(pValue);
			tmpColor.addEventListener('input', () =>
			{
				tmpText.value = tmpColor.value;
				commit(tmpText.value);
			});
			tmpWrap.appendChild(tmpColor);
		}

		tmpText.addEventListener('change', () => commit(tmpText.value));
		tmpWrap.appendChild(tmpText);

		function commit(pNew)
		{
			if (pModeKey)
			{
				let tmpExisting = tmpSelf._walkPath(tmpSelf._activeBundle.Tokens, pPath);
				if (!tmpSelf._isPaired(tmpExisting))
				{
					tmpExisting = { Light: tmpExisting, Dark: tmpExisting };
				}
				tmpExisting[pModeKey] = pNew;
				tmpSelf._setAtPath(tmpSelf._activeBundle.Tokens, pPath, tmpExisting);
			}
			else
			{
				tmpSelf._setAtPath(tmpSelf._activeBundle.Tokens, pPath, pNew);
			}
			tmpSelf._reapply();
		}

		return tmpWrap;
	}

	// ============================================================
	// CSS editor
	// ============================================================

	_renderCSSEditor()
	{
		let tmpTA = document.getElementById('pg-css-editor');
		let tmpCSS = (this._activeBundle.CSS && this._activeBundle.CSS[0] && this._activeBundle.CSS[0].Content) || '';
		tmpTA.value = tmpCSS;

		tmpTA.oninput = () =>
		{
			if (!this._activeBundle.CSS || this._activeBundle.CSS.length === 0)
			{
				this._activeBundle.CSS = [{ Hash: this._activeBundle.Hash + '-aux', Content: '', Priority: 600 }];
			}
			this._activeBundle.CSS[0].Content = tmpTA.value;
			this._reapply();
		};
	}

	// ============================================================
	// Image upload
	// ============================================================

	_wireImageDrop()
	{
		let tmpDZ = document.getElementById('pg-dropzone');
		let tmpInput = document.getElementById('pg-file-input');
		let tmpSelf = this;

		tmpDZ.addEventListener('click', () => tmpInput.click());
		tmpInput.addEventListener('change', (pEvt) => this._acceptFiles(pEvt.target.files));

		['dragenter', 'dragover'].forEach((pEvt) =>
		{
			tmpDZ.addEventListener(pEvt, (pE) => { pE.preventDefault(); tmpDZ.classList.add('is-hover'); });
		});
		['dragleave', 'drop'].forEach((pEvt) =>
		{
			tmpDZ.addEventListener(pEvt, (pE) => { pE.preventDefault(); tmpDZ.classList.remove('is-hover'); });
		});
		tmpDZ.addEventListener('drop', (pEvt) => tmpSelf._acceptFiles(pEvt.dataTransfer.files));
	}

	_acceptFiles(pFileList)
	{
		if (!pFileList || pFileList.length === 0) return;
		let tmpSelf = this;
		for (let i = 0; i < pFileList.length; i++)
		{
			let tmpFile = pFileList[i];
			let tmpReader = new FileReader();
			tmpReader.onload = () =>
			{
				let tmpKey = tmpSelf._pascalize(tmpSelf._stripExt(tmpFile.name));
				if (!tmpSelf._activeBundle.Image) tmpSelf._activeBundle.Image = {};
				tmpSelf._activeBundle.Image[tmpKey] = tmpReader.result;
				tmpSelf._renderImagePreviews();
				tmpSelf._updateBrandUI();
			};
			tmpReader.readAsDataURL(tmpFile);
		}
	}

	_renderImagePreviews()
	{
		let tmpEl = document.getElementById('pg-image-preview');
		tmpEl.innerHTML = '';
		let tmpImage = this._activeBundle.Image || {};
		Object.keys(tmpImage).forEach((pKey) =>
		{
			let tmpImg = document.createElement('img');
			tmpImg.src = tmpImage[pKey];
			tmpImg.title = pKey;
			tmpEl.appendChild(tmpImg);
		});
	}

	_updateBrandUI()
	{
		let tmpLogoEl = document.getElementById('demo-brand-logo');
		let tmpNameEl = document.getElementById('demo-brand-name');
		if (!tmpLogoEl) return;
		let tmpImage = this._activeBundle.Image || {};
		let tmpLogoKey = tmpImage.Logo ? 'Logo' : (Object.keys(tmpImage)[0] || null);
		if (tmpLogoKey)
		{
			tmpLogoEl.innerHTML = '';
			let tmpImg = document.createElement('img');
			tmpImg.src = tmpImage[tmpLogoKey];
			tmpLogoEl.appendChild(tmpImg);
		}
		else
		{
			let tmpName = (this._activeBundle.Brand && this._activeBundle.Brand.Name) || '?';
			tmpLogoEl.innerHTML = '';
			tmpLogoEl.textContent = tmpName.substring(0, 1).toUpperCase();
		}
		if (tmpNameEl && this._activeBundle.Brand && this._activeBundle.Brand.Name)
		{
			tmpNameEl.textContent = this._activeBundle.Brand.Name;
		}
	}

	// ============================================================
	// Export
	// ============================================================

	_exportBundle()
	{
		let tmpJSON = JSON.stringify(this._activeBundle, null, '\t');
		let tmpBlob = new Blob([tmpJSON], { type: 'application/json' });
		let tmpURL = URL.createObjectURL(tmpBlob);
		let tmpA = document.createElement('a');
		tmpA.href = tmpURL;
		tmpA.download = (this._activeBundle.Hash || 'theme') + '.json';
		document.body.appendChild(tmpA);
		tmpA.click();
		document.body.removeChild(tmpA);
		setTimeout(() => URL.revokeObjectURL(tmpURL), 0);
	}

	// ============================================================
	// Helpers
	// ============================================================

	_flattenTokens(pNode, pPathPrefix)
	{
		let tmpResults = [];
		if (pNode === null || typeof pNode !== 'object' || Array.isArray(pNode))
		{
			if (pPathPrefix) tmpResults.push({ Path: pPathPrefix, Value: pNode });
			return tmpResults;
		}
		if (this._isPaired(pNode))
		{
			tmpResults.push({ Path: pPathPrefix, Value: pNode });
			return tmpResults;
		}
		Object.keys(pNode).forEach((pKey) =>
		{
			let tmpChildPath = pPathPrefix ? (pPathPrefix + '.' + pKey) : pKey;
			tmpResults = tmpResults.concat(this._flattenTokens(pNode[pKey], tmpChildPath));
		});
		return tmpResults;
	}

	_isPaired(pValue)
	{
		return pValue !== null
			&& typeof pValue === 'object'
			&& !Array.isArray(pValue)
			&& Object.keys(pValue).length > 0
			&& Object.keys(pValue).every((k) => k === 'Light' || k === 'Dark');
	}

	_looksLikeColor(pValue)
	{
		if (typeof pValue !== 'string') return false;
		if (/^#[0-9a-f]{3,8}$/i.test(pValue)) return true;
		if (/^rgb/i.test(pValue)) return true;
		return false;
	}

	_normalizeColorForPicker(pValue)
	{
		if (typeof pValue !== 'string') return '#000000';
		if (/^#[0-9a-f]{6}$/i.test(pValue)) return pValue;
		if (/^#[0-9a-f]{3}$/i.test(pValue))
		{
			return '#' + pValue[1] + pValue[1] + pValue[2] + pValue[2] + pValue[3] + pValue[3];
		}
		return '#000000';
	}

	_walkPath(pRoot, pPath)
	{
		let tmpSegments = pPath.split('.');
		let tmpNode = pRoot;
		for (let i = 0; i < tmpSegments.length; i++)
		{
			if (tmpNode === null || typeof tmpNode !== 'object') return null;
			tmpNode = tmpNode[tmpSegments[i]];
			if (typeof tmpNode === 'undefined') return null;
		}
		return tmpNode;
	}

	_setAtPath(pRoot, pPath, pValue)
	{
		let tmpSegments = pPath.split('.');
		let tmpNode = pRoot;
		for (let i = 0; i < tmpSegments.length - 1; i++)
		{
			let tmpKey = tmpSegments[i];
			if (!tmpNode[tmpKey] || typeof tmpNode[tmpKey] !== 'object') tmpNode[tmpKey] = {};
			tmpNode = tmpNode[tmpKey];
		}
		tmpNode[tmpSegments[tmpSegments.length - 1]] = pValue;
	}

	_stripExt(pName)
	{
		let tmpDot = pName.lastIndexOf('.');
		return (tmpDot > 0) ? pName.substring(0, tmpDot) : pName;
	}

	_pascalize(pName)
	{
		let tmpParts = String(pName).split(/[\s\-_.]+/).filter((p) => p.length > 0);
		if (tmpParts.length === 0) return pName;
		return tmpParts.map((p) => p.charAt(0).toUpperCase() + p.substring(1)).join('');
	}
}

module.exports = PictViewPlaygroundLayout;

module.exports.default_configuration =
{
	ViewIdentifier: 'Playground-Layout',

	DefaultRenderable: 'Playground-Shell',
	DefaultDestinationAddress: '#Playground-Application-Container',

	AutoRender: false,

	Templates:
	[
		{
			Hash: 'Playground-Shell',
			Template: /*html*/`
<div class="pg-shell">
	<div class="pg-header">
		<div class="pg-header-title">pict-provider-theme Playground</div>
		<div class="pg-header-controls">
			<span class="pg-control-label">Theme</span>
			<select id="pg-theme-select" class="pg-select"></select>
			<span class="pg-control-label">Mode</span>
			<button class="pg-mode-button" data-mode="light">Light</button>
			<button class="pg-mode-button" data-mode="dark">Dark</button>
			<button class="pg-mode-button" data-mode="system">System</button>
			<button id="pg-export" class="pg-export-button">Export bundle</button>
		</div>
	</div>
	<nav id="pg-nav" class="pg-nav" aria-label="Sections"></nav>
	<main id="pg-stage" class="pg-stage"></main>
	<aside class="pg-side">
		<div class="pg-section">
			<div class="pg-section-header">Tokens</div>
			<div id="pg-token-editor" class="pg-section-body"></div>
		</div>
		<div class="pg-section">
			<div class="pg-section-header">Auxiliary CSS</div>
			<div class="pg-section-body">
				<textarea id="pg-css-editor" class="pg-cssedit-textarea" placeholder="/* CSS that travels with the theme. */"></textarea>
			</div>
		</div>
		<div class="pg-section">
			<div class="pg-section-header">Imagery</div>
			<div class="pg-section-body">
				<div id="pg-dropzone" class="pg-dropzone">
					Drop logo / favicon images here<br>
					<small>(or click to choose)</small>
					<input id="pg-file-input" type="file" multiple accept="image/*" style="display:none">
				</div>
				<div id="pg-image-preview" class="pg-image-preview"></div>
			</div>
		</div>
	</aside>
</div>`
		}
	],

	Renderables:
	[
		{
			RenderableHash: 'Playground-Shell',
			TemplateHash: 'Playground-Shell',
			DestinationAddress: '#Playground-Application-Container',
			RenderMethod: 'replace'
		}
	]
};
