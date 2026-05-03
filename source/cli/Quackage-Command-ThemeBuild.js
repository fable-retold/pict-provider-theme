/**
 * Quackage command: theme-build
 *
 * Wraps the standalone Theme-Compiler so it can be registered into the
 * quackage CLI program alongside the other Quackage-Command-*.js commands.
 *
 * Wiring (one-liner in quackage's CLI program constructor):
 *   require('pict-provider-theme/source/cli/Quackage-Command-ThemeBuild.js')
 *
 * Configuration is read from .quackage.json under "ThemeBuild":
 *   {
 *     "ThemeBuild": {
 *       "Source": "themes",
 *       "Output": "theme",
 *       "All": true
 *     }
 *   }
 *
 * If config is missing, defaults to: { Source: "themes", Output: "theme", All: true }
 */
const libCommandLineCommand = require('pict-service-commandlineutility').ServiceCommandLineCommand;
const libPath = require('path');

const libCompiler = require('../Theme-Compiler.js');

class QuackageCommandThemeBuild extends libCommandLineCommand
{
	constructor(pFable, pManifest, pServiceHash)
	{
		super(pFable, pManifest, pServiceHash);

		this.options.CommandKeyword = 'theme-build';
		this.options.Description = 'Compile unrolled theme folders (manifest.json + css/ + svg/ + image/) into self-contained JSON bundles for the pict-provider-theme runtime.';
		this.options.Aliases.push('theme');
		this.options.Aliases.push('build-themes');

		this.addCommand();
	}

	onRunAsync(fCallback)
	{
		let tmpCWD = (this.fable && this.fable.AppData && this.fable.AppData.CWD) ? this.fable.AppData.CWD : process.cwd();
		let tmpConfig = this._readConfig();
		let tmpSrc = libPath.resolve(tmpCWD, tmpConfig.Source);
		let tmpOut = libPath.resolve(tmpCWD, tmpConfig.Output);

		try
		{
			if (tmpConfig.All)
			{
				let tmpResults = libCompiler.compileAllThemes(tmpSrc, tmpOut);
				for (let i = 0; i < tmpResults.length; i++)
				{
					this.log.info(`Compiled theme [${tmpResults[i].Hash}] -> ${libPath.join(tmpOut, tmpResults[i].Hash + '.json')}`);
				}
				if (tmpResults.length === 0)
				{
					this.log.warn(`No themes found under [${tmpSrc}]`);
				}
			}
			else
			{
				let tmpBundle = libCompiler.compileTheme(tmpSrc, tmpOut);
				this.log.info(`Compiled theme [${tmpBundle.Hash}] -> ${libPath.join(tmpOut, tmpBundle.Hash + '.json')}`);
			}
			return fCallback();
		}
		catch (pError)
		{
			this.log.error(`theme-build failed: ${pError.message}`);
			return fCallback(pError);
		}
	}

	_readConfig()
	{
		let tmpDefaults = { Source: 'themes', Output: 'theme', All: true };
		if (!this.fable || !this.fable.AppData || !this.fable.AppData.ProgramConfiguration) return tmpDefaults;
		let tmpFromConfig = this.fable.AppData.ProgramConfiguration.ThemeBuild;
		if (!tmpFromConfig || typeof tmpFromConfig !== 'object') return tmpDefaults;
		return Object.assign({}, tmpDefaults, tmpFromConfig);
	}
}

module.exports = QuackageCommandThemeBuild;
