/**
 * Deferred section stubs — sections that don't fit the playground's
 * wrapper-view pattern cleanly because they extend application BASE
 * classes (PictRecordSetApplication / PictEntityManagementApplication)
 * rather than mountable views.  Each renders a recipe panel.
 */
const libPictView = require('pict-view');

function buildStub(pSpec)
{
	let tmpRenderableHash = pSpec.id + '-Stub-Content';
	let tmpDestId = 'Playground-Section-' + pSpec.id + '-Destination';
	class StubView extends libPictView {}
	return {
		id: pSpec.id,
		name: pSpec.name,
		group: pSpec.group,
		module: pSpec.module,
		ViewIdentifier: 'Playground-' + pSpec.id + '-Stub',
		ViewClass: StubView,
		DestinationId: tmpDestId,
		ViewConfiguration:
		{
			ViewIdentifier: 'Playground-' + pSpec.id + '-Stub',
			DefaultRenderable: tmpRenderableHash,
			DefaultDestinationAddress: '#' + tmpDestId,
			AutoRender: false,
			Templates:
			[
				{
					Hash: tmpRenderableHash,
					Template:
						'<h2 class="pg-section-title">' + pSpec.name + ' <span class="pg-stub-badge">deferred</span></h2>' +
						'<p class="pg-section-blurb">' + pSpec.module + ' extends an application BASE class (not a mountable view), so it can\'t be embedded as a sub-view in the playground without a substantial refactor of the section module. ' + pSpec.blurb + '</p>' +
						'<div class="gallery-card"><p>See <code>' + pSpec.example + '</code> for a working app built on this section.</p></div>'
				}
			],
			Renderables:
			[
				{
					RenderableHash: tmpRenderableHash,
					TemplateHash: tmpRenderableHash,
					DestinationAddress: '#' + tmpDestId,
					RenderMethod: 'replace'
				}
			]
		}
	};
}

module.exports =
[
	buildStub({
		id: 'recordset', name: 'Recordset', group: 'Data', module: 'pict-section-recordset',
		blurb: 'Combines pict-section-form + pict-section-tuigrid + pict-router + a data source over a Manyfest schema.',
		example: 'pict-section-recordset/example_applications/bookstore'
	}),
	buildStub({
		id: 'entitymanagement', name: 'Entity Management', group: 'Data', module: 'pict-section-entitymanagement',
		blurb: 'Builds on pict-section-recordset + pict-section-form to provide entity-level CRUD with a Meadow-style schema.',
		example: 'pict-section-entitymanagement/example_applications/simple_example'
	})
];
