// Mock catalog data — original AKR Electronics content.
// Structure inspired by leading Indian electronics stores; all text is our own.

export interface WarrantyInfo {
  days: number;
  summary: string;
  voidsIf: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  image: string;
  images?: string[];
  price: number;
  originalPrice?: number;
  gstRate: number;
  category: string;
  categorySlug: string;
  brand: string;
  brandSlug: string;
  description: string;
  specifications: Record<string, string>;
  features: string[];
  packageIncludes?: string[];
  warranty: WarrantyInfo;
  countryOfOrigin: string;
  stock: number;
  rating: number;
  reviews: number;
  isNew?: boolean;
  isBestseller?: boolean;
  isFeatured?: boolean;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  icon: string;
  children?: CategoryNode[];
}

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  gradient: string;
  badge?: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
}

export interface ProductQuestion {
  id: string;
  productId: string;
  author: string;
  question: string;
  answer?: string;
  date: string;
}

export interface Coupon {
  code: string;
  type: 'PERCENT' | 'FLAT';
  value: number;
  minOrder: number;
  expiresAt: string;
  active: boolean;
}

export const STANDARD_WARRANTY: WarrantyInfo = {
  days: 15,
  summary:
    'Covered against manufacturing defects for 15 days from delivery. Replacement is provided for verified manufacturing defects.',
  voidsIf:
    'Warranty is void if the product is misused, tampered with, damaged by static discharge, water or fire, exposed to chemicals, or soldered/altered in any way.',
};

export const FREE_DELIVERY_THRESHOLD = 999;
export const GST_RATE_DEFAULT = 18;

export const brands: Brand[] = [
  { id: 'b1', name: 'Arduino', slug: 'arduino', description: 'Open-source electronics platform' },
  { id: 'b2', name: 'Raspberry Pi', slug: 'raspberry-pi', description: 'Single-board computers for makers' },
  { id: 'b3', name: 'Espressif', slug: 'espressif', description: 'WiFi + Bluetooth SoCs (ESP32/ESP8266)' },
  { id: 'b4', name: 'AKR Pro', slug: 'akr-pro', description: 'Our in-house tested component range' },
  { id: 'b5', name: 'Generic', slug: 'generic', description: 'Quality-checked multi-brand components' },
];

