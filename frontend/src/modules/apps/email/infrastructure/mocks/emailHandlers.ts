import { http, delay } from 'msw';
import { ok, fail } from '@/mocks/utils/apiResponse';
import { api } from '@/mocks/utils/apiPath';
import { minutesAgo, hoursAgo, daysAgo } from '@/mocks/utils/demoDate';
import type {
  Mail,
  MailFolder,
  MailLabel,
  MailListResponse,
  UpdateMailDto,
  ComposeDraftDto,
  SendReplyDto,
  MailTray,
} from '../../domain/models/Email';

// Sample email data with relative dates
// Emails are distributed across recent time periods to always show relevant data
const emails: Mail[] = [
  // Recent emails (today)
  {
    id: '1',
    tray: 'inbox',
    from: { name: 'Sarah Chen', email: 'sarah.chen@company.com' },
    to: [{ name: 'Me', email: 'me@example.com' }],
    subject: 'Q4 Marketing Strategy Review',
    snippet: 'Hi team, I wanted to share the updated marketing strategy for Q4. Please review the attached deck and...',
    body: `Hi team,

I wanted to share the updated **marketing strategy for Q4**. Please review the attached deck and provide your feedback by EOD Friday.

### Key highlights:
- 30% increase in digital ad spend
- New influencer partnerships
- Expanded social media presence

Let me know if you have any questions!

Best,
Sarah`,
    dateISO: minutesAgo(30),  // 30 minutes ago
    read: false,
    starred: false,
    labels: ['Work'],
    attachments: [
      { id: 'att1', name: 'Q4-Strategy.pdf', sizeBytes: 2456789, type: 'application/pdf' },
    ],
  },
  {
    id: '2',
    tray: 'inbox',
    from: { name: 'John Smith', email: 'john@client.com' },
    to: [{ name: 'Me', email: 'me@example.com' }],
    cc: [{ name: 'Team', email: 'team@example.com' }],
    subject: 'Project Timeline Update',
    snippet: 'Quick update on the project timeline. We need to push the deadline by one week due to...',
    body: `Quick update on the **project timeline**. We need to push the deadline by *one week* due to some technical challenges.

New deadline: **Next Friday**

Thanks for understanding!`,
    dateISO: hoursAgo(2),  // 2 hours ago
    read: false,
    starred: true,
    labels: ['Clients', 'Important'],
  },
  {
    id: '3',
    tray: 'inbox',
    from: { name: 'LinkedIn', email: 'noreply@linkedin.com' },
    to: [{ name: 'Me', email: 'me@example.com' }],
    subject: 'You have 5 new connection requests',
    snippet: 'People are checking out your profile! You have 5 new connection requests waiting...',
    body: 'People are checking out your profile! You have 5 new connection requests waiting for your response.',
    dateISO: hoursAgo(5),  // 5 hours ago
    read: true,
    starred: false,
    labels: [],
  },
  // Yesterday's emails
  {
    id: '4',
    tray: 'inbox',
    from: { name: 'Emma Davis', email: 'emma@company.com' },
    to: [{ name: 'Me', email: 'me@example.com' }],
    subject: 'Team Lunch Tomorrow',
    snippet: "Hey! Don't forget about our team lunch tomorrow at 12:30 PM. We're meeting at...",
    body: `Hey!

Don't forget about our team lunch tomorrow at 12:30 PM. We're meeting at the Italian place downtown.

See you there!
Emma`,
    dateISO: daysAgo(1),  // Yesterday
    read: true,
    starred: false,
    labels: ['Work'],
  },
  // Older emails
  {
    id: '5',
    tray: 'starred',
    from: { name: 'Boss', email: 'boss@company.com' },
    to: [{ name: 'Me', email: 'me@example.com' }],
    subject: 'Performance Review Scheduled',
    snippet: 'Your annual performance review has been scheduled for next Monday at 2 PM...',
    body: 'Your annual performance review has been scheduled for next Monday at 2 PM. Please prepare your self-assessment.',
    dateISO: daysAgo(2),  // 2 days ago
    read: true,
    starred: true,
    labels: ['Important'],
  },
  {
    id: '6',
    tray: 'sent',
    from: { name: 'Me', email: 'me@example.com' },
    to: [{ name: 'Client', email: 'client@company.com' }],
    subject: 'Re: Proposal Feedback',
    snippet: 'Thank you for your feedback on the proposal. I have made the requested changes...',
    body: 'Thank you for your feedback on the proposal. I have made the requested changes and attached the updated version.',
    dateISO: daysAgo(3),  // 3 days ago
    read: true,
    starred: false,
    labels: ['Clients'],
  },
  // Additional older emails for pagination
  {
    id: '7',
    tray: 'inbox',
    from: { name: 'HR Department', email: 'hr@company.com' },
    to: [{ name: 'Me', email: 'me@example.com' }],
    subject: 'Updated Company Policies',
    snippet: 'Please review the updated company policies document attached. Key changes include...',
    body: 'Please review the updated company policies document attached. Key changes include remote work guidelines and expense reporting procedures.',
    dateISO: daysAgo(5),  // 5 days ago
    read: true,
    starred: false,
    labels: ['Work'],
  },
  {
    id: '8',
    tray: 'inbox',
    from: { name: 'Newsletter', email: 'newsletter@techweekly.com' },
    to: [{ name: 'Me', email: 'me@example.com' }],
    subject: 'This Week in Tech: AI Updates',
    snippet: 'The latest developments in AI, cloud computing, and more...',
    body: 'The latest developments in AI, cloud computing, and more. Read our weekly roundup of the most important tech news.',
    dateISO: daysAgo(7),  // 1 week ago
    read: true,
    starred: false,
    labels: [],
  },
  {
    id: '9',
    tray: 'inbox',
    from: { name: 'Mike Johnson', email: 'mike@partner.com' },
    to: [{ name: 'Me', email: 'me@example.com' }],
    subject: 'Partnership Opportunity',
    snippet: 'I wanted to reach out about a potential partnership between our companies...',
    body: 'I wanted to reach out about a potential partnership between our companies. Would you be available for a call next week to discuss?',
    dateISO: daysAgo(10),  // 10 days ago
    read: true,
    starred: true,
    labels: ['Clients', 'Important'],
  },
  {
    id: '10',
    tray: 'sent',
    from: { name: 'Me', email: 'me@example.com' },
    to: [{ name: 'Team', email: 'team@company.com' }],
    subject: 'Weekly Status Update',
    snippet: 'Here is my weekly status update. Completed tasks include...',
    body: 'Here is my weekly status update. Completed tasks include the dashboard redesign and API integration. Next week I will focus on testing.',
    dateISO: daysAgo(14),  // 2 weeks ago
    read: true,
    starred: false,
    labels: ['Work'],
  },
];

