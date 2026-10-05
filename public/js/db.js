// Shared Database
const jewelryDatabase = [
    {
        id: "j1",
        name: "THE CRIMSON TEAR NECKLACE",
        category: "necklace",
        price: 12500,
        description: "A rare pear-cut ruby surrounded by pavé diamonds, set in 18k white gold. This piece is a testament to timeless beauty, featuring a perfectly matched 5-carat ruby sourced from the Mogok valley. The delicate chain sits elegantly on the collarbone, ensuring you capture every ray of light.",
        imagePath: "images/jewelry/necklaces/crimson_tear.jpg",
        material: "gold",
        gemstone: "ruby"
    },
    {
        id: "j2",
        name: "ETERNITY DIAMOND BAND",
        category: "ring",
        price: 4200,
        description: "A continuous circle of flawless brilliant-cut diamonds, representing eternal romance. The setting minimizes visible metal to maximize the sheer brilliance of the 3-carat total weight diamonds. Designed to be worn alone or stacked for an opulent look.",
        imagePath: "images/jewelry/rings/eternity_band.jpg",
        material: "platinum",
        gemstone: "diamond"
    },
    {
        id: "j3",
        name: "ROYAL EMERALD BRACELET",
        category: "bracelet",
        price: 6800,
        description: "A delicate fusion of emeralds and gold, crafted for timeless elegance. Features seven vivid green emeralds interspersed with brilliant-cut diamond accents. The clasp is ingeniously hidden, providing a seamless loop of luxury around your wrist.",
        imagePath: "images/jewelry/bracelets/royal_emerald.jpg",
        material: "gold",
        gemstone: "emerald"
    },
    {
        id: "j4",
        name: "THE ETERNAL DROP EARRINGS",
        category: "earring",
        price: 7900,
        description: "Brilliant diamonds in a graceful drop design, crafted in 18k gold. The earrings feature an articulated joint that allows the diamonds to catch the light beautifully with every movement. A true classic for the modern royal.",
        imagePath: "images/jewelry/earrings/eternal_drop.jpg",
        material: "gold",
        gemstone: "diamond"
    }
];

function getCart() {
    return JSON.parse(localStorage.getItem('sys_cart')) || [];
}

function getWishlist() {
    return JSON.parse(localStorage.getItem('sys_wishlist')) || [];
}
