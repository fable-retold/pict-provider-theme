const libPictSectionFormEditor = require('pict-section-formeditor');
const { buildSection } = require('./_wrapper.js');

module.exports = buildSection({
	id: 'formeditor', name: 'Form Editor', group: 'Form', module: 'pict-section-formeditor',
	WrapperViewId: 'Playground-FormEditorWrapper',
	WrapperTargetId: 'Playground-FormEditorWrapper-Destination',
	InnerViewId: 'Playground-FormEditor',
	InnerTargetId: 'FormEditor-Container',
	InnerViewClass: libPictSectionFormEditor,
	InnerContainerStyle: 'min-height: 480px;',
	Title: 'pict-section-formeditor',
	Blurb: 'Visual editor for form manifests. Pulls in modal, content, code, markdowneditor, objecteditor, flow.',
	InnerViewConfiguration: Object.assign({}, libPictSectionFormEditor.default_configuration || {})
});
