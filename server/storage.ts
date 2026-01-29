// This file is kept for future storage needs
// Currently, the application uses Notion as the backend storage

export interface IStorage {
  // Add storage methods as needed
}

export class MemStorage implements IStorage {
  constructor() {
    // Initialize storage as needed
  }
}

export const storage = new MemStorage();
