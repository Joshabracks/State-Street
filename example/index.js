import State from '../build/index.js'


// JSON template for rendering page data
const template = {
    body: [
        // body:  any[]     Array of Objects {} containing page elements.  Each element may contain a tag, class and content
        // tag:   string    name assigned to HTML element tag.  Defaults to "div"
        // class: string    space separated class list assigned to HTML element
        // content: any[]   Array of sub elements representing the element children.  Must be set up as an object or string.  String elements may also be used to call upon State data by using double curly bracked enclosures like so: {{variableName}}
        {
            tag: "div", // this is the default and does not have to be specified.
            content: [
                {
                    tag: "span",
                    class: "bold highlight",
                    content: [
                        { tag: "h1", content: ["{{title}}"] },
                        "Span one, bold and highlight"]
                },
                {
                    content: [
                        {
                            tag: "span", class: "itallic monkey",
                            content: ["Span two, itallic monkey"]
                        }
                    ]
                },
                /* open strings automatically get wrapped into span elements */"This is not part of a span.  We can insert messages into strings using double brackets like so {{message1}}", "{{message2}}"
            ]
        }
    ]
}

// State data for regular access/manipulation used to render and update the State template
const data = {
    title: "State Street",
    message1: "... This is message 1!",
    message2: "... This is message 2!"
}

window.onload = () => {
    window.stateStreet = new State(template, data)
}
