import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { menuBuilderService } from '../api/menuBuilder.service'
import type { MenuItem, MenuBuilder } from '../types'
import { menuBuilderAdapter } from '../adapters/menuBuilder.adapter'

const USE_MOCK_DATA = true

const MOCK_MENU_ITEMS: MenuItem[] = [
  // Appetizers (15 items)
  {
    id: '1',
    name: 'Caesar Salad',
    description: 'Classic romaine lettuce with parmesan, croutons, and Caesar dressing',
    category: 'appetizers',
    dietaryTags: ['vegetarian'],
    priceCents: 1200,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '2',
    name: 'Bruschetta',
    description: 'Toasted bread topped with fresh tomatoes, basil, and olive oil',
    category: 'appetizers',
    dietaryTags: ['vegan', 'vegetarian'],
    priceCents: 800,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '3',
    name: 'Caprese Salad',
    description: 'Fresh mozzarella, tomatoes, and basil with balsamic glaze',
    category: 'appetizers',
    dietaryTags: ['vegetarian', 'gluten-free'],
    priceCents: 1100,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '4',
    name: 'Shrimp Cocktail',
    description: 'Chilled jumbo shrimp with zesty cocktail sauce',
    category: 'appetizers',
    dietaryTags: ['gluten-free'],
    priceCents: 1500,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1633967135257-1d5c8e87dc0d?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '5',
    name: 'French Onion Soup',
    description: 'Caramelized onions in rich beef broth with melted gruyere',
    category: 'appetizers',
    priceCents: 1000,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '6',
    name: 'Greek Salad',
    description: 'Mixed greens with feta, olives, cucumber, and Greek vinaigrette',
    category: 'appetizers',
    dietaryTags: ['vegetarian', 'gluten-free'],
    priceCents: 1100,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '7',
    name: 'Tuna Tartare',
    description: 'Fresh yellowfin tuna with avocado, sesame, and soy glaze',
    category: 'appetizers',
    dietaryTags: ['gluten-free', 'dairy-free'],
    priceCents: 1800,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '8',
    name: 'Buffalo Wings',
    description: 'Crispy chicken wings tossed in spicy buffalo sauce',
    category: 'appetizers',
    priceCents: 1300,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '9',
    name: 'Spring Rolls',
    description: 'Crispy vegetable spring rolls with sweet chili sauce',
    category: 'appetizers',
    dietaryTags: ['vegan', 'vegetarian'],
    priceCents: 900,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '10',
    name: 'Spinach Artichoke Dip',
    description: 'Creamy dip served with tortilla chips',
    category: 'appetizers',
    dietaryTags: ['vegetarian'],
    priceCents: 1100,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '11',
    name: 'Calamari',
    description: 'Lightly fried squid rings with marinara sauce',
    category: 'appetizers',
    priceCents: 1400,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '12',
    name: 'Mozzarella Sticks',
    description: 'Crispy breaded mozzarella with marinara',
    category: 'appetizers',
    dietaryTags: ['vegetarian'],
    priceCents: 950,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1531749668029-2db88e4276c7?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '13',
    name: 'Hummus Platter',
    description: 'House-made hummus with pita bread and vegetables',
    category: 'appetizers',
    dietaryTags: ['vegan', 'vegetarian'],
    priceCents: 850,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1571599270210-c0c52aa20c51?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '14',
    name: 'Stuffed Mushrooms',
    description: 'Mushroom caps filled with herb cream cheese',
    category: 'appetizers',
    dietaryTags: ['vegetarian', 'gluten-free'],
    priceCents: 1100,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '15',
    name: 'Nachos Supreme',
    description: 'Loaded nachos with cheese, jalapeños, and sour cream',
    category: 'appetizers',
    dietaryTags: ['vegetarian'],
    priceCents: 1200,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&q=80',
    isAvailable: true,
  },

  // Mains (20 items)
  {
    id: '16',
    name: 'Grilled Salmon',
    description: 'Fresh Atlantic salmon with lemon butter sauce and seasonal vegetables',
    category: 'mains',
    dietaryTags: ['gluten-free', 'dairy-free'],
    priceCents: 2800,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '17',
    name: 'Ribeye Steak',
    description: '12oz prime ribeye grilled to perfection with garlic butter',
    category: 'mains',
    dietaryTags: ['gluten-free'],
    priceCents: 3500,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '18',
    name: 'Chicken Parmesan',
    description: 'Breaded chicken breast with marinara and melted mozzarella',
    category: 'mains',
    priceCents: 2400,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '19',
    name: 'Pasta Primavera',
    description: 'Fresh seasonal vegetables tossed with penne in light cream sauce',
    category: 'mains',
    dietaryTags: ['vegetarian'],
    priceCents: 2200,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '20',
    name: 'Mushroom Risotto',
    description: 'Creamy arborio rice with wild mushrooms and truffle oil',
    category: 'mains',
    dietaryTags: ['vegetarian', 'gluten-free'],
    priceCents: 2400,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1476124369491-c6f3b43e2c85?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '21',
    name: 'Lobster Ravioli',
    description: 'Handmade ravioli stuffed with lobster in cream sauce',
    category: 'mains',
    priceCents: 3200,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1587740908075-9ea9e6e6e0b4?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '22',
    name: 'Margherita Pizza',
    description: 'Classic pizza with fresh mozzarella, tomato sauce, and basil',
    category: 'mains',
    dietaryTags: ['vegetarian'],
    priceCents: 1600,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '23',
    name: 'Fish Tacos',
    description: 'Grilled mahi-mahi with cabbage slaw and chipotle mayo',
    category: 'mains',
    priceCents: 1900,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '24',
    name: 'BBQ Ribs',
    description: 'Slow-cooked baby back ribs with tangy BBQ sauce',
    category: 'mains',
    dietaryTags: ['gluten-free'],
    priceCents: 2900,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '25',
    name: 'Vegetable Curry',
    description: 'Mixed vegetables in aromatic coconut curry sauce',
    category: 'mains',
    dietaryTags: ['vegan', 'vegetarian', 'gluten-free'],
    priceCents: 1800,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '26',
    name: 'Beef Tacos',
    description: 'Three soft tacos with seasoned beef, cheese, and salsa',
    category: 'mains',
    priceCents: 1700,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '27',
    name: 'Lamb Chops',
    description: 'Grilled lamb chops with rosemary and mint jelly',
    category: 'mains',
    dietaryTags: ['gluten-free'],
    priceCents: 3800,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1595777216528-071e0127ccbf?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '28',
    name: 'Pad Thai',
    description: 'Traditional Thai noodles with shrimp, peanuts, and lime',
    category: 'mains',
    dietaryTags: ['dairy-free'],
    priceCents: 1900,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '29',
    name: 'Eggplant Parmesan',
    description: 'Breaded eggplant layered with marinara and mozzarella',
    category: 'mains',
    dietaryTags: ['vegetarian'],
    priceCents: 2100,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1589624100198-f5b5b9c0f1f6?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '30',
    name: 'Sushi Platter',
    description: 'Assorted nigiri and maki rolls with wasabi and ginger',
    category: 'mains',
    dietaryTags: ['gluten-free', 'dairy-free'],
    priceCents: 3200,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '31',
    name: 'Chicken Tikka Masala',
    description: 'Tender chicken in creamy tomato curry sauce',
    category: 'mains',
    dietaryTags: ['gluten-free'],
    priceCents: 2200,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '32',
    name: 'Pork Schnitzel',
    description: 'Breaded pork cutlet with lemon and capers',
    category: 'mains',
    priceCents: 2500,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1432139509613-5c4255815697?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '33',
    name: 'Shrimp Scampi',
    description: 'Garlic butter shrimp served over linguine',
    category: 'mains',
    priceCents: 2600,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1633504581786-316c8002b1b9?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '34',
    name: 'Falafel Wrap',
    description: 'Crispy falafel with tahini sauce in warm pita',
    category: 'mains',
    dietaryTags: ['vegan', 'vegetarian'],
    priceCents: 1500,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '35',
    name: 'Duck Confit',
    description: 'Slow-cooked duck leg with crispy skin and orange glaze',
    category: 'mains',
    dietaryTags: ['gluten-free'],
    priceCents: 3400,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b0?w=400&q=80',
    isAvailable: true,
  },

  // Sides (10 items)
  {
    id: '36',
    name: 'Truffle Fries',
    description: 'Crispy fries tossed with truffle oil and parmesan',
    category: 'sides',
    dietaryTags: ['vegetarian'],
    priceCents: 850,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '37',
    name: 'Garlic Bread',
    description: 'Warm baguette with garlic butter and fresh parsley',
    category: 'sides',
    dietaryTags: ['vegetarian'],
    priceCents: 600,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1573140401552-3fab0b24306f?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '38',
    name: 'Roasted Vegetables',
    description: 'Seasonal vegetables roasted with herbs and olive oil',
    category: 'sides',
    dietaryTags: ['vegan', 'vegetarian', 'gluten-free'],
    priceCents: 700,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '39',
    name: 'Mashed Potatoes',
    description: 'Creamy mashed potatoes with butter and chives',
    category: 'sides',
    dietaryTags: ['vegetarian', 'gluten-free'],
    priceCents: 650,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1585565804112-2b7e2b3491c6?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '40',
    name: 'Coleslaw',
    description: 'Crisp cabbage slaw with tangy dressing',
    category: 'sides',
    dietaryTags: ['vegetarian', 'gluten-free'],
    priceCents: 500,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '41',
    name: 'Rice Pilaf',
    description: 'Fragrant rice with herbs and vegetables',
    category: 'sides',
    dietaryTags: ['vegan', 'vegetarian', 'gluten-free'],
    priceCents: 550,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '42',
    name: 'Mac and Cheese',
    description: 'Creamy macaroni with three cheese blend',
    category: 'sides',
    dietaryTags: ['vegetarian'],
    priceCents: 800,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1543826173-1beebf90fdee?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '43',
    name: 'Sweet Potato Fries',
    description: 'Crispy sweet potato fries with honey mustard',
    category: 'sides',
    dietaryTags: ['vegan', 'vegetarian'],
    priceCents: 750,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '44',
    name: 'Onion Rings',
    description: 'Beer-battered onion rings with ranch dressing',
    category: 'sides',
    dietaryTags: ['vegetarian'],
    priceCents: 700,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '45',
    name: 'Steamed Broccoli',
    description: 'Fresh broccoli florets with lemon and garlic',
    category: 'sides',
    dietaryTags: ['vegan', 'vegetarian', 'gluten-free'],
    priceCents: 600,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&q=80',
    isAvailable: true,
  },

  // Desserts (12 items)
  {
    id: '46',
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with molten center, served with vanilla ice cream',
    category: 'desserts',
    dietaryTags: ['vegetarian'],
    priceCents: 1200,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '47',
    name: 'Tiramisu',
    description: 'Classic Italian dessert with espresso-soaked ladyfingers and mascarpone',
    category: 'desserts',
    dietaryTags: ['vegetarian'],
    priceCents: 1000,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '48',
    name: 'Crème Brûlée',
    description: 'Creamy vanilla custard with caramelized sugar topping',
    category: 'desserts',
    dietaryTags: ['vegetarian', 'gluten-free'],
    priceCents: 900,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '49',
    name: 'Cheesecake',
    description: 'New York style cheesecake with berry compote',
    category: 'desserts',
    dietaryTags: ['vegetarian'],
    priceCents: 950,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1533134242820-b4f7f2e89c8c?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '50',
    name: 'Apple Pie',
    description: 'Classic apple pie with cinnamon and vanilla ice cream',
    category: 'desserts',
    dietaryTags: ['vegetarian'],
    priceCents: 850,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1535920527002-b35e96722eb9?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '51',
    name: 'Panna Cotta',
    description: 'Silky Italian dessert with fresh berries',
    category: 'desserts',
    dietaryTags: ['vegetarian', 'gluten-free'],
    priceCents: 900,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '52',
    name: 'Chocolate Mousse',
    description: 'Rich dark chocolate mousse with whipped cream',
    category: 'desserts',
    dietaryTags: ['vegetarian', 'gluten-free'],
    priceCents: 950,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1541599468348-e96984315921?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '53',
    name: 'Lemon Tart',
    description: 'Tangy lemon curd in buttery pastry shell',
    category: 'desserts',
    dietaryTags: ['vegetarian'],
    priceCents: 900,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '54',
    name: 'Brownie Sundae',
    description: 'Warm brownie with vanilla ice cream and chocolate sauce',
    category: 'desserts',
    dietaryTags: ['vegetarian'],
    priceCents: 1100,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '55',
    name: 'Fruit Sorbet',
    description: 'Refreshing mixed fruit sorbet',
    category: 'desserts',
    dietaryTags: ['vegan', 'vegetarian', 'gluten-free', 'dairy-free'],
    priceCents: 700,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '56',
    name: 'Carrot Cake',
    description: 'Moist carrot cake with cream cheese frosting',
    category: 'desserts',
    dietaryTags: ['vegetarian'],
    priceCents: 950,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '57',
    name: 'Affogato',
    description: 'Vanilla gelato drowned in hot espresso',
    category: 'desserts',
    dietaryTags: ['vegetarian', 'gluten-free'],
    priceCents: 800,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1514361892635-6b07e31e75f9?w=400&q=80',
    isAvailable: true,
  },

  // Beverages (8 items)
  {
    id: '58',
    name: 'Fresh Lemonade',
    description: 'Freshly squeezed lemon juice with mint',
    category: 'beverages',
    dietaryTags: ['vegan', 'vegetarian', 'gluten-free'],
    priceCents: 400,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9d?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '59',
    name: 'Iced Tea',
    description: 'Freshly brewed black tea served over ice',
    category: 'beverages',
    dietaryTags: ['vegan', 'vegetarian', 'gluten-free'],
    priceCents: 350,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '60',
    name: 'Espresso',
    description: 'Rich Italian espresso shot',
    category: 'beverages',
    dietaryTags: ['vegan', 'vegetarian', 'gluten-free'],
    priceCents: 300,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '61',
    name: 'Orange Juice',
    description: 'Freshly squeezed Florida oranges',
    category: 'beverages',
    dietaryTags: ['vegan', 'vegetarian', 'gluten-free'],
    priceCents: 450,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '62',
    name: 'Smoothie Bowl',
    description: 'Blended berries topped with granola and fresh fruit',
    category: 'beverages',
    dietaryTags: ['vegetarian'],
    priceCents: 900,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '63',
    name: 'Cappuccino',
    description: 'Espresso with steamed milk and foam',
    category: 'beverages',
    dietaryTags: ['vegetarian'],
    priceCents: 500,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '64',
    name: 'Craft Beer',
    description: 'Local craft beer on tap',
    category: 'beverages',
    dietaryTags: ['vegan'],
    priceCents: 700,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&q=80',
    isAvailable: true,
  },
  {
    id: '65',
    name: 'Red Wine',
    description: 'House selection red wine',
    category: 'beverages',
    dietaryTags: ['vegan', 'vegetarian', 'gluten-free'],
    priceCents: 900,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=80',
    isAvailable: true,
  },
]

