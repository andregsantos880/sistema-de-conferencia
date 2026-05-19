import { http, delay } from 'msw';
import { ok, fail } from '@/mocks/utils/apiResponse';
import { api } from '@/mocks/utils/apiPath';
import { minutesAgo, hoursAgo, daysAgo } from '@/mocks/utils/demoDate';
import type {
  Conversation,
  ChatMessage,
  Contact,
  SendMessageDto,
  MessagesResponse,
  Attachment,
} from '../../domain/models/Chat';

// In-memory storage with relative dates
// Conversations and messages are distributed across recent time periods
const conversations: Conversation[] = [
  {
    id: '1',
    title: 'Alice Johnson',
    avatar: 'https://i.pravatar.cc/150?img=1',
    unread: 3,
    lastAt: minutesAgo(5),
    lastMessage: "I'll test the drag-and-drop feature right now.",
    online: true,
  },
  {
    id: '2',
    title: 'Bob Smith',
    avatar: 'https://i.pravatar.cc/150?img=2',
    unread: 0,
    lastAt: minutesAgo(30),
    lastMessage: 'See you tomorrow!',
    online: false,
  },
  {
    id: '3',
    title: 'Carol Williams',
    avatar: 'https://i.pravatar.cc/150?img=3',
    unread: 1,
    lastAt: hoursAgo(2),
    lastMessage: 'Can you send me the source files?',
    online: true,
    favorite: true,
  },
  {
    id: '4',
    title: 'David Brown',
    avatar: 'https://i.pravatar.cc/150?img=4',
    unread: 0,
    lastAt: minutesAgo(100),
    lastMessage: 'Talk to you later then.',
    online: false,
  },
  {
    id: '5',
    title: 'Emma Davis',
    avatar: 'https://i.pravatar.cc/150?img=5',
    unread: 5,
    lastAt: daysAgo(2),
    lastMessage: 'Did you see my message?',
    online: true,
  },
  {
    id: '6',
    title: 'Frank Miller',
    avatar: 'https://i.pravatar.cc/150?img=6',
    unread: 0,
    lastAt: daysAgo(3),
    lastMessage: 'The project looks great overall!',
    online: false,
  },
  {
    id: '7',
    title: 'Grace Lee',
    avatar: 'https://i.pravatar.cc/150?img=7',
    unread: 0,
    lastAt: daysAgo(5),
    lastMessage: 'No messages yet',
    online: true,
    favorite: true,
  },
];

