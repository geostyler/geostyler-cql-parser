import { CqlParser } from './CqlParser';
import { Filter } from 'geostyler-style';
import Parser from './cql-parser';

describe('CqlParser', () => {
  let cqlParser: CqlParser;

  it('is defined', () => {
    expect(CqlParser).toBeDefined();
  });

  beforeEach(() => {
    cqlParser = new CqlParser();
  });

  describe('#read', () => {
    it('is defined', () => {
      expect(cqlParser.read).toBeDefined();
    });
    it('returns undefined for empty strings', () => {
      const cqlFilter1 = undefined;
      const cqlFilter2 = '';
      expect(cqlParser.read(cqlFilter1)).toBeUndefined();
      expect(cqlParser.read(cqlFilter2)).toBeUndefined();
    });
    it('can read String Comparison Filters', () => {
      const cqlFilter = 'Name = Peter';
      const got = cqlParser.read(cqlFilter);
      expect(got).toEqual(['==', 'Name', 'Peter']);
    });
    it('can read number Comparison Filters', () => {
      const cqlFilter = 'Age = 12.3';
      const got = cqlParser.read(cqlFilter);
      expect(got).toEqual(['==', 'Age', {
        type: 'literal',
        value: 12.3
      }]);
    });
    it('can read Strings with quotation marks Comparison Filters', () => {
      const cqlFilter1 = 'Name = "Peter"';
      const cqlFilter2 = 'Name = \'Peter\'';
      const got1 = cqlParser.read(cqlFilter1);
      const got2 = cqlParser.read(cqlFilter2);
      expect(got1).toEqual(['==', 'Name', {
        type: 'literal',
        value: 'Peter'
      }]);
      expect(got2).toEqual(['==', 'Name', {
        type: 'literal',
        value: 'Peter'
      }]);
    });
    it('can read Number Comparison Filters', () => {
      const cqlFilter1 = 'Age = 12';
      const cqlFilter2 = 'Height = 1.75';
      const got1 = cqlParser.read(cqlFilter1);
      const got2 = cqlParser.read(cqlFilter2);
      expect(got1).toEqual(['==', 'Age', {
        type: 'literal',
        value: 12
      }]);
      expect(got2).toEqual(['==', 'Height', {
        type: 'literal',
        value: 1.75
      }]);
    });
    it('can read Between Comparison Filter', () => {
      const cqlFilter = 'Persons BETWEEN 1000 AND 2000';
      const expected = [
        '<=x<=',
        'Persons', {
          type: 'literal',
          value: 1000
        }, {
          type: 'literal',
          value: 2000
        }
      ];
      const got = cqlParser.read(cqlFilter);
      expect(got).toEqual(expected);
    });
    it('can read is null Comparison Filter', () => {
      const cqlFilter = 'Persons IS NULL';
      const expected = ['==', 'Persons', null];
      const got = cqlParser.read(cqlFilter);
      expect(got).toEqual(expected);
    });
    it('can read Negation Filters', () => {
      const cqlFilter = 'NOT(Name = \'Peter\')';
      const expected = [
        '!',
        ['==', 'Name', {
          type: 'literal',
          value: 'Peter'
        }]
      ];
      const got = cqlParser.read(cqlFilter);
      expect(got).toEqual(expected);
    });
    it('can read Combination Filters', () => {
      const cqlFilter1 = 'Age = 12 AND Name = Peter';
      const cqlFilter2 = 'Name = "Peter Schmidt" OR Height = 1.75';
      const got1 = cqlParser.read(cqlFilter1);
      const got2 = cqlParser.read(cqlFilter2);
      expect(got1).toEqual(
        [
          '&&',
          ['==', 'Age', {
            type: 'literal',
            value: 12
          }],
          ['==', 'Name', 'Peter']
        ]
      );
      expect(got2).toEqual(
        [
          '||',
          ['==', 'Name', {
            type: 'literal',
            value: 'Peter Schmidt'
          }],
          ['==', 'Height', {
            type: 'literal',
            value: 1.75
          }]
        ]
      );
    });
    it('can read Combination Filters with parens', () => {
      const cqlFilter1 = '( Age = 12 AND Name = Peter )';
      const cqlFilter2 = '( Name = "Peter Schmidt" OR Height = 1.75 )';
      const got1 = cqlParser.read(cqlFilter1);
      const got2 = cqlParser.read(cqlFilter2);
      expect(got1).toEqual(
        [
          '&&',
          ['==', 'Age', {
            type: 'literal',
            value: 12
          }],
          ['==', 'Name', 'Peter']
        ]
      );
      expect(got2).toEqual(
        [
          '||',
          ['==', 'Name', {
            type: 'literal',
            value: 'Peter Schmidt'
          }],
          ['==', 'Height', {
            type: 'literal',
            value: 1.75
          }]
        ]
      );
    });
    it('can read complex Combination Filters with parens', () => {
      const cqlFilter1 = '(Name = Peter OR Name = Hilde) AND Age = 12';
      const cqlFilter2 = '(Age = 13 OR Name = Peter) AND (Age = 13 OR Name = Hilde)';
      const cqlFilter3 = '(Age = 12 AND Name = Peter) OR (Age = 12 AND Name = Hilde)';
      const got1 = cqlParser.read(cqlFilter1);
      const got2 = cqlParser.read(cqlFilter2);
      const got3 = cqlParser.read(cqlFilter3);
      expect(got1).toEqual(
        [
          '&&', [
            '||',
            ['==', 'Name', 'Peter'],
            ['==', 'Name', 'Hilde']
          ],
          ['==', 'Age', {
            type: 'literal',
            value: 12
          }]
        ]
      );
      expect(got2).toEqual(
        [
          '&&', [
            '||',
            ['==', 'Age', {
              type: 'literal',
              value: 13
            }],
            ['==', 'Name', 'Peter']
          ], [
            '||',
            ['==', 'Age', {
              type: 'literal',
              value: 13
            }],
            ['==', 'Name', 'Hilde']
          ]
        ]
      );
      expect(got3).toEqual(
        [
          '||', [
            '&&',
            ['==', 'Age', {
              type: 'literal',
              value: 12
            }],
            ['==', 'Name', 'Peter']
          ], [
            '&&',
            ['==', 'Age', {
              type: 'literal',
              value: 12
            }],
            ['==', 'Name', 'Hilde']
          ]
        ]
      );

    });
  });

  describe('#write', () => {
    it('is defined', () => {
      expect(cqlParser.write).toBeDefined();
    });
    it('returns undefined for illegal filters', () => {
      const cqlFilter1: Filter = undefined;
      const cqlFilter2: Filter = ['=='] as any;
      const cqlFilter3: Filter = [] as any;
      const cqlFilter4: Filter = [undefined, undefined] as Filter;
      expect(cqlParser.write(cqlFilter1)).toBeUndefined();
      expect(cqlParser.write(cqlFilter2)).toBeUndefined();
      expect(cqlParser.write(cqlFilter3)).toBeUndefined();
      expect(cqlParser.write(cqlFilter4)).toBeUndefined();
    });
    it('throws for unexpected operators', () => {
      const geoStylerFilter = ['😱', 'Name', 'Peter'] as any;
      expect(() => {
        cqlParser.write(geoStylerFilter);
      }).toThrowError();
    });
    it('can write Negation Filters', () => {
      const geoStylerFilter = [
        '!',
        ['==', 'Name', 'Peter']
      ] as Filter;
      const got = cqlParser.write(geoStylerFilter);
      expect(got).toEqual('NOT ( Name = \'Peter\' )');
    });
    it('can write String Comparison Filters', () => {
      const geoStylerFilter: Filter = ['==', 'Name', 'Peter'];
      const got = cqlParser.write(geoStylerFilter);
      expect(got).toEqual('Name = \'Peter\'');
    });
    it('can write Number Comparison Filters', () => {
      const geoStylerFilter1: Filter = ['==', 'Age', 12];
      const geoStylerFilter2: Filter = ['==', 'Height', 1.75];
      const got1 = cqlParser.write(geoStylerFilter1);
      const got2 = cqlParser.write(geoStylerFilter2);
      expect(got1).toEqual('Age = 12');
      expect(got2).toEqual('Height = 1.75');
    });
    it('can write Combination Filters', () => {
      const geoStylerFilter1: Filter = [
        '&&',
        ['==', 'Age', 12],
        ['==', 'Name', 'Peter']
      ];
      const geoStylerFilter2: Filter =
      [
        '||',
        ['==', 'Name', 'Peter Schmidt'],
        ['==', 'Height', 1.75]
      ];
      const cqlFilter1 = 'Age = 12 AND Name = \'Peter\'';
      const cqlFilter2 = 'Name = \'Peter Schmidt\' OR Height = 1.75';
      const got1 = cqlParser.write(geoStylerFilter1);
      const got2 = cqlParser.write(geoStylerFilter2);
      expect(got1).toEqual(cqlFilter1);
      expect(got2).toEqual(cqlFilter2);
    });
    it('can write multiple Combination Filters', () => {
      const geoStylerFilter1: Filter= [
        '&&',
        ['==', 'Age', 12],
        ['==', 'Name', 'Peter'],
        ['==', 'Car', 'Bentley']
      ];
      const cqlFilter1 = 'Age = 12 AND Name = \'Peter\' AND Car = \'Bentley\'';
      const got1 = cqlParser.write(geoStylerFilter1);
      expect(got1).toEqual(cqlFilter1);
    });
    it('can write complex Combination Filters', () => {
      const geoStylerFilter1: Filter = [
        '&&', [
          '||',
          ['==', 'Name', 'Peter'],
          ['==', 'Name', 'Hilde']
        ],
        ['==', 'Age', 12]
      ];
      const geoStylerFilter2: Filter = [
        '&&', [
          '||',
          ['==', 'Age', 13],
          ['==', 'Name', 'Peter']
        ], [
          '||',
          ['==', 'Age', 13],
          ['==', 'Name', 'Hilde']
        ]
      ];
      const geoStylerFilter3: Filter = [
        '||', [
          '&&',
          ['==', 'Age', 12],
          ['==', 'Name', 'Peter']
        ], [
          '&&',
          ['==', 'Age', 12],
          ['==', 'Name', 'Hilde']
        ]
      ];
      const cqlFilter1 = '(Name = \'Peter\' OR Name = \'Hilde\') AND Age = 12';
      const cqlFilter2 = '(Age = 13 OR Name = \'Peter\') AND (Age = 13 OR Name = \'Hilde\')';
      const cqlFilter3 = '(Age = 12 AND Name = \'Peter\') OR (Age = 12 AND Name = \'Hilde\')';
      const got1 = cqlParser.write(geoStylerFilter1);
      const got2 = cqlParser.write(geoStylerFilter2);
      const got3 = cqlParser.write(geoStylerFilter3);
      expect(got1).toEqual(cqlFilter1);
      expect(got2).toEqual(cqlFilter2);
      expect(got3).toEqual(cqlFilter3);
    });
    it('can write a between filter', () => {
      const geoStylerFilter: Filter = [
        '<=x<=',
        'Persons',
        {
          type: 'literal',
          value: 1000
        }, {
          type: 'literal',
          value: 2000
        }
      ];
      const cqlFilter = 'Persons BETWEEN 1000 AND 2000';
      const got = cqlParser.write(geoStylerFilter);
      expect(got).toEqual(cqlFilter);
    });
    it('can write complex Combination Filters', () => {
      const geoStylerFilter = {
        type: 'functioncall',
        name: 'funcCall',
        args: [{
          type: 'literal',
          value: 1
        }, {
          type: 'literal',
          value: 2
        }]
      };
      const cqlFilter = 'funcCall(1, 2)';
      const got1 = Parser.parse(cqlFilter);
      const got2 = cqlParser.write(geoStylerFilter as any);
      expect(got2).toEqual(cqlFilter);
    });
  });
});
