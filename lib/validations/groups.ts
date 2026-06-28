import { z } from "zod"

export const groupRoles = ["owner", "admin", "member"] as const
export const assignableGroupRoles = ["admin", "member"] as const

export const CreateGroupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Group name must be at least 2 characters.")
    .max(80, "Group name must be 80 characters or fewer."),
  description: z
    .string()
    .trim()
    .max(240, "Description must be 240 characters or fewer.")
    .optional()
    .or(z.literal("")),
})

export const InviteMemberSchema = z.object({
  groupId: z.uuid("Invalid group."),
  email: z.email("Enter a valid email.").trim().toLowerCase(),
  role: z.enum(assignableGroupRoles),
})

export const AcceptInvitationSchema = z.object({
  token: z.string().trim().min(32, "Invalid invitation token."),
})

export const GroupIdSchema = z.object({
  groupId: z.uuid("Invalid group."),
})

export const InvitationIdSchema = z.object({
  invitationId: z.uuid("Invalid invitation."),
  groupId: z.uuid("Invalid group."),
})

export const MemberIdSchema = z.object({
  memberId: z.uuid("Invalid member."),
  groupId: z.uuid("Invalid group."),
})

export const UpdateMemberRoleSchema = MemberIdSchema.extend({
  role: z.enum(assignableGroupRoles),
})

export const TransferOwnershipSchema = z.object({
  groupId: z.uuid("Invalid group."),
  targetMemberId: z.uuid("Invalid member."),
})

export type GroupFormState =
  | {
      errors?: {
        name?: string[]
        description?: string[]
        email?: string[]
        role?: string[]
        form?: string[]
      }
      message?: string
      inviteUrl?: string
    }
  | undefined
