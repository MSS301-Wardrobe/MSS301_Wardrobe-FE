const getIndexFromId = (id: string = "", max: number = 3): number => {
    if (!id) return 0;
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % max;
};

// 1. Kho ảnh đa dạng cho Set Trang Phục (Outfit Covers)
const OUTFIT_IMAGES = {
    wedding: [
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&auto=format&fit=crop&q=80"
    ],
    formal_meeting: [
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80"
    ],
    formal_canhan: [
        "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80"
    ],
    formal_nhomban: [
        "https://images.unsplash.com/photo-1543807535-eceef0bc6599?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&auto=format&fit=crop&q=80"
    ],
    party: [
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80"
    ],
    travel: [
        "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&auto=format&fit=crop&q=80"
    ],
    default_casual: [
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1496345875659-11f7dd282d1d?w=600&auto=format&fit=crop&q=80"
    ]
};

// 2. Kho ảnh đa dạng cho Thành Phần Quần Áo (Clothing Items)
const ITEM_IMAGES = {
    somi: [
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=200&auto=format&fit=crop&q=80"
    ],
    thun: [
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=200&auto=format&fit=crop&q=80"
    ],
    tay: [
        "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1542272604-787c3835535d?w=200&auto=format&fit=crop&q=80"
    ],
    jean: [
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=200&auto=format&fit=crop&q=80"
    ],
    oxford: [
        "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=200&auto=format&fit=crop&q=80"
    ],
    sneaker: [
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=200&auto=format&fit=crop&q=80"
    ],
    default_item: [
        "https://images.unsplash.com/photo-1467043237213-65f2da53396f?w=200&auto=format&fit=crop&q=80"
    ]
};

export const getDynamicOutfitImage = (id: string, outfitName: string = "", eventType: string = "") => {
    const name = outfitName.toLowerCase();
    const type = eventType.toLowerCase();
    const index = getIndexFromId(id, 3);

    if (type === 'wedding' || name.includes('wedding') || name.includes('cưới')) {
        return OUTFIT_IMAGES.wedding[index];
    }

    if (name.includes('formal') || name.includes('công sở') || type === 'meeting') {
        if (name.includes('nhóm')) {
            return OUTFIT_IMAGES.formal_nhomban[index];
        }
        if (name.includes('cá nhân')) {
            return OUTFIT_IMAGES.formal_canhan[index];
        }
        return OUTFIT_IMAGES.formal_meeting[index];
    }

    if (type === 'party' || name.includes('party') || name.includes('nhóm')) {
        return OUTFIT_IMAGES.party[index];
    }
    if (type === 'travel' || name.includes('travel') || name.includes('du lịch')) {
        return OUTFIT_IMAGES.travel[index];
    }

    return OUTFIT_IMAGES.default_casual[index];
};

// Hàm nội suy hình ảnh cho từng món quần áo đơn lẻ dựa trên ID món đồ
export const getDynamicItemImage = (id: string, itemName: string = "") => {
    const name = itemName.toLowerCase();
    const index = getIndexFromId(id, 3);

    if (name.includes("sơ mi")) return ITEM_IMAGES.somi[index];
    if (name.includes("thun")) return ITEM_IMAGES.thun[index];
    if (name.includes("tây") || name.includes("quần dài") || name.includes("công sở")) return ITEM_IMAGES.tay[index];
    if (name.includes("jean")) return ITEM_IMAGES.jean[index];
    if (name.includes("oxford") || name.includes("giày da")) return ITEM_IMAGES.oxford[index];
    if (name.includes("sneaker") || name.includes("thể thao")) return ITEM_IMAGES.sneaker[index];

    return ITEM_IMAGES.default_item[0];
};