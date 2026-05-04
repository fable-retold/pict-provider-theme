const libPictSectionObjectEditor = require('pict-section-objecteditor');
const { buildSection } = require('./_wrapper.js');

const SAMPLE_OBJECT =
{
	app: { name: 'Theme Playground', version: '0.0.1', debug: false, modes: ['light', 'dark', 'system'] },
	limits: { maxRetries: 3, timeoutMs: 5000 },
	tags: ['ui', 'theme', 'demo'],
	owner: null
};

module.exports = buildSection({
	id: 'objecteditor', name: 'Object Editor', group: 'Form', module: 'pict-section-objecteditor',
	WrapperViewId: 'Playground-ObjectEditorWrapper',
	WrapperTargetId: 'Playground-ObjectEditorWrapper-Destination',
	InnerViewId: 'Playground-ObjectEditor',
	InnerTargetId: 'Playground-ObjectEditor-Container',
	InnerViewClass: libPictSectionObjectEditor,
	Title: 'pict-section-objecteditor',
	Blurb: 'JSON object editor — tree of typed nodes (string / number / boolean / null / object / array). Editable in place.',
	ServiceTypes:
	{
		'PictViewObjectEditorNodeString':  libPictSectionObjectEditor.PictViewObjectEditorNodeString,
		'PictViewObjectEditorNodeNumber':  libPictSectionObjectEditor.PictViewObjectEditorNodeNumber,
		'PictViewObjectEditorNodeBoolean': libPictSectionObjectEditor.PictViewObjectEditorNodeBoolean,
		'PictViewObjectEditorNodeNull':    libPictSectionObjectEditor.PictViewObjectEditorNodeNull,
		'PictViewObjectEditorNodeObject':  libPictSectionObjectEditor.PictViewObjectEditorNodeObject,
		'PictViewObjectEditorNodeArray':   libPictSectionObjectEditor.PictViewObjectEditorNodeArray
	},
	InnerViewConfiguration:
	{
		DefaultRenderable: 'ObjectEditor-Container',
		ObjectDataAddress: 'AppData.Playground.SampleObject',
		InitialExpandDepth: 2,
		Editable: true,
		ShowTypeIndicators: true,
		Renderables:
		[
			{
				RenderableHash: 'ObjectEditor-Container',
				TemplateHash: 'ObjectEditor-Container-Template',
				DestinationAddress: '#Playground-ObjectEditor-Container',
				RenderMethod: 'replace'
			}
		]
	},
	AdditionalSetup: function (pPict)
	{
		if (!pPict.AppData.Playground) pPict.AppData.Playground = {};
		pPict.AppData.Playground.SampleObject = JSON.parse(JSON.stringify(SAMPLE_OBJECT));
	}
});
