import React from "react";

interface OutfitGridProps {
    items: any[];
}

export function OutfitGrid({ items }: OutfitGridProps) {
    if (!items || items.length === 0) {
        return (
            <div style={{ width: "100%", aspectRatio: "3/2", backgroundColor: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#94A3B8", fontWeight: 600, fontSize: "0.85rem" }}>Chưa có vật phẩm</span>
            </div>
        );
    }

    const getImgUrl = (item: any) => {
        return item.imageId
            ? `http://localhost:8080/api/v1/storage/files/${item.imageId}`
            : "https://placehold.co/500x500/F8FAFC/94A3B8?text=Chưa+có+ảnh";
    };

    if (items.length === 1) {
        return (
            <img
                src={getImgUrl(items[0])}
                alt="Outfit item"
                style={{ width: "100%", aspectRatio: "3/2", objectFit: "cover" }}
            />
        );
    }

    if (items.length === 2) {
        return (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", width: "100%", aspectRatio: "3/2", gap: "2px", background: "white" }}>
                <img src={getImgUrl(items[0])} alt="Item 1" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <img src={getImgUrl(items[1])} alt="Item 2" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
        );
    }

    return (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", width: "100%", aspectRatio: "3/2", gap: "2px", background: "white" }}>
            <img src={getImgUrl(items[0])} alt="Item 1" style={{ width: "100%", height: "100%", objectFit: "cover" }} />

            <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: "2px" }}>
                <img src={getImgUrl(items[1])} alt="Item 2" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <img src={getImgUrl(items[2])} alt="Item 3" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
        </div>
    );
}