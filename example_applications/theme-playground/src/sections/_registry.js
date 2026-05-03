/**
 * Section registry — the navigable list shown in the left rail.
 *
 * Each entry is a small module with this shape:
 *   {
 *     id:       'modal',          // url slug (#/section/modal)
 *     name:     'Modal',          // display name
 *     group:    'Notification',   // left-nav grouping header
 *     status:   'live' | 'stub',  // 'stub' renders a pre-built "to wire" panel
 *     module?:  'pict-section-…', // npm name (informational)
 *     register: function(pict)    { ... },  // called once at boot for live sections
 *     render:   function(container, pict, helpers) { ... }  // called per nav
 *   }
 *
 * To wire a stub section:
 *   1. npm install pict-section-<name>
 *   2. Replace the corresponding require below with the live module
 *      (see modal.js for the canonical pattern).
 *   3. Add the section's `--*` CSS variables to the Aliases block in
 *      both src/themes/playground-starter.json and playground-corp.json.
 */
const libBaseComponents = require('./base-components.js');
const libModal = require('./modal.js');
const libStubs = require('./_stubs.js');

module.exports =
[
	{
		id: 'welcome',
		name: 'Welcome',
		group: 'Overview',
		status: 'live',
		register: function () {},
		render: function (pContainer)
		{
			pContainer.innerHTML =
				'<div class="pg-welcome">' +
				'  <h2>pict-provider-theme Playground</h2>' +
				'  <p>Edit tokens, CSS, or imagery on the right. Pick a theme + mode at the top. Browse component sections on the left.</p>' +
				'  <p>The <strong>Base Components</strong> page is a hand-rendered kitchen-sink that uses only <code>--theme-*</code> custom properties — it works under any theme without modification.</p>' +
				'  <p>Sections marked <em>(stub)</em> are placeholders for the corresponding <code>pict-section-*</code> module. Wire them by following the pattern in <code>src/sections/modal.js</code>.</p>' +
				'</div>';
		}
	},

	libBaseComponents,
	libModal
]
.concat(libStubs);