export const MENU_BUILDER_KEYS = {
  all: ['menu-builder'] as const,
  lists: () => [...MENU_BUILDER_KEYS.all, 'list'] as const,
  list: (accountId: string) => [...MENU_BUILDER_KEYS.lists(), accountId] as const,
  details: () => [...MENU_BUILDER_KEYS.all, 'detail'] as const,
  detail: (accountId: string, menuId: string) => [...MENU_BUILDER_KEYS.details(), accountId, menuId] as const,
  items: () => [...MENU_BUILDER_KEYS.all, 'items'] as const,
  itemsList: (accountId: string) => [...MENU_BUILDER_KEYS.items(), accountId] as const,
}

export function useAvailableMenuItems(accountId: string) {
  return useQuery({
    queryKey: MENU_BUILDER_KEYS.itemsList(accountId),
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500))
        return MOCK_MENU_ITEMS
      }
      const apiItems = await menuBuilderService.getAvailableItems(accountId)
      return menuBuilderAdapter.toMenuItems(apiItems)
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useMenu(accountId: string, menuId?: string) {
  return useQuery({
    queryKey: MENU_BUILDER_KEYS.detail(accountId, menuId || ''),
    queryFn: async () => {
      const apiMenu = await menuBuilderService.getMenu(accountId, menuId!)
      return menuBuilderAdapter.toMenuBuilder(apiMenu)
    },
    enabled: !!menuId,
  })
}

