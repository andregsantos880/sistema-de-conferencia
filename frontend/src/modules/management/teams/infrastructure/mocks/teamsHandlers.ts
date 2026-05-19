import { http, delay } from 'msw';
import { ok, fail } from '@/mocks/utils/apiResponse';
import { api } from '@/mocks/utils/apiPath';
import {
  teamsDb,
  teamMembersDb,
  getTeamById,
  getTeamDetailById,
  getTeamListItem,
  getTeamMembers,
  getTeamActivity,
  updateTeamInDb,
  deleteTeamFromDb,
  createTeamInDb,
  addTeamActivity,
  addTeamMember,
  updateTeamMember,
  removeTeamMember,
  getTeamMemberById,
  getTeamOwners,
} from './teamsData';
import { usersDb, createUserInDb } from '@/modules/management/users/infrastructure/mocks/usersData';
import type {
  TeamStatus,
  TeamType,
  TeamBulkActionType,
  CreateTeamPayload,
  UpdateTeamPayload,
  AddMembersPayload,
  InviteMembersPayload,
  UpdateMemberPayload,
  TransferOwnershipPayload,
} from '../../domain/models';

// ============================================================================
// Helper Functions
// ============================================================================

function filterTeams(params: URLSearchParams) {
  const search = (params.get('search') || '').toLowerCase();
  const status = params.get('status');
  const department = params.get('department');
  const type = params.get('type');

  return teamsDb
    .filter((t) => {
      const owner = usersDb.find((u) => u.id === t.ownerId);
      const ownerName = owner ? `${owner.firstName} ${owner.lastName}`.toLowerCase() : '';

      const matchesSearch =
        !search ||
        t.name.toLowerCase().includes(search) ||
        t.slug.toLowerCase().includes(search) ||
        ownerName.includes(search);
      const matchesStatus = !status || status === 'all' || t.status === status;
      const matchesDepartment = !department || department === 'all' || t.department === department;
      const matchesType = !type || type === 'all' || t.type === type;

      return matchesSearch && matchesStatus && matchesDepartment && matchesType;
    })
    .map(getTeamListItem);
}

function getStats() {
  const byType: Record<TeamType, number> = {
    functional: 0,
    project: 0,
    'cross-functional': 0,
    other: 0,
  };

  const byDepartment: Record<string, number> = {};

  teamsDb.forEach((t) => {
    byType[t.type]++;
    if (t.department) {
      byDepartment[t.department] = (byDepartment[t.department] || 0) + 1;
    }
  });

  return {
    total: teamsDb.length,
    active: teamsDb.filter((t) => t.status === 'active').length,
    archived: teamsDb.filter((t) => t.status === 'archived').length,
    byType,
    byDepartment,
  };
}

function filterMembers(teamId: string, params: URLSearchParams) {
  const search = (params.get('search') || '').toLowerCase();
  const role = params.get('role');
  const status = params.get('status');

  return getTeamMembers(teamId).filter((m) => {
    const matchesSearch =
      !search ||
      m.userName.toLowerCase().includes(search) ||
      m.userEmail.toLowerCase().includes(search);
    const matchesRole = !role || role === 'all' || m.role === role;
    const matchesStatus = !status || status === 'all' || m.status === status;

    return matchesSearch && matchesRole && matchesStatus;
  });
}

// ============================================================================
// MSW Handlers
// ============================================================================

