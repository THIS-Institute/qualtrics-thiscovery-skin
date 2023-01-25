Testing needs work, but for now there is a basic script using [playwright](https://playwright.dev/).

In `package.json` you can run `test_full` (ie. `npm run test_full`) or `test_quick` or `test_debug`. The scripts are basically checking against prior screenshots.  Images are saved in the `/tests` folder. If you delete the images, the test will re-build them (sometimes necessary if there is a signifcant change made to the CSS etc.)

