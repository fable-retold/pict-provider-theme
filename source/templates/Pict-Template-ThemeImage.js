/**
 * Pict template expression: {~ThemeImage:Name~}
 *
 * Returns the URL or data URL stored at bundle.Image[Name] in the active
 * theme bundle.  Convenience over {~ThemeAsset:Image.Name~}.
 */
const libPictTemplate = require('pict-template');

class PictTemplateThemeImage extends libPictTemplate
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.addPattern('{~ThemeImage:', '~}');
	}

	render(pTemplateHash)
	{
		let tmpName = (pTemplateHash || '').trim();
		if (!tmpName) return '';

		let tmpProvider = this._findThemeProvider();
		if (!tmpProvider) return '';

		let tmpValue = tmpProvider.image(tmpName);
		if (tmpValue === null || typeof tmpValue === 'undefined') return '';
		return String(tmpValue);
	}

	_findThemeProvider()
	{
		if (!this.pict || !this.pict.providers) return null;
		return this.pict.providers['Theme'] || null;
	}
}

module.exports = PictTemplateThemeImage;