const labels: MailLabel[] = [
  { id: 'work', name: 'Work', color: 'blue', count: 2 },
  { id: 'clients', name: 'Clients', color: 'green', count: 2 },
  { id: 'important', name: 'Important', color: 'red', count: 2 },
  { id: 'family', name: 'Family', color: 'purple', count: 0 },
];

function calculateFolderCounts(): MailFolder[] {
  const trays: MailTray[] = ['inbox', 'starred', 'drafts', 'sent', 'trash', 'archive'];
  
  return trays.map((tray) => {
    let messages = [];
    if (tray === 'starred') {
      messages = emails.filter((e) => e.starred && e.tray !== 'trash');
    } else {
      messages = emails.filter((e) => e.tray === tray);
    }
    const unreadCount = messages.filter((e) => !e.read).length;
    
    return {
      id: tray,
      name: tray.charAt(0).toUpperCase() + tray.slice(1),
      icon: tray,
      unreadCount,
      totalCount: messages.length,
    };
  });
}

export const emailHandlers = [
  // GET mail/folders
  http.get(api('/mail/folders'), async () => {
    await delay(200);
    return ok(calculateFolderCounts());
  }),

  // GET mail/labels
  http.get(api('/mail/labels'), async () => {
    await delay(150);
    return ok(labels);
  }),

  // GET mail/messages
  http.get(api('/mail/messages'), async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const tray = url.searchParams.get('tray') as MailTray;
    const q = url.searchParams.get('q')?.toLowerCase();
    const filter = url.searchParams.get('filter');
    const cursor = url.searchParams.get('cursor');
    const limit = parseInt(url.searchParams.get('limit') || '30');

    if (!tray) {
      return fail('VALIDATION_ERROR', 'tray required', 400);
    }

    let filtered = [];
    if (tray === 'starred') {
      filtered = emails.filter((e) => e.starred && e.tray !== 'trash');
    } else {
      filtered = emails.filter((e) => e.tray === tray);
    }

    // Search filter
    if (q) {
      filtered = filtered.filter(
        (e) =>
          e.subject.toLowerCase().includes(q) ||
          e.from.name.toLowerCase().includes(q) ||
          e.from.email.toLowerCase().includes(q) ||
          e.snippet.toLowerCase().includes(q)
      );
    }

    // Type filters
    if (filter === 'unread') {
      filtered = filtered.filter((e) => !e.read);
    } else if (filter === 'starred') {
      filtered = filtered.filter((e) => e.starred);
    } else if (filter === 'attachments') {
      filtered = filtered.filter((e) => e.attachments && e.attachments.length > 0);
    }

    // Sort by date desc
    filtered.sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime());

    // Pagination
    const startIndex = cursor ? parseInt(cursor) : 0;
    const endIndex = startIndex + limit;
    const paginatedMessages = filtered.slice(startIndex, endIndex);
    const hasMore = endIndex < filtered.length;

    const response: MailListResponse = {
      messages: paginatedMessages,
      nextCursor: hasMore ? endIndex.toString() : undefined,
      hasMore,
    };

    return ok(response);
  }),

  // GET mail/messages/:id
  http.get(api('/mail/messages/:id'), async ({ params }) => {
    await delay(200);

    const { id } = params;
    const message = emails.find((e) => e.id === id);

    if (!message) {
      return fail('EMAIL_MESSAGE_NOT_FOUND', 'Message not found', 404);
    }

    return ok(message);
  }),

  // PATCH mail/messages/:id
  http.patch(api('/mail/messages/:id'), async ({ params, request }) => {
    await delay(150);

    const { id } = params;
    const dto = (await request.json()) as UpdateMailDto;
    const message = emails.find((e) => e.id === id);

    if (!message) {
      return fail('EMAIL_MESSAGE_NOT_FOUND', 'Message not found', 404);
    }

    // Update message
    if (dto.read !== undefined) message.read = dto.read;
    if (dto.starred !== undefined) message.starred = dto.starred;
    if (dto.tray) message.tray = dto.tray;
    if (dto.labels) message.labels = dto.labels;

    return ok(message);
  }),

  // POST mail/messages (save draft)
  http.post(api('/mail/messages'), async ({ request }) => {
    await delay(200);

    const dto = (await request.json()) as ComposeDraftDto;

    const draft: Mail = {
      id: `draft-${Date.now()}`,
      tray: 'drafts',
      from: { name: 'Me', email: 'me@example.com' },
      to: dto.to,
      cc: dto.cc,
      bcc: dto.bcc,
      subject: dto.subject,
      snippet: dto.body.substring(0, 100),
      body: dto.body,
      dateISO: new Date().toISOString(),
      read: true,
      starred: false,
      labels: [],
      attachments: dto.attachments,
    };

    emails.push(draft);

    return ok(draft, 201);
  }),

  // POST mail/messages/:id/reply (send reply)
  http.post(api('/mail/messages/:id/reply'), async ({ params, request }) => {
    await delay(300);

    const { id } = params;
    const dto = (await request.json()) as SendReplyDto;
    const originalMessage = emails.find((e) => e.id === id);

    if (!originalMessage) {
      return fail('EMAIL_MESSAGE_NOT_FOUND', 'Original message not found', 404);
    }

    const reply: Mail = {
      id: `sent-${Date.now()}`,
      tray: 'sent',
      from: { name: 'Me', email: 'me@example.com' },
      to: [originalMessage.from],
      subject: `Re: ${originalMessage.subject}`,
      snippet: dto.body.substring(0, 100),
      body: dto.body,
      dateISO: new Date().toISOString(),
      read: true,
      starred: false,
      labels: [],
      threadId: originalMessage.threadId || originalMessage.id,
    };

    emails.push(reply);

    return ok(reply, 201);
  }),

  // POST mail/messages/send (send new email)
  http.post(api('/mail/messages/send'), async ({ request }) => {
    await delay(500);

    const dto = (await request.json()) as ComposeDraftDto;

    const message: Mail = {
      id: `sent-${Date.now()}`,
      tray: 'sent',
      from: { name: 'Me', email: 'me@example.com' },
      to: dto.to,
      cc: dto.cc,
      bcc: dto.bcc,
      subject: dto.subject,
      snippet: dto.body.substring(0, 100),
      body: dto.body,
      dateISO: new Date().toISOString(),
      read: true,
      starred: false,
      labels: [],
      attachments: dto.attachments,
    };

    emails.push(message);

    return ok(message, 201);
  }),
];
