# ![State Street](https://github.com/Joshabracks/State-Street/blob/main/sstlogo.png?raw=true)
[![CircleCI](https://circleci.com/gh/Joshabracks/State-Street.svg?style=shield)](https://circleci.com/gh/Joshabracks/State-Street)

Want to contribute or need help? [Join the State Street Discord!](https://discord.gg/a7AycPG2)


A simple JavaScript single page application framework

### Websites and Applications powered by State Street
- [joshuabracks.com](https://www.joshuabracks.com)

## Getting Started
### Setup / Dependencies
* Install the npm package
```
npm i @state-street/state-street
```

* You will also need a module bundler.  In our example, we use webpack
```
npm i -D webpack webpack-cli
```
* If you use webpack, also add a config file to the same directory as your package.json file 

`webpack.config.js`
````js
const path = require('path')

module.exports = () => {
  return {
    entry: './index.js',
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: 'index.js',
    },
  };
};
````
* You will also have to add the a build script to your package.json file
```json
  "scripts": {
    "build": "webpack"
  },
```
* We'll need an html file to run the script

`index.html`
```html
<html>
    <head>
        <script src="./build/index.js"></script>
    </head>
</html>
```
### Hello World
* In your index.js file, import `State` and `parseSST`
* The simplest path would be to just write a bit of html.
```js
import { State } from '@state-street/state-street';

const template = /*html*/`<h1>Hello World!</h1>`;
window.onload = () => {
    new State(template);
}
```
* Now build your project and open index.html.  `npm run build`.
* You should have "Hello World" displayed in your browser.
* Remember that, anytime you update your code, you'll need to re-build before you'll see any changes.

#### Syntax Highlighting Reccomendation (From Josh)
* You may have noticed a `/*html*/` comment added before the template above.
* If you use VS code, you should install the [es6-string-html](https://marketplace.visualstudio.com/items?itemName=Tobermory.es6-string-html) extension.  State Street does not yet have syntax highlighting support, so I've been using this extension to handle highlighting of State Street formattted string literals and it's been very helpful at increasing readability in my apps.
* When using this extension, you can prepend string literals with the following comment `/*html*/` to gain some decent syntax highlighting.
* note: The highlighting via [es6-string-html](https://marketplace.visualstudio.com/items?itemName=Tobermory.es6-string-html) is meant for html, so some elements may look strange, but I promise it's better than no highlighting at all.

#### Data Object
* If all you want to do is create a static page, why would you be using **State Street**?
* Let's make use of state data and the dynamic template
* When creating the State object, you can pass in a `data` object as well.
* Also, when representing data in the template, you can do so using double curly bracket syntax. `{{variableName}}`;
* Additionally, if you pass a `title` variable in with the data object, it will update the page title for you automatically.
```js
import { State } from '@state-street/state-street';
const data = {
    title: "Hello State Street!",
    message: "Hello World!"
}
const template = /*html*/`<h1>{{message}}</h1>`;
window.onload = () => {
    new State(template, data);
}
```

#### Components
* In State Street, Components  can be added to a template with a self closed tag using the component name like so: `<ComponentName/>`.  
* You can also pass `componentProperties` into the component the same way you would add an attribute in html: `<ComponentName prop1="Hello World"/>`.
* Compoents are simply functions that return formatted templates.  We can pass them into the State object as the third constructor argument.  All components access the same state data object, so we won't need to pass in a message.  So let's pass in some style properties instead.
* We'll also update the template to use the component.
```js
import { State } from '@state-street/state-street';
const data = {
    title: "Hello State Street!",
    message: "Hello World!"
}
const template = /*html*/`<Header color="red" weight="bold"/>`;
const components = {
    Header: ({ color, weight }) => {
        return /*html*/`
            <h1 style="color:${color};font-weight=${weight};">{{message}}</h1>
        `;
    }
}
window.onload = () => {
    new State(template, data, components);
}
```
### Event Listener Methods
* To be truly dynamic, we'll want some way to handle page events.  We can do this through use of event methods.
* You can attach an event method like it were an attribute with a colon preceeding the event type.
* The event type must be a supported event listener type such as `click` or `mouseleave`.
```html
<button :click=methodName()>click me!</button>
```
* The `methods` object can be passed into the State constructor as the fourth argument.
* Let's add a simple counter to our example!
```js
import { State } from '@state-street/state-street';

const data = {
    title: "Hello State Street!",
    message: "Hello World!",
    count: 0
}

const template = /*html*/`
    <Header color="red" weight="bold"/>
    <CounterMessage/>
    <Button onclick="incrementCounter"/>
    `;

const components = {
    Header: ({ color, weight }) => {
        return /*html*/`
            <h1 style="color:${color};font-weight=${weight};">{{message}}</h1>
        `;
    },
    Button: ({onclick}) => {
        return /*html*/`<button :click=${onclick}()>click me!</button>`;
    },
    CounterMessage: () => {
        return /*html*/`<div>The Button has been clicked {{count}} times!`;
    }
}

function incrementCounter(){
    data.count++;
}

const methods = {
    incrementCounter,
}

window.onload = () => {
    new State(template, data, components, methods);
}
```
* Now when you build and reload your page, there should be a button that, when clicked, changes a displayed message to show just how many times you've clicked the button.

## Advanced
### Method Variables
- Variables can be passed directly into methods using `key=value` syntax within the method call.  Example `<button :click=functionName(key=value)>`.  Please note that the value does not have to be contained within quotes.
  - Multiple variables may be passed as comma-separated pairs. `:click=functionName(key1=value1,key2=value2)`
- Variables are passed into the method by their key names as a single properties object that may be destructured like so `function methodName({key1, key2})`
- The `state` and `event` object are also passed into the properties object.  `function methodName({state, event, var1, var2})`
### Component State Access
- Along with variables, the state object is passed into the components properties object. `ComponentName({ state, var1, var2 })`
### State Options
- When building a new State you may also pass a fifth, `options` object.  Currently, there is only one option available, but additional options will be added to the same variable.  `new State(template, data, components, methods, options)`
  - renderLoop: boolean - (default true) When set to false, disables the update render loop, requiring the `state.update()` method to be managed manually.   Generally, this would be called at the end of a method invocation if any variable within `state.data` is changed.  In apps using a large amount of State data, this can drastically improve page performance.
    ```js
    function methodName({ state }) {
        state.data.numberValue ++;
        state.update();
    }
    ...
    window.onload = () => {
        new State(template, data, components, methods, /*options*/ { renderLoop: false });
    }
    ```
