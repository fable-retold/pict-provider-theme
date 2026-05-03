/**
 * pict-provider-theme — Compiler Tests
 *
 * Exercises the Theme-Compiler against the example unrolled theme at
 * examples/themes/sample-theme/, validating:
 *   - manifest field passthrough
 *   - alphabetical CSS file collection with computed priorities
 *   - explicit CSSManifest ordering when provided
 *   - SVG nested folder PascalCasing
 *   - image base64 encoding with mime detection
 *   - end-to-end roundtrip: compiled bundle is registerable + appliable
 *     by the runtime provider
 *   - compileAllThemes finds every subfolder with a manifest.json
 *   - error handling for missing dirs / bad manifests
 */
const libAssert = require('assert');
const libFS = require('fs');
const libPath = require('path');
const libOS = require('os');
const libFable = require('fable');

const libCompiler = require('../source/Theme-Compiler.js');
const libPictProviderTheme = require('../source/Pict-Provider-Theme.js');

const SAMPLE_THEME_DIR = libPath.join(__dirname, '..', 'examples', 'themes', 'sample-theme');

function makeTempDir(pPrefix)
{
	return libFS.mkdtempSync(libPath.join(libOS.tmpdir(), pPrefix));
}

function rmrf(pPath)
{
	if (!libFS.existsSync(pPath)) return;
	libFS.rmSync(pPath, { recursive: true, force: true });
}

function writeUnrolled(pRoot, pHash, pManifest, pCSSFiles, pSVGFiles, pImageFiles)
{
	let tmpDir = libPath.join(pRoot, pHash);
	libFS.mkdirSync(tmpDir, { recursive: true });
	libFS.writeFileSync(libPath.join(tmpDir, 'manifest.json'), JSON.stringify(pManifest), 'utf8');
	if (pCSSFiles)
	{
		libFS.mkdirSync(libPath.join(tmpDir, 'css'), { recursive: true });
		Object.keys(pCSSFiles).forEach((pName) =>
		{
			libFS.writeFileSync(libPath.join(tmpDir, 'css', pName), pCSSFiles[pName], 'utf8');
		});
	}
	if (pSVGFiles)
	{
		libFS.mkdirSync(libPath.join(tmpDir, 'svg'), { recursive: true });
		Object.keys(pSVGFiles).forEach((pRel) =>
		{
			let tmpFull = libPath.join(tmpDir, 'svg', pRel);
			libFS.mkdirSync(libPath.dirname(tmpFull), { recursive: true });
			libFS.writeFileSync(tmpFull, pSVGFiles[pRel], 'utf8');
		});
	}
	if (pImageFiles)
	{
		libFS.mkdirSync(libPath.join(tmpDir, 'image'), { recursive: true });
		Object.keys(pImageFiles).forEach((pName) =>
		{
			libFS.writeFileSync(libPath.join(tmpDir, 'image', pName), pImageFiles[pName]);
		});
	}
	return tmpDir;
}

