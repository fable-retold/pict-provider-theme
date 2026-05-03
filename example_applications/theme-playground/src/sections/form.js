/**
 * pict-section-form — dynamic form section.
 *
 * Form is the "metacontroller" pattern: a top-level controller view
 * (PictFormMetacontroller) reads a Manyfest schema, generates section
 * sub-views from it, and renders them.  The schema is provided through
 * fable.settings.DefaultFormManifest (read by the metacontroller during
 * onAfterInitializeAsync).
 *
 * For the playground we register the metacontroller view once at boot and
 * expose a sample manifest in pict.settings.DefaultFormManifest.  Render
 * mounts the metacontroller into the section's container.
 */
const libPictSectionForm = require('pict-section-form');

const VIEW_ID = 'PictFormMetacontroller';
const TARGET_ID = 'Pict-Form-Container';

const SAMPLE_MANIFEST =
{
	Scope: 'PlaygroundForm',
	Sections:
	[
		{
			Hash: 'Person',
			Name: 'Personal Details',
			Description: 'A small representative form to demonstrate every form input type.'
		},
		{
			Hash: 'Preferences',
			Name: 'Preferences'
		}
	],
	Descriptors:
	{
		FirstName:
		{
			Name: 'First name', Hash: 'FirstName', DataType: 'String', Default: '',
			PictForm: { Section: 'Person', Row: 1, Width: 6 }
		},
		LastName:
		{
			Name: 'Last name', Hash: 'LastName', DataType: 'String', Default: '',
			PictForm: { Section: 'Person', Row: 1, Width: 6 }
		},
		Age:
		{
			Name: 'Age', Hash: 'Age', DataType: 'Number', Default: 30,
			PictForm: { Section: 'Person', Row: 2, Width: 4 }
		},
		Bio:
		{
			Name: 'Short bio', Hash: 'Bio', DataType: 'String', Default: '',
			PictForm: { Section: 'Person', Row: 3, Width: 12, InputType: 'Textarea' }
		},
		PrefersDarkMode:
		{
			Name: 'Prefers dark mode', Hash: 'PrefersDarkMode', DataType: 'Boolean', Default: true,
			PictForm: { Section: 'Preferences', Row: 1, Width: 4, InputType: 'Checkbox' }
		},
		FavoriteColor:
		{
			Name: 'Favorite color', Hash: 'FavoriteColor', DataType: 'String', Default: 'blue',
			PictForm: { Section: 'Preferences', Row: 1, Width: 4, InputType: 'Select' },
			Options: [{ Value: 'red', Label: 'Red' }, { Value: 'blue', Label: 'Blue' }, { Value: 'green', Label: 'Green' }]
		}
	}
};

let _registered = false;

module.exports =
{
	id: 'form',
	name: 'Form',
	group: 'Form',
	status: 'live',
	module: 'pict-section-form',

	register: function (pPict)
	{
		// Register the form section service so dynamic form sub-views can find it.
		try { pPict.addServiceType('PictSectionForm', libPictSectionForm); }
		catch (pErr) { /* already registered */ }

		// Stash the manifest where the metacontroller will pick it up.
		pPict.settings.DefaultFormManifest = SAMPLE_MANIFEST;

		// Add the metacontroller view (a regular pict view).  Without registering
		// it here, no PictForm-* sub-view scopes get bootstrapped.
		if (!_registered)
		{
			pPict.addView(VIEW_ID,
				{
					ViewIdentifier: VIEW_ID,
					DefaultRenderable: 'Pict-Forms-Metacontainer',
					DefaultDestinationAddress: '#' + TARGET_ID,
					AutoRender: false
				},
				libPictSectionForm.PictFormMetacontroller);
			_registered = true;
		}
	},

	render: function (pContainer, pPict)
	{
		pContainer.innerHTML =
			'<h2 class="pg-section-title">pict-section-form</h2>' +
			'<p class="pg-section-blurb">Dynamic form built from a Manyfest schema by the <code>PictFormMetacontroller</code> view. Schema lives in <code>pict.settings.DefaultFormManifest</code>.</p>' +
			'<div class="gallery-card">' +
			'  <div id="' + TARGET_ID + '" style="min-height: 360px;"></div>' +
			'</div>';

		let tmpView = pPict.views[VIEW_ID];
		if (!tmpView) return;
		try
		{
			// Bootstrap from the manifest in case it wasn't picked up at init time
			// (settings.DefaultFormManifest may have been set after addView).
			if (typeof tmpView.bootstrapPictFormViewsFromManifest === 'function')
			{
				tmpView.bootstrapPictFormViewsFromManifest(SAMPLE_MANIFEST);
			}
			tmpView.render();
		}
		catch (pErr)
		{
			document.getElementById(TARGET_ID).innerHTML =
				'<p style="color: var(--theme-color-status-warning);">Render failed: ' + pErr.message + '</p>';
		}
	}
};
