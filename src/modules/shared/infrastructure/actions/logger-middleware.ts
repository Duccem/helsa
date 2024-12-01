import { createMiddleware } from 'next-safe-action';

export const loggerMiddleware = createMiddleware().define(async ({ next, clientInput, metadata }) => {
  console.log('LOGGING MIDDLEWARE');

  const startTime = performance.now();

  // Here we await the action execution.
  const result = await next();

  const endTime = performance.now();

  console.log(
    `Executed action ${metadata.actionName} with input ${JSON.stringify(clientInput)} and got result ${
      result.success ? 'success' : 'failure'
    } in ${endTime - startTime}ms`
  );

  // And then return the result of the awaited action.
  return result;
});
