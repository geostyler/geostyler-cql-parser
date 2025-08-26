import './cql-parser.cjs';
import { CombinationOperator, Expression, Filter, Operator, PropertyType } from 'geostyler-style';
type PatternName = 'PROPERTY' | 'COMPARISON' | 'VALUE' | 'LOGICAL' | 'LPAREN' | 'RPAREN' | 'SPATIAL' | 'NOT' | 'BETWEEN' | 'GEOMETRY' | 'END' | 'COMMA' | 'IS_NULL';
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
export declare class CqlParser {
    tokens: PatternName[];
    operatorsMap: OperatorsMap;
    operatorReverseMap: OperatorsReverseMap;
    combinationOperatorsMap: CombinationOperatorsMap;
    combinationOperatorsReverseMap: CombinationOperatorsReverseMap;
    precedence: PrecedenceMap;
    constructor();
    read(text: string | undefined): Filter | Expression<PropertyType> | undefined;
    write(filter: RegExp | Filter | Expression<PropertyType>, isChild?: boolean): PropertyType;
}
export default CqlParser;
