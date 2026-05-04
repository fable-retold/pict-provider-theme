const libPictSectionLogin = require('pict-section-login');
const { buildSection } = require('./_wrapper.js');

module.exports = buildSection({
	id: 'login', name: 'Login', group: 'Auth', module: 'pict-section-login',
	WrapperViewId: 'Playground-LoginWrapper',
	WrapperTargetId: 'Playground-LoginWrapper-Destination',
	InnerViewId: 'Playground-Login',
	InnerTargetId: 'Pict-Login-Container',
	InnerViewClass: libPictSectionLogin,
	InnerContainerStyle: 'min-height: 280px;',
	Title: 'pict-section-login',
	Blurb: 'Reusable login form. Demo only — submit handler is a no-op.'
});
