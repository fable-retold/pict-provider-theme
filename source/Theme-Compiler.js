/**
 * Pict Theme Compiler
 *
 * Reads an "unrolled" theme folder and emits a single self-contained JSON
 * bundle suitable for the runtime provider's registerTheme().
 *
 * Unrolled folder layout:
 *
 *   themes/<theme-hash>/
 *     manifest.json     required.  At minimum: { Hash, Name, Tokens, Modes }.
 *     css/              optional.  Each .css file becomes a CSS entry.
 *                       Files are added in alphabetical order with
 *                       Priority = 500 + index * 10 unless the manifest's
 *                       CSSManifest array overrides ordering/priority.
 *     svg/              optional.  Each .svg becomes an SVG entry; nested
 *                       subfolders produce nested objects.  File names are
 *                       PascalCased and the .svg extension is stripped.
 *     image/            optional.  Each file becomes a base64 data URL.
 *
 * Manifest fields that the compiler RESPECTS (passed through verbatim into
 * the compiled bundle):
 *   Hash, Name, Version, Description, Comprehensive, BasedOn, Modes,
 *   Tokens, Brand, Aliases
 *
 * Manifest fields that the compiler READS to control compilation:
 *   CSSManifest        Optional array of { File, Priority, Hash? } controlling
 *                      which CSS files (under css/) get emitted, in what order
 *                      and with what priorities.  Files in css/ NOT listed
 *                      here are skipped when CSSManifest is present.
 *   SVG                Optional pre-set map.  Entries here OVERRIDE filesystem
 *                      discovery for the same key path.
 *   Image              Same as SVG — manifest entries override discovery.
 *
 * Compiled bundle output:
 *   <outDir>/<theme-hash>.json
 *
 * Both compileTheme() and compileAllThemes() are pure Node — no pict needed,
 * no DOM needed.  Suitable for CI / GitHub Actions.
 */
const libFS = require('fs');
const libPath = require('path');

const COMPILABLE_VERSION = 1;

const _MimeMap =
{
	'.png':  'image/png',
	'.jpg':  'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.gif':  'image/gif',
	'.webp': 'image/webp',
	'.ico':  'image/x-icon',
	'.svg':  'image/svg+xml'
};

/**
 * Compile a single unrolled theme folder into a bundle object and (optionally)
 * write it to outDir.  Returns the bundle object.
 *
 * @param {string} pSrcDir - path to the unrolled theme folder
 * @param {string} [pOutDir] - if provided, the compiled JSON is written to
 *   `<pOutDir>/<bundle.Hash>.json`
 * @param {object} [pOptions]
 * @param {boolean} [pOptions.Pretty=true] - pretty-print the JSON output
 */
function compileTheme(pSrcDir, pOutDir, pOptions)
{
	let tmpOptions = pOptions || {};
	let tmpPretty = (tmpOptions.Pretty === false) ? false : true;

	if (!libFS.existsSync(pSrcDir) || !libFS.statSync(pSrcDir).isDirectory())
	{
		throw new Error(`compileTheme: source [${pSrcDir}] is not a directory`);
	}

	let tmpManifestPath = libPath.join(pSrcDir, 'manifest.json');
	if (!libFS.existsSync(tmpManifestPath))
	{
		throw new Error(`compileTheme: missing manifest.json in [${pSrcDir}]`);
	}

	let tmpManifest;
	try
	{
		tmpManifest = JSON.parse(libFS.readFileSync(tmpManifestPath, 'utf8'));
	}
	catch (pError)
	{
		throw new Error(`compileTheme: invalid JSON in ${tmpManifestPath}: ${pError.message}`);
	}

	if (!tmpManifest || typeof tmpManifest !== 'object')
	{
		throw new Error(`compileTheme: ${tmpManifestPath} did not parse to an object`);
	}
	if (!tmpManifest.Hash || typeof tmpManifest.Hash !== 'string')
	{
		throw new Error(`compileTheme: manifest in [${pSrcDir}] missing required string Hash`);
	}

	let tmpBundle = _passthroughManifestFields(tmpManifest);

	tmpBundle.CSS = _collectCSS(pSrcDir, tmpManifest);
	tmpBundle.SVG = _collectSVG(pSrcDir, tmpManifest);
	tmpBundle.Image = _collectImages(pSrcDir, tmpManifest);

	tmpBundle.CompiledAt = new Date().toISOString();
	tmpBundle.CompilerVersion = COMPILABLE_VERSION;

	if (pOutDir)
	{
		if (!libFS.existsSync(pOutDir))
		{
			libFS.mkdirSync(pOutDir, { recursive: true });
		}
		let tmpOutPath = libPath.join(pOutDir, tmpBundle.Hash + '.json');
		let tmpJSON = tmpPretty
			? JSON.stringify(tmpBundle, null, '\t')
			: JSON.stringify(tmpBundle);
		libFS.writeFileSync(tmpOutPath, tmpJSON, 'utf8');
	}

	return tmpBundle;
}

