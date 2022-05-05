const path = require('path')
const installReactDevTools = (browser, launchOptions) => {
	if (browser.family === 'chromium') {
		if (browser.isHeaded) {
			const extensionFolder = path.resolve(__dirname, 'react-devtools')
			launchOptions.args.push(`--load-extension=${extensionFolder}`)
		}
	}
	return launchOptions
}
const hookInstallReactDevTools =  (on, config) => {
	if (config && config.watchForFileChanges) {
		on('before:browser:launch', installReactDevTools)
	}
}
hookInstallReactDevTools.installReactDevTools = installReactDevTools
module.exports = hookInstallReactDevTools