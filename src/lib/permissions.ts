import { DashboardUser } from '@/types/dashboard';

/**
 * ============================================================================
 * CHANOMHUB ROLE & PERMISSION MANAGEMENT SYSTEM
 * ============================================================================
 * 
 * Single Source of Truth for User Roles & Permissions across ChanomHub.
 * 
 * 🛠️ HOW TO USE FOR DEVELOPERS:
 * 
 * 1. CHECK IF USER HAS ROLE(S) IN UI OR ROUTE GUARDS:
 *    ```ts
 *    import { hasRole } from '@/lib/permissions';
 *    
 *    if (hasRole(user, 'ADMIN')) { ... }
 *    if (hasRole(user, ['ADMIN', 'MODERATOR'])) { ... }
 *    ```
 * 
 * 2. DISPLAY PRIMARY ROLE BADGE ON PROFILE / HEADER:
 *    ```ts
 *    import { getPrimaryRole } from '@/lib/permissions';
 *    
 *    const mainRole = getPrimaryRole(user); // e.g. "ADMIN" (Sorted by importance)
 *    ```
 * 
 * 3. ADD A NEW ROLE TO THE SYSTEM:
 *    - Add the new role name to `UserRole` type and `ROLE_HIERARCHY` map below.
 * ============================================================================
 */

/**
 * All supported user roles in ChanomHub
 */
export type UserRole =
  | 'SUPERADMIN'
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'MODERATOR'
  | 'DEVELOPER'
  | 'CREATOR'
  | 'VIP'
  | 'PREMIUM'
  | 'USER';

/**
 * Role Priority Hierarchy (Higher number = Higher authority)
 */
export const ROLE_HIERARCHY: Record<UserRole | string, number> = {
  SUPERADMIN: 100,
  SUPER_ADMIN: 100,
  ADMIN: 90,
  MODERATOR: 50,
  DEVELOPER: 30,
  CREATOR: 30,
  VIP: 20,
  PREMIUM: 15,
  USER: 10,
};

/**
 * Sorts an array of role strings by authority hierarchy (highest priority first)
 */
export function sortRolesByHierarchy(roles: string[]): string[] {
  return [...roles].sort((a, b) => {
    const weightA = ROLE_HIERARCHY[a.toUpperCase() as UserRole] || 0;
    const weightB = ROLE_HIERARCHY[b.toUpperCase() as UserRole] || 0;
    return weightB - weightA;
  });
}

/**
 * Extracts a normalized, uppercase list of all roles assigned to a user,
 * sorted from highest authority to lowest authority.
 */
export function getUserRoles(user: DashboardUser | null | undefined): string[] {
  if (!user) return [];

  const rolesSet = new Set<string>();

  if (user.roles && Array.isArray(user.roles)) {
    user.roles.forEach((r) => {
      if (typeof r === 'string') {
        rolesSet.add(r.toUpperCase());
      } else if (r && typeof r === 'object' && 'name' in r) {
        rolesSet.add(String((r as any).name).toUpperCase());
      }
    });
  }

  if (user.rank) {
    rolesSet.add(String(user.rank).toUpperCase());
  }

  if (rolesSet.size === 0) {
    rolesSet.add('USER');
  }

  return sortRolesByHierarchy(Array.from(rolesSet));
}

/**
 * Gets the single primary (highest priority) role for display in UI badges
 */
export function getPrimaryRole(user: DashboardUser | null | undefined): string {
  const roles = getUserRoles(user);
  return roles[0] || 'USER';
}

/**
 * Checks if a user possesses any of the required roles.
 * Automatically grants access for Admin/Superadmin (Admin Superpass).
 */
export function hasRole(
  user: DashboardUser | null | undefined,
  requiredRoles?: UserRole | UserRole[] | string | string[]
): boolean {
  if (!user) return false;
  if (!requiredRoles || (Array.isArray(requiredRoles) && requiredRoles.length === 0)) {
    return true;
  }

  const userRoles = getUserRoles(user);

  // Admin Superpass
  if (userRoles.some((r) => ['ADMIN', 'SUPERADMIN', 'SUPER_ADMIN'].includes(r))) {
    return true;
  }

  const normalizedRequired = (Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]).map(
    (r) => String(r).toUpperCase()
  );

  return normalizedRequired.some((reqRole) => userRoles.includes(reqRole));
}

/**
 * Checks if a user has a specific granular permission string (e.g. 'article:delete')
 */
export function hasPermission(
  user: DashboardUser | null | undefined,
  permission: string
): boolean {
  if (!user) return false;

  const userRoles = getUserRoles(user);

  // Admin Superpass
  if (userRoles.some((r) => ['ADMIN', 'SUPERADMIN', 'SUPER_ADMIN'].includes(r))) {
    return true;
  }

  const permissions = (user as any)?.permissions;
  if (Array.isArray(permissions)) {
    if (permissions.includes('*') || permissions.includes(permission)) {
      return true;
    }
  }

  return false;
}
