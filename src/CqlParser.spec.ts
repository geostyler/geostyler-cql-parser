import { CqlParser } from './CqlParser';
import { Filter } from 'geostyler-style';

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
      const cqlFilter = 'Name = \'Peter\'';
      const got = cqlParser.read(cqlFilter);
      expect(got).toEqual(['==', {name: 'Name'}, {value: 'Peter'}]);
    });
    it('can read number Comparison Filters', () => {
      const cqlFilter = 'Age = 12.3';
      const got = cqlParser.read(cqlFilter);
      expect(got).toEqual(['==', {name: 'Age'}, {value: 12.3}]);
    });
    it('can read Strings with quotation marks Comparison Filters', () => {
      const cqlFilter1 = `Name = "Peter"`;
      const cqlFilter2 = `Name = 'Peter'`;
      const got1 = cqlParser.read(cqlFilter1);
      const got2 = cqlParser.read(cqlFilter2);
      expect(got1).toEqual(['==', {name: 'Name'}, {value: 'Peter'}]);
      expect(got2).toEqual(['==', {name: 'Name'}, {value: 'Peter'}]);
    });
    it('can read Number Comparison Filters', () => {
      const cqlFilter1 = 'Age = 12';
      const cqlFilter2 = 'Height = 1.75';
      const got1 = cqlParser.read(cqlFilter1);
      const got2 = cqlParser.read(cqlFilter2);
      expect(got1).toEqual(['==', {name: 'Age'}, {value: 12}]);
      expect(got2).toEqual(['==', {name: 'Height'}, {value: 1.75}]);
    });
    it('can read Combination Filters', () => {
      const cqlFilter1 = 'Age = 12 AND Name = \'Peter\'';
      const cqlFilter2 = 'Name = "Peter Schmidt" OR Height = 1.75';
      const got1 = cqlParser.read(cqlFilter1);
      const got2 = cqlParser.read(cqlFilter2);
      expect(got1).toEqual(
        [
          '&&',
          ['==', {name: 'Age'}, {value: 12}],
          ['==', {name: 'Name'}, {value: 'Peter'}]
        ]
      );
      expect(got2).toEqual(
        [
          '||',
          ['==', {name: 'Name'}, {value: 'Peter Schmidt'}],
          ['==', {name: 'Height'}, {value: 1.75}]
        ]
      );
    });
    it('can read Combination Filters with parens', () => {
      const cqlFilter1 = '( Age = 12 AND Name = \'Peter\' )';
      const cqlFilter2 = '( Name = "Peter Schmidt" OR Height = 1.75 )';
      const got1 = cqlParser.read(cqlFilter1);
      const got2 = cqlParser.read(cqlFilter2);
      expect(got1).toEqual(
        [
          '&&',
          ['==', {name: 'Age'}, {value: 12}],
          ['==', {name: 'Name'}, {value: 'Peter'}]
        ]
      );
      expect(got2).toEqual(
        [
          '||',
          ['==', {name: 'Name'}, {value: 'Peter Schmidt'}],
          ['==', {name: 'Height'}, {value: 1.75}]
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
            ['==', {name: 'Name'}, {name: 'Peter'}],
            ['==', {name: 'Name'}, {name: 'Hilde'}]
          ],
          ['==', {name: 'Age'}, {value: 12}]
        ]
      );
      expect(got2).toEqual(
        [
          '&&', [
            '||',
            ['==', {name: 'Age'}, {value: 13}],
            ['==', {name: 'Name'}, {name: 'Peter'}]
          ], [
            '||',
            ['==', {name: 'Age'}, {value: 13}],
            ['==', {name: 'Name'}, {name: 'Hilde'}]
          ]
        ]
      );
      expect(got3).toEqual(
        [
          '||', [
            '&&',
            ['==', {name: 'Age'}, {value: 12}],
            ['==', {name: 'Name'}, {name: 'Peter'}]
          ], [
            '&&',
            ['==', {name: 'Age'}, {value: 12}],
            ['==', {name: 'Name'}, {name: 'Hilde'}]
          ]
        ]
      );
    });
    it('can read function expressions', () => {
      const functionFilter = 'name = upcase(lastname)';
      const result = cqlParser.read(functionFilter);
      expect(result).toEqual(
        [
          '==',
          {
            name: 'name'
          },
          {
            name: 'upcase',
            args: [
              {
                name: 'lastname'
              }
            ]
          }
        ]
      );
    });
    it('can read function expressions with literal arguments', () => {
      const functionFilter = 'name = someFunc(\'someLiteral\', 3)';
      const result = cqlParser.read(functionFilter);
      expect(result).toEqual(
        [
          '==',
          {
            name: 'name'
          },
          {
            name: 'someFunc',
            args: [
              {
                value: 'someLiteral'
              },
              {
                value: 3
              }
            ]
          }
        ]
      );
    });
  });

  describe('#write', () => {
    it('is defined', () => {
      expect(cqlParser.write).toBeDefined();
    });
    it('returns undefined for illegal filters', () => {
      const cqlFilter1 = undefined;
      const cqlFilter2: Filter = ['=='];
      const cqlFilter3: Filter = [];
      expect(cqlParser.write(cqlFilter1)).toBeUndefined();
      expect(cqlParser.write(cqlFilter2)).toBeUndefined();
      expect(cqlParser.write(cqlFilter3)).toBeUndefined();
    });
    it('can write String Comparison Filters', () => {
      const geoStylerFilter = ['==', {name: 'Name'}, {value: 'Peter'}];
      const got = cqlParser.write(geoStylerFilter);
      expect(got).toEqual('Name = \'Peter\'');
    });
    it('can write Number Comparison Filters', () => {
      const geoStylerFilter1 = ['==', {name: 'Age'}, {value: 12}];
      const geoStylerFilter2 = ['==', {name: 'Height'}, {value: 1.75}];
      const got1 = cqlParser.write(geoStylerFilter1);
      const got2 = cqlParser.write(geoStylerFilter2);
      expect(got1).toEqual('Age = 12');
      expect(got2).toEqual('Height = 1.75');
    });
    it('can write Combination Filters', () => {
      const geoStylerFilter1 = [
        '&&',
        ['==', {name: 'Age'}, {value: 12}],
        ['==', {name: 'Name'}, {value: 'Peter'}]
      ];
      const geoStylerFilter2 =
      [
        '||',
        ['==', {name: 'Name'}, {value: 'Peter Schmidt'}],
        ['==', {name: 'Height'}, {value: 1.75}]
      ];
      const cqlFilter1 = 'Age = 12 AND Name = \'Peter\'';
      const cqlFilter2 = 'Name = \'Peter Schmidt\' OR Height = 1.75';
      const got1 = cqlParser.write(geoStylerFilter1);
      const got2 = cqlParser.write(geoStylerFilter2);
      expect(got1).toEqual(cqlFilter1);
      expect(got2).toEqual(cqlFilter2);
    });
    it('can write filter expressions', () => {
      const geoStylerFilter1 = [
        '&&',
        ['==', {name: 'Age'}, {value: 12}],
        ['==', {name: 'Name'}, {name: 'upcase', args: [{name: 'lastname'}]}]
      ];
      const geoStylerFilter2 = [
        '==', {name: 'nameandage'}, {name: 'concat', args: [{name: 'name'}, {value: 12}]}
      ];
      const cqlFilter1 = 'Age = 12 AND Name = upcase(lastname)';
      const cqlFilter2 = 'nameandage = concat(name, 12)';
      const got1 = cqlParser.write(geoStylerFilter1);
      const got2 = cqlParser.write(geoStylerFilter2);
      expect(got1).toEqual(cqlFilter1);
      expect(got2).toEqual(cqlFilter2);
    });
    it('can write multiple Combination Filters', () => {
      const geoStylerFilter1 = [
        '&&',
        ['==', {name: 'Age'}, {value: 12}],
        ['==', {name: 'Name'}, {value: 'Peter'}],
        ['==', {name: 'Car'}, {value: 'Bentley'}]
      ];
      const cqlFilter1 = 'Age = 12 AND Name = \'Peter\' AND Car = \'Bentley\'';
      const got1 = cqlParser.write(geoStylerFilter1);
      expect(got1).toEqual(cqlFilter1);
    });
    it('can write complex Combination Filters', () => {
      const geoStylerFilter1 = [
        '&&', [
          '||',
          ['==', {name: 'Name'}, {value: 'Peter'}],
          ['==', {name: 'Name'}, {value: 'Hilde'}]
        ],
        ['==', {name: 'Age'}, {value: 12}]
      ];
      const geoStylerFilter2 = [
        '&&', [
          '||',
          ['==', {name: 'Age'}, {value: 13}],
          ['==', {name: 'Name'}, {value: 'Peter'}]
        ], [
          '||',
          ['==', {name: 'Age'}, {value: 13}],
          ['==', {name: 'Name'}, {value: 'Hilde'}]
        ]
      ];
      const geoStylerFilter3 = [
        '||', [
          '&&',
          ['==', {name: 'Age'}, {value: 12}],
          ['==', {name: 'Name'}, {value: 'Peter'}]
        ], [
          '&&',
          ['==', {name: 'Age'}, {value: 12}],
          ['==', {name: 'Name'}, {value: 'Hilde'}]
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
  });
});
