import 'cypress-file-upload'
import 'cypress-wait-until'
const path = require('path')

Cypress.on('uncaught:exception', (err) => {
  if (err.name === 'AbortError') {
    return false
  }
})

let interceptRequestFile = false
let fileURL

const downloadIntercepter = (url) => {
  if (interceptRequestFile) {
    fileURL = url.toString()
    interceptRequestFile = false
    return true
  }
  return interceptRequestFile
}

Cypress.on('window:before:load', (win) => {
  // this lets React DevTools "see" components inside application's iframe
  win.__REACT_DEVTOOLS_GLOBAL_HOOK__ = window.top.__REACT_DEVTOOLS_GLOBAL_HOOK__
  cy.stub(win, 'open').callsFake((url) => {
    if (downloadIntercepter(url) === false) return win.open.wrappedMethod.call(win, url, '_self')
  })
})

Cypress.Commands.add('loading', (timeout = 4000) => {
  cy.findByRole('alert').should('exist')
  cy.findByRole('alert', { timeout }).should('not.exist')
})

Cypress.Commands.add('getBySel', (selector, ...args) => {
  return cy.get(`[data-test=${selector}]`, ...args)
})

Cypress.Commands.add('getBySelLike', (selector, ...args) => {
  return cy.get(`[data-test*=${selector}]`, ...args)
})

Cypress.Commands.add(
  'waitSpinning',
  ({ delay = 1000, timeout = 60000, interval = 1000, log = false } = {}) => {
    let waited = false
    return cy.waitUntil(
      () => {
        return new Cypress.Promise((resolve, reject) => {
          const hasSpinning = !!Cypress.$('.ant-spin-spinning:visible').length
          if (hasSpinning) {
            waited = false
            reject()
          } else if (!waited) {
            setTimeout(() => {
              waited = true
              reject()
            }, delay)
          } else {
            resolve(true)
          }
        }).catch(() => false)
      },
      {
        timeout,
        interval,
        log,
      },
    )
  },
)

Cypress.Commands.add('currentModal', () => {
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  return cy.wait(1000).root().closest('html').find('.ant-modal-wrap').filter(':visible').last()
})

Cypress.Commands.add('download', { prevSubject: true }, function (subject, options = {}) {
  const { timeout = 20 * 1000, reloadTimeout = 2 * 1000, filename, url } = options
  const downloadsFolder = Cypress.config('downloadsFolder')
  return cy
    .window()
    .document()
    .then(function (doc) {
      let downloadedFilename
      if (filename) {
        downloadedFilename = path.join(downloadsFolder, filename)
      } else if (url) {
        cy.intercept('get', url, (req) =>
          req.reply((res) => {
            const downloadName = res.headers['content-disposition'].match(/filename="(.+)"/)[1]
            downloadedFilename = path.join(downloadsFolder, downloadName)
            res.send(res.body)
            setTimeout(function () {
              doc.location.reload() //trigger page load event for window opened by download
            }, reloadTimeout)
          }),
        )
      }
      return cy
        .wrap(subject)
        .click({ timeout })
        .should(() => {
          expect(downloadedFilename).to.be.a('string')
        })
        .then(() => cy.readFile(downloadedFilename, { timeout }))
        .then(() => downloadedFilename)
    })
})

Cypress.Commands.add('requestFile', { prevSubject: true }, function (subject) {
  const downloadsFolder = Cypress.config('downloadsFolder')
  let downloadedFilename
  interceptRequestFile = true
  return cy
    .wrap(subject)
    .click()
    .should(() => {
      expect(interceptRequestFile).to.be.false
    })
    .then(() => {
      if (fileURL) {
        cy.request({url: fileURL, encoding: 'binary'}).then(({ body, headers }) => {
          const downloadName = headers['content-disposition'].match(/filename="(.+)"/)[1]
          downloadedFilename = path.join(downloadsFolder, downloadName)
          cy.writeFile(downloadedFilename, body, 'binary')
        })
      }
    })
    .should(() => {
      expect(downloadedFilename).to.be.a('string')
    })
    .then(() => {
      return downloadedFilename
    })
})