export function useMenus(accountId: string) {
  return useQuery({
    queryKey: MENU_BUILDER_KEYS.list(accountId),
    queryFn: async () => {
      const apiMenus = await menuBuilderService.listMenus(accountId)
      return menuBuilderAdapter.toMenuBuilders(apiMenus)
    },
  })
}

export function useCreateMenu(accountId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (menu: MenuBuilder) => {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.log('Mock: Created menu', menu)
        const mockResponse = {
          ...menu,
          id: `menu_${Date.now()}`,
          accountId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          courses: menu.courses.map((c, idx) => ({
            ...c,
            id: `course_${idx}`,
            position: idx,
            items: c.items.map((item, itemIdx) => ({
              ...item,
              id: `item_${itemIdx}`,
            })),
          })),
        }
        return menuBuilderAdapter.toMenuBuilder(mockResponse as unknown as import('../api/menuBuilder.service').MenuBuilderResponse)
      }
      const apiRequest = menuBuilderAdapter.fromMenuBuilder(menu)
      const apiResponse = await menuBuilderService.createMenu(accountId, apiRequest)
      return menuBuilderAdapter.toMenuBuilder(apiResponse)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_BUILDER_KEYS.list(accountId) })
      toast.success('Menu created successfully')
    },
    onError: () => {
      toast.error('Failed to create menu')
    },
  })
}

