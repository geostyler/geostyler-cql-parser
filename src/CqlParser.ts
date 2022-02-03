import {
  CombinationOperator,
  Operator,
  Filter
} from 'geostyler-style';

import {
  isString as _isString,
  isNumber as _isNumber,
  isNaN as _isNaN
} from 'lodash';

type PatternName = 'PROPERTY' | 'COMPARISON' | 'VALUE' | 'LOGICAL' | 'LPAREN' | 'RPAREN'
  | 'SPATIAL' | 'NOT' | 'BETWEEN' | 'GEOMETRY' | 'END' | 'COMMA' | 'IS_NULL';
type Pattern = RegExp | Function;
type PatternsObject = {
  [name: string]: Pattern;
};
type FollowsObject = {
  [name: string]: PatternName[];
};
type CqlOperator = '=' | '<>' | '<' | '<=' | '>' | '>=' | 'LIKE' | 'BETWEEN' | 'IS NULL';

type OperatorsMap = {
  [cqlOperator: string]: Operator;
};
type CombinationOperatorsMap = {
  [cqlOperator: string]: CombinationOperator;
};
type OperatorsReverseMap = {
  [cqlOperator: string]: CqlOperator;
};
type CombinationOperatorsReverseMap = {
  [cqlOperator: string]: 'AND' | 'OR';
};
type PrecedenceMap = {
  [name: string]: 1 | 2 | 3;
};
type Token = {
  type: string;
  text: string;
  remainder: string;
};

export class CqlParser {

  tokens: PatternName[] = [
    'PROPERTY', 'COMPARISON', 'VALUE', 'LOGICAL'
  ];

