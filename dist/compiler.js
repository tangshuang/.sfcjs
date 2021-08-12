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
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// fork https://github.com/reworkcss/css/blob/master/lib/parse/index.js

// http://www.w3.org/TR/CSS21/grammar.html
// https://github.com/visionmedia/css-parse/pull/49#issuecomment-30088027
var commentre = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g

/* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__(css, options){
  options = options || {};

  /**
   * Positional.
   */

  var lineno = 1;
  var column = 1;

  /**
   * Update lineno and column based on `str`.
   */

  function updatePosition(str) {
    var lines = str.match(/\n/g);
    if (lines) lineno += lines.length;
    var i = str.lastIndexOf('\n');
    column = ~i ? str.length - i : column + str.length;
  }

  /**
   * Mark position and patch `node.position`.
   */

  function position() {
    var start = { line: lineno, column: column };
    return function(node){
      node.position = new Position(start);
      whitespace();
      return node;
    };
  }

  /**
   * Store position information for a node
   */

  function Position(start) {
    this.start = start;
    this.end = { line: lineno, column: column };
    this.source = options.source;
  }

  /**
   * Non-enumerable source string
   */

  Position.prototype.content = css;

  /**
   * Error `msg`.
   */

  var errorsList = [];

  function error(msg) {
    var err = new Error(options.source + ':' + lineno + ':' + column + ': ' + msg);
    err.reason = msg;
    err.filename = options.source;
    err.line = lineno;
    err.column = column;
    err.source = css;

    if (options.silent) {
      errorsList.push(err);
    } else {
      throw err;
    }
  }

  /**
   * Parse stylesheet.
   */

  function stylesheet() {
    var rulesList = rules();

    return {
      type: 'stylesheet',
      stylesheet: {
        source: options.source,
        rules: rulesList,
        parsingErrors: errorsList
      }
    };
  }

  /**
   * Opening brace.
   */

  function open() {
    return match(/^{\s*/);
  }

  /**
   * Closing brace.
   */

  function close() {
    return match(/^}/);
  }

  /**
   * Parse ruleset.
   */

  function rules() {
    var node;
    var rules = [];
    whitespace();
    comments(rules);
    while (css.length && css.charAt(0) != '}' && (node = atrule() || rule())) {
      if (node !== false) {
        rules.push(node);
        comments(rules);
      }
    }
    return rules;
  }

  /**
   * Match `re` and return captures.
   */

  function match(re) {
    var m = re.exec(css);
    if (!m) return;
    var str = m[0];
    updatePosition(str);
    css = css.slice(str.length);
    return m;
  }

  /**
   * Parse whitespace.
   */

  function whitespace() {
    match(/^\s*/);
  }

  /**
   * Parse comments;
   */

  function comments(rules) {
    var c;
    rules = rules || [];
    while (c = comment()) {
      if (c !== false) {
        rules.push(c);
      }
    }
    return rules;
  }

  /**
   * Parse comment.
   */

  function comment() {
    var pos = position();
    if ('/' != css.charAt(0) || '*' != css.charAt(1)) return;

    var i = 2;
    while ("" != css.charAt(i) && ('*' != css.charAt(i) || '/' != css.charAt(i + 1))) ++i;
    i += 2;

    if ("" === css.charAt(i-1)) {
      return error('End of comment missing');
    }

    var str = css.slice(2, i - 2);
    column += 2;
    updatePosition(str);
    css = css.slice(i);
    column += 2;

    return pos({
      type: 'comment',
      comment: str
    });
  }

  /**
   * Parse selector.
   */

  function selector() {
    var m = match(/^([^{]+)/);
    if (!m) return;
    /* @fix Remove all comments from selectors
     * http://ostermiller.org/findcomment.html */
    return trim(m[0])
      .replace(/\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*\/+/g, '')
      .replace(/"(?:\\"|[^"])*"|'(?:\\'|[^'])*'/g, function(m) {
        return m.replace(/,/g, '\u200C');
      })
      .split(/\s*(?![^(]*\)),\s*/)
      .map(function(s) {
        return s.replace(/\u200C/g, ',');
      });
  }

  /**
   * Parse declaration.
   */

  function declaration() {
    var pos = position();

    // prop
    var prop = match(/^(\*?[-#\/\*\\\w]+(\[[0-9a-z_-]+\])?)\s*/);
    if (!prop) return;
    prop = trim(prop[0]);

    // :
    if (!match(/^:\s*/)) return error("property missing ':'");

    // val
    var val = match(/^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^\)]*?\)|[^};])+)/);

    var ret = pos({
      type: 'declaration',
      property: prop.replace(commentre, ''),
      value: val ? trim(val[0]).replace(commentre, '') : ''
    });

    // ;
    match(/^[;\s]*/);

    return ret;
  }

  /**
   * Parse declarations.
   */

  function declarations() {
    var decls = [];

    if (!open()) return error("missing '{'");
    comments(decls);

    // declarations
    var decl;
    while (decl = declaration()) {
      if (decl !== false) {
        decls.push(decl);
        comments(decls);
      }
    }

    if (!close()) return error("missing '}'");
    return decls;
  }

  /**
   * Parse keyframe.
   */

  function keyframe() {
    var m;
    var vals = [];
    var pos = position();

    while (m = match(/^((\d+\.\d+|\.\d+|\d+)%?|[a-z]+)\s*/)) {
      vals.push(m[1]);
      match(/^,\s*/);
    }

    if (!vals.length) return;

    return pos({
      type: 'keyframe',
      values: vals,
      declarations: declarations()
    });
  }

  /**
   * Parse keyframes.
   */

  function atkeyframes() {
    var pos = position();
    var m = match(/^@([-\w]+)?keyframes\s*/);

    if (!m) return;
    var vendor = m[1];

    // identifier
    var m = match(/^([-\w]+)\s*/);
    if (!m) return error("@keyframes missing name");
    var name = m[1];

    if (!open()) return error("@keyframes missing '{'");

    var frame;
    var frames = comments();
    while (frame = keyframe()) {
      frames.push(frame);
      frames = frames.concat(comments());
    }

    if (!close()) return error("@keyframes missing '}'");

    return pos({
      type: 'keyframes',
      name: name,
      vendor: vendor,
      keyframes: frames
    });
  }

  /**
   * Parse supports.
   */

  function atsupports() {
    var pos = position();
    var m = match(/^@supports *([^{]+)/);

    if (!m) return;
    var supports = trim(m[1]);

    if (!open()) return error("@supports missing '{'");

    var style = comments().concat(rules());

    if (!close()) return error("@supports missing '}'");

    return pos({
      type: 'supports',
      supports: supports,
      rules: style
    });
  }

  /**
   * Parse host.
   */

  function athost() {
    var pos = position();
    var m = match(/^@host\s*/);

    if (!m) return;

    if (!open()) return error("@host missing '{'");

    var style = comments().concat(rules());

    if (!close()) return error("@host missing '}'");

    return pos({
      type: 'host',
      rules: style
    });
  }

  /**
   * Parse media.
   */

  function atmedia() {
    var pos = position();
    var m = match(/^@media *([^{]+)/);

    if (!m) return;
    var media = trim(m[1]);

    if (!open()) return error("@media missing '{'");

    var style = comments().concat(rules());

    if (!close()) return error("@media missing '}'");

    return pos({
      type: 'media',
      media: media,
      rules: style
    });
  }


  /**
   * Parse custom-media.
   */

  function atcustommedia() {
    var pos = position();
    var m = match(/^@custom-media\s+(--[^\s]+)\s*([^{;]+);/);
    if (!m) return;

    return pos({
      type: 'custom-media',
      name: trim(m[1]),
      media: trim(m[2])
    });
  }

  /**
   * Parse paged media.
   */

  function atpage() {
    var pos = position();
    var m = match(/^@page */);
    if (!m) return;

    var sel = selector() || [];

    if (!open()) return error("@page missing '{'");
    var decls = comments();

    // declarations
    var decl;
    while (decl = declaration()) {
      decls.push(decl);
      decls = decls.concat(comments());
    }

    if (!close()) return error("@page missing '}'");

    return pos({
      type: 'page',
      selectors: sel,
      declarations: decls
    });
  }

  /**
   * Parse document.
   */

  function atdocument() {
    var pos = position();
    var m = match(/^@([-\w]+)?document *([^{]+)/);
    if (!m) return;

    var vendor = trim(m[1]);
    var doc = trim(m[2]);

    if (!open()) return error("@document missing '{'");

    var style = comments().concat(rules());

    if (!close()) return error("@document missing '}'");

    return pos({
      type: 'document',
      document: doc,
      vendor: vendor,
      rules: style
    });
  }

  /**
   * Parse font-face.
   */

  function atfontface() {
    var pos = position();
    var m = match(/^@font-face\s*/);
    if (!m) return;

    if (!open()) return error("@font-face missing '{'");
    var decls = comments();

    // declarations
    var decl;
    while (decl = declaration()) {
      decls.push(decl);
      decls = decls.concat(comments());
    }

    if (!close()) return error("@font-face missing '}'");

    return pos({
      type: 'font-face',
      declarations: decls
    });
  }

  function atfns() {
    var pos = position();
    var m = match(/^@fns\s*/);

    if (!m) return;

    if (!open()) return error("@fns missing '{'");

    var style = comments().concat(rules());

    if (!close()) return error("@fns missing '}'");

    return pos({
      type: 'fns',
      rules: style
    });
  }

  function atif() {
    var pos = position();
    var m = match(/^@if *([^{]+)/);

    if (!m) return;
    var condition = trim(m[1]);

    if (!open()) return error("@if missing '{'");

    var style = comments().concat(rules());

    if (!close()) return error("@if missing '}'");

    return pos({
      type: 'if',
      condition: condition,
      rules: style
    });
  }

  function atelseif() {
    var pos = position();
    var m = match(/^@elseif *([^{]+)/);

    if (!m) return;
    var condition = trim(m[1]);

    if (!open()) return error("@elseif missing '{'");

    var style = comments().concat(rules());

    if (!close()) return error("@elseif missing '}'");

    return pos({
      type: 'elseif',
      condition: condition,
      rules: style
    });
  }

  function atelse() {
    var pos = position();
    var m = match(/^@else\s*/);

    if (!m) return;

    if (!open()) return error("@else missing '{'");

    var style = comments().concat(rules());

    if (!close()) return error("@else missing '}'");

    return pos({
      type: 'else',
      rules: style
    });
  }

  function atfor() {
    var pos = position();
    var m = match(/^@for *([^{]+)/);

    if (!m) return;
    var vars = trim(m[1]).split(' of ');
    if (vars.length !== 2) return;
    var left = vars[0];
    var leftVars = left.split(',');
    var item = leftVars[0];
    var index = leftVars[1];
    var items = vars[1];

    if (!open()) return error("@for missing '{'");

    var style = comments().concat(rules());

    if (!close()) return error("@for missing '}'");

    return pos({
      type: 'for',
      item: item,
      index: index,
      items: items,
      rules: style
    });
  }

  /**
   * Parse import
   */

  var atimport = _compileAtrule('import');

  /**
   * Parse charset
   */

  var atcharset = _compileAtrule('charset');

  /**
   * Parse namespace
   */

  var atnamespace = _compileAtrule('namespace');

  /**
   * Parse non-block at-rules
   */

  function _compileAtrule(name) {
    var re = new RegExp('^@' + name + '\\s*([^;]+);');
    return function() {
      var pos = position();
      var m = match(re);
      if (!m) return;
      var ret = { type: name };
      ret[name] = m[1].trim();
      return pos(ret);
    }
  }

  /**
   * Parse at rule.
   */

  function atrule() {
    if (css[0] != '@') return;

    return atkeyframes()
      || atmedia()
      || atcustommedia()
      || atsupports()
      || atimport()
      || atcharset()
      || atnamespace()
      || atdocument()
      || atpage()
      || athost()
      || atfontface()
      || atfns()
      || atif()
      || atelseif()
      || atelse()
      || atfor();
  }

  /**
   * Parse rule.
   */

  function rule() {
    var pos = position();
    var sel = selector();

    if (!sel) return error('selector missing');
    comments();

    return pos({
      type: 'rule',
      selectors: sel,
      declarations: declarations()
    });
  }

  return addParent(stylesheet());
};

/**
 * Trim `str`.
 */

function trim(str) {
  return str ? str.replace(/^\s+|\s+$/g, '') : '';
}

/**
 * Adds non-enumerable parent node reference to each node.
 */

function addParent(obj, parent) {
  var isNode = obj && typeof obj.type === 'string';
  var childParent = isNode ? obj : parent;

  for (var k in obj) {
    var value = obj[k];
    if (Array.isArray(value)) {
      value.forEach(function(v) { addParent(v, childParent); });
    } else if (value && typeof value === 'object') {
      addParent(value, childParent);
    }
  }

  if (isNode) {
    Object.defineProperty(obj, 'parent', {
      configurable: true,
      writable: true,
      enumerable: false,
      value: parent || null
    });
  }

  return obj;
}


/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.parseHtmlToAst = parseHtmlToAst;
exports.buildAstToHtml = buildAstToHtml;
exports.traverseAst = traverseAst;
exports.diffAst = diffAst;
exports.patchAst = patchAst;

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _toArray(arr) { return _arrayWithHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var SELF_CLOSE_TAGS = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
/**
 * 将html字符串解析为ast
 * @param {string} html
 * @param {function} visit 访问第一次生成时的节点，返回新节点信息
 * @returns ast
 */

function parseHtmlToAst(html, visit) {
  var nest = [];
  var len = html.length;
  var inTagBegin = null;
  var inTag = null;
  var nodes = [];

  for (var i = 0; i < len; i++) {
    var _char = html[i];
    var next = html[i + 1]; // 关闭标签

    if (inTag && _char === '<' && next === '/') {
      while (_char !== '>') {
        i++;
        _char = html[i];
      } // TODO check intag


      var node = inTag;

      if (node.length < 3) {
        node[1] = node[1] || null;
        node[2] = '';
      }

      nest.pop();
      inTag = nest[nest.length - 1];
    } // 开始一个标签
    else if (!inTagBegin && _char === '<' && html[i + 1] !== ' ') {
        if (html[i + 1] === '!' && html[i + 2] === '-' && html[i + 3] === '-') {
          var comment = ['#comment', null];
          var content = '';
          i += 4;
          _char = html[i];

          while (!(_char === '-' && html[i + 1] === '-' && html[i + 2] === '>')) {
            content += _char;
            i++;
            _char = html[i];
          }

          comment[2] = content;
          var parent = nest.length ? nest[nest.length - 1] : nest;
          parent.push(comment);
          i += 2;
          continue;
        }

        var tag = '';
        i++;
        _char = html[i];

        while (_char !== ' ' && _char !== '>') {
          tag += _char;
          i++;
          _char = html[i];
        }

        var _node = [tag.trim()];
        inTagBegin = _node;
        nodes.push(_node);
        i--;
      } // 属性
      else if (inTagBegin && _char === ' ') {
          (function () {
            var quota = '';
            var name = '';
            var value = '';
            var node = inTagBegin;

            var putAttr = function putAttr(data) {
              if (!name) {
                return;
              }

              name = name.trim();
              node[1] = node[1] || {};
              node[1][name] = data;
              name = '';
              value = '';
              quota = '';
            };

            while (i < len) {
              i++;
              _char = html[i]; // 忽略空格

              if (!quota && _char === ' ') {
                // 有些属性被放在引号中，有空格
                if (name[0] !== '"' && name[0] !== "'") {
                  // 没有值的属性结束
                  if (name) {
                    putAttr(null);
                  }

                  continue;
                }
              } // 立即自关闭标签，例如 <img />


              if (!quota && _char === '/' && html[i + 1] === '>') {
                var _parent = nest.length ? nest[nest.length - 1] : nest;

                _parent.push(node);

                inTagBegin = null;
                i++;
                putAttr(null);
                break;
              } // 关闭开始标签，例如 <div >


              if (!quota && _char === '>') {
                i--;
                putAttr(null);
                break;
              } // 属性名结束，值开始


              if (!quota && _char === '=') {
                i++;
                _char = html[i];
                quota = _char;
                continue;
              }

              if (!quota) {
                name += _char;
                continue;
              } // 值结束


              if (quota && _char === quota && html[i - 1] !== '\\') {
                putAttr(value);
                continue;
              }

              if (quota) {
                value += _char;
                continue;
              }
            }
          })();
        } // 开始标签结束
        else if (inTagBegin && _char === '>') {
            var _node2 = visit ? visit(inTagBegin) : inTagBegin;

            var _parent2 = nest.length ? nest[nest.length - 1] : nest;

            _parent2.push(_node2);

            nest.push(_node2);
            _node2[1] = _node2[1] || null; // 强制props

            inTagBegin = null;
            inTag = _node2;

            if (SELF_CLOSE_TAGS.indexOf(_node2[0]) > -1) {
              nest.pop();
              inTag = nest[nest.length - 1];
            }
          } else if (inTag) {
            var _node3 = inTag;

            if (_node3.length < 3) {
              _node3[1] = _node3[1] || null;
              _node3[2] = _char;
            } else if (typeof _node3[_node3.length - 1] === 'string') {
              _node3[_node3.length - 1] += _char;
            } else {
              _node3.push(_char);
            }
          }
  }

  return nest[0];
}

function buildAstToHtml(ast) {
  var _ast = _toArray(ast),
      name = _ast[0],
      attrs = _ast[1],
      children = _ast.slice(2);

  var html = '';

  var buildAttrs = function buildAttrs(attrs) {
    var str = '';

    if (!attrs) {
      return str;
    }

    var keys = Object.keys(attrs);
    keys.forEach(function (key) {
      var value = attrs[key];

      if (value === null) {
        str += " ".concat(key);
      } else {
        str += " ".concat(key, "=\"").concat(value.replace(/\\"/gm, '"').replace(/"/gm, '\\"'), "\"");
      }
    });
    return str;
  };

  var buildChildren = function buildChildren(children) {
    var str = '';

    if (!children || !children.length) {
      return str;
    }

    children.forEach(function (child) {
      if (typeof child === 'string') {
        str += child;
      } else {
        str += buildAstToHtml(child);
      }
    });
    return str;
  };

  if (name.indexOf('!') === 0 || name.indexOf('?') === 0) {
    html += "<".concat(name).concat(buildAttrs(attrs), ">").concat(buildChildren(children));
  } else if (name.indexOf('#') === 0) {
    if (name === '#comment') {
      html += "<--".concat(children[0], "-->");
    }
  } else if (children.length) {
    html += "<".concat(name).concat(buildAttrs(attrs), ">").concat(buildChildren(children), "</").concat(name, ">");
  } else {
    html += "<".concat(name).concat(buildAttrs(attrs), " />");
  }

  return html;
}

function traverseAst(ast, visitor) {
  function traverseArray(arr, parent) {
    arr.forEach(function (child) {
      traverseNode(child, parent);
    });
  }

  function traverseNode(node, parent) {
    var _node4 = _toArray(node),
        type = _node4[0],
        props = _node4[1],
        children = _node4.slice(2);

    var methods = visitor[type] || visitor['*'];

    if (methods && methods.enter) {
      methods.enter(node, parent);
    } // 如果被移除了，就不再往内部迭代


    if (Array.isArray(parent) && !parent.includes(node)) {
      return;
    }

    traverseArray(children, node);

    if (methods && methods.exit) {
      methods.exit(node, parent);
    }
  }

  traverseNode(ast, null);
}

function diffAst(ast1, ast2, tiny) {
  var getIdentifiers = function getIdentifiers(items) {
    var ids = items.map(function (item) {
      if (typeof item === 'string') {
        // break line like \n\s\s
        if (item[0] === '\n' && !item.trim()) {
          return '#nl_' + (item.length - 1);
        }

        return '#text';
      } else {
        var _item = _slicedToArray(item, 2),
            name = _item[0],
            attrs = _item[1];

        if (name.indexOf('#') === 0) {
          return name;
        } else if (attrs && attrs.id) {
          return "".concat(name, "#").concat(attrs.id);
        } else if (attrs && attrs['data-id']) {
          return "".concat(name, "#").concat(attrs['data-id']);
        } else {
          return "".concat(name).concat(attrs ? "[".concat(Object.keys(attrs).join(','), "]") : '');
        }
      }
    });
    var res = ids.map(function (id, i) {
      if (id.indexOf('#') > 0) {
        return id;
      }

      var regression = ids.slice(0, i);
      var count = regression.filter(function (item) {
        return item === id;
      }).length;
      return id + '@' + (count + 1);
    });
    return res;
  };

  var makePath = function makePath(item, index, items) {
    if (tiny) {
      return index;
    }

    var nth = 1;

    for (var i = 0, len = items.length; i < len; i++) {
      if (i >= index && items[i] === item) {
        break;
      }

      if (typeof item === 'string') {
        if (typeof items[i] === 'string') {
          nth++;
        }
      } else if (items[i][0] === item[0]) {
        nth++;
      }
    }

    var name = typeof item === 'string' ? 'text()' : item[0].indexOf('#') === 0 ? item[0].replace('#', '') + '()' : item[0];
    return "".concat(name, "[").concat(nth, "]");
  };

  var createPath = function createPath(deepth, path) {
    return deepth.concat(path || path === 0 ? path : []).join('/');
  };

  var createMutation = function createMutation(data) {
    var type = data.type;

    if (type === 'children') {
      var removed = data.removed,
          inserted = data.inserted,
          moved = data.moved;

      if (!removed.length && !inserted.length && !moved.length) {
        return;
      }
    }

    if (!tiny) {
      return data;
    }

    if (type === 'attribute') {
      var target = data.target,
          name = data.name,
          next = data.next;
      return {
        t: 'A',
        e: target,
        n: name,
        v: next
      };
    }

    if (type === 'text') {
      var _target = data.target,
          _next = data.next;
      return {
        t: 'T',
        e: _target,
        v: _next
      };
    }

    if (type === 'children') {
      var _target2 = data.target,
          _removed = data.removed,
          _inserted = data.inserted,
          _moved = data.moved;
      var output = {
        t: 'C',
        e: _target2
      };

      if (_removed.length) {
        output.r = _removed.map(function (item) {
          var node = item.node;
          return {
            e: node
          };
        });
      }

      if (_moved.length) {
        output.m = _moved.map(function (item) {
          var before = item.before,
              node = item.node;
          return {
            e: node,
            b: before
          };
        });
      }

      if (_inserted.length) {
        output.i = _inserted.map(function (item) {
          var before = item.before,
              next = item.next;
          return {
            x: next,
            b: before
          };
        });
      }

      return output;
    }
  };

  var diffAttrs = function diffAttrs(attrs1, attrs2, deepth) {
    var props1 = attrs1 || {};
    var props2 = attrs2 || {};

    var _attrs = _objectSpread(_objectSpread({}, props1), props2);

    var keys = Object.keys(_attrs);
    var mutations = [];
    keys.forEach(function (key) {
      if (props1[key] !== props2[key]) {
        var mutation = createMutation({
          type: 'attribute',
          target: createPath(deepth),
          name: key,
          next: key in props2 ? props2[key] : void 0,
          prev: key in props1 ? props1[key] : void 0
        });
        mutations.push(mutation);
      }
    });
    return mutations;
  };

  var diff = function diff(items1, items2, deepth) {
    var identifiers1 = getIdentifiers(items1);
    var identifiers2 = getIdentifiers(items2);

    var memoItems = _toConsumableArray(items1);

    var memoIdentifiers = _toConsumableArray(identifiers1);

    var removed = [];
    var inserted = [];
    var moved = []; // 找出被移除的节点

    for (var i = items1.length - 1; i > -1; i--) {
      var id1 = identifiers1[i];
      var index = identifiers2.indexOf(id1);

      if (index < 0) {
        removed.push({
          node: makePath(items1[i], i, items1)
        });
        memoItems.splice(i, 1);
        memoIdentifiers.splice(i, 1);
      }
    } // 找出被移动的节点
    // 此时，memoIdentifiers是identifiers2子集，接下来调整memoIdentifiers的位置为identifiers2子序列，拍完序之后，插入更简单


    for (var _i2 = items2.length - 1, len = memoIdentifiers.length, curr = len; _i2 > -1; _i2--) {
      var id2 = identifiers2[_i2];

      var _index = memoIdentifiers.indexOf(id2); // 新增的，不在原来的列表中


      if (_index === -1) {
        continue;
      } // 无需移动


      if (curr - 1 === _index) {
        curr--;
        continue;
      }

      var item = memoItems[_index];
      var next = curr === len ? null : memoItems[curr];
      var before = next === null ? null : makePath(next, curr, memoItems);
      var node = makePath(item, _index, memoItems);
      moved.push({
        before: before,
        node: node
      });
      memoItems.splice(curr, 0, item);
      memoIdentifiers.splice(curr, 0, id2);
      memoItems.splice(_index, 1);
      memoIdentifiers.splice(_index, 1);
      curr--;
    } // 找出被添加的节点
    // 由于前面做了排序，接下来，只需要按照对应序列插入即可


    for (var _i3 = items2.length - 1, _len = memoIdentifiers.length, _curr = _len; _i3 > -1; _i3--) {
      var _id = identifiers2[_i3];

      var _index2 = memoIdentifiers.indexOf(_id); // 不是新增的


      if (_index2 > -1) {
        _curr--;
        continue;
      }

      var _before = _curr === _len ? null : makePath(memoItems[_curr], _curr, memoItems); // null表示插入到最后一个元素


      var _next2 = items2[_i3];
      memoIdentifiers.splice(_curr, 0, _id);
      memoItems.splice(_curr, 0, _next2);
      var _node5 = {
        before: _before,
        next: _next2
      };
      inserted.push(_node5);
    }

    var mutation = createMutation({
      type: 'children',
      target: createPath(deepth, []),
      removed: removed,
      inserted: inserted,
      moved: moved
    });
    var mutations = [];

    if (mutation) {
      mutations.push(mutation);
    }

    for (var _i4 = 0, _len2 = memoItems.length; _i4 < _len2; _i4++) {
      var _item2 = memoItems[_i4];

      var _node6 = makePath(_item2, _i4, memoItems);

      var _next3 = items2[_i4];

      if (typeof _item2 === 'string') {
        if (_item2 !== _next3) {
          var _mutation = createMutation({
            type: 'text',
            target: createPath(deepth, _node6),
            next: _next3,
            prev: _item2
          });

          mutations.push(_mutation);
        }
      } // 那些不是插入的新对象，才需要进入深对比
      else if (items1.indexOf(_item2) > -1) {
          var _item3 = _toArray(_item2),
              _name1 = _item3[0],
              _attrs2 = _item3[1],
              _children = _item3.slice(2);

          var _next4 = _toArray(_next3),
              _name2 = _next4[0],
              _attrs3 = _next4[1],
              _children2 = _next4.slice(2);

          if (_attrs2 || _attrs3) {
            var _attrsMutations = diffAttrs(_attrs2, _attrs3, [].concat(_toConsumableArray(deepth), [_node6]));

            mutations.push.apply(mutations, _toConsumableArray(_attrsMutations));
          }

          var changes = diff(_children, _children2, [].concat(_toConsumableArray(deepth), [_node6]));
          mutations.push.apply(mutations, _toConsumableArray(changes));
        }
    }

    return mutations;
  };

  var mutations = [];

  var _ast2 = _toArray(ast1),
      name1 = _ast2[0],
      attrs1 = _ast2[1],
      children1 = _ast2.slice(2);

  var _ast3 = _toArray(ast2),
      name2 = _ast3[0],
      attrs2 = _ast3[1],
      children2 = _ast3.slice(2);

  var attrsMutations = diffAttrs(attrs1, attrs2, []);
  mutations.push.apply(mutations, _toConsumableArray(attrsMutations));
  var childrenMutations = diff(children1, children2, []);
  mutations.push.apply(mutations, _toConsumableArray(childrenMutations));
  return mutations;
}

function patchAst(ast, mutations, tiny) {
  // 如果mutations中开头5个都是只有t而没有type，说明是用的tiny模式
  if (typeof tiny === 'undefined' && mutations.slice(0, 5).every(function (mutation) {
    return 't' in mutation && !('type' in mutation);
  })) {
    tiny = true;
  }

  var deepClone = function deepClone(obj) {
    var copy = Array.isArray(obj) ? [] : {};

    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        copy[key] = obj[key] && _typeof(obj[key]) === 'object' ? deepClone(obj[key]) : obj[key];
      }
    }

    return copy;
  };

  var findNodeByTiny = function findNodeByTiny(ast, target) {
    if (typeof target === 'number') {
      var _ast4 = _toArray(ast),
          _name = _ast4[0],
          _attrs = _ast4[1],
          children = _ast4.slice(2);

      return [children[target], target, ast];
    }

    var path = target.split('/');
    var node = ast;
    var parent = null;
    var index = -1;
    path.forEach(function (item) {
      var i = +item;

      var _node7 = node,
          _node8 = _toArray(_node7),
          _name = _node8[0],
          _attrs = _node8[1],
          children = _node8.slice(2);

      parent = node;
      node = children[i];
      index = i;
    });
    return [node, index, parent];
  };

  var findNode = function findNode(ast, target) {
    // 末尾位置
    if (target === null) {
      var _ast5 = _toArray(ast),
          _name = _ast5[0],
          _attrs = _ast5[1],
          children = _ast5.slice(2);

      return [null, children.length, ast];
    } // 自己本身


    if (target === '') {
      return [ast, -1, null];
    }

    if (tiny) {
      return findNodeByTiny(ast, target);
    }

    var path = target.split('/').map(function (item) {
      var name = item.replace(/\[.*?\]$/, '');
      var nth = +item.replace(name, '').replace(/[\[\]]/g, '');
      return [name, nth];
    });
    var node = ast;
    var parent = null;
    var index = -1;
    path.forEach(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          name = _ref2[0],
          nth = _ref2[1];

      var _node9 = node,
          _node10 = _toArray(_node9),
          _name = _node10[0],
          _attrs = _node10[1],
          children = _node10.slice(2);

      var sibling = 0;

      for (var i = 0, len = children.length; i < len; i++) {
        var child = children[i];

        if (typeof child === 'string') {
          if (name === 'text()') {
            sibling++;
          }
        } else if (name === child[0]) {
          sibling++;
        } else if (name.substr(name.length - 2, 2) === '()' && child[0].indexOf('#') === 0 && name.substring(0, name.length - 2) === child[0].substr(1)) {
          sibling++;
        }

        if (sibling === nth) {
          parent = node;
          node = child;
          index = i;
          return;
        }
      }
    });
    return [node, index, parent];
  };

  var json = deepClone(ast);

  var patchBy = function patchBy(mutation) {
    var type = tiny ? mutation.t : mutation.type;
    var target = tiny ? mutation.e : mutation.target;

    var _findNode = findNode(json, target),
        _findNode2 = _slicedToArray(_findNode, 3),
        node = _findNode2[0],
        index = _findNode2[1],
        parent = _findNode2[2];

    if (tiny ? type === 'T' : type === 'text') {
      var next = tiny ? mutation.v : mutation.next;
      parent[index + 2] = next;
    } else if (tiny ? type === 'A' : type === 'attribute') {
      var name = tiny ? mutation.n : mutation.name;

      var _next5 = tiny ? mutation.v : mutation.next;

      var attrs = node[1] || {};

      if (typeof _next5 === 'undefined') {
        delete attrs[name];
      } else {
        attrs[name] = _next5;
      }

      node[1] = attrs;
    } else if (tiny ? type === 'C' : type === 'children') {
      var removed = (tiny ? mutation.r : mutation.removed) || [];
      var inserted = (tiny ? mutation.i : mutation.inserted) || [];
      var moved = (tiny ? mutation.m : mutation.moved) || [];
      removed.forEach(function (item) {
        var path = tiny ? item.e : item.node;

        var _findNode3 = findNode(node, path),
            _findNode4 = _slicedToArray(_findNode3, 3),
            _ = _findNode4[0],
            index = _findNode4[1],
            parent = _findNode4[2];

        parent.splice(index + 2, 1);
      });
      moved.forEach(function (item) {
        var path = tiny ? item.e : item.node;
        var before = tiny ? item.b : item.before;

        var _findNode5 = findNode(node, path),
            _findNode6 = _slicedToArray(_findNode5, 3),
            next = _findNode6[0],
            removeIndex = _findNode6[1],
            removeFromParent = _findNode6[2];

        removeFromParent.splice(removeIndex + 2, 1);

        var _findNode7 = findNode(node, before),
            _findNode8 = _slicedToArray(_findNode7, 3),
            _ = _findNode8[0],
            index = _findNode8[1],
            parent = _findNode8[2]; // notice, only tiny diff need to compute index position


        if (tiny && removeIndex < index) {
          parent.splice(index + 1, 0, next);
        } else {
          parent.splice(index + 2, 0, next);
        }
      });
      inserted.forEach(function (item) {
        var before = tiny ? item.b : item.before;
        var next = tiny ? item.x : item.next;

        if (before === null) {
          node.push(next);
        } else {
          var _findNode9 = findNode(node, before),
              _findNode10 = _slicedToArray(_findNode9, 3),
              _ = _findNode10[0],
              _index3 = _findNode10[1],
              _parent3 = _findNode10[2];

          _parent3.splice(_index3 + 2, 0, next);
        }
      });
    }
  };

  mutations.forEach(patchBy);
  return json;
}


/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "each": () => (/* binding */ each),
/* harmony export */   "clear": () => (/* binding */ clear)
/* harmony export */ });
function each(obj, fn) {
  const keys = Object.keys(obj)
  for (let i = 0, len = keys.length; i < len; i ++) {
    const key = keys[i]
    const value = obj[key]
    fn(key, value)
  }
}

function clear(str) {
  return str.replace(/\/\*.*?\*\//gmi, '').replace(/\/\/.*?[\n$]/, '')
}


/***/ })
/******/ 	]);
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
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "parseComponent": () => (/* binding */ parseComponent),
/* harmony export */   "genComponent": () => (/* binding */ genComponent),
/* harmony export */   "compileComponent": () => (/* binding */ compileComponent),
/* harmony export */   "loadComponent": () => (/* binding */ loadComponent)
/* harmony export */ });
/* harmony import */ var _css_parser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var abs_html__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2);
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(3);
// import { parse as parseJs } from '@babel/parser'




