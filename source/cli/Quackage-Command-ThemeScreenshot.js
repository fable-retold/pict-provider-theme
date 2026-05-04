/**
 * Quackage command: theme-screenshot
 *
 * Spawns the standalone bin/pict-theme-screenshot.js so the same code
 * paths run whether invoked via quack, npx, or directly.
 *
 * Configuration via .quackage.json:
 *   {
 *     "ThemeScreenshot": {
 *       "ThemePath": "./theme/twilight.json",
 *       "OutDir":    "./pict-theme-screenshots",
 *       "Port":      8189,
 *       "Modes":     ["light","dark","system"],
 *       "Sections":  null
 *     }
 *   }
 *
 * Or pass the theme path as the command argument.
 */
const libCommandLineCommand = require('pict-service-commandlineutility').ServiceCommandLineCommand;
const libPath = require('path');
const libChild = require('child_process');

const BIN_PATH = libPath.resolve(__dirname, '..', '..', 'bin', 'pict-theme-screenshot.js');

class QuackageCommandThemeScreenshot extends libCommandLineCommand
{
	constructor(pFable, pManifest, pServiceHash)
	{
		super(pFable, pManifest, pServiceHash);

		this.options.CommandKeyword = 'theme-screenshot';
		this.options.Description = 'Drive the pict-provider-theme playground with a theme bundle and capture a folder of screenshots (every section × every mode).  Requires puppeteer.';
		this.options.Aliases.push('theme-shots');
		this.options.CommandArguments.push({ Name: '[theme-path]', Description: 'Compiled theme JSON or unrolled theme folder (overrides .quackage.json ThemeScreenshot.ThemePath).' });

		this.addCommand();
	}

	onRunAsync(fCallback)
	{
		let tmpCWD = (this.fable && this.fable.AppData && this.fable.AppData.CWD) ? this.fable.AppData.CWD : process.cwd();
		let tmpConfig = this._readConfig();
		let tmpThemePath = this.ArgumentString || tmpConfig.ThemePath;
		if (!tmpThemePath)
		{
			this.log.error('theme-screenshot requires a theme path (argument or .quackage.json ThemeScreenshot.ThemePath).');
			return fCallback(new Error('missing theme path'));
		}

		let tmpArgs = [BIN_PATH, libPath.resolve(tmpCWD, tmpThemePath)];
		if (tmpConfig.OutDir)        { tmpArgs.push('--out',      libPath.resolve(tmpCWD, tmpConfig.OutDir)); }
		if (tmpConfig.Port)          { tmpArgs.push('--port',     String(tmpConfig.Port)); }
		if (tmpConfig.Modes)         { tmpArgs.push('--modes',    tmpConfig.Modes.join(',')); }
		if (tmpConfig.Sections)      { tmpArgs.push('--sections', tmpConfig.Sections.join(',')); }

		this.log.info('Running: node ' + tmpArgs.join(' '));
		let tmpProc = libChild.spawn(process.execPath, tmpArgs, { cwd: tmpCWD, stdio: 'inherit' });
		tmpProc.on('exit', (pCode) =>
		{
			if (pCode !== 0) return fCallback(new Error('theme-screenshot exited with code ' + pCode));
			return fCallback();
		});
	}

	_readConfig()
	{
		let tmpDefaults = {};
		if (!this.fable || !this.fable.AppData || !this.fable.AppData.ProgramConfiguration) return tmpDefaults;
		let tmpFromConfig = this.fable.AppData.ProgramConfiguration.ThemeScreenshot;
		if (!tmpFromConfig || typeof tmpFromConfig !== 'object') return tmpDefaults;
		return Object.assign({}, tmpDefaults, tmpFromConfig);
	}
}

module.exports = QuackageCommandThemeScreenshot;
