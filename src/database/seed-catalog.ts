/**
 * Canonical Chaiwale Master Catalog & Offline Menu Seed
 * Synchronized with Live Supabase Database
 * 21 Categories, 144 Dishes, 141 Variants
 */

export const SEED_CATEGORIES = [
    {
        "display_order":  1,
        "name":  "Thali Mein Khushiyaan",
        "id":  "thali-mein-khushiyaan",
        "slug":  "thali-mein-khushiyaan",
        "is_active":  true
    },
    {
        "display_order":  2,
        "name":  "Full Pet Pooja - Meals \u0026 Combos",
        "id":  "full-pet-pooja-meals-combos",
        "slug":  "full-pet-pooja-meals-combos",
        "is_active":  true
    },
    {
        "display_order":  3,
        "name":  "Dum Hai Toh Biryani Hai",
        "id":  "dum-hai-toh-biryani-hai",
        "slug":  "dum-hai-toh-biryani-hai",
        "is_active":  true
    },
    {
        "display_order":  4,
        "name":  "Angaar Ka Tamasha",
        "id":  "angaar-ka-tamasha",
        "slug":  "angaar-ka-tamasha",
        "is_active":  true
    },
    {
        "display_order":  5,
        "name":  "Chicken Shicken \u0026 Non-Veg",
        "id":  "chicken-shicken-non-veg",
        "slug":  "chicken-shicken-non-veg",
        "is_active":  true
    },
    {
        "display_order":  6,
        "name":  "Veg Tadka Junction",
        "id":  "veg-tadka-junction",
        "slug":  "veg-tadka-junction",
        "is_active":  true
    },
    {
        "display_order":  7,
        "name":  "Roti",
        "id":  "roti",
        "slug":  "roti",
        "is_active":  true
    },
    {
        "display_order":  8,
        "name":  "Rice",
        "id":  "rice",
        "slug":  "rice",
        "is_active":  true
    },
    {
        "display_order":  9,
        "name":  "Chaap Chowk",
        "id":  "chaap-chowk",
        "slug":  "chaap-chowk",
        "is_active":  true
    },
    {
        "display_order":  10,
        "name":  "Burger Junction",
        "id":  "burger-junction",
        "slug":  "burger-junction",
        "is_active":  true
    },
    {
        "display_order":  11,
        "name":  "Chatori Gali",
        "id":  "chatori-gali",
        "slug":  "chatori-gali",
        "is_active":  true
    },
    {
        "display_order":  12,
        "name":  "Crunch Ka Punch",
        "id":  "crunch-ka-punch",
        "slug":  "crunch-ka-punch",
        "is_active":  true
    },
    {
        "display_order":  13,
        "name":  "Desi Meets Chinese",
        "id":  "desi-meets-chinese",
        "slug":  "desi-meets-chinese",
        "is_active":  true
    },
    {
        "display_order":  14,
        "name":  "Momo Mania",
        "id":  "momo-mania",
        "slug":  "momo-mania",
        "is_active":  true
    },
    {
        "display_order":  15,
        "name":  "Maggi Wali Feeling",
        "id":  "maggi-wali-feeling",
        "slug":  "maggi-wali-feeling",
        "is_active":  true
    },
    {
        "display_order":  16,
        "name":  "Eggs-tra Special",
        "id":  "eggs-tra-special",
        "slug":  "eggs-tra-special",
        "is_active":  true
    },
    {
        "display_order":  17,
        "name":  "Sandwich Shandaar",
        "id":  "sandwich-shandaar",
        "slug":  "sandwich-shandaar",
        "is_active":  true
    },
    {
        "display_order":  18,
        "name":  "Paratha Party \u0026 Breakfast",
        "id":  "paratha-party-breakfast",
        "slug":  "paratha-party-breakfast",
        "is_active":  true
    },
    {
        "display_order":  19,
        "name":  "Sip Sip Hooray",
        "id":  "sip-sip-hooray",
        "slug":  "sip-sip-hooray",
        "is_active":  true
    },
    {
        "display_order":  20,
        "name":  "Chai Pe Charcha",
        "id":  "chai-pe-charcha",
        "slug":  "chai-pe-charcha",
        "is_active":  true
    },
    {
        "display_order":  21,
        "name":  "Vrat Wala Pyaar",
        "id":  "vrat-wala-pyaar",
        "slug":  "vrat-wala-pyaar",
        "is_active":  true
    }
];

