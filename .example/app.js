SFCJS.define('/app.htm', ['./some.htm', 'emit', 'props'], function(SomeComponent, emit, props) {
  const name = 'static name'
  const colors = [
    '#fee',
    '#ccd',
    '#a97',
  ]

  const scope = SFCJS.reactive({
    age: 10,
  })

  function grow() {
    scope.age ++
    emit('grow', scope.age)
  }

  const components = {
    SomeComponent,
  }

  return {
    scope,
    components,
    style(r) {
      const some = () => ({
        color: '#000'
      })

      return [
        r('.age', { color: colors[scope.age % 3] }),
        scope.age % 5 === 0 && scope.age > 10
          ? r('.age', { fontSize: 24 }, some())
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
            class: ['age', 'age-' + scope.age],
            style: scope.age / 3 > 10 ? 'color: red;' : undefined,
          },
          scope.age,
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
              someAttr: scope.age,
            },
          },
        ),
      )
    },
  }
})
