# ![State Street](https://github.com/Joshabracks/State-Street/blob/main/sstlogo.png?raw=true)
[![CircleCI](https://circleci.com/gh/Joshabracks/State-Street.svg?style=shield)](https://circleci.com/gh/Joshabracks/State-Street)

Want to contribute or need help? [Join the State Street Discord!](https://discord.gg/a7AycPG2)


A simple JavaScript single page application framework

## Current Features
* Renders simple single page application through use of a "State" controller that takes in a data and template object.
* Customize class, tag and internal text on the DOM
* Uses a render loop instead of triggers to update the DOM

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
import { State, parseSST } from '@state-street/state-street';

const template = parseSST("<h1>Hello World!</h1>");
window.onload = () => {
    new State(template);
}
```
* Now build your project and open index.html.  `npm run build`.
* You should have "Hello World" displayed in your browser.
* Remember that, anytime you update your code, you'll need to re-build before you'll see any changes.
#### Data Object
* If all you want to do is create a static page, why would you be using **State Street**?
* Let's make use of state data and the dynamic template
* When creating the State object, you can pass in a `data` object as well.
* Also, when representing data in the template, you can do so using double curly bracket syntax. `{{variableName}}`;
* Additionally, if you pass a `title` variable in with the data object, it will update the page title for you automatically.
```js
import { State, parseSST } from '@state-street/state-street';
const data = {
    title: "Hello State Street!",
    message: "Hello World!"
}
const template = parseSST("<h1>{{message}}</h1>");
window.onload = () => {
    new State(template, data);
}
```

#### Components
* In State Street, Components  can be added to a template by preceeding a self closed tag name with a colon like so: `<:ComponentName/>`.  
* You can also pass `componentProperties` into the component the same way you would add an attribute in html: `<:ComponentName prop1="Hello World"/>`.
* Compoents are simply functions that return formatted templates.  We can pass them into the State object as the third constructor argument.  All components access the same state data object, so we won't need to pass in a message.  So let's pass in some style properties instead.
* We'll also update the template to use the component.
```js

import { State, parseSST } from '@state-street/state-street';
const data = {
    title: "Hello State Street!",
    message: "Hello World!"
}
const template = parseSST('<:Header color="red" weight="bold"/>');
const components = {
    Header: ({ color, weight }) => {
        return `
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
* The event type must be a supported event listener type such as `click` or `mouseover`.
```html
<button :click=methodName()>click me!</button>
```
* The `methods` object can be passed into the State constructor as the fourth argument.
* Let's add a simple counter to our example!
```js
import { State, parseSST } from '@state-street/state-street';

const data = {
    title: "Hello State Street!",
    message: "Hello World!",
    count: 0
}

const template = parseSST(`
    <:Header color="red" weight="bold"/>
    <:CounterMessage/>
    <:Button onclick="incrementCounter"/>
    `);

const components = {
    Header: ({ color, weight }) => {
        return `
            <h1 style="color:${color};font-weight=${weight};">{{message}}</h1>
        `;
    },
    Button: ({onclick}) => {
        return `<button :click=${onclick}()>click me!</button>`;
    },
    CounterMessage: () => {
        return `<div>The Button has been clicked {{count}} times!`;
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

## TODO
I have every intention of keeping this project open source and anyone is welcome contribute.  Here's a list of State Street's most immediate "TODOs"
* :bow_and_arrow: **Targeted Rendering**: Currently whenever any variable within the State data is updated, all elements with effected by any state variables are re-rendered.  Update so that only changed elements will be rendered.
* :crayon: **CSS**: Add css handling
* :running_woman: **Event Based Rendering**: By default, State Street runs on an update loop much in the way video games run.  This means that it's always checking for changes in State data and making changes to the DOM when appropriate.  This is easy, and in some cases, probably for the best, but it is not the most efficient use of resources, especially if there's a lot of data to check.  So, it would be nice to have an option to only run updates when specific events are triggered.  (which is how pretty much every other SPA framework does it)
* :cupcake: **Syntactic Sugar**: At the core of things, the plan is to always use a JSON template.  However, that's not everyone's cup of tea, so we also support a simple HTML-like template.  This requires upkeep since, with any new feature added to our main JSON template, the HTML parsing will require a new update as well.
* :muscle: **Optimization**: There's always room to run faster.  Especially since the default (and currently the only) render option is an update loop.  The `State.sameState` method can likely be implemented in a faster manner than the current "serialize and comapre strings" technique that's currently being used; especially for more complicated applications with a greater amount of data.
