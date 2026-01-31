import { ApiResponse, Message, UserCredentials } from '../types';

const BASE_URL = 'https://api.mdjhs.com/';
const API_KEY = 'md_live_9d2f60d5231910dca30c81de29a3b0f3cdb9983f';

export const ApiService = {
  /**
   * Create a new temporary email account.
   */
  async createAccount(): Promise<UserCredentials> {
    const response = await fetch(`${BASE_URL}?action=create_account&key=${API_KEY}`);
    const data: ApiResponse<any> = await response.json();

    if (data.status === 'success' && data.email && data.password) {
      return {
        email: data.email,
        accessKey: data.password,
      };
    }
    throw new Error(data.message || 'Failed to create account');
  },

  /**
   * Fetch messages for a specific account.
   */
  async getMessages(creds: UserCredentials): Promise<Message[]> {
    const url = `${BASE_URL}?action=get_messages&key=${API_KEY}&email=${creds.email}&password=${creds.accessKey}`;
    const response = await fetch(url);
    const data: ApiResponse<any> = await response.json();

    if (data.status === 'success') {
      const rawMessages = data.messages || [];
      return rawMessages.map((msg: any) => ({
        id: msg.id,
        sender: msg.sender,
        subject: msg.subject,
        date: msg.date,
        timestamp: msg.timestamp || 0,
      }));
    }
    return [];
  },

  /**
   * Read the content of a specific message.
   */
  async readMessage(creds: UserCredentials, messageId: string): Promise<string> {
    const url = `${BASE_URL}?action=read_message&key=${API_KEY}&id=${messageId}&email=${creds.email}&password=${creds.accessKey}`;
    const response = await fetch(url);
    const data: ApiResponse<any> = await response.json();

    if (data.status === 'success') {
        // API structure varies sometimes, checking data.content or root content
        return data.data?.content || data.content || '<div style="padding: 20px; text-align: center; color: #666;">No content available.</div>';
    }
    throw new Error(data.message || 'Failed to load message');
  }
};
