/**
 * pict-provider-theme Playground — entry script.
 *
 * Wires:
 *   - Pict instance + pict-router (hash-based, via Navigo)
 *   - pict-provider-theme runtime
 *   - Section registry (sections/_registry.js) — built into the left rail,
 *     each entry gets a route at #/section/<id>
 *   - Theme editor on the right column (tokens / aux CSS / imagery)
 *   - Theme picker + mode toggle + export in the top header
 */
const libPict = require('pict');
const libPictRouter = require('pict-router');
const libPictProviderTheme = require('pict-provider-theme');

const _Sections = require('./sections/_registry.js');

const STARTER_THEMES = ['playground-starter', 'playground-corp'];

// ============================================================
// Pict + provider bootstrap
// ============================================================

let _pict = new libPict({
	Product: 'Playground',
	LogStreams: [{ streamtype: 'console', level: 'fatal' }],
	// Skip auto-resolve so addRoute() doesn't trigger before the section
	// dispatcher and DOM are ready.  We resolve manually after all routes
	// are added.
	RouterSkipRouteResolveOnAdd: true
});
window.pict = _pict;

_pict.addProvider('Pict-Router', libPictRouter.default_configuration, libPictRouter);
let _router = _pict.providers['Pict-Router'];

// Register every live section's view at boot.  Stub sections are no-ops.
for (let i = 0; i < _Sections.length; i++)
{
	try { _Sections[i].register(_pict); }
	catch (pError)
	{
		console.warn('Playground: section ' + _Sections[i].id + ' register() threw:', pError);
	}
}

let _provider = new libPictProviderTheme(_pict, {}, 'PlaygroundTheme');
_provider.pict = _pict;
if (!_pict.providers) _pict.providers = {};
_pict.providers['Theme'] = _provider;

// ============================================================
// State
// ============================================================

let _activeHash = null;
let _activeBundle = null;
let _activeSectionId = null;

// ============================================================
// Boot
// ============================================================

async function boot()
{
	let tmpThemeSelect = document.getElementById('pg-theme-select');
	let tmpFirstHash = null;
	for (let i = 0; i < STARTER_THEMES.length; i++)
	{
		try
		{
			let tmpResp = await fetch('themes/' + STARTER_THEMES[i] + '.json');
			let tmpBundle = await tmpResp.json();
			_provider.registerTheme(tmpBundle);
			let tmpOpt = document.createElement('option');
			tmpOpt.value = tmpBundle.Hash;
			tmpOpt.textContent = tmpBundle.Name || tmpBundle.Hash;
			tmpThemeSelect.appendChild(tmpOpt);
			if (i === 0) tmpFirstHash = tmpBundle.Hash;
		}
		catch (pError)
		{
			console.warn('Playground: failed to load starter ' + STARTER_THEMES[i], pError);
		}
	}

	if (!tmpFirstHash)
	{
		document.getElementById('pg-stage').textContent = 'Playground: no starter themes loaded.';
		return;
	}

	wireHeaderControls();
	wireImageDrop();
	buildNav();
	wireRoutes();
	setActive(tmpFirstHash, 'system');

	// Honor a deep-linked hash if present, otherwise land on welcome.
	if (!_router.navigateCurrent())
	{
		_router.navigate('/section/welcome');
	}
}

// ============================================================
// Section nav
// ============================================================

function buildNav()
{
	let tmpNav = document.getElementById('pg-nav');
	let tmpGroups = {};
	let tmpGroupOrder = [];
	for (let i = 0; i < _Sections.length; i++)
	{
		let tmpSec = _Sections[i];
		if (!tmpGroups[tmpSec.group])
		{
			tmpGroups[tmpSec.group] = [];
			tmpGroupOrder.push(tmpSec.group);
		}
		tmpGroups[tmpSec.group].push(tmpSec);
	}

	tmpNav.innerHTML = '';
	for (let g = 0; g < tmpGroupOrder.length; g++)
	{
		let tmpGroupName = tmpGroupOrder[g];
		let tmpGroupEl = document.createElement('div');
		tmpGroupEl.className = 'pg-nav-group';
		tmpGroupEl.textContent = tmpGroupName;
		tmpNav.appendChild(tmpGroupEl);

		let tmpItems = tmpGroups[tmpGroupName];
		for (let i = 0; i < tmpItems.length; i++)
		{
			let tmpSec = tmpItems[i];
			let tmpBtn = document.createElement('button');
			tmpBtn.className = 'pg-nav-item';
			tmpBtn.dataset.sectionId = tmpSec.id;
			tmpBtn.innerHTML = tmpSec.name +
				(tmpSec.status === 'stub' ? ' <span class="pg-nav-stub">(stub)</span>' : '');
			tmpBtn.addEventListener('click', () =>
			{
				_router.navigate('/section/' + tmpSec.id);
			});
			tmpNav.appendChild(tmpBtn);
		}
	}
}

