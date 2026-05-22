import { State } from '@state-street/state-street';

const TEMPLATE_STRING = /*html*/`
<body>
    <div>
        <h1 class="bold highlight">
            {{title}}
        </h1>
        <span class="itallic">Message 1: {{message1}}</span>
        <div>Message 2: {{message2}}</div>
        <img src="https://www.placecats.com/300/200"/>
        <div>Base64 (cached as blob):</div>
        <img id="b64cached" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="/>
        <div>Base64 (nocache):</div>
        <img id="b64raw" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" nocache/>
    </div>
    <div>  
        Element with multiple values. {{value1}} :: {{value2}}
    </div>
    <div>
        <button :click=whatIsIt(thingList={{thingList}})>this is a {{whatItIs}}</button>
    </div>
    <button :click=increment()>{{total}}</button>
    <div>
        <label>Textarea (RCDATA test):</label>
        <textarea rows="3" cols="40">{{message1}}</textarea>
    </div>
    <form class="message-form">
        <div class="form-row">
            <label for="msg1">Message 1:</label>
            <input id="msg1" type="text" :input=updateMsg(name=msg1)/>
            <div class="form-display">Saved: "{{msg1}}"</div>
        </div>
        <div class="form-row">
            <label for="msg2">Message 2:</label>
            <input id="msg2" type="text" :input=updateMsg(name=msg2)/>
            <div class="form-display">Saved: "{{msg2}}"</div>
        </div>
        <div class="form-row">
            <label for="msg3">Message 3:</label>
            <input id="msg3" type="text" :input=updateMsg(name=msg3)/>
            <div class="form-display">Saved: "{{msg3}}"</div>
        </div>
        <div class="form-row">
            <label for="msg4">Message 4:</label>
            <input id="msg4" type="text" :input=updateMsg(name=msg4)/>
            <div class="form-display">Saved: "{{msg4}}"</div>
        </div>
        <div title="A &amp; B">Tom &amp; Jerry &copy; 2026 &lt;tag&gt;</div>
    </form>
    <TestComponent name="Test Component"/>
</body>
`;


function increment({ state }) {
    state.data.total++;
}

function whatIsIt({ thingList, state }) {
    const rando = Math.random();
    const val = Math.floor(rando * thingList.length);
    const thing = thingList[val];
    state.data.whatItIs = thing;
}

function updateMsg({ name, event, state }) {
    state.data[name] = event.target.value;
}

function clickTab({ event }) {
    // eslint-disable-next-line no-undef
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
// <ComponentName/>
// Attributes added to components are passed into the component function as the componentProps object
function TestComponent({ name }) {
    let res = /*html*/`
        <div>${name}</div>
        <div class="bar">
            <Tab name="home" active="true" onclick="clickTab()"/>
            <Tab name="info" active="false" onclick="clickTab()"/>
            <Tab name="documentation" active="false" onclick="clickTab()"/>
        </div>`
    return res;
}

function Tab({ name, onclick }) {
    return /*html*/`<div class="tab" :click=${onclick}>${name}</div>`
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
    msg1: "",
    msg2: "",
    msg3: "",
    msg4: "",
    thingList: [
        'potato chips', 'pink blouse', 'protein shake', 'cat', 'football', 'elephant tusk', 'whiskers', 'button', 'trophy', 'one single grape', 'Robert Downey Jr'
    ]
}

const methods = {
    increment,
    whatIsIt,
    clickTab,
    updateMsg
}

const components = {
    TestComponent, Tab
}


// eslint-disable-next-line no-undef
window.onload = () => {
    new State(TEMPLATE_STRING, data, components, methods)
}
