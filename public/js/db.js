// Shared Database
const productsDatabase = [
    {
        id: "j1",
        department: "jewelry",
        name: "THE CRIMSON TEAR NECKLACE",
        category: "necklace",
        price: 12500,
        description: "A rare pear-cut ruby surrounded by pavé diamonds, set in 18k white gold. This piece is a testament to timeless beauty, featuring a perfectly matched 5-carat ruby sourced from the Mogok valley. The delicate chain sits elegantly on the collarbone, ensuring you capture every ray of light.",
        imagePath: "images/jewelry/necklaces/crimson_tear.jpg",
        material: "gold",
        gemstone: "ruby",
        rating: 4.8
    },
    {
        id: "j2",
        department: "jewelry",
        name: "ETERNITY DIAMOND BAND",
        category: "ring",
        price: 4200,
        description: "A continuous circle of flawless brilliant-cut diamonds, representing eternal romance. The setting minimizes visible metal to maximize the sheer brilliance of the 3-carat total weight diamonds. Designed to be worn alone or stacked for an opulent look.",
        imagePath: "images/jewelry/rings/eternity_band.jpg",
        material: "platinum",
        gemstone: "diamond",
        rating: 4.9
    },
    {
        id: "j3",
        department: "jewelry",
        name: "ROYAL EMERALD BRACELET",
        category: "bracelet",
        price: 6800,
        description: "A delicate fusion of emeralds and gold, crafted for timeless elegance. Features seven vivid green emeralds interspersed with brilliant-cut diamond accents. The clasp is ingeniously hidden, providing a seamless loop of luxury around your wrist.",
        imagePath: "images/jewelry/bracelets/royal_emerald.jpg",
        material: "gold",
        gemstone: "emerald",
        rating: 4.7
    },
    {
        id: "j4",
        department: "jewelry",
        name: "THE ETERNAL DROP EARRINGS",
        category: "earring",
        price: 7900,
        description: "Brilliant diamonds in a graceful drop design, crafted in 18k gold. The earrings feature an articulated joint that allows the diamonds to catch the light beautifully with every movement. A true classic for the modern royal.",
        imagePath: "images/jewelry/earrings/eternal_drop.jpg",
        material: "gold",
        gemstone: "diamond",
        rating: 5.0
    },
    // --- BAGS ---
    {
        id: "b1",
        department: "bags",
        name: "THE MIDNIGHT QUILT",
        category: "shoulder",
        price: 8500,
        description: "An exquisite black quilted leather shoulder bag featuring a prominent gold chain strap and the iconic interlocking gold clasp. Handcrafted from the finest calfskin leather for enduring luxury.",
        imagePath: "images/bags/midnight_quilt.jpg",
        material: "leather",
        rating: 4.9
    },
    {
        id: "b2",
        department: "bags",
        name: "IMPERIAL CRIMSON TOTE",
        category: "tote",
        price: 14200,
        description: "A statement tote crafted from glossy deep crimson red crocodile leather. Finished with polished gold hardware and a spacious interior lined with lambskin.",
        imagePath: "images/bags/crimson_tote.jpg",
        material: "crocodile",
        rating: 4.8
    },
    {
        id: "b3",
        department: "bags",
        name: "THE GOLDEN ERA CLUTCH",
        category: "clutch",
        price: 4900,
        description: "A stunning evening companion. This hard-case box clutch is rendered in metallic gold and adorned with subtle hand-placed crystals that catch every ambient light.",
        imagePath: "images/bags/golden_clutch.jpg",
        material: "metal",
        rating: 4.7
    },
    {
        id: "b4",
        department: "bags",
        name: "THE SAPPHIRE VELVET",
        category: "shoulder",
        price: 6300,
        description: "A plush deep sapphire blue velvet shoulder bag featuring an elegant silver crest clasp and a delicate silver chain. Perfect for the modern evening affair.",
        imagePath: "images/bags/sapphire_velvet.jpg",
        material: "velvet",
        rating: 4.9
    }
];

function getCart() {
    return JSON.parse(localStorage.getItem('sys_cart')) || [];
}

function getWishlist() {
    return JSON.parse(localStorage.getItem('sys_wishlist')) || [];
}