export const SEED_ITEMS = [
    {
        "slug":  "tawa-pe-swag-roti",
        "id":  "tawa-pe-swag-roti",
        "category_id":  "508dee75-4088-4a6c-84d3-5c6886f97ea6",
        "base_price":  20.00,
        "description":  "Freshly puffed whole wheat tawa roti, rolled hot and homestyle soft.",
        "image_path":  null,
        "name":  "Tawa Pe Swag Roti",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "egg-ka-protein-shot",
        "id":  "egg-ka-protein-shot",
        "category_id":  "7085bf3e-c8f5-436f-b514-e98f7cef6b7a",
        "base_price":  20.00,
        "description":  "Freshly boiled egg seasoned with special roasted chaat masala and black pepper.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/egg-items/boiled-egg.webp",
        "name":  "Egg Ka Protein Shot",
        "is_egg":  true,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "chatpata-jaljeera-shot",
        "id":  "chatpata-jaljeera-shot",
        "category_id":  "e1d922b2-8bf2-41e4-8ee0-2e6c23ca5479",
        "base_price":  30.00,
        "description":  "Refreshing traditional jaljeera with a tangy and spiced flavor.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/shakes-drinks/jaljeera.webp",
        "name":  "Chatpata Jaljeera Shot",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "angaar-wali-roti",
        "id":  "angaar-wali-roti",
        "category_id":  "508dee75-4088-4a6c-84d3-5c6886f97ea6",
        "base_price":  30.00,
        "description":  "1 Tandoori roti.",
        "image_path":  null,
        "name":  "Angaar Wali Roti",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "butter-ka-tashan-roti",
        "id":  "butter-ka-tashan-roti",
        "category_id":  "508dee75-4088-4a6c-84d3-5c6886f97ea6",
        "base_price":  30.00,
        "description":  "Piping hot whole wheat tawa roti brushed generously with melted golden butter.",
        "image_path":  null,
        "name":  "Butter Ka Tashan Roti",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "bread-pakoda-ka-blast-1-piece",
        "id":  "bread-pakoda-ka-blast-1-piece",
        "category_id":  "b1c07678-5feb-4e88-8fd0-0473ba78f792",
        "base_price":  30.00,
        "description":  "Crispy bread pakoda with a flavorful spiced filling.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/snacks/bread-pakoda.webp",
        "name":  "Bread Pakoda Ka Blast (1 Piece)",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "mitti-ke-kulhad-wali-chai",
        "id":  "mitti-ke-kulhad-wali-chai",
        "category_id":  "df1cad67-c2cf-4024-ada8-73d85341bdd8",
        "base_price":  30.00,
        "description":  "Traditional kulhad chai with a rich desi taste.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/tea/tea.webp",
        "name":  "Mitti Ke Kulhad Wali Chai",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "samosa-ka-swag-1-piece",
        "id":  "samosa-ka-swag-1-piece",
        "category_id":  "b1c07678-5feb-4e88-8fd0-0473ba78f792",
        "base_price":  30.00,
        "description":  "Fresh and crispy samosa with a traditional spiced filling.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/snacks/samosa.webp",
        "name":  "Samosa Ka Swag (1 Piece)",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "hot-coffee-ka-sukoon",
        "id":  "hot-coffee-ka-sukoon",
        "category_id":  "df1cad67-c2cf-4024-ada8-73d85341bdd8",
        "base_price":  40.00,
        "description":  "Freshly brewed hot coffee with a smooth taste.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/tea/coffee.webp",
        "name":  "Hot Coffee Ka Sukoon",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "butter-angaar-blast-roti",
        "id":  "butter-angaar-blast-roti",
        "category_id":  "508dee75-4088-4a6c-84d3-5c6886f97ea6",
        "base_price":  40.00,
        "description":  "1 Butter tandoori roti.",
        "image_path":  null,
        "name":  "Butter Angaar Blast Roti",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "chai-wale-ki-special-chuski",
        "id":  "chai-wale-ki-special-chuski",
        "category_id":  "df1cad67-c2cf-4024-ada8-73d85341bdd8",
        "base_price":  40.00,
        "description":  "Special milk tea brewed with rich flavor and aroma.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/tea/chai-wale-special-milk-tea.webp",
        "name":  "Chai Wale Ki Special Chuski",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "lemon-tea-ki-taazgi",
        "id":  "lemon-tea-ki-taazgi",
        "category_id":  "df1cad67-c2cf-4024-ada8-73d85341bdd8",
        "base_price":  40.00,
        "description":  "Refreshing lemon tea with a light citrus flavor.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/tea/lemon-tea.webp",
        "name":  "Lemon Tea Ki Taazgi",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "paneer-bread-pakoda-delight-1-piece",
        "id":  "paneer-bread-pakoda-delight-1-piece",
        "category_id":  "b1c07678-5feb-4e88-8fd0-0473ba78f792",
        "base_price":  40.00,
        "description":  "Crispy bread pakoda filled with flavorful paneer.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/snacks/paneer-bread-pakoda.webp",
        "name":  "Paneer Bread Pakoda Delight (1 Piece)",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "black-coffee-ka-kick",
        "id":  "black-coffee-ka-kick",
        "category_id":  "df1cad67-c2cf-4024-ada8-73d85341bdd8",
        "base_price":  50.00,
        "description":  "Strong and refreshing black coffee served hot.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/tea/black-coffee.webp",
        "name":  "Black Coffee Ka Kick",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "mumbai-ka-hero-vada-pav",
        "id":  "mumbai-ka-hero-vada-pav",
        "category_id":  "912dcac3-81d0-469d-8891-fd183a36e744",
        "base_price":  50.00,
        "description":  "A classic Indian street-food favourite featuring a spiced potato fritter served in a soft pav bun with chutneys.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/chatori-gali/mumbai-ka-hero-vada-pav.webp",
        "name":  "Mumbai Ka Hero - Vada Pav",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "green-tea-feel-light",
        "id":  "green-tea-feel-light",
        "category_id":  "df1cad67-c2cf-4024-ada8-73d85341bdd8",
        "base_price":  50.00,
        "description":  "Light and soothing green tea served hot.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/tea/green-tea.webp",
        "name":  "Green Tea, Feel Light",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "crispy-butter-toast-2-pieces",
        "id":  "crispy-butter-toast-2-pieces",
        "category_id":  "b1bd277f-e509-464f-b538-8b0d4f4a6304",
        "base_price":  50.00,
        "description":  "Crispy toasted bread generously spread with butter.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/sandwich/butter-toast.webp",
        "name":  "Crispy Butter Toast (2 Pieces)",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "naan-stop-masti-naan",
        "id":  "naan-stop-masti-naan",
        "category_id":  "508dee75-4088-4a6c-84d3-5c6886f97ea6",
        "base_price":  60.00,
        "description":  "1 Plain naan.",
        "image_path":  null,
        "name":  "Naan Stop Masti Naan",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "dal-chawal-comfort-bowl",
        "id":  "dal-chawal-comfort-bowl",
        "category_id":  "64c27dad-f538-4ac9-9084-844b80f7f6d8",
        "base_price":  60.00,
        "description":  "Yellow dal served with steamed rice.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/lunch/yellow-dal-chawal-0af7.webp",
        "name":  "Dal Chawal Comfort Bowl",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "punjabi-kadhi-chawal",
        "id":  "punjabi-kadhi-chawal",
        "category_id":  "64c27dad-f538-4ac9-9084-844b80f7f6d8",
        "base_price":  60.00,
        "description":  "Comforting Punjabi kadhi served with steamed rice.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/lunch/kadhi-chawal-f4ad.webp",
        "name":  "Punjabi Kadhi Chawal",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "chatpate-chhole-chawal",
        "id":  "chatpate-chhole-chawal",
        "category_id":  "64c27dad-f538-4ac9-9084-844b80f7f6d8",
        "base_price":  60.00,
        "description":  "Chhole served with steamed rice.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/lunch/chhole-chawal-29ad.webp",
        "name":  "Chatpate Chhole Chawal",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "crispy-bread-roll-masti-1-piece",
        "id":  "crispy-bread-roll-masti-1-piece",
        "category_id":  "b1c07678-5feb-4e88-8fd0-0473ba78f792",
        "base_price":  60.00,
        "description":  "Crispy bread roll with a delicious savory filling.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/snacks/bread-roll.webp",
        "name":  "Crispy Bread Roll Masti (1 Piece)",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "veggie-sandwich-masti",
        "id":  "veggie-sandwich-masti",
        "category_id":  "b1bd277f-e509-464f-b538-8b0d4f4a6304",
        "base_price":  60.00,
        "description":  "Fresh vegetable sandwich with a flavorful filling.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/sandwich/veg-sandwich.webp",
        "name":  "Veggie Sandwich Masti",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "butter-bun-ka-swag",
        "id":  "butter-bun-ka-swag",
        "category_id":  "b1bd277f-e509-464f-b538-8b0d4f4a6304",
        "base_price":  60.00,
        "description":  "Soft bun served with creamy butter.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/sandwich/bun-maska.webp",
        "name":  "Butter Bun Ka Swag",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "peeli-dal-ka-tadka-tashan",
        "id":  "peeli-dal-ka-tadka-tashan",
        "category_id":  "6f9f77b5-0f7c-4ba5-9d32-b64d3de84679",
        "base_price":  60.00,
        "description":  "Yellow arhar dal tempered homestyle with golden garlic, cumin seeds, fresh tomatoes, and desi ghee tadka.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/veg-tadka-junction/peeli-dal-ka-tadka-tashan.webp",
        "name":  "Peeli Dal Ka Tadka Tashan",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "panchmel-dal-ka-tadka-tashan",
        "id":  "panchmel-dal-ka-tadka-tashan",
        "category_id":  "6f9f77b5-0f7c-4ba5-9d32-b64d3de84679",
        "base_price":  60.00,
        "description":  "Traditional Rajasthani blend of five nutritious lentils simmered with aromatic spices and a smoky ghee tadka.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/veg-tadka-junction/panchmel-dal-ka-tadka-tashan.webp",
        "name":  "Panchmel Dal Ka Tadka Tashan",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "patakha-pyaz-paratha",
        "id":  "patakha-pyaz-paratha",
        "category_id":  "b6da6f06-2733-4eec-91cb-9c4c316a5b7a",
        "base_price":  60.00,
        "description":  "Indian paratha stuffed with seasoned onions.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/breakfast/pyaz-paratha.webp",
        "name":  "Patakha Pyaz Paratha",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "tashan-e-aloo-paratha",
        "id":  "tashan-e-aloo-paratha",
        "category_id":  "b6da6f06-2733-4eec-91cb-9c4c316a5b7a",
        "base_price":  60.00,
        "description":  "Traditional Indian stuffed potato paratha.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/breakfast/aalu-paratha.webp",
        "name":  "Tashan-e-Aloo Paratha",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "litti-chokha-ka-laheja",
        "id":  "litti-chokha-ka-laheja",
        "category_id":  "912dcac3-81d0-469d-8891-fd183a36e744",
        "base_price":  60.00,
        "description":  "Two traditional Bihari littis dipped in desi ghee, served with flavourful chokha and chutney. A delicious taste of authentic Bihari cuisine.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/chatori-gali/litti-chokha-ka-laheja.webp",
        "name":  "Litti Chokha Ka Laheja",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "dal-bole-toh-butter-bomb",
        "id":  "dal-bole-toh-butter-bomb",
        "category_id":  "6f9f77b5-0f7c-4ba5-9d32-b64d3de84679",
        "base_price":  70.00,
        "description":  "Rich, creamy black lentils slow-cooked overnight with churned butter and fresh cream in authentic Delhi style.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/veg-tadka-junction/dal-bole-toh-butter-bomb.webp",
        "name":  "Dal Bole Toh Butter Bomb",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "oye-lassi-lassi-oye",
        "id":  "oye-lassi-lassi-oye",
        "category_id":  "e1d922b2-8bf2-41e4-8ee0-2e6c23ca5479",
        "base_price":  70.00,
        "description":  "Traditional lassi available in sweet or salted style.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/shakes-drinks/sweet-salt-lassi.webp",
        "name":  "Oye Lassi Lassi Oye",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "mushroom-masala-masti",
        "id":  "mushroom-masala-masti",
        "category_id":  "6f9f77b5-0f7c-4ba5-9d32-b64d3de84679",
        "base_price":  70.00,
        "description":  "Fresh tender button mushrooms simmered in a rich spiced onion-tomato bhuna masala gravy.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/veg-tadka-junction/mushroom-masala-masti.webp",
        "name":  "Mushroom Masala Masti",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "veg-ka-patakha-thali",
        "id":  "veg-ka-patakha-thali",
        "category_id":  "17da450a-6a96-4dff-bbe4-c525c0ee00df",
        "base_price":  70.00,
        "description":  "1 seasonal sabzi curry or Matar Paneer upgrade, served with a choice of 2 rotis or 1 portion of rice. Choose one curry and one side; rice and rotis are not served together.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/thali/veg-ka-patakha-thali.webp",
        "name":  "Veg Ka Patakha Thali",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "anda-baazigar-thali",
        "id":  "anda-baazigar-thali",
        "category_id":  "17da450a-6a96-4dff-bbe4-c525c0ee00df",
        "base_price":  70.00,
        "description":  "1 egg curry, served with a choice of 2 rotis or 1 portion of rice. Rice and rotis are not served together.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/thali/anda-baazigar-thali.webp",
        "name":  "Anda Baazigar Thali",
        "is_egg":  true,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "fluffy-omelette-magic",
        "id":  "fluffy-omelette-magic",
        "category_id":  "7085bf3e-c8f5-436f-b514-e98f7cef6b7a",
        "base_price":  70.00,
        "description":  "Freshly prepared plain omelette with a soft and fluffy texture.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/egg-items/omelette.webp",
        "name":  "Fluffy Omelette Magic",
        "is_egg":  true,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "chicken-momos-ki-mehfil",
        "id":  "chicken-momos-ki-mehfil",
        "category_id":  "0eeab2ae-bf85-4f60-9cfe-f9a25d56473a",
        "base_price":  70.00,
        "description":  "Soft steamed chicken momos with a flavorful filling.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/momos/chicken-steam-momos-c560.webp",
        "name":  "Chicken Momos Ki Mehfil",
        "is_egg":  false,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "rajma-chawal-comfort-bowl",
        "id":  "rajma-chawal-comfort-bowl",
        "category_id":  "64c27dad-f538-4ac9-9084-844b80f7f6d8",
        "base_price":  70.00,
        "description":  "Classic rajma curry served with steamed rice.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/lunch/rajma-chawal-cd50.webp",
        "name":  "Rajma Chawal Comfort Bowl",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "veg-noodles-masti",
        "id":  "veg-noodles-masti",
        "category_id":  "bdf9bd0d-064c-4d10-a98f-dca31b89bf10",
        "base_price":  70.00,
        "description":  "Stir-fried noodles prepared with fresh vegetables and sauces.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/chinese/veg-noodles-7270.webp",
        "name":  "Veg Noodles Masti",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "veg-fried-rice-fiesta",
        "id":  "veg-fried-rice-fiesta",
        "category_id":  "bdf9bd0d-064c-4d10-a98f-dca31b89bf10",
        "base_price":  70.00,
        "description":  "Fried rice tossed with fresh vegetables and flavorful seasoning.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/chinese/veg-fried-rice-964c.webp",
        "name":  "Veg Fried Rice Fiesta",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "spring-roll-crunch-attack",
        "id":  "spring-roll-crunch-attack",
        "category_id":  "b1c07678-5feb-4e88-8fd0-0473ba78f792",
        "base_price":  70.00,
        "description":  "Crispy spring roll filled with seasoned vegetables.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/snacks/spring-roll.webp",
        "name":  "Spring Roll Crunch Attack",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "nimbu-shikanji-ka-swag",
        "id":  "nimbu-shikanji-ka-swag",
        "category_id":  "e1d922b2-8bf2-41e4-8ee0-2e6c23ca5479",
        "base_price":  70.00,
        "description":  "Refreshing lemon drink with a sweet and tangy taste.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/shakes-drinks/sikanji.webp",
        "name":  "Nimbu Shikanji Ka Swag",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "nawabi-paneer-paratha",
        "id":  "nawabi-paneer-paratha",
        "category_id":  "b6da6f06-2733-4eec-91cb-9c4c316a5b7a",
        "base_price":  70.00,
        "description":  "Soft paratha stuffed with seasoned paneer.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/breakfast/paneer-paratha.webp",
        "name":  "Nawabi Paneer Paratha",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "golmaal-gobi-paratha",
        "id":  "golmaal-gobi-paratha",
        "category_id":  "b6da6f06-2733-4eec-91cb-9c4c316a5b7a",
        "base_price":  70.00,
        "description":  "Indian flatbread stuffed with seasoned cauliflower.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/breakfast/gobi-paratha.webp",
        "name":  "Golmaal Gobi Paratha",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "aloo-tikki-burger-ka-swag",
        "id":  "aloo-tikki-burger-ka-swag",
        "category_id":  "4957853f-d3a7-41af-9f74-0abfc892532e",
        "base_price":  70.00,
        "description":  "Crispy aloo tikki patty with fresh veggies and flavourful sauces in a soft burger bun.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/burger-junction/aloo-tikki-burger-ka-swag.webp",
        "name":  "Aloo Tikki Burger Ka Swag",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "chawal-ka-simple-swag-rice",
        "id":  "chawal-ka-simple-swag-rice",
        "category_id":  "778fd128-bbfa-4841-a621-be6bf03bbbc8",
        "base_price":  70.00,
        "description":  "Steamed premium aged long-grain basmati rice, aromatic, light, and fluffy.",
        "image_path":  null,
        "name":  "Chawal Ka Simple Swag Rice",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "naan-ka-nawab-butter-wala",
        "id":  "naan-ka-nawab-butter-wala",
        "category_id":  "508dee75-4088-4a6c-84d3-5c6886f97ea6",
        "base_price":  70.00,
        "description":  "1 Butter naan.",
        "image_path":  null,
        "name":  "Naan Ka Nawab Butter Wala",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "veg-momos-ka-crunch",
        "id":  "veg-momos-ka-crunch",
        "category_id":  "0eeab2ae-bf85-4f60-9cfe-f9a25d56473a",
        "base_price":  80.00,
        "description":  "Crispy fried vegetable momos with a delicious filling.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/momos/veg-fried-momos-037a.webp",
        "name":  "Veg Momos Ka Crunch",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "egg-fried-rice-delight",
        "id":  "egg-fried-rice-delight",
        "category_id":  "bdf9bd0d-064c-4d10-a98f-dca31b89bf10",
        "base_price":  80.00,
        "description":  "Flavorful fried rice prepared with egg and aromatic spices.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/chinese/egg-fried-rice-5556.webp",
        "name":  "Egg Fried Rice Delight",
        "is_egg":  true,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "veg-momos-ki-chuski",
        "id":  "veg-momos-ki-chuski",
        "category_id":  "0eeab2ae-bf85-4f60-9cfe-f9a25d56473a",
        "base_price":  80.00,
        "description":  "Soft and freshly steamed vegetable momos.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/momos/veg-steam-momos-bb0c.webp",
        "name":  "Veg Momos Ki Chuski",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "matar-paneer-rice-delight",
        "id":  "matar-paneer-rice-delight",
        "category_id":  "64c27dad-f538-4ac9-9084-844b80f7f6d8",
        "base_price":  80.00,
        "description":  "Homestyle matar paneer served with steamed rice.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/lunch/matar-paneer-chawal-d18a.webp",
        "name":  "Matar Paneer Rice Delight",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "shahi-paneer-rice-feast",
        "id":  "shahi-paneer-rice-feast",
        "category_id":  "64c27dad-f538-4ac9-9084-844b80f7f6d8",
        "base_price":  80.00,
        "description":  "Shahi paneer served with steamed rice.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/lunch/shahi-paneer-chawal-6a92.webp",
        "name":  "Shahi Paneer Rice Feast",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "puri-sabji-ka-swag",
        "id":  "puri-sabji-ka-swag",
        "category_id":  "912dcac3-81d0-469d-8891-fd183a36e744",
        "base_price":  80.00,
        "description":  "Crispy golden fried puris served with traditional North Indian rasedar aloo tamatar ki sabzi and tangy pickle.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/breakfast/aalu-puri.webp",
        "name":  "Puri Sabji Ka Swag",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "bread-omelette-wala-swag",
        "id":  "bread-omelette-wala-swag",
        "category_id":  "7085bf3e-c8f5-436f-b514-e98f7cef6b7a",
        "base_price":  80.00,
        "description":  "Soft omelette served with fresh bread.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/egg-items/bread-omelette.webp",
        "name":  "Bread Omelette Wala Swag",
        "is_egg":  true,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "coffee-ka-chill-pill",
        "id":  "coffee-ka-chill-pill",
        "category_id":  "e1d922b2-8bf2-41e4-8ee0-2e6c23ca5479",
        "base_price":  80.00,
        "description":  "Chilled creamy coffee with a smooth and refreshing taste.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/shakes-drinks/cold-coffee.webp",
        "name":  "Coffee Ka Chill Pill",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "chicken-seekh-masala-magic",
        "id":  "chicken-seekh-masala-magic",
        "category_id":  "7eda84c5-c0c7-4681-ba6c-3c27f1bf751d",
        "base_price":  80.00,
        "description":  "Juicy, spiced chicken seekh kebabs tossed in a flavorful onion, capsicum, and tomato bhuna masala.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/moms-daawat/chicken-seekh-masala-b52b.webp",
        "name":  "Chicken Seekh Masala Magic",
        "is_egg":  false,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "chaap-e-afghani",
        "id":  "chaap-e-afghani",
        "category_id":  "8f8355a4-6b13-4a7e-87b5-3e401768e95e",
        "base_price":  80.00,
        "description":  "Tender soya chaap marinated in velvety cashew, fresh cream, and mild aromatic spices, roasted with a subtle smoky finish.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/chaap-chowk/chaap-e-afghani.webp",
        "name":  "Chaap-E-Afghani",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "butter-bhaji-ka-blast-pav-bhaji",
        "id":  "butter-bhaji-ka-blast-pav-bhaji",
        "category_id":  "912dcac3-81d0-469d-8891-fd183a36e744",
        "base_price":  80.00,
        "description":  "A popular Mumbai-style street-food dish made with a flavourful blend of mashed vegetables and spices, served with toasted pav buns.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/chatori-gali/butter-bhaji-ka-blast-pav-bhaji.webp",
        "name":  "Butter Bhaji Ka Blast - Pav Bhaji",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "veggie-maggi-masti",
        "id":  "veggie-maggi-masti",
        "category_id":  "cb3ab5b7-5bf1-4a74-8fe8-a8de22cfa634",
        "base_price":  80.00,
        "description":  "Hot and tasty Maggie prepared with fresh vegetables and spices.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/maggie/veg-maggie.webp",
        "name":  "Veggie Maggi Masti",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "malai-mein-nahaayi-chaap",
        "id":  "malai-mein-nahaayi-chaap",
        "category_id":  "8f8355a4-6b13-4a7e-87b5-3e401768e95e",
        "base_price":  80.00,
        "description":  "Succulent soya chaap dipped in rich malai marinade with roasted cardamom and crushed pepper, grilled to melt-in-mouth perfection.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/chaap-chowk/malai-mein-nahaayi-chaap.webp",
        "name":  "Malai Mein Nahaayi Chaap",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "paneer-ka-panga-masala",
        "id":  "paneer-ka-panga-masala",
        "category_id":  "6f9f77b5-0f7c-4ba5-9d32-b64d3de84679",
        "base_price":  80.00,
        "description":  "Soft fresh paneer cubes cooked in a thick, spiced onion-tomato gravy with freshly ground kadhai spices.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/veg-tadka-junction/paneer-ka-panga-masala.webp",
        "name":  "Paneer Ka Panga Masala",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "peanut-butter-power-bite",
        "id":  "peanut-butter-power-bite",
        "category_id":  "b1bd277f-e509-464f-b538-8b0d4f4a6304",
        "base_price":  80.00,
        "description":  "Soft bread filled with creamy peanut butter.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/sandwich/peanut-butter-sandwich.webp",
        "name":  "Peanut Butter Power Bite",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "taauji-ki-samosa-chaat",
        "id":  "taauji-ki-samosa-chaat",
        "category_id":  "912dcac3-81d0-469d-8891-fd183a36e744",
        "base_price":  80.00,
        "description":  "A crispy samosa topped with chutneys, chaat masala, desi spices and assorted toppings.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/chatori-gali/taauji-ki-samosa-chaat.webp",
        "name":  "Taauji Ki Samosa Chaat",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "pakodon-ka-power-pack-6-pieces",
        "id":  "pakodon-ka-power-pack-6-pieces",
        "category_id":  "b1c07678-5feb-4e88-8fd0-0473ba78f792",
        "base_price":  80.00,
        "description":  "Assorted crispy pakoda served as a delicious snack platter.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/snacks/mix-pakoda.webp",
        "name":  "Pakodon Ka Power Pack (6 Pieces)",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "chicken-ka-lallantop-thali",
        "id":  "chicken-ka-lallantop-thali",
        "category_id":  "17da450a-6a96-4dff-bbe4-c525c0ee00df",
        "base_price":  90.00,
        "description":  "1 Chicken leg piece or 1 wing piece in curry, served with a choice of 1 portion of rice or 2 rotis.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/thali/chicken-ka-lallantop-thali.webp",
        "name":  "Chicken Ka Lallantop Thali",
        "is_egg":  false,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "crispy-chicken-pakoda",
        "id":  "crispy-chicken-pakoda",
        "category_id":  "7eda84c5-c0c7-4681-ba6c-3c27f1bf751d",
        "base_price":  90.00,
        "description":  "Juicy boneless chicken bites seasoned with crushed whole spices, golden-fried to a crunchy crisp. Served with spicy green chutney.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/moms-daawat/chicken-pakoda-e687.webp",
        "name":  "Crispy Chicken Pakoda",
        "is_egg":  false,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "chatpata-masala-burger",
        "id":  "chatpata-masala-burger",
        "category_id":  "4957853f-d3a7-41af-9f74-0abfc892532e",
        "base_price":  90.00,
        "description":  "A spicy, tangy burger packed with desi masala flavours and sauces.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/burger-junction/chatpata-masala-burger.webp",
        "name":  "Chatpata Masala Burger",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "veggie-delight-burger",
        "id":  "veggie-delight-burger",
        "category_id":  "4957853f-d3a7-41af-9f74-0abfc892532e",
        "base_price":  90.00,
        "description":  "A delicious veg burger loaded with fresh vegetables and creamy sauces.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/burger-junction/veggie-delight-burger.webp",
        "name":  "Veggie Delight Burger",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "double-aloo-tikki-dhamaka",
        "id":  "double-aloo-tikki-dhamaka",
        "category_id":  "4957853f-d3a7-41af-9f74-0abfc892532e",
        "base_price":  90.00,
        "description":  "Double aloo tikki patties with fresh veggies and tasty sauces.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/burger-junction/double-aloo-tikki-dhamaka.webp",
        "name":  "Double Aloo Tikki Dhamaka",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "veggie-budget-box-thali",
        "id":  "veggie-budget-box-thali",
        "category_id":  "17da450a-6a96-4dff-bbe4-c525c0ee00df",
        "base_price":  100.00,
        "description":  "2 Roti + Rice + 2 Sabzi + Salad",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/thali/veggie-budget-box-thali.webp",
        "name":  "Veggie Budget Box Thali",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "machhli-ka-jhakkas-thali",
        "id":  "machhli-ka-jhakkas-thali",
        "category_id":  "17da450a-6a96-4dff-bbe4-c525c0ee00df",
        "base_price":  100.00,
        "description":  "1 Piece of fish curry, served with a choice of 1 portion of rice or 2 rotis.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/thali/machhli-ka-jhakkas-thali.webp",
        "name":  "Machhli Ka Jhakkas Thali",
        "is_egg":  false,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "crispy-fish-fry",
        "id":  "crispy-fish-fry",
        "category_id":  "7eda84c5-c0c7-4681-ba6c-3c27f1bf751d",
        "base_price":  100.00,
        "description":  "Delicate fish fillet marinated with aromatic carom seeds (ajwain), lemon, and spices, fried to a golden crunch.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/moms-daawat/fish-fry.webp",
        "name":  "Crispy Fish Fry",
        "is_egg":  false,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "anda-parathe-ke-funday",
        "id":  "anda-parathe-ke-funday",
        "category_id":  "b6da6f06-2733-4eec-91cb-9c4c316a5b7a",
        "base_price":  100.00,
        "description":  "Flaky paratha prepared with egg.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/breakfast/egg-paratha.webp",
        "name":  "Anda Parathe Ke Funday",
        "is_egg":  true,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "banana-shake-ka-tashan",
        "id":  "banana-shake-ka-tashan",
        "category_id":  "e1d922b2-8bf2-41e4-8ee0-2e6c23ca5479",
        "base_price":  100.00,
        "description":  "Fresh banana shake with a creamy and refreshing taste.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/shakes-drinks/banana-shake.webp",
        "name":  "Banana Shake Ka Tashan",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "mango-masti-shake",
        "id":  "mango-masti-shake",
        "category_id":  "e1d922b2-8bf2-41e4-8ee0-2e6c23ca5479",
        "base_price":  100.00,
        "description":  "Creamy mango shake made with rich mango flavor.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/shakes-drinks/mango-shake.webp",
        "name":  "Mango Masti Shake",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "oreo-shake-ka-dhamaka",
        "id":  "oreo-shake-ka-dhamaka",
        "category_id":  "e1d922b2-8bf2-41e4-8ee0-2e6c23ca5479",
        "base_price":  100.00,
        "description":  "Creamy Oreo shake with a rich chocolate-cookie flavor.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/shakes-drinks/oreo-shake.webp",
        "name":  "Oreo Shake Ka Dhamaka",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "strawberry-shake-ki-masti",
        "id":  "strawberry-shake-ki-masti",
        "category_id":  "e1d922b2-8bf2-41e4-8ee0-2e6c23ca5479",
        "base_price":  100.00,
        "description":  "Creamy strawberry shake with a refreshing fruity flavor.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/shakes-drinks/strawberry-shake.webp",
        "name":  "Strawberry Shake Ki Masti",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "singapuri-noodles-express",
        "id":  "singapuri-noodles-express",
        "category_id":  "bdf9bd0d-064c-4d10-a98f-dca31b89bf10",
        "base_price":  100.00,
        "description":  "Spicy and flavorful Singapuri-style noodles with vegetables.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/chinese/singapuri-noodles-e6f1.webp",
        "name":  "Singapuri Noodles Express",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "veg-momos-gravy-party",
        "id":  "veg-momos-gravy-party",
        "category_id":  "0eeab2ae-bf85-4f60-9cfe-f9a25d56473a",
        "base_price":  100.00,
        "description":  "Soft vegetable momos served in a flavorful gravy.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/momos/veg-gravy-momos-4520.webp",
        "name":  "Veg Momos Gravy Party",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "chicken-momos-ka-crunch",
        "id":  "chicken-momos-ka-crunch",
        "category_id":  "0eeab2ae-bf85-4f60-9cfe-f9a25d56473a",
        "base_price":  100.00,
        "description":  "Chicken momos with a flavorful filling.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/momos/chicken-fried-momos-b6e7.webp",
        "name":  "Chicken Momos Ka Crunch",
        "is_egg":  false,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "butter-maggi-wali-feeling",
        "id":  "butter-maggi-wali-feeling",
        "category_id":  "cb3ab5b7-5bf1-4a74-8fe8-a8de22cfa634",
        "base_price":  100.00,
        "description":  "Hot Maggie prepared with butter for a rich and comforting taste.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/maggie/butter-maggie.webp",
        "name":  "Butter Maggi Wali Feeling",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "egg-bhurji-ka-dhamaka-4-eggs",
        "id":  "egg-bhurji-ka-dhamaka-4-eggs",
        "category_id":  "7085bf3e-c8f5-436f-b514-e98f7cef6b7a",
        "base_price":  100.00,
        "description":  "Spiced scrambled eggs prepared with onions and Indian spices.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/egg-items/egg-bhurji.webp",
        "name":  "Egg Bhurji Ka Dhamaka (4 Eggs)",
        "is_egg":  true,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "eggy-maggi-ka-swag",
        "id":  "eggy-maggi-ka-swag",
        "category_id":  "cb3ab5b7-5bf1-4a74-8fe8-a8de22cfa634",
        "base_price":  100.00,
        "description":  "Flavorful Maggie prepared with egg and Indian spices.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/maggie/egg-maggie.webp",
        "name":  "Eggy Maggi Ka Swag",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "sultan-e-chhole-bhature",
        "id":  "sultan-e-chhole-bhature",
        "category_id":  "912dcac3-81d0-469d-8891-fd183a36e744",
        "base_price":  110.00,
        "description":  "Classic North Indian dish with 2 bhature served with chhole.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/breakfast/chhole-bhature.webp",
        "name":  "Sultan-e-Chhole Bhature",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "crispy-veg-burger-crunch",
        "id":  "crispy-veg-burger-crunch",
        "category_id":  "4957853f-d3a7-41af-9f74-0abfc892532e",
        "base_price":  110.00,
        "description":  "A crunchy vegetable patty paired with fresh veggies and signature sauces.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/burger-junction/crispy-veg-burger-crunch.webp",
        "name":  "Crispy Veg Burger Crunch",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "jeera-ka-jalwa-rice",
        "id":  "jeera-ka-jalwa-rice",
        "category_id":  "778fd128-bbfa-4841-a621-be6bf03bbbc8",
        "base_price":  110.00,
        "description":  "Fragrant basmati rice gently tempered with roasted cumin seeds and fresh green coriander.",
        "image_path":  null,
        "name":  "Jeera Ka Jalwa Rice",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "sarson-wali-fish-curry",
        "id":  "sarson-wali-fish-curry",
        "category_id":  "7eda84c5-c0c7-4681-ba6c-3c27f1bf751d",
        "base_price":  110.00,
        "description":  "Tender fish simmered in an authentic mustard-seed paste and turmeric gravy, bursting with traditional desi flavors.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/moms-daawat/mustard-fish.webp",
        "name":  "Sarson Wali Fish Curry",
        "is_egg":  false,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "dragon-chicken-fire",
        "id":  "dragon-chicken-fire",
        "category_id":  "7eda84c5-c0c7-4681-ba6c-3c27f1bf751d",
        "base_price":  110.00,
        "description":  "Crispy chicken strips tossed in a fiery wok with chili paste, crunchy bell peppers, garlic, and scallions.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/moms-daawat/dragon-chicken-245e.webp",
        "name":  "Dragon Chicken Fire",
        "is_egg":  false,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "chatpata-chicken-blast",
        "id":  "chatpata-chicken-blast",
        "category_id":  "7eda84c5-c0c7-4681-ba6c-3c27f1bf751d",
        "base_price":  110.00,
        "description":  "Tender chicken chunks stir-fried with tangy pomegranate powder, chatpata masala, green chilies, and onions.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/moms-daawat/chatpata-chicken-1abe.webp",
        "name":  "Chatpata Chicken Blast",
        "is_egg":  false,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "desi-prawn-curry",
        "id":  "desi-prawn-curry",
        "category_id":  "7eda84c5-c0c7-4681-ba6c-3c27f1bf751d",
        "base_price":  110.00,
        "description":  "Juicy prawns cooked in a rich, aromatic curry with traditional spices. Portions: Little Treat (2-3 prawns), Chhota Packet (4-6 prawns), Full Tashan (6-8 prawns), Jumbo Dhamaka (12-16 prawns).",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/moms-daawat/prawn-curry.webp",
        "name":  "Desi Prawn Curry",
        "is_egg":  false,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "cheesy-maggi-ka-dhamaka",
        "id":  "cheesy-maggi-ka-dhamaka",
        "category_id":  "cb3ab5b7-5bf1-4a74-8fe8-a8de22cfa634",
        "base_price":  110.00,
        "description":  "Delicious Maggie tossed with butter and loaded with cheese.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/maggie/butter-cheese-maggie.webp",
        "name":  "Cheesy Maggi Ka Dhamaka",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "chilli-garlic-noodles-blast",
        "id":  "chilli-garlic-noodles-blast",
        "category_id":  "bdf9bd0d-064c-4d10-a98f-dca31b89bf10",
        "base_price":  110.00,
        "description":  "Spicy noodles tossed with garlic, vegetables and flavorful sauces.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/chinese/chilli-garlic-noodles-55de.webp",
        "name":  "Chilli Garlic Noodles Blast",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "butter-wala-omelette-blast",
        "id":  "butter-wala-omelette-blast",
        "category_id":  "7085bf3e-c8f5-436f-b514-e98f7cef6b7a",
        "base_price":  110.00,
        "description":  "Butter bread omelette with a rich and savory taste.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/egg-items/bread-omelette-butter.webp",
        "name":  "Butter Wala Omelette Blast",
        "is_egg":  true,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "peri-peri-burger-blast",
        "id":  "peri-peri-burger-blast",
        "category_id":  "4957853f-d3a7-41af-9f74-0abfc892532e",
        "base_price":  110.00,
        "description":  "A zesty burger with peri-peri seasoning, veggies and sauces.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/burger-junction/peri-peri-burger-blast.webp",
        "name":  "Peri Peri Burger Blast",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "paneer-tikki-ka-tashan",
        "id":  "paneer-tikki-ka-tashan",
        "category_id":  "4957853f-d3a7-41af-9f74-0abfc892532e",
        "base_price":  110.00,
        "description":  "A flavourful paneer tikki burger with fresh veggies and sauces.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/burger-junction/paneer-tikki-ka-tashan.webp",
        "name":  "Paneer Tikki Ka Tashan",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "cheesy-aloo-burger",
        "id":  "cheesy-aloo-burger",
        "category_id":  "4957853f-d3a7-41af-9f74-0abfc892532e",
        "base_price":  110.00,
        "description":  "Crispy aloo patty topped with cheese, fresh veggies and sauces.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/burger-junction/cheesy-aloo-burger.webp",
        "name":  "Cheesy Aloo Burger",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "cheese-corn-burger-delight",
        "id":  "cheese-corn-burger-delight",
        "category_id":  "4957853f-d3a7-41af-9f74-0abfc892532e",
        "base_price":  110.00,
        "description":  "A cheesy corn burger with vegetables and delicious flavours.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/burger-junction/cheese-corn-burger-delight.webp",
        "name":  "Cheese Corn Burger Delight",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "tandoori-mayo-burger-tashan",
        "id":  "tandoori-mayo-burger-tashan",
        "category_id":  "4957853f-d3a7-41af-9f74-0abfc892532e",
        "base_price":  110.00,
        "description":  "A desi-style burger with tandoori mayo, fresh veggies and a soft bun.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/burger-junction/tandoori-mayo-burger-tashan.webp",
        "name":  "Tandoori Mayo Burger Tashan",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "garlic-paneer-cheese-blast",
        "id":  "garlic-paneer-cheese-blast",
        "category_id":  "b1bd277f-e509-464f-b538-8b0d4f4a6304",
        "base_price":  110.00,
        "description":  "Grilled sandwich with paneer, vegetables, garlic and melted cheese.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/sandwich/garlic-veg-paneer-cheese-sandwich.webp",
        "name":  "Garlic Paneer Cheese Blast",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "garlic-cheese-sandwich-delight",
        "id":  "garlic-cheese-sandwich-delight",
        "category_id":  "b1bd277f-e509-464f-b538-8b0d4f4a6304",
        "base_price":  110.00,
        "description":  "Grilled sandwich filled with seasoned vegetables, garlic and melted cheese.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/sandwich/garlic-veg-cheese-sandwich.webp",
        "name":  "Garlic Cheese Sandwich Delight",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "aloo-burger-meal-deal",
        "id":  "aloo-burger-meal-deal",
        "category_id":  "4957853f-d3a7-41af-9f74-0abfc892532e",
        "base_price":  120.00,
        "description":  "Crispy spiced potato patty burger with signature dressing, accompanied with salted golden french fries and a chilled soft beverage.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/burger-junction/aloo-burger-meal-deal.webp",
        "name":  "Aloo Burger Meal Deal",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "chilli-cheese-burger-dhamaka",
        "id":  "chilli-cheese-burger-dhamaka",
        "category_id":  "4957853f-d3a7-41af-9f74-0abfc892532e",
        "base_price":  120.00,
        "description":  "A spicy burger with chilli flavours, cheese and fresh veggies.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/burger-junction/chilli-cheese-burger-dhamaka.webp",
        "name":  "Chilli Cheese Burger Dhamaka",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "mexican-spicy-burger",
        "id":  "mexican-spicy-burger",
        "category_id":  "4957853f-d3a7-41af-9f74-0abfc892532e",
        "base_price":  120.00,
        "description":  "A spicy Mexican-style veg burger with bold flavours and sauces.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/burger-junction/mexican-spicy-burger.webp",
        "name":  "Mexican Spicy Burger",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "chicken-momos-gravy-wale",
        "id":  "chicken-momos-gravy-wale",
        "category_id":  "0eeab2ae-bf85-4f60-9cfe-f9a25d56473a",
        "base_price":  120.00,
        "description":  "Juicy chicken momos served in a rich and flavorful gravy.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/momos/chicken-gravy-momos-e473.webp",
        "name":  "Chicken Momos Gravy Wale",
        "is_egg":  false,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "anda-budget-blast-thali",
        "id":  "anda-budget-blast-thali",
        "category_id":  "17da450a-6a96-4dff-bbe4-c525c0ee00df",
        "base_price":  120.00,
        "description":  "2 Roti+Rice+Egg Curry (1 Egg)+Salad",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/thali/anda-budget-blast-thali.webp",
        "name":  "Anda Budget Blast Thali",
        "is_egg":  true,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "chicken-litti-ka-attack",
        "id":  "chicken-litti-ka-attack",
        "category_id":  "912dcac3-81d0-469d-8891-fd183a36e744",
        "base_price":  120.00,
        "description":  "Two traditional Bihari littis dipped in desi ghee, served with one piece of flavourful chicken curry and chutney. A hearty combination of authentic Bihari flavours and spicy chicken gravy.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/chatori-gali/chicken-litti-ka-attack.webp",
        "name":  "Chicken Litti Ka Attack",
        "is_egg":  false,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "laal-angaar-chicken",
        "id":  "laal-angaar-chicken",
        "category_id":  "cffc78e2-a1d5-4c7d-930e-40e9b2ca0ff6",
        "base_price":  120.00,
        "description":  "Succulent chicken marinated in spicy hung curd and roasted tandoori masala, charred over live flames for an irresistible smoky aroma. Served with mint chutney and onion rings.",
        "image_path":  null,
        "name":  "Laal Angaar Chicken",
        "is_egg":  false,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "paneer-tikka-burger-blast",
        "id":  "paneer-tikka-burger-blast",
        "category_id":  "4957853f-d3a7-41af-9f74-0abfc892532e",
        "base_price":  120.00,
        "description":  "A paneer tikka burger with fresh veggies and creamy sauces.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/burger-junction/paneer-tikka-burger-blast.webp",
        "name":  "Paneer Tikka Burger Blast",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "jhinga-ka-pehelwan-thali",
        "id":  "jhinga-ka-pehelwan-thali",
        "category_id":  "17da450a-6a96-4dff-bbe4-c525c0ee00df",
        "base_price":  120.00,
        "description":  "2 Masala prawns, served with a choice of 1 portion of rice or 2 rotis.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/thali/jhinga-ka-pehelwan-thali.webp",
        "name":  "Jhinga Ka Pehelwan Thali",
        "is_egg":  false,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "zesty-lemon-chicken",
        "id":  "zesty-lemon-chicken",
        "category_id":  "7eda84c5-c0c7-4681-ba6c-3c27f1bf751d",
        "base_price":  130.00,
        "description":  "Tender chicken cooked with a tangy splash of fresh lemon, cracked black pepper, and subtle fragrant herbs.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/moms-daawat/lemon-chicken-e16e.webp",
        "name":  "Zesty Lemon Chicken",
        "is_egg":  false,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "vrat-ke-chatpate-aloo-fry",
        "id":  "vrat-ke-chatpate-aloo-fry",
        "category_id":  "65ba187f-ecc9-43d3-8016-36e0c8cee070",
        "base_price":  130.00,
        "description":  "Vrat k aalu fry(without onion garlic)",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/vrat-wala-pyaar/vrat-ke-chatpate-aloo-fry.webp",
        "name":  "Vrat Ke Chatpate Aloo Fry",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "chatpata-prawn-masala",
        "id":  "chatpata-prawn-masala",
        "category_id":  "7eda84c5-c0c7-4681-ba6c-3c27f1bf751d",
        "base_price":  130.00,
        "description":  "Juicy prawns cooked in a rich onion-tomato masala with aromatic Indian spices. Portions: Little Treat (2-3 prawns), Chhota Packet (4-6 prawns), Full Tashan (6-8 prawns), Jumbo Dhamaka (12-16 prawns).",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/moms-daawat/prawn-masala.webp",
        "name":  "Chatpata Prawn Masala",
        "is_egg":  false,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "sabzi-shahi-mehfil-thali",
        "id":  "sabzi-shahi-mehfil-thali",
        "category_id":  "17da450a-6a96-4dff-bbe4-c525c0ee00df",
        "base_price":  140.00,
        "description":  "A delicious thali featuring 3 varieties of sabzi, including 1 paneer sabzi, served with 4 Tawa Rotis, rice, fresh salad, achar and a sweet.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/thali/sabzi-shahi-mehfil-thali.webp",
        "name":  "Sabzi Shahi Mehfil Thali",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "mutton-ka-dabangg-thali",
        "id":  "mutton-ka-dabangg-thali",
        "category_id":  "17da450a-6a96-4dff-bbe4-c525c0ee00df",
        "base_price":  140.00,
        "description":  "1-2 Pieces of mutton (nalli/champ, depending on piece size), served with a choice of 1 portion of rice or 2 rotis.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/thali/mutton-ka-dabangg-thali.webp",
        "name":  "Mutton Ka Dabangg Thali",
        "is_egg":  false,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "double-cheese-ka-dhamaka",
        "id":  "double-cheese-ka-dhamaka",
        "category_id":  "4957853f-d3a7-41af-9f74-0abfc892532e",
        "base_price":  140.00,
        "description":  "A burger with double cheese flavour, fresh veggies and sauces.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/burger-junction/double-cheese-ka-dhamaka.webp",
        "name":  "Double Cheese Ka Dhamaka",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "babuji-ki-full-pet-bhar-chaat",
        "id":  "babuji-ki-full-pet-bhar-chaat",
        "category_id":  "912dcac3-81d0-469d-8891-fd183a36e744",
        "base_price":  140.00,
        "description":  "A generous serving of chatpati chaat with tangy chutneys, desi spices and assorted toppings.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/chatori-gali/babuji-ki-full-pet-bhar-chaat.webp",
        "name":  "Babuji Ki Full Pet Bhar Chaat",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "bihari-handi-chicken",
        "id":  "bihari-handi-chicken",
        "category_id":  "7eda84c5-c0c7-4681-ba6c-3c27f1bf751d",
        "base_price":  140.00,
        "description":  "Traditional clay handi chicken slow-simmered with whole garlic bulbs, mustard oil, and authentic rustic spices.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/moms-daawat/authentic-bihari-chicken-5a9b.webp",
        "name":  "Bihari Handi Chicken",
        "is_egg":  false,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "fish-budget-box-thali",
        "id":  "fish-budget-box-thali",
        "category_id":  "17da450a-6a96-4dff-bbe4-c525c0ee00df",
        "base_price":  150.00,
        "description":  "2 Roti+Rice+Fish Curry (1 Piece)+Salad",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/thali/fish-budget-box-thali.webp",
        "name":  "Fish Budget Box Thali",
        "is_egg":  false,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "chicken-pocket-box-thali",
        "id":  "chicken-pocket-box-thali",
        "category_id":  "17da450a-6a96-4dff-bbe4-c525c0ee00df",
        "base_price":  150.00,
        "description":  "2 Roti+Rice+Chicken Curry (2 Pieces)+Salad",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/thali/chicken-pocket-box-thali.webp",
        "name":  "Chicken Pocket Box Thali",
        "is_egg":  false,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "loaded-paneer-cheese-blast",
        "id":  "loaded-paneer-cheese-blast",
        "category_id":  "4957853f-d3a7-41af-9f74-0abfc892532e",
        "base_price":  150.00,
        "description":  "A paneer and cheese burger layered with fresh veggies and sauces.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/burger-junction/loaded-paneer-cheese-blast.webp",
        "name":  "Loaded Paneer Cheese Blast",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "butter-chicken-ka-shahi-swad",
        "id":  "butter-chicken-ka-shahi-swad",
        "category_id":  "7eda84c5-c0c7-4681-ba6c-3c27f1bf751d",
        "base_price":  150.00,
        "description":  "Iconic Delhi-style tender tandoori chicken simmered in a velvety, buttery tomato and cashew gravy with fenugreek aroma.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/moms-daawat/butter-chicken-81b8.webp",
        "name":  "Butter Chicken Ka Shahi Swad",
        "is_egg":  false,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "creamy-chicken-delight",
        "id":  "creamy-chicken-delight",
        "category_id":  "7eda84c5-c0c7-4681-ba6c-3c27f1bf751d",
        "base_price":  160.00,
        "description":  "Mild and decadent boneless chicken cooked in a rich white gravy infused with fresh cream, butter, and mild whole spices.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/moms-daawat/cream-chicken-09b5.webp",
        "name":  "Creamy Chicken Delight",
        "is_egg":  false,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "champaran-handi-chicken",
        "id":  "champaran-handi-chicken",
        "category_id":  "7eda84c5-c0c7-4681-ba6c-3c27f1bf751d",
        "base_price":  170.00,
        "description":  "World-famous sealed Ahuna clay pot chicken cooked over slow charcoal embers with mustard oil, whole garlic, and whole spices.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/moms-daawat/champaran-chicken-1a4e.webp",
        "name":  "Champaran Handi Chicken",
        "is_egg":  false,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "cheese-burger-power-combo",
        "id":  "cheese-burger-power-combo",
        "category_id":  "4957853f-d3a7-41af-9f74-0abfc892532e",
        "base_price":  170.00,
        "description":  "Juicy cheese burger with molten cheddar, served with a basket of crispy golden french fries and a refreshing soft drink.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/burger-junction/cheese-burger-power-combo.webp",
        "name":  "Cheese Burger Power Combo",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "chicken-dumdaar-biryani",
        "id":  "chicken-dumdaar-biryani",
        "category_id":  "db7e99ad-e086-4555-a4ba-1241b87f95da",
        "base_price":  180.00,
        "description":  "Signature dum-cooked biryani layered with long-grain aged basmati rice, tender spiced chicken, saffron, and caramelized onions. Served with fresh salad and spicy mint chutney.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/dum-hai-toh-biryani-hai/chicken-dumdaar-biryani.webp",
        "name":  "Chicken Dumdaar Biryani",
        "is_egg":  false,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "anda-shahi-mehfil-thali",
        "id":  "anda-shahi-mehfil-thali",
        "category_id":  "17da450a-6a96-4dff-bbe4-c525c0ee00df",
        "base_price":  180.00,
        "description":  "2 Eggs curry, 4 tawa roti, rice, fresh salad , achar, sweet",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/thali/anda-shahi-mehfil-thali.webp",
        "name":  "Anda Shahi Mehfil Thali",
        "is_egg":  true,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "vrat-wali-shahi-thali",
        "id":  "vrat-wali-shahi-thali",
        "category_id":  "65ba187f-ecc9-43d3-8016-36e0c8cee070",
        "base_price":  180.00,
        "description":  "Vrat thali without onion garlic\nKuttu puri",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/vrat-wala-pyaar/vrat-wali-shahi-thali.webp",
        "name":  "Vrat Wali Shahi Thali",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "makki-roti-te-sarson-saag-party",
        "id":  "makki-roti-te-sarson-saag-party",
        "category_id":  "912dcac3-81d0-469d-8891-fd183a36e744",
        "base_price":  200.00,
        "description":  "Enjoy the authentic taste of Punjab with flavourful sarson da saag, slow-cooked with traditional spices and desi ghee, served with freshly prepared makki di roti and a generous dollop of white butter. A hearty Punjabi winter treat packed with rustic flavours! Serves: 1-2 Persons",
        "image_path":  null,
        "name":  "Makki Roti Te Sarson Saag Party",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "paneer-burger-feast-combo",
        "id":  "paneer-burger-feast-combo",
        "category_id":  "4957853f-d3a7-41af-9f74-0abfc892532e",
        "base_price":  200.00,
        "description":  "Crispy spiced cottage cheese patty burger topped with fresh lettuce and sauces, served with crispy french fries and a soft drink.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/burger-junction/paneer-burger-feast-combo.webp",
        "name":  "Paneer Burger Feast Combo",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "chicken-nawabi-mehfil-thali",
        "id":  "chicken-nawabi-mehfil-thali",
        "category_id":  "17da450a-6a96-4dff-bbe4-c525c0ee00df",
        "base_price":  210.00,
        "description":  "Chicken curry (4 pieces), 4 tawa roti, rice, fresh salad, achar, sweet",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/thali/chicken-nawabi-mehfil-thali.webp",
        "name":  "Chicken Nawabi Mehfil Thali",
        "is_egg":  false,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "fish-nawabi-mehfil-thali",
        "id":  "fish-nawabi-mehfil-thali",
        "category_id":  "17da450a-6a96-4dff-bbe4-c525c0ee00df",
        "base_price":  210.00,
        "description":  "Fish curry (2 pieces), 4 tawa roti, rice, fresh salad , achar, sweet",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/thali/fish-nawabi-mehfil-thali.webp",
        "name":  "Fish Nawabi Mehfil Thali",
        "is_egg":  false,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "mutton-pocket-box-thali",
        "id":  "mutton-pocket-box-thali",
        "category_id":  "17da450a-6a96-4dff-bbe4-c525c0ee00df",
        "base_price":  210.00,
        "description":  "Mutton curry (2 pieces), 4 rotis, 1 portion of rice and fresh salad.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/thali/mutton-pocket-box-thali.webp",
        "name":  "Mutton Pocket Box Thali",
        "is_egg":  false,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "kebab-ka-rocket-roll",
        "id":  "kebab-ka-rocket-roll",
        "category_id":  "cffc78e2-a1d5-4c7d-930e-40e9b2ca0ff6",
        "base_price":  240.00,
        "description":  "Soft rumali-style roll stuffed with juicy chicken kebab, fresh onions, green chutney and flavourful sauces. Serves (1-2)",
        "image_path":  null,
        "name":  "Kebab Ka Rocket Roll",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "chatori-gali-shahi-chaat-platter",
        "id":  "chatori-gali-shahi-chaat-platter",
        "category_id":  "912dcac3-81d0-469d-8891-fd183a36e744",
        "base_price":  240.00,
        "description":  "Crispy samosa and aloo topped with creamy dahi, tangy imli chutney, spicy chutney and aromatic chaat masalas for a delicious desi chaat experience.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/chatori-gali/chatori-gali-shahi-chaat-platter.webp",
        "name":  "Chatori Gali Shahi Chaat Platter",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "veg-ka-raj-tilak-thali",
        "id":  "veg-ka-raj-tilak-thali",
        "category_id":  "17da450a-6a96-4dff-bbe4-c525c0ee00df",
        "base_price":  240.00,
        "description":  "A grand vegetarian feast featuring 4 varieties of sabzi, including 2 paneer sabzis, served with 5 Tawa Rotis, 2 portions of rice, fresh salad, pickle and 1 sweet.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/thali/veg-ka-raj-tilak-thali.webp",
        "name":  "Veg Ka Raj-Tilak Thali",
        "is_egg":  false,
        "is_veg":  true,
        "is_available":  true
    },
    {
        "slug":  "chicken-tikka-attack",
        "id":  "chicken-tikka-attack",
        "category_id":  "cffc78e2-a1d5-4c7d-930e-40e9b2ca0ff6",
        "base_price":  240.00,
        "description":  "Tender boneless chicken pieces marinated in aromatic Indian spices and yogurt, grilled to perfection in a traditional tandoor. Serves(1-2)",
        "image_path":  null,
        "name":  "Chicken Tikka Attack",
        "is_egg":  false,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "bihari-ahuna-mutton",
        "id":  "bihari-ahuna-mutton",
        "category_id":  "7eda84c5-c0c7-4681-ba6c-3c27f1bf751d",
        "base_price":  240.00,
        "description":  "Melt-in-mouth tender mutton slow-roasted in an earthen pot with crushed raw spices, garlic pods, and mustard oil.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/moms-daawat/authentic-bihari-mutton-e609.webp",
        "name":  "Bihari Ahuna Mutton",
        "is_egg":  false,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "mutton-sultanate-dum-biryani",
        "id":  "mutton-sultanate-dum-biryani",
        "category_id":  "db7e99ad-e086-4555-a4ba-1241b87f95da",
        "base_price":  240.00,
        "description":  "Royal Awadhi dum biryani prepared with succulent bone-in mutton, aromatic basmati rice, saffron, and whole spices sealed in clay handi. Served with fresh salad and mint chutney.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/dum-hai-toh-biryani-hai/mutton-sultanate-dum-biryani.webp",
        "name":  "Mutton Sultanate Dum Biryani",
        "is_egg":  false,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "champaran-ahuna-mutton",
        "id":  "champaran-ahuna-mutton",
        "category_id":  "7eda84c5-c0c7-4681-ba6c-3c27f1bf751d",
        "base_price":  250.00,
        "description":  "The pride of Bihar — tender mutton and whole garlic bulbs slow-steamed in their own juices inside a sealed earthen handi over live charcoal.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/moms-daawat/champaran-mutton-a884.webp",
        "name":  "Champaran Ahuna Mutton",
        "is_egg":  false,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "chicken-malai-ka-maharaja",
        "id":  "chicken-malai-ka-maharaja",
        "category_id":  "cffc78e2-a1d5-4c7d-930e-40e9b2ca0ff6",
        "base_price":  270.00,
        "description":  "Soft and juicy boneless chicken pieces coated in a creamy malai marinade with mild spices, grilled to perfection. Serves(1-2)",
        "image_path":  null,
        "name":  "Chicken Malai Ka Maharaja",
        "is_egg":  false,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "mutton-nawabi-mehfil-thali",
        "id":  "mutton-nawabi-mehfil-thali",
        "category_id":  "17da450a-6a96-4dff-bbe4-c525c0ee00df",
        "base_price":  280.00,
        "description":  "Mutton curry (3 pieces), 4 Tawa Rotis, rice, fresh salad, achar and sweet.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/thali/mutton-nawabi-mehfil-thali.webp",
        "name":  "Mutton Nawabi Mehfil Thali",
        "is_egg":  false,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "anda-sultanate-thali",
        "id":  "anda-sultanate-thali",
        "category_id":  "17da450a-6a96-4dff-bbe4-c525c0ee00df",
        "base_price":  320.00,
        "description":  "A royal egg feast featuring 4 eggs in curry, 5 tawa rotis, 2 portions of rice, fresh salad, pickle and 1 sweet.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/thali/anda-sultanate-thali.webp",
        "name":  "Anda Sultanate Thali",
        "is_egg":  true,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "chicken-badshahi-hukumat-thali",
        "id":  "chicken-badshahi-hukumat-thali",
        "category_id":  "17da450a-6a96-4dff-bbe4-c525c0ee00df",
        "base_price":  390.00,
        "description":  "A lavish chicken feast featuring 6 pieces of chicken curry, 5 tawa rotis, 2 portions of rice, fresh salad, pickle and 1 sweet.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/thali/chicken-badshahi-hukumat-thali.webp",
        "name":  "Chicken Badshahi Hukumat Thali",
        "is_egg":  false,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "fish-ka-shahi-takht-thali",
        "id":  "fish-ka-shahi-takht-thali",
        "category_id":  "17da450a-6a96-4dff-bbe4-c525c0ee00df",
        "base_price":  450.00,
        "description":  "2 pieces of fish curry and 2 prawns, served with 5 Tawa Rotis, 2 portions of rice, fresh salad, pickle and 1 sweet. Serves 2.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/thali/fish-ka-shahi-takht-thali.webp",
        "name":  "Fish Ka Shahi Takht Thali",
        "is_egg":  false,
        "is_veg":  false,
        "is_available":  true
    },
    {
        "slug":  "mutton-badshahi-hukumat-thali",
        "id":  "mutton-badshahi-hukumat-thali",
        "category_id":  "17da450a-6a96-4dff-bbe4-c525c0ee00df",
        "base_price":  490.00,
        "description":  "4 pieces of mutton in total - 2 pieces of mutton curry and 2 pieces of sukha mutton, served with 5 Tawa Rotis, 2 portions of rice, fresh salad, pickle and 1 sweet.",
        "image_path":  "https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/menu/thali/mutton-badshahi-hukumat-thali.webp",
        "name":  "Mutton Badshahi Hukumat Thali",
        "is_egg":  false,
        "is_veg":  false,
        "is_available":  true
    }
];