suite
(
	'Theme-Compiler',
	() =>
	{
		suite
		(
			'Module exports',
			() =>
			{
				test('exports compileTheme + compileAllThemes + COMPILER_VERSION', (fDone) =>
				{
					libAssert.strictEqual(typeof libCompiler.compileTheme, 'function');
					libAssert.strictEqual(typeof libCompiler.compileAllThemes, 'function');
					libAssert.strictEqual(typeof libCompiler.COMPILER_VERSION, 'number');
					fDone();
				});
			}
		);

		suite
		(
			'compileTheme — sample-theme fixture',
			() =>
			{
				let _bundle = null;

				suiteSetup((fDone) =>
				{
					_bundle = libCompiler.compileTheme(SAMPLE_THEME_DIR);
					fDone();
				});

				test('passes through manifest fields', (fDone) =>
				{
					libAssert.strictEqual(_bundle.Hash, 'sample-theme');
					libAssert.strictEqual(_bundle.Name, 'Sample Theme');
					libAssert.strictEqual(_bundle.Comprehensive, true);
					libAssert.strictEqual(_bundle.Modes.Strategy, 'paired');
					libAssert.strictEqual(_bundle.Tokens.Color.Background.Primary.Light, '#ffffff');
					libAssert.strictEqual(_bundle.Brand.Name, 'Sample');
					fDone();
				});

				test('collects CSS files alphabetically with computed priorities', (fDone) =>
				{
					libAssert.ok(Array.isArray(_bundle.CSS));
					libAssert.strictEqual(_bundle.CSS.length, 2);
					libAssert.strictEqual(_bundle.CSS[0].Hash, 'sample-theme-base');
					libAssert.strictEqual(_bundle.CSS[0].Priority, 500);
					libAssert.ok(_bundle.CSS[0].Content.indexOf('.sample-root') >= 0);
					libAssert.strictEqual(_bundle.CSS[1].Hash, 'sample-theme-components');
					libAssert.strictEqual(_bundle.CSS[1].Priority, 510);
					libAssert.ok(_bundle.CSS[1].Content.indexOf('.sample-button') >= 0);
					fDone();
				});

				test('collects SVG files into a PascalCased nested object', (fDone) =>
				{
					libAssert.ok(_bundle.SVG, 'SVG root present');
					libAssert.ok(typeof _bundle.SVG.Logo === 'string', 'top-level Logo');
					libAssert.ok(_bundle.SVG.Logo.indexOf('<svg') === 0);
					libAssert.ok(_bundle.SVG.Icons && typeof _bundle.SVG.Icons === 'object', 'Icons subfolder');
					libAssert.ok(typeof _bundle.SVG.Icons.FooBar === 'string', 'foo-bar.svg becomes FooBar');
					fDone();
				});

				test('encodes images as base64 data URLs with mime detection', (fDone) =>
				{
					libAssert.ok(_bundle.Image && typeof _bundle.Image.Favicon === 'string');
					libAssert.ok(_bundle.Image.Favicon.indexOf('data:image/png;base64,') === 0);
					fDone();
				});

				test('writes <hash>.json into the output directory when supplied', (fDone) =>
				{
					let tmpOut = makeTempDir('pict-theme-out-');
					try
					{
						libCompiler.compileTheme(SAMPLE_THEME_DIR, tmpOut);
						let tmpExpected = libPath.join(tmpOut, 'sample-theme.json');
						libAssert.ok(libFS.existsSync(tmpExpected));
						let tmpRead = JSON.parse(libFS.readFileSync(tmpExpected, 'utf8'));
						libAssert.strictEqual(tmpRead.Hash, 'sample-theme');
					}
					finally
					{
						rmrf(tmpOut);
					}
					fDone();
				});
			}
		);

		suite
		(
			'CSSManifest override',
			() =>
			{
				test('explicit CSSManifest controls order, hash, and priority', (fDone) =>
				{
					let tmpRoot = makeTempDir('pict-theme-csmanifest-');
					try
					{
						writeUnrolled(tmpRoot, 'csm-test',
							{
								Hash: 'csm-test',
								Modes: { Strategy: 'single', Default: 'light' },
								Tokens: {},
								CSSManifest: [
									{ File: 'second.css', Priority: 700, Hash: 'csm-test-FIRST' },
									{ File: 'first.css', Priority: 600 }
								]
							},
							{ 'first.css': '.first {}', 'second.css': '.second {}', 'ignored.css': '.skipped {}' });

						let tmpBundle = libCompiler.compileTheme(libPath.join(tmpRoot, 'csm-test'));
						libAssert.strictEqual(tmpBundle.CSS.length, 2);
						libAssert.strictEqual(tmpBundle.CSS[0].Hash, 'csm-test-FIRST');
						libAssert.strictEqual(tmpBundle.CSS[0].Priority, 700);
						libAssert.ok(tmpBundle.CSS[0].Content.indexOf('.second') >= 0);
						libAssert.strictEqual(tmpBundle.CSS[1].Hash, 'csm-test-first');
						libAssert.strictEqual(tmpBundle.CSS[1].Priority, 600);
					}
					finally
					{
						rmrf(tmpRoot);
					}
					fDone();
				});

				test('CSSManifest pointing to a missing file throws', (fDone) =>
				{
					let tmpRoot = makeTempDir('pict-theme-csmiss-');
					try
					{
						writeUnrolled(tmpRoot, 'miss',
							{
								Hash: 'miss',
								Modes: { Strategy: 'single', Default: 'light' },
								Tokens: {},
								CSSManifest: [{ File: 'nope.css', Priority: 500 }]
							},
							{ 'present.css': '.x {}' });

						libAssert.throws(() => libCompiler.compileTheme(libPath.join(tmpRoot, 'miss')), /missing file/);
					}
					finally
					{
						rmrf(tmpRoot);
					}
					fDone();
				});
			}
		);

		suite
		(
			'Manifest SVG/Image overrides',
			() =>
			{
				test('manifest.SVG entries override filesystem-discovered values', (fDone) =>
				{
					let tmpRoot = makeTempDir('pict-theme-svgover-');
					try
					{
						writeUnrolled(tmpRoot, 'svgover',
							{
								Hash: 'svgover',
								Modes: { Strategy: 'single', Default: 'light' },
								Tokens: {},
								SVG: { Logo: '<svg>OVERRIDE</svg>', Extra: '<svg>extra</svg>' }
							},
							null,
							{ 'logo.svg': '<svg>FROMDISK</svg>' });

						let tmpBundle = libCompiler.compileTheme(libPath.join(tmpRoot, 'svgover'));
						libAssert.strictEqual(tmpBundle.SVG.Logo, '<svg>OVERRIDE</svg>');
						libAssert.strictEqual(tmpBundle.SVG.Extra, '<svg>extra</svg>');
					}
					finally
					{
						rmrf(tmpRoot);
					}
					fDone();
				});
			}
		);

		suite
		(
			'compileAllThemes',
			() =>
			{
				test('finds every immediate subfolder with a manifest.json', (fDone) =>
				{
					let tmpRoot = makeTempDir('pict-theme-multi-');
					try
					{
						writeUnrolled(tmpRoot, 'a',
							{ Hash: 'a', Modes: { Strategy: 'single', Default: 'light' }, Tokens: {} });
						writeUnrolled(tmpRoot, 'b',
							{ Hash: 'b', Modes: { Strategy: 'single', Default: 'light' }, Tokens: {} });
						// Folder without manifest.json should be skipped.
						libFS.mkdirSync(libPath.join(tmpRoot, 'no-manifest'));

						let tmpOut = libPath.join(tmpRoot, '_out');
						let tmpResults = libCompiler.compileAllThemes(tmpRoot, tmpOut);
						let tmpHashes = tmpResults.map((r) => r.Hash).sort();
						libAssert.deepStrictEqual(tmpHashes, ['a', 'b']);
						libAssert.ok(libFS.existsSync(libPath.join(tmpOut, 'a.json')));
						libAssert.ok(libFS.existsSync(libPath.join(tmpOut, 'b.json')));
					}
					finally
					{
						rmrf(tmpRoot);
					}
					fDone();
				});
			}
		);

		suite
		(
			'Error paths',
			() =>
			{
				test('compileTheme throws for missing source dir', (fDone) =>
				{
					libAssert.throws(() => libCompiler.compileTheme('/no/such/path/' + Date.now()), /not a directory/);
					fDone();
				});

				test('compileTheme throws for missing manifest.json', (fDone) =>
				{
					let tmpRoot = makeTempDir('pict-theme-nomanifest-');
					try
					{
						libAssert.throws(() => libCompiler.compileTheme(tmpRoot), /missing manifest/);
					}
					finally
					{
						rmrf(tmpRoot);
					}
					fDone();
				});

				test('compileTheme throws for invalid JSON manifest', (fDone) =>
				{
					let tmpRoot = makeTempDir('pict-theme-badjson-');
					try
					{
						libFS.writeFileSync(libPath.join(tmpRoot, 'manifest.json'), '{not json', 'utf8');
						libAssert.throws(() => libCompiler.compileTheme(tmpRoot), /invalid JSON/);
					}
					finally
					{
						rmrf(tmpRoot);
					}
					fDone();
				});

				test('compileTheme throws when manifest is missing Hash', (fDone) =>
				{
					let tmpRoot = makeTempDir('pict-theme-nohash-');
					try
					{
						libFS.writeFileSync(libPath.join(tmpRoot, 'manifest.json'), '{"Name":"x"}', 'utf8');
						libAssert.throws(() => libCompiler.compileTheme(tmpRoot), /missing required string Hash/);
					}
					finally
					{
						rmrf(tmpRoot);
					}
					fDone();
				});
			}
		);

		suite
		(
			'Roundtrip — compile + register + apply',
			() =>
			{
				test('compiled bundle is consumable by the runtime provider', (fDone) =>
				{
					let tmpBundle = libCompiler.compileTheme(SAMPLE_THEME_DIR);

					let tmpFable = new libFable({
						Product: 'CompilerRoundtrip',
						LogStreams: [{ streamtype: 'console', level: 'fatal' }]
					});
					let tmpProvider = new libPictProviderTheme(tmpFable, {}, 'TestTheme');

					let tmpAddedCSS = [];
					tmpProvider.pict =
					{
						AppData: {},
						providers: { Theme: tmpProvider },
						CSSMap:
						{
							addCSS: function (pHash, pContent, pPriority) { tmpAddedCSS.push({ pHash, pPriority }); },
							removeCSS: function () {}
						}
					};
					tmpProvider.log = tmpFable.log;

					let tmpStyleEl = null;
					let tmpClasses = new Set();
					global.document =
					{
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
						createElement: function (pTag) { return { tagName: pTag, id: '', textContent: '' }; }
					};

					try
					{
						libAssert.strictEqual(tmpProvider.registerTheme(tmpBundle), true);
						libAssert.strictEqual(tmpProvider.applyTheme('sample-theme', 'light'), true);

						let tmpCSS = tmpStyleEl.textContent;
						libAssert.ok(tmpCSS.indexOf('--theme-color-background-primary: #ffffff;') >= 0);
						libAssert.ok(tmpCSS.indexOf('.theme-dark {') >= 0);
						libAssert.ok(tmpCSS.indexOf('--theme-color-background-primary: #101010;') >= 0);

						// Compiled CSS files should pass through to CSSMap.addCSS.
						libAssert.strictEqual(tmpAddedCSS.length, 2);
						libAssert.strictEqual(tmpAddedCSS[0].pHash, 'sample-theme-base');
						libAssert.strictEqual(tmpAddedCSS[0].pPriority, 500);
						libAssert.strictEqual(tmpAddedCSS[1].pHash, 'sample-theme-components');
						libAssert.strictEqual(tmpAddedCSS[1].pPriority, 510);

						// Asset accessors over the compiled bundle.
						libAssert.ok(tmpProvider.svg('Logo').indexOf('<svg') === 0);
						libAssert.ok(tmpProvider.svg('Icons.FooBar').indexOf('<svg') === 0);
						libAssert.ok(tmpProvider.image('Favicon').indexOf('data:image/png;base64,') === 0);

						// Token accessor over the compiled bundle.
						libAssert.strictEqual(tmpProvider.token('Tokens.Color.Background.Primary'), '#ffffff');
						tmpProvider.setMode('dark');
						libAssert.strictEqual(tmpProvider.token('Tokens.Color.Background.Primary'), '#101010');
					}
					finally
					{
						delete global.document;
					}
					fDone();
				});
			}
		);
	}
);
