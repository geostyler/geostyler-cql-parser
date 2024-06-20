import {
  isGeoStylerFunction,
  isFilter,
  isOperator
} from 'geostyler-style/dist/typeguards';

import {
  isString as _isString,
  isNumber as _isNumber,
  isNaN as _isNaN
} from 'lodash';

import './cql-parser.cjs';

import { CombinationOperator, Expression, Filter, Operator, PropertyType } from 'geostyler-style/dist/style';

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
    LIKE: '*=',
    BETWEEN: '<=x<='
  };

  operatorReverseMap: OperatorsReverseMap = {};

  combinationOperatorsMap: CombinationOperatorsMap = {
    AND: '&&',
    OR: '||'
  };

  combinationOperatorsReverseMap: CombinationOperatorsReverseMap = {};

  precedence: PrecedenceMap = {
    RPAREN: 3,
    LOGICAL: 2,
    COMPARISON: 1
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

  read(text: string | undefined): Filter | Expression<PropertyType> | undefined {
    try {
      // @ts-expect-error
      return cqlParser.parse(text);
    } catch (e) {
      return undefined;
    }
  }

  write(
    filter: RegExp | Filter | Expression<PropertyType>,
    isChild?: boolean
  ): PropertyType {
    const {
      operatorReverseMap,
      combinationOperatorsReverseMap,
      write
    } = this;

    if (filter && isGeoStylerFunction(filter)) {
      if (filter.name === 'pi' || filter.name === 'random') {
        return filter.name;
      } else {
        const args = filter.args.map(a => this.write(a)).join(', ');
        return `${filter.name}(${args})`;
      }
    }

    // catch illegal filters
    if (Array.isArray(filter)) {
      if (filter.length < 2) {
        return undefined;
      }
      if (!isOperator(filter[0])) {
        throw new Error(`Can't encode: ${filter}`);
      }
    }

    if (isFilter(filter)) {
      const f = filter as string[];
      const operator = f[0];
      const cqlOperator = operatorReverseMap[operator];

      switch (operator) {
        case '!':
          // TODO this should be better typed, get rid of `as any`
          return `NOT ( ${write(f[1] as any)} )`;
        case '&&':
        case '||':
          let cqlFilter: string = '';
          const cqlCombinationOperator = combinationOperatorsReverseMap[operator];
          cqlFilter += f
            .slice(1)
            // TODO this should be better typed, get rid of `f: any`
            .map((part) => write(part, true))
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
          const valueIsString = _isString(f[2]);
          let value = f[2];
          if (valueIsString) {
            value = `'${value}'`;
          }
          return `${f[1]} ${cqlOperator} ${value}`;
        case '<=x<=':
          return `${f[1]} ${cqlOperator} ${this.write(f[2])} AND ${this.write(f[3])}`;
        case undefined:
          break;
        default:
          break;
      }
    }

    return filter;
  }

}

export default CqlParser;