/**
 * Compile every immediate subfolder of pSrcRoot that contains a manifest.json.
 * Returns an array of { Hash, Path, Bundle } records.
 */
function compileAllThemes(pSrcRoot, pOutDir, pOptions)
{
	if (!libFS.existsSync(pSrcRoot) || !libFS.statSync(pSrcRoot).isDirectory())
	{
		throw new Error(`compileAllThemes: source root [${pSrcRoot}] is not a directory`);
	}

	let tmpResults = [];
	let tmpEntries = libFS.readdirSync(pSrcRoot);
	for (let i = 0; i < tmpEntries.length; i++)
	{
		let tmpEntry = tmpEntries[i];
		let tmpFull = libPath.join(pSrcRoot, tmpEntry);
		if (!libFS.statSync(tmpFull).isDirectory()) continue;
		if (!libFS.existsSync(libPath.join(tmpFull, 'manifest.json'))) continue;

		let tmpBundle = compileTheme(tmpFull, pOutDir, pOptions);
		tmpResults.push({ Hash: tmpBundle.Hash, Path: tmpFull, Bundle: tmpBundle });
	}
	return tmpResults;
}

// ================================================================
// Internals
// ================================================================

// Fields the compiler consumes structurally (read but not emitted into the
// bundle as-is, or emitted only after processing).  Everything else in the
// manifest is passed through verbatim — apps can stash arbitrary metadata
// (IconColors, ChartPalette, etc.) and consume it via the runtime onApply()
// callback.
const _STRUCTURAL_FIELDS =
{
	'CSSManifest': true,   // controls CSS file ordering — not part of output
	'CSS':         true,   // emitted by _collectCSS instead
	'SVG':         true,   // emitted by _collectSVG (manifest entries merged)
	'Image':       true    // emitted by _collectImages (manifest entries merged)
};

function _passthroughManifestFields(pManifest)
{
	let tmpResult = {};
	let tmpKeys = Object.keys(pManifest);
	for (let i = 0; i < tmpKeys.length; i++)
	{
		let tmpKey = tmpKeys[i];
		if (_STRUCTURAL_FIELDS[tmpKey]) continue;
		tmpResult[tmpKey] = pManifest[tmpKey];
	}
	return tmpResult;
}

function _collectCSS(pSrcDir, pManifest)
{
	let tmpCSSDir = libPath.join(pSrcDir, 'css');
	let tmpResult = [];

	let tmpExplicit = Array.isArray(pManifest.CSSManifest) ? pManifest.CSSManifest : null;

	if (tmpExplicit)
	{
		for (let i = 0; i < tmpExplicit.length; i++)
		{
			let tmpEntry = tmpExplicit[i];
			if (!tmpEntry || !tmpEntry.File) continue;
			let tmpPath = libPath.join(tmpCSSDir, tmpEntry.File);
			if (!libFS.existsSync(tmpPath))
			{
				throw new Error(`compileTheme: CSSManifest references missing file [${tmpEntry.File}]`);
			}
			let tmpHash = tmpEntry.Hash || (pManifest.Hash + '-' + _baseName(tmpEntry.File));
			let tmpPriority = (typeof tmpEntry.Priority === 'number') ? tmpEntry.Priority : 500;
			tmpResult.push(
			{
				Hash: tmpHash,
				Content: libFS.readFileSync(tmpPath, 'utf8'),
				Priority: tmpPriority
			});
		}
		return tmpResult;
	}

	if (!libFS.existsSync(tmpCSSDir) || !libFS.statSync(tmpCSSDir).isDirectory()) return tmpResult;

	let tmpFiles = libFS.readdirSync(tmpCSSDir)
		.filter((pName) => pName.toLowerCase().endsWith('.css'))
		.sort();

	for (let i = 0; i < tmpFiles.length; i++)
	{
		let tmpFile = tmpFiles[i];
		let tmpPath = libPath.join(tmpCSSDir, tmpFile);
		tmpResult.push(
		{
			Hash: pManifest.Hash + '-' + _baseName(tmpFile),
			Content: libFS.readFileSync(tmpPath, 'utf8'),
			Priority: 500 + (i * 10)
		});
	}
	return tmpResult;
}

