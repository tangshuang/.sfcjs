import {
  parse,
  traverse,
  isForStatement,
  isForInStatement,
  isForOfStatement,
  isClassDeclaration,
  isFunctionDeclaration,
  isWhileStatement,
  isDoWhileStatement,
} from '../babel'

const INSERT_TYPE = 1
const REMOVE_TYPE = 0

export function prettyJsCode(code) {
  const ast = parse(code, {
    parserOpts: {
      tokens: true,
      sourceType: 'unambiguous',
    },
  })

  const founds = process(code, ast)

  console.log(founds, ast.tokens)

  return code
}

/** automatic-semicolon-insertion */
function process(source, ast) {
  const tokens = ast.tokens;
  const founds = [];

  function insert(index, content, token) {
    founds.push({
      type: INSERT_TYPE,
      index,
      content,
      token,
    })
  }

  function remove(start, end, token) {
    founds.push({
      type: REMOVE_TYPE,
      start,
      end,
      token,
    })
  }

  traverse(ast, {
    VariableDeclaration(path) {
      const {
        node,
        parent
      } = path;
      const isForInit = (isForStatement(parent) && parent.init === node) ||
        ((isForInStatement(parent) || isForOfStatement(parent)) &&
          parent.left === node);
      if (!isForInit) {
        checkForSemicolon(node);
      }
    },
    ExpressionStatement(path) {
      checkForSemicolon(path.node);
    },
    ReturnStatement(path) {
      checkForSemicolon(path.node);
    },
    ThrowStatement(path) {
      checkForSemicolon(path.node);
    },
    DoWhileStatement(path) {
      checkForSemicolon(path.node);
    },
    DebuggerStatement(path) {
      checkForSemicolon(path.node);
    },
    BreakStatement(path) {
      checkForSemicolon(path.node);
    },
    ContinueStatement(path) {
      checkForSemicolon(path.node);
    },
    ImportDeclaration(path) {
      checkForSemicolon(path.node);
    },
    ExportAllDeclaration(path) {
      checkForSemicolon(path.node);
    },
    ExportNamedDeclaration(path) {
      if (!path.node.declaration) {
        checkForSemicolon(path.node);
      }
    },
    ExportDefaultDeclaration(path) {
      const {
        node
      } = path;
      const {
        declaration
      } = node;
      if (isClassDeclaration(declaration) ||
        isFunctionDeclaration(declaration)) {
        if (!declaration.id) {
          checkForSemicolon(node);
        }
      } else {
        checkForSemicolon(node);
      }
    },
    EmptyStatement(path) {
      const {
        node,
        parent
      } = path;
      if (!isForStatement(parent) &&
        !isForOfStatement(parent) &&
        !isForInStatement(parent) &&
        !isWhileStatement(parent) &&
        !isDoWhileStatement(parent)) {
        remove(startOfNode(node), endOfNode(node), firstTokenOfNode(node));
      }
    },
    ClassBody(path) {
      checkClassBodyForSemicolon(tokenAfterToken(firstTokenOfNode(path.node)));
    },
    ClassMethod(path) {
      checkClassBodyForSemicolon(tokenAfterToken(lastTokenOfNode(path.node)));
    },
  });

  /**
   * Checks a node to see if it's followed by a semicolon.
   */
  function checkForSemicolon(node) {
    const lastToken = lastTokenOfNode(node);
    if (sourceOfToken(lastToken) !== ';') {
      insert(endOfToken(lastToken), ';', lastToken);
    }
  }
  /**
   * Class bodies don't need semicolons.
   */
  function checkClassBodyForSemicolon(token) {
    while (token) {
      const source = sourceOfToken(token);
      if (source === ';') {
        remove(startOfToken(token), endOfToken(token), token);
      } else {
        break;
      }
      token = tokenAfterToken(token);
    }
  }

  function firstTokenOfNode(node) {
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.start === node.start) {
        return token;
      }
    }
    throw new Error(`cannot find first token for node ${node.type} at ` +
      `${node.loc.start.line}:${node.loc.start.column + 1}`);
  }

  function lastTokenOfNode(node) {
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.end === node.end) {
        return token;
      }
    }
    throw new Error(`cannot find last token for node ${node.type} at ` +
      `${node.loc.start.line}:${node.loc.start.column + 1}`);
  }

  function tokenAfterToken(token) {
    const index = tokens.indexOf(token);
    if (index < 0) {
      throw new Error(`cannot find token in tokens: ${JSON.stringify(token)}`);
    }
    return tokens[index + 1];
  }

  function sourceOfToken(token) {
    return source.slice(token.start, token.end);
  }

  function startOfNode(node) {
    return node.start;
  }

  function endOfNode(node) {
    return node.end;
  }

  function startOfToken(token) {
    return token.start;
  }

  function endOfToken(token) {
    return token.end;
  }

  return founds
}
