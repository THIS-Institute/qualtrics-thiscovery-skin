Validation is available in Qualtrics questions, but the way it is handled makes it trickier to improve UX by, for instance, providing instant feedback on an input.  Qualtrics only validates inputs after the 'Next' loop is complete, so that the survey page does a full pseudo-reload before passing a validation message.

To improve performance, the **thiscovery** skin contains some basic validation functionality that can be added to questions with classes.

Classes are added to a `<p>` element in the rubric (or anywhere else) as `validation-` plus one of the below classnames, for example:

<pre><code>&lt;p class="validation-is-email"&gt;This must be a valid email&lt;/p&gt;</code></pre>

The code then moves classnames to the closest `fieldset` tag, and sets listeners on it for `change` and `focusout` events (ie. 'Value change' or 'Fieldset blur' in the below table) as well as a handler that fires all validation when the 'Next' button is clicked.  Messages are then added as necessary per the [messages]{@link module:shared_js/messages} module, and a `content-invalid` class is added to the fieldset.

Classname | Question Type | Trigger| Looks for
---------|----------|---------|--------
 is-required | All | Value change / Fieldset blur / Next | Input has a value that isn't null or """
 all-consent-statements | Consent statements | Next | All consent statements are checked
 min-checked-x | Multi-choice checkboxes | Value change / Next | Minimum of x inputs are checked (Will divine a range if max also set)
 max-checked-x | Multi-choice checkboxes | Value change / Fieldset blur / Next | Maximum of x inputs are checked
 is-email | Text / Form fields | Fieldset blur / Next | Checks value looks like an email (In form fields, checks anything with `" email"` in label)
 is-url | Text / Form fields | Fieldset blur / Next | Checks value looks like a URL (In form fields, checks anything with `" URL"` in label)
 is-number | Text  | Fieldset blur / Next | Checks value looks like a floating point number<sup>*</sup> 
 is-minimum-x | Text  | Fieldset blur / Next | Checks value looks like an integer<sup>*</sup> no smaller than x (Will divine a range if max also set)
 is-maximum-x | Text  | Fieldset blur / Next | Checks value looks like an integer<sup>*</sup> no larger than x
 is-integer | Text  | Fieldset blur / Next | Checks value looks like an integer<sup>*</sup>

##### Notes

<small><sup>*</sup>Accepts comma-split numbers per UK convention, but not smart enough to spot right place eg. `1,000` passes as a thousand, but so will `1,0,0,0`</small>

<hr>

A Qualtrics user can also add a `data-custom-invalid-message` attribute to whichever element they added the classes to to override the default.

## Qualtrics Validation

This does _not_ mean that the usual Qualtrics validation cannot be used - it can be set on questions as normal. Any usual Qualtrics messages are intercepted and added to the **thiscovery** message section.  

Effectively this means that the Qualtrics validation would duplicate the validation classes - but in practice, the first validation process should mean the input is valid and will not trigger the second.

## Development

To add new validators, a function should be added in the `validations` object ([see code](/shared_js_validation.js.html#line90)) with a snake-case fieldname (for the classname) and taking two parameters, `el` - which will be the fieldset, and `evtType`, which will be `fieldsetBlur`, `valueChange` or `next` (which can be used to control when the validation does/doesn't fire). 

The function should return `true` if the input(s) in the fieldset is/are valid, and if not, should return a default invalidity message string.

## Validation of Input, not Output

The validators check the inputs, but the output is still a string, so _cannot_ be relied upon for conforming data, eg. numbers with commas are valid as far as a user is concerned but will not necessarily parse correctly