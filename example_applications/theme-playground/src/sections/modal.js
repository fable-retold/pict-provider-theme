/**
 * pict-section-modal — live demo.
 *
 * Canonical pattern other section files should follow:
 *   1. require the section module at the top
 *   2. register() adds the view to the Pict instance once at boot
 *   3. render() builds demo HTML + wires events that drive the section's API
 *
 * Theme aliases this section relies on: --pict-modal-*  (mapped in both
 * src/themes/playground-starter.json and playground-corp.json).
 */
const libPictSectionModal = require('pict-section-modal');

const VIEW_ID = libPictSectionModal.default_configuration.ViewIdentifier;

module.exports =
{
	id: 'modal',
	name: 'Modal',
	group: 'Notification',
	status: 'live',
	module: 'pict-section-modal',

	register: function (pPict)
	{
		pPict.addView(VIEW_ID, libPictSectionModal.default_configuration, libPictSectionModal);
	},

	render: function (pContainer, pPict)
	{
		pContainer.innerHTML =
			'<h2 class="pg-section-title">pict-section-modal</h2>' +
			'<p class="pg-section-blurb">Real <code>pict-section-modal</code> embedded in this app. Its <code>--pict-modal-*</code> CSS variables are aliased to the active theme\'s tokens — switch themes above and the modal chrome follows.</p>' +
			'<div class="gallery-card">' +
			'  <div class="gallery-row" style="margin-bottom:0;">' +
			'    <button id="demo-modal-toast" class="demo-btn is-primary">Toast (success)</button>' +
			'    <button id="demo-modal-toast-error" class="demo-btn is-danger">Toast (error)</button>' +
			'    <button id="demo-modal-confirm" class="demo-btn">Confirm</button>' +
			'    <button id="demo-modal-show" class="demo-btn">Modal</button>' +
			'  </div>' +
			'</div>';

		let tmpModal = pPict.views[VIEW_ID];
		if (!tmpModal) return;

		document.getElementById('demo-modal-toast').addEventListener('click', () =>
		{
			tmpModal.toast('Saved successfully', { type: 'success', duration: 2400 });
		});
		document.getElementById('demo-modal-toast-error').addEventListener('click', () =>
		{
			tmpModal.toast('Could not reach server', { type: 'error', duration: 3500 });
		});
		document.getElementById('demo-modal-confirm').addEventListener('click', () =>
		{
			tmpModal.confirm('This cannot be undone.',
				{ title: 'Delete draft?', confirmLabel: 'Delete', cancelLabel: 'Cancel', dangerous: true })
				.then((pOK) =>
				{
					if (pOK) tmpModal.toast('Draft deleted', { type: 'info' });
				});
		});
		document.getElementById('demo-modal-show').addEventListener('click', () =>
		{
			tmpModal.show({
				title: 'Edit Record',
				content: '<p>Themed via the active pict-provider-theme bundle. The modal\'s <code>--pict-modal-*</code> CSS variables are aliased to your tokens.</p>',
				buttons: [
					{ Hash: 'cancel', Label: 'Cancel' },
					{ Hash: 'save',   Label: 'Save', Style: 'primary' }
				]
			});
		});
	}
};
