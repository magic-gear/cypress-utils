const path = require('path')
module.exports = (on, config) => {
	if (config && config.watchForFileChanges)
		on('before:browser:launch', (browser, launchOptions) => {

			// only load React DevTools extension
			// when opening Chrome in interactive mode
			if (browser.family === 'chromium') {
				// we could also restrict the extension
				// to only load when "browser.isHeaded" is true
				const extensionFolder = path.resolve(__dirname, 'react-devtools')

				launchOptions.args.push(`--load-extension=${extensionFolder}`)

				return launchOptions
			}
		})
}