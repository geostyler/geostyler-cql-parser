import './cql-parser.cjs';
import { isFilter, isGeoStylerFunction, isOperator } from 'geostyler-style';
const isString = (value) => typeof value === 'string';
export class CqlParser {
    tokens = [
        'PROPERTY', 'COMPARISON', 'VALUE', 'LOGICAL'
    ];
    operatorsMap = {
        '=': '==',
        '<>': '!=',
        '<': '<',
        '<=': '<=',
        '>': '>',
        '>=': '>=',
        LIKE: '*=',
        BETWEEN: '<=x<='
    };
    operatorReverseMap = {};
    combinationOperatorsMap = {
        AND: '&&',
        OR: '||'
    };
    combinationOperatorsReverseMap = {};
    precedence = {
        RPAREN: 3,
        LOGICAL: 2,
        COMPARISON: 1
    };
    constructor() {
        const { combinationOperatorsMap, combinationOperatorsReverseMap, operatorsMap, operatorReverseMap } = this;
        Object.keys(operatorsMap)
            .forEach((operator) => {
            const value = operatorsMap[operator];
            operatorReverseMap[value] = operator;
        });
        Object.keys(combinationOperatorsMap)
            .forEach((combinationOperator) => {
            const value = combinationOperatorsMap[combinationOperator];
            combinationOperatorsReverseMap[value] = combinationOperator;
        });
        this.read = this.read.bind(this);
        this.write = this.write.bind(this);
    }
    read(text) {
        try {
            // @ts-expect-error cqlParser is defined in the window / global object - see cql-parser.cjs
            return (typeof window !== 'undefined' ? window : global).cqlParser.parse(text);
        }
        catch (e) {
            return undefined;
        }
    }
    write(filter, isChild) {
        const { operatorReverseMap, combinationOperatorsReverseMap, write } = this;
        if (filter && isGeoStylerFunction(filter)) {
            if (filter.name === 'pi' || filter.name === 'random') {
                return filter.name;
            }
            else {
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
            const f = filter;
            const operator = f[0];
            const cqlOperator = operatorReverseMap[operator];
            switch (operator) {
                case '!':
                    // TODO this should be better typed, get rid of `as any`
                    return `NOT ( ${write(f[1])} )`;
                case '&&':
                case '||':
                    let cqlFilter = '';
                    const cqlCombinationOperator = combinationOperatorsReverseMap[operator];
                    cqlFilter += f
                        .slice(1)
                        // TODO this should be better typed, get rid of `f: any`
                        .map((part) => write(part, true))
                        .join(` ${cqlCombinationOperator} `);
                    if (isChild) {
                        return `(${cqlFilter})`;
                    }
                    else {
                        return cqlFilter;
                    }
                case '==':
                case '*=':
                case '!=':
                case '<':
                case '<=':
                case '>':
                case '>=':
                    const valueIsString = isString(f[2]);
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
//# sourceMappingURL=CqlParser.js.map