export const categoryTree: CategoryNode[] = [
  {
    id: 'c1',
    name: 'Development Boards',
    slug: 'development-boards',
    icon: '🖥️',
    children: [
      { id: 'c1a', name: 'Arduino Boards', slug: 'arduino-boards', icon: '🔵' },
      { id: 'c1b', name: 'Raspberry Pi', slug: 'raspberry-pi', icon: '🍓' },
      { id: 'c1c', name: 'ESP32 / WiFi Boards', slug: 'esp32-wifi-boards', icon: '📶' },
    ],
  },
  {
    id: 'c2',
    name: 'Sensors',
    slug: 'sensors',
    icon: '📡',
    children: [
      { id: 'c2a', name: 'Temperature & Humidity', slug: 'temperature-humidity', icon: '🌡️' },
      { id: 'c2b', name: 'Distance & Proximity', slug: 'distance-proximity', icon: '📏' },
      { id: 'c2c', name: 'Motion & IMU', slug: 'motion-imu', icon: '🌀' },
    ],
  },
  {
    id: 'c3',
    name: 'Displays & LEDs',
    slug: 'displays',
    icon: '📺',
    children: [
      { id: 'c3a', name: 'LCD Displays', slug: 'lcd-displays', icon: '🔡' },
      { id: 'c3b', name: 'OLED Displays', slug: 'oled-displays', icon: '⬛' },
      { id: 'c3c', name: 'LED Strips', slug: 'led-strips', icon: '🌈' },
    ],
  },
  {
    id: 'c4',
    name: 'Motors & Drivers',
    slug: 'motors',
    icon: '⚙️',
    children: [
      { id: 'c4a', name: 'Servo Motors', slug: 'servo-motors', icon: '🦾' },
      { id: 'c4b', name: 'Stepper Motors', slug: 'stepper-motors', icon: '🔩' },
      { id: 'c4c', name: 'Motor Drivers', slug: 'motor-drivers', icon: '🎛️' },
    ],
  },
  {
    id: 'c5',
    name: 'Power & Batteries',
    slug: 'power',
    icon: '🔌',
    children: [
      { id: 'c5a', name: 'Power Supplies', slug: 'power-supplies', icon: '⚡' },
      { id: 'c5b', name: 'Battery Chargers', slug: 'battery-chargers', icon: '🔋' },
    ],
  },
  {
    id: 'c6',
    name: 'IoT & Wireless',
    slug: 'iot-wireless',
    icon: '🛜',
    children: [
      { id: 'c6a', name: 'WiFi Modules', slug: 'wifi-modules', icon: '📶' },
      { id: 'c6b', name: 'Bluetooth Modules', slug: 'bluetooth-modules', icon: '🔷' },
      { id: 'c6c', name: 'GSM / GPS', slug: 'gsm-gps', icon: '🛰️' },
    ],
  },
  {
    id: 'c7',
    name: 'DIY & Maker Kits',
    slug: 'kits',
    icon: '🧰',
    children: [
      { id: 'c7a', name: 'Starter Kits', slug: 'starter-kits', icon: '🎒' },
      { id: 'c7b', name: 'Robotics Kits', slug: 'robotics-kits', icon: '🤖' },
    ],
  },
  {
    id: 'c8',
    name: 'Tools & Prototyping',
    slug: 'tools',
    icon: '🛠️',
    children: [
      { id: 'c8a', name: 'Breadboards & Wires', slug: 'breadboards-wires', icon: '🧪' },
      { id: 'c8b', name: 'Soldering', slug: 'soldering', icon: '🔥' },
    ],
  },
];

// Kept for pages that still use the flat category list
export const categories = categoryTree.map(({ id, name, slug, icon }) => ({ id, name, slug, icon }));

