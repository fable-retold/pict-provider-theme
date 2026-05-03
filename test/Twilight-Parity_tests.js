/**
 * Smoke Test: Migration parity for ALL retold-remote themes.
 *
 * For every legacy theme defined in
 *   modules/apps/retold-remote/source/providers/RetoldRemote-ThemeDefinitions.js
 * this test:
 *
 *   1. Loads its compiled bundle from modules/apps/retold-remote/theme/<key>.json
 *   2. Registers + applies it through the new pict-provider-theme runtime
 *      (with a stubbed document)
 *   3. Resolves every legacy `--retold-*` variable through Aliases (var()
 *      indirection) to confirm the value matches the bespoke definition
 *   4. Subscribes an onApply listener and confirms the IconColors block
 *      flows through verbatim — exercising the same dual-payload contract
 *      that the bespoke RetoldRemote-Theme provider delivers to the
 *      RetoldRemote-Icons provider
 *
 * Skips gracefully when run outside the retold monorepo (e.g. when
 * pict-provider-theme is published or installed standalone) and the
 * sibling retold-remote module is not present.
 */
const libAssert = require('assert');
const libFS = require('fs');
const libPath = require('path');
const libFable = require('fable');

const libPictProviderTheme = require('../source/Pict-Provider-Theme.js');

const REMOTE_ROOT = libPath.resolve(__dirname, '..', '..', '..', 'apps', 'retold-remote');
const LEGACY_DEFS_PATH = libPath.join(REMOTE_ROOT, 'source', 'providers', 'RetoldRemote-ThemeDefinitions.js');
const COMPILED_DIR = libPath.join(REMOTE_ROOT, 'theme');

let _legacyDefs = null;
let _skipReason = null;

if (!libFS.existsSync(LEGACY_DEFS_PATH))
{
	_skipReason = 'retold-remote not present at ' + REMOTE_ROOT;
}
else if (!libFS.existsSync(COMPILED_DIR))
{
	_skipReason = 'compiled bundles missing — run `npx pict-theme-build --all themes theme` in retold-remote';
}
else
{
	_legacyDefs = require(LEGACY_DEFS_PATH);
}

function buildStubDocument()
{
	let tmpStyleEl = null;
	let tmpClasses = new Set();
	return {
		documentElement:
		{
			classList:
			{
				add: (c) => tmpClasses.add(c),
				remove: (c) => tmpClasses.delete(c),
				contains: (c) => tmpClasses.has(c)
			}
		},
		head: { appendChild: function (pEl) { tmpStyleEl = pEl; } },
		getElementById: function (pId) { return (tmpStyleEl && tmpStyleEl.id === pId) ? tmpStyleEl : null; },
		createElement: function (pTag) { return { tagName: pTag, id: '', textContent: '' }; },
		_getStyle: () => tmpStyleEl
	};
}

function buildVarMap(pCSS)
{
	let tmpMap = {};
	let tmpRe = /^\s*(--[a-z0-9-]+)\s*:\s*([^;]+);/gim;
	let tmpMatch;
	while ((tmpMatch = tmpRe.exec(pCSS)) !== null)
	{
		tmpMap[tmpMatch[1]] = tmpMatch[2].trim();
	}
	return tmpMap;
}

function resolveAlias(pVarMap, pAliasName)
{
	let tmpValue = pVarMap[pAliasName];
	if (typeof tmpValue === 'undefined') return null;
	let tmpVarRefMatch = /^var\(\s*(--[a-z0-9-]+)\s*\)$/i.exec(tmpValue);
	if (!tmpVarRefMatch) return tmpValue;
	return pVarMap[tmpVarRefMatch[1]];
}

