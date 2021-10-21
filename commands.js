Cypress.on('window:before:load', (win) => {
  // this lets React DevTools "see" components inside application's iframe
  win.__REACT_DEVTOOLS_GLOBAL_HOOK__ = window.top.__REACT_DEVTOOLS_GLOBAL_HOOK__
})

Cypress.Commands.add('loading', (timeout = 4000) => {
  cy.findByRole('alert').should('exist')
  cy.findByRole('alert', {timeout}).should('not.exist')
})