export const products: Product[] = [
  {
    id: '1',
    name: 'Arduino Uno R3',
    slug: 'arduino-uno-r3',
    sku: 'AKR-DB-0001',
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&h=500&fit=crop',
    price: 450,
    originalPrice: 550,
    gstRate: 18,
    category: 'Development Boards',
    categorySlug: 'development-boards',
    brand: 'Arduino',
    brandSlug: 'arduino',
    description:
      'The Arduino Uno is a microcontroller board based on the ATmega328P. It has 14 digital input/output pins, 6 analog inputs, a USB connection, and more. The go-to board for beginners and rapid prototyping.',
    specifications: {
      Microcontroller: 'ATmega328P',
      'Operating Voltage': '5V',
      'Digital I/O Pins': '14',
      'Analog Input Pins': '6',
      'PWM Pins': '6',
      SRAM: '2KB',
      Flash: '32KB',
      'Shipping Weight': '0.05 kg',
    },
    features: ['Easy to use', 'Open source', 'Affordable', 'Large community'],
    packageIncludes: ['1 x Arduino Uno R3 board', '1 x USB Type-B cable'],
    warranty: STANDARD_WARRANTY,
    countryOfOrigin: 'Italy',
    stock: 150,
    rating: 4.8,
    reviews: 320,
    isBestseller: true,
    isFeatured: true,
  },
  {
    id: '2',
    name: 'Raspberry Pi 4 Model B (8GB)',
    slug: 'raspberry-pi-4-model-b',
    sku: 'AKR-DB-0002',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&h=500&fit=crop',
    price: 8499,
    gstRate: 18,
    category: 'Development Boards',
    categorySlug: 'development-boards',
    brand: 'Raspberry Pi',
    brandSlug: 'raspberry-pi',
    description:
      'Raspberry Pi 4 Model B features a 1.5GHz quad-core processor, 8GB of RAM, dual 4K HDMI output, USB 3.0 and Gigabit Ethernet — a full desktop-class computer for IoT and edge projects.',
    specifications: {
      Processor: 'Broadcom BCM2711 quad-core',
      RAM: '8GB LPDDR4-3200',
      USB: '2x USB 3.0, 2x USB 2.0',
      Connectivity: 'Gigabit Ethernet, WiFi 5, Bluetooth 5.0',
      'Video Output': 'Dual micro-HDMI (4K60)',
      'Shipping Weight': '0.09 kg',
    },
    features: ['Desktop-class power', 'Dual 4K display', '40-pin GPIO', 'Long-term support'],
    packageIncludes: ['1 x Raspberry Pi 4 Model B 8GB'],
    warranty: STANDARD_WARRANTY,
    countryOfOrigin: 'United Kingdom',
    stock: 75,
    rating: 4.9,
    reviews: 580,
    isNew: true,
    isBestseller: true,
    isFeatured: true,
  },
  {
    id: '3',
    name: 'DHT22 Temperature & Humidity Sensor',
    slug: 'dht22-sensor',
    sku: 'AKR-SN-0003',
    image: 'https://images.unsplash.com/photo-1580913322150-a3785e5f5b1e?w=500&h=500&fit=crop',
    price: 280,
    originalPrice: 350,
    gstRate: 18,
    category: 'Sensors',
    categorySlug: 'sensors',
    brand: 'Generic',
    brandSlug: 'generic',
    description:
      'DHT22 (AM2302) is a calibrated digital temperature and humidity sensor using a capacitive humidity element and thermistor. Single-wire digital output makes integration simple.',
    specifications: {
      'Humidity Range': '0–100% RH',
      'Temperature Range': '-40 to 80°C',
      Accuracy: '±2% RH, ±0.5°C',
      'Operating Voltage': '3.3–5.5V',
      'Sampling Rate': '0.5 Hz',
      'Shipping Weight': '0.01 kg',
    },
    features: ['High accuracy', 'Wide range', 'Low cost', 'Easy integration'],
    packageIncludes: ['1 x DHT22 sensor module', '1 x 3-pin jumper cable'],
    warranty: STANDARD_WARRANTY,
    countryOfOrigin: 'China',
    stock: 200,
    rating: 4.6,
    reviews: 210,
  },
  {
    id: '4',
    name: 'HC-SR04 Ultrasonic Distance Sensor',
    slug: 'hc-sr04-sensor',
    sku: 'AKR-SN-0004',
    image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=500&h=500&fit=crop',
    price: 150,
    gstRate: 18,
    category: 'Sensors',
    categorySlug: 'sensors',
    brand: 'Generic',
    brandSlug: 'generic',
    description:
      'HC-SR04 measures distance from 2cm to 4m using ultrasonic pulses, with transmitter and receiver on one module. The staple sensor for obstacle-avoiding robots.',
    specifications: {
      'Measuring Range': '2cm to 400cm',
      Resolution: '0.3cm',
      Accuracy: '±3mm',
      'Operating Voltage': '5V DC',
      Frequency: '40kHz',
      'Shipping Weight': '0.01 kg',
    },
    features: ['Non-contact', 'High precision', 'Wide range', 'Low power'],
    packageIncludes: ['1 x HC-SR04 module'],
    warranty: STANDARD_WARRANTY,
    countryOfOrigin: 'China',
    stock: 300,
    rating: 4.7,
    reviews: 450,
    isBestseller: true,
  },
  {
    id: '5',
    name: '16x2 LCD Display Module (I2C)',
    slug: 'lcd-16x2-display',
    sku: 'AKR-DP-0005',
    image: 'https://images.unsplash.com/photo-1545365440-7145f842f084?w=500&h=500&fit=crop',
    price: 320,
    originalPrice: 400,
    gstRate: 18,
    category: 'Displays & LEDs',
    categorySlug: 'displays',
    brand: 'Generic',
    brandSlug: 'generic',
    description:
      '16x2 character LCD with an I2C backpack — display text and values using just two wires. Works out of the box with Arduino and Raspberry Pi libraries.',
    specifications: {
      Resolution: '16x2 characters',
      Interface: 'I2C',
      'Operating Voltage': '5V',
      Backlight: 'Blue LED',
      Dimensions: '82x36x23mm',
      'Shipping Weight': '0.04 kg',
    },
    features: ['Two-wire I2C', 'Bright backlight', 'Adjustable contrast', 'Low power'],
    packageIncludes: ['1 x 16x2 LCD with soldered I2C backpack'],
    warranty: STANDARD_WARRANTY,
    countryOfOrigin: 'China',
    stock: 120,
    rating: 4.5,
    reviews: 180,
    isNew: true,
  },
  {
    id: '6',
    name: 'SG90 Micro Servo Motor',
    slug: 'servo-motor-sg90',
    sku: 'AKR-MT-0006',
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b3f7?w=500&h=500&fit=crop',
    price: 220,
    gstRate: 18,
    category: 'Motors & Drivers',
    categorySlug: 'motors',
    brand: 'Generic',
    brandSlug: 'generic',
    description:
      'The SG90 is the most popular micro servo for hobby robotics — 180° precise positioning in a 9-gram package. Ideal for small robots, pan-tilt mounts and RC builds.',
    specifications: {
      'Operating Voltage': '4.8–6V',
      Torque: '1.8kg-cm',
      Speed: '0.12sec/60°',
      Dimensions: '23x11x22mm',
      Weight: '9g',
      'Shipping Weight': '0.02 kg',
    },
    features: ['Compact size', 'Strong torque', 'Precise control', 'Affordable'],
    packageIncludes: ['1 x SG90 servo', '3 x servo horns', 'Mounting screws'],
    warranty: STANDARD_WARRANTY,
    countryOfOrigin: 'China',
    stock: 250,
    rating: 4.8,
    reviews: 380,
    isBestseller: true,
  },
  {
    id: '7',
    name: 'ESP32 Development Board (WiFi + Bluetooth)',
    slug: 'esp32-dev-board',
    sku: 'AKR-DB-0007',
    image: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=500&h=500&fit=crop',
    price: 549,
    originalPrice: 699,
    gstRate: 18,
    category: 'IoT & Wireless',
    categorySlug: 'iot-wireless',
    brand: 'Espressif',
    brandSlug: 'espressif',
    description:
      'Dual-core ESP32 with built-in WiFi and Bluetooth — the default choice for connected IoT projects. Program with Arduino IDE, MicroPython or ESP-IDF.',
    specifications: {
      Chipset: 'ESP32-WROOM-32',
      Cores: 'Dual-core Xtensa LX6 @ 240MHz',
      WiFi: '802.11 b/g/n',
      Bluetooth: 'v4.2 BR/EDR + BLE',
      GPIO: '30 pins',
      Flash: '4MB',
      'Shipping Weight': '0.02 kg',
    },
    features: ['WiFi + BT on one chip', 'Dual core', 'Deep sleep at µA levels', 'Huge ecosystem'],
    packageIncludes: ['1 x ESP32 DevKit board', '1 x Micro-USB cable'],
    warranty: STANDARD_WARRANTY,
    countryOfOrigin: 'China',
    stock: 220,
    rating: 4.8,
    reviews: 415,
    isBestseller: true,
    isFeatured: true,
  },
  {
    id: '8',
    name: 'WS2812B Addressable RGB LED Strip (1m, 60 LED)',
    slug: 'ws2812b-led-strip',
    sku: 'AKR-DP-0008',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&h=500&fit=crop',
    price: 499,
    originalPrice: 649,
    gstRate: 18,
    category: 'Displays & LEDs',
    categorySlug: 'displays',
    brand: 'AKR Pro',
    brandSlug: 'akr-pro',
    description:
      'Individually addressable RGB LED strip — control every pixel from a single data pin. Perfect for ambient lighting, wearables and interactive displays.',
    specifications: {
      'LED Type': 'WS2812B (integrated driver)',
      Density: '60 LEDs/m',
      Voltage: '5V DC',
      Power: '18W/m max',
      Protocol: 'Single-wire 800kHz',
      'Shipping Weight': '0.06 kg',
    },
    features: ['Per-pixel control', 'Cut-to-length', 'Adhesive backing', 'Library support'],
    packageIncludes: ['1m WS2812B strip', '3-pin JST connector pre-soldered'],
    warranty: STANDARD_WARRANTY,
    countryOfOrigin: 'China',
    stock: 80,
    rating: 4.6,
    reviews: 145,
    isFeatured: true,
  },
  {
    id: '9',
    name: '830-Point Solderless Breadboard',
    slug: 'breadboard-830',
    sku: 'AKR-TL-0009',
    image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=500&h=500&fit=crop',
    price: 129,
    gstRate: 18,
    category: 'Tools & Prototyping',
    categorySlug: 'tools',
    brand: 'AKR Pro',
    brandSlug: 'akr-pro',
    description:
      'Full-size 830 tie-point breadboard with power rails on both sides. Tight, reliable contacts rated for thousands of insertions.',
    specifications: {
      'Tie Points': '830',
      'Power Rails': '2 (both sides)',
      'Wire Gauge': '20–29 AWG',
      Dimensions: '165x55x10mm',
      'Shipping Weight': '0.09 kg',
    },
    features: ['Reliable contacts', 'Self-adhesive back', 'Interlocks with more boards'],
    warranty: STANDARD_WARRANTY,
    countryOfOrigin: 'China',
    stock: 500,
    rating: 4.7,
    reviews: 620,
    isBestseller: true,
  },
  {
    id: '10',
    name: 'Jumper Wires Set (120 pcs, M-M / M-F / F-F)',
    slug: 'jumper-wires-120',
    sku: 'AKR-TL-0010',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
    price: 199,
    originalPrice: 249,
    gstRate: 18,
    category: 'Tools & Prototyping',
    categorySlug: 'tools',
    brand: 'AKR Pro',
    brandSlug: 'akr-pro',
    description:
      'Complete jumper set: 40 male-male, 40 male-female and 40 female-female dupont wires in 20cm length, ribbon-joined so you can peel what you need.',
    specifications: {
      Count: '120 wires (40 each type)',
      Length: '20cm',
      Pitch: '2.54mm dupont',
      'Shipping Weight': '0.10 kg',
    },
    features: ['All three types', 'Peelable ribbon', 'Color coded'],
    warranty: STANDARD_WARRANTY,
    countryOfOrigin: 'China',
    stock: 400,
    rating: 4.6,
    reviews: 530,
  },
  {
    id: '11',
    name: 'L298N Dual H-Bridge Motor Driver',
    slug: 'l298n-motor-driver',
    sku: 'AKR-MT-0011',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&h=500&fit=crop',
    price: 179,
    gstRate: 18,
    category: 'Motors & Drivers',
    categorySlug: 'motors',
    brand: 'Generic',
    brandSlug: 'generic',
    description:
      'Drive two DC motors or one stepper with direction and PWM speed control. Screw terminals, onboard 5V regulator and heatsink included.',
    specifications: {
      Driver: 'L298N dual H-bridge',
      'Motor Voltage': '5–35V',
      'Peak Current': '2A per channel',
      'Logic Voltage': '5V',
      'Shipping Weight': '0.03 kg',
    },
    features: ['Two channels', 'Onboard regulator', 'Screw terminals', 'Heatsink fitted'],
    warranty: STANDARD_WARRANTY,
    countryOfOrigin: 'China',
    stock: 180,
    rating: 4.5,
    reviews: 260,
  },
  {
    id: '12',
    name: '5V 3A Power Supply Adapter (DC Barrel)',
    slug: 'power-adapter-5v-3a',
    sku: 'AKR-PW-0012',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&h=500&fit=crop',
    price: 349,
    gstRate: 18,
    category: 'Power & Batteries',
    categorySlug: 'power',
    brand: 'AKR Pro',
    brandSlug: 'akr-pro',
    description:
      'Regulated 5V 3A wall adapter with 5.5x2.1mm barrel jack — clean power for LED strips, dev boards and motor projects. BIS-compliant with Indian plug.',
    specifications: {
      Output: '5V DC, 3A',
      Input: '100–240V AC 50/60Hz',
      Connector: '5.5x2.1mm barrel, centre positive',
      Certification: 'BIS',
      'Shipping Weight': '0.12 kg',
    },
    features: ['Regulated output', 'Short-circuit protection', 'Indian plug', 'BIS certified'],
    warranty: { ...STANDARD_WARRANTY, days: 90, summary: 'Covered against manufacturing defects for 90 days from delivery.' },
    countryOfOrigin: 'India',
    stock: 140,
    rating: 4.7,
    reviews: 190,
    isNew: true,
  },
];