function checkParity(pLegacy)
{
	let tmpBundlePath = libPath.join(COMPILED_DIR, pLegacy.Key + '.json');
	if (!libFS.existsSync(tmpBundlePath)) throw new Error('compiled bundle missing: ' + tmpBundlePath);
	let tmpBundle = JSON.parse(libFS.readFileSync(tmpBundlePath, 'utf8'));

	let tmpFable = new libFable({
		Product: 'ThemeParity',
		LogStreams: [{ streamtype: 'console', level: 'fatal' }]
	});
	let tmpProvider = new libPictProviderTheme(tmpFable, {}, 'TestTheme');
	tmpProvider.pict = { providers: { Theme: tmpProvider }, AppData: {}, CSSMap: null };
	tmpProvider.log = tmpFable.log;

	let tmpDoc = buildStubDocument();
	global.document = tmpDoc;

	let tmpReceivedBundle = null;
	tmpProvider.onApply((pBundle) => { tmpReceivedBundle = pBundle; });

	try
	{
		libAssert.strictEqual(tmpProvider.registerTheme(tmpBundle), true);
		libAssert.strictEqual(tmpProvider.applyTheme(pLegacy.Key), true);

		// 1. CSS variable parity (all --retold-* aliases resolve to legacy values).
		let tmpCSS = tmpDoc._getStyle().textContent;
		let tmpVarMap = buildVarMap(tmpCSS);
		let tmpLegacyVars = pLegacy.Variables || {};
		let tmpKeys = Object.keys(tmpLegacyVars);
		let tmpMissing = [];
		let tmpMismatch = [];
		for (let i = 0; i < tmpKeys.length; i++)
		{
			let tmpName = tmpKeys[i];
			let tmpExpected = tmpLegacyVars[tmpName];
			let tmpResolved = resolveAlias(tmpVarMap, tmpName);
			if (tmpResolved === null) tmpMissing.push(tmpName);
			else if (tmpResolved !== tmpExpected) tmpMismatch.push(tmpName + ' expected=' + tmpExpected + ' got=' + tmpResolved);
		}
		if (tmpMissing.length > 0 || tmpMismatch.length > 0)
		{
			let tmpMsg = '[' + pLegacy.Key + ']';
			if (tmpMissing.length > 0) tmpMsg += '\n  MISSING: ' + tmpMissing.join(', ');
			if (tmpMismatch.length > 0) tmpMsg += '\n  MISMATCH:\n    ' + tmpMismatch.join('\n    ');
			throw new Error(tmpMsg);
		}

		// 2. IconColors parity (delivered to subscribers via onApply).
		let tmpExpectedIcons = pLegacy.IconColors || {};
		libAssert.ok(tmpReceivedBundle, 'onApply listener never fired for ' + pLegacy.Key);
		let tmpDeliveredIcons = tmpReceivedBundle.IconColors || {};
		let tmpIconKeys = Object.keys(tmpExpectedIcons);
		for (let i = 0; i < tmpIconKeys.length; i++)
		{
			let tmpRole = tmpIconKeys[i];
			libAssert.strictEqual(tmpDeliveredIcons[tmpRole], tmpExpectedIcons[tmpRole],
				'[' + pLegacy.Key + '] IconColors.' + tmpRole + ' parity');
		}

		return tmpKeys.length;
	}
	finally
	{
		delete global.document;
	}
}

suite
(
	'Theme Parity (retold-remote migration: all themes)',
	() =>
	{
		if (_skipReason)
		{
			test('all-theme parity (skipped)', (fDone) =>
			{
				console.log('  skipped: ' + _skipReason);
				fDone();
			});
			return;
		}

		// Build a parametrized test per legacy theme entry.
		_legacyDefs.forEach((pLegacy) =>
		{
			test('parity: ' + pLegacy.Key + ' (' + pLegacy.Name + ')', (fDone) =>
			{
				let tmpVarCount = checkParity(pLegacy);
				console.log('  ' + pLegacy.Key + ': ' + tmpVarCount + ' --retold-* vars + IconColors verified.');
				fDone();
			});
		});
	}
);
