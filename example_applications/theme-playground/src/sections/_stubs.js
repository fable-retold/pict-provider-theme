/**
 * Stub section descriptors for every pict-section-* module that hasn't been
 * wired yet.  Each one renders a "to wire" panel showing the recipe so the
 * playground can be expanded incrementally without losing context.
 *
 * To convert a stub to live:
 *   1. cp src/sections/modal.js src/sections/<name>.js
 *   2. Edit the require + ViewIdentifier + demo HTML + event wiring
 *   3. Replace the stub entry in this file with require('./<name>.js')
 *   4. Add the section's `--*` aliases to both starter themes
 */

const _PendingSections =
[
	{ id: 'code',                 name: 'Code Editor',          group: 'Editor',         module: 'pict-section-code' },
	{ id: 'content',              name: 'Content / Markdown',   group: 'Document',       module: 'pict-section-content' },
	{ id: 'markdowneditor',       name: 'Markdown Editor',      group: 'Editor',         module: 'pict-section-markdowneditor' },
	{ id: 'inlinedocumentation',  name: 'Inline Documentation', group: 'Document',       module: 'pict-section-inlinedocumentation' },
	{ id: 'form',                 name: 'Form',                 group: 'Form',           module: 'pict-section-form' },
	{ id: 'formeditor',           name: 'Form Editor',          group: 'Form',           module: 'pict-section-formeditor' },
	{ id: 'objecteditor',         name: 'Object Editor',        group: 'Form',           module: 'pict-section-objecteditor' },
	{ id: 'tuigrid',              name: 'TUI Grid',             group: 'Data',           module: 'pict-section-tuigrid' },
	{ id: 'recordset',            name: 'Recordset',            group: 'Data',           module: 'pict-section-recordset' },
	{ id: 'entitymanagement',     name: 'Entity Management',    group: 'Data',           module: 'pict-section-entitymanagement' },
	{ id: 'usermanagement',       name: 'User Management',      group: 'Auth',           module: 'pict-section-usermanagement' },
	{ id: 'login',                name: 'Login',                group: 'Auth',           module: 'pict-section-login' },
	{ id: 'filebrowser',          name: 'File Browser',         group: 'Navigation',     module: 'pict-section-filebrowser' },
	{ id: 'flow',                 name: 'Flow Diagram',         group: 'Visualization',  module: 'pict-section-flow' },
	{ id: 'histogram',            name: 'Histogram',            group: 'Visualization',  module: 'pict-section-histogram' },
	{ id: 'equation',             name: 'Equation',             group: 'Visualization',  module: 'pict-section-equation' },
	{ id: 'openseadragon',        name: 'OpenSeadragon Viewer', group: 'Visualization',  module: 'pict-section-openseadragon' }
];

function buildStubRender(pName, pModuleName)
{
	return function (pContainer)
	{
		pContainer.innerHTML =
			'<h2 class="pg-section-title">' + pName + ' <span class="pg-stub-badge">stub</span></h2>' +
			'<p class="pg-section-blurb">This section is a placeholder for <code>' + pModuleName + '</code>. To wire it:</p>' +
			'<ol class="pg-recipe">' +
			'  <li>Add <code>"' + pModuleName + '": "^x.y.z"</code> to <code>package.json</code> dependencies.</li>' +
			'  <li>Copy <code>src/sections/modal.js</code> to <code>src/sections/' + pModuleName.replace(/^pict-section-/, '') + '.js</code> and edit:' +
			'    <ul>' +
			'      <li><code>require(\'' + pModuleName + '\')</code> at the top</li>' +
			'      <li>ViewIdentifier (or whatever export is the view)</li>' +
			'      <li>The <code>render()</code> body with a representative demo</li>' +
			'    </ul>' +
			'  </li>' +
			'  <li>Replace this stub entry in <code>src/sections/_stubs.js</code> by importing your new file in <code>_registry.js</code>.</li>' +
			'  <li>Add the section\'s <code>--*</code> CSS variable aliases to both:' +
			'    <ul>' +
			'      <li><code>src/themes/playground-starter.json</code></li>' +
			'      <li><code>src/themes/playground-corp.json</code></li>' +
			'    </ul>' +
			'  </li>' +
			'  <li>Run <code>npm run build</code> and reload.</li>' +
			'</ol>';
	};
}

module.exports = _PendingSections.map((pStub) => (
{
	id: pStub.id,
	name: pStub.name,
	group: pStub.group,
	status: 'stub',
	module: pStub.module,
	register: function () {},
	render: buildStubRender(pStub.name, pStub.module)
}));