export function useUpdateMenu(accountId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ menuId, menu }: { menuId: string; menu: MenuBuilder }) => {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.log('Mock: Updated menu', menuId, menu)
        const mockResponse = {
          ...menu,
          id: menuId,
          accountId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          courses: menu.courses.map((c, idx) => ({
            ...c,
            id: c.id || `course_${idx}`,
            position: idx,
            items: c.items.map((item, itemIdx) => ({
              ...item,
              id: `item_${itemIdx}`,
            })),
          })),
        }
        return menuBuilderAdapter.toMenuBuilder(mockResponse as unknown as import('../api/menuBuilder.service').MenuBuilderResponse)
      }
      const apiRequest = menuBuilderAdapter.fromMenuBuilder(menu)
      const apiResponse = await menuBuilderService.updateMenu(accountId, menuId, apiRequest)
      return menuBuilderAdapter.toMenuBuilder(apiResponse)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: MENU_BUILDER_KEYS.list(accountId) })
      queryClient.invalidateQueries({ queryKey: MENU_BUILDER_KEYS.detail(accountId, data.id!) })
      toast.success('Menu updated successfully')
    },
    onError: () => {
      toast.error('Failed to update menu')
    },
  })
}

export function useDeleteMenu(accountId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (menuId: string) => menuBuilderService.deleteMenu(accountId, menuId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_BUILDER_KEYS.list(accountId) })
      toast.success('Menu deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete menu')
    },
  })
}

export function useDuplicateMenu(accountId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (menuId: string) => {
      const apiResponse = await menuBuilderService.duplicateMenu(accountId, menuId)
      return menuBuilderAdapter.toMenuBuilder(apiResponse)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_BUILDER_KEYS.list(accountId) })
      toast.success('Menu duplicated successfully')
    },
    onError: () => {
      toast.error('Failed to duplicate menu')
    },
  })
}
