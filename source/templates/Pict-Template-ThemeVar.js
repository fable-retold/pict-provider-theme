/**
 * Pict template expression: {~ThemeVar:Path~}
 *
 * Returns a CSS `var(--theme-...)` reference for a token path under
 * Tokens.  E.g. {~ThemeVar:Color.Background.Primary~} ->
 * `var(--theme-color-background-primary)`.
 *
 * Useful inside style attributes and in CSS-in-JS contexts where you want
 * the live custom-property reference rather than the resolved value.
 */
const libPictTemplate = require('pict-template');

class PictTemplateThemeVar extends libPictTemplate
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.addPattern('{~ThemeVar:', '~}');
	}

	render(pTemplateHash)
	{
		let tmpPath = (pTemplateHash || '').trim();
		if (!tmpPath) return '';

		let tmpProvider = this._findThemeProvider();
		if (!tmpProvider) return '';
		return tmpProvider.cssVar(tmpPath);
	}

	_findThemeProvider()
	{
		if (!this.pict || !this.pict.providers) return null;
		return this.pict.providers['Theme'] || null;
	}
}

module.exports = PictTemplateThemeVar;