function highlightNav(pSectionId)
{
	let tmpItems = document.querySelectorAll('.pg-nav-item');
	for (let i = 0; i < tmpItems.length; i++)
	{
		tmpItems[i].classList.toggle('is-active', tmpItems[i].dataset.sectionId === pSectionId);
	}
}

function wireRoutes()
{
	for (let i = 0; i < _Sections.length; i++)
	{
		let tmpSec = _Sections[i];
		_router.addRoute('/section/' + tmpSec.id, () => dispatchSection(tmpSec.id));
	}
	// Convenience: bare # or empty hash → welcome
	_router.addRoute('/', () => dispatchSection('welcome'));
}

function dispatchSection(pSectionId)
{
	let tmpSec = null;
	for (let i = 0; i < _Sections.length; i++)
	{
		if (_Sections[i].id === pSectionId) { tmpSec = _Sections[i]; break; }
	}
	if (!tmpSec) tmpSec = _Sections[0];

	_activeSectionId = tmpSec.id;
	highlightNav(tmpSec.id);

	let tmpStage = document.getElementById('pg-stage');
	tmpStage.innerHTML = '';
	try { tmpSec.render(tmpStage, _pict); }
	catch (pError)
	{
		tmpStage.innerHTML = '<pre style="color:var(--theme-color-status-error);white-space:pre-wrap;">'
			+ 'Section render error: ' + (pError && pError.message) + '</pre>';
	}

	// Re-apply brand UI in case base-components re-mounts the brand mark.
	updateBrandUI();
}

// ============================================================
// Theme application + bundle mutation
// ============================================================

function setActive(pHash, pMode)
{
	_activeHash = pHash;
	let tmpRegistered = _provider.getTheme(pHash);
	_activeBundle = JSON.parse(JSON.stringify(tmpRegistered));
	_provider.registerTheme(_activeBundle);
	_provider.applyTheme(pHash, pMode);

	updateModeButtons(pMode);
	renderTokenEditor();
	renderCSSEditor();
	renderImagePreviews();
	updateBrandUI();
}

function reapply()
{
	_provider.registerTheme(_activeBundle);
	_provider.applyTheme(_activeHash, _provider.getActiveTheme().Mode || _activeBundle.Modes.Default);
	updateBrandUI();
}

// ============================================================
// Header controls
// ============================================================

function wireHeaderControls()
{
	document.getElementById('pg-theme-select').addEventListener('change', (pEvt) =>
	{
		let tmpMode = _provider.getActiveTheme().Mode || _activeBundle.Modes.Default;
		setActive(pEvt.target.value, tmpMode);
	});

	document.querySelectorAll('.pg-mode-button').forEach((pBtn) =>
	{
		pBtn.addEventListener('click', () =>
		{
			let tmpMode = pBtn.dataset.mode;
			_provider.setMode(tmpMode);
			updateModeButtons(tmpMode);
		});
	});

	document.getElementById('pg-export').addEventListener('click', exportBundle);
}

function updateModeButtons(pMode)
{
	document.querySelectorAll('.pg-mode-button').forEach((pBtn) =>
	{
		pBtn.classList.toggle('is-active', pBtn.dataset.mode === pMode);
	});
}

// ============================================================
// Token editor
// ============================================================

function renderTokenEditor()
{
	let tmpEl = document.getElementById('pg-token-editor');
	tmpEl.innerHTML = '';
	let tmpFlat = flattenTokens(_activeBundle.Tokens || {}, '');
	for (let i = 0; i < tmpFlat.length; i++)
	{
		let tmpEntry = tmpFlat[i];
		tmpEl.appendChild(buildTokenRow(tmpEntry.Path, tmpEntry.Value));
	}
}

