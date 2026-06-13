import { State } from '@state-street/state-street';

const TEMPLATE_STRING = /*html*/`
<body>
    <div id="ghosttest">missing:[{{ghost}}] nested-missing:[{{position.x}}]</div>
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
    <div>
        <div>Inline SVG (static):</div>
        <svg id="svgstatic" viewBox="0 0 24 24" width="48" height="48">
            <rect x="2" y="2" width="20" height="20" rx="3" fill="royalblue"/>
            <path d="M6 12 L11 17 L18 7" stroke="white" stroke-width="2" fill="none"/>
        </svg>
        <div>Inline SVG (reactive radius {{radius}}):</div>
        <svg id="svgreactive" viewBox="0 0 100 100" width="100" height="100">
            <circle id="svgcircle" cx="50" cy="50" r="{{radius}}" fill="tomato"/>
        </svg>
        <button :click=grow()>grow circle</button>
    </div>
    <TestComponent name="Test Component"/>
    <ImgReuseTest/>
    <AttrTest/>
    <GateOuter/>
    <PropTest numberVal=478 booleanVal=true stringVal="this is a string" varVal={{total}}/>
</body>
`;


function increment({ state }) {
    state.data.total++;
}

function grow({ state }) {
    state.data.radius = state.data.radius >= 45 ? 5 : state.data.radius + 5;
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

// Body is constant placeholders -> body-cache hits, no rebuild; {{total}} text
// updates via textMap and the <img> is never touched.
function ImgReuseTest() {
    return /*html*/`
        <div>
            <div>Reuse test — total is {{total}}:</div>
            <img id="reuseimg" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="/>
        </div>`
}

// Reads state.data.showImg in its fn -> tracked dep is {showImg}. An increment
// (dirty key "total") should DEP-GATE this component (fn not re-run), yet its
// title="seen {{total}} times" still updates via attrMap, and src="{{portrait}}"
// (a base64 referenced by key) resolves to a cached blob without entering parseSST.
function AttrTest({ state }) {
    // eslint-disable-next-line no-undef
    window.__attrTestCalls = (window.__attrTestCalls || 0) + 1;
    return state.data.showImg
        ? /*html*/`<img id="attrimg" src="{{portrait}}" title="seen {{total}} times"/>`
        : /*html*/`<div>hidden</div>`;
}

// Nested-component test. GateOuter reads state.data.total (dep {total}) and embeds
// a nested <GateInner/> (which reads state.data.childVal, dep {childVal}).
// - Increment (dirty total): GateOuter rebuilds; GateInner is unchanged -> must be
//   PRESERVED (same DOM node), not dropped.
// - Mutate childVal (dirty childVal): GateInner rebuilds in place; GateOuter is
//   dep-gated -> its fn must NOT re-run and its element must stay the same.
function GateOuter({ state }) {
    // eslint-disable-next-line no-undef
    window.__gateOuterCalls = (window.__gateOuterCalls || 0) + 1;
    const t = state.data.total;
    return /*html*/`<div id="gateouter">outer t=${t} <GateInner/></div>`;
}
function GateInner({ state }) {
    // eslint-disable-next-line no-undef
    window.__gateInnerCalls = (window.__gateInnerCalls || 0) + 1;
    return /*html*/`<div id="gateinner">inner: ${state.data.childVal}</div>`;
}

// Prop coercion test: unquoted number/boolean coerce; quoted stays string;
// {{var}} resolves (and is reactive). Renders each value + its typeof.
function PropTest({ numberVal, booleanVal, stringVal, varVal }) {
    return /*html*/`<div id="proptest">n=${numberVal}/${typeof numberVal} b=${booleanVal}/${typeof booleanVal} s=${stringVal}/${typeof stringVal} v=${varVal}</div>`;
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
    radius: 20,
    showImg: true,
    childVal: "A",
    portrait: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
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
    grow,
    whatIsIt,
    clickTab,
    updateMsg
}

const components = {
    TestComponent, Tab, ImgReuseTest, AttrTest, GateOuter, GateInner, PropTest
}


// eslint-disable-next-line no-undef
window.onload = () => {
    // eslint-disable-next-line no-undef
    window.state = new State(TEMPLATE_STRING, data, components, methods)
}
