import { parse } from '@babel/parser'
import {
  isForStatement,
  isForInStatement,
  isForOfStatement,
  isClassDeclaration,
  isFunctionDeclaration,
  isWhileStatement,
  isDoWhileStatement,
} from './babel-types-is'
import {
  traverse,
} from './babel-traverse'

export function prettyJsCode(code) {
  const { insertions, removals } = process(code, parse(code, {
    tokens: true,
    sourceType: 'unambiguous',
  }))

  const chars = code.split('')
  for (let i = insertions.length; i --; ) {
    const { index, content } = insertions[i]
    chars.splice(index, 0, content)
  }

  const output = chars.join('')

  return output
}

/** automatic-semicolon-insertion */
function process(source, ast) {
  const tokens = ast.tokens;
  const insertions = [];
  const removals = [];
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
        remove(startOfNode(node), endOfNode(node));
      }
    },
    ClassBody(path) {
      checkClassBodyForSemicolon(tokenAfterToken(firstTokenOfNode(path.node)));
    },
    ClassMethod(path) {
      checkClassBodyForSemicolon(tokenAfterToken(lastTokenOfNode(path.node)));
    },
  });
  return {
    insertions,
    removals
  };
  /**
   * Checks a node to see if it's followed by a semicolon.
   */
  function checkForSemicolon(node) {
    const lastToken = lastTokenOfNode(node);
    if (sourceOfToken(lastToken) !== ';') {
      insert(endOfToken(lastToken), ';');
    }
  }
  /**
   * Class bodies don't need semicolons.
   */
  function checkClassBodyForSemicolon(token) {
    while (token) {
      const source = sourceOfToken(token);
      if (source === ';') {
        remove(startOfToken(token), endOfToken(token));
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

  function insert(index, content) {
    insertions.push({
      index,
      content
    });
  }

  function remove(start, end) {
    removals.push({
      start,
      end
    });
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
}
