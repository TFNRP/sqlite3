import * as Database from 'better-sqlite3';
import { getConfig, getPathFromImplicit } from './util';

const config = getConfig();

enum State { 'pluck', 'expand', 'raw' }

const db = new Database(config.debug ? ':memory:' : getPathFromImplicit(config.filepath, config.filename), {
  readonly: config.readonly,
  timeout: config.timeout,
  verbose: config.debug ? console.log : undefined,
});

global.exports('is_open', () => db.open)

global.exports('transaction', (query: string, params?: any): boolean => {
  const statement = db.prepare(query);
  try {
    db.transaction((...args) => statement.run(...args))(params);
  } catch(e) {
    console.error(e);
    return false;
  }
  return true;
});

global.exports('transaction_deferred', (query: string, params?: any): boolean => {
  const statement = db.prepare(query);
  try {
    db.transaction((...args) => statement.run(...args)).deferred(params);
  } catch(e) {
    console.error(e);
    return false;
  }
  return true;
});

global.exports('transaction_immediate', (query: string, params?: any): boolean => {
  const statement = db.prepare(query);
  try {
    db.transaction((...args) => statement.run(...args)).immediate(params);
  } catch(e) {
    console.error(e);
    return false;
  }
  return true;
});

global.exports('transaction_exclusive', (query: string, params?: any): boolean => {
  const statement = db.prepare(query);
  try {
    db.transaction((...args) => statement.run(...args)).exclusive(params);
  } catch(e) {
    console.error(e);
    return false;
  }
  return true;
});

global.exports('run', (query: string, params?: any, state?: State): Database.RunResult | boolean => {
  const statement = db.prepare(query);
  switch(state) {
    case(State.pluck):
      statement.pluck();
      break;
    case(State.expand):
      statement.expand();
      break;
    case(State.raw):
      statement.raw();
  }
  try {
    return statement.run(params);
  } catch(e) {
    console.error(e);
    return false;
  }
});

global.exports('all', (query: string, params?: any, state?: State): any[] | false => {
  const statement = db.prepare(query);
  switch(state) {
    case(State.pluck):
      statement.pluck();
      break;
    case(State.expand):
      statement.expand();
      break;
    case(State.raw):
      statement.raw();
  }
  try {
    return statement.all(params);
  } catch(e) {
    console.error(e);
    return false;
  }
});

global.exports('get', (query: string, params?: any, state?: State): any | false => {
  const statement = db.prepare(query);
  switch(state) {
    case(State.pluck):
      statement.pluck();
      break;
    case(State.expand):
      statement.expand();
      break;
    case(State.raw):
      statement.raw();
  }
  try {
    return statement.get(params);
  } catch(e) {
    console.error(e);
    return false;
  }
});

global.exports('columns', (query: string, params?: any, state?: State): Database.ColumnDefinition[] | false => {
  const statement = db.prepare(query);
  if (params) statement.bind(params);
  switch(state) {
    case(State.pluck):
      statement.pluck();
      break;
    case(State.expand):
      statement.expand();
      break;
    case(State.raw):
      statement.raw();
  }
  try {
    return statement.columns();
  } catch(e) {
    console.error(e);
    return false;
  }
});

global.exports('execute', (query: string): boolean => {
  try {
    db.exec(query);
  } catch(e) {
    console.error(e);
    return false;
  }
  return true;
});

global.exports('pragma', (query: string, simple?: boolean | undefined): any | false => {
  try {
    return db.pragma(query, { simple });
  } catch(e) {
    console.error(e);
    return false;
  }
});

global.exports('backup', (path: string, cb?: (result: Database.BackupMetadata | false) => any): Promise<Database.BackupMetadata | false> => {
  return db.backup(path, {
    progress({ totalPages: t, remainingPages: r }) {
      console.log(`SQLite3 backup progress: ${((t - r) / t * 100).toFixed(1)}%`);
      return 200;
    }
  })
    .then(r => {
      if (cb) cb(r);
      return r;
    })
    .catch(e => {
      console.error(e);
      if (cb) cb(false);
      return false;
    });
});

global.exports('function', (name: string, fn: string | ((...params: any[]) => any), options: Database.RegistrationOptions = {}): boolean => {
  try {
    // unsafe eval - possibly a vulnerability
    if (typeof fn === 'string') fn = eval(fn) as (...params: any[]) => any;
    db.function(name, options, fn);
  } catch(e) {
    console.error(e);
    return false;
  }
  return true;
});

process.on('exit', () => db.close());
process.on('SIGHUP', () => db.close());
process.on('SIGINT', () => db.close());
process.on('SIGTERM', () => db.close());