export const teamsHandlers = [
  // GET /teams - List all teams
  http.get(api('/teams'), async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const teams = filterTeams(url.searchParams);
    return ok(teams);
  }),

  // GET /teams/stats - Get team statistics
  http.get(api('/teams/stats'), async () => {
    await delay(200);
    return ok(getStats());
  }),

  // GET /teams/:id - Get single team
  http.get(api('/teams/:id'), async ({ params }) => {
    await delay(200);
    const id = String(params.id);
    const team = getTeamDetailById(id);
    if (!team) {
      return fail('TEAM_NOT_FOUND', 'Team not found', 404);
    }
    return ok(team);
  }),

  // POST /teams - Create team
  http.post(api('/teams'), async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as CreateTeamPayload;

    // Check if slug already exists
    const existingSlug = teamsDb.find(
      (t) => t.slug === (body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
    );
    if (existingSlug) {
      return fail('SLUG_EXISTS', 'A team with this slug already exists', 400);
    }

    const newTeam = createTeamInDb({
      name: body.name,
      slug: body.slug,
      description: body.description,
      department: body.department,
      type: body.type,
      ownerId: body.ownerId || 'user-1', // Default to first admin user
    });

    return ok(newTeam);
  }),

  // PUT /teams/:id - Update team
  http.put(api('/teams/:id'), async ({ params, request }) => {
    await delay(400);
    const id = String(params.id);
    const body = (await request.json()) as UpdateTeamPayload;

    const updated = updateTeamInDb(id, body);
    if (!updated) {
      return fail('TEAM_NOT_FOUND', 'Team not found', 404);
    }

    const actor = usersDb.find((u) => u.id === updated.ownerId);
    addTeamActivity(id, {
      type: 'team.updated',
      message: 'Team settings updated',
      actorUserId: 'user-1',
      actorName: actor ? `${actor.firstName} ${actor.lastName}` : 'Admin',
      actorAvatarUrl: actor?.avatarUrl,
    });

    return ok(updated);
  }),

  // DELETE /teams/:id - Delete team
  http.delete(api('/teams/:id'), async ({ params }) => {
    await delay(300);
    const id = String(params.id);
    const deleted = deleteTeamFromDb(id);
    if (!deleted) {
      return fail('TEAM_NOT_FOUND', 'Team not found', 404);
    }
    return ok({ success: true });
  }),

  // POST /teams/:id/archive - Archive team
  http.post(api('/teams/:id/archive'), async ({ params }) => {
    await delay(300);
    const id = String(params.id);
    const team = getTeamById(id);
    if (!team) {
      return fail('TEAM_NOT_FOUND', 'Team not found', 404);
    }

    const updated = updateTeamInDb(id, { status: 'archived' as TeamStatus });

    const actor = usersDb.find((u) => u.id === team.ownerId);
    addTeamActivity(id, {
      type: 'team.archived',
      message: 'Team archived',
      actorUserId: 'user-1',
      actorName: actor ? `${actor.firstName} ${actor.lastName}` : 'Admin',
      actorAvatarUrl: actor?.avatarUrl,
    });

    return ok(updated);
  }),

  // POST /teams/:id/unarchive - Unarchive team
  http.post(api('/teams/:id/unarchive'), async ({ params }) => {
    await delay(300);
    const id = String(params.id);
    const team = getTeamById(id);
    if (!team) {
      return fail('TEAM_NOT_FOUND', 'Team not found', 404);
    }

    const updated = updateTeamInDb(id, { status: 'active' as TeamStatus });

    const actor = usersDb.find((u) => u.id === team.ownerId);
    addTeamActivity(id, {
      type: 'team.unarchived',
      message: 'Team restored from archive',
      actorUserId: 'user-1',
      actorName: actor ? `${actor.firstName} ${actor.lastName}` : 'Admin',
      actorAvatarUrl: actor?.avatarUrl,
    });

    return ok(updated);
  }),

  // POST /teams/:id/transfer-ownership - Transfer ownership
  http.post(api('/teams/:id/transfer-ownership'), async ({ params, request }) => {
    await delay(400);
    const id = String(params.id);
    const body = (await request.json()) as TransferOwnershipPayload;

    const team = getTeamById(id);
    if (!team) {
      return fail('TEAM_NOT_FOUND', 'Team not found', 404);
    }

    // Check if new owner is a member
    const newOwnerMember = teamMembersDb.find(
      (m) => m.teamId === id && m.userId === body.newOwnerId
    );
    if (!newOwnerMember) {
      return fail('NOT_A_MEMBER', 'New owner must be a team member', 400);
    }

    const oldOwner = usersDb.find((u) => u.id === team.ownerId);
    const newOwner = usersDb.find((u) => u.id === body.newOwnerId);

    // Update old owner to admin
    const oldOwnerMember = teamMembersDb.find(
      (m) => m.teamId === id && m.userId === team.ownerId
    );
    if (oldOwnerMember) {
      updateTeamMember(id, oldOwnerMember.id, { role: 'admin' });
    }

    // Update new owner role
    updateTeamMember(id, newOwnerMember.id, { role: 'owner' });

    // Update team owner
    const updated = updateTeamInDb(id, { ownerId: body.newOwnerId });

    addTeamActivity(id, {
      type: 'ownership.transferred',
      message: `Ownership transferred from ${oldOwner ? `${oldOwner.firstName} ${oldOwner.lastName}` : 'Unknown'} to ${newOwner ? `${newOwner.firstName} ${newOwner.lastName}` : 'Unknown'}`,
      actorUserId: 'user-1',
      actorName: 'Admin',
      targetUserId: body.newOwnerId,
      targetUserName: newOwner ? `${newOwner.firstName} ${newOwner.lastName}` : 'Unknown',
    });

    return ok(updated);
  }),

  // POST /teams/bulk-action - Bulk action
  http.post(api('/teams/bulk-action'), async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as { ids: string[]; action: TeamBulkActionType };
    let success = 0;
    let failed = 0;

    for (const id of body.ids) {
      const team = getTeamById(id);
      if (!team) {
        failed++;
        continue;
      }

      switch (body.action) {
        case 'archive':
          updateTeamInDb(id, { status: 'archived' as TeamStatus });
          addTeamActivity(id, {
            type: 'team.archived',
            message: 'Team archived (bulk action)',
            actorUserId: 'user-1',
            actorName: 'Admin',
          });
          success++;
          break;
        case 'unarchive':
          updateTeamInDb(id, { status: 'active' as TeamStatus });
          addTeamActivity(id, {
            type: 'team.unarchived',
            message: 'Team restored (bulk action)',
            actorUserId: 'user-1',
            actorName: 'Admin',
          });
          success++;
          break;
        case 'delete':
          if (deleteTeamFromDb(id)) {
            success++;
          } else {
            failed++;
          }
          break;
      }
    }

    return ok({ success, failed });
  }),

  // ============================================================================
  // Members Endpoints
  // ============================================================================

  // GET /teams/:id/members - Get team members
  http.get(api('/teams/:id/members'), async ({ params, request }) => {
    await delay(200);
    const id = String(params.id);
    const team = getTeamById(id);
    if (!team) {
      return fail('TEAM_NOT_FOUND', 'Team not found', 404);
    }

    const url = new URL(request.url);
    const members = filterMembers(id, url.searchParams);
    return ok(members);
  }),

  // POST /teams/:id/members - Add existing users as members
  http.post(api('/teams/:id/members'), async ({ params, request }) => {
    await delay(400);
    const id = String(params.id);
    const body = (await request.json()) as AddMembersPayload;

    const team = getTeamById(id);
    if (!team) {
      return fail('TEAM_NOT_FOUND', 'Team not found', 404);
    }

    const addedMembers = [];
    for (const userId of body.userIds) {
      const member = addTeamMember(id, userId, body.role);
      if (member) {
        addedMembers.push(member);

        const user = usersDb.find((u) => u.id === userId);
        addTeamActivity(id, {
          type: 'member.added',
          message: `${user ? `${user.firstName} ${user.lastName}` : 'User'} was added to the team`,
          actorUserId: 'user-1',
          actorName: 'Admin',
          targetUserId: userId,
          targetUserName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        });
      }
    }

    return ok(addedMembers);
  }),

  // POST /teams/:id/members/invite - Invite by email
  http.post(api('/teams/:id/members/invite'), async ({ params, request }) => {
    await delay(600);
    const id = String(params.id);
    const body = (await request.json()) as InviteMembersPayload;

    const team = getTeamById(id);
    if (!team) {
      return fail('TEAM_NOT_FOUND', 'Team not found', 404);
    }

    let added = 0;
    let invited = 0;
    const errors: Array<{ email: string; error: string }> = [];

    for (const email of body.emails) {
      // Check if user exists
      const user = usersDb.find((u) => u.email === email);

      if (user) {
        // User exists - add as member
        const existingMember = teamMembersDb.find(
          (m) => m.teamId === id && m.userId === user!.id
        );
        if (existingMember) {
          errors.push({ email, error: 'Already a member' });
          continue;
        }

        addTeamMember(id, user.id, body.role, 'active');
        added++;

        addTeamActivity(id, {
          type: 'member.added',
          message: `${user.firstName} ${user.lastName} was added to the team`,
          actorUserId: 'user-1',
          actorName: 'Admin',
          targetUserId: user.id,
          targetUserName: `${user.firstName} ${user.lastName}`,
        });
      } else {
        // User doesn't exist - create and invite
        const newUser = createUserInDb({
          email,
          role: 'member',
          sendInvite: body.sendInvitations,
        });

        addTeamMember(id, newUser.id, body.role, 'invited');
        invited++;

        addTeamActivity(id, {
          type: 'member.invited',
          message: `${email} was invited to the team`,
          actorUserId: 'user-1',
          actorName: 'Admin',
          targetUserId: newUser.id,
          targetUserName: email,
        });

        // Simulate sending notification
        if (body.sendInvitations) {
          console.log('[MSW] Sending team invitation email via Notifications module:', {
            templateId: 'team.invitation',
            context: {
              user_email: email,
              team_name: team.name,
              invited_by_name: 'Admin',
              invite_link: `https://app.example.com/accept-invite/${newUser.id}`,
              app_name: 'Katalyst',
            },
          });
        }
      }
    }

    return ok({ added, invited, failed: errors.length, errors });
  }),

  // PUT /teams/:id/members/:memberId - Update member
  http.put(api('/teams/:id/members/:memberId'), async ({ params, request }) => {
    await delay(300);
    const teamId = String(params.id);
    const memberId = String(params.memberId);
    const body = (await request.json()) as UpdateMemberPayload;

    const team = getTeamById(teamId);
    if (!team) {
      return fail('TEAM_NOT_FOUND', 'Team not found', 404);
    }

    const member = getTeamMemberById(teamId, memberId);
    if (!member) {
      return fail('MEMBER_NOT_FOUND', 'Member not found', 404);
    }

    // Prevent demoting last owner
    if (body.role && body.role !== 'owner' && member.role === 'owner') {
      const owners = getTeamOwners(teamId);
      if (owners.length === 1) {
        return fail('LAST_OWNER', 'Cannot demote the last owner. Transfer ownership first.', 400);
      }
    }

    const oldRole = member.role;
    const updated = updateTeamMember(teamId, memberId, body);

    if (body.role && body.role !== oldRole) {
      addTeamActivity(teamId, {
        type: 'role.changed',
        message: `${member.userName} role changed from ${oldRole} to ${body.role}`,
        actorUserId: 'user-1',
        actorName: 'Admin',
        targetUserId: member.userId,
        targetUserName: member.userName,
        metadata: { oldRole, newRole: body.role },
      });
    }

    return ok(updated);
  }),

  // DELETE /teams/:id/members/:memberId - Remove member
  http.delete(api('/teams/:id/members/:memberId'), async ({ params }) => {
    await delay(300);
    const teamId = String(params.id);
    const memberId = String(params.memberId);

    const team = getTeamById(teamId);
    if (!team) {
      return fail('TEAM_NOT_FOUND', 'Team not found', 404);
    }

    const member = getTeamMemberById(teamId, memberId);
    if (!member) {
      return fail('MEMBER_NOT_FOUND', 'Member not found', 404);
    }

    // Prevent removing last owner
    if (member.role === 'owner') {
      const owners = getTeamOwners(teamId);
      if (owners.length === 1) {
        return fail('LAST_OWNER', 'Cannot remove the last owner. Transfer ownership first.', 400);
      }
    }

    const removed = removeTeamMember(teamId, memberId);
    if (!removed) {
      return fail('REMOVE_FAILED', 'Failed to remove member', 500);
    }

    addTeamActivity(teamId, {
      type: 'member.removed',
      message: `${member.userName} was removed from the team`,
      actorUserId: 'user-1',
      actorName: 'Admin',
      targetUserId: member.userId,
      targetUserName: member.userName,
    });

    return ok({ success: true });
  }),

  // POST /teams/:id/members/:memberId/resend-invite - Resend invitation
  http.post(api('/teams/:id/members/:memberId/resend-invite'), async ({ params }) => {
    await delay(500);
    const teamId = String(params.id);
    const memberId = String(params.memberId);

    const team = getTeamById(teamId);
    if (!team) {
      return fail('TEAM_NOT_FOUND', 'Team not found', 404);
    }

    const member = getTeamMemberById(teamId, memberId);
    if (!member) {
      return fail('MEMBER_NOT_FOUND', 'Member not found', 404);
    }

    if (member.status !== 'invited' && member.status !== 'pending') {
      return fail('INVALID_STATUS', 'Member is not in invited/pending status', 400);
    }

    addTeamActivity(teamId, {
      type: 'invite.resent',
      message: `Invitation resent to ${member.userEmail}`,
      actorUserId: 'user-1',
      actorName: 'Admin',
      targetUserId: member.userId,
      targetUserName: member.userName,
    });

    // Simulate sending notification
    console.log('[MSW] Resending team invitation email via Notifications module:', {
      templateId: 'team.invitation',
      context: {
        user_email: member.userEmail,
        team_name: team.name,
        invited_by_name: 'Admin',
        invite_link: `https://app.example.com/accept-invite/${member.userId}`,
        app_name: 'Katalyst',
      },
    });

    return ok({ success: true, message: `Invitation resent to ${member.userEmail}` });
  }),

  // ============================================================================
  // Activity Endpoints
  // ============================================================================

  // GET /teams/:id/activity - Get team activity
  http.get(api('/teams/:id/activity'), async ({ params, request }) => {
    await delay(200);
    const id = String(params.id);
    const team = getTeamById(id);
    if (!team) {
      return fail('TEAM_NOT_FOUND', 'Team not found', 404);
    }

    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const actorId = url.searchParams.get('actorId');
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    let activity = getTeamActivity(id);

    if (type && type !== 'all') {
      activity = activity.filter((a) => a.type === type);
    }

    if (actorId && actorId !== 'all') {
      activity = activity.filter((a) => a.actorUserId === actorId);
    }

    return ok(activity.slice(offset, offset + limit));
  }),
];
