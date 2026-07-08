import { apiClient } from "./apiClient";
import { ApiResponse } from "@/types/apiResonse";
import {
  FriendGroup,
  CreateFriendGroupRequest,
  FriendGroupDetail,
} from "@/types/group";

export type FriendGroupInvitation = {
  invitationId: string;
  groupId: string;
  groupName: string;
  groupEmoji?: string;
  inviterId: string;
  inviterName: string;
  inviterEmail: string;
  inviteeId: string;
  inviteeName: string;
  inviteeEmail: string;
  status: string;
  expiredAt: string;
  createdAt: string;
};

export type FriendGroupJoinRequest = {
  requestId: string;
  groupId: string;
  groupName: string;
  groupEmoji?: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  requesterAvatarUrl?: string;
  message?: string;
  previouslyKicked: boolean;
  status: string;
  expiredAt: string;
  createdAt: string;
};

export const friendGroupService = {
  async createGroup(payload: CreateFriendGroupRequest): Promise<FriendGroup> {
    const { data } = await apiClient.post<ApiResponse<FriendGroup>>(
      "/users/friend-groups",
      payload,
    );

    return data.data;
  },

  async getMyGroups(): Promise<FriendGroup[]> {
    const { data } = await apiClient.get<ApiResponse<FriendGroup[]>>(
      "/users/friend-groups/my",
    );

    return data.data;
  },

  async discoverGroups(): Promise<FriendGroup[]> {
    const { data } = await apiClient.get<ApiResponse<FriendGroup[]>>(
      "/users/friend-groups/discover",
    );

    return data.data;
  },

  // User bấm "Tham gia" => gửi yêu cầu tham gia, không vào nhóm trực tiếp nữa
  async requestToJoinGroup(
    groupId: string,
    payload?: { message?: string },
  ) {
    const { data } = await apiClient.post(
      `/users/friend-groups/${groupId}/join-requests`,
      payload ?? {},
    );

    return data;
  },

  // Nếu code cũ đang gọi joinGroup(), giữ alias này để khỏi sửa nhiều chỗ
  async joinGroup(groupId: string): Promise<any> {
    return this.requestToJoinGroup(groupId);
  },

  async getGroupDetail(groupId: string): Promise<FriendGroupDetail> {
    const { data } = await apiClient.get<ApiResponse<FriendGroupDetail>>(
      `/users/friend-groups/${groupId}/detail`,
    );

    return data.data;
  },

  async inviteMember(groupId: string, payload: { email: string }) {
    const { data } = await apiClient.post(
      `/users/friend-groups/${groupId}/invitations`,
      payload,
    );

    return data;
  },

  async kickMember(groupId: string, memberId: string) {
    const { data } = await apiClient.delete(
      `/users/friend-groups/${groupId}/members/${memberId}`,
    );

    return data;
  },

  async leaveGroup(groupId: string) {
    const { data } = await apiClient.post(
      `/users/friend-groups/${groupId}/leave`,
    );

    return data;
  },

  async deleteGroup(groupId: string) {
    const { data } = await apiClient.delete(
      `/users/friend-groups/${groupId}`,
    );

    return data;
  },

  async getMyInvitations(): Promise<FriendGroupInvitation[]> {
    const { data } = await apiClient.get<ApiResponse<FriendGroupInvitation[]>>(
      `/users/friend-groups/invitations/me`,
    );

    return data.data;
  },

  async acceptInvitation(invitationId: string) {
    const { data } = await apiClient.post(
      `/users/friend-groups/invitations/${invitationId}/accept`,
    );

    return data;
  },

  async declineInvitation(invitationId: string) {
    const { data } = await apiClient.post(
      `/users/friend-groups/invitations/${invitationId}/decline`,
    );

    return data;
  },

  async cancelInvitation(groupId: string, invitationId: string) {
    const { data } = await apiClient.delete(
      `/users/friend-groups/${groupId}/invitations/${invitationId}`,
    );

    return data;
  },

  async getGroupJoinRequests(
    groupId: string,
  ): Promise<FriendGroupJoinRequest[]> {
    const { data } = await apiClient.get<ApiResponse<FriendGroupJoinRequest[]>>(
      `/users/friend-groups/${groupId}/join-requests`,
    );

    return data.data;
  },

  async acceptJoinRequest(requestId: string) {
    const { data } = await apiClient.post(
      `/users/friend-groups/join-requests/${requestId}/accept`,
    );

    return data;
  },

  async rejectJoinRequest(requestId: string) {
    const { data } = await apiClient.post(
      `/users/friend-groups/join-requests/${requestId}/reject`,
    );

    return data;
  },

  async cancelJoinRequest(requestId: string) {
    const { data } = await apiClient.post(
      `/users/friend-groups/join-requests/${requestId}/cancel`,
    );

    return data;
  },
};

export default friendGroupService;