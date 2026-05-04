#!/usr/bin/env node
/**
 * pict-theme-screenshot — drive the theme playground with a user-supplied
 * theme bundle and capture a folder of screenshots: every section in every
 * mode (light + dark + system).
 *
 * Usage:
 *   pict-theme-screenshot <theme.json>                    [--out ./shots] [--port 8189]
 *   pict-theme-screenshot <unrolled-theme-folder>         [--out ./shots] [--port 8189]
 *   pict-theme-screenshot <theme> --modes light,dark      (omit a mode to skip it)
 *   pict-theme-screenshot <theme> --sections modal,flow   (only those sections)
 *
 * Output:
 *   <out>/<theme-hash>/<section-id>-<mode>.png
 *   <out>/<theme-hash>/index.html              (a thumbnail grid for review)
 *
 * Requires:
 *   - puppeteer (peer dep — install in the calling project: `npm i -D puppeteer`)
 *   - the playground built (we build it on demand if dist/ is missing)
 */
const libFS = require('fs');
const libPath = require('path');
const libHTTP = require('http');
const { spawn } = require('child_process');

const libCompiler = require('../source/Theme-Compiler.js');

const PLAYGROUND_DIR = libPath.resolve(__dirname, '..', 'example_applications', 'theme-playground');
const PLAYGROUND_DIST = libPath.join(PLAYGROUND_DIR, 'dist');

const DEFAULT_PORT = 8189;
const DEFAULT_OUT = './pict-theme-screenshots';
const DEFAULT_MODES = ['light', 'dark', 'system'];

function usage()
{
	process.stderr.write(
		'Usage: pict-theme-screenshot <theme-path> [--out <dir>] [--port <n>] [--modes <list>] [--sections <list>]\n' +
		'\n' +
		'  <theme-path>    a compiled theme JSON file OR an unrolled theme folder\n' +
		'                  (compiled on the fly via the pict-theme-build pipeline)\n' +
		'  --out <dir>     output directory (default ./pict-theme-screenshots)\n' +
		'  --port <n>      local server port (default 8189)\n' +
		'  --modes <list>  comma-separated subset of light,dark,system\n' +
		'  --sections <list> comma-separated section ids (omit to capture all)\n');
}

function parseArgs(pArgv)
{
	let tmpArgs = { Modes: DEFAULT_MODES.slice(), Sections: null, OutDir: DEFAULT_OUT, Port: DEFAULT_PORT, ThemePath: null };
	let tmpQueue = pArgv.slice();
	while (tmpQueue.length > 0)
	{
		let tmpToken = tmpQueue.shift();
		if (tmpToken === '--out') tmpArgs.OutDir = tmpQueue.shift();
		else if (tmpToken === '--port') tmpArgs.Port = parseInt(tmpQueue.shift(), 10) || DEFAULT_PORT;
		else if (tmpToken === '--modes') tmpArgs.Modes = String(tmpQueue.shift() || '').split(',').filter(Boolean);
		else if (tmpToken === '--sections') tmpArgs.Sections = String(tmpQueue.shift() || '').split(',').filter(Boolean);
		else if (tmpToken === '-h' || tmpToken === '--help') { usage(); process.exit(0); }
		else if (!tmpArgs.ThemePath) tmpArgs.ThemePath = tmpToken;
		else { process.stderr.write('Unexpected arg: ' + tmpToken + '\n'); usage(); process.exit(1); }
	}
	if (!tmpArgs.ThemePath) { usage(); process.exit(1); }
	tmpArgs.ThemePath = libPath.resolve(tmpArgs.ThemePath);
	tmpArgs.OutDir = libPath.resolve(tmpArgs.OutDir);
	return tmpArgs;
}

