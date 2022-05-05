# cypress-utils

## open cypress with chrome react dev tools extension installed

``` javascript
// cypress/plugins/index.js
const cypressUtils = require('@magic-gear/cypress-utils')

module.exports = (on, config) => {
  on('before:browser:launch', (browser, options) => {
    cypressUtils.installReactDevTools(browser, options)
    return options
	})
}
```
