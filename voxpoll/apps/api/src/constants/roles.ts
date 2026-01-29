// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - ROLE DEFINITIONS
// ══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// User Roles
// ─────────────────────────────────────────────────────────────────────────────

export const USER_ROLES = {
  USER: 'USER',
  MODERATOR: 'MODERATOR',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]

// Role hierarchy levels (higher = more permissions)
export const USER_ROLE_LEVELS: Record<UserRole, number> = {
  USER: 0,
  MODERATOR: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
}

// ─────────────────────────────────────────────────────────────────────────────
// Organization Roles
// ─────────────────────────────────────────────────────────────────────────────

export const ORG_ROLES = {
  MEMBER: 'MEMBER',
  CREATOR: 'CREATOR',
  ANALYST: 'ANALYST',
  MANAGER: 'MANAGER',
  ADMIN: 'ADMIN',
  OWNER: 'OWNER',
} as const

export type OrgRole = (typeof ORG_ROLES)[keyof typeof ORG_ROLES]

// Organization role hierarchy levels
export const ORG_ROLE_LEVELS: Record<OrgRole, number> = {
  MEMBER: 0,
  CREATOR: 1,
  ANALYST: 2,
  MANAGER: 3,
  ADMIN: 4,
  OWNER: 5,
}

// ─────────────────────────────────────────────────────────────────────────────
// Subscription Tiers
// ─────────────────────────────────────────────────────────────────────────────

export const SUBSCRIPTION_TIERS = {
  FREE: 'FREE',
  PLUS: 'PLUS',
  PREMIUM: 'PREMIUM',
  ENTERPRISE: 'ENTERPRISE',
} as const

export type SubscriptionTier = (typeof SUBSCRIPTION_TIERS)[keyof typeof SUBSCRIPTION_TIERS]

// ─────────────────────────────────────────────────────────────────────────────
// Verification Levels
// ─────────────────────────────────────────────────────────────────────────────

export const VERIFICATION_LEVELS = {
  NONE: 'NONE',
  BASIC: 'BASIC',
  VERIFIED: 'VERIFIED',
  IDENTITY: 'IDENTITY',
  FULLY_VERIFIED: 'FULLY_VERIFIED',
} as const

export type VerificationLevel = (typeof VERIFICATION_LEVELS)[keyof typeof VERIFICATION_LEVELS]

// ─────────────────────────────────────────────────────────────────────────────
// User Status
// ─────────────────────────────────────────────────────────────────────────────

export const USER_STATUS = {
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  BANNED: 'BANNED',
  DEACTIVATED: 'DEACTIVATED',
} as const

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS]

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

export function hasMinUserRole(userRole: UserRole, minRole: UserRole): boolean {
  return USER_ROLE_LEVELS[userRole] >= USER_ROLE_LEVELS[minRole]
}

export function hasMinOrgRole(orgRole: OrgRole, minRole: OrgRole): boolean {
  return ORG_ROLE_LEVELS[orgRole] >= ORG_ROLE_LEVELS[minRole]
}

export function isActiveUser(status: UserStatus): boolean {
  return status === USER_STATUS.ACTIVE
}

export function isPremiumUser(tier: SubscriptionTier): boolean {
  return tier !== SUBSCRIPTION_TIERS.FREE
}

// ─────────────────────────────────────────────────────────────────────────────
// Organization Role Permissions (Bible P-102)
// ─────────────────────────────────────────────────────────────────────────────

export interface OrgRolePermissions {
  canManageMembers: boolean
  canManageSettings: boolean
  canManageContent: boolean
  canViewAudit: boolean
  canCreateSurveys: boolean
  canManageSurveys: boolean
  canViewAllResults: boolean
  canExportData: boolean
  canManageBilling: boolean
  canDeleteOrg: boolean
  canManageTeam: boolean
}

export const ORG_ROLE_PERMISSIONS: Record<OrgRole, OrgRolePermissions> = {
  OWNER: {
    canManageMembers: true,
    canManageSettings: true,
    canManageContent: true,
    canViewAudit: true,
    canCreateSurveys: true,
    canManageSurveys: true,
    canViewAllResults: true,
    canExportData: true,
    canManageBilling: true,
    canDeleteOrg: true,
    canManageTeam: true,
  },
  ADMIN: {
    canManageMembers: true,
    canManageSettings: true,
    canManageContent: true,
    canViewAudit: true,
    canCreateSurveys: true,
    canManageSurveys: true,
    canViewAllResults: true,
    canExportData: true,
    canManageBilling: false,
    canDeleteOrg: false,
    canManageTeam: true,
  },
  MANAGER: {
    canManageMembers: false,
    canManageSettings: false,
    canManageContent: true,
    canViewAudit: false,
    canCreateSurveys: true,
    canManageSurveys: true,
    canViewAllResults: true,
    canExportData: true,
    canManageBilling: false,
    canDeleteOrg: false,
    canManageTeam: true,
  },
  ANALYST: {
    canManageMembers: false,
    canManageSettings: false,
    canManageContent: false,
    canViewAudit: false,
    canCreateSurveys: false,
    canManageSurveys: false,
    canViewAllResults: true,
    canExportData: true,
    canManageBilling: false,
    canDeleteOrg: false,
    canManageTeam: false,
  },
  CREATOR: {
    canManageMembers: false,
    canManageSettings: false,
    canManageContent: false,
    canViewAudit: false,
    canCreateSurveys: true,
    canManageSurveys: false,
    canViewAllResults: false,
    canExportData: false,
    canManageBilling: false,
    canDeleteOrg: false,
    canManageTeam: false,
  },
  MEMBER: {
    canManageMembers: false,
    canManageSettings: false,
    canManageContent: false,
    canViewAudit: false,
    canCreateSurveys: false,
    canManageSurveys: false,
    canViewAllResults: false,
    canExportData: false,
    canManageBilling: false,
    canDeleteOrg: false,
    canManageTeam: false,
  },
}

// Role constraints (Bible P-102)
export interface OrgRoleConstraints {
  maxCount: number | null
  requiredVerificationLevel: VerificationLevel
}

export const ORG_ROLE_CONSTRAINTS: Record<OrgRole, OrgRoleConstraints> = {
  OWNER: { maxCount: 1, requiredVerificationLevel: 'FULLY_VERIFIED' },
  ADMIN: { maxCount: 5, requiredVerificationLevel: 'IDENTITY' },
  MANAGER: { maxCount: null, requiredVerificationLevel: 'VERIFIED' },
  ANALYST: { maxCount: null, requiredVerificationLevel: 'BASIC' },
  CREATOR: { maxCount: null, requiredVerificationLevel: 'BASIC' },
  MEMBER: { maxCount: null, requiredVerificationLevel: 'NONE' },
}

// Get permissions for a role
export function getOrgRolePermissions(role: OrgRole): OrgRolePermissions {
  return ORG_ROLE_PERMISSIONS[role]
}

// Check if role has a specific permission
export function hasOrgPermission(
  role: OrgRole,
  permission: keyof OrgRolePermissions
): boolean {
  return ORG_ROLE_PERMISSIONS[role][permission]
}

// Get role constraints
export function getOrgRoleConstraints(role: OrgRole): OrgRoleConstraints {
  return ORG_ROLE_CONSTRAINTS[role]
}

// Verification level to numeric level mapping
export const VERIFICATION_LEVEL_VALUES: Record<VerificationLevel, number> = {
  NONE: 0,
  BASIC: 1,
  VERIFIED: 2,
  IDENTITY: 3,
  FULLY_VERIFIED: 4,
}

// Check if user meets verification requirement for role
export function meetsVerificationForRole(
  userLevel: VerificationLevel,
  targetRole: OrgRole
): boolean {
  const required = ORG_ROLE_CONSTRAINTS[targetRole].requiredVerificationLevel
  return VERIFICATION_LEVEL_VALUES[userLevel] >= VERIFICATION_LEVEL_VALUES[required]
}
