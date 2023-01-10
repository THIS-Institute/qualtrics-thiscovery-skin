### Setting up 'skinjob'

This is the node script to run fast reloading and development of the main skin stylesheet. It runs a websocket server watching the local css file for changes, then prompts the browser to replace the CSS (without reloading). The `dev` script will ask if you want to run it as well as the other watches when selecting the 'develop' option. 

To run it independently, run:

```npm run skinjob [path to css sheet]```

and to see possible options:

`npm run skinjob help`

The command currently watches `src/css/skin.css`. (So when dev rebuilds the SCSS to skin.css, this triggers skinjob)

1. Add a `thisco_dev=anything` key-value-pair to localStorage in the browser developer tools (usually under 'Application' or 'Storage') and reload survey. This activates the snippet in the js listening for the websocket.  
2. Browsers will probably need some flags set to allow the comms to happen.  eg. in Firefox (recommended), in `about:config` set both `layout.css.constructable-stylesheets.enabled` and `network.websocket.allowInsecureFromHTTPS` to true (though remembers the latter flag needs switching off again at some point for security!).