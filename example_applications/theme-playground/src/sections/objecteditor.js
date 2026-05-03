/**
 * pict-section-objecteditor — JSON object editor (tree of typed nodes).
 *
 * Standalone — only depends on pict-view.  Sample data lives in AppData.
 */
const libPictSectionObjectEditor = require('pict-section-objecteditor');

// Node-type renderers must be registered as service types so the editor's
// constructor can instantiateServiceProviderWithoutRegistration() them.
const _NodeServiceTypes =
{
	'PictViewObjectEditorNodeString':  libPictSectionObjectEditor.PictViewObjectEditorNodeString,
	'PictViewObjectEditorNodeNumber':  libPictSectionObjectEditor.PictViewObjectEditorNodeNumber,
	'PictViewObjectEditorNodeBoolean': libPictSectionObjectEditor.PictViewObjectEditorNodeBoolean,
	'PictViewObjectEditorNodeNull':    libPictSectionObjectEditor.PictViewObjectEditorNodeNull,
	'PictViewObjectEditorNodeObject':  libPictSectionObjectEditor.PictViewObjectEditorNodeObject,
	'PictViewObjectEditorNodeArray':   libPictSectionObjectEditor.PictViewObjectEditorNodeArray
};

const VIEW_ID = 'Playground-ObjectEditor';
const TARGET_ID = 'Playground-ObjectEditor-Container';

const SAMPLE_OBJECT =
{
	app:
	{
		name: 'Theme Playground',
		version: '0.0.1',
		debug: false,
		modes: ['light', 'dark', 'system']
	},
	limits:
	{
		maxRetries: 3,
		timeoutMs: 5000
	},
	tags: ['ui', 'theme', 'demo'],
	owner: null
};

let _mounted = false;

module.exports =
{
	id: 'objecteditor',
	name: 'Object Editor',
	group: 'Form',
	status: 'live',
	module: 'pict-section-objecteditor',

	register: function (pPict)
	{
		Object.keys(_NodeServiceTypes).forEach((pName) =>
		{
			try { pPict.addServiceType(pName, _NodeServiceTypes[pName]); }
			catch (pErr) { /* already registered */ }
		});
	},

	render: function (pContainer, pPict)
	{
		pContainer.innerHTML =
			'<h2 class="pg-section-title">pict-section-objecteditor</h2>' +
			'<p class="pg-section-blurb">JSON object editor — tree of typed nodes (string / number / boolean / null / object / array). Editable in place.</p>' +
			'<div class="gallery-card">' +
			'  <div id="' + TARGET_ID + '" style="min-height: 320px;"></div>' +
			'</div>';

		if (!pPict.AppData.Playground) pPict.AppData.Playground = {};
		pPict.AppData.Playground.SampleObject = JSON.parse(JSON.stringify(SAMPLE_OBJECT));

		if (!_mounted)
		{
			try
			{
				pPict.addView(VIEW_ID,
					{
						ViewIdentifier: VIEW_ID,
						DefaultRenderable: 'ObjectEditor-Container',
						DefaultDestinationAddress: '#' + TARGET_ID,
						AutoRender: false,
						ObjectDataAddress: 'AppData.Playground.SampleObject',
						InitialExpandDepth: 2,
						Editable: true,
						ShowTypeIndicators: true,
						Renderables:
						[
							{
								RenderableHash: 'ObjectEditor-Container',
								TemplateHash: 'ObjectEditor-Container-Template',
								DestinationAddress: '#' + TARGET_ID,
								RenderMethod: 'replace'
							}
						]
					},
					libPictSectionObjectEditor);
				_mounted = true;
			}
			catch (pErr)
			{
				document.getElementById(TARGET_ID).innerHTML =
					'<p style="color: var(--theme-color-status-warning);">Mount failed: ' + pErr.message + '</p>';
				return;
			}
		}

		let tmpView = pPict.views[VIEW_ID];
		if (tmpView)
		{
			tmpView.initialRenderComplete = false;
			try { tmpView.render(); }
			catch (pErr)
			{
				document.getElementById(TARGET_ID).innerHTML =
					'<p style="color: var(--theme-color-status-warning);">Render failed: ' + pErr.message + '</p>';
			}
		}
	}
};
