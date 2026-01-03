import { defineEventHandler, getQuery } from "h3";
import { prisma } from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  // Check if pagination is requested (presence of page or limit)
  const isPaginationRequested =
    query.page !== undefined || query.limit !== undefined;

  let page = 1;
  let limit = 0; // 0 means unlimited
  let skip = 0;

  if (isPaginationRequested) {
    page = Math.max(1, Number(query.page ?? 1));
    limit = Math.max(1, Math.min(100, Number(query.limit ?? 10)));
    skip = (page - 1) * limit;
  }

  const search = query.search ? String(query.search).trim() : null;
  const role = query.role ? String(query.role) : null;
  const status = query.status ? String(query.status) : null;
  const sortBy = query.sortBy ? String(query.sortBy) : "popularityScore";
  const sortDir = query.sortDir
    ? query.sortDir === "desc"
      ? "desc"
      : "asc"
    : sortBy === "popularityScore"
    ? "desc"
    : "asc";

  // Build where clause
  const where: any = { active: true };

  if (search) {
    where.OR = [
      { firstName: { contains: search } },
      { lastName: { contains: search } },
      { username: { contains: search } },
      { email: { contains: search } },
    ];
  }

  if (role) {
    if (role === "guest") {
      where.isGuest = true;
    } else {
      where.role = {
        id: role,
      };
    }
  }

  if (status) {
    where.accountStatus = status;
  }

  // Build order by
  let orderBy: any = {};
  if (sortBy === "role") {
    orderBy = { role: { roleName: sortDir } };
  } else if (sortBy === "name" || sortBy === "firstname") {
    orderBy = { firstName: sortDir };
  } else if (sortBy === "username") {
    orderBy = { username: sortDir };
  } else if (sortBy === "email") {
    orderBy = { email: sortDir };
  } else if (sortBy === "balance") {
    orderBy = { balance: sortDir };
  } else if (sortBy === "accountStatus") {
    orderBy = { accountStatus: sortDir };
  } else if (sortBy === "popularityScore") {
    orderBy = [{ popularityScore: sortDir }, { firstName: "asc" }];
  } else {
    orderBy = { firstName: sortDir }; // default
  }

  // Fetch users
  // If not paginated, we don't need count, just findMany
  if (!isPaginationRequested) {
    const users = await prisma.user.findMany({
      where,
      include: {
        role: true,
        host: true,
      },
      orderBy,
    });

    // Map and return list directly
    return users.map(mapUser);
  }

  // Paginated path
  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      include: {
        role: true,
        host: true,
      },
      orderBy,
      skip,
      take: limit,
    }),
  ]);

  return {
    data: users.map(mapUser),
    total,
    page,
    limit,
  };
});

function mapUser(u: any) {
  // Construct label
  let dropdownLabel = `${u.firstName || ""} ${u.lastName || ""} ${
    u.username
  }`.trim();

  return {
    id: u.id,
    type: u.isGuest ? "guest" : "user",
    username: u.username,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    role: u.isGuest
      ? { id: "guest", roleName: "Guest" } // Virtual role for guests
      : u.role
      ? { id: u.role.id, roleName: u.role.roleName }
      : null,
    balance: u.balance,
    accountStatus: u.accountStatus,
    dropdownLabel,
    hostName: u.host
      ? u.host.firstName
        ? `${u.host.firstName} ${u.host.lastName || ""}`.trim()
        : u.host.username
      : undefined,
  };
}
