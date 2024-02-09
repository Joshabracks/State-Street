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
</body>
`);


// State data for regular access/manipulation used to render and update the State template
const data = {
    title: "State Street",
    message1: "... This is message 1!",
    message2: "... This is message 2!"
}


window.onload = () => {
    window.stateStreet = new State(template, data)
}
