const path = require('path')
module.exports = (on, config) => {
	console.log(config)
	if (config && config.watchForFileChanges)
		on('before:browser:launch', (browser, launchOptions) => {
			console.log('launching browser %o', browser)

			// only load React DevTools extension
			// when opening Chrome in interactive mode
			if (browser.family === 'chromium') {
				// we could also restrict the extension
				// to only load when "browser.isHeaded" is true
				const extensionFolder = path.resolve(__dirname, 'react-devtools')

				console.log('adding React DevTools extension from', extensionFolder)
				launchOptions.args.push(`--load-extension=${extensionFolder}`)

				return launchOptions
			}
		})
}