import State from '../build/index.js'

const testTemplate = {
    options: {
        "title": "title",
    },
    body: [
        {
            tag: "div", // this is the default and does not have to be specified.
            content: [
                {
                    tag: "span",
                    class: "bold highlight",
                    content: [
                        { tag: "h1", content: ["this is an h1 element"] },
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
                "This is not part of a span.  We can insert messages into strings using double brackets like so {{message1}}", "{{message2}}"
            ]
        }
    ]
}

const testData = {
    title: "State Street Test",
    message1: "... This is message 1!",
    message2: "... This is message 2!"
}

window.onload = () => {
    window.stateStreet = new State(testTemplate, testData)
}