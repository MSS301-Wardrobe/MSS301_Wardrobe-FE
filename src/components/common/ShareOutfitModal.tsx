import { useState, useEffect } from "react";
import { X, Search, Share2, Loader2, CheckCircle2, Package } from "lucide-react";
import { toast } from "sonner";
import { clothingItemApi, groupSharedApi } from "@/services/wardrobeService";
import { storageService } from "@/services/storageService";
import type { ClothingItem } from "@/types/wardrobe";

interface ShareOutfitModalProps {
  groupId: string;
  onClose: () => void;
  onShared: () => void; // callback sau khi share thành công → invalidate query bên ngoài
}

/** Map imageId → presigned URL (cache trong session) */
const urlCache = new Map<string, string>();

async function resolveImageUrl(imageId?: string): Promise<string | undefined> {
  if (!imageId) return undefined;
  if (urlCache.has(imageId)) return urlCache.get(imageId);
  try {
    const url = await storageService.getPresignedUrl(imageId);
    urlCache.set(imageId, url);
    return url;
  } catch {
    return undefined;
  }
}

export function ShareOutfitModal({ groupId, onClose, onShared }: ShareOutfitModalProps) {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

  // Fetch clothing items của user
  useEffect(() => {
    clothingItemApi
      .getAll()
      .then(async (data) => {
        setItems(data);
        // Resolve image URLs song song
        const entries = await Promise.all(
          data
            .filter((item) => item.imageId)
            .map(async (item) => {
              const url = await resolveImageUrl(item.imageId);
              return url ? ([item.itemId, url] as [string, string]) : null;
            })
        );
        const urlMap: Record<string, string> = {};
        entries.forEach((e) => {
          if (e) urlMap[e[0]] = e[1];
        });
        setImageUrls(urlMap);
      })
      .catch(() => toast.error("Không thể tải danh sách trang phục"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((item) =>
    item.itemName.toLowerCase().includes(search.toLowerCase())
  );

  const handleShare = async () => {
    if (!selectedId) return;
    setSharing(true);
    try {
      await groupSharedApi.shareItem({ clothingItemId: selectedId, groupId });
      toast.success("Đã chia sẻ trang phục vào nhóm!");
      onShared();
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Chia sẻ thất bại";
      toast.error(msg);
    } finally {
      setSharing(false);
    }
  };

  return (
    /* Backdrop */
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.55)",
        backdropFilter: "blur(4px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Modal box */}
      <div
        style={{
          background: "white",
          borderRadius: 24,
          width: "100%",
          maxWidth: 620,
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #EA580C, #F97316)",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Share2 size={20} color="white" />
            <h2 style={{ color: "white", fontWeight: 800, fontSize: "1.05rem", margin: 0 }}>
              Chia sẻ trang phục vào nhóm
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              borderRadius: 8,
              padding: "6px 8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={16} color="white" />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: "16px 24px 0" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#F8FAFC",
              border: "1.5px solid #E2E8F0",
              borderRadius: 12,
              padding: "10px 14px",
            }}
          >
            <Search size={15} color="#94A3B8" />
            <input
              type="text"
              placeholder="Tìm kiếm trang phục..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: "none",
                background: "transparent",
                outline: "none",
                fontSize: "0.875rem",
                flex: 1,
                color: "#0F172A",
              }}
            />
          </div>
        </div>

        {/* Body */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 24px",
          }}
        >
          {loading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: 40,
                color: "#64748B",
              }}
            >
              <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              Đang tải trang phục...
            </div>
          ) : filtered.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: 40,
                color: "#94A3B8",
              }}
            >
              <Package size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
              <p style={{ fontWeight: 600, color: "#64748B", marginBottom: 4 }}>
                Không tìm thấy trang phục
              </p>
              <p style={{ fontSize: "0.8rem" }}>
                Thử thêm trang phục vào tủ đồ trước nhé!
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                gap: 12,
              }}
            >
              {filtered.map((item) => {
                const isSelected = selectedId === item.itemId;
                const imgUrl = imageUrls[item.itemId];
                return (
                  <button
                    key={item.itemId}
                    onClick={() => setSelectedId(isSelected ? null : item.itemId)}
                    style={{
                      border: isSelected ? "2.5px solid #EA580C" : "1.5px solid #E2E8F0",
                      borderRadius: 14,
                      overflow: "hidden",
                      background: isSelected ? "#FFF7ED" : "white",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      position: "relative",
                      textAlign: "left",
                      padding: 0,
                      boxShadow: isSelected
                        ? "0 0 0 3px rgba(234,88,12,0.15)"
                        : "0 2px 8px rgba(0,0,0,0.04)",
                    }}
                  >
                    {/* Item image */}
                    <div
                      style={{
                        width: "100%",
                        aspectRatio: "1/1",
                        background: imgUrl
                          ? "none"
                          : item.dominantColor
                          ? `${item.dominantColor}33`
                          : "#F1F5F9",
                        position: "relative",
                      }}
                    >
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={item.itemName}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Package size={28} color="#CBD5E1" />
                        </div>
                      )}

                      {/* Dominant color dot */}
                      {item.dominantColor && (
                        <div
                          style={{
                            position: "absolute",
                            top: 8,
                            left: 8,
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            background: item.dominantColor,
                            border: "1.5px solid white",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                          }}
                        />
                      )}

                      {/* Selected check */}
                      {isSelected && (
                        <div
                          style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            background: "#EA580C",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <CheckCircle2 size={20} color="white" />
                        </div>
                      )}
                    </div>

                    {/* Item name */}
                    <div style={{ padding: "8px 10px" }}>
                      <p
                        style={{
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          color: isSelected ? "#EA580C" : "#0F172A",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          margin: 0,
                        }}
                      >
                        {item.itemName}
                      </p>
                      {item.style && (
                        <p
                          style={{
                            fontSize: "0.68rem",
                            color: "#94A3B8",
                            margin: "2px 0 0",
                            textTransform: "capitalize",
                          }}
                        >
                          {item.style}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #F1F5F9",
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              border: "1.5px solid #E2E8F0",
              background: "white",
              color: "#64748B",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            Hủy
          </button>
          <button
            onClick={handleShare}
            disabled={!selectedId || sharing}
            style={{
              padding: "10px 24px",
              borderRadius: 10,
              border: "none",
              background:
                !selectedId || sharing
                  ? "#CBD5E1"
                  : "linear-gradient(135deg, #EA580C, #F97316)",
              color: "white",
              fontWeight: 700,
              fontSize: "0.875rem",
              cursor: !selectedId || sharing ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 7,
              transition: "background 0.2s ease",
            }}
          >
            {sharing ? (
              <>
                <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
                Đang chia sẻ...
              </>
            ) : (
              <>
                <Share2 size={15} />
                Chia sẻ
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