export const iotKits = [
  {
    id: 'k1',
    name: 'AKR Arduino Beginner Starter Kit',
    slug: 'arduino-beginner-kit',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=500&fit=crop',
    price: 1999,
    originalPrice: 2500,
    description: 'Everything you need to start learning Arduino programming and building IoT projects.',
    components: ['Arduino Uno R3', 'Breadboard', 'LED Set', 'Resistor Set', 'Jumper Wires', 'USB Cable', 'Project Guide'],
    rating: 4.9,
    reviews: 245,
  },
  {
    id: 'k2',
    name: 'AKR IoT Home Automation Kit',
    slug: 'iot-home-automation-kit',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
    price: 4999,
    originalPrice: 6500,
    description: 'Complete kit for building a smart home automation system with sensors and controls.',
    components: ['ESP32 Board', 'Relay Module', 'DHT22 Sensor', 'PIR Motion Sensor', 'Power Supply', 'Wiring & Connectors', 'Project Guide'],
    rating: 4.7,
    reviews: 156,
  },
];

export const heroBanners: HeroBanner[] = [
  {
    id: 'hb1',
    title: 'IoT Components for Every Project',
    subtitle: 'Arduino, Raspberry Pi, ESP32, sensors and complete kits — genuine parts, fast dispatch across India.',
    cta: 'Shop Now',
    href: '/products',
    gradient: 'from-primary-700 via-primary-600 to-primary-400',
    badge: 'Free delivery above ₹999',
  },
  {
    id: 'hb2',
    title: 'New: ESP32 Boards from ₹549',
    subtitle: 'WiFi + Bluetooth on one chip. Build connected projects this weekend.',
    cta: 'Explore ESP32',
    href: '/products?category=iot-wireless',
    gradient: 'from-indigo-700 via-indigo-600 to-blue-400',
    badge: 'Just launched',
  },
  {
    id: 'hb3',
    title: 'Starter Kits for Students',
    subtitle: 'Curated kits with project guides — from first LED blink to home automation.',
    cta: 'View Kits',
    href: '/products?category=kits',
    gradient: 'from-emerald-700 via-emerald-600 to-teal-400',
    badge: 'Save up to 25%',
  },
];