function parseJs(sourceCode) {
  const deps = []
  const imports = []
  const components = []
  const scripts = sourceCode
    .replace(/import([\w\W]*?)from\s*?['"]sfc:(.+?)['"][;\n$]/gmi, (_, declares, src) => {
      if (src.indexOf('.') === 0 || src.indexOf('/') === 0) {
        components.push([declares.trim(), src])
      }
      deps.push([declares.trim(), src])
      return ''
    })
    .replace(/const (.+?)\s*?=\s*?await\s*?import\(['"]sfc:(.+?)['"]\)[;\n$]/gmi, (_, declares, src) => {
      deps.push([declares.trim(), src])
      return ''
    })
    .replace(/import([\w\W]*?)from\s*?['"](.+?)['"][;\n$]/gmi, (_, declares, src) => {
      imports.push([declares.trim(), src])
      return ''
    })

  const lines = scripts.split('\n').reduce((lines, current) => {
    const last = lines[lines.length - 1]
    const isCurrentEmpty = !current.trim()
    if (!last && isCurrentEmpty) {
      return lines
    }

    if (!last) {
      lines.push(current)
      return lines
    }

    const isLastEmpty = !last.trim()
    if (isLastEmpty && isCurrentEmpty) {
      return lines
    }

    lines.push(current)
    return lines
  }, [])

  let code = ''
  let reactive = ''

  const genReactive = () => {
    code += reactive.replace(/let\s+?(\w+?)\s*?=([\W\w]+?)[;\n$]/gmi, (_, name, value) => {
      return `let ${name} = SFCJS.reactive(${value.trim()}, () => ${name})`
    })
    code += '\n'
  }

  for (let i = 0, len = lines.length; i < len; i ++) {
    const line = lines[i]

    if (/^let\s+?\w+?\s*?=.*?;/.test(line.trim())) {
      code += line.replace(/let\s+?(\w+?)\s*?=(.*?);/, (_, name, value) => {
        return `let ${name} = SFCJS.reactive(${value.trim()}, () => ${name});`
      })
      code += '\n'
      continue
    }

    if (/^let\s+?\w+?\s*?=.*?$/.test(line.trim())) {
      reactive += line + '\n'

      for (++ i; i < len; i ++) {
        const nextLine = lines[i]
        const str = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.clear)(nextLine)

        if (['let ', 'const ', 'var ', 'function', '[', '(', ';', 'async '].some(item => str.indexOf(item) === 0)) {
          genReactive()
          i --
          break
        }

        reactive += nextLine + '\n'

        if ([';', '}', ')'].includes(str[str.length - 1])) {
          genReactive()
          break
        }
      }
      console.log(reactive)

      continue
    }

    code += line + '\n'
  }

  return {
    imports,
    deps,
    components,
    code,
  }
}