  patterns: PatternsObject = {
    PROPERTY: /^[_a-zA-Z]\w*/,
    COMPARISON: /^(=|<>|<=|<|>=|>|LIKE)/i,
    IS_NULL: /^IS NULL/i,
    COMMA: /^,/,
    LOGICAL: /^(AND|OR)/i,
    VALUE: (text: any) => {
      if (_isNumber(text)) {
        return [text];
      } else if (_isString(text)) {
        const singleQuotedText = text.match(/[']([^']+)[']/);
        const doubleQuotedText = text.match(/["]([^"]+)["]/);
        if (singleQuotedText) {
          return [singleQuotedText[0]];
        } else if (doubleQuotedText) {
          return [doubleQuotedText][0];
        } else {
          return [text.split(/[\s)]/)[0]];
        }
      } else {
        return false;
      }
    },
    LPAREN: /^\(/,
    RPAREN: /^\)/,
    SPATIAL: /^(BBOX|INTERSECTS|DWITHIN|WITHIN|CONTAINS)/i,
    NOT: /^NOT/i,
    BETWEEN: /^BETWEEN/i,
    END: /^$/
  };

  follows: FollowsObject = {
    LPAREN: ['GEOMETRY', 'SPATIAL', 'PROPERTY', 'LPAREN', 'VALUE'],
    RPAREN: ['NOT', 'LOGICAL', 'END', 'RPAREN'],
    PROPERTY: ['COMPARISON', 'BETWEEN', 'COMMA', 'IS_NULL'],
    BETWEEN: ['VALUE'],
    IS_NULL: ['END'],
    COMPARISON: ['VALUE'],
    COMMA: ['GEOMETRY', 'PROPERTY', 'VALUE'],
    VALUE: ['LOGICAL', 'COMMA', 'RPAREN', 'END'],
    SPATIAL: ['LPAREN'],
    LOGICAL: ['PROPERTY', 'NOT', 'LPAREN', 'SPATIAL', 'VALUE'],
    NOT: ['PROPERTY', 'LPAREN'],
    GEOMETRY: ['COMMA', 'RPAREN']
  };

  operatorsMap: OperatorsMap = {
    '=': '==',
    '<>': '!=',
    '<': '<',
    '<=': '<=',
    '>': '>',
    '>=': '>=',
    'LIKE': '*=',
    'BETWEEN': '<=x<='
  };

  operatorReverseMap: OperatorsReverseMap = {};

  combinationOperatorsMap: CombinationOperatorsMap = {
    'AND': '&&',
    'OR': '||'
  };

  combinationOperatorsReverseMap: CombinationOperatorsReverseMap = {};

  precedence: PrecedenceMap = {
    'RPAREN': 3,
    'LOGICAL': 2,
    'COMPARISON': 1
  };

  constructor() {
    const {
      combinationOperatorsMap,
      combinationOperatorsReverseMap,
      operatorsMap,
      operatorReverseMap
    } = this;

    Object.keys(operatorsMap)
      .forEach((operator: CqlOperator) => {
        const value = operatorsMap[operator];
        operatorReverseMap[value] = operator;
      });

    Object.keys(combinationOperatorsMap)
      .forEach((combinationOperator: 'AND' | 'OR') => {
        const value: CombinationOperator = combinationOperatorsMap[combinationOperator];
        combinationOperatorsReverseMap[value] = combinationOperator;
      });

    this.nextToken = this.nextToken.bind(this);
    this.tokenize = this.tokenize.bind(this);
    this.tryToken = this.tryToken.bind(this);
    this.buildAst = this.buildAst.bind(this);
    this.read = this.read.bind(this);
    this.write = this.write.bind(this);
  }

  tryToken(text: any, pattern: Pattern) {
    if (pattern instanceof RegExp) {
      return pattern.exec(text);
    } else if (pattern) {
      return pattern(text);
    }
  }

  nextToken(text: any, patternNames: PatternName[]): Token {
    const {
      patterns,
      tryToken
    } = this;
    let i;
    let token;
    let len = patternNames.length;
    for (i = 0; i < len; i++) {
      token = patternNames[i];
      const pattern = patterns[token];
      const matches = tryToken(text, pattern);
      if (matches) {
        const match = matches[0];
        const remainder = text.substr(match.length).replace(/^\s*/, '');
        return {
          type: token,
          text: match,
          remainder: remainder
        };
      }
    }

    let msg = `ERROR: In parsing: [${text}], expected one of: `;
    for (i = 0; i < len; i++) {
      token = patternNames[i];
      msg += `\n    ${token}: ${patterns[token]}`;
    }

    throw new Error(msg);
  }

  tokenize(text: string): Token[] {
    const {
      nextToken,
      follows
    } = this;
    const results = [];
    let expect: PatternName[] = ['NOT', 'PROPERTY', 'LPAREN'];
    let token: Token;

    do {
      token = nextToken(text, expect);
      text = token.remainder;
      expect = follows[token.type];
      if (token.type !== 'END' && !expect) {
        throw new Error('No follows list for ' + token.type);
      }
      results.push(token);
    } while (token.type !== 'END');

    return results;
  }

  buildAst(tokens: Token[]) {
    const {
      precedence,
      operatorsMap,
      combinationOperatorsMap
    } = this;
    const operatorStack: any[] = [];
    const postfix: Token[] = [];

    tokens.forEach(token => {
      switch (token.type) {
        case 'PROPERTY':
        case 'GEOMETRY':
        case 'VALUE':
          postfix.push(token);
          break;
        case 'COMPARISON':
        case 'BETWEEN':
        case 'IS_NULL':
        case 'LOGICAL':
          const p = precedence[token.type];
          while (operatorStack.length > 0 &&
            (precedence[operatorStack[operatorStack.length - 1].type] <= p)
          ) {
            postfix.push(operatorStack.pop());
          }
          operatorStack.push(token);
          break;
        case 'SPATIAL':
        case 'NOT':
        case 'LPAREN':
          operatorStack.push(token);
          break;
        case 'RPAREN':
          while (operatorStack.length > 0 &&
            (operatorStack[operatorStack.length - 1].type !== 'LPAREN')
          ) {
            postfix.push(operatorStack.pop());
          }
          operatorStack.pop(); // toss out the LPAREN

          if (operatorStack.length > 0 &&
            operatorStack[operatorStack.length - 1].type === 'SPATIAL') {
            postfix.push(operatorStack.pop());
          }
          break;
        case 'COMMA':
        case 'END':
          break;
        default:
          throw new Error('Unknown token type ' + token.type);
      }
    });

    while (operatorStack.length > 0) {
      postfix.push(operatorStack.pop());
    }

    const buildTree = (): any => {
      const token = postfix.pop();
      if (token) {
        let property: any;
        switch (token.type) {
          case 'LOGICAL':
            const rhs = buildTree(),
              lhs = buildTree();
            const combinationOperator = combinationOperatorsMap[token.text];
            return [combinationOperator, lhs, rhs];
          case 'NOT':
            const operand = buildTree();
            return ['!', operand];
          case 'BETWEEN':
            let min: any;
            let max: any;

            postfix.pop(); // unneeded AND token here
            max = buildTree();
            min = buildTree();
            property = buildTree();
            return [
              '<=x<=',
              property,
              min,
              max
            ];
          case 'COMPARISON':
            const value = buildTree();
            property = buildTree();
            const operator = operatorsMap[token.text.toUpperCase()];
            return [operator, property, value];
          case 'IS_NULL':
            property = buildTree();
            return ['==', property, null];
          case 'VALUE':
            const num = parseFloat(token.text);
            if (_isNaN(num)) {
              return token.text.replace(/['"]/g, '');
            } else {
              return num;
            }
          default:
            return token.text;
        }
      }
      return;
    };

    const result = buildTree();
    if (postfix.length > 0) {
      let msg = 'Remaining tokens after building AST: \n';
      for (var i = postfix.length - 1; i >= 0; i--) {
        msg += postfix[i].type + ': ' + postfix[i].text + '\n';
      }
      throw new Error(msg);
    }

    return result;
  }

  read(text: string | undefined): Filter | undefined {
    const {
      buildAst,
      tokenize
    } = this;

    if (!text || text.length === 0) {
      return undefined;
    }

    const tokenizedText = tokenize(text);
    return buildAst(tokenizedText);
  }

  write(filter: Filter | undefined, isChild?: boolean): string | undefined {
    const {
      operatorReverseMap,
      combinationOperatorsReverseMap,
      write
    } = this;

    if (!Array.isArray(filter) || filter.length < 2) {
      return undefined;
    }

    const operator = filter[0];
    const cqlOperator = operatorReverseMap[operator];

    switch (operator) {
      case '!':
        // TODO this should be better typed, get rid of `as any`
        return `NOT ( ${write(filter[1] as any)} )`;
      case '&&':
      case '||':
        let cqlFilter: string = '';
        const cqlCombinationOperator = combinationOperatorsReverseMap[operator];
        cqlFilter += filter
          .slice(1)
          // TODO this should be better typed, get rid of `f: any`
          .map((f: any) => write(f, true))
          .join(` ${cqlCombinationOperator} `);
        if (isChild) {
          return `(${cqlFilter})`;
        } else {
          return cqlFilter;
        }
      case '==':
      case '*=':
      case '!=':
      case '<':
      case '<=':
      case '>':
      case '>=':
        const valueIsString = _isString(filter[2]);
        let value = filter[2];
        if (valueIsString) {
          value = `'${value}'`;
        }
        return `${filter[1]} ${cqlOperator} ${value}`;
      case '<=x<=':
        return `${filter[1]} ${cqlOperator} ${filter[2]} AND ${filter[3]}`;
      case undefined:
        break;
      default:
        throw new Error(`Can't encode: ${filter}`);
    }
    return;
  }
}

export default CqlParser;
