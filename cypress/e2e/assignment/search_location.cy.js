describe('Shell Recharge app', () => {
  
  const localeCountryMap = {
    'en-gb': 'United Kingdom',  // Key: locale, Value: country name
  };
  
  const locale = 'en-gb';

  beforeEach(() => {
    // set cookie to disable the cookie preference modal
    cy.setCookie('_SRS_cookie_consent', '');

    // set viewport to make sure all the countries appear in the dropdown
    cy.viewport('macbook-11');

    // intercept requests
    cy.intercept('GET', `/_next/data/*/${locale}/solutions.json`).as('fetchSolutionsData');
    cy.intercept('GET', 'https://maps.googleapis.com/maps/api/mapsjs/gen_204?csp_test=true').as('googleMapsCspTest');
  });

  it.only('search location', () => {

    // visit the page
    cy.visit('https://shellrecharge.com/en')

    // click the menubar and select UK
    cy.get('[role=menubar]').click();
    cy.contains(localeCountryMap[locale]).click();
    
    // assert that the path matches the expected language code
    cy.location('pathname').should('eq', `/${locale}/solutions`);
    cy.wait('@fetchSolutionsData');

    // open 'My Account' page in the same tab
    cy.get('a[data-text="My account"]').invoke('removeAttr', 'target').click();
    
    // wait for the corresponding request
    cy.wait('@googleMapsCspTest');

    // assert that URL path is changed accordingly
    cy.location('pathname').should('eq', '/');

    // interact with the iframe to search for a location
    cy.get('iframe[title="Shell Recharge Map"]').its('0.contentDocument.body')
      .then(cy.wrap)
      .find('input[placeholder="Search by location"]').type('Wales');
  });
});
