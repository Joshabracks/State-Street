import { State, parseSST } from '../build/index.js';

const template = parseSST(`
<body title="{{title}}">
    <div>
        <h1 class="bold highlight">
            {{title}}
        </h1>
        <div>
            internal div
        </div>
        Open text element without tag enclosures {{message1}}
        <span class="itallic monkey">Span enclosed element</span>
    </div>
    open message element with variable message: {{message2}}
</body>
`);


// State data for regular access/manipulation used to render and update the State template
const data = {
    title: "State Street",
    message1: "... This is message 1!",
    message2: "... This is message 2!"
}
console.log('template: ', template);
console.log('data: ', data);
window.onload = () => {
    window.stateStreet = new State(template, data)
}
