/**
 * Pict template expression: {~Theme:Path~}
 *
 * Resolves a token path against the active theme bundle and returns the
 * raw value at the currently resolved mode.  Walks from the bundle root,
 * so paths like 'Tokens.Color.Background.Primary' or 'Brand.Name' work.
 *
 * Returns an empty string if no theme is active or the path is missing.
 */
const libPictTemplate = require('pict-template');

class PictTemplateTheme extends libPictTemplate
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.addPattern('{~Theme:', '~}');
	}

	render(pTemplateHash)
	{
		let tmpPath = (pTemplateHash || '').trim();
		if (!tmpPath) return '';

		let tmpProvider = this._findThemeProvider();
		if (!tmpProvider) return '';

		let tmpValue = tmpProvider.token(tmpPath);
		if (tmpValue === null || typeof tmpValue === 'undefined') return '';
		return String(tmpValue);
	}

	_findThemeProvider()
	{
		if (!this.pict || !this.pict.providers) return null;
		return this.pict.providers['Theme'] || null;
	}
}

module.exports = PictTemplateTheme;
