// Suppress extension context invalidated errors globally
window.addEventListener('error', event => {
	if (event.error && event.error.message.includes('Extension context invalidated')) {
		event.preventDefault();
	}
});
window.addEventListener('unhandledrejection', event => {
	if (event.reason && event.reason.message.includes('Extension context invalidated')) {
		event.preventDefault();
	}
});