export const SEED_VARIANTS = [
    {
        "price":  60.00,
        "name":  "Chota Packet",
        "is_available":  true,
        "item_slug":  "dal-chawal-comfort-bowl"
    },
    {
        "price":  100.00,
        "name":  "Bada Dhamaka",
        "is_available":  true,
        "item_slug":  "dal-chawal-comfort-bowl"
    },
    {
        "price":  60.00,
        "name":  "Chota Packet",
        "is_available":  true,
        "item_slug":  "punjabi-kadhi-chawal"
    },
    {
        "price":  100.00,
        "name":  "Bada Dhamaka",
        "is_available":  true,
        "item_slug":  "punjabi-kadhi-chawal"
    },
    {
        "price":  60.00,
        "name":  "Little Treat",
        "is_available":  true,
        "item_slug":  "peeli-dal-ka-tadka-tashan"
    },
    {
        "price":  100.00,
        "name":  "Chhota Packet",
        "is_available":  true,
        "item_slug":  "peeli-dal-ka-tadka-tashan"
    },
    {
        "price":  180.00,
        "name":  "Full Tashan",
        "is_available":  true,
        "item_slug":  "peeli-dal-ka-tadka-tashan"
    },
    {
        "price":  340.00,
        "name":  "Jumbo Dhamaka",
        "is_available":  true,
        "item_slug":  "peeli-dal-ka-tadka-tashan"
    },
    {
        "price":  60.00,
        "name":  "Little Treat",
        "is_available":  true,
        "item_slug":  "panchmel-dal-ka-tadka-tashan"
    },
    {
        "price":  110.00,
        "name":  "Chhota Packet",
        "is_available":  true,
        "item_slug":  "panchmel-dal-ka-tadka-tashan"
    },
    {
        "price":  200.00,
        "name":  "Full Tashan",
        "is_available":  true,
        "item_slug":  "panchmel-dal-ka-tadka-tashan"
    },
    {
        "price":  360.00,
        "name":  "Jumbo Dhamaka",
        "is_available":  true,
        "item_slug":  "panchmel-dal-ka-tadka-tashan"
    },
    {
        "price":  70.00,
        "name":  "Little Treat",
        "is_available":  true,
        "item_slug":  "dal-bole-toh-butter-bomb"
    },
    {
        "price":  120.00,
        "name":  "Chhota Packet",
        "is_available":  true,
        "item_slug":  "dal-bole-toh-butter-bomb"
    },
    {
        "price":  220.00,
        "name":  "Full Tashan",
        "is_available":  true,
        "item_slug":  "dal-bole-toh-butter-bomb"
    },
    {
        "price":  420.00,
        "name":  "Jumbo Dhamaka",
        "is_available":  true,
        "item_slug":  "dal-bole-toh-butter-bomb"
    },
    {
        "price":  70.00,
        "name":  "Sweet",
        "is_available":  true,
        "item_slug":  "oye-lassi-lassi-oye"
    },
    {
        "price":  70.00,
        "name":  "Salt",
        "is_available":  true,
        "item_slug":  "oye-lassi-lassi-oye"
    },
    {
        "price":  70.00,
        "name":  "Little Treat",
        "is_available":  true,
        "item_slug":  "mushroom-masala-masti"
    },
    {
        "price":  130.00,
        "name":  "Chhota Packet",
        "is_available":  true,
        "item_slug":  "mushroom-masala-masti"
    },
    {
        "price":  240.00,
        "name":  "Full Tashan",
        "is_available":  true,
        "item_slug":  "mushroom-masala-masti"
    },
    {
        "price":  450.00,
        "name":  "Jumbo Dhamaka",
        "is_available":  true,
        "item_slug":  "mushroom-masala-masti"
    },
    {
        "price":  70.00,
        "name":  "Seasonal Sabzi Curry x Roti (2 Pieces)",
        "is_available":  true,
        "item_slug":  "veg-ka-patakha-thali"
    },
    {
        "price":  70.00,
        "name":  "Seasonal Sabzi Curry x Rice (1 Portion)",
        "is_available":  true,
        "item_slug":  "veg-ka-patakha-thali"
    },
    {
        "price":  80.00,
        "name":  "Matar Paneer Upgrade x Roti (2 Pieces)",
        "is_available":  true,
        "item_slug":  "veg-ka-patakha-thali"
    },
    {
        "price":  80.00,
        "name":  "Matar Paneer Upgrade x Rice (1 Portion)",
        "is_available":  true,
        "item_slug":  "veg-ka-patakha-thali"
    },
    {
        "price":  70.00,
        "name":  "Roti (2 Pieces)",
        "is_available":  true,
        "item_slug":  "anda-baazigar-thali"
    },
    {
        "price":  70.00,
        "name":  "Rice (1 Portion)",
        "is_available":  true,
        "item_slug":  "anda-baazigar-thali"
    },
    {
        "price":  70.00,
        "name":  "Chota Packet (5 Pieces)",
        "is_available":  true,
        "item_slug":  "chicken-momos-ki-mehfil"
    },
    {
        "price":  130.00,
        "name":  "Bada Dhamaka (8 Pieces)",
        "is_available":  true,
        "item_slug":  "chicken-momos-ki-mehfil"
    },
    {
        "price":  70.00,
        "name":  "Chota Packet",
        "is_available":  true,
        "item_slug":  "veg-noodles-masti"
    },
    {
        "price":  110.00,
        "name":  "Bada Dhamaka",
        "is_available":  true,
        "item_slug":  "veg-noodles-masti"
    },
    {
        "price":  70.00,
        "name":  "Chota Packet",
        "is_available":  true,
        "item_slug":  "veg-fried-rice-fiesta"
    },
    {
        "price":  120.00,
        "name":  "Bada Dhamaka",
        "is_available":  true,
        "item_slug":  "veg-fried-rice-fiesta"
    },
    {
        "price":  80.00,
        "name":  "Chota Packet (5 Pieces)",
        "is_available":  true,
        "item_slug":  "veg-momos-ka-crunch"
    },
    {
        "price":  130.00,
        "name":  "Bada Dhamaka (8 Pieces)",
        "is_available":  true,
        "item_slug":  "veg-momos-ka-crunch"
    },
    {
        "price":  80.00,
        "name":  "Chota Packet",
        "is_available":  true,
        "item_slug":  "egg-fried-rice-delight"
    },
    {
        "price":  140.00,
        "name":  "Bada Dhamaka",
        "is_available":  true,
        "item_slug":  "egg-fried-rice-delight"
    },
    {
        "price":  80.00,
        "name":  "Chota Packet (5 Pieces)",
        "is_available":  true,
        "item_slug":  "veg-momos-ki-chuski"
    },
    {
        "price":  120.00,
        "name":  "Bada Dhamaka (8 Pieces)",
        "is_available":  true,
        "item_slug":  "veg-momos-ki-chuski"
    },
    {
        "price":  80.00,
        "name":  "Chota Packet",
        "is_available":  true,
        "item_slug":  "matar-paneer-rice-delight"
    },
    {
        "price":  140.00,
        "name":  "Bada Dhamaka",
        "is_available":  true,
        "item_slug":  "matar-paneer-rice-delight"
    },
    {
        "price":  80.00,
        "name":  "Chota Packet",
        "is_available":  true,
        "item_slug":  "shahi-paneer-rice-feast"
    },
    {
        "price":  140.00,
        "name":  "Bada Dhamaka",
        "is_available":  true,
        "item_slug":  "shahi-paneer-rice-feast"
    },
    {
        "price":  240.00,
        "name":  "Full Tashan",
        "is_available":  true,
        "item_slug":  "chicken-seekh-masala-magic"
    },
    {
        "price":  470.00,
        "name":  "Jumbo Dhamaka",
        "is_available":  true,
        "item_slug":  "chicken-seekh-masala-magic"
    },
    {
        "price":  130.00,
        "name":  "Chhota Packet",
        "is_available":  true,
        "item_slug":  "chicken-seekh-masala-magic"
    },
    {
        "price":  80.00,
        "name":  "Little Treat",
        "is_available":  true,
        "item_slug":  "chicken-seekh-masala-magic"
    },
    {
        "price":  80.00,
        "name":  "Little Treat",
        "is_available":  true,
        "item_slug":  "chaap-e-afghani"
    },
    {
        "price":  140.00,
        "name":  "Chhota Packet",
        "is_available":  true,
        "item_slug":  "chaap-e-afghani"
    },
    {
        "price":  270.00,
        "name":  "Full Tashan",
        "is_available":  true,
        "item_slug":  "chaap-e-afghani"
    },
    {
        "price":  500.00,
        "name":  "Jumbo Dhamaka",
        "is_available":  true,
        "item_slug":  "chaap-e-afghani"
    },
    {
        "price":  80.00,
        "name":  "Little Treat",
        "is_available":  true,
        "item_slug":  "malai-mein-nahaayi-chaap"
    },
    {
        "price":  130.00,
        "name":  "Chhota Packet",
        "is_available":  true,
        "item_slug":  "malai-mein-nahaayi-chaap"
    },
    {
        "price":  250.00,
        "name":  "Full Tashan",
        "is_available":  true,
        "item_slug":  "malai-mein-nahaayi-chaap"
    },
    {
        "price":  480.00,
        "name":  "Jumbo Dhamaka",
        "is_available":  true,
        "item_slug":  "malai-mein-nahaayi-chaap"
    },
    {
        "price":  80.00,
        "name":  "Little Treat",
        "is_available":  true,
        "item_slug":  "paneer-ka-panga-masala"
    },
    {
        "price":  130.00,
        "name":  "Chhota Packet",
        "is_available":  true,
        "item_slug":  "paneer-ka-panga-masala"
    },
    {
        "price":  250.00,
        "name":  "Full Tashan",
        "is_available":  true,
        "item_slug":  "paneer-ka-panga-masala"
    },
    {
        "price":  480.00,
        "name":  "Jumbo Dhamaka",
        "is_available":  true,
        "item_slug":  "paneer-ka-panga-masala"
    },
    {
        "price":  90.00,
        "name":  "Rice (1 Portion)",
        "is_available":  true,
        "item_slug":  "chicken-ka-lallantop-thali"
    },
    {
        "price":  90.00,
        "name":  "Roti (2 Pieces)",
        "is_available":  true,
        "item_slug":  "chicken-ka-lallantop-thali"
    },
    {
        "price":  290.00,
        "name":  "Full Tashan",
        "is_available":  true,
        "item_slug":  "crispy-chicken-pakoda"
    },
    {
        "price":  470.00,
        "name":  "Jumbo Dhamaka",
        "is_available":  true,
        "item_slug":  "crispy-chicken-pakoda"
    },
    {
        "price":  160.00,
        "name":  "Chhota Packet",
        "is_available":  true,
        "item_slug":  "crispy-chicken-pakoda"
    },
    {
        "price":  90.00,
        "name":  "Little Treat",
        "is_available":  true,
        "item_slug":  "crispy-chicken-pakoda"
    },
    {
        "price":  100.00,
        "name":  "Rice (1 Portion)",
        "is_available":  true,
        "item_slug":  "machhli-ka-jhakkas-thali"
    },
    {
        "price":  100.00,
        "name":  "Roti (2 Pieces)",
        "is_available":  true,
        "item_slug":  "machhli-ka-jhakkas-thali"
    },
    {
        "price":  320.00,
        "name":  "Full Tashan",
        "is_available":  true,
        "item_slug":  "crispy-fish-fry"
    },
    {
        "price":  560.00,
        "name":  "Jumbo Dhamaka",
        "is_available":  true,
        "item_slug":  "crispy-fish-fry"
    },
    {
        "price":  170.00,
        "name":  "Chhota Packet",
        "is_available":  true,
        "item_slug":  "crispy-fish-fry"
    },
    {
        "price":  100.00,
        "name":  "Little Treat",
        "is_available":  true,
        "item_slug":  "crispy-fish-fry"
    },
    {
        "price":  100.00,
        "name":  "Chota Packet",
        "is_available":  true,
        "item_slug":  "singapuri-noodles-express"
    },
    {
        "price":  120.00,
        "name":  "Bada Dhamaka",
        "is_available":  true,
        "item_slug":  "singapuri-noodles-express"
    },
    {
        "price":  100.00,
        "name":  "Chota Packet (5 Pieces)",
        "is_available":  true,
        "item_slug":  "veg-momos-gravy-party"
    },
    {
        "price":  120.00,
        "name":  "Bada Dhamaka (8 Pieces)",
        "is_available":  true,
        "item_slug":  "veg-momos-gravy-party"
    },
    {
        "price":  100.00,
        "name":  "Chota Packet (5 Pieces)",
        "is_available":  true,
        "item_slug":  "chicken-momos-ka-crunch"
    },
    {
        "price":  120.00,
        "name":  "Bada Dhamaka (8 Pieces)",
        "is_available":  true,
        "item_slug":  "chicken-momos-ka-crunch"
    },
    {
        "price":  350.00,
        "name":  "Full Tashan",
        "is_available":  true,
        "item_slug":  "sarson-wali-fish-curry"
    },
    {
        "price":  630.00,
        "name":  "Jumbo Dhamaka",
        "is_available":  true,
        "item_slug":  "sarson-wali-fish-curry"
    },
    {
        "price":  190.00,
        "name":  "Chhota Packet",
        "is_available":  true,
        "item_slug":  "sarson-wali-fish-curry"
    },
    {
        "price":  110.00,
        "name":  "Little Treat",
        "is_available":  true,
        "item_slug":  "sarson-wali-fish-curry"
    },
    {
        "price":  350.00,
        "name":  "Full Tashan",
        "is_available":  true,
        "item_slug":  "dragon-chicken-fire"
    },
    {
        "price":  590.00,
        "name":  "Jumbo Dhamaka",
        "is_available":  true,
        "item_slug":  "dragon-chicken-fire"
    },
    {
        "price":  190.00,
        "name":  "Chhota Packet",
        "is_available":  true,
        "item_slug":  "dragon-chicken-fire"
    },
    {
        "price":  110.00,
        "name":  "Little Treat",
        "is_available":  true,
        "item_slug":  "dragon-chicken-fire"
    },
    {
        "price":  350.00,
        "name":  "Full Tashan",
        "is_available":  true,
        "item_slug":  "chatpata-chicken-blast"
    },
    {
        "price":  590.00,
        "name":  "Jumbo Dhamaka",
        "is_available":  true,
        "item_slug":  "chatpata-chicken-blast"
    },
    {
        "price":  190.00,
        "name":  "Chhota Packet",
        "is_available":  true,
        "item_slug":  "chatpata-chicken-blast"
    },
    {
        "price":  110.00,
        "name":  "Little Treat",
        "is_available":  true,
        "item_slug":  "chatpata-chicken-blast"
    },
    {
        "price":  390.00,
        "name":  "Full Tashan",
        "is_available":  true,
        "item_slug":  "desi-prawn-curry"
    },
    {
        "price":  700.00,
        "name":  "Jumbo Dhamaka",
        "is_available":  true,
        "item_slug":  "desi-prawn-curry"
    },
    {
        "price":  210.00,
        "name":  "Chhota Packet",
        "is_available":  true,
        "item_slug":  "desi-prawn-curry"
    },
    {
        "price":  110.00,
        "name":  "Little Treat",
        "is_available":  true,
        "item_slug":  "desi-prawn-curry"
    },
    {
        "price":  110.00,
        "name":  "Chota Packet",
        "is_available":  true,
        "item_slug":  "chilli-garlic-noodles-blast"
    },
    {
        "price":  140.00,
        "name":  "Bada Dhamaka",
        "is_available":  true,
        "item_slug":  "chilli-garlic-noodles-blast"
    },
    {
        "price":  120.00,
        "name":  "Chota Packet (5 Pieces)",
        "is_available":  true,
        "item_slug":  "chicken-momos-gravy-wale"
    },
    {
        "price":  140.00,
        "name":  "Bada Dhamaka (8 Pieces)",
        "is_available":  true,
        "item_slug":  "chicken-momos-gravy-wale"
    },
    {
        "price":  120.00,
        "name":  "Chhota Packet",
        "is_available":  true,
        "item_slug":  "laal-angaar-chicken"
    },
    {
        "price":  230.00,
        "name":  "Full Tashan",
        "is_available":  true,
        "item_slug":  "laal-angaar-chicken"
    },
    {
        "price":  450.00,
        "name":  "Jumbo Dhamaka",
        "is_available":  true,
        "item_slug":  "laal-angaar-chicken"
    },
    {
        "price":  120.00,
        "name":  "Rice (1 Portion)",
        "is_available":  true,
        "item_slug":  "jhinga-ka-pehelwan-thali"
    },
    {
        "price":  120.00,
        "name":  "Roti (2 Pieces)",
        "is_available":  true,
        "item_slug":  "jhinga-ka-pehelwan-thali"
    },
    {
        "price":  450.00,
        "name":  "Full Tashan",
        "is_available":  true,
        "item_slug":  "zesty-lemon-chicken"
    },
    {
        "price":  820.00,
        "name":  "Jumbo Dhamaka",
        "is_available":  true,
        "item_slug":  "zesty-lemon-chicken"
    },
    {
        "price":  240.00,
        "name":  "Chhota Packet",
        "is_available":  true,
        "item_slug":  "zesty-lemon-chicken"
    },
    {
        "price":  130.00,
        "name":  "Little Treat",
        "is_available":  true,
        "item_slug":  "zesty-lemon-chicken"
    },
    {
        "price":  420.00,
        "name":  "Full Tashan",
        "is_available":  true,
        "item_slug":  "chatpata-prawn-masala"
    },
    {
        "price":  770.00,
        "name":  "Jumbo Dhamaka",
        "is_available":  true,
        "item_slug":  "chatpata-prawn-masala"
    },
    {
        "price":  220.00,
        "name":  "Chhota Packet",
        "is_available":  true,
        "item_slug":  "chatpata-prawn-masala"
    },
    {
        "price":  130.00,
        "name":  "Little Treat",
        "is_available":  true,
        "item_slug":  "chatpata-prawn-masala"
    },
    {
        "price":  140.00,
        "name":  "Rice (1 Portion)",
        "is_available":  true,
        "item_slug":  "mutton-ka-dabangg-thali"
    },
    {
        "price":  140.00,
        "name":  "Roti (2 Pieces)",
        "is_available":  true,
        "item_slug":  "mutton-ka-dabangg-thali"
    },
    {
        "price":  490.00,
        "name":  "Full Tashan",
        "is_available":  true,
        "item_slug":  "bihari-handi-chicken"
    },
    {
        "price":  940.00,
        "name":  "Jumbo Dhamaka",
        "is_available":  true,
        "item_slug":  "bihari-handi-chicken"
    },
    {
        "price":  260.00,
        "name":  "Chhota Packet",
        "is_available":  true,
        "item_slug":  "bihari-handi-chicken"
    },
    {
        "price":  140.00,
        "name":  "Little Treat",
        "is_available":  true,
        "item_slug":  "bihari-handi-chicken"
    },
    {
        "price":  530.00,
        "name":  "Full Tashan",
        "is_available":  true,
        "item_slug":  "butter-chicken-ka-shahi-swad"
    },
    {
        "price":  940.00,
        "name":  "Jumbo Dhamaka",
        "is_available":  true,
        "item_slug":  "butter-chicken-ka-shahi-swad"
    },
    {
        "price":  280.00,
        "name":  "Chhota Packet",
        "is_available":  true,
        "item_slug":  "butter-chicken-ka-shahi-swad"
    },
    {
        "price":  150.00,
        "name":  "Little Treat",
        "is_available":  true,
        "item_slug":  "butter-chicken-ka-shahi-swad"
    },
    {
        "price":  560.00,
        "name":  "Full Tashan",
        "is_available":  true,
        "item_slug":  "creamy-chicken-delight"
    },
    {
        "price":  1050.00,
        "name":  "Jumbo Dhamaka",
        "is_available":  true,
        "item_slug":  "creamy-chicken-delight"
    },
    {
        "price":  290.00,
        "name":  "Chhota Packet",
        "is_available":  true,
        "item_slug":  "creamy-chicken-delight"
    },
    {
        "price":  160.00,
        "name":  "Little Treat",
        "is_available":  true,
        "item_slug":  "creamy-chicken-delight"
    },
    {
        "price":  590.00,
        "name":  "Full Tashan",
        "is_available":  true,
        "item_slug":  "champaran-handi-chicken"
    },
    {
        "price":  1050.00,
        "name":  "Jumbo Dhamaka",
        "is_available":  true,
        "item_slug":  "champaran-handi-chicken"
    },
    {
        "price":  310.00,
        "name":  "Chhota Packet",
        "is_available":  true,
        "item_slug":  "champaran-handi-chicken"
    },
    {
        "price":  170.00,
        "name":  "Little Treat",
        "is_available":  true,
        "item_slug":  "champaran-handi-chicken"
    },
    {
        "price":  180.00,
        "name":  "Chota Packet",
        "is_available":  true,
        "item_slug":  "chicken-dumdaar-biryani"
    },
    {
        "price":  280.00,
        "name":  "Bada Dhamaka",
        "is_available":  true,
        "item_slug":  "chicken-dumdaar-biryani"
    },
    {
        "price":  880.00,
        "name":  "Full Tashan",
        "is_available":  true,
        "item_slug":  "bihari-ahuna-mutton"
    },
    {
        "price":  1640.00,
        "name":  "Jumbo Dhamaka",
        "is_available":  true,
        "item_slug":  "bihari-ahuna-mutton"
    },
    {
        "price":  450.00,
        "name":  "Chhota Packet",
        "is_available":  true,
        "item_slug":  "bihari-ahuna-mutton"
    },
    {
        "price":  240.00,
        "name":  "Little Treat",
        "is_available":  true,
        "item_slug":  "bihari-ahuna-mutton"
    },
    {
        "price":  240.00,
        "name":  "Chota Packet",
        "is_available":  true,
        "item_slug":  "mutton-sultanate-dum-biryani"
    },
    {
        "price":  350.00,
        "name":  "Bada Dhamaka",
        "is_available":  true,
        "item_slug":  "mutton-sultanate-dum-biryani"
    },
    {
        "price":  940.00,
        "name":  "Full Tashan",
        "is_available":  true,
        "item_slug":  "champaran-ahuna-mutton"
    },
    {
        "price":  1750.00,
        "name":  "Jumbo Dhamaka",
        "is_available":  true,
        "item_slug":  "champaran-ahuna-mutton"
    },
    {
        "price":  480.00,
        "name":  "Chhota Packet",
        "is_available":  true,
        "item_slug":  "champaran-ahuna-mutton"
    },
    {
        "price":  250.00,
        "name":  "Little Treat",
        "is_available":  true,
        "item_slug":  "champaran-ahuna-mutton"
    }
];
