/**
 * Loader: reads `Retold-Modules-Manifest.json` (the canonical source for
 * the retold ecosystem) and exposes the data the brand explorer needs in
 * an already-categorized shape.
 *
 * The manifest is the single source of truth for:
 *   - Which modules exist
 *   - Whether each module ships a UI (`Type: 'webapp'`) or is a library
 *   - Curated `Branding` overrides per module (set by tooling — falls
 *     back to programmatic generation when absent)
 *
 * Browserify inlines the JSON file at bundle time via the static require.
 *
 * @author retold-logo-harness
 */
'use strict';

const _Manifest = require('../../../../../../../Retold-Modules-Manifest.json');

/**
 * Return a flat list of every module in the manifest, with Group + Type +
 * Branding hoisted into each entry for direct consumption.
 *
 * @returns {Array<{Name, Group, GroupPath, Description, Type, Branding}>}
 */
function listModules()
{
	let tmpOut = [];
	(_Manifest.Groups || []).forEach((pGroup) =>
	{
		(pGroup.Modules || []).forEach((pModule) =>
		{
			tmpOut.push(
			{
				Name: pModule.Name,
				DisplayName: pModule.DisplayName || pModule.Name,
				HostModule: pModule.HostModule || null,
				Group: pGroup.Name,
				GroupPath: pGroup.Path,
				Path: pModule.Path,
				Description: pModule.Description || '',
				Type: pModule.Type || 'library',
				Branding: pModule.Branding || null
			});
		});
	});
	return tmpOut;
}

/**
 * Split the module list into three top-level streams for the brand explorer:
 *   - `Webapps`  — flat list, full logo treatment (favicon + variants)
 *   - `Examples` — flat list, full logo treatment, carnival-palette branded
 *   - `Libraries` — sub-grouped by manifest group, colors-only treatment
 *
 * @returns {{Webapps: Array, Examples: Array, Libraries: Array<{Name, Modules}>}}
 */
function categorize()
{
	let tmpAll = listModules();
	let tmpWebapps  = tmpAll.filter((pM) => pM.Type === 'webapp');
	let tmpExamples = tmpAll.filter((pM) => pM.Type === 'example');
	let tmpLibraries = tmpAll.filter((pM) => pM.Type !== 'webapp' && pM.Type !== 'example');

	// Group libraries by manifest group, preserving manifest order.
	let tmpGrouped = [];
	let tmpByGroup = {};
	tmpLibraries.forEach((pM) =>
	{
		if (!tmpByGroup[pM.Group])
		{
			tmpByGroup[pM.Group] = { Name: pM.Group, Modules: [] };
			tmpGrouped.push(tmpByGroup[pM.Group]);
		}
		tmpByGroup[pM.Group].Modules.push(pM);
	});

	return {
		Webapps: tmpWebapps,
		Examples: tmpExamples,
		Libraries: tmpGrouped,
		Manifest: _Manifest
	};
}

module.exports =
{
	listModules: listModules,
	categorize: categorize,
	manifest: _Manifest
};
