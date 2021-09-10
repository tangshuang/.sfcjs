import { each, resolveUrl } from '../utils'
import { tokenize } from './js-parser'

// fork https://github.com/reworkcss/css/blob/master/lib/parse/index.js

// http://www.w3.org/TR/CSS21/grammar.html
// https://github.com/visionmedia/css-parse/pull/49#issuecomment-30088027
var commentre = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g

function parseCssAst(css, options){
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

export function parseCss(sourceCode, source, givenVars) {
  const ast = parseCssAst(sourceCode, { source })
  let code = '() => {'

  const { stylesheet = {} } = ast
  const { rules = [] } = stylesheet
  const fnsSections = []
  const sections = []
  each(rules, (rule) => {
    if (rule.type === 'fns') {
      fnsSections.push(rule)
    }
    else {
      sections.push(rule)
    }
  })

  const consumeVars = (code, vars = {}) => {
    const tokens = tokenize(code)
    const localVars = { ...givenVars, ...vars }
    each(tokens, (item, i) => {
      if (localVars[item]) {
        tokens[i] = `SFC.consume(${item})`
      }
    })
    const res = tokens.join('')
    return res
  }

  const createName = (name) => {
    const str = name.replace(/\[\[(.*?)\]\]/g, (_, $1) => {
      return '${' + consumeVars($1) + '}'
    })
    return name === str ? `'${str}'` : '`' + str + '`'
  }
  const createValue = (value, direct) => {
    const interpolated = value.replace(/var\(['"]\{\{(.*?)\}\}['"]\)/g, (_, $1) => {
      return '${' + consumeVars($1) + '}'
    }).replace(/\[\[(.*?)\]\]/g, (_, $1) => {
      return '${' + consumeVars($1) + '}'
    })

    const res = interpolated === value ? `'${value}'`
      : /^\$\{.*?\}$/.test(interpolated) && (direct || interpolated.indexOf('SFC.consume') === -1) ? interpolated.substring(2, interpolated.length - 1)
      : '`' + interpolated + '`'
    const output = res.replace(/\n*/g, '').replace(/\s+/g, ' ')
    return output
  }

  const createFnInvoker = (value) => {
    const interpolated = value
      .replace(/var\(['"]\{\{(.*?)\}\}['"]\)/g, '${$1}')
      .replace(/\[\[(.*?)\]\]/g, '${$1}')
    const res = interpolated === value ? `'${value}'`
      : /^\$\{.*?\}$/.test(interpolated) ? interpolated.substring(2, interpolated.length - 1)
      : '`' + interpolated + '`'
    return res
  }

  const createFnValue = (value, params) => {
    const items = params.substring(1, params.length - 1).split(',').map(item => item.trim())
    const vars = {}
    each(items, (key) => {
      vars[key] = 1
    })

    const interpolated = value
      .replace(/var\(['"]\{\{(.*?)\}\}['"]\)/g, (_, $1) => {
        return '${' + consumeVars($1, vars) + '}'
      })
      .replace(/\[\[(.*?)\]\]/g, (_, $1) => {
        return '${' + consumeVars($1, vars) + '}'
      })

    if (interpolated === value) {
      return value
    }

    if (/^\$\{.*?\}$/.test(interpolated)) {
      return '() => ' + interpolated.substring(2, interpolated.length - 1)
    }

    return '() => `' + interpolated + '`'
  }

  const createProps = (declarations) => {
    const properties = []
    each(declarations, ({ property, value }) => {
      if (property === 'fns') {
        const fns = value.split(/,\s*?(?=\w+\()/).map((invoker) => {
          const [name, paramsStr = ''] = invoker.split(/(?=\()/)
          const paramsT = paramsStr.trim()
          const params = paramsT.substring(1, paramsT.length - 1).split(',')
            .map(item => item.trim())
            .map(item => createFnInvoker(item))
          return `['@fn', () => ${name}(${params.join(',')})]`
        })
        properties.push({ fns })
        return
      }

      properties.push({
        name: `'${property}'`,
        value: createValue(value),
      })
    })
    return properties
  }

  const createDeclare = (declarations) => {
    const properties = createProps(declarations)
    const props = []
    each(properties, (item) => {
      const { name, value } = item
      props.push(`${name}: ${/\$\{.*?\}/.test(value) ? `() => ${value}` : value}`)
    })
    return props
  }
  const createBy = (name, declarations) => {
    let rule = `SFC.r(${name},`

    const properties = createProps(declarations)
    const props = []
    each(properties, (item) => {
      const { name, value, fns } = item
      if (fns) {
        if (props.length) {
          rule += `{${props.join(',')}},`
          props.length = 0
        }
        rule += fns.join(',')
      }
      else {
        props.push(`${name}: ${/\$\{.*?\}/.test(value) ? `() => ${value}` : value}`)
      }
    })

    if (props.length) {
      rule += `{${props.join(',')}}`
    }

    rule += ')'

    return rule
  }
  const createRule = (section) => {
    const { selectors, declarations } = section
    const name = createName(selectors.join(','))
    return createBy(name, declarations)
  }
  const createKeyframe = (keyframe) => {
    const { values, declarations } = keyframe
    const name = createName(values.join(','))
    return createBy(name, declarations)
  }

  const fnsMapping = {}
  each(fnsSections, ({ rules }) => {
    each(rules, (rule) => {
      const { selectors, declarations } = rule
      const exp = selectors[0]
      const [name, params] = exp.split(/(?=\()/)
      const properties = []
      each(declarations, ({ property, value }) => {
        const v = createFnValue(value, params)
        const str = `'${property}': ${v}`
        properties.push(str)
      })
      const fn = `const ${name} = ${params} => ({ ${properties.join(',')} })`
      fnsMapping[name] = fn
    })
  })
  const fns = Object.values(fnsMapping)

  const css = []
  let inIf = ''
  each(sections, (section) => {
    const { type } = section
    if (type === 'if') {
      if (inIf) {
        throw new Error('@if不允许嵌套')
      }

      const { condition, rules } = section
      inIf = `'@if', () => ${createValue(condition, true)},`
      const rule = rules.map(createRule).join(',')
      inIf += rules.length > 1 ? `[${rule}]`
        : rules.length === 1 ? rule
        : 'null'

      return
    }
    if (type === 'elseif') {
      if (!inIf) {
        throw new Error('@elseif必须跟在@if后面')
      }

      const { condition, rules } = section
      inIf += `,() => ${createValue(condition, true)},`
      const rule = rules.map(createRule).join(',')
      inIf += rules.length > 1 ? `[${rule}]`
        : rules.length === 1 ? rule
        : 'null'

      return
    }
    if (type === 'else') {
      if (!inIf) {
        throw new Error('@else必须跟在@if后面')
      }

      const { rules } = section
      const rule = rules.map(createRule).join(',')
      inIf += ','
      inIf += rules.length > 1 ? `[${rule}]`
        : rules.length === 1 ? rule
        : 'null'

      css.push(`[${inIf}]`)
      inIf = ''

      return
    }

    // 直接结束if
    if (inIf) {
      inIf += "':',null"
      css.push(`[${inIf}]`)
      inIf = ''
    }

    if (type === 'for') {
      const { items, item, index, rules } = section
      const repeatInside = rules.map(createRule).join(',')
      const repeatItems = createValue(items, true)
      const rule = `['@for', () => ${repeatItems}.map((${item},${index}) => ${rules.length > 1 ? `[${repeatInside}]` : repeatInside})]`
      css.push(rule)
      return
    }

    if (type === 'rule') {
      const rule = createRule(section)
      css.push(rule)
      return
    }

    if (type === 'import') {
      css.push(`['@import', '${resolveUrl(source, section.import)}']`)
      return
    }

    if (type === 'media') {
      css.push(`['@media', '${section.media}', ${section.rules.map(createRule).join(', ')}]`)
      return
    }

    if (type === 'charset') {
      css.push(`['@charset', '${section.charset}']`)
      return
    }

    if (type === 'namespace') {
      css.push(`['@namespace', '${section.namespace}']`)
      return
    }

    if (type === 'supports') {
      css.push(`['@supports', '${section.supports}', ${section.rules.map(createRule).join(', ')}]`)
      return
    }

    if (type === 'keyframes') {
      css.push(`['@keyframes', '${section.name}', ${section.keyframes.map(createKeyframe).join(', ')}]`)
      return
    }

    if (type === 'font-face') {
      const props = createDeclare(section.declarations).map(prop => prop
        .replace(/\('(.*?)'\)/gm, '("$1")')
        .replace(/url\("?(.*?)"?\)/gm, (_, $1) => {
          return `url("${resolveUrl(source, $1)}")`
        })
      )
      css.push(`['@font-face', {${props.join(',')}}]`)
      return
    }
  })

  code += fns.join(';')
  code += fns.length ? ';' : ''

  code += `return [${css.join(',')}];`

  code += '}'
  return code
}
