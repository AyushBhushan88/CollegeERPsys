import axios from 'axios';
import { Book, IBook } from '../models/Book.js';
import { Circulation, CirculationStatus } from '../models/Circulation.js';
import { Reservation, ReservationStatus } from '../models/Reservation.js';

const DAILY_FINE_RATE = 10; // Default fine per day overdue

export class LibraryService {
  /**
   * Fetch book metadata from Open Library API by ISBN
   */
  async getBookMetadataByISBN(isbn: string) {
    const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;
    try {
      const response = await axios.get(url);
      const data = response.data[`ISBN:${isbn}`];
      
      if (!data) {
        return null;
      }

      return {
        title: data.title,
        authors: data.authors?.map((a: any) => a.name) || [],
        isbn: isbn,
        publisher: data.publishers?.[0]?.name || 'Unknown',
        year: data.publish_date ? parseInt(data.publish_date.match(/\d{4}/)?.[0] || '0') : 0,
        category: data.subjects?.[0]?.name || 'General'
      };
    } catch (error) {
      console.error('Error fetching ISBN metadata:', error);
      throw new Error('Failed to fetch book metadata');
    }
  }

  /**
   * Add a new book to the catalog
   */
  async addBook(bookData: Partial<IBook>) {
    const book = new Book({
      ...bookData,
      availableCopies: bookData.totalCopies
    });
    return await book.save();
  }

  /**
   * Search books using text index
   */
  async searchBooks(keywords: string) {
    return await Book.find(
      { $text: { $search: keywords } },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } });
  }

  /**
   * Get all books with optional filtering
   */
  async getBooks(filter: any = {}) {
    return await Book.find(filter);
  }

  /**
   * Get a book by ID
   */
  async getBookById(id: string) {
    return await Book.findById(id);
  }

  /**
   * Update book details
   */
  async updateBook(id: string, updateData: Partial<IBook>) {
    return await Book.findByIdAndUpdate(id, updateData, { new: true });
  }

  /**
   * Delete a book
   */
  async deleteBook(id: string) {
    return await Book.findByIdAndDelete(id);
  }

  /**
   * Issue a book to a user
   */
  async issueBook(bookId: string, userId: string, dueDate: Date) {
    const book = await Book.findById(bookId);
    if (!book) throw new Error('Book not found');
    if (book.availableCopies <= 0) throw new Error('Book out of stock');

    const circulation = new Circulation({
      bookId,
      userId,
      dueDate,
      status: CirculationStatus.ISSUED
    });

    await circulation.save();

    book.availableCopies -= 1;
    await book.save();

    return circulation;
  }

  /**
   * Return an issued book
   */
  async returnBook(circulationId: string) {
    const circulation = await Circulation.findById(circulationId);
    if (!circulation) throw new Error('Circulation record not found');
    if (circulation.status === CirculationStatus.RETURNED) {
      throw new Error('Book already returned');
    }

    const now = new Date();
    circulation.returnDate = now;
    circulation.status = CirculationStatus.RETURNED;

    // Calculate fine
    if (now > circulation.dueDate) {
      const diffTime = Math.abs(now.getTime() - circulation.dueDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      circulation.fineAmount = diffDays * DAILY_FINE_RATE;
    }

    await circulation.save();

    const book = await Book.findById(circulation.bookId);
    if (book) {
      book.availableCopies += 1;
      await book.save();
      await this.processNextReservation(book._id.toString());
    }

    return circulation;
  }

  /**
   * Reserve a book
   */
  async reserveBook(bookId: string, userId: string) {
    const reservation = new Reservation({
      bookId,
      userId,
      status: ReservationStatus.PENDING
    });
    return await reservation.save();
  }

  /**
   * Process the next pending reservation for a book
   */
  async processNextReservation(bookId: string) {
    const nextReservation = await Reservation.findOne({
      bookId,
      status: ReservationStatus.PENDING
    }).sort({ createdAt: 1 });

    if (nextReservation) {
      // Logic could be to notify the user or auto-issue if needed
      // For now, we just keep it as Pending but we know it's "next"
      // In a real system, we might hold the book for them
    }
  }

  /**
   * Background job: Update fines for overdue books
   */
  async updateFines() {
    const now = new Date();
    const overdueCirculations = await Circulation.find({
      status: { $in: [CirculationStatus.ISSUED, CirculationStatus.OVERDUE] },
      dueDate: { $lt: now }
    });

    for (const circulation of overdueCirculations) {
      const diffTime = Math.abs(now.getTime() - circulation.dueDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      circulation.fineAmount = diffDays * DAILY_FINE_RATE;
      circulation.status = CirculationStatus.OVERDUE;
      await circulation.save();
    }
  }
}

export const libService = new LibraryService();
