import { apiClient } from "./apiClient";
import { ApiResponse } from "@/types/apiResonse";
import {FriendGroup, CreateFriendGroupRequest} from "@/types/group"

export const friendGroupService = {
  async createGroup(payload: CreateFriendGroupRequest): Promise<FriendGroup> {
    const { data } = await apiClient.post<ApiResponse<FriendGroup>>(
      "/users/friend-groups",
      payload
    );

    return data.data;
  },

  async getMyGroups(): Promise<FriendGroup[]> {
    const { data } = await apiClient.get<ApiResponse<FriendGroup[]>>(
      "/users/friend-groups/my"
    );

    return data.data;
  },

  async discoverGroups(): Promise<FriendGroup[]> {
    const { data } = await apiClient.get<ApiResponse<FriendGroup[]>>(
      "/users/friend-groups/discover"
    );

    return data.data;
  },

  async joinGroup(groupId: string): Promise<FriendGroup> {
    const { data } = await apiClient.post<ApiResponse<FriendGroup>>(
      `/users/friend-groups/${groupId}/join`
    );

    return data.data;
  },
};