function buildTokenRow(pPath, pValue)
{
	let tmpRow = document.createElement('div');
	tmpRow.className = 'pg-token';
	let tmpLabel = document.createElement('span');
	tmpLabel.className = 'pg-token-label';
	tmpLabel.title = pPath;
	tmpLabel.textContent = pPath;
	tmpRow.appendChild(tmpLabel);

	if (isPaired(pValue))
	{
		let tmpModeWrap = document.createElement('div');
		tmpModeWrap.className = 'pg-token-mode';
		tmpModeWrap.appendChild(buildValueInput(pPath, pValue.Light, 'Light'));
		tmpModeWrap.appendChild(buildValueInput(pPath, pValue.Dark, 'Dark'));
		tmpRow.appendChild(tmpModeWrap);
	}
	else
	{
		tmpRow.appendChild(buildValueInput(pPath, pValue, null));
	}
	return tmpRow;
}

function buildValueInput(pPath, pValue, pModeKey)
{
	let tmpWrap = document.createElement('span');
	tmpWrap.style.display = 'inline-flex';
	tmpWrap.style.alignItems = 'center';
	tmpWrap.style.gap = '4px';

	let tmpIsColor = looksLikeColor(pValue);
	let tmpText = document.createElement('input');
	tmpText.type = 'text';
	tmpText.className = 'pg-token-input';
	tmpText.value = pValue == null ? '' : String(pValue);

	if (tmpIsColor)
	{
		let tmpColor = document.createElement('input');
		tmpColor.type = 'color';
		tmpColor.className = 'pg-token-color';
		tmpColor.value = normalizeColorForPicker(pValue);
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
			let tmpExisting = walkPath(_activeBundle.Tokens, pPath);
			if (!isPaired(tmpExisting))
			{
				tmpExisting = { Light: tmpExisting, Dark: tmpExisting };
			}
			tmpExisting[pModeKey] = pNew;
			setAtPath(_activeBundle.Tokens, pPath, tmpExisting);
		}
		else
		{
			setAtPath(_activeBundle.Tokens, pPath, pNew);
		}
		reapply();
	}

	return tmpWrap;
}

// ============================================================
// CSS editor
// ============================================================

function renderCSSEditor()
{
	let tmpTA = document.getElementById('pg-css-editor');
	let tmpCSS = (_activeBundle.CSS && _activeBundle.CSS[0] && _activeBundle.CSS[0].Content) || '';
	tmpTA.value = tmpCSS;

	tmpTA.oninput = () =>
	{
		if (!_activeBundle.CSS || _activeBundle.CSS.length === 0)
		{
			_activeBundle.CSS = [{ Hash: _activeBundle.Hash + '-aux', Content: '', Priority: 600 }];
		}
		_activeBundle.CSS[0].Content = tmpTA.value;
		reapply();
	};
}

// ============================================================
// Image upload
// ============================================================

function wireImageDrop()
{
	let tmpDZ = document.getElementById('pg-dropzone');
	let tmpInput = document.getElementById('pg-file-input');

	tmpDZ.addEventListener('click', () => tmpInput.click());
	tmpInput.addEventListener('change', (pEvt) => acceptFiles(pEvt.target.files));

	['dragenter', 'dragover'].forEach((pEvt) =>
	{
		tmpDZ.addEventListener(pEvt, (pE) => { pE.preventDefault(); tmpDZ.classList.add('is-hover'); });
	});
	['dragleave', 'drop'].forEach((pEvt) =>
	{
		tmpDZ.addEventListener(pEvt, (pE) => { pE.preventDefault(); tmpDZ.classList.remove('is-hover'); });
	});
	tmpDZ.addEventListener('drop', (pEvt) =>
	{
		acceptFiles(pEvt.dataTransfer.files);
	});
}

function acceptFiles(pFileList)
{
	if (!pFileList || pFileList.length === 0) return;
	for (let i = 0; i < pFileList.length; i++)
	{
		let tmpFile = pFileList[i];
		let tmpReader = new FileReader();
		tmpReader.onload = () =>
		{
			let tmpKey = pascalize(stripExt(tmpFile.name));
			if (!_activeBundle.Image) _activeBundle.Image = {};
			_activeBundle.Image[tmpKey] = tmpReader.result;
			renderImagePreviews();
			updateBrandUI();
		};
		tmpReader.readAsDataURL(tmpFile);
	}
}

function renderImagePreviews()
{
	let tmpEl = document.getElementById('pg-image-preview');
	tmpEl.innerHTML = '';
	let tmpImage = _activeBundle.Image || {};
	let tmpKeys = Object.keys(tmpImage);
	for (let i = 0; i < tmpKeys.length; i++)
	{
		let tmpImg = document.createElement('img');
		tmpImg.src = tmpImage[tmpKeys[i]];
		tmpImg.title = tmpKeys[i];
		tmpEl.appendChild(tmpImg);
	}
}

function updateBrandUI()
{
	let tmpLogoEl = document.getElementById('demo-brand-logo');
	let tmpNameEl = document.getElementById('demo-brand-name');
	if (!tmpLogoEl) return;
	let tmpImage = _activeBundle.Image || {};
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
		let tmpName = (_activeBundle.Brand && _activeBundle.Brand.Name) || '?';
		tmpLogoEl.innerHTML = '';
		tmpLogoEl.textContent = tmpName.substring(0, 1).toUpperCase();
	}
	if (tmpNameEl && _activeBundle.Brand && _activeBundle.Brand.Name)
	{
		tmpNameEl.textContent = _activeBundle.Brand.Name;
	}
}

// ============================================================
// Export
// ============================================================

function exportBundle()
{
	let tmpJSON = JSON.stringify(_activeBundle, null, '\t');
	let tmpBlob = new Blob([tmpJSON], { type: 'application/json' });
	let tmpURL = URL.createObjectURL(tmpBlob);
	let tmpA = document.createElement('a');
	tmpA.href = tmpURL;
	tmpA.download = (_activeBundle.Hash || 'theme') + '.json';
	document.body.appendChild(tmpA);
	tmpA.click();
	document.body.removeChild(tmpA);
	setTimeout(() => URL.revokeObjectURL(tmpURL), 0);
}

// ============================================================
// Helpers
// ============================================================

function flattenTokens(pNode, pPathPrefix)
{
	let tmpResults = [];
	if (pNode === null || typeof pNode !== 'object' || Array.isArray(pNode))
	{
		if (pPathPrefix) tmpResults.push({ Path: pPathPrefix, Value: pNode });
		return tmpResults;
	}
	if (isPaired(pNode))
	{
		tmpResults.push({ Path: pPathPrefix, Value: pNode });
		return tmpResults;
	}
	let tmpKeys = Object.keys(pNode);
	for (let i = 0; i < tmpKeys.length; i++)
	{
		let tmpKey = tmpKeys[i];
		let tmpChildPath = pPathPrefix ? (pPathPrefix + '.' + tmpKey) : tmpKey;
		tmpResults = tmpResults.concat(flattenTokens(pNode[tmpKey], tmpChildPath));
	}
	return tmpResults;
}

function isPaired(pValue)
{
	return pValue !== null
		&& typeof pValue === 'object'
		&& !Array.isArray(pValue)
		&& Object.keys(pValue).length > 0
		&& Object.keys(pValue).every((k) => k === 'Light' || k === 'Dark');
}

function looksLikeColor(pValue)
{
	if (typeof pValue !== 'string') return false;
	if (/^#[0-9a-f]{3,8}$/i.test(pValue)) return true;
	if (/^rgb/i.test(pValue)) return true;
	return false;
}

function normalizeColorForPicker(pValue)
{
	if (typeof pValue !== 'string') return '#000000';
	if (/^#[0-9a-f]{6}$/i.test(pValue)) return pValue;
	if (/^#[0-9a-f]{3}$/i.test(pValue))
	{
		return '#' + pValue[1] + pValue[1] + pValue[2] + pValue[2] + pValue[3] + pValue[3];
	}
	return '#000000';
}

function walkPath(pRoot, pPath)
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

function setAtPath(pRoot, pPath, pValue)
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

function stripExt(pName)
{
	let tmpDot = pName.lastIndexOf('.');
	return (tmpDot > 0) ? pName.substring(0, tmpDot) : pName;
}

function pascalize(pName)
{
	let tmpParts = String(pName).split(/[\s\-_.]+/).filter((p) => p.length > 0);
	if (tmpParts.length === 0) return pName;
	return tmpParts.map((p) => p.charAt(0).toUpperCase() + p.substring(1)).join('');
}

if (document.readyState === 'loading')
{
	document.addEventListener('DOMContentLoaded', boot);
}
else
{
	boot();
}
