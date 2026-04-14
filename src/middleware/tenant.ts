import { AsyncLocalStorage } from 'async_hooks';
import type { FastifyRequest, FastifyReply, DoneFuncWithErrOrRes } from 'fastify';

export interface TenantContext {
  tenantId?: string;
}

export const tenantStorage = new AsyncLocalStorage<TenantContext>();

export const tenantMiddleware = (
  request: FastifyRequest,
  reply: FastifyReply,
  done: DoneFuncWithErrOrRes
) => {
  const tenantId = request.headers['x-tenant-id'] as string;
  
  tenantStorage.run({ tenantId }, () => {
    // Calling done() inside run ensures that all subsequent hooks and handlers
    // within this request remain inside the AsyncLocalStorage context.
    done();
  });
};

export const getTenantId = (): string | undefined => {
  return tenantStorage.getStore()?.tenantId;
};
