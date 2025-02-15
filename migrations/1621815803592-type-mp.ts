import { HasuraApi } from '@deep-foundation/hasura/api';
import { generateApolloClient } from '@deep-foundation/hasura/client';
import { Trigger } from '@deep-foundation/materialized-path/trigger';
import Debug from 'debug';
import { DeepClient } from '../imports/client';
import { TABLE_NAME as LINKS_TABLE_NAME } from './1616701513782-links';

const debug = Debug('deeplinks:migrations:type-mp');
const log = debug.extend('log');
const error = debug.extend('error');

const client = generateApolloClient({
  path: `${process.env.MIGRATIONS_HASURA_PATH}/v1/graphql`,
  ssl: !!+(process.env.MIGRATIONS_HASURA_SSL || 0),
  secret: process.env.MIGRATIONS_HASURA_SECRET,
});

const deep = new DeepClient({
  apolloClient: client,
});

const api = new HasuraApi({
  path: process.env.MIGRATIONS_HASURA_PATH,
  ssl: !!+(process.env.MIGRATIONS_HASURA_SSL || 0),
  secret: process.env.MIGRATIONS_HASURA_SECRET,
});

export const MP_TABLE_NAME = 'mp';

const createTrigger = async () => {
  return Trigger({
    from_field: 'type_id',

    mpTableName: MP_TABLE_NAME,
    graphTableName: LINKS_TABLE_NAME,
    id_type: 'bigint',
    iteratorInsertDeclare: `groupRow bigint DEFAULT 0;`,
    iteratorDeleteArgumentSend: 'groupRow',
    iteratorDeleteArgumentGet: `groupRow bigint = 0`,
    iteratorInsertBegin: ``,
    iteratorInsertEnd: '',
    groupInsert: 'groupRow',
    iteratorDeleteDeclare: `groupRow bigint DEFAULT 0;`,
    iteratorDeleteBegin: ``,
    iteratorDeleteEnd: '',
    groupDelete: 'groupRow',

    // TODO optimize duplicating equal selects

    isAllowSpreadFromCurrent: `TRUE`,
    isAllowSpreadCurrentTo: `FALSE`,

    isAllowSpreadToCurrent: `FALSE`,
    isAllowSpreadCurrentFrom: `FALSE`,

    isAllowSpreadToInCurrent: `FALSE`,
    isAllowSpreadCurrentFromOut: `FALSE`,

    isAllowSpreadFromOutCurrent: `FALSE`,
    isAllowSpreadCurrentToIn: `FALSE`,
    
    postfix: '__type',
  });
};

export const up = async () => {
  log('up');
  const trigger = await createTrigger();
  await api.sql(trigger.upFunctionInsertNode());
  await api.sql(trigger.upFunctionDeleteNode());
  await api.sql(trigger.upTriggerDelete());
  await api.sql(trigger.upTriggerInsert());
};

export const down = async () => {
  const trigger = await createTrigger();
  log('down');
  log('dropTrigger');
  await api.sql(trigger.downFunctionInsertNode());
  await api.sql(trigger.downFunctionDeleteNode());
  await api.sql(trigger.downTriggerDelete());
  await api.sql(trigger.downTriggerInsert());
};
