import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LibraryService } from '../src/services/lib.service.js';
import { Book } from '../src/models/Book.js';
import axios from 'axios';
import mongoose from 'mongoose';

vi.mock('../src/models/Book.js');
vi.mock('axios');
vi.mock('../src/middleware/tenant.js', () => ({
  getTenantId: vi.fn().mockReturnValue('tenant123')
}));

describe('LibraryService', () => {
  let libService: LibraryService;

  beforeEach(() => {
    libService = new LibraryService();
    vi.clearAllMocks();
  });

  describe('ISBN lookup', () => {
    it('should fetch book metadata from Open Library API', async () => {
      const isbn = '9780140328721';
      const mockData = {
        [`ISBN:${isbn}`]: {
          title: 'Fantastic Mr. Fox',
          authors: [{ name: 'Roald Dahl' }],
          publishers: [{ name: 'Puffin' }],
          publish_date: '1988',
          subjects: [{ name: 'Children\'s fiction' }]
        }
      };

      (axios.get as any).mockResolvedValue({ data: mockData });

      const result = await libService.getBookMetadataByISBN(isbn);

      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining(isbn));
      expect(result).toEqual({
        title: 'Fantastic Mr. Fox',
        authors: ['Roald Dahl'],
        isbn: isbn,
        publisher: 'Puffin',
        year: 1988,
        category: 'Children\'s fiction'
      });
    });

    it('should return null if book not found', async () => {
      const isbn = '1234567890';
      (axios.get as any).mockResolvedValue({ data: {} });

      const result = await libService.getBookMetadataByISBN(isbn);

      expect(result).toBeNull();
    });
  });

  describe('addBook', () => {
    it('should create a new book with availableCopies equal to totalCopies', async () => {
      const bookData = {
        title: 'Test Book',
        authors: ['Author A'],
        isbn: 'ISBN123',
        category: 'General',
        publisher: 'Pub',
        year: 2021,
        totalCopies: 5,
        location: 'A1'
      };

      const mockBook = { 
        ...bookData, 
        availableCopies: 5, 
        save: vi.fn().mockResolvedValue({ ...bookData, availableCopies: 5 }) 
      };
      
      vi.mocked(Book).mockImplementation(function () {
        return mockBook as any;
      });

      const result = await libService.addBook(bookData as any);

      expect(Book).toHaveBeenCalledWith({
        ...bookData,
        availableCopies: 5
      });
      expect(mockBook.save).toHaveBeenCalled();
      expect(result.availableCopies).toBe(5);
    });
  });

  describe('searchBooks', () => {
    it('should search books using text index', async () => {
      const keywords = 'Fantastic';
      const mockFind = {
        sort: vi.fn().mockResolvedValue([{ title: 'Fantastic Mr. Fox' }])
      };
      (Book.find as any).mockReturnValue(mockFind);

      const result = await libService.searchBooks(keywords);

      expect(Book.find).toHaveBeenCalledWith(
        { $text: { $search: keywords } },
        { score: { $meta: 'textScore' } }
      );
      expect(result).toHaveLength(1);
    });
  });
});
