/**
 * Section registry — the navigable list shown in the left rail.
 */
const libBaseComponents = require('./base-components.js');
const libModal = require('./modal.js');
const libCode = require('./code.js');
const libContent = require('./content.js');
const libMarkdownEditor = require('./markdowneditor.js');
const libInlineDoc = require('./inlinedocumentation.js');
const libForm = require('./form.js');
const libFormEditor = require('./formeditor.js');
const libObjectEditor = require('./objecteditor.js');
const libTuiGrid = require('./tuigrid.js');
const libRecordSet = require('./recordset.js');
const libEntityManagement = require('./entitymanagement.js');
const libUserManagement = require('./usermanagement.js');
const libLogin = require('./login.js');
const libFileBrowser = require('./filebrowser.js');
const libFlow = require('./flow.js');
const libHistogram = require('./histogram.js');
const libEquation = require('./equation.js');
const libOpenSeaDragon = require('./openseadragon.js');
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
				'  <p>Every <code>pict-section-*</code> module is wired live. The <strong>Base Components</strong> page is a hand-rendered kitchen-sink that uses only <code>--theme-*</code> custom properties.</p>' +
				'</div>';
		}
	},

	libBaseComponents,
	libModal,
	libCode,
	libContent,
	libMarkdownEditor,
	libInlineDoc,
	libForm,
	libFormEditor,
	libObjectEditor,
	libTuiGrid,
	libRecordSet,
	libEntityManagement,
	libUserManagement,
	libLogin,
	libFileBrowser,
	libFlow,
	libHistogram,
	libEquation,
	libOpenSeaDragon
]
.concat(libStubs);
