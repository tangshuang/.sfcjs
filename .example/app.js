SFCJS.define(['./some.htm', 'emit', 'props', 'h', 'r'], async function(SomeComponent, emit, props, h, r) {
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

  return {
    style: r`
      .name {
        color: #ffe;
      }
      .age {
        color: ${colors[age % 3]};
      }

      @fns {
        some: ${(color, age) => `
          outline: none;
          color: ${color};
          font-size: ${age}px;
        `}
      }

      @if ${age % 5 === 0 && age > 10} {
        .age {
          font-size: 24px;
          fns: some(red, ${age}), some(red, age);
        }
      }
      @else {
        .age {
          font-size: 12px;
        }
      }

      @for ${colors.map((color, index) => r`
        .age-${index + 10} {
          color: ${color};
        }
      `)}
    `,
    render: h`
      <div class="app">
        <h3>${props.title}</h3>
        <span>${name}:</span>
        <span
          class="age"
          :class="${'age-' + age}"
          :style="${age / 3 > 10 ? 'color: red;' : undefined}"
          (if)="${age > 10}"
        >${() => age}</span>
        <span (repeat)="color,index of ${colors}">
          ${({ color, index }) => h`<i>${index}: ${color}</i>`}
        </span>
        <button @click="${event => grow(event)}">grow</button>
        <${SomeComponent}
          name="xxx"
          :some-attr="${age * 5 > 10 ? 'ok' : undefined}"
        ></${SomeComponent}>
      </div>
    `,
  }
})
