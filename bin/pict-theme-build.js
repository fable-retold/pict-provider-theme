#!/usr/bin/env node
/**
 * pict-theme-build — Standalone CLI for the pict theme compiler.
 *
 * Usage:
 *   pict-theme-build <src> [<out>]            compile one theme folder
 *   pict-theme-build --all <root> [<out>]     compile every theme folder under root
 *
 * Exits 0 on success, 1 on any failure.  Designed to drop into GitHub
 * Actions or any CI without depending on quackage.
 */
const libPath = require('path');
const libCompiler = require('../source/Theme-Compiler.js');

function printUsage()
{
	process.stdout.write('Usage:\n');
	process.stdout.write('  pict-theme-build <src> [<out>]\n');
	process.stdout.write('  pict-theme-build --all <root> [<out>]\n');
	process.stdout.write('\n');
	process.stdout.write('  <src>  unrolled theme folder (containing manifest.json)\n');
	process.stdout.write('  <out>  output directory; defaults to a sibling "theme" folder\n');
}

function main()
{
	let tmpArgs = process.argv.slice(2);

	if (tmpArgs.length === 0 || tmpArgs[0] === '-h' || tmpArgs[0] === '--help')
	{
		printUsage();
		process.exit(tmpArgs.length === 0 ? 1 : 0);
		return;
	}

	let tmpAll = false;
	if (tmpArgs[0] === '--all')
	{
		tmpAll = true;
		tmpArgs.shift();
	}

	if (tmpArgs.length < 1)
	{
		printUsage();
		process.exit(1);
		return;
	}

	let tmpSrc = libPath.resolve(tmpArgs[0]);
	let tmpOut = tmpArgs[1] ? libPath.resolve(tmpArgs[1]) : libPath.resolve(libPath.dirname(tmpSrc), 'theme');

	try
	{
		if (tmpAll)
		{
			let tmpResults = libCompiler.compileAllThemes(tmpSrc, tmpOut);
			for (let i = 0; i < tmpResults.length; i++)
			{
				process.stdout.write('compiled ' + tmpResults[i].Hash + ' -> ' + libPath.join(tmpOut, tmpResults[i].Hash + '.json') + '\n');
			}
			if (tmpResults.length === 0)
			{
				process.stdout.write('no themes found under ' + tmpSrc + '\n');
			}
		}
		else
		{
			let tmpBundle = libCompiler.compileTheme(tmpSrc, tmpOut);
			process.stdout.write('compiled ' + tmpBundle.Hash + ' -> ' + libPath.join(tmpOut, tmpBundle.Hash + '.json') + '\n');
		}
		process.exit(0);
	}
	catch (pError)
	{
		process.stderr.write('pict-theme-build: ' + pError.message + '\n');
		process.exit(1);
	}
}

main();
