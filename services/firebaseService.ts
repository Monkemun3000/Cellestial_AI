import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  orderBy, 
  where,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Chat, Message } from './chatStorage';

export class FirebaseService {
  private static readonly CHATS_COLLECTION = 'chats';
  private static readonly MESSAGES_COLLECTION = 'messages';

  // Save a chat to Firebase
  static async saveChat(chat: Chat, userId?: string): Promise<string> {
    try {
      const chatData = {
        ...chat,
        userId: userId || 'anonymous',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.CHATS_COLLECTION), chatData);
      return docRef.id;
    } catch (error) {
      console.error('Error saving chat to Firebase:', error);
      throw error;
    }
  }

  // Update a chat in Firebase
  static async updateChat(chatId: string, updates: Partial<Chat>): Promise<void> {
    try {
      const chatRef = doc(db, this.CHATS_COLLECTION, chatId);
      await updateDoc(chatRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating chat in Firebase:', error);
      throw error;
    }
  }

  // Delete a chat from Firebase
  static async deleteChat(chatId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.CHATS_COLLECTION, chatId));
    } catch (error) {
      console.error('Error deleting chat from Firebase:', error);
      throw error;
    }
  }

  // Get all chats for a user
  static async getChats(userId?: string): Promise<Chat[]> {
    try {
      const q = query(
        collection(db, this.CHATS_COLLECTION),
        where('userId', '==', userId || 'anonymous'),
        orderBy('updatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const chats: Chat[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        chats.push({
          id: doc.id,
          title: data.title,
          lastMessage: data.lastMessage,
          messages: data.messages || []
        });
      });
      
      return chats;
    } catch (error) {
      console.error('Error getting chats from Firebase:', error);
      throw error;
    }
  }

  // Get a specific chat
  static async getChat(chatId: string): Promise<Chat | null> {
    try {
      const chatRef = doc(db, this.CHATS_COLLECTION, chatId);
      const chatSnap = await getDoc(chatRef);
      
      if (chatSnap.exists()) {
        const data = chatSnap.data();
        return {
          id: chatSnap.id,
          title: data.title,
          lastMessage: data.lastMessage,
          messages: data.messages || []
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting chat from Firebase:', error);
      throw error;
    }
  }

  // Add a message to a chat
  static async addMessage(chatId: string, message: Message): Promise<void> {
    try {
      const chatRef = doc(db, this.CHATS_COLLECTION, chatId);
      const chatSnap = await getDoc(chatRef);
      
      if (chatSnap.exists()) {
        const chatData = chatSnap.data();
        const updatedMessages = [...(chatData.messages || []), message];
        
        await updateDoc(chatRef, {
          messages: updatedMessages,
          lastMessage: message.content,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error adding message to Firebase:', error);
      throw error;
    }
  }

  // Listen to real-time updates for a user's chats
  static subscribeToChats(userId: string, callback: (chats: Chat[]) => void): () => void {
    const q = query(
      collection(db, this.CHATS_COLLECTION),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const chats: Chat[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        chats.push({
          id: doc.id,
          title: data.title,
          lastMessage: data.lastMessage,
          messages: data.messages || []
        });
      });
      callback(chats);
    });
  }

  // Sync local chats to Firebase
  static async syncLocalChatsToFirebase(localChats: Chat[], userId?: string): Promise<void> {
    try {
      for (const chat of localChats) {
        // Check if chat already exists in Firebase
        const existingChat = await this.getChat(chat.id);
        if (!existingChat) {
          await this.saveChat(chat, userId);
        }
      }
    } catch (error) {
      console.error('Error syncing local chats to Firebase:', error);
      throw error;
    }
  }
}