export const productReviews: ProductReview[] = [
  {
    id: 'r1',
    productId: '1',
    author: 'Ravi Kumar',
    rating: 5,
    title: 'Genuine board, fast delivery',
    body: 'Original Arduino, arrived in 2 days with proper packaging. Works perfectly with the IDE.',
    date: '2026-06-12',
    status: 'APPROVED',
  },
  {
    id: 'r2',
    productId: '1',
    author: 'Sneha P',
    rating: 4,
    title: 'Good for beginners',
    body: 'Solid starter board. Wish the USB cable was longer, but no complaints on quality.',
    date: '2026-05-28',
    status: 'APPROVED',
  },
  {
    id: 'r3',
    productId: '7',
    author: 'Arjun M',
    rating: 5,
    title: 'Best value dev board',
    body: 'Flashed MicroPython without any driver drama. WiFi range is better than my old ESP8266.',
    date: '2026-06-20',
    status: 'APPROVED',
  },
  {
    id: 'r4',
    productId: '2',
    author: 'Deepika S',
    rating: 5,
    title: 'Runs my home server',
    body: '8GB model handles Home Assistant plus a few containers easily. Genuine UK-made unit.',
    date: '2026-06-02',
    status: 'PENDING',
  },
];

export const productQuestions: ProductQuestion[] = [
  {
    id: 'q1',
    productId: '1',
    author: 'Vikram',
    question: 'Does this come with the USB cable included?',
    answer: 'Yes — a USB Type-B cable is included in the box.',
    date: '2026-06-05',
  },
  {
    id: 'q2',
    productId: '7',
    author: 'Farhan',
    question: 'Can I power it directly from a 3.7V LiPo battery?',
    answer: 'Not directly on the 3V3 pin under load; use a board with a charging circuit or a boost converter to 5V on VIN.',
    date: '2026-06-18',
  },
  {
    id: 'q3',
    productId: '8',
    author: 'Meera',
    question: 'Is the strip waterproof?',
    date: '2026-06-25',
  },
];

export const coupons: Coupon[] = [
  { code: 'SAVE10', type: 'PERCENT', value: 10, minOrder: 500, expiresAt: '2026-12-31', active: true },
  { code: 'WELCOME50', type: 'FLAT', value: 50, minOrder: 300, expiresAt: '2026-12-31', active: true },
  { code: 'STUDENT15', type: 'PERCENT', value: 15, minOrder: 1000, expiresAt: '2026-08-31', active: false },
];

export interface TrackableOrder {
  orderNumber: string;
  email: string;
  status: 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
  placedAt: string;
  items: { name: string; quantity: number }[];
  timeline: { label: string; date: string; done: boolean }[];
}

export const trackableOrders: TrackableOrder[] = [
  {
    orderNumber: 'AKR-2026-1042',
    email: 'demo@akr.com',
    status: 'SHIPPED',
    placedAt: '2026-06-28',
    items: [
      { name: 'Arduino Uno R3', quantity: 1 },
      { name: 'Jumper Wires Set (120 pcs)', quantity: 2 },
    ],
    timeline: [
      { label: 'Order confirmed', date: '2026-06-28', done: true },
      { label: 'Packed', date: '2026-06-29', done: true },
      { label: 'Shipped', date: '2026-06-30', done: true },
      { label: 'Out for delivery', date: '', done: false },
      { label: 'Delivered', date: '', done: false },
    ],
  },
];

export function estimateDelivery(pincode: string): { ok: boolean; message: string } {
  if (!/^[1-9][0-9]{5}$/.test(pincode)) {
    return { ok: false, message: 'Enter a valid 6-digit pincode' };
  }
  const zone = Number(pincode[0]);
  const days = zone <= 4 ? '2–4' : '3–6';
  return { ok: true, message: `Delivery in ${days} business days to ${pincode}` };
}

export function getProductBySlugOrId(idOrSlug: string): Product | undefined {
  return products.find(p => p.id === idOrSlug || p.slug === idOrSlug);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return products.filter(p => p.categorySlug === product.categorySlug && p.id !== product.id).slice(0, limit);
}
