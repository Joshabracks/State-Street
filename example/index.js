import { State, parseSST } from '../build/index.js';

const template = parseSST(`
<body title="{{title}}">
    <div>
        <h1 class="bold highlight">
            {{title}}
        </h1>
        <span class="itallic">Message 1: {{message1}}</span>
        <div>Message 2: {{message2}}</div>
    </div>
    <div>  
        Element with multiple values. {{value1}} :: {{value2}}
    </div>
    <div>
        <button :click=whatIsIt(thingList={{thingList}})>this is a {{whatItIs}}</button>
    </div>
    <button :click=increment()>{{total}}</button>
    <:TestComponent name="Test Component"/>
</body>
`);


function increment() {
    data.total++;
}

function whatIsIt({thingList}) {
    const rando = Math.random();
    const val = Math.floor(rando * thingList.length);
    const thing = thingList[val];
    data.whatItIs = thing;
}

function clickTab(_, event) {
    console.log(event.target);
    const active = document.querySelector('.tab[active="true"]');
    if (active) active.setAttribute("active", "false");
    if (event.target.classList.contains("tab")) {
        event.target.setAttribute("active", "true");
        return;
    }
    event.target.parentElement.setAttribute("active", "true");
}

// Components 
// These are just functions that render and return templates.  
// They are denoted inside of a template as self-closing element tags with a colon in front of the tag name like so...
// <:ComponentName/>
// Attributes added to components are passed into the component function as the componentProps object
function TestComponent({name}) {
    let res = `<div>${name}</div>
        <div class="bar">
            <:Tab name="home" active="true" onclick="clickTab()"/>
            <:Tab name="info" active="false" onclick="clickTab()"/>
            <:Tab name="documentation" active="false" onclick="clickTab()"/>
        </div>`
    return res;
}

function Tab({name, onclick}) {
    return `<div class="tab" :click=${onclick}>${name}</div>`
}

// State data for regular access/manipulation used to render and update the State template
const data = {
    title: "State Street",
    message1: "... This is message 1!",
    message2: "... This is message 2!",
    value1: "value 1",
    value2: "value 2",
    total: 0,
    whatItIs: 'button',
    thingList: [
        'potato chips', 'pink blouse', 'protein shake', 'cat', 'football', 'elephant tusk', 'whiskers', 'button', 'trophy', 'one single grape', 'Robert Downey Jr'
    ]
}

const methods = {
    increment,
    whatIsIt,
    clickTab
}


window.onload = () => {
    new State(template, data, { TestComponent, Tab }, methods)
    window.increment = increment;
    window.whatIsIt = whatIsIt;
}
