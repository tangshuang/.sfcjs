(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["SFCJS"] = factory();
	else
		root["SFCJS"] = factory();
})(self, function() {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 1:
/***/ (() => {

throw new Error("Module parse failed: Cannot use keyword 'await' outside an async function (156:2)\nYou may need an appropriate loader to handle this file type, currently no loaders are configured to process this file. See https://webpack.js.org/concepts#loaders\n|   const { deps, fn } = mod\n|   const { props, events } = data\n>   await loadDepComponents(deps)\n|   const scope = {\n|     ...modules,");

/***/ }),

/***/ 22:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getComponentCode": () => (/* binding */ getComponentCode)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);


const { currentScript } = document
const { src } = currentScript
const { href } = window.location
const baseUrl = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.resolveUrl)(href, src)
const workerSrc = currentScript.getAttribute('worker-src') || (0,_utils__WEBPACK_IMPORTED_MODULE_0__.resolveUrl)(baseUrl, './worker.js')
const workerUrl = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.createBlobUrl)(`importScripts('${workerSrc}')`)
const worker = new Worker(workerUrl)

function getComponentCode(src) {
  return new Promise((resolve, reject) => {
    const id = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.randomString)()
    worker.postMessage(JSON.stringify({ type: 'init', src, id }))
    const onComplete = () => {
      worker.removeEventListener('message', onSuccess)
    }
    const onSuccess = (e) => {
      if (!e.data) {
        return
      }

      const data = JSON.parse(e.data)
      const { type } = data
      if (type !== 'inited') {
        return
      }

      if (data.id !== id) {
        return
      }

      const { code } = data
      if (!code) {
        return
      }

      onComplete()
      resolve(code)
    }
    worker.addEventListener('message', onSuccess)
    setTimeout(() => {
      onComplete()
      reject(new Error(`加载组件 ${src} 超时`))
    }, 5000)
  })
}


/***/ }),

/***/ 3:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "each": () => (/* binding */ each),
/* harmony export */   "clearComments": () => (/* binding */ clearComments),
/* harmony export */   "padding": () => (/* binding */ padding),
/* harmony export */   "camelcase": () => (/* binding */ camelcase),
/* harmony export */   "resolveUrl": () => (/* binding */ resolveUrl),
/* harmony export */   "randomString": () => (/* binding */ randomString),
/* harmony export */   "noop": () => (/* binding */ noop),
/* harmony export */   "createBlobUrl": () => (/* binding */ createBlobUrl),
/* harmony export */   "createScriptByBlob": () => (/* binding */ createScriptByBlob),
/* harmony export */   "insertScript": () => (/* binding */ insertScript)
/* harmony export */ });
function each(obj, fn) {
  if (Array.isArray(obj)) {
    for (let i = 0, len = obj.length; i < len; i ++) {
      const item = obj[i]
      fn(item, i)
    }
    return
  }

  const keys = Object.keys(obj)
  for (let i = 0, len = keys.length; i < len; i ++) {
    const key = keys[i]
    const value = obj[key]
    fn(value, key)
  }
}

function clearComments(str) {
  return str.replace(/\/\*.*?\*\//gmi, '').replace(/\/\/.*?[\n$]/, '')
}

function padding(count) {
  return new Array(count).fill(' ').join('')
}

function camelcase(str, force) {
  if (force) {
    const s = camelcase(str)
    return s.replace(s[0], s[0].toUpperCase())
  }
  return str.replace(/[-_]\w/ig, (matched) => {
    return matched[1].toUpperCase()
  }).replace(/\s+/g, '')
}

function resolveUrl(baseUrl, uri) {
  if (!uri) {
    throw new Error('resolveUrl 必须传入 baseUrl & uri')
  }

  if (/^[a-z]+:\/\//.test(uri)) {
    // 使用绝对路径
    return uri
  }

  if (!baseUrl || !/^[a-z]+:\/\//.test(baseUrl)) {
    throw new Error('resolveUrl 中 baseUrl 必须是带协议的 url')
  }

  const origin = baseUrl.split('/').slice(0, 3).join('/')

  if (uri.indexOf('/') === 0) {
    return origin + uri
  }

  if (/^(\?|&|#)$/.test(uri[0])) {
    return baseUrl + uri
  }

  let dir = ''
  if (baseUrl[baseUrl.length - 1] === '/') {
    dir = baseUrl.substring(0, baseUrl.length - 1)
  }
  else {
    const chain = baseUrl.split('/')
    const tail = chain.pop()
    dir = tail.indexOf('.') === -1 ? baseUrl : chain.join('/')
  }

  const roots = dir.split('/')
  const blocks = uri.split('/')
  while (true) {
    const block = blocks[0]
    if (block === '..') {
      blocks.shift()
      roots.pop()
    }
    else if (block === '.') {
      blocks.shift()
    }
    else {
      break
    }
  }

  const url = roots.join('/') + '/' + blocks.join('/')
  return url
}

function randomString(len = 8) {
  const CHARS = '0123456789abcdefghigklmnopqrstuvwxyzABCDEFGHIGKLMNOPQRSTUVWXYZ'
  let text = ''
  for (let i = 0; i < len; i++) {
    text += CHARS.charAt(Math.floor(Math.random() * CHARS.length))
  }
  return text
}

function noop() {}

function createBlobUrl(contents) {
  const _URL = window.URL || window.webkitURL
  const blob = new Blob([ contents ], { type: 'application/javascript' })
  const blobURL = _URL.createObjectURL(blob)
  return blobURL
}

function createScriptByBlob(contents) {
  const src = createBlobUrl(contents)
  const script = document.createElement('script')
  script.type = 'module'
  script.src = src
  return script
}

async function insertScript(script) {
  return new Promise((r) => {
    script.onload = r
    document.body.appendChild(script)
  })
}


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
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
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
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _main__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(22);
/* harmony import */ var _framework__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1);
/* harmony import */ var _framework__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_framework__WEBPACK_IMPORTED_MODULE_1__);
/* harmony reexport (unknown) */ var __WEBPACK_REEXPORT_OBJECT__ = {};
/* harmony reexport (unknown) */ for(const __WEBPACK_IMPORT_KEY__ in _framework__WEBPACK_IMPORTED_MODULE_1__) if(__WEBPACK_IMPORT_KEY__ !== "default") __WEBPACK_REEXPORT_OBJECT__[__WEBPACK_IMPORT_KEY__] = () => _framework__WEBPACK_IMPORTED_MODULE_1__[__WEBPACK_IMPORT_KEY__]
/* harmony reexport (unknown) */ __webpack_require__.d(__webpack_exports__, __WEBPACK_REEXPORT_OBJECT__);



})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});