# Ultrasound Simulator

An interactive educational web application that simulates ultrasound wave propagation through different tissue types, demonstrating key principles of medical ultrasound physics.

![Ultrasound Simulator](https://github.com/AliMoamen/ultrasound-simulator/blob/master/raw/main/screenshot.png)

## 🔍 Features

- **Interactive Simulation:** Visualize ultrasound waves traveling through multiple tissue layers
- **Real-time Parameter Adjustment:** Change frequency, power, and tissue layers to see immediate effects
- **Physics-based Calculations:** Accurate representation of:
  - Penetration depth based on frequency, attenuation, and power
  - Wave reflection at tissue interfaces based on acoustic impedance
  - Wavelength and axial resolution
  - Sound speed and round-trip time
- **Educational Content:** Detailed information about:
  - Tissue properties (speed of sound, density, attenuation)
  - Formulas used in ultrasound physics
  - Core concepts and clinical relevance

## 🔧 Technologies

- **React** + **TypeScript** + **Vite**
- **Tailwind CSS** for styling
- **shadcn/ui** component library

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/AliMoamen/ultrasound-simulator.git
cd ultrasound-simulator
```

2. Install dependencies
```bash
npm install
# or 
yarn
```

3. Start the development server
```bash
npm run dev
# or
yarn dev
```

4. Open your browser to `http://localhost:5173`

## 📚 Educational Use

This simulator is designed for:
- Medical students learning ultrasound principles
- Sonography and radiology training
- Physics education related to wave propagation
- Anyone interested in understanding how medical ultrasound works

## 🧠 The Science Behind It

The simulator models several key aspects of ultrasound physics:

1. **Frequency and Penetration Depth**: Higher frequencies provide better resolution but less penetration.
2. **Acoustic Impedance**: Product of tissue density and speed of sound, determines reflection at interfaces.
3. **Attenuation**: How quickly ultrasound energy is lost in tissue.
4. **Axial Resolution**: The minimum distance needed to distinguish two objects along the beam axis.

## 🤝 Contributing

Contributions are welcome! Feel free to submit a pull request or open an issue for:
- Bug reports
- Feature suggestions
- Educational content improvements
- Code optimizations

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by principles of medical physics education
- Built with React and modern web technologies
