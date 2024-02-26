# ![State Street](sstlogo.png)
Want to contribute or need help? [Join the State Street Discord!](https://discord.gg/a7AycPG2)

A simple JavaScript single page application framework

## Current Features
* Renders simple single page application through use of a "State" controller that takes in a data and template object.
* Customize class, tag and internal text on the DOM
* Uses a render loop instead of triggers to update the DOM

## Getting Started
* Clone repo: 
```
git clone https://github.com/Joshabracks/State-Street.git
```
* Navigate to directory, install dependencies and build
```
cd state-street
npm i
npm run build
```
* Navigate to example, install dependencies and build
```
cd example
npm i
npm run build
```
* Open html file located at `./example/index.html`

* The example package is very simple.  Explore the code via `./example/index.js`

## TODO
I have every intention of keeping this project open source and anyone is welcome contribute.  Here's a list of State Street's most immediate "TODOs"
* :bow_and_arrow: **Targeted Rendering**: Currently whenever any variable within the State data is updated, all elements with effected by any state variables are re-rendered.  Update so that only changed elements will be rendered.
* :crayon: **CSS**: Add css handling
* :running_woman: **Event Based Rendering**: By default, State Street runs on an update loop much in the way video games run.  This means that it's always checking for changes in State data and making changes to the DOM when appropriate.  This is easy, and in some cases, probably for the best, but it is not the most efficient use of resources, especially if there's a lot of data to check.  So, it would be nice to have an option to only run updates when specific events are triggered.  (which is how pretty much every other SPA framework does it)
* :cupcake: **Syntactic Sugar**: At the core of things, the plan is to always use a JSON template.  However, that's not everyone's cup of tea, so we also support a simple HTML-like template.  This requires upkeep since, with any new feature added to our main JSON template, the HTML parsing will require a new update as well.
* :muscle: **Optimization**: There's always room to run faster.  Especially since the default (and currently the only) render option is an update loop.  The `State.sameState` method can likely be implemented in a faster manner than the current "serialize and comapre strings" technique that's currently being used; especially for more complicated applications with a greater amount of data.