function ensurePlaygroundBuilt()
{
	let tmpHasDist = libFS.existsSync(libPath.join(PLAYGROUND_DIST, 'index.html'));
	if (tmpHasDist) return Promise.resolve();
	process.stdout.write('Playground dist/ missing — building it (this can take a minute the first time)...\n');
	return new Promise((resolve, reject) =>
	{
		let tmpProc = spawn('npm', ['install', '--silent'], { cwd: PLAYGROUND_DIR, stdio: 'inherit' });
		tmpProc.on('exit', (pCode) =>
		{
			if (pCode !== 0) return reject(new Error('npm install failed (exit ' + pCode + ')'));
			let tmpBuild = spawn('npm', ['run', 'build'], { cwd: PLAYGROUND_DIR, stdio: 'inherit' });
			tmpBuild.on('exit', (pBuildCode) =>
			{
				if (pBuildCode !== 0) return reject(new Error('npm run build failed (exit ' + pBuildCode + ')'));
				resolve();
			});
		});
	});
}

function loadOrCompileTheme(pThemePath)
{
	let tmpStat = libFS.statSync(pThemePath);
	if (tmpStat.isDirectory())
	{
		process.stdout.write('Compiling unrolled theme folder: ' + pThemePath + '\n');
		let tmpBundle = libCompiler.compileTheme(pThemePath);
		return tmpBundle;
	}
	let tmpRaw = libFS.readFileSync(pThemePath, 'utf8');
	return JSON.parse(tmpRaw);
}

function startServer(pRoot, pPort)
{
	const _Mime =
	{
		'.html': 'text/html; charset=utf-8',
		'.js':   'application/javascript; charset=utf-8',
		'.css':  'text/css; charset=utf-8',
		'.json': 'application/json; charset=utf-8',
		'.png':  'image/png',
		'.jpg':  'image/jpeg',
		'.jpeg': 'image/jpeg',
		'.svg':  'image/svg+xml',
		'.ico':  'image/x-icon',
		'.map':  'application/json'
	};
	let tmpServer = libHTTP.createServer((pReq, pRes) =>
	{
		try
		{
			let tmpUrl = decodeURIComponent((pReq.url || '/').split('?')[0]);
			if (tmpUrl === '/') tmpUrl = '/index.html';
			let tmpFull = libPath.join(pRoot, tmpUrl);
			if (!tmpFull.startsWith(pRoot)) { pRes.writeHead(403); pRes.end('forbidden'); return; }
			if (!libFS.existsSync(tmpFull)) { pRes.writeHead(404); pRes.end('not found: ' + tmpUrl); return; }
			let tmpExt = libPath.extname(tmpFull).toLowerCase();
			pRes.writeHead(200, { 'Content-Type': _Mime[tmpExt] || 'application/octet-stream' });
			libFS.createReadStream(tmpFull).pipe(pRes);
		}
		catch (pErr) { pRes.writeHead(500); pRes.end('server error: ' + pErr.message); }
	});
	return new Promise((resolve, reject) =>
	{
		tmpServer.once('error', reject);
		tmpServer.listen(pPort, '127.0.0.1', () => resolve(tmpServer));
	});
}

async function main()
{
	let tmpArgs = parseArgs(process.argv.slice(2));

	let libPuppeteer;
	try { libPuppeteer = require('puppeteer'); }
	catch (pErr)
	{
		process.stderr.write(
			'puppeteer is not installed.  Install it in your project:\n' +
			'  npm install --save-dev puppeteer\n' +
			'Then re-run pict-theme-screenshot.\n');
		process.exit(1);
	}

	if (!libFS.existsSync(tmpArgs.ThemePath))
	{
		process.stderr.write('Theme path not found: ' + tmpArgs.ThemePath + '\n');
		process.exit(1);
	}

	await ensurePlaygroundBuilt();

	let tmpBundle = loadOrCompileTheme(tmpArgs.ThemePath);
	if (!tmpBundle.Hash)
	{
		process.stderr.write('Theme bundle missing required Hash field\n');
		process.exit(1);
	}

	// Drop bundle into playground dist/themes/_screenshot.json so it's
	// reachable via the same-origin URL the layout fetches.
	let tmpThemesDir = libPath.join(PLAYGROUND_DIST, 'themes');
	if (!libFS.existsSync(tmpThemesDir)) libFS.mkdirSync(tmpThemesDir, { recursive: true });
	let tmpServedTheme = libPath.join(tmpThemesDir, '_screenshot.json');
	libFS.writeFileSync(tmpServedTheme, JSON.stringify(tmpBundle), 'utf8');

	let tmpOutRoot = libPath.join(tmpArgs.OutDir, tmpBundle.Hash);
	if (!libFS.existsSync(tmpOutRoot)) libFS.mkdirSync(tmpOutRoot, { recursive: true });

	process.stdout.write('Serving playground at http://127.0.0.1:' + tmpArgs.Port + '/\n');
	let tmpServer = await startServer(PLAYGROUND_DIST, tmpArgs.Port);

	process.stdout.write('Launching headless browser...\n');
	let tmpBrowser = await libPuppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
	let tmpPage = await tmpBrowser.newPage();
	await tmpPage.setViewport({ width: 1440, height: 900 });

	let tmpResults = [];
	try
	{
		await tmpPage.goto(
			'http://127.0.0.1:' + tmpArgs.Port + '/?themeUrl=themes/_screenshot.json',
			{ waitUntil: 'networkidle0', timeout: 30000 });

		// Wait for the playground to mount (window.pict + the layout's nav).
		await tmpPage.waitForFunction(
			'window.pict && document.querySelectorAll(".pg-nav-item").length > 0',
			{ timeout: 15000 });

		let tmpSections = await tmpPage.evaluate(() =>
			window.pict.AppData.Playground.SectionRegistry.map((e) => ({ id: e.id, name: e.name, group: e.group })));

		if (tmpArgs.Sections)
		{
			let tmpAllowed = new Set(tmpArgs.Sections);
			tmpSections = tmpSections.filter((s) => tmpAllowed.has(s.id));
		}

		process.stdout.write('Capturing ' + tmpSections.length + ' sections × ' + tmpArgs.Modes.length + ' modes = ' + (tmpSections.length * tmpArgs.Modes.length) + ' screenshots\n');

		for (let i = 0; i < tmpSections.length; i++)
		{
			let tmpSec = tmpSections[i];
			for (let m = 0; m < tmpArgs.Modes.length; m++)
			{
				let tmpMode = tmpArgs.Modes[m];
				try
				{
					await tmpPage.evaluate((pMode) =>
					{
						let tmpBtn = document.querySelector('.pg-mode-button[data-mode="' + pMode + '"]');
						if (tmpBtn) tmpBtn.click();
					}, tmpMode);
					await tmpPage.evaluate((pId) => window.pict.providers['Pict-Router'].navigate('/section/' + pId), tmpSec.id);
					// Wait briefly for paint + any per-section async render.
					await new Promise((r) => setTimeout(r, 600));
					let tmpFile = libPath.join(tmpOutRoot, tmpSec.id + '-' + tmpMode + '.png');
					await tmpPage.screenshot({ path: tmpFile, fullPage: false });
					process.stdout.write('  ✓ ' + tmpSec.id + ' [' + tmpMode + ']\n');
					tmpResults.push({ Section: tmpSec, Mode: tmpMode, File: libPath.basename(tmpFile), OK: true });
				}
				catch (pErr)
				{
					process.stdout.write('  ✗ ' + tmpSec.id + ' [' + tmpMode + ']: ' + pErr.message + '\n');
					tmpResults.push({ Section: tmpSec, Mode: tmpMode, File: null, OK: false, Error: pErr.message });
				}
			}
		}

		writeIndexHTML(tmpOutRoot, tmpBundle, tmpResults, tmpArgs.Modes);
	}
	finally
	{
		await tmpBrowser.close();
		tmpServer.close();
		try { libFS.unlinkSync(tmpServedTheme); } catch (pErr) { /* */ }
	}

	process.stdout.write('\nDone.\n  Screenshots:  ' + tmpOutRoot + '\n  Index report: ' + libPath.join(tmpOutRoot, 'index.html') + '\n');
}

function writeIndexHTML(pOutDir, pBundle, pResults, pModes)
{
	let tmpByGroup = {};
	let tmpGroupOrder = [];
	pResults.forEach((pR) =>
	{
		let tmpGroup = pR.Section.group || 'Other';
		if (!tmpByGroup[tmpGroup]) { tmpByGroup[tmpGroup] = {}; tmpGroupOrder.push(tmpGroup); }
		if (!tmpByGroup[tmpGroup][pR.Section.id]) tmpByGroup[tmpGroup][pR.Section.id] = { Section: pR.Section, ByMode: {} };
		tmpByGroup[tmpGroup][pR.Section.id].ByMode[pR.Mode] = pR;
	});

	// Inline each PNG as a base64 data URI so the report is self-contained.
	// Modern browsers block file:// → file:// image loading in many configs;
	// inlining means the HTML works whether opened via file:// or HTTP.
	function inlineImage(pFilename)
	{
		try
		{
			let tmpFull = libPath.join(pOutDir, pFilename);
			let tmpData = libFS.readFileSync(tmpFull);
			return 'data:image/png;base64,' + tmpData.toString('base64');
		}
		catch (pErr) { return pFilename; }
	}

	let tmpHTML = '<!doctype html><meta charset="utf-8">';
	tmpHTML += '<title>Theme screenshots — ' + escape(pBundle.Name || pBundle.Hash) + '</title>';
	tmpHTML += '<style>' +
		'body { font: 14px system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin: 24px; background: #fafafa; color: #222; }' +
		'h1 { margin: 0 0 8px; } h1 small { color: #888; font-weight: normal; font-size: 0.65em; }' +
		'h2 { margin: 32px 0 8px; padding-bottom: 4px; border-bottom: 1px solid #ddd; color: #555; font-size: 0.85em; text-transform: uppercase; letter-spacing: .05em; }' +
		'.section { margin: 16px 0 32px; }' +
		'.section h3 { margin: 0 0 8px; font-size: 1em; }' +
		'.shot-row { display: grid; grid-template-columns: repeat(' + pModes.length + ', 1fr); gap: 12px; }' +
		'.shot { background: #fff; border: 1px solid #ddd; border-radius: 6px; padding: 8px; text-align: center; font-size: 12px; }' +
		'.shot img { max-width: 100%; height: auto; display: block; margin: 0 auto 6px; border: 1px solid #eee; }' +
		'.shot.failed { background: #fdd; }' +
		'</style>';
	tmpHTML += '<h1>' + escape(pBundle.Name || pBundle.Hash) + ' <small>' + escape(pBundle.Hash) + '</small></h1>';
	if (pBundle.Description) tmpHTML += '<p>' + escape(pBundle.Description) + '</p>';

	tmpGroupOrder.forEach((pGroup) =>
	{
		tmpHTML += '<h2>' + escape(pGroup) + '</h2>';
		Object.values(tmpByGroup[pGroup]).forEach((pSec) =>
		{
			tmpHTML += '<div class="section"><h3>' + escape(pSec.Section.name) + '</h3><div class="shot-row">';
			pModes.forEach((pMode) =>
			{
				let tmpEntry = pSec.ByMode[pMode];
				if (tmpEntry && tmpEntry.OK)
				{
					tmpHTML += '<div class="shot"><img src="' + inlineImage(tmpEntry.File) + '" alt="' + escape(pSec.Section.id + ' ' + pMode) + '"><div>' + escape(pMode) + '</div></div>';
				}
				else
				{
					tmpHTML += '<div class="shot failed"><div>' + escape(pMode) + '</div><div>' + escape((tmpEntry && tmpEntry.Error) || 'no capture') + '</div></div>';
				}
			});
			tmpHTML += '</div></div>';
		});
	});

	libFS.writeFileSync(libPath.join(pOutDir, 'index.html'), tmpHTML, 'utf8');
}

function escape(pStr)
{
	return String(pStr || '').replace(/[&<>"']/g, (pChar) =>
	({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[pChar]));
}

main().catch((pErr) =>
{
	process.stderr.write('pict-theme-screenshot: ' + pErr.message + '\n');
	if (pErr.stack) process.stderr.write(pErr.stack + '\n');
	process.exit(1);
});
