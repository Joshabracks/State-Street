/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./index.js":
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _build_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../build/index.js */ \"../build/index.js\");\n\r\n\r\nconst testTemplate = {\r\n    options: {\r\n        \"title\": \"title\",\r\n    },\r\n    body: [\r\n        {\r\n            tag: \"div\", // this is the default and does not have to be specified.\r\n            content: [\r\n            {\r\n                tag: \"span\", \r\n                class: \"bold highlight\",\r\n                content: [\r\n                    {tag: \"h1\", content: [\"this is an h1 element\"]},\r\n                    \"Span one, bold and highlight\"] \r\n            },\r\n            {\r\n                content: [\r\n                    {\r\n                        tag: \"span\", class: \"itallic monkey\",\r\n                        content: [\"Span two, itallic monkey\"]\r\n                    }\r\n                ]\r\n            },\r\n            \"This is not part of a span.  We can insert messages into strings using double brackets like so {{message1}}\", \"{{message2}}\"\r\n        ]}\r\n    ]\r\n}\r\n\r\nconst testData = {\r\n    title: \"State Street Test\",\r\n    message1: \"... This is message 1!\",\r\n    message2: \"... This is message 2!\"\r\n}\r\n\r\nwindow.onload = () => {\r\n    window.stateStreet = new _build_index_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"](testTemplate, testData)\r\n}\n\n//# sourceURL=webpack://test/./index.js?");

/***/ }),

/***/ "../build/class/State.js":
/*!*******************************!*\
  !*** ../build/class/State.js ***!
  \*******************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ State)\n/* harmony export */ });\n// function hash(str: string) {\n//   var hash = 0,\n//     i,\n//     chr;\n//   if (str.length === 0) return hash;\n//   for (i = 0; i < str.length; i++) {\n//     chr = str.charCodeAt(i);\n//     hash = (hash << 5) - hash + chr;\n//     hash |= 0; // Convert to 32bit integer\n//   }\n//   return hash;\n// }\nconst valsRegex = /{{.[^{]+}}/g;\nconst cleanerRegex = /{{(.*)}}/;\nfunction getValue(obj, values) {\n    console.log(obj);\n    console.log(values);\n    if (values.length === 0)\n        return obj;\n    const key = values.shift() || '';\n    console.log(key);\n    const value = obj[key];\n    if (!value)\n        return value;\n    return getValue(value, values);\n}\nfunction constructElement(data, depth, state) {\n    var _a;\n    const content = (data === null || data === void 0 ? void 0 : data.content) || [];\n    if (((_a = content === null || content === void 0 ? void 0 : content.constructor) === null || _a === void 0 ? void 0 : _a.name) !== \"Array\") {\n        return Error(\"Failed to construct element: content object must be an Array\");\n    }\n    const tag = (data === null || data === void 0 ? void 0 : data.tag) || 'div';\n    const element = document.createElement(tag);\n    state.idMap[depth] = element;\n    element.setAttribute('ststid', depth);\n    for (let i = 0; i < content.length; i++) {\n        const child = content[i];\n        const type = typeof child;\n        const subDepth = `${depth}${i}`;\n        if (type === 'object' && type !== null) {\n            element.appendChild(constructElement(child, subDepth, state));\n        }\n        else {\n            const subElement = document.createElement('span');\n            subElement.setAttribute('ststid', subDepth);\n            let innerText = '';\n            const mapValues = {};\n            if (type == 'string') {\n                const variables = child.match(valsRegex) || [];\n                console.log(variables);\n                for (let j = 0; j < variables.length; j++) {\n                    const valuesString = variables[j].match(cleanerRegex)[1] || '';\n                    const values = valuesString.split('.');\n                    console.log('values: ', values);\n                    const value = getValue(state.data, values);\n                    mapValues[valuesString] = JSON.parse(JSON.stringify(value || ''));\n                    innerText = value;\n                }\n            }\n            else {\n                innerText = JSON.stringify(child);\n            }\n            subElement.innerText = innerText;\n            state.idMap[subDepth] = { element: subElement, values: mapValues };\n            element.appendChild(subElement);\n        }\n    }\n    return element;\n}\nfunction constructDOM(state) {\n    const { data, template } = state;\n    if (data.title)\n        document.title = data.title;\n    const elements = [];\n    for (let i = 0; i < template.body.length; i++) {\n        const element = constructElement(template.body[i], `${i}`, state);\n        console.log(element);\n        elements.push(element);\n    }\n    document.body.innerHTML = '';\n    elements.forEach((element) => document.body.appendChild(element));\n    console.log(state);\n}\nclass State {\n    constructor(template, data) {\n        this.sameState = () => {\n            const current = JSON.stringify(this.data);\n            if (this.previous === current) {\n                return true;\n            }\n            this.previous = current;\n            return false;\n        };\n        this.update = () => {\n            if (this.sameState()) {\n                window.requestAnimationFrame(this.update);\n                return;\n            }\n            constructDOM(this);\n            window.requestAnimationFrame(this.update);\n        };\n        this.data = data;\n        this.template = template;\n        this.previous = JSON.stringify(this.data);\n        this.idMap = {};\n        constructDOM(this);\n        this.update();\n    }\n}\n//# sourceMappingURL=State.js.map\n\n//# sourceURL=webpack://test/../build/class/State.js?");

/***/ }),

/***/ "../build/index.js":
/*!*************************!*\
  !*** ../build/index.js ***!
  \*************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _class_State_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./class/State.js */ \"../build/class/State.js\");\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_class_State_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"]);\n//# sourceMappingURL=index.js.map\n\n//# sourceURL=webpack://test/../build/index.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./index.js");
/******/ 	
/******/ })()
;