function parseCss(sourceCode, source) {
  const ast = (0,_css_parser__WEBPACK_IMPORTED_MODULE_0__.default)(sourceCode, { source })
  console.log(ast)
  let code = 'function(r) {\n'
  code += '}'
  return code
}

function parseHtml(sourceCode, source) {
  const htmlAst = (0,abs_html__WEBPACK_IMPORTED_MODULE_1__.parseHtmlToAst)(sourceCode.trim())

  let code = 'function(h) {\n'
  ;(0,abs_html__WEBPACK_IMPORTED_MODULE_1__.traverseAst)(htmlAst, {
    '*': {
      enter(node, parent) {
        // 去掉所有换行逻辑
        if (typeof node === 'string' && /\n\s*/.test(node)) {
          const index = parent.indexOf(node)
          parent.splice(index, 1)
        }
      },
    },
  })
  console.log(htmlAst)
  code += '}'

  return code
}

function parseComponent(text, source) {
  let jsSource = null
  let cssCode = null

  const html = text
    .replace(/<script.*?>([\w\W]*?)<\/script>\n?/gmi, (_, sourceCode) => {
      jsSource = parseJs(sourceCode, source)
      return ''
    })
    .replace(/<style>([\w\W]*?)<\/style>\n?/gmi, (_, sourceCode) => {
      cssCode = parseCss(sourceCode, source)
      return ''
    })
    .trim()

  const htmlCode = parseHtml(html, source)
  const { imports, deps, code: jsCode, components } = jsSource

  return {
    imports,
    deps,
    components,
    jsCode,
    cssCode,
    htmlCode,
  }
}

function genComponent({ imports, deps, components, jsCode, cssCode, htmlCode }, source) {
  const output = [
    ...imports.map(([vars, src]) => `import ${vars} from "${src}";`),
    `SFCJS.define("${source}", [${deps.map(([, src]) => `"${src}"`).join(', ')}], function(${deps.map(([name]) => `${name}`).join(', ')}) {`,
    jsCode,
    `  const components = {\n${components.map(([name]) => `    ${name}`).join(',\n')}\n  }`,
    `  return {\n    components,\n    css: ${cssCode},\n    dom: ${htmlCode}\n  }`,
    '});',
  ].join('\n')
  return output
}

function compileComponent(text, source) {
  const asts = parseComponent(text, source)
  const code = genComponent(asts, source)
  console.log(code)
  return code
}

function loadComponent(src) {
  return fetch(src).then(res => res.text()).then(text => compileComponent(text, src))
}

})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});