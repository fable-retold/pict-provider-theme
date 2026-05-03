/**
 * Pict template expression: {~ThemeAsset:Category.Name~}
 *
 * Returns the contents of a named SVG (or other) asset from the active
 * theme bundle.  The first path segment is treated as the category
 * (e.g. SVG), the rest as the asset's path within that category.
 *
 *   {~ThemeAsset:SVG.Logo~}        -> bundle.SVG.Logo
 *   {~ThemeAsset:SVG.Icons.Foo~}   -> bundle.SVG.Icons.Foo
 */
const libPictTemplate = require('pict-template');

class PictTemplateThemeAsset extends libPictTemplate
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.addPattern('{~ThemeAsset:', '~}');
	}

	render(pTemplateHash)
	{
		let tmpPath = (pTemplateHash || '').trim();
		if (!tmpPath) return '';

		let tmpDot = tmpPath.indexOf('.');
		if (tmpDot < 0) return '';

		let tmpCategory = tmpPath.substring(0, tmpDot);
		let tmpName = tmpPath.substring(tmpDot + 1);

		let tmpProvider = this._findThemeProvider();
		if (!tmpProvider) return '';

		let tmpValue = tmpProvider.asset(tmpCategory, tmpName);
		if (tmpValue === null || typeof tmpValue === 'undefined') return '';
		return String(tmpValue);
	}

	_findThemeProvider()
	{
		if (!this.pict || !this.pict.providers) return null;
		return this.pict.providers['Theme'] || null;
	}
}

module.exports = PictTemplateThemeAsset;
