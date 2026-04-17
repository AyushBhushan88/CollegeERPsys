import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { libService } from '../services/lib.service.js';
import { checkRoles } from '../middleware/rbac.js';

export default async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {
  fastify.addHook('preHandler', fastify.auth([fastify.verifyJWT]));

  // Catalog Management
  fastify.post('/books', {
    preHandler: [checkRoles(['admin', 'librarian'])]
  }, async (request, reply) => {
    return libService.addBook(request.body as any);
  });

  fastify.get('/books', async (request, reply) => {
    const { q, ...filters } = request.query as any;
    if (q) {
      return libService.searchBooks(q);
    }
    return libService.getBooks(filters);
  });

  fastify.get('/books/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const book = await libService.getBookById(id);
    if (!book) return reply.code(404).send({ message: 'Book not found' });
    return book;
  });

  fastify.get('/books/metadata/:isbn', {
    preHandler: [checkRoles(['admin', 'librarian'])]
  }, async (request, reply) => {
    const { isbn } = request.params as { isbn: string };
    const metadata = await libService.getBookMetadataByISBN(isbn);
    if (!metadata) return reply.code(404).send({ message: 'ISBN not found' });
    return metadata;
  });

  fastify.patch('/books/:id', {
    preHandler: [checkRoles(['admin', 'librarian'])]
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    return libService.updateBook(id, request.body as any);
  });

  fastify.delete('/books/:id', {
    preHandler: [checkRoles(['admin', 'librarian'])]
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    return libService.deleteBook(id);
  });

  // Circulation
  fastify.post('/issue', {
    preHandler: [checkRoles(['admin', 'librarian'])]
  }, async (request, reply) => {
    const { bookId, userId, dueDate } = request.body as { bookId: string, userId: string, dueDate: string };
    return libService.issueBook(bookId, userId, new Date(dueDate));
  });

  fastify.post('/return/:id', {
    preHandler: [checkRoles(['admin', 'librarian'])]
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    return libService.returnBook(id);
  });

  // Reservation
  fastify.post('/reserve', async (request, reply) => {
    const { bookId } = request.body as { bookId: string };
    const user = request.user as any;
    return libService.reserveBook(bookId, user.sub);
  });
}
