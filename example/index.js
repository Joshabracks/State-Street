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
        <button onclick="whatIsIt()">this is a {{whatItIs}}</button>
    </div>
    <button onclick="increment()">{{total}}</button>
    <:TestComponent/>
</body>
`);


// State data for regular access/manipulation used to render and update the State template
const data = {
    title: "State Street",
    message1: "... This is message 1!",
    message2: "... This is message 2!",
    value1: "value 1",
    value2: "value 2",
    total: 0,
    whatItIs: 'button'
}

function increment() {
    stateStreet.data.total++;
}

const THING_LIST = [
    'potato chips', 'pink blouse', 'protein shake', 'cat', 'football', 'elephant tusk', 'whiskers', 'button', 'trophy', 'one single grape', 'Robert Downey Jr'
]

function whatIsIt() {
    const rando = Math.random();
    const val = Math.floor( rando * THING_LIST.length);
    const thing = THING_LIST[val];
    stateStreet.data.whatItIs = thing;
}

function TestComponent(){
    return `
        <div>test component testing: {{total}}</div>
    `
}

window.onload = () => {
    window.stateStreet = new State(template, data, {TestComponent})
    window.increment = increment;
    window.whatIsIt = whatIsIt;
}
