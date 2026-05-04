/**
 * pict-section-markdowneditor — segmented markdown editor.
 *
 * Per pict-section-markdowneditor's markdown_editor example:
 *   - ContentDataAddress points at the segments ARRAY directly,
 *     not a wrapper object.  AppData.Document.Segments = [{ Content: ... }, ...].
 */
const libPictSectionMarkdownEditor = require('pict-section-markdowneditor');
const { buildSection } = require('./_wrapper.js');

module.exports = buildSection({
	id: 'markdowneditor', name: 'Markdown Editor', group: 'Editor', module: 'pict-section-markdowneditor',
	WrapperViewId: 'Playground-MarkdownEditorWrapper',
	WrapperTargetId: 'Playground-MarkdownEditorWrapper-Destination',
	InnerViewId: 'Playground-MarkdownEditor',
	InnerTargetId: 'Playground-MarkdownEditor-Container',
	InnerViewClass: libPictSectionMarkdownEditor,
	InnerContainerStyle: 'min-height: 360px;',
	Title: 'pict-section-markdowneditor',
	Blurb: 'Segmented markdown editor with live preview. Uses <code>--pict-mde-*</code> internally.',
	InnerViewConfiguration: { ContentDataAddress: 'AppData.Document.Segments' },
	AdditionalSetup: function (pPict)
	{
		if (!pPict.AppData.Document) pPict.AppData.Document = {};
		pPict.AppData.Document.Segments =
		[
			{ Content: '# Welcome to the Markdown Editor\n\nThis is the first segment. Start typing here.' },
			{ Content: '## Second Section\n\nYou can add, remove, and reorder segments.' },
			{ Content: '## Diagrams & Math\n\n```mermaid\ngraph LR;\n    A[Editor] --> B[Preview];\n    B --> C[Rendered];\n```\n\nEinstein\'s equation: $E=mc^2$' }
		];
	}
});
