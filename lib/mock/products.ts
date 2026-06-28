// Mock data for products

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  image: string;
  price: number;
  originalPrice?: number;
  category: string;
  description: string;
  specifications: Record<string, string>;
  features: string[];
  stock: number;
  rating: number;
  reviews: number;
  isNew?: boolean;
  isBestseller?: boolean;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Arduino Uno R3',
    slug: 'arduino-uno-r3',
    sku: 'ARDUINO-UNO-R3',
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&h=500&fit=crop',
    price: 450,
    originalPrice: 550,
    category: 'Microcontrollers',
    description: 'The Arduino Uno is a microcontroller board based on the ATmega328P. It has 14 digital input/output pins, 6 analog inputs, a USB connection, and more.',
    specifications: {
      'Microcontroller': 'ATmega328P',
      'Operating Voltage': '5V',
      'Digital I/O Pins': '14',
      'Analog Input Pins': '6',
      'PWM Pins': '6',
      'SRAM': '2KB',
      'FLASH': '32KB'
    },
    features: ['Easy to use', 'Open source', 'Affordable', 'Large community'],
    stock: 150,
    rating: 4.8,
    reviews: 320,
    isNew: false,
    isBestseller: true
  },
  {
    id: '2',
    name: 'Raspberry Pi 4 Model B',
    slug: 'raspberry-pi-4-model-b',
    sku: 'RPI-4-8GB',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&h=500&fit=crop',
    price: 4500,
    category: 'Single Board Computers',
    description: 'Raspberry Pi 4 Model B is the latest product in the Raspberry Pi range. It features a 1.5GHz quad-core processor, 8GB of RAM, and dual HDMI output.',
    specifications: {
      'Processor': 'Broadcom BCM2711',
      'RAM': '8GB LPDDR4-3200',
      'USB': '2x USB 3.0, 2x USB 2.0',
      'Connectivity': 'Gigabit Ethernet, WiFi 6, Bluetooth 5.0',
      'Video Output': 'Dual micro-HDMI'
    },
    features: ['Powerful', 'Great for projects', 'Perfect for learning', 'Long-term support'],
    stock: 75,
    rating: 4.9,
    reviews: 580,
    isNew: true,
    isBestseller: true
  },
  {
    id: '3',
    name: 'DHT22 Temperature & Humidity Sensor',
    slug: 'dht22-sensor',
    sku: 'DHT22-SENSOR',
    image: 'https://images.unsplash.com/photo-1580913322150-a3785e5f5b1e?w=500&h=500&fit=crop',
    price: 280,
    originalPrice: 350,
    category: 'Sensors',
    description: 'DHT22 (also labeled as AM2302) is a basic digital temperature and humidity sensor. It uses a capacitive humidity sensor and a thermistor to measure the surrounding air.',
    specifications: {
      'Humidity Range': '0-100% RH',
      'Temperature Range': '-40 to 80°C',
      'Accuracy': '±2% RH, ±0.5°C',
      'Operating Voltage': '3.3-5.5V',
      'Sampling Rate': '0.5 Hz'
    },
    features: ['High accuracy', 'Wide range', 'Low cost', 'Easy integration'],
    stock: 200,
    rating: 4.6,
    reviews: 210,
    isNew: false,
    isBestseller: false
  },
  {
    id: '4',
    name: 'HC-SR04 Ultrasonic Sensor',
    slug: 'hc-sr04-sensor',
    sku: 'HC-SR04',
    image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=500&h=500&fit=crop',
    price: 150,
    category: 'Sensors',
    description: 'HC-SR04 is an ultrasonic distance sensor. It offers excellent range and accuracy. The sensor comes complete with ultrasonic transmitter and receiver modules.',
    specifications: {
      'Measuring Range': '2cm to 400cm',
      'Resolution': '0.3cm',
      'Accuracy': '±3mm',
      'Operating Voltage': '5V DC',
      'Frequency': '40kHz'
    },
    features: ['Non-contact', 'High precision', 'Wide range', 'Low power'],
    stock: 300,
    rating: 4.7,
    reviews: 450,
    isNew: false,
    isBestseller: true
  },
  {
    id: '5',
    name: '16x2 LCD Display Module',
    slug: 'lcd-16x2-display',
    sku: 'LCD-16X2-I2C',
    image: 'https://images.unsplash.com/photo-1545365440-7145f842f084?w=500&h=500&fit=crop',
    price: 320,
    originalPrice: 400,
    category: 'Displays',
    description: '16x2 LCD display module with I2C interface. Perfect for displaying text and numbers in your projects. Easy to use with Arduino and Raspberry Pi.',
    specifications: {
      'Resolution': '16x2 characters',
      'Interface': 'I2C',
      'Operating Voltage': '5V',
      'Backlight': 'Blue LED',
      'Dimensions': '82x36x23mm'
    },
    features: ['Easy to use', 'I2C interface', 'Bright display', 'Low power'],
    stock: 120,
    rating: 4.5,
    reviews: 180,
    isNew: true,
    isBestseller: false
  },
  {
    id: '6',
    name: 'Servo Motor SG90',
    slug: 'servo-motor-sg90',
    sku: 'SG90-SERVO',
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b3f7?w=500&h=500&fit=crop',
    price: 220,
    category: 'Motors',
    description: 'The SG90 is the most popular micro servo for hobby applications. Ideal for use in small robots, RC planes, and other projects requiring precise positioning.',
    specifications: {
      'Operating Voltage': '4.8-6V',
      'Torque': '1.8kg-cm',
      'Speed': '0.12sec/60°',
      'Dimensions': '23x11x22mm',
      'Weight': '9g'
    },
    features: ['Compact size', 'Strong torque', 'Precise control', 'Affordable'],
    stock: 250,
    rating: 4.8,
    reviews: 380,
    isNew: false,
    isBestseller: true
  }
];

export const categories = [
  { id: '1', name: 'Microcontrollers', slug: 'microcontrollers', icon: '🖥️' },
  { id: '2', name: 'Single Board Computers', slug: 'sbc', icon: '💻' },
  { id: '3', name: 'Sensors', slug: 'sensors', icon: '📡' },
  { id: '4', name: 'Displays', slug: 'displays', icon: '📺' },
  { id: '5', name: 'Motors', slug: 'motors', icon: '⚙️' },
  { id: '6', name: 'Power Supplies', slug: 'power', icon: '🔌' },
];

export const iotKits = [
  {
    id: '1',
    name: 'Arduino Beginner Starter Kit',
    slug: 'arduino-beginner-kit',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=500&fit=crop',
    price: 1999,
    originalPrice: 2500,
    description: 'Everything you need to start learning Arduino programming and building IoT projects.',
    components: [
      'Arduino Uno R3',
      'Breadboard',
      'LED Set',
      'Resistor Set',
      'Jumper Wires',
      'USB Cable',
      'Documentation'
    ],
    rating: 4.9,
    reviews: 245
  },
  {
    id: '2',
    name: 'IoT Home Automation Kit',
    slug: 'iot-home-automation-kit',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
    price: 4999,
    originalPrice: 6500,
    description: 'Complete kit for building a smart home automation system with sensors and controls.',
    components: [
      'Arduino Mega',
      'WiFi Module',
      'Temperature Sensor',
      'Motion Detector',
      'Relay Module',
      'Power Supply',
      'Wiring & Connectors'
    ],
    rating: 4.7,
    reviews: 156
  }
];
