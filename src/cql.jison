/* description: Parses SQL */
/* :tabSize=4:indentSize=4:noTabs=true: */
%lex

%options case-insensitive

%%

[/][*](.|\n)*?[*][/]                                              /* skip comments */
[-][-]\s.*\n                                                      /* skip sql comments */
[#]\s.*\n                                                         /* skip sql comments */
\s+                                                               /* skip whitespace */

[\w]+[\u4e00-\u9fa5]+[0-9a-zA-Z_\u4e00-\u9fa5]*                   return 'IDENTIFIER'
[\u4e00-\u9fa5][0-9a-zA-Z_\u4e00-\u9fa5]*                         return 'IDENTIFIER'
TRUE                                                              return 'TRUE'
FALSE                                                             return 'FALSE'
NULL                                                              return 'NULL'
CASE                                                              return 'CASE'
WHEN                                                              return 'WHEN'
THEN                                                              return 'THEN'
ELSE                                                              return 'ELSE'
END                                                               return 'END'
DIV                                                               return 'DIV'
MOD                                                               return 'MOD'
NOT                                                               return 'NOT'
BETWEEN                                                           return 'BETWEEN'
IN                                                                return 'IN'
SOUNDS                                                            return 'SOUNDS'
LIKE                                                              return 'LIKE'
ESCAPE                                                            return 'ESCAPE'
REGEXP                                                            return 'REGEXP'
IS                                                                return 'IS'
UNKNOWN                                                           return 'UNKNOWN'
AND                                                               return 'AND'
OR                                                                return 'OR'
XOR                                                               return 'XOR'
FROM                                                              return 'FROM'
PARTITION                                                         return 'PARTITION'
USE                                                               return 'USE'
INDEX                                                             return 'INDEX'
KEY                                                               return 'KEY'
FOR                                                               return 'FOR'
JOIN                                                              return 'JOIN'
ORDER\s+BY                                                        return 'ORDER_BY'
GROUP\s+BY                                                        return 'GROUP_BY'
IGNORE                                                            return 'IGNORE'
FORCE                                                             return 'FORCE'
CROSS                                                             return 'CROSS'
ON                                                                return 'ON'
USING                                                             return 'USING'
LEFT                                                              return 'LEFT'
RIGHT                                                             return 'RIGHT'
OUTER                                                             return 'OUTER'
NATURAL                                                           return 'NATURAL'
WHERE                                                             return 'WHERE'
ASC                                                               return 'ASC'
DESC                                                              return 'DESC'
WITH                                                              return 'WITH'
ROLLUP                                                            return 'ROLLUP'
HAVING                                                            return 'HAVING'
OFFSET                                                            return 'OFFSET'
PROCEDURE                                                         return 'PROCEDURE'
UPDATE                                                            return 'UPDATE'
LOCK                                                              return 'LOCK'
SHARE                                                             return 'SHARE'
MODE                                                              return 'MODE'
OJ                                                                return 'OJ'
LIMIT                                                             return 'LIMIT'
UNION                                                             return 'UNION'
NOT                                                               return 'NOT'
AND                                                               return 'AND'
OR                                                                return 'OR'
LIKE                                                              return 'LIKE'
IS                                                                return 'IS'
NULL                                                              return 'NULL'
EXISTS                                                            return 'EXISTS'
DOES-NOT-EXIST                                                    return 'DOES-NOT-EXIST'
DURING                                                            return 'DURING'
AFTER                                                             return 'AFTER'
BEFORE                                                            return 'BEFORE'
IN                                                                return 'IN'
INCLUDE                                                           return 'INCLUDE'
EXCLUDE                                                           return 'EXCLUDE'
EQUALS                                                            return 'EQUALS'
DISJOINT                                                          return 'DISJOINT'
INTERSECTS                                                        return 'INTERSECTS'
TOUCHES                                                           return 'TOUCHES'
CROSSES                                                           return 'CROSSES'
WITHIN                                                            return 'WITHIN'
CONTAINS                                                          return 'CONTAINS'
OVERLAPS                                                          return 'OVERLAPS'
RELATE                                                            return 'RELATE'
DWITHIN                                                           return 'DWITHIN'
BEYOND                                                            return 'BEYOND'
POINT                                                             return 'POINT'
LINESTRING                                                        return 'LINESTRING'
POLYGON                                                           return 'POLYGON'
MULTIPOINT                                                        return 'MULTIPOINT'
MULTILINESTRING                                                   return 'MULTILINESTRING'
MULTIPOLYGON                                                      return 'MULTIPOLYGON'
GEOMETRYCOLLECTION                                                return 'GEOMETRYCOLLECTION'

","                                                               return ','
"="                                                               return '='
"("                                                               return '('
")"                                                               return ')'
"~"                                                               return '~'
"!="                                                              return '!='
"!"                                                               return '!'
"|"                                                               return '|'
"&"                                                               return '&'
"+"                                                               return '+'
"-"                                                               return '-'
"*"                                                               return '*'
"/"                                                               return '/'
"%"                                                               return '%'
"^"                                                               return '^'
">>"                                                              return '>>'
">="                                                              return '>='
">"                                                               return '>'
"<<"                                                              return '<<'
"<=>"                                                             return '<=>'
"<="                                                              return '<='
"<>"                                                              return '<>'
"<"                                                               return '<'
"{"                                                               return '{'
"}"                                                               return '}'
";"                                                               return ';'

['](\\.|[^'])*[']                                                 return 'STRING'
["](\\.|[^"])*["]                                                 return 'STRING'
[0][x][0-9a-fA-F]+                                                return 'HEX_NUMERIC'
[-]?[0-9]+(\.[0-9]+)?                                             return 'NUMERIC'
[-]?[0-9]+(\.[0-9]+)?[eE][-][0-9]+(\.[0-9]+)?                     return 'EXPONENT_NUMERIC'

[a-zA-Z_\u4e00-\u9fa5][a-zA-Z0-9_\u4e00-\u9fa5]*                  return 'IDENTIFIER'
\.                                                                return 'DOT'
["]([a-zA-Z_\u4e00-\u9fa5][a-zA-Z0-9_\u4e00-\u9fa5]*)["]          return 'STRING'
[']([a-zA-Z_\u4e00-\u9fa5][a-zA-Z0-9_\u4e00-\u9fa5]*)[']          return 'STRING'
([`])(?:(?=(\\?))\2.)*?\1                                         return 'IDENTIFIER'

<<EOF>>                                                           return 'EOF'
.                                                                 return 'INVALID'

/lex

%left ',' TABLE_REF_COMMA
%left INDEX_HINT_LIST
%left INDEX_HINT_COMMA
%left INNER_CROSS_JOIN_NULL LEFT_RIGHT_JOIN
%left INNER_CROSS_JOIN
%right USING
%right ON
%left OR XOR '||'
%left '&&' AND
%left '|'
%left '^'
%left '&'
%left '=' '!='
%left '>' '>=' '<' '<='
%left '<<' '>>'
%left '+' '-'
%left DIV MOD '/' '%' '*'
%right UPLUS UMINUS UNOT '~' NOT
%left DOT

%start main

%% /* language grammar */

main
  : where_opt EOF { return $$ = $1; }
  ;

semicolonOpt
  : ';' { $$ = true }
  | { $$ = false }
  ;

string
  : STRING {
      if ($1.startsWith('\'') || $1.startsWith('"')) {
          $$ = $1.substring(1, $1.length - 1)
      } else {
          $$ = $1
      }
    }
  ;

number
  : NUMERIC { $$ = Number($1) }
  | EXPONENT_NUMERIC = { $$ = Number($1) }
  ;

boolean
  : TRUE { $$ = true }
  | FALSE { $$ = false }
  ;

null
  : NULL { $$ = null }
  ;

literal
  : string { $$ = $1 }
  | number { $$ = $1 }
  | boolean { $$ = $1 }
  | null { $$ = $1 }
  | place_holder { $$ = $1 }
  ;

function_call
  : IDENTIFIER '(' function_call_param_list ')' { $$ = { name: $1, args: $3} }
  ;

function_call_param_list
  : function_call_param_list ',' function_call_param { $1.push($3); $$ = $1; }
  | function_call_param { $$ = [$1]; }
  ;

function_call_param
  : { $$ = null }
  | expr { $$ = $1 }
  ;

identifier
  : IDENTIFIER { $$ = $1 }
  | identifier DOT IDENTIFIER { $$ = $1; $1.value += '.' + $3 }
  ;

identifier_list
  : identifier { $$ = { type: 'IdentifierList', value: [ $1 ] } }
  | identifier_list ',' identifier { $$ = $1; $1.value.push($3); }
  ;
case_expr_opt
  : { $$ = null }
  | expr { $$ = $1 }
  ;
when_then_list
  : WHEN expr THEN expr { $$ = { type: 'WhenThenList', value: [ { when: $2, then: $4 } ] }; }
  | when_then_list WHEN expr THEN expr { $$ = $1; $$.value.push({ when: $3, then: $5 }); }
  ;
case_when_else
  : { $$ = null }
  | ELSE expr { $$ = $2 }
  ;
case_when
  : CASE case_expr_opt when_then_list case_when_else END { $$ = { type: 'CaseWhen', caseExprOpt: $2, whenThenList: $3, else: $4 } }
  ;
simple_expr_prefix
  : '+' simple_expr %prec UPLUS { $$ = { type: 'Prefix', prefix: $1, value: $2 } }
  | '-' simple_expr %prec UMINUS { $$ = { type: 'Prefix', prefix: $1, value: $2 } }
  | '~' simple_expr { $$ = { type: 'Prefix', prefix: $1, value: $2 } }
  | '!' simple_expr %prec UNOT { $$ = { type: 'Prefix', prefix: $1, value: $2 } }
  |  BINARY simple_expr { $$ = { type: 'Prefix', prefix: $1, value: $2 } }
  ;
simple_expr
  : literal { $$ = $1 }
  | identifier { $$ = $1 }
  | function_call { $$ = $1 }
  | simple_expr_prefix { $$ = $1 }
  | '(' expr_list ')' { if ($2.length === 1) $$ = $2[0]; else $$ = $2 }
  | ROW '(' expr_list ')' { $$ = $2 }
  | '{' identifier expr '}' { $$ = { type: 'IdentifierExpr', identifier: $2, value: $3 } }
  | case_when { $$ = $1 }
  ;
bit_expr
  : simple_expr { $$ = $1 }
  | bit_expr '|' bit_expr { $$ = { type: 'BitExpression', operator: '|', left: $1, right: $3 } }
  | bit_expr '&' bit_expr { $$ = { type: 'BitExpression', operator: '&', left: $1, right: $3 } }
  | bit_expr '<<' bit_expr { $$ = { type: 'BitExpression', operator: '<<', left: $1, right: $3 } }
  | bit_expr '>>' bit_expr { $$ = { type: 'BitExpression', operator: '>>', left: $1, right: $3 } }
  | bit_expr '+' bit_expr { $$ = { type: 'BitExpression', operator: '+', left: $1, right: $3 } }
  | bit_expr '-' bit_expr { $$ = { type: 'BitExpression', operator: '-', left: $1, right: $3 } }
  | bit_expr '*' bit_expr %prec MULTI { $$ = { type: 'BitExpression', operator: '*', left: $1, right: $3 } }
  | bit_expr '/' bit_expr { $$ = { type: 'BitExpression', operator: '/', left: $1, right: $3 } }
  | bit_expr DIV bit_expr { $$ = { type: 'BitExpression', operator: 'DIV', left: $1, right: $3 } }
  | bit_expr MOD bit_expr { $$ = { type: 'BitExpression', operator: 'MOD', left: $1, right: $3 } }
  | bit_expr '%' bit_expr { $$ = { type: 'BitExpression', operator: '%', left: $1, right: $3 } }
  | bit_expr '^' bit_expr { $$ = { type: 'BitExpression', operator: '^', left: $1, right: $3 } }
  ;
not_opt
  : { $$ = null }
  | NOT { $$ = $1 }
  ;
escape_opt
  : { $$ = null }
  | ESCAPE simple_expr { $$ = $2 }
  ;
predicate
  : bit_expr { $$ = $1 }
  | bit_expr not_opt IN '(' selectClause ')' { $$ = { type: 'InSubQueryPredicate', hasNot: $2, left: $1 ,right: $5 } }
  | bit_expr not_opt IN '(' expr_list ')' { $$ = { type: 'InExpressionListPredicate', hasNot: $2, left: $1, right: $5 } }
  | bit_expr not_opt BETWEEN bit_expr AND predicate { $$ = ['<=x<=', $1, $4, $6] }
  | bit_expr SOUNDS LIKE bit_expr { $$ = { type: 'SoundsLikePredicate', hasNot: false, left: $1, right: $4 } }
  | bit_expr not_opt LIKE simple_expr escape_opt { $$ = { type: 'LikePredicate', hasNot: $2, left: $1, right: $4, escape: $5 } }
  | bit_expr not_opt REGEXP bit_expr { $$ = { type: 'RegexpPredicate', hasNot: $2, left: $1, right: $4 } }
  ;
comparison_operator
  : '=' { $$ = '==' }
  | '>=' { $$ = $1 }
  | '>' { $$ = $1 }
  | '<=' { $$ = $1 }
  | '<' { $$ = $1 }
  | '<>' { $$ = $1 }
  | '!=' { $$ = $1 }
  ;
boolean_primary
  : predicate { $$ = $1 }
  | boolean_primary IS not_opt NULL { $$ = ['==', $1, null] }
  | boolean_primary comparison_operator predicate { $$ = [$2, $1, $3] }
  ;
boolean_extra
  : boolean { $$ = $1 }
  | UNKNOWN { $$ = { type: 'BooleanExtra', value: $1 } }
  ;
expr
  : boolean_primary { $$ = $1 }
  | NOT expr { $$ = ['!', $2] }
  | expr '&&' expr { $$ = ['&&', $1, $3] }
  | expr '||' expr { $$ = ['||', $1, $3] }
  | expr OR expr { $$ = ['||', $1, $3] }
  | expr AND expr { $$ = ['&&', $1, $3] }
  ;
expr_list
  : expr { $$ = [$1] }
  | expr_list ',' expr { $$ = $1; $$.push($3); }
  ;

where_opt
  : expr { $$ = $1 }
  ;
group_by_opt
  : { $$ = null }
  | group_by { $$ = $1 }
  ;
roll_up_opt
  : { $$ = null }
  | WITH ROLLUP { $$ = true }
  ;
order_by_opt
  : { $$ = null }
  | order_by { $$ = $1 }
  ;
order_by
  : ORDER_BY group_by_order_by_item_list roll_up_opt { $$ = { type: 'OrderBy', value: $2, rollUp: $3 } }
  ;
group_by_order_by_item_list
  : group_by_order_by_item { $$ = [ $1 ] }
  | group_by_order_by_item_list ',' group_by_order_by_item { $$ = $1; $1.push($3); }
  ;
sort_opt
  : { $$ = null }
  | ASC { $$ = $1 }
  | DESC { $$ = $1 }
  ;
limit
  : LIMIT NUMERIC { $$ = { type: 'Limit', value: [ $2 ] } }
  | LIMIT NUMERIC ',' NUMERIC { $$ = { type: 'Limit', value: [ $2, $4 ] } }
  | LIMIT NUMERIC OFFSET NUMERIC { $$ = { type: 'Limit', value: [ $4, $2 ], offsetMode: true } }
  ;
limit_opt
  : { $$ = null }
  | limit { $$ = $1 }
  ;
procedure_opt
  : { $$ = null }
  | procedure { $$ = $1 }
  ;
procedure
  : PROCEDURE function_call { $$ = $2 }
  ;
for_update_lock_in_share_mode_opt
  : { $$ = null }
  | FOR UPDATE { $$ = $1 + ' ' + $2 }
  | LOCK IN SHARE MODE { $$ = $1 + ' ' + $2 + ' ' + $3 + ' ' + $4 }
  ;
left_right
  : LEFT { $$ = $1 }
  | RIGHT { $$ = $1 }
  ;
out_opt
  : { $$ = null }
  | OUTER { $$ = $1 }
  ;
left_right_out_opt
  : { $$ = { leftRight: null, outOpt: null } }
  | left_right out_opt { $$ = { leftRight: $1, outOpt: $2 } }
  ;
table_reference
  : table_factor { $$ = $1 }
  | join_table { $$ = $1 }
  ;

identifier_list_opt
  : { $$ = null }
  | identifier_list { $$ = $1 }
  ;
