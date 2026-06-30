export interface FriendGroup {
  groupId: string;
  groupName: string;
  description?: string | null;
  emoji?: string | null;
  ownerId?: string;
  ownerName?: string;
  memberCount: number;
  myRole?: "OWNER" | "ADMIN" | "MEMBER" | null;
  active: boolean;
  createdAt?: string | null;
}

export interface CreateFriendGroupRequest {
  groupName: string;
  description?: string;
  emoji?: string;
}