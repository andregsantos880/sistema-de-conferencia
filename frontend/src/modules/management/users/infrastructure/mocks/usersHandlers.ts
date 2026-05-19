import { http, delay } from 'msw';
import { ok, fail } from '@/mocks/utils/apiResponse';
import { api } from '@/mocks/utils/apiPath';
import {
  usersDb,
  getUserById,
  updateUserInDb,
  deleteUserFromDb,
  createUserInDb,
  addActivityLog,
} from './usersData';
import type { User, UserListItem, UserStatus, BulkActionType, ImportUserItem, UserRole } from '../../domain/models';

// ============================================================================
// Helper Functions
// ============================================================================

function filterUsers(params: URLSearchParams): UserListItem[] {
  const search = (params.get('search') || '').toLowerCase();
  const status = params.get('status');
  const role = params.get('role');
  const activityDays = params.get('activityDays');

  return usersDb
    .filter((u) => {
      const matchesSearch =
        !search ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search);
      const matchesStatus = !status || status === 'all' || u.status === status;
      const matchesRole = !role || role === 'all' || u.role === role;

      let matchesActivity = true;
      if (activityDays && activityDays !== 'all' && u.lastLoginAt) {
        const lastLogin = new Date(u.lastLoginAt);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
        matchesActivity = daysDiff <= parseInt(activityDays, 10);
      }

      return matchesSearch && matchesStatus && matchesRole && matchesActivity;
    })
    .map((u) => ({
      id: u.id,
      avatarUrl: u.avatarUrl,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      role: u.role,
      status: u.status,
      lastLoginAt: u.lastLoginAt,
      createdAt: u.createdAt,
    }));
}

function getStats() {
  return {
    total: usersDb.length,
    active: usersDb.filter((u) => u.status === 'active').length,
    invited: usersDb.filter((u) => u.status === 'invited').length,
    suspended: usersDb.filter((u) => u.status === 'suspended').length,
    deactivated: usersDb.filter((u) => u.status === 'deactivated').length,
  };
}

// ============================================================================
// MSW Handlers
// ============================================================================

