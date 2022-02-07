sqlite = {}

function sqlite.statement:new(query)
  self.__index = self
  self.source = query
  self._binds = {}
  self._state = nil
  return self
end

function sqlite.statement:pluck(bool)
  if bool == false then
    self._state = nil
  else
    self._state = 'pluck'
  end
  return self
end

function sqlite.statement:expand(bool)
  if bool == false then
    self._state = nil
  else
    self._state = 'expand'
  end
  return self
end

function sqlite.statement:raw(bool)
  if bool == false then
    self._state = nil
  else
    self._state = 'raw'
  end
  return self
end

function sqlite.statement:run(...)
  self:bind(...)
  return exports[GetCurrentResourceName()].run(self.source, self._binds, self._state)
end

function sqlite.statement:all(...)
  self:bind(...)
  return exports[GetCurrentResourceName()].all(self.source, self._binds, self._state)
end

function sqlite.statement:get(...)
  self:bind(...)
  return exports[GetCurrentResourceName()].get(self.source, self._binds, self._state)
end

function sqlite.statement:columns(...)
  self:bind(...)
  return exports[GetCurrentResourceName()].columns(self.source, self._binds, self._state)
end

function sqlite.statement:bind(...)
  for _, param in pairs(...) do
    table.insert(self._binds, param)
  end
  return self
end

function sqlite.statement:iterate(...)
  self:bind(...)
  local iter = 0
  return function()

    iter = iter + 1
  end
end

function sqlite.prepare(query)
  return sqlite.statement:new(query)
end

function sqlite.transaction(query, params)
  return exports[GetCurrentResourceName()].transaction(query, params)
end

function sqlite.transaction.deferred(query, params)
  return exports[GetCurrentResourceName()].transaction_deferred(query, params)
end

function sqlite.transaction.immediate(query, params)
  return exports[GetCurrentResourceName()].transaction_immediate(query, params)
end

function sqlite.transaction.exclusive(query, params)
  return exports[GetCurrentResourceName()].transaction_exclusive(query, params)
end

function sqlite.exec(query)
  return exports[GetCurrentResourceName()].execute(query)
end

function sqlite.pragma(query, simple)
  return exports[GetCurrentResourceName()].pragma(query, simple)
end

function sqlite.backup(path, cb)
  return exports[GetCurrentResourceName()].backup(path, cb)
end

function sqlite.backup:sync(path)
  local result
  local success = false
  exports[GetCurrentResourceName()].backup(path, function(r)
    result = r
    success = true
  end)
  while success == false do
    Citizen.Wait(0)
  end
  return result
end

function sqlite.action(path, cb)
  return exports[GetCurrentResourceName()]['function'](path, cb)
end