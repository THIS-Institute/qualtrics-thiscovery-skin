- dev.js does include polyfills, but still make sure you're on as recent a version of node as possible
- double-check you are developing to the right version to match your Qualtrics survey or test page
- if your changes to CSS do not seem to be appearing, you might be conflicting with existing rules in the current build. To check, in the developer tools of your browser, disable all other CSS sheets to check (skinjob is creating a temporary 'constructed' stylesheet)