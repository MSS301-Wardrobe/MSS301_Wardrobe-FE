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
  /** Phong cách chủ đạo của nhóm (e.g. ["MINIMAL", "OFFICE"]) */
  primaryStyles?: string[] | null;
  /** Nhãn tiếng Việt (e.g. ["Tối Giản", "Công Sở"]) */
  primaryStyleLabels?: string[] | null;
  /** Bảng màu đặc trưng — gom từ favoriteColors thành viên */
  colorPalette?: string[];
}

export interface CreateFriendGroupRequest {
  groupName: string;
  description?: string;
  emoji?: string;
  /** Các phong cách chủ đạo của nhóm. Bắt buộc từ BE, nhưng FE có thể tuỳ chọn lúc init. */
  primaryStyles?: string[];
}

export interface GroupStyleStat {
  styleName: string;
  label: string;
  percentage: number;
}

export interface GroupActiveMember {
  userId: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  mainStyle?: string | null;
  mainStyleLabel?: string | null;
  role: string;
}

export interface GroupMember {
  memberId: String;
  userId: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  role: string;
  joinedAt?: string;
}

export interface FriendGroupDetail {
  groupId: string;
  groupName: string;
  description?: string;
  emoji?: string;
  myRole: string;
  memberCount: number;
  primaryStyles?: string[] | null;
  primaryStyleLabels?: string[] | null;
  status: string;
  createdAt: string;
  commonStyles: GroupStyleStat[];
  colorPalette: string[];
  activeMembers: GroupActiveMember[];
  members: GroupMember[];
}

