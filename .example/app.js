SFCJS.define('/app.htm', ['./some.htm', 'emit', 'props'], async function(SomeComponent, emit, props) {
  const name = 'static name'

  let age = SFCJS.reactive(10, () => age)

  function grow() {
    age ++
    emit('grow', age)
  }

  const colors = [
    '#fee',
    '#ccd',
    '#a97',
  ]

  const components = {
    SomeComponent,
  }

  return {
    components,
    style(r) {
      const some = (color, age) => ({
        color: color,
        fontSize: age,
      })

      return [
        r('.age', { color: colors[age % 3] }),
        age % 5 === 0 && age > 10
          ? r('.age', { fontSize: 24 }, some('red', age))
          : r('.age', { fontSize: 12 }),
        colors.map((color, index) => r(`.age-${index + 10}`, { color })),
      ]
    },
    render(h) {
      return h(
        'div',
        {
          class: 'app',
        },
        h('h3', props.title),
        h(
          'span',
          `${name}:`,
        ),
        h(
          'span',
          {
            class: ['age', 'age-' + age],
            style: age / 3 > 10 ? 'color: red;' : undefined,
          },
          age,
        ),
        h(
          'button',
          {
            events: {
              click: event => grow(event),
            },
          },
          'grow',
        ),
        h(
          'some-component',
          {
            attrs: {
              name: "xxx",
            },
            props: {
              someAttr: age,
            },
          },
        ),
      )
    },
  }
})
