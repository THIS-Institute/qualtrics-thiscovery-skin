# Skin Versions

## 2.0

Adaptations on pre-existing CSS and script additions for minor features and fixes on existing surveys

### 2.0.0

#### JavaScript

- creation of div.header-content markup into div#Header, logo and back-button
- building of colophon modals to dupe T&C modals from WordPress site, links in footer
- addition of div.footer-content into markup into #Footer, logos, colophon links
- addition of HubSpot snippet after WordPress site (because of domain jump)
- dynamic graph addition - via .thisco-graph class and data-graphlink=[URL] attribute
- ranking questions via ranking_question.js (used???)
- Qualtrics hack to move validation errors to better position
- (skinjob + socket.io snippet for dev)

#### CSS

- base.scss - #Header styles, #Footer styles, #Plug hidden, .number-bubble 
- buttons.scss - button improvements, back button for header
- policy-modals.scss - styles for the colophon modals
- (from 2.1.0) - ranking question styling (contains retro tweaks)

## 2.1

Ejects Qualtrics base styles and starts from scratch - expects no per-question scripts, tries to amalgamate all into one script

### 2.1.0

NB Q reloads and executes bundle.min.js on every 'Next' click, 2.1.0 does not anticipate that (ie. a new instance of the bundle keeps being loaded and run)

#### JavaScript

- ejects any stylesheet that does not include 'thiscovery' or 'localhost'
- horizontal radio groups turned into Likert scale
- thisco_modals.js
- link_buttons.js (single link buttons)
- expand_textareas.js (auto-expand)
- validation.js - custom validation classes, and a catch-all modal for Qualtrics messages
- creation of div.header-content markup into div#Header, logo and back-button
- building of colophon modals to dupe T&C modals from WordPress site, links in footer
- addition of div.footer-content into markup into #Footer, logos, colophon links
- addition of HubSpot snippet after WordPress site (because of domain jump)
- consent form markup for switches
- consent snippet to push consent statements back to Qualtrics embedded data
- (skinjob + socket.io snippet for dev)
- [ ] Qualtrics fix - `<p>` wrap in .QuestionText when immediate children are text nodes or non-block


#### CSS

- [x] reset-and-normalize
- [x] base.scss: base styles, links, lists, headings, .number-bubble, .sr-hidden, misc utilities
- [x] buttons.scss: button styles, special buttons, link buttons
- [x] policy-modals.scss - styles for the colophon modals
- [x] panels.scss: statements, alert/error panels, pre
- [x] forms.scss: basic input styles, radios, checkboxes, select, textareas, label formatting
- [x] modals.scss: modals
- [x] scales.scss: likert-style horizontal radio groups
- [x] ranking.scss: styles for select-and-rank control
- [x] consent.scss: consent switches
- [x] pageerror.scss: utility for Qualtrics system error messages
- [x] form fields
- [x] CROSS-BROWSER CHECKS


### 2.1.1

Script needs to be split into setup() and reset() to persist script across 'Next' clicks - allowing element outside JFEContent (progress and validation)

#### JavaScript

- [ ] multiline array input functionality
- [ ] progress dial markup (from Qualtrics measure?)
- [ ] validation warnings in-screen
- [ ] element invalid markup classes

#### CSS

- [ ] multiline array input
- [ ] progress dial + animation (from Qualtrics measure?)
- [ ] validation warnings + animation
- [ ] element invalid styling (dashed outline)
- [ ] load curtain? or loader?

## 3.0

Forward-looking skin for non-Qualtrics survey engine. Designed for more standard markup. Used in survey-docs previews.

### 3.0.0

#### JavaScript

- free text entry within option inputs
- thisco_modals.js
- link_buttons.js (single link buttons)
- expand_textareas.js (auto-expand)
- fieldset.likert-scale markup
- select-and-rank conrols
- consent form markup for switches
- (skinjob + socket.io snippet for dev)

#### CSS

- pulls all 2.1 CSS and strips Qualtrics-markup-related rules