function _collectSVG(pSrcDir, pManifest)
{
	let tmpSVGDir = libPath.join(pSrcDir, 'svg');
	let tmpFromDisk = {};
	if (libFS.existsSync(tmpSVGDir) && libFS.statSync(tmpSVGDir).isDirectory())
	{
		_walkAssetTree(tmpSVGDir, tmpFromDisk, '.svg', (pPath) =>
		{
			return libFS.readFileSync(pPath, 'utf8');
		});
	}

	if (pManifest.SVG && typeof pManifest.SVG === 'object')
	{
		return _deepMerge(tmpFromDisk, pManifest.SVG);
	}
	return tmpFromDisk;
}

function _collectImages(pSrcDir, pManifest)
{
	let tmpImageDir = libPath.join(pSrcDir, 'image');
	let tmpFromDisk = {};
	if (libFS.existsSync(tmpImageDir) && libFS.statSync(tmpImageDir).isDirectory())
	{
		_walkAssetTree(tmpImageDir, tmpFromDisk, null, (pPath) =>
		{
			let tmpExt = libPath.extname(pPath).toLowerCase();
			let tmpMime = _MimeMap[tmpExt] || 'application/octet-stream';
			let tmpData = libFS.readFileSync(pPath);
			return 'data:' + tmpMime + ';base64,' + tmpData.toString('base64');
		});
	}

	if (pManifest.Image && typeof pManifest.Image === 'object')
	{
		return _deepMerge(tmpFromDisk, pManifest.Image);
	}
	return tmpFromDisk;
}

/**
 * Recursive walk producing a nested PascalCased key tree.  pExtension limits
 * file inclusion when set (e.g. '.svg').
 */
function _walkAssetTree(pDir, pInto, pExtensionFilter, fLoad)
{
	let tmpEntries = libFS.readdirSync(pDir);
	for (let i = 0; i < tmpEntries.length; i++)
	{
		let tmpName = tmpEntries[i];
		let tmpFull = libPath.join(pDir, tmpName);
		let tmpStat = libFS.statSync(tmpFull);

		if (tmpStat.isDirectory())
		{
			let tmpKey = _toPascalCase(tmpName);
			pInto[tmpKey] = pInto[tmpKey] || {};
			_walkAssetTree(tmpFull, pInto[tmpKey], pExtensionFilter, fLoad);
		}
		else if (tmpStat.isFile())
		{
			if (pExtensionFilter && !tmpName.toLowerCase().endsWith(pExtensionFilter)) continue;
			let tmpKey = _toPascalCase(_baseName(tmpName));
			pInto[tmpKey] = fLoad(tmpFull);
		}
	}
}

function _baseName(pFileName)
{
	let tmpExt = libPath.extname(pFileName);
	return tmpExt ? pFileName.substring(0, pFileName.length - tmpExt.length) : pFileName;
}

/**
 * 'icon-foo' / 'icon_foo' / 'IconFoo' / 'icon foo' -> 'IconFoo'
 */
function _toPascalCase(pName)
{
	let tmpParts = String(pName).split(/[\s\-_]+/).filter((p) => p.length > 0);
	if (tmpParts.length === 0) return pName;
	return tmpParts.map((pPart) =>
	{
		return pPart.charAt(0).toUpperCase() + pPart.substring(1);
	}).join('');
}

function _deepMerge(pTarget, pSource)
{
	let tmpResult = Object.assign({}, pTarget);
	let tmpKeys = Object.keys(pSource);
	for (let i = 0; i < tmpKeys.length; i++)
	{
		let tmpKey = tmpKeys[i];
		let tmpVal = pSource[tmpKey];
		if (tmpVal !== null
			&& typeof tmpVal === 'object'
			&& !Array.isArray(tmpVal)
			&& tmpResult[tmpKey] !== null
			&& typeof tmpResult[tmpKey] === 'object'
			&& !Array.isArray(tmpResult[tmpKey]))
		{
			tmpResult[tmpKey] = _deepMerge(tmpResult[tmpKey], tmpVal);
		}
		else
		{
			tmpResult[tmpKey] = tmpVal;
		}
	}
	return tmpResult;
}

module.exports =
{
	compileTheme: compileTheme,
	compileAllThemes: compileAllThemes,
	COMPILER_VERSION: COMPILABLE_VERSION
};
