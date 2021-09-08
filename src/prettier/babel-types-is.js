// https://github.com/babel/babel/blob/main/packages/babel-types/src/validators/generated/index.ts

import { isShallowEqual } from "ts-fns";

export function isArrayExpression(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ArrayExpression") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isAssignmentExpression(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "AssignmentExpression") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isBinaryExpression(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "BinaryExpression") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isInterpreterDirective(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "InterpreterDirective") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isDirective(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "Directive") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isDirectiveLiteral(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "DirectiveLiteral") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isBlockStatement(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "BlockStatement") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isBreakStatement(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "BreakStatement") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isCallExpression(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "CallExpression") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isCatchClause(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "CatchClause") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isConditionalExpression(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ConditionalExpression") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isContinueStatement(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ContinueStatement") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isDebuggerStatement(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "DebuggerStatement") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isDoWhileStatement(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "DoWhileStatement") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isEmptyStatement(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "EmptyStatement") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isExpressionStatement(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ExpressionStatement") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isFile(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "File") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isForInStatement(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ForInStatement") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isForStatement(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ForStatement") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isFunctionDeclaration(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "FunctionDeclaration") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isFunctionExpression(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "FunctionExpression") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isIdentifier(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "Identifier") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isIfStatement(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "IfStatement") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isLabeledStatement(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "LabeledStatement") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isStringLiteral(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "StringLiteral") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isNumericLiteral(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "NumericLiteral") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isNullLiteral(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "NullLiteral") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isBooleanLiteral(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "BooleanLiteral") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isRegExpLiteral(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "RegExpLiteral") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isLogicalExpression(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "LogicalExpression") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isMemberExpression(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "MemberExpression") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isNewExpression(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "NewExpression") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isProgram(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "Program") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isObjectExpression(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ObjectExpression") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isObjectMethod(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ObjectMethod") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isObjectProperty(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ObjectProperty") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isRestElement(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "RestElement") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isReturnStatement(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ReturnStatement") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isSequenceExpression(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "SequenceExpression") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isParenthesizedExpression(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ParenthesizedExpression") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isSwitchCase(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "SwitchCase") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isSwitchStatement(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "SwitchStatement") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isThisExpression(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ThisExpression") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isThrowStatement(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ThrowStatement") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTryStatement(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TryStatement") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isUnaryExpression(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "UnaryExpression") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isUpdateExpression(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "UpdateExpression") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isVariableDeclaration(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "VariableDeclaration") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isVariableDeclarator(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "VariableDeclarator") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isWhileStatement(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "WhileStatement") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isWithStatement(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "WithStatement") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isAssignmentPattern(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "AssignmentPattern") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isArrayPattern(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ArrayPattern") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isArrowFunctionExpression(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ArrowFunctionExpression") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isClassBody(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ClassBody") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isClassExpression(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ClassExpression") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isClassDeclaration(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ClassDeclaration") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isExportAllDeclaration(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ExportAllDeclaration") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isExportDefaultDeclaration(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ExportDefaultDeclaration") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isExportNamedDeclaration(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ExportNamedDeclaration") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isExportSpecifier(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ExportSpecifier") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isForOfStatement(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ForOfStatement") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isImportDeclaration(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ImportDeclaration") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isImportDefaultSpecifier(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ImportDefaultSpecifier") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isImportNamespaceSpecifier(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ImportNamespaceSpecifier") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isImportSpecifier(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ImportSpecifier") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isMetaProperty(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "MetaProperty") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isClassMethod(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ClassMethod") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isObjectPattern(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ObjectPattern") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isSpreadElement(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "SpreadElement") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isSuper(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "Super") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTaggedTemplateExpression(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TaggedTemplateExpression") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTemplateElement(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TemplateElement") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTemplateLiteral(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TemplateLiteral") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isYieldExpression(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "YieldExpression") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isAwaitExpression(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "AwaitExpression") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isImport(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "Import") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isBigIntLiteral(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "BigIntLiteral") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isExportNamespaceSpecifier(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ExportNamespaceSpecifier") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isOptionalMemberExpression(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "OptionalMemberExpression") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isOptionalCallExpression(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "OptionalCallExpression") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isClassProperty(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ClassProperty") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isClassPrivateProperty(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ClassPrivateProperty") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isClassPrivateMethod(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ClassPrivateMethod") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isPrivateName(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "PrivateName") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isAnyTypeAnnotation(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "AnyTypeAnnotation") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isArrayTypeAnnotation(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ArrayTypeAnnotation") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isBooleanTypeAnnotation(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "BooleanTypeAnnotation") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isBooleanLiteralTypeAnnotation(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "BooleanLiteralTypeAnnotation") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isNullLiteralTypeAnnotation(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "NullLiteralTypeAnnotation") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isClassImplements(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ClassImplements") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isDeclareClass(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "DeclareClass") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isDeclareFunction(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "DeclareFunction") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isDeclareInterface(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "DeclareInterface") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isDeclareModule(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "DeclareModule") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isDeclareModuleExports(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "DeclareModuleExports") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isDeclareTypeAlias(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "DeclareTypeAlias") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isDeclareOpaqueType(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "DeclareOpaqueType") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isDeclareVariable(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "DeclareVariable") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isDeclareExportDeclaration(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "DeclareExportDeclaration") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isDeclareExportAllDeclaration(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "DeclareExportAllDeclaration") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isDeclaredPredicate(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "DeclaredPredicate") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isExistsTypeAnnotation(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ExistsTypeAnnotation") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isFunctionTypeAnnotation(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "FunctionTypeAnnotation") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isFunctionTypeParam(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "FunctionTypeParam") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isGenericTypeAnnotation(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "GenericTypeAnnotation") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isInferredPredicate(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "InferredPredicate") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isInterfaceExtends(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "InterfaceExtends") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isInterfaceDeclaration(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "InterfaceDeclaration") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isInterfaceTypeAnnotation(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "InterfaceTypeAnnotation") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isIntersectionTypeAnnotation(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "IntersectionTypeAnnotation") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isMixedTypeAnnotation(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "MixedTypeAnnotation") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isEmptyTypeAnnotation(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "EmptyTypeAnnotation") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isNullableTypeAnnotation(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "NullableTypeAnnotation") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isNumberLiteralTypeAnnotation(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "NumberLiteralTypeAnnotation") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isNumberTypeAnnotation(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "NumberTypeAnnotation") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isObjectTypeAnnotation(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ObjectTypeAnnotation") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isObjectTypeInternalSlot(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ObjectTypeInternalSlot") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isObjectTypeCallProperty(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ObjectTypeCallProperty") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isObjectTypeIndexer(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ObjectTypeIndexer") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isObjectTypeProperty(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ObjectTypeProperty") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isObjectTypeSpreadProperty(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ObjectTypeSpreadProperty") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isOpaqueType(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "OpaqueType") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isQualifiedTypeIdentifier(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "QualifiedTypeIdentifier") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isStringLiteralTypeAnnotation(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "StringLiteralTypeAnnotation") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isStringTypeAnnotation(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "StringTypeAnnotation") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isSymbolTypeAnnotation(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "SymbolTypeAnnotation") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isThisTypeAnnotation(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ThisTypeAnnotation") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTupleTypeAnnotation(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TupleTypeAnnotation") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTypeofTypeAnnotation(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TypeofTypeAnnotation") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTypeAlias(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TypeAlias") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTypeAnnotation(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TypeAnnotation") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTypeCastExpression(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TypeCastExpression") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTypeParameter(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TypeParameter") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTypeParameterDeclaration(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TypeParameterDeclaration") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTypeParameterInstantiation(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TypeParameterInstantiation") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isUnionTypeAnnotation(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "UnionTypeAnnotation") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isVariance(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "Variance") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isVoidTypeAnnotation(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "VoidTypeAnnotation") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isEnumDeclaration(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "EnumDeclaration") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isEnumBooleanBody(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "EnumBooleanBody") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isEnumNumberBody(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "EnumNumberBody") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isEnumStringBody(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "EnumStringBody") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isEnumSymbolBody(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "EnumSymbolBody") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isEnumBooleanMember(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "EnumBooleanMember") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isEnumNumberMember(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "EnumNumberMember") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isEnumStringMember(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "EnumStringMember") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isEnumDefaultedMember(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "EnumDefaultedMember") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isIndexedAccessType(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "IndexedAccessType") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isOptionalIndexedAccessType(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "OptionalIndexedAccessType") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isJSXAttribute(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "JSXAttribute") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isJSXClosingElement(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "JSXClosingElement") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isJSXElement(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "JSXElement") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isJSXEmptyExpression(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "JSXEmptyExpression") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isJSXExpressionContainer(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "JSXExpressionContainer") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isJSXSpreadChild(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "JSXSpreadChild") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isJSXIdentifier(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "JSXIdentifier") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isJSXMemberExpression(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "JSXMemberExpression") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isJSXNamespacedName(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "JSXNamespacedName") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isJSXOpeningElement(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "JSXOpeningElement") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isJSXSpreadAttribute(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "JSXSpreadAttribute") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isJSXText(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "JSXText") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isJSXFragment(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "JSXFragment") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isJSXOpeningFragment(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "JSXOpeningFragment") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isJSXClosingFragment(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "JSXClosingFragment") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isNoop(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "Noop") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isPlaceholder(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "Placeholder") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isV8IntrinsicIdentifier(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "V8IntrinsicIdentifier") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isArgumentPlaceholder(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ArgumentPlaceholder") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isBindExpression(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "BindExpression") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isImportAttribute(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ImportAttribute") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isDecorator(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "Decorator") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isDoExpression(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "DoExpression") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isExportDefaultSpecifier(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ExportDefaultSpecifier") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isRecordExpression(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "RecordExpression") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTupleExpression(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TupleExpression") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isDecimalLiteral(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "DecimalLiteral") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isStaticBlock(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "StaticBlock") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isModuleExpression(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "ModuleExpression") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTopicReference(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TopicReference") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isPipelineTopicExpression(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "PipelineTopicExpression") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isPipelineBareFunction(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "PipelineBareFunction") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isPipelinePrimaryTopicReference(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "PipelinePrimaryTopicReference") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSParameterProperty(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSParameterProperty") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSDeclareFunction(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSDeclareFunction") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSDeclareMethod(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSDeclareMethod") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSQualifiedName(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSQualifiedName") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSCallSignatureDeclaration(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSCallSignatureDeclaration") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSConstructSignatureDeclaration(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSConstructSignatureDeclaration") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSPropertySignature(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSPropertySignature") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSMethodSignature(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSMethodSignature") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSIndexSignature(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSIndexSignature") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSAnyKeyword(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSAnyKeyword") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSBooleanKeyword(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSBooleanKeyword") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSBigIntKeyword(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSBigIntKeyword") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSIntrinsicKeyword(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSIntrinsicKeyword") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSNeverKeyword(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSNeverKeyword") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSNullKeyword(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSNullKeyword") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSNumberKeyword(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSNumberKeyword") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSObjectKeyword(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSObjectKeyword") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSStringKeyword(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSStringKeyword") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSSymbolKeyword(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSSymbolKeyword") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSUndefinedKeyword(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSUndefinedKeyword") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSUnknownKeyword(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSUnknownKeyword") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSVoidKeyword(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSVoidKeyword") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSThisType(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSThisType") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSFunctionType(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSFunctionType") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSConstructorType(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSConstructorType") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSTypeReference(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSTypeReference") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSTypePredicate(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSTypePredicate") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSTypeQuery(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSTypeQuery") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSTypeLiteral(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSTypeLiteral") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSArrayType(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSArrayType") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSTupleType(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSTupleType") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSOptionalType(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSOptionalType") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSRestType(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSRestType") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSNamedTupleMember(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSNamedTupleMember") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSUnionType(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSUnionType") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSIntersectionType(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSIntersectionType") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSConditionalType(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSConditionalType") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSInferType(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSInferType") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSParenthesizedType(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSParenthesizedType") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSTypeOperator(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSTypeOperator") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSIndexedAccessType(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSIndexedAccessType") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSMappedType(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSMappedType") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSLiteralType(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSLiteralType") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSExpressionWithTypeArguments(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSExpressionWithTypeArguments") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSInterfaceDeclaration(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSInterfaceDeclaration") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSInterfaceBody(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSInterfaceBody") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSTypeAliasDeclaration(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSTypeAliasDeclaration") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSAsExpression(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSAsExpression") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSTypeAssertion(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSTypeAssertion") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSEnumDeclaration(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSEnumDeclaration") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSEnumMember(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSEnumMember") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSModuleDeclaration(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSModuleDeclaration") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSModuleBlock(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSModuleBlock") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSImportType(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSImportType") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSImportEqualsDeclaration(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSImportEqualsDeclaration") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSExternalModuleReference(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSExternalModuleReference") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSNonNullExpression(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSNonNullExpression") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSExportAssignment(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSExportAssignment") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSNamespaceExportDeclaration(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSNamespaceExportDeclaration") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSTypeAnnotation(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSTypeAnnotation") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSTypeParameterInstantiation(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSTypeParameterInstantiation") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSTypeParameterDeclaration(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSTypeParameterDeclaration") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSTypeParameter(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "TSTypeParameter") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isExpression(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if ("ArrayExpression" === nodeType ||
        "AssignmentExpression" === nodeType ||
        "BinaryExpression" === nodeType ||
        "CallExpression" === nodeType ||
        "ConditionalExpression" === nodeType ||
        "FunctionExpression" === nodeType ||
        "Identifier" === nodeType ||
        "StringLiteral" === nodeType ||
        "NumericLiteral" === nodeType ||
        "NullLiteral" === nodeType ||
        "BooleanLiteral" === nodeType ||
        "RegExpLiteral" === nodeType ||
        "LogicalExpression" === nodeType ||
        "MemberExpression" === nodeType ||
        "NewExpression" === nodeType ||
        "ObjectExpression" === nodeType ||
        "SequenceExpression" === nodeType ||
        "ParenthesizedExpression" === nodeType ||
        "ThisExpression" === nodeType ||
        "UnaryExpression" === nodeType ||
        "UpdateExpression" === nodeType ||
        "ArrowFunctionExpression" === nodeType ||
        "ClassExpression" === nodeType ||
        "MetaProperty" === nodeType ||
        "Super" === nodeType ||
        "TaggedTemplateExpression" === nodeType ||
        "TemplateLiteral" === nodeType ||
        "YieldExpression" === nodeType ||
        "AwaitExpression" === nodeType ||
        "Import" === nodeType ||
        "BigIntLiteral" === nodeType ||
        "OptionalMemberExpression" === nodeType ||
        "OptionalCallExpression" === nodeType ||
        "TypeCastExpression" === nodeType ||
        "JSXElement" === nodeType ||
        "JSXFragment" === nodeType ||
        "BindExpression" === nodeType ||
        "DoExpression" === nodeType ||
        "RecordExpression" === nodeType ||
        "TupleExpression" === nodeType ||
        "DecimalLiteral" === nodeType ||
        "ModuleExpression" === nodeType ||
        "TopicReference" === nodeType ||
        "PipelineTopicExpression" === nodeType ||
        "PipelineBareFunction" === nodeType ||
        "PipelinePrimaryTopicReference" === nodeType ||
        "TSAsExpression" === nodeType ||
        "TSTypeAssertion" === nodeType ||
        "TSNonNullExpression" === nodeType ||
        (nodeType === "Placeholder" &&
            ("Expression" === node.expectedNode ||
                "Identifier" === node.expectedNode ||
                "StringLiteral" === node.expectedNode))) {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isBinary(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if ("BinaryExpression" === nodeType || "LogicalExpression" === nodeType) {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isScopable(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if ("BlockStatement" === nodeType ||
        "CatchClause" === nodeType ||
        "DoWhileStatement" === nodeType ||
        "ForInStatement" === nodeType ||
        "ForStatement" === nodeType ||
        "FunctionDeclaration" === nodeType ||
        "FunctionExpression" === nodeType ||
        "Program" === nodeType ||
        "ObjectMethod" === nodeType ||
        "SwitchStatement" === nodeType ||
        "WhileStatement" === nodeType ||
        "ArrowFunctionExpression" === nodeType ||
        "ClassExpression" === nodeType ||
        "ClassDeclaration" === nodeType ||
        "ForOfStatement" === nodeType ||
        "ClassMethod" === nodeType ||
        "ClassPrivateMethod" === nodeType ||
        "StaticBlock" === nodeType ||
        "TSModuleBlock" === nodeType ||
        (nodeType === "Placeholder" &&
            "BlockStatement" === node.expectedNode)) {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isBlockParent(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if ("BlockStatement" === nodeType ||
        "CatchClause" === nodeType ||
        "DoWhileStatement" === nodeType ||
        "ForInStatement" === nodeType ||
        "ForStatement" === nodeType ||
        "FunctionDeclaration" === nodeType ||
        "FunctionExpression" === nodeType ||
        "Program" === nodeType ||
        "ObjectMethod" === nodeType ||
        "SwitchStatement" === nodeType ||
        "WhileStatement" === nodeType ||
        "ArrowFunctionExpression" === nodeType ||
        "ForOfStatement" === nodeType ||
        "ClassMethod" === nodeType ||
        "ClassPrivateMethod" === nodeType ||
        "StaticBlock" === nodeType ||
        "TSModuleBlock" === nodeType ||
        (nodeType === "Placeholder" &&
            "BlockStatement" === node.expectedNode)) {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isBlock(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if ("BlockStatement" === nodeType ||
        "Program" === nodeType ||
        "TSModuleBlock" === nodeType ||
        (nodeType === "Placeholder" &&
            "BlockStatement" === node.expectedNode)) {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isStatement(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if ("BlockStatement" === nodeType ||
        "BreakStatement" === nodeType ||
        "ContinueStatement" === nodeType ||
        "DebuggerStatement" === nodeType ||
        "DoWhileStatement" === nodeType ||
        "EmptyStatement" === nodeType ||
        "ExpressionStatement" === nodeType ||
        "ForInStatement" === nodeType ||
        "ForStatement" === nodeType ||
        "FunctionDeclaration" === nodeType ||
        "IfStatement" === nodeType ||
        "LabeledStatement" === nodeType ||
        "ReturnStatement" === nodeType ||
        "SwitchStatement" === nodeType ||
        "ThrowStatement" === nodeType ||
        "TryStatement" === nodeType ||
        "VariableDeclaration" === nodeType ||
        "WhileStatement" === nodeType ||
        "WithStatement" === nodeType ||
        "ClassDeclaration" === nodeType ||
        "ExportAllDeclaration" === nodeType ||
        "ExportDefaultDeclaration" === nodeType ||
        "ExportNamedDeclaration" === nodeType ||
        "ForOfStatement" === nodeType ||
        "ImportDeclaration" === nodeType ||
        "DeclareClass" === nodeType ||
        "DeclareFunction" === nodeType ||
        "DeclareInterface" === nodeType ||
        "DeclareModule" === nodeType ||
        "DeclareModuleExports" === nodeType ||
        "DeclareTypeAlias" === nodeType ||
        "DeclareOpaqueType" === nodeType ||
        "DeclareVariable" === nodeType ||
        "DeclareExportDeclaration" === nodeType ||
        "DeclareExportAllDeclaration" === nodeType ||
        "InterfaceDeclaration" === nodeType ||
        "OpaqueType" === nodeType ||
        "TypeAlias" === nodeType ||
        "EnumDeclaration" === nodeType ||
        "TSDeclareFunction" === nodeType ||
        "TSInterfaceDeclaration" === nodeType ||
        "TSTypeAliasDeclaration" === nodeType ||
        "TSEnumDeclaration" === nodeType ||
        "TSModuleDeclaration" === nodeType ||
        "TSImportEqualsDeclaration" === nodeType ||
        "TSExportAssignment" === nodeType ||
        "TSNamespaceExportDeclaration" === nodeType ||
        (nodeType === "Placeholder" &&
            ("Statement" === node.expectedNode ||
                "Declaration" === node.expectedNode ||
                "BlockStatement" === node.expectedNode))) {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTerminatorless(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if ("BreakStatement" === nodeType ||
        "ContinueStatement" === nodeType ||
        "ReturnStatement" === nodeType ||
        "ThrowStatement" === nodeType ||
        "YieldExpression" === nodeType ||
        "AwaitExpression" === nodeType) {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isCompletionStatement(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if ("BreakStatement" === nodeType ||
        "ContinueStatement" === nodeType ||
        "ReturnStatement" === nodeType ||
        "ThrowStatement" === nodeType) {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isConditional(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if ("ConditionalExpression" === nodeType || "IfStatement" === nodeType) {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isLoop(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if ("DoWhileStatement" === nodeType ||
        "ForInStatement" === nodeType ||
        "ForStatement" === nodeType ||
        "WhileStatement" === nodeType ||
        "ForOfStatement" === nodeType) {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isWhile(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if ("DoWhileStatement" === nodeType || "WhileStatement" === nodeType) {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isExpressionWrapper(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if ("ExpressionStatement" === nodeType ||
        "ParenthesizedExpression" === nodeType ||
        "TypeCastExpression" === nodeType) {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isFor(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if ("ForInStatement" === nodeType ||
        "ForStatement" === nodeType ||
        "ForOfStatement" === nodeType) {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isForXStatement(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if ("ForInStatement" === nodeType || "ForOfStatement" === nodeType) {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isFunction(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if ("FunctionDeclaration" === nodeType ||
        "FunctionExpression" === nodeType ||
        "ObjectMethod" === nodeType ||
        "ArrowFunctionExpression" === nodeType ||
        "ClassMethod" === nodeType ||
        "ClassPrivateMethod" === nodeType) {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isFunctionParent(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if ("FunctionDeclaration" === nodeType ||
        "FunctionExpression" === nodeType ||
        "ObjectMethod" === nodeType ||
        "ArrowFunctionExpression" === nodeType ||
        "ClassMethod" === nodeType ||
        "ClassPrivateMethod" === nodeType) {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isPureish(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if ("FunctionDeclaration" === nodeType ||
        "FunctionExpression" === nodeType ||
        "StringLiteral" === nodeType ||
        "NumericLiteral" === nodeType ||
        "NullLiteral" === nodeType ||
        "BooleanLiteral" === nodeType ||
        "RegExpLiteral" === nodeType ||
        "ArrowFunctionExpression" === nodeType ||
        "BigIntLiteral" === nodeType ||
        "DecimalLiteral" === nodeType ||
        (nodeType === "Placeholder" &&
            "StringLiteral" === node.expectedNode)) {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isDeclaration(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if ("FunctionDeclaration" === nodeType ||
        "VariableDeclaration" === nodeType ||
        "ClassDeclaration" === nodeType ||
        "ExportAllDeclaration" === nodeType ||
        "ExportDefaultDeclaration" === nodeType ||
        "ExportNamedDeclaration" === nodeType ||
        "ImportDeclaration" === nodeType ||
        "DeclareClass" === nodeType ||
        "DeclareFunction" === nodeType ||
        "DeclareInterface" === nodeType ||
        "DeclareModule" === nodeType ||
        "DeclareModuleExports" === nodeType ||
        "DeclareTypeAlias" === nodeType ||
        "DeclareOpaqueType" === nodeType ||
        "DeclareVariable" === nodeType ||
        "DeclareExportDeclaration" === nodeType ||
        "DeclareExportAllDeclaration" === nodeType ||
        "InterfaceDeclaration" === nodeType ||
        "OpaqueType" === nodeType ||
        "TypeAlias" === nodeType ||
        "EnumDeclaration" === nodeType ||
        "TSDeclareFunction" === nodeType ||
        "TSInterfaceDeclaration" === nodeType ||
        "TSTypeAliasDeclaration" === nodeType ||
        "TSEnumDeclaration" === nodeType ||
        "TSModuleDeclaration" === nodeType ||
        (nodeType === "Placeholder" &&
            "Declaration" === node.expectedNode)) {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isPatternLike(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if ("Identifier" === nodeType ||
        "RestElement" === nodeType ||
        "AssignmentPattern" === nodeType ||
        "ArrayPattern" === nodeType ||
        "ObjectPattern" === nodeType ||
        (nodeType === "Placeholder" &&
            ("Pattern" === node.expectedNode ||
                "Identifier" === node.expectedNode))) {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isLVal(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if ("Identifier" === nodeType ||
        "MemberExpression" === nodeType ||
        "RestElement" === nodeType ||
        "AssignmentPattern" === nodeType ||
        "ArrayPattern" === nodeType ||
        "ObjectPattern" === nodeType ||
        "TSParameterProperty" === nodeType ||
        (nodeType === "Placeholder" &&
            ("Pattern" === node.expectedNode ||
                "Identifier" === node.expectedNode))) {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSEntityName(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if ("Identifier" === nodeType ||
        "TSQualifiedName" === nodeType ||
        (nodeType === "Placeholder" &&
            "Identifier" === node.expectedNode)) {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isLiteral(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if ("StringLiteral" === nodeType ||
        "NumericLiteral" === nodeType ||
        "NullLiteral" === nodeType ||
        "BooleanLiteral" === nodeType ||
        "RegExpLiteral" === nodeType ||
        "TemplateLiteral" === nodeType ||
        "BigIntLiteral" === nodeType ||
        "DecimalLiteral" === nodeType ||
        (nodeType === "Placeholder" &&
            "StringLiteral" === node.expectedNode)) {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isImmutable(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if ("StringLiteral" === nodeType ||
        "NumericLiteral" === nodeType ||
        "NullLiteral" === nodeType ||
        "BooleanLiteral" === nodeType ||
        "BigIntLiteral" === nodeType ||
        "JSXAttribute" === nodeType ||
        "JSXClosingElement" === nodeType ||
        "JSXElement" === nodeType ||
        "JSXExpressionContainer" === nodeType ||
        "JSXSpreadChild" === nodeType ||
        "JSXOpeningElement" === nodeType ||
        "JSXText" === nodeType ||
        "JSXFragment" === nodeType ||
        "JSXOpeningFragment" === nodeType ||
        "JSXClosingFragment" === nodeType ||
        "DecimalLiteral" === nodeType ||
        (nodeType === "Placeholder" &&
            "StringLiteral" === node.expectedNode)) {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isUserWhitespacable(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if ("ObjectMethod" === nodeType ||
        "ObjectProperty" === nodeType ||
        "ObjectTypeInternalSlot" === nodeType ||
        "ObjectTypeCallProperty" === nodeType ||
        "ObjectTypeIndexer" === nodeType ||
        "ObjectTypeProperty" === nodeType ||
        "ObjectTypeSpreadProperty" === nodeType) {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isMethod(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if ("ObjectMethod" === nodeType ||
        "ClassMethod" === nodeType ||
        "ClassPrivateMethod" === nodeType) {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isObjectMember(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if ("ObjectMethod" === nodeType || "ObjectProperty" === nodeType) {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isProperty(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if ("ObjectProperty" === nodeType ||
        "ClassProperty" === nodeType ||
        "ClassPrivateProperty" === nodeType) {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isUnaryLike(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if ("UnaryExpression" === nodeType || "SpreadElement" === nodeType) {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isPattern(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if ("AssignmentPattern" === nodeType ||
        "ArrayPattern" === nodeType ||
        "ObjectPattern" === nodeType ||
        (nodeType === "Placeholder" &&
            "Pattern" === node.expectedNode)) {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isClass(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if ("ClassExpression" === nodeType || "ClassDeclaration" === nodeType) {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isModuleDeclaration(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if ("ExportAllDeclaration" === nodeType ||
        "ExportDefaultDeclaration" === nodeType ||
        "ExportNamedDeclaration" === nodeType ||
        "ImportDeclaration" === nodeType) {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isExportDeclaration(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if ("ExportAllDeclaration" === nodeType ||
        "ExportDefaultDeclaration" === nodeType ||
        "ExportNamedDeclaration" === nodeType) {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isModuleSpecifier(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if ("ExportSpecifier" === nodeType ||
        "ImportDefaultSpecifier" === nodeType ||
        "ImportNamespaceSpecifier" === nodeType ||
        "ImportSpecifier" === nodeType ||
        "ExportNamespaceSpecifier" === nodeType ||
        "ExportDefaultSpecifier" === nodeType) {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isPrivate(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if ("ClassPrivateProperty" === nodeType ||
        "ClassPrivateMethod" === nodeType ||
        "PrivateName" === nodeType) {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isFlow(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if ("AnyTypeAnnotation" === nodeType ||
        "ArrayTypeAnnotation" === nodeType ||
        "BooleanTypeAnnotation" === nodeType ||
        "BooleanLiteralTypeAnnotation" === nodeType ||
        "NullLiteralTypeAnnotation" === nodeType ||
        "ClassImplements" === nodeType ||
        "DeclareClass" === nodeType ||
        "DeclareFunction" === nodeType ||
        "DeclareInterface" === nodeType ||
        "DeclareModule" === nodeType ||
        "DeclareModuleExports" === nodeType ||
        "DeclareTypeAlias" === nodeType ||
        "DeclareOpaqueType" === nodeType ||
        "DeclareVariable" === nodeType ||
        "DeclareExportDeclaration" === nodeType ||
        "DeclareExportAllDeclaration" === nodeType ||
        "DeclaredPredicate" === nodeType ||
        "ExistsTypeAnnotation" === nodeType ||
        "FunctionTypeAnnotation" === nodeType ||
        "FunctionTypeParam" === nodeType ||
        "GenericTypeAnnotation" === nodeType ||
        "InferredPredicate" === nodeType ||
        "InterfaceExtends" === nodeType ||
        "InterfaceDeclaration" === nodeType ||
        "InterfaceTypeAnnotation" === nodeType ||
        "IntersectionTypeAnnotation" === nodeType ||
        "MixedTypeAnnotation" === nodeType ||
        "EmptyTypeAnnotation" === nodeType ||
        "NullableTypeAnnotation" === nodeType ||
        "NumberLiteralTypeAnnotation" === nodeType ||
        "NumberTypeAnnotation" === nodeType ||
        "ObjectTypeAnnotation" === nodeType ||
        "ObjectTypeInternalSlot" === nodeType ||
        "ObjectTypeCallProperty" === nodeType ||
        "ObjectTypeIndexer" === nodeType ||
        "ObjectTypeProperty" === nodeType ||
        "ObjectTypeSpreadProperty" === nodeType ||
        "OpaqueType" === nodeType ||
        "QualifiedTypeIdentifier" === nodeType ||
        "StringLiteralTypeAnnotation" === nodeType ||
        "StringTypeAnnotation" === nodeType ||
        "SymbolTypeAnnotation" === nodeType ||
        "ThisTypeAnnotation" === nodeType ||
        "TupleTypeAnnotation" === nodeType ||
        "TypeofTypeAnnotation" === nodeType ||
        "TypeAlias" === nodeType ||
        "TypeAnnotation" === nodeType ||
        "TypeCastExpression" === nodeType ||
        "TypeParameter" === nodeType ||
        "TypeParameterDeclaration" === nodeType ||
        "TypeParameterInstantiation" === nodeType ||
        "UnionTypeAnnotation" === nodeType ||
        "Variance" === nodeType ||
        "VoidTypeAnnotation" === nodeType ||
        "IndexedAccessType" === nodeType ||
        "OptionalIndexedAccessType" === nodeType) {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isFlowType(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if ("AnyTypeAnnotation" === nodeType ||
        "ArrayTypeAnnotation" === nodeType ||
        "BooleanTypeAnnotation" === nodeType ||
        "BooleanLiteralTypeAnnotation" === nodeType ||
        "NullLiteralTypeAnnotation" === nodeType ||
        "ExistsTypeAnnotation" === nodeType ||
        "FunctionTypeAnnotation" === nodeType ||
        "GenericTypeAnnotation" === nodeType ||
        "InterfaceTypeAnnotation" === nodeType ||
        "IntersectionTypeAnnotation" === nodeType ||
        "MixedTypeAnnotation" === nodeType ||
        "EmptyTypeAnnotation" === nodeType ||
        "NullableTypeAnnotation" === nodeType ||
        "NumberLiteralTypeAnnotation" === nodeType ||
        "NumberTypeAnnotation" === nodeType ||
        "ObjectTypeAnnotation" === nodeType ||
        "StringLiteralTypeAnnotation" === nodeType ||
        "StringTypeAnnotation" === nodeType ||
        "SymbolTypeAnnotation" === nodeType ||
        "ThisTypeAnnotation" === nodeType ||
        "TupleTypeAnnotation" === nodeType ||
        "TypeofTypeAnnotation" === nodeType ||
        "UnionTypeAnnotation" === nodeType ||
        "VoidTypeAnnotation" === nodeType ||
        "IndexedAccessType" === nodeType ||
        "OptionalIndexedAccessType" === nodeType) {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isFlowBaseAnnotation(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if ("AnyTypeAnnotation" === nodeType ||
        "BooleanTypeAnnotation" === nodeType ||
        "NullLiteralTypeAnnotation" === nodeType ||
        "MixedTypeAnnotation" === nodeType ||
        "EmptyTypeAnnotation" === nodeType ||
        "NumberTypeAnnotation" === nodeType ||
        "StringTypeAnnotation" === nodeType ||
        "SymbolTypeAnnotation" === nodeType ||
        "ThisTypeAnnotation" === nodeType ||
        "VoidTypeAnnotation" === nodeType) {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isFlowDeclaration(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if ("DeclareClass" === nodeType ||
        "DeclareFunction" === nodeType ||
        "DeclareInterface" === nodeType ||
        "DeclareModule" === nodeType ||
        "DeclareModuleExports" === nodeType ||
        "DeclareTypeAlias" === nodeType ||
        "DeclareOpaqueType" === nodeType ||
        "DeclareVariable" === nodeType ||
        "DeclareExportDeclaration" === nodeType ||
        "DeclareExportAllDeclaration" === nodeType ||
        "InterfaceDeclaration" === nodeType ||
        "OpaqueType" === nodeType ||
        "TypeAlias" === nodeType) {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isFlowPredicate(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if ("DeclaredPredicate" === nodeType || "InferredPredicate" === nodeType) {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isEnumBody(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if ("EnumBooleanBody" === nodeType ||
        "EnumNumberBody" === nodeType ||
        "EnumStringBody" === nodeType ||
        "EnumSymbolBody" === nodeType) {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isEnumMember(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if ("EnumBooleanMember" === nodeType ||
        "EnumNumberMember" === nodeType ||
        "EnumStringMember" === nodeType ||
        "EnumDefaultedMember" === nodeType) {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isJSX(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if ("JSXAttribute" === nodeType ||
        "JSXClosingElement" === nodeType ||
        "JSXElement" === nodeType ||
        "JSXEmptyExpression" === nodeType ||
        "JSXExpressionContainer" === nodeType ||
        "JSXSpreadChild" === nodeType ||
        "JSXIdentifier" === nodeType ||
        "JSXMemberExpression" === nodeType ||
        "JSXNamespacedName" === nodeType ||
        "JSXOpeningElement" === nodeType ||
        "JSXSpreadAttribute" === nodeType ||
        "JSXText" === nodeType ||
        "JSXFragment" === nodeType ||
        "JSXOpeningFragment" === nodeType ||
        "JSXClosingFragment" === nodeType) {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSTypeElement(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if ("TSCallSignatureDeclaration" === nodeType ||
        "TSConstructSignatureDeclaration" === nodeType ||
        "TSPropertySignature" === nodeType ||
        "TSMethodSignature" === nodeType ||
        "TSIndexSignature" === nodeType) {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSType(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if ("TSAnyKeyword" === nodeType ||
        "TSBooleanKeyword" === nodeType ||
        "TSBigIntKeyword" === nodeType ||
        "TSIntrinsicKeyword" === nodeType ||
        "TSNeverKeyword" === nodeType ||
        "TSNullKeyword" === nodeType ||
        "TSNumberKeyword" === nodeType ||
        "TSObjectKeyword" === nodeType ||
        "TSStringKeyword" === nodeType ||
        "TSSymbolKeyword" === nodeType ||
        "TSUndefinedKeyword" === nodeType ||
        "TSUnknownKeyword" === nodeType ||
        "TSVoidKeyword" === nodeType ||
        "TSThisType" === nodeType ||
        "TSFunctionType" === nodeType ||
        "TSConstructorType" === nodeType ||
        "TSTypeReference" === nodeType ||
        "TSTypePredicate" === nodeType ||
        "TSTypeQuery" === nodeType ||
        "TSTypeLiteral" === nodeType ||
        "TSArrayType" === nodeType ||
        "TSTupleType" === nodeType ||
        "TSOptionalType" === nodeType ||
        "TSRestType" === nodeType ||
        "TSUnionType" === nodeType ||
        "TSIntersectionType" === nodeType ||
        "TSConditionalType" === nodeType ||
        "TSInferType" === nodeType ||
        "TSParenthesizedType" === nodeType ||
        "TSTypeOperator" === nodeType ||
        "TSIndexedAccessType" === nodeType ||
        "TSMappedType" === nodeType ||
        "TSLiteralType" === nodeType ||
        "TSExpressionWithTypeArguments" === nodeType ||
        "TSImportType" === nodeType) {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isTSBaseType(node, opts) {
    if (!node)
        return false;
    const nodeType = node.type;
    if ("TSAnyKeyword" === nodeType ||
        "TSBooleanKeyword" === nodeType ||
        "TSBigIntKeyword" === nodeType ||
        "TSIntrinsicKeyword" === nodeType ||
        "TSNeverKeyword" === nodeType ||
        "TSNullKeyword" === nodeType ||
        "TSNumberKeyword" === nodeType ||
        "TSObjectKeyword" === nodeType ||
        "TSStringKeyword" === nodeType ||
        "TSSymbolKeyword" === nodeType ||
        "TSUndefinedKeyword" === nodeType ||
        "TSUnknownKeyword" === nodeType ||
        "TSVoidKeyword" === nodeType ||
        "TSThisType" === nodeType ||
        "TSLiteralType" === nodeType) {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isNumberLiteral(node, opts) {
    console.trace("The node type NumberLiteral has been renamed to NumericLiteral");
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "NumberLiteral") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isRegexLiteral(node, opts) {
    console.trace("The node type RegexLiteral has been renamed to RegExpLiteral");
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "RegexLiteral") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isRestProperty(node, opts) {
    console.trace("The node type RestProperty has been renamed to RestElement");
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "RestProperty") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
export function isSpreadProperty(node, opts) {
    console.trace("The node type SpreadProperty has been renamed to SpreadElement");
    if (!node)
        return false;
    const nodeType = node.type;
    if (nodeType === "SpreadProperty") {
        if (typeof opts === "undefined") {
            return true;
        }
        else {
            return isShallowEqual(node, opts);
        }
    }
    return false;
}
