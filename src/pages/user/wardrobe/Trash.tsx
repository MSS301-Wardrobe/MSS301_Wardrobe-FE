import { useEffect, useState } from "react";
import { useWardrobe } from "../../../hooks/useWardrobe";
import type { Wardrobe, WardrobeZone } from "../../../types/wardrobe";
import { Trash2, RotateCcw, Package, Folder } from "lucide-react";
import { toast } from "sonner";

export function Trash() {
  const { wardrobeApi, wardrobeZoneApi } = useWardrobe();
  const [deletedWardrobes, setDeletedWardrobes] = useState<Wardrobe[]>([]);
  const [deletedZones, setDeletedZones] = useState<WardrobeZone[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeleted = async () => {
    setLoading(true);
    try {
      const [wRes, zRes] = await Promise.all([
        wardrobeApi.getDeleted(),
        wardrobeZoneApi.getDeleted(),
      ]);
      setDeletedWardrobes(wRes);
      setDeletedZones(zRes);
    } catch (err) {
      toast.error("Không thể tải danh sách thùng rác");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeleted();
  }, []);

  const handleRestoreWardrobe = async (id: string) => {
    try {
      await wardrobeApi.restore(id);
      toast.success("Đã khôi phục tủ đồ thành công");
      fetchDeleted();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Khôi phục tủ đồ thất bại");
    }
  };

  const handleRestoreZone = async (id: string) => {
    try {
      await wardrobeZoneApi.restore(id);
      toast.success("Đã khôi phục ngăn kéo thành công");
      fetchDeleted();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Khôi phục ngăn kéo thất bại");
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Đang tải...</div>;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 60 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0F172A", marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
          <Trash2 size={28} color="#EA580C" />
          Thùng Rác
        </h1>
        <p style={{ color: "#64748B", fontSize: "0.95rem" }}>
          Các mục trong thùng rác sẽ bị xóa vĩnh viễn sau 30 ngày kể từ ngày xóa.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {/* Wardrobes */}
        <div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#1E293B", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <Package size={20} color="#64748B" />
            Tủ Đồ Đã Xóa ({deletedWardrobes.length})
          </h2>
          {deletedWardrobes.length === 0 ? (
            <div style={{ background: "white", padding: 32, borderRadius: 16, border: "1px dashed #CBD5E1", textAlign: "center" }}>
              <p style={{ color: "#94A3B8" }}>Không có tủ đồ nào trong thùng rác.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
              {deletedWardrobes.map((w) => (
                <div key={w.wardrobeId} style={{ background: "white", borderRadius: 16, border: "1px solid #E2E8F0", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>{w.wardrobeName}</h3>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={() => handleRestoreWardrobe(w.wardrobeId)}
                      style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px", borderRadius: 10, background: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0", fontWeight: 600, cursor: "pointer" }}
                    >
                      <RotateCcw size={16} /> Khôi Phục
                    </button>
                    {/* Chưa có API Xóa cứng cho Tủ, tạm thời disable hoặc làm cảnh báo */}
                    <button
                      disabled
                      style={{ padding: "10px", borderRadius: 10, background: "#F1F5F9", color: "#94A3B8", border: "1px solid #E2E8F0", cursor: "not-allowed" }}
                      title="Tính năng xóa vĩnh viễn tủ đồ đang phát triển"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Zones */}
        <div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#1E293B", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <Folder size={20} color="#64748B" />
            Ngăn Kéo Đã Xóa ({deletedZones.length})
          </h2>
          {deletedZones.length === 0 ? (
            <div style={{ background: "white", padding: 32, borderRadius: 16, border: "1px dashed #CBD5E1", textAlign: "center" }}>
              <p style={{ color: "#94A3B8" }}>Không có ngăn kéo nào trong thùng rác.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
              {deletedZones.map((z) => (
                <div key={z.zoneId} style={{ background: "white", borderRadius: 16, border: "1px solid #E2E8F0", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>{z.zoneName}</h3>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={() => handleRestoreZone(z.zoneId)}
                      style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px", borderRadius: 10, background: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0", fontWeight: 600, cursor: "pointer" }}
                    >
                      <RotateCcw size={16} /> Khôi Phục
                    </button>
                    {/* Chưa có API Xóa cứng cho Zone, tạm thời disable */}
                    <button
                      disabled
                      style={{ padding: "10px", borderRadius: 10, background: "#F1F5F9", color: "#94A3B8", border: "1px solid #E2E8F0", cursor: "not-allowed" }}
                      title="Tính năng xóa vĩnh viễn ngăn kéo đang phát triển"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
