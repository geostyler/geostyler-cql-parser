import {
  CombinationOperator,
  Operator,
  Filter,
  Expression
} from 'geostyler-style';

import {
  isString as _isString,
  isNumber as _isNumber,
  isNaN as _isNaN
} from 'lodash';

// @ts-ignore:next-line
import Parser from './cql-parser';

type PatternName = 'PROPERTY' | 'COMPARISON' | 'VALUE' | 'LOGICAL' | 'LPAREN' | 'RPAREN'
  | 'SPATIAL' | 'NOT' | 'BETWEEN' | 'GEOMETRY' | 'END' | 'COMMA' | 'IS_NULL';
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

export class CqlParser {

  tokens: PatternName[] = [
    'PROPERTY', 'COMPARISON', 'VALUE', 'LOGICAL'
  ];

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

    this.read = this.read.bind(this);
    this.write = this.write.bind(this);
  }

  read(text: string | undefined): Filter | Expression | undefined {
    try {
      return Parser.parse(text);
    } catch (e) {
      return undefined;
    }
  }

  write(
    filter: RegExp | Filter | Expression | number | string | undefined,
    isChild?: boolean
  ): string | number | undefined {
    const {
      operatorReverseMap,
      combinationOperatorsReverseMap,
      write
    } = this;

    if (filter && (filter as Expression).type) {
      var expr = filter as Expression;
      switch (expr.type) {
        case 'literal':
          return expr.value;
        case 'property':
          return expr.name;
        case 'functioncall':
          const args = expr.args.map(a => this.write(a)).join(', ');
          return `${expr.name}(${args})`;
        default:
          return '';
      }
    }

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
        return `${filter[1]} ${cqlOperator} ${this.write(filter[2])} AND ${this.write(filter[3])}`;
      case undefined:
        break;
      default:
        throw new Error(`Can't encode: ${filter}`);
    }
    return;
  }
}

export default CqlParser;