const messageStore: Record<string, ChatMessage[]> = {
  '1': [
    {
      id: 'm1',
      convId: '1',
      fromMe: false,
      text: 'Hey! Welcome to the new Chat experience. 🚀\n\nYou can now send high-quality images, documents, and even voice notes!',
      at: minutesAgo(15),
      status: 'read',
    },
    {
      id: 'm-showcase-1',
      convId: '1',
      fromMe: false,
      text: 'Check out this office layout I just received:',
      attachments: [
        {
          id: 'att-showcase-img',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
          name: 'Modern_Office.jpg'
        }
      ],
      at: minutesAgo(14),
      status: 'read',
    },
    {
      id: 'm-showcase-2',
      convId: '1',
      fromMe: false,
      text: 'And here is a quick voice briefing for the team:',
      attachments: [
        {
          id: 'att-showcase-voice',
          type: 'voice',
          url: '#',
          name: 'Voice Briefing'
        }
      ],
      at: minutesAgo(13),
      status: 'read',
    },
    {
      id: 'm1-reply',
      convId: '1',
      fromMe: true,
      text: "This looks impressive! I love how the waveforms are rendered.",
      at: minutesAgo(10),
      status: 'read',
    },
    {
      id: 'm1-extra',
      convId: '1',
      fromMe: false,
      text: "Glad you like it! We worked hard on the performance too.",
      at: minutesAgo(8),
      status: 'read',
    },
    {
      id: 'm2',
      convId: '1',
      fromMe: true,
      text: "Wow! The interface looks incredibly smooth. I'll test the drag-and-drop feature right now.",
      at: minutesAgo(5),
      status: 'read',
    },
  ],
  '2': [
    {
      id: 'm2-1',
      convId: '2',
      fromMe: false,
      text: 'Hey Bob, did you finish the API documentation?',
      at: hoursAgo(1),
      status: 'read',
    },
    {
      id: 'm2-2',
      convId: '2',
      fromMe: true,
      text: "Almost there. Just need to review the authentication section.",
      at: minutesAgo(50),
      status: 'read',
    },
    {
      id: 'm2-3',
      convId: '2',
      fromMe: false,
      text: "Great! Let me know if you need any help with that.",
      at: minutesAgo(45),
      status: 'read',
    },
    {
      id: 'm2-4',
      convId: '2',
      fromMe: true,
      text: "Actually, can you check the JWT implementation one more time?",
      at: minutesAgo(40),
      status: 'read',
    },
    {
      id: 'm4',
      convId: '2',
      fromMe: true,
      text: 'See you tomorrow!',
      at: minutesAgo(30),
      status: 'delivered',
    },
  ],
  '3': [
    {
      id: 'm3-1',
      convId: '3',
      fromMe: true,
      text: 'Hi Carol, I saw the new designs. They look fantastic!',
      at: hoursAgo(5),
      status: 'read',
    },
    {
      id: 'm3-2',
      convId: '3',
      fromMe: false,
      text: "Thanks! I'm glad you liked the color palette.",
      at: hoursAgo(4),
      status: 'read',
    },
    {
      id: 'm3-3',
      convId: '3',
      fromMe: true,
      text: "The transition animations are very smooth too.",
      at: hoursAgo(3.5),
      status: 'read',
    },
    {
      id: 'm3-4',
      convId: '3',
      fromMe: false,
      text: "I spent a lot of time polishing those. It makes a big difference.",
      at: hoursAgo(3),
      status: 'read',
    },
    {
      id: 'm5',
      convId: '3',
      fromMe: false,
      text: 'Can you send me the source files?',
      at: hoursAgo(2),
      status: 'read',
    },
  ],
  '4': [
    {
      id: 'm4-1',
      convId: '4',
      fromMe: true,
      text: 'Hey David, how is the project going?',
      at: daysAgo(1.5),
      status: 'read',
    },
    {
      id: 'm4-2',
      convId: '4',
      fromMe: false,
      text: "We are on track. The main features are already implemented.",
      at: daysAgo(1.4),
      status: 'read',
    },
    {
      id: 'm6',
      convId: '4',
      fromMe: false,
      text: 'Thanks for your help with the deployment!',
      at: daysAgo(1),
      status: 'read',
    },
    {
      id: 'm7',
      convId: '4',
      fromMe: true,
      text: 'No problem, happy to help!',
      at: minutesAgo(120),
      status: 'read',
    },
    {
      id: 'm4-5',
      convId: '4',
      fromMe: false,
      text: "Talk to you later then.",
      at: minutesAgo(100),
      status: 'read',
    },
  ],
  '5': [
    {
      id: 'm5-1',
      convId: '5',
      fromMe: true,
      text: 'Hi Emma, are we still meeting at 3?',
      at: daysAgo(2.1),
      status: 'read',
    },
    {
      id: 'm5-2',
      convId: '5',
      fromMe: false,
      text: "Yes, I'll be there. Just wrapping up some research.",
      at: daysAgo(2.05),
      status: 'read',
    },
    {
      id: 'm5-3',
      convId: '5',
      fromMe: true,
      text: "Perfect. I have some interesting findings to share as well.",
      at: daysAgo(2.02),
      status: 'read',
    },
    {
      id: 'm5-4',
      convId: '5',
      fromMe: false,
      text: "Can't wait to hear them!",
      at: daysAgo(2.01),
      status: 'read',
    },
    {
      id: 'm8',
      convId: '5',
      fromMe: false,
      text: 'Did you see my message?',
      at: daysAgo(2),
      status: 'read',
    },
  ],
  '6': [
    {
      id: 'm6-1',
      convId: '6',
      fromMe: true,
      text: 'Frank, the new dashboard is ready for testing.',
      at: daysAgo(3.5),
      status: 'read',
    },
    {
      id: 'm6-2',
      convId: '6',
      fromMe: false,
      text: "Excellent. I'll start the QA process tomorrow morning.",
      at: daysAgo(3.4),
      status: 'read',
    },
    {
      id: 'm6-3',
      convId: '6',
      fromMe: true,
      text: "I've included the feedback you gave last week.",
      at: daysAgo(3.3),
      status: 'read',
    },
    {
      id: 'm6-4',
      convId: '6',
      fromMe: false,
      text: "That's great. It was the most critical part for our users.",
      at: daysAgo(3.2),
      status: 'read',
    },
    {
      id: 'm6-5',
      convId: '6',
      fromMe: false,
      text: 'The project looks great overall!',
      at: daysAgo(3),
      status: 'read',
    },
  ],
};

