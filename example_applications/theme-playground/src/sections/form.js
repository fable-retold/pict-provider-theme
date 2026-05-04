/**
 * pict-section-form — dynamic form via the PictFormMetacontroller view.
 *
 * Special case: form's metacontroller reads its manifest from
 * fable.settings.DefaultFormManifest in onAfterInitializeAsync.  We stash
 * the manifest THERE before the application's addView fires, so the
 * metacontroller boots up with sections + descriptors ready to render.
 */
const libPictView = require('pict-view');
const libPictSectionForm = require('pict-section-form');

const SECTION_VIEW_ID = 'PictFormMetacontroller';
const WRAPPER_VIEW_ID = 'Playground-FormWrapper';
const TARGET_ID = 'Playground-FormWrapper-Destination';
const FORM_TARGET_ID = 'Pict-Form-Container';

const SAMPLE_MANIFEST =
{
	Scope: 'PlaygroundForm',
	Sections:
	[
		{ Hash: 'Person',      Name: 'Personal Details', Description: 'A small representative form.' },
		{ Hash: 'Preferences', Name: 'Preferences' }
	],
	Descriptors:
	{
		FirstName:       { Name: 'First name',       Hash: 'FirstName',       DataType: 'String',  Default: '',     PictForm: { Section: 'Person', Row: 1, Width: 6 } },
		LastName:        { Name: 'Last name',        Hash: 'LastName',        DataType: 'String',  Default: '',     PictForm: { Section: 'Person', Row: 1, Width: 6 } },
		Age:             { Name: 'Age',              Hash: 'Age',             DataType: 'Number',  Default: 30,     PictForm: { Section: 'Person', Row: 2, Width: 4 } },
		Bio:             { Name: 'Short bio',        Hash: 'Bio',             DataType: 'String',  Default: '',     PictForm: { Section: 'Person', Row: 3, Width: 12, InputType: 'Textarea' } },
		PrefersDarkMode: { Name: 'Prefers dark mode',Hash: 'PrefersDarkMode', DataType: 'Boolean', Default: true,   PictForm: { Section: 'Preferences', Row: 1, Width: 4, InputType: 'Checkbox' } },
		FavoriteColor:   { Name: 'Favorite color',   Hash: 'FavoriteColor',   DataType: 'String',  Default: 'blue', PictForm: { Section: 'Preferences', Row: 1, Width: 4, InputType: 'Select' },
			Options: [ { Value: 'red', Label: 'Red' }, { Value: 'blue', Label: 'Blue' }, { Value: 'green', Label: 'Green' } ] }
	}
};

class PictViewPlaygroundFormWrapper extends libPictView
{
	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		this.pict.CSSMap.injectCSS();
		let tmpInner = this.pict.views[SECTION_VIEW_ID];
		if (tmpInner)
		{
			try
			{
				if (typeof tmpInner.bootstrapPictFormViewsFromManifest === 'function' && !tmpInner.manifestDescription)
				{
					tmpInner.bootstrapPictFormViewsFromManifest(SAMPLE_MANIFEST);
				}
				tmpInner.render();
			}
			catch (pErr)
			{
				let tmpDest = document.getElementById(FORM_TARGET_ID);
				if (tmpDest) tmpDest.innerHTML = '<p style="color:var(--theme-color-status-warning);">Inner render failed: ' + pErr.message + '</p>';
			}
		}
		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}
}

module.exports = {
	id: 'form',
	name: 'Form',
	group: 'Form',
	module: 'pict-section-form',
	ViewIdentifier: WRAPPER_VIEW_ID,
	ViewClass: PictViewPlaygroundFormWrapper,
	DestinationId: TARGET_ID,
	ViewConfiguration:
	{
		ViewIdentifier: WRAPPER_VIEW_ID,
		DefaultRenderable: 'Playground-FormWrapper-Content',
		DefaultDestinationAddress: '#' + TARGET_ID,
		AutoRender: false,
		Templates:
		[
			{
				Hash: 'Playground-FormWrapper-Content',
				Template: /*html*/`
<h2 class="pg-section-title">pict-section-form</h2>
<p class="pg-section-blurb">Dynamic form built from a Manyfest schema by the <code>PictFormMetacontroller</code> view.</p>
<div class="gallery-card">
	<div id="${FORM_TARGET_ID}" style="min-height: 360px;"></div>
</div>`
			}
		],
		Renderables:
		[
			{
				RenderableHash: 'Playground-FormWrapper-Content',
				TemplateHash: 'Playground-FormWrapper-Content',
				DestinationAddress: '#' + TARGET_ID,
				RenderMethod: 'replace'
			}
		]
	},

	setup: function (pPict)
	{
		// Stash manifest BEFORE registering metacontroller so its
		// onAfterInitializeAsync sees it.
		pPict.settings.DefaultFormManifest = SAMPLE_MANIFEST;
		try { pPict.addServiceType('PictSectionForm', libPictSectionForm); } catch (pErr) { /* */ }
		try
		{
			pPict.addView(SECTION_VIEW_ID,
				{
					ViewIdentifier: SECTION_VIEW_ID,
					DefaultRenderable: 'Pict-Forms-Metacontainer',
					DefaultDestinationAddress: '#' + FORM_TARGET_ID,
					AutoRender: false
				},
				libPictSectionForm.PictFormMetacontroller);
		}
		catch (pErr) { /* */ }
	}
};
