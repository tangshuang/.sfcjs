# SFCJS

Amazing library to write single file component based UI in web conveniently.

**POC, NEVER USE IT IN PRODUCTION ENVIRONMENT!!!!**

## Whats in SFCJS?

- Single File Component: you should write small components in files.
- Web Components: totally based on customElement, shadow DOM
- Reactive Programing: change js variable to change UI
- Svelte likely design, without virtual dom, modify DOM nodes which depend on variables
- Reactive Styling like Vue rc, based on css variables, when dependencies change styles will change too

## Usage

Entry `index.html` (look into https://unpkg.com/sfcjs/.example/index.html)

```html
<sfc-view src="./my-component.htm" auto="1"></sfc-view>
<script src="https://unpkg.com/sfcjs"></script>
```

Component file `./my-component.html`

```html
<script>
  import SomeComponent from 'sfc:./some.htm' // import another component
  import emit from 'sfc:emit' // import emit from sfcjs

  import { each } from '../src/utils.js'

  // variables which will be treated reactive,
  // when they change, UI may change if depend on them

  let name = 'app_name'
  let age = 10

  let some = {
    name: 'name',
    height: age * 50,
  }

  // use `let` to declare computed reactive which may depend on other reactive variables
  // use `var` to declare normal reactive

  var weight = age * 2

  function grow(e) {
    // change variables may cause rerender
    age ++
    weight += 2
    emit('grow', age)
  }

  // constants will never be changed

  const colors = [
    '#fee',
    '#ccd',
    '#a97',
  ]
</script>

<style>
  .name {
    color: #ffe;
  }

  .age {
    color: rgb(
      /* use js expression with `var('{{ ... }}')` */
      var('{{ age * 5 > 255 ? 255 : age * 5 }}'),
      var('{{ age * 10 > 255 ? 255 : age * 10 }}'),
      var('{{ age * 3 > 255 ? 255 : age * 3 }}')
    );
    /* use variables with [[]] */
    font-size: [[age]]px;
  }

  /**
   * when age changes, the previous style will be changed at the same time
   */
</style>

<div class="app-{{name}}">
  <div>name: <span>{{name}}</span></div>
  <div
    class="age"
    (class)="'age-' + age"
    (style)="age > 13 ? 'font-weight: bold;' : null"
    (if)="age > 10"
  >age: {{age}}</div>
  <div (repeat)="color,index in colors" (if)="!!color" (key)="color">
    <i>{{index}}: {{color}}</i>
  </div>
  <button @click="grow(event)">grow</button>
  <some-component
    :title="'xxx'"
    :some-attr="age * 5 > 10 ? 'ok' : null"
  ></some-component>
</div>
```

Template grammar:

- use js express in `{{ ... }}` to get output string
- use js express in directives which use `(..)` as attribute, `(if)` `(class)` `(style)` `(repeat)` `(key)` `(await)` supported now
- use js express `@..` as event binding attribute, for example `@click="xx(event)"`
- use js express `:..` as component props binding attribute, only works on components, pass real value (object, boolean, number) into components

**directives**

- (if): `<div (if)="someVar === 1">`
- (class): `<div class="default-class" (class)="age > 10 ? 'dynamic-class' : ''">`
- (style): `<div style="color: red" (style)="age > 10 ? 'font-size: 12px' : ''">`
- (repeat): `<div repeat="item,index in items" (key)="item.id">{{item.text}}</div>` `items` is a variable
- (key): always used with repeat
- (await): `<div await="promise.then(data).catch(errro).finall(result)"><span (if)="result">{{data.text}}</span><span (if)="!result">{{errro.message}}</span></div>` `promise` is a variable of Promise
- (bind): `<input (bind)="word" />` only support for `<input>` `<textarea>` `<select>`, two-way-binding for form components, you do not need to pass default value into, i.e. `<textarea (bind)="description"></textarea>`, `description` has value, but you do not need to pass it into `textarea` like -`<textarea (bind)="description">{{description}}</textarea>`-.