export const usersHandlers = [
  // GET /users - List all users
  http.get(api('/users'), async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const users = filterUsers(url.searchParams);
    return ok(users);
  }),

  // GET /users/stats - Get user statistics
  http.get(api('/users/stats'), async () => {
    await delay(200);
    return ok(getStats());
  }),

  // GET /users/export - Export users
  http.get(api('/users/export'), async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const users = filterUsers(url.searchParams);
    return ok(users);
  }),

  // GET /users/:id - Get single user
  http.get(api('/users/:id'), async ({ params }) => {
    await delay(200);
    const id = String(params.id);
    const user = getUserById(id);
    if (!user) {
      return fail('USER_NOT_FOUND', 'User not found', 404);
    }
    return ok(user);
  }),

  // POST /users - Create/Invite user
  http.post(api('/users'), async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as {
      email: string;
      firstName?: string;
      lastName?: string;
      role: UserRole;
      team?: string;
      sendInvite: boolean;
    };

    // Check if email already exists
    const existing = usersDb.find((u) => u.email === body.email);
    if (existing) {
      return fail('EMAIL_EXISTS', 'A user with this email already exists', 400);
    }

    const newUser = createUserInDb(body);

    // Simulate sending notification via Notifications module
    if (body.sendInvite) {
      console.log('[MSW] Sending invitation email via Notifications module:', {
        templateId: 'user.invitation',
        context: {
          user_name: `${newUser.firstName} ${newUser.lastName}`.trim() || newUser.email,
          user_email: newUser.email,
          invited_by_name: 'Current User',
          invite_link: `https://app.example.com/accept-invite/${newUser.id}`,
          app_name: 'Katalyst',
        },
      });
    }

    return ok(newUser);
  }),

  // PUT /users/:id - Update user
  http.put(api('/users/:id'), async ({ params, request }) => {
    await delay(400);
    const id = String(params.id);
    const body = (await request.json()) as Partial<User>;

    const updated = updateUserInDb(id, body);
    if (!updated) {
      return fail('USER_NOT_FOUND', 'User not found', 404);
    }

    addActivityLog(id, {
      action: 'user.updated',
      description: 'User profile updated',
      performedBy: 'Current User',
      timestamp: new Date().toISOString(),
    });

    return ok(updated);
  }),

  // DELETE /users/:id - Delete user
  http.delete(api('/users/:id'), async ({ params }) => {
    await delay(300);
    const id = String(params.id);
    const deleted = deleteUserFromDb(id);
    if (!deleted) {
      return fail('USER_NOT_FOUND', 'User not found', 404);
    }
    return ok({ success: true });
  }),

  // POST /users/:id/actions/activate - Activate user
  http.post(api('/users/:id/actions/activate'), async ({ params }) => {
    await delay(300);
    const id = String(params.id);
    const updated = updateUserInDb(id, { status: 'active' as UserStatus });
    if (!updated) {
      return fail('USER_NOT_FOUND', 'User not found', 404);
    }

    addActivityLog(id, {
      action: 'user.activated',
      description: 'Account activated',
      performedBy: 'Current User',
      timestamp: new Date().toISOString(),
    });

    return ok(updated);
  }),

  // POST /users/:id/actions/deactivate - Deactivate user
  http.post(api('/users/:id/actions/deactivate'), async ({ params }) => {
    await delay(300);
    const id = String(params.id);
    const updated = updateUserInDb(id, { status: 'deactivated' as UserStatus });
    if (!updated) {
      return fail('USER_NOT_FOUND', 'User not found', 404);
    }

    addActivityLog(id, {
      action: 'user.deactivated',
      description: 'Account deactivated',
      performedBy: 'Current User',
      timestamp: new Date().toISOString(),
    });

    return ok(updated);
  }),

  // POST /users/:id/actions/suspend - Suspend user
  http.post(api('/users/:id/actions/suspend'), async ({ params, request }) => {
    await delay(300);
    const id = String(params.id);
    const body = (await request.json()) as { reason?: string };
    const updated = updateUserInDb(id, { status: 'suspended' as UserStatus });
    if (!updated) {
      return fail('USER_NOT_FOUND', 'User not found', 404);
    }

    addActivityLog(id, {
      action: 'user.suspended',
      description: body.reason || 'Account suspended',
      performedBy: 'Current User',
      timestamp: new Date().toISOString(),
    });

    return ok(updated);
  }),

  // POST /users/:id/actions/restore - Restore user
  http.post(api('/users/:id/actions/restore'), async ({ params }) => {
    await delay(300);
    const id = String(params.id);
    const updated = updateUserInDb(id, { status: 'active' as UserStatus });
    if (!updated) {
      return fail('USER_NOT_FOUND', 'User not found', 404);
    }

    addActivityLog(id, {
      action: 'user.restored',
      description: 'Account restored',
      performedBy: 'Current User',
      timestamp: new Date().toISOString(),
    });

    return ok(updated);
  }),

  // POST /users/bulk-action - Bulk action
  http.post(api('/users/bulk-action'), async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as { ids: string[]; action: BulkActionType };
    let success = 0;
    let failed = 0;

    for (const id of body.ids) {
      const user = getUserById(id);
      if (!user) {
        failed++;
        continue;
      }

      switch (body.action) {
        case 'activate':
          updateUserInDb(id, { status: 'active' as UserStatus });
          addActivityLog(id, {
            action: 'user.activated',
            description: 'Account activated (bulk action)',
            performedBy: 'Current User',
            timestamp: new Date().toISOString(),
          });
          success++;
          break;
        case 'deactivate':
          updateUserInDb(id, { status: 'deactivated' as UserStatus });
          addActivityLog(id, {
            action: 'user.deactivated',
            description: 'Account deactivated (bulk action)',
            performedBy: 'Current User',
            timestamp: new Date().toISOString(),
          });
          success++;
          break;
        case 'resend_invitation':
          if (user.status === 'invited') {
            addActivityLog(id, {
              action: 'user.invitation_resent',
              description: 'Invitation email resent (bulk action)',
              performedBy: 'Current User',
              timestamp: new Date().toISOString(),
            });
            success++;
          } else {
            failed++;
          }
          break;
        case 'delete':
          if (deleteUserFromDb(id)) {
            success++;
          } else {
            failed++;
          }
          break;
      }
    }

    return ok({ success, failed });
  }),

  // POST /users/:id/actions/resend-invite - Resend invitation
  http.post(api('/users/:id/actions/resend-invite'), async ({ params }) => {
    await delay(600);
    const id = String(params.id);
    const user = getUserById(id);
    if (!user) {
      return fail('USER_NOT_FOUND', 'User not found', 404);
    }

    if (user.status !== 'invited') {
      return fail('INVALID_STATUS', 'User is not in invited status', 400);
    }

    addActivityLog(id, {
      action: 'user.invitation_resent',
      description: 'Invitation email resent',
      performedBy: 'Current User',
      timestamp: new Date().toISOString(),
    });

    // Simulate sending notification via Notifications module
    console.log('[MSW] Resending invitation email via Notifications module:', {
      templateId: 'user.invitation',
      context: {
        user_name: `${user.firstName} ${user.lastName}`.trim() || user.email,
        user_email: user.email,
        invited_by_name: 'Current User',
        invite_link: `https://app.example.com/accept-invite/${user.id}`,
        app_name: 'Katalyst',
      },
    });

    return ok({
      success: true,
      message: `Invitation resent to ${user.email}`,
      sentAt: new Date().toISOString(),
    });
  }),

  // POST /users/:id/actions/send-password-reset - Send password reset
  http.post(api('/users/:id/actions/send-password-reset'), async ({ params }) => {
    await delay(600);
    const id = String(params.id);
    const user = getUserById(id);
    if (!user) {
      return fail('USER_NOT_FOUND', 'User not found', 404);
    }

    addActivityLog(id, {
      action: 'user.password_reset_sent',
      description: 'Password reset email sent',
      performedBy: 'Current User',
      timestamp: new Date().toISOString(),
    });

    // Simulate sending notification via Notifications module
    console.log('[MSW] Sending password reset email via Notifications module:', {
      templateId: 'user.passwordReset',
      context: {
        user_name: `${user.firstName} ${user.lastName}`.trim() || user.email,
        user_email: user.email,
        reset_link: `https://app.example.com/reset-password/${user.id}`,
        app_name: 'Katalyst',
      },
    });

    return ok({
      success: true,
      message: `Password reset email sent to ${user.email}`,
      sentAt: new Date().toISOString(),
    });
  }),

  // POST /users/:id/actions/resend-verification - Resend verification email
  http.post(api('/users/:id/actions/resend-verification'), async ({ params }) => {
    await delay(600);
    const id = String(params.id);
    const user = getUserById(id);
    if (!user) {
      return fail('USER_NOT_FOUND', 'User not found', 404);
    }

    if (user.isEmailVerified) {
      return fail('ALREADY_VERIFIED', 'Email is already verified', 400);
    }

    addActivityLog(id, {
      action: 'user.verification_email_sent',
      description: 'Email verification sent',
      performedBy: 'Current User',
      timestamp: new Date().toISOString(),
    });

    // Simulate sending notification via Notifications module
    console.log('[MSW] Sending verification email via Notifications module:', {
      templateId: 'auth.verifyEmail',
      context: {
        user_name: `${user.firstName} ${user.lastName}`.trim() || user.email,
        user_email: user.email,
        verification_link: `https://app.example.com/verify-email/${user.id}`,
        app_name: 'Katalyst',
      },
    });

    return ok({
      success: true,
      message: `Verification email sent to ${user.email}`,
      sentAt: new Date().toISOString(),
    });
  }),

  // GET /users/:id/sessions - Get user sessions
  http.get(api('/users/:id/sessions'), async ({ params }) => {
    await delay(200);
    const id = String(params.id);
    const user = getUserById(id);
    if (!user) {
      return fail('USER_NOT_FOUND', 'User not found', 404);
    }
    return ok(user.sessions);
  }),

  // DELETE /users/:id/sessions/:sessionId - Terminate session
  http.delete(api('/users/:id/sessions/:sessionId'), async ({ params }) => {
    await delay(300);
    const userId = String(params.id);
    const sessionId = String(params.sessionId);
    const user = getUserById(userId);
    if (!user) {
      return fail('USER_NOT_FOUND', 'User not found', 404);
    }

    const sessionIdx = user.sessions.findIndex((s) => s.id === sessionId);
    if (sessionIdx === -1) {
      return fail('SESSION_NOT_FOUND', 'Session not found', 404);
    }

    user.sessions.splice(sessionIdx, 1);

    addActivityLog(userId, {
      action: 'user.session_terminated',
      description: 'Session terminated',
      performedBy: 'Current User',
      timestamp: new Date().toISOString(),
    });

    return ok({ success: true });
  }),

  // DELETE /users/:id/sessions - Terminate all sessions
  http.delete(api('/users/:id/sessions'), async ({ params }) => {
    await delay(300);
    const userId = String(params.id);
    const user = getUserById(userId);
    if (!user) {
      return fail('USER_NOT_FOUND', 'User not found', 404);
    }

    user.sessions = [];

    addActivityLog(userId, {
      action: 'user.all_sessions_terminated',
      description: 'All sessions terminated',
      performedBy: 'Current User',
      timestamp: new Date().toISOString(),
    });

    return ok({ success: true });
  }),

  // GET /users/:id/activity-log - Get activity log
  http.get(api('/users/:id/activity-log'), async ({ params }) => {
    await delay(200);
    const id = String(params.id);
    const user = getUserById(id);
    if (!user) {
      return fail('USER_NOT_FOUND', 'User not found', 404);
    }
    return ok(user.activityLog);
  }),

  // POST /users/import - Import users
  http.post(api('/users/import'), async ({ request }) => {
    await delay(1500);
    const body = (await request.json()) as { users: ImportUserItem[]; sendInvites: boolean };
    let imported = 0;
    const errors: Array<{ email: string; error: string }> = [];

    for (const userData of body.users) {
      // Check if email already exists
      const existing = usersDb.find((u) => u.email === userData.email);
      if (existing) {
        errors.push({ email: userData.email, error: 'Email already exists' });
        continue;
      }

      createUserInDb({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role || 'member',
        sendInvite: body.sendInvites,
      });

      imported++;

      // Simulate sending notification via Notifications module
      if (body.sendInvites) {
        console.log('[MSW] Sending invitation email (import) via Notifications module:', {
          templateId: 'user.invitation',
          context: {
            user_name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email,
            user_email: userData.email,
            invited_by_name: 'Current User',
            app_name: 'Katalyst',
          },
        });
      }
    }

    return ok({
      imported,
      failed: errors.length,
      errors,
    });
  }),
];
