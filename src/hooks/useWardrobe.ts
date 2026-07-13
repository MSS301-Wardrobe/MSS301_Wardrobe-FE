import { useNavigate } from "react-router";
import { toast } from "sonner";
import { AxiosError } from "axios";
import {
  clothingItemApi as _clothingItemApi,
  wardrobeApi as _wardrobeApi,
  wardrobeZoneApi as _wardrobeZoneApi,
  categoryApi as _categoryApi,
  ensureAiCategoryCatalog as _ensureAiCategoryCatalog,
  resolveCategoryFromAi as _resolveCategoryFromAi,
} from "../services/wardrobeService";

export function useWardrobe() {
  const navigate = useNavigate();

  function handleAuthError(error: unknown): boolean {
    const axiosError = error as AxiosError;
    const status = axiosError?.response?.status;
    const data = axiosError?.response?.data as any;

    const detailMsg =
      typeof data?.detail === "object" ? data.detail?.message : data?.detail;
    const serverMsg = data?.message ?? detailMsg;

    if (status === 401) {
      toast.error(serverMsg ?? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      navigate("/login");
      return true;
    }

    if (status === 403) {
      toast.error(serverMsg ?? "Bạn không có quyền thực hiện hành động này.");
      return true;
    }

    return false;
  }

  const wrap = <TArgs extends any[], TRet>(apiFn: (...args: TArgs) => Promise<TRet>) => {
    return async (...args: TArgs): Promise<TRet> => {
      try {
        return await apiFn(...args);
      } catch (error) {
        handleAuthError(error);
        throw error;
      }
    };
  };

  const wrapObject = <T extends Record<string, (...args: any[]) => Promise<any>>>(obj: T): T => {
    const wrapped: any = {};
    for (const key in obj) {
      if (typeof obj[key] === "function") {
        wrapped[key] = wrap(obj[key]);
      }
    }
    return wrapped as T;
  };

  return {
    clothingItemApi: wrapObject(_clothingItemApi),
    wardrobeApi: wrapObject(_wardrobeApi),
    wardrobeZoneApi: wrapObject(_wardrobeZoneApi),
    categoryApi: wrapObject(_categoryApi),
    ensureAiCategoryCatalog: wrap(_ensureAiCategoryCatalog),
    resolveCategoryFromAi: wrap(_resolveCategoryFromAi),
  };
}

export default useWardrobe;