const contacts: Record<string, Contact> = {
  '1': {
    id: '1',
    name: 'Alice Johnson',
    avatar: 'https://i.pravatar.cc/150?img=1',
    phone: '+1 (555) 123-4567',
    email: 'alice.johnson@example.com',
    about: 'Product Designer at TechCorp. Love creating beautiful interfaces!',
    online: true,
    media: [
      {
        id: 'media1',
        type: 'image',
        url: 'https://picsum.photos/400/300?random=1',
        thumbnail: 'https://picsum.photos/200/150?random=1',
        date: daysAgo(3),  // 3 days ago
      },
      {
        id: 'media2',
        type: 'image',
        url: 'https://picsum.photos/400/300?random=2',
        thumbnail: 'https://picsum.photos/200/150?random=2',
        date: daysAgo(5),  // 5 days ago
      },
    ],
  },
  '2': {
    id: '2',
    name: 'Bob Smith',
    avatar: 'https://i.pravatar.cc/150?img=2',
    phone: '+1 (555) 234-5678',
    email: 'bob.smith@example.com',
    about: 'Software Engineer. Coffee enthusiast ☕',
    online: false,
    media: [],
  },
  '3': {
    id: '3',
    name: 'Carol Williams',
    avatar: 'https://i.pravatar.cc/150?img=3',
    phone: '+1 (555) 345-6789',
    email: 'carol.williams@example.com',
    about: 'Marketing Manager. Always exploring new ideas!',
    online: true,
    media: [],
  },
  '4': {
    id: '4',
    name: 'David Brown',
    avatar: 'https://i.pravatar.cc/150?img=4',
    phone: '+1 (555) 456-7890',
    email: 'david.brown@example.com',
    about: 'Project Manager. Building great products!',
    online: false,
    media: [],
  },
  '5': {
    id: '5',
    name: 'Emma Davis',
    avatar: 'https://i.pravatar.cc/150?img=5',
    phone: '+1 (555) 567-8901',
    email: 'emma.davis@example.com',
    about: 'UX Researcher. Understanding user needs.',
    online: true,
    media: [],
  },
};

interface BotReply {
  text?: string;
  attachments?: Attachment[];
}

// Advanced Bot Response Matrix
const botResponses: BotReply[] = [
  { text: "That's interesting! Tell me more." },
  { text: "I see what you mean." },
  { text: "Awesome! Check this out...", attachments: [{
    id: `att-${Date.now()}-img`,
    type: 'image',
    url: 'https://picsum.photos/400/300?random=10',
    name: 'Office_Layout.jpg'
  }]},
  { text: "I've drafted the document you requested.", attachments: [{
    id: `att-${Date.now()}-file`,
    type: 'file',
    url: '#',
    name: 'Project_Proposal_v2.pdf',
    size: 245760
  }]},
  { attachments: [{
    id: `att-${Date.now()}-voice`,
    type: 'voice',
    url: '#',
    name: 'Voice Memo'
  }]},
  { text: "Check this link for more details: https://docs.5studios.net/katalyst/" },
  { text: "I appreciate you letting me know." },
  { text: "That makes sense!" },
  { text: "Awesome! 🎉" },
];

function getRandomBotResponse(): BotReply {
  return botResponses[Math.floor(Math.random() * botResponses.length)];
}

