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

// Components 
// These are just functions that render and return templates.  
// They are denoted inside of a template as self-closing element tags with a colon in front of the tag name like so...
// <:ComponentName/>
// Attributes added to components are the same 
function TestComponent({name}) {
    let res = `<div>${name}</div>`
    return res;
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
    whatIsIt
}


window.onload = () => {
    new State(template, data, { TestComponent }, methods)
    window.increment = increment;
    window.whatIsIt = whatIsIt;
}
