grammar KasandraModellingLanguage

import 'terminals';

entry Model: 
    'Model' name=ID
    'uri'   uri=URI
    (Entities+=Entity | Associations+=Association)*
    ;

Entity: IdentifiedEntity | NamedEntity | CodedEntity;

IdentifiedEntity: 'IdentifiedEntity' name=ID (PropertyBlock)?;
NamedEntity: 'NamedEntity' name=ID (PropertyBlock)?;
CodedEntity: 'CodedEntity' name=ID (PropertyBlock)?;

Association: BinaryAssociation | TernaryAssociation | NAryAssociation;

BinaryAssociation: 'binaryAssociation' name=ID '{' 'roleA:' roleA=[Entity:ID] ',' 'roleB:' roleB=[Entity:ID] '}';
TernaryAssociation: 'ternaryAssociation' name=ID '{' 'roleA:' roleA=[Entity:ID] ',' 'roleB:' roleB=[Entity:ID] ',' 'roleC:' roleC=[Entity:ID] '}';
NAryAssociation: 'nAryAssociation' name=ID '{' roles+=RoleMember ',' roles+=RoleMember ',' roles+=RoleMember (',' roles+=RoleMember)* '}';

RoleMember: roleName=ID ':' actor=[Entity:ID];
PropertyBlock: '{' properties+=(Property)* '}';

Property: KeyProperty | MandatoryProperty | OptionalProperty | InverseProperty | DynamicProperty | QueryProperty;

KeyProperty:        '*' BaseProperty;
MandatoryProperty:  '+' BaseProperty;
OptionalProperty:   '-' BaseProperty;

InverseProperty:    '<--' name=ID   ':' pRef=FullMemberdName;
DynamicProperty:    '<->' name=ID   ':' 'use' pRef=[BinaryAssociation:ID] 'from:' source='A' | 'B';
QueryProperty:      '<=o' name=ID   ':' code=Expression;

BaseProperty: name=ID     ':' type=TypeReference;

TypeReference: reference=[Entity:ID] 
    | primitive=('String' | 'Number' | 'Boolean' | 'Date' | 'Time' | 'DateTime' ) ;

FullMemberdName returns string: ID ('.' ID)*;

Expression: code=STRING;