export const chatHandlers = [
  // GET chat/conversations
  http.get(api('/chat/conversations'), async ({ request }) => {
    await delay(200);

    const url = new URL(request.url);
    const q = url.searchParams.get('q')?.toLowerCase();
    const filter = url.searchParams.get('filter');

    let filtered = [...conversations];

    // Search filter
    if (q) {
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.lastMessage?.toLowerCase().includes(q)
      );
    }

    // Type filter
    if (filter === 'unread') {
      filtered = filtered.filter((c) => c.unread > 0);
    } else if (filter === 'favorites') {
      filtered = filtered.filter((c) => c.favorite);
    }

    // Sort by lastAt desc
    filtered.sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime());

    return ok(filtered);
  }),

  // GET chat/messages
  http.get(api('/chat/messages'), async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const convId = url.searchParams.get('convId');
    const cursor = url.searchParams.get('cursor');
    const limit = parseInt(url.searchParams.get('limit') || '30');

    if (!convId) {
      return fail('VALIDATION_ERROR', 'convId required', 400);
    }

    const messages = messageStore[convId] || [];
    
    // Simple pagination (in real app, use cursor properly)
    const startIndex = cursor ? parseInt(cursor) : 0;
    const endIndex = startIndex + limit;
    const paginatedMessages = messages.slice(startIndex, endIndex);
    const hasMore = endIndex < messages.length;

    const response: MessagesResponse = {
      messages: paginatedMessages,
      nextCursor: hasMore ? endIndex.toString() : undefined,
      hasMore,
    };

    return ok(response);
  }),

  // POST chat/messages
  http.post(api('/chat/messages'), async ({ request }) => {
    await delay(300);

    const dto = (await request.json()) as SendMessageDto;
    const { convId, text, attachments } = dto;

    // Create user message
    const userMessage: ChatMessage = {
      id: `m${Date.now()}`,
      convId,
      fromMe: true,
      text,
      attachments,
      at: new Date().toISOString(),
      status: 'sent',
    };

    // Add to message store
    if (!messageStore[convId]) {
      messageStore[convId] = [];
    }
    messageStore[convId].push(userMessage);

    // Update conversation
    const conv = conversations.find((c) => c.id === convId);
    if (conv) {
      conv.lastAt = userMessage.at;
      conv.lastMessage = text;
      conv.unread = 0; // Clear unread when user sends
    }

    // --- Realistic WhatsApp Simulation Sequence ---
    
    // 1. Immediate: Delivered status (Network transmission)
    setTimeout(() => {
      userMessage.status = 'delivered';
    }, 800);

    // 2. Short Delay: Read status (Recipient "opens" the app)
    setTimeout(() => {
      userMessage.status = 'read';
    }, 1500);

    // 3. Typing Sequence: Recipient "starts" writing
    setTimeout(() => {
      if (conv) {
        conv.typing = true;
      }
    }, 1800);

    // 4. Final: Bot echo response arrives
    setTimeout(() => {
      const reply = getRandomBotResponse();
      const botMessage: ChatMessage = {
        id: `m${Date.now()}-bot`,
        convId,
        fromMe: false,
        text: reply.text || "",
        attachments: reply.attachments,
        at: new Date().toISOString(),
        status: 'read',
      };

      messageStore[convId].push(botMessage);

      // Update conversation
      if (conv) {
        conv.lastAt = botMessage.at;
        conv.lastMessage = botMessage.text || (botMessage.attachments?.[0].type === 'voice' ? 'Voice Message' : 'Attachment');
        conv.unread = conv.unread + 1;
        conv.typing = false; // Stop typing indicator
      }
    }, 4500); // 4.5s total delay for a realistic human-like response

    return ok(userMessage, 201);
  }),

  // GET chat/contact
  http.get(api('/chat/contact'), async ({ request }) => {
    await delay(200);

    const url = new URL(request.url);
    const convId = url.searchParams.get('convId');

    if (!convId) {
      return fail('VALIDATION_ERROR', 'convId required', 400);
    }

    const contact = contacts[convId];
    if (!contact) {
      return fail('CHAT_CONTACT_NOT_FOUND', 'Contact not found', 404);
    }

    return ok(contact);
  }),

  // POST chat/mark-read
  http.post(api('/chat/mark-read'), async ({ request }) => {
    await delay(100);

    const { convId } = (await request.json()) as { convId: string };
    const conv = conversations.find((c) => c.id === convId);
    
    if (conv) {
      conv.unread = 0;
    }

    return ok(null, 204);
  }),
];
