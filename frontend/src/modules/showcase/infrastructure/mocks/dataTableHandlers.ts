import { http, HttpResponse, delay } from 'msw';

export interface ServerUser {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Member';
  status: 'Active' | 'Inactive' | 'Pending';
  department: string;
  joinDate: string;
  salary: number;
}

// Generate larger dataset for server-side pagination
const generateUsers = (count: number): ServerUser[] => {
  const roles = ['Admin', 'Manager', 'Member'] as const;
  const statuses = ['Active', 'Inactive', 'Pending'] as const;
  const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Support'];
  const firstNames = ['Alice', 'Bob', 'Carol', 'David', 'Eva', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack', 'Karen', 'Leo', 'Maria', 'Nathan', 'Olivia', 'Peter'];
  const lastNames = ['Johnson', 'Smith', 'Williams', 'Brown', 'Martinez', 'Lee', 'Kim', 'Chen', 'Taylor', 'Wilson', 'Davis', 'Garcia'];

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
    email: `user${i + 1}@company.com`,
    role: roles[i % roles.length],
    status: statuses[i % statuses.length],
    department: departments[i % departments.length],
    joinDate: `2023-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
    salary: 60000 + (i * 1000) % 50000,
  }));
};

const allUsers = generateUsers(100);

export const showcaseDataTableHandlers = [
  // GET /api/showcase/users - Server-side pagination, sorting, filtering
  http.get('/api/showcase/users', async ({ request }) => {
    await delay(300); // Simulate network latency

    const url = new URL(request.url);
    
    // Pagination
    const page = parseInt(url.searchParams.get('page') || '0');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    
    // Sorting
    const sortBy = url.searchParams.get('sortBy');
    const sortDesc = url.searchParams.get('sortDesc') === 'true';
    
    // Filtering
    const nameFilter = url.searchParams.get('name')?.toLowerCase();
    const roleFilter = url.searchParams.get('role');
    const statusFilter = url.searchParams.get('status');
    const departmentFilter = url.searchParams.get('department');

    // Apply filters
    let filteredUsers = [...allUsers];
    
    if (nameFilter) {
      filteredUsers = filteredUsers.filter(u => 
        u.name.toLowerCase().includes(nameFilter) || 
        u.email.toLowerCase().includes(nameFilter)
      );
    }
    
    if (roleFilter) {
      filteredUsers = filteredUsers.filter(u => u.role === roleFilter);
    }
    
    if (statusFilter) {
      filteredUsers = filteredUsers.filter(u => u.status === statusFilter);
    }
    
    if (departmentFilter) {
      filteredUsers = filteredUsers.filter(u => u.department === departmentFilter);
    }

    // Apply sorting
    if (sortBy) {
      filteredUsers.sort((a, b) => {
        const aVal = a[sortBy as keyof ServerUser];
        const bVal = b[sortBy as keyof ServerUser];
        
        if (aVal < bVal) return sortDesc ? 1 : -1;
        if (aVal > bVal) return sortDesc ? -1 : 1;
        return 0;
      });
    }

    // Get total count
    const totalCount = filteredUsers.length;
    
    // Apply pagination
    const start = page * pageSize;
    const paginatedUsers = filteredUsers.slice(start, start + pageSize);

    return HttpResponse.json({
      data: paginatedUsers,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  }),
];
