export class QueueService {
  static async add(id: string) {
    // Add to queue
  }

  static async remove(id: string) {
    // Remove from queue
  }

  static async setCurrent(id: string) {
    // Set current
  }

  static async getLength() {
    // Get queue length
  }

  static async getDuration() {
    // Get queue duration
  }

  static async getCurrent() {
    // Get current song
  }

  static async getCurrentType() {
    // Get current type
  }

  static async getAll() {
    // Get queue
  }

  static async isEmpty() {
    // Check if queue is empty
  }

  static async isCurrent(id: string) {
    // Check if item is current
  }

  static async has(songId: string) {
    // Check if item is in queue
  }

  static async next() {
    // Play next
  }

  static async clear() {
    // Clear queue
  }
}
