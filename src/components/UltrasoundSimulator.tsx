import React, { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define tissue type interfaces
type TissueType =
  | "Skin"
  | "Fat"
  | "Muscle"
  | "Bone"
  | "Blood"
  | "Liver"
  | "Brain"
  | "Other";

interface TissueProperties {
  speed: number;
  attenuation: number;
  density: number; // in kg/m³
  color: string;
  thickness: number;
}

interface TissuesMap {
  Skin: TissueProperties;
  Fat: TissueProperties;
  Muscle: TissueProperties;
  Bone: TissueProperties;
  Blood: TissueProperties;
  Liver: TissueProperties;
  Brain: TissueProperties;
  Other: TissueProperties;
}

interface TissueLayer {
  type: TissueType;
  thickness: number;
}

// Define tissue types and properties
const tissues: TissuesMap = {
  Skin: {
    speed: 1540,
    attenuation: 0.8,
    density: 1100,
    color: "#ffd6a5",
    thickness: 0.3,
  },
  Fat: {
    speed: 1450,
    attenuation: 0.6,
    density: 920,
    color: "#ffee93",
    thickness: 2.0,
  },
  Muscle: {
    speed: 1580,
    attenuation: 1.2,
    density: 1050,
    color: "#ff9b9b",
    thickness: 3.0,
  },
  Bone: {
    speed: 4080,
    attenuation: 10.0,
    density: 1900,
    color: "#ffffff",
    thickness: 1.5,
  },
  Blood: {
    speed: 1570,
    attenuation: 0.2,
    density: 1060,
    color: "#ff6b6b",
    thickness: 1.0,
  },
  Liver: {
    speed: 1550,
    attenuation: 0.9,
    density: 1060,
    color: "#9c5518",
    thickness: 5.0,
  },
  Brain: {
    speed: 1560,
    attenuation: 0.85,
    density: 1040,
    color: "#e6bccd",
    thickness: 4.0,
  },
  Other: {
    speed: 1540,
    attenuation: 1.0,
    density: 1050,
    color: "#b8c4d9",
    thickness: 2.0,
  },
};

export default function UltrasoundSimulator() {
  const [frequency, setFrequency] = useState(5); // in MHz
  const [tissue] = useState<TissueType>("Skin");
  const [power, setPower] = useState(50); // in percentage
  const [isRunning, setIsRunning] = useState(true);
  const [tissueLayers, setTissueLayers] = useState<TissueLayer[]>([
    { type: "Skin", thickness: 0.3 },
    { type: "Fat", thickness: 1.5 },
    { type: "Muscle", thickness: 3.0 },
    { type: "Other", thickness: 2.0 },
  ]);
  const [showLayerControls, setShowLayerControls] = useState(false);

  // Get current tissue for single tissue mode
  const currentTissue = tissues[tissue];
  const speed = currentTissue.speed;
  const wavelength = (speed / (frequency * 1e6)).toFixed(6); // in meters
  const wavelengthMm = (Number(wavelength) * 1000).toFixed(3); // in mm

  // Calculate average properties for layered tissues
  const totalThickness = tissueLayers.reduce(
    (sum, layer) => sum + layer.thickness,
    0
  );
  const weightedSpeed =
    tissueLayers.reduce((sum, layer) => {
      return sum + tissues[layer.type].speed * layer.thickness;
    }, 0) / totalThickness;

  const weightedAttenuation =
    tissueLayers.reduce((sum, layer) => {
      return sum + tissues[layer.type].attenuation * layer.thickness;
    }, 0) / totalThickness;

  // Calculate base penetration depth based on tissue and frequency
  const basePenetrationDepth = parseFloat(
    ((100 / weightedAttenuation) * (1 / frequency)).toFixed(1)
  ); // in cm

  // Adjust penetration depth based on power
  const penetrationDepth = basePenetrationDepth * (power / 100);

  // Always use the calculated penetration depth for display
  const displayDepth = penetrationDepth;

  const resolution = ((Number(wavelength) * 1000) / 2).toFixed(3); // axial resolution in mm
  const roundTrip = ((penetrationDepth * 2) / (weightedSpeed / 10000)).toFixed(
    3
  ); // in microseconds, now using penetration depth

  // Generate multiple wave positions for better visualization
  const waveCount = 5;
  const amplitude = power / 100;

  // Simple tissue interface reflection calculation (percentage)
  function calculateReflection(tissue1: TissueType, tissue2: TissueType) {
    const z1 = tissues[tissue1].speed * tissues[tissue1].density;
    const z2 = tissues[tissue2].speed * tissues[tissue2].density;
    const reflection = Math.pow((z2 - z1) / (z2 + z1), 2) * 100;
    return reflection.toFixed(1);
  }

  // Toggle simulation
  const toggleSimulation = () => {
    setIsRunning(!isRunning);
  };

  // Add tissue layer
  const addTissueLayer = () => {
    if (tissueLayers.length < 5) {
      const newLayer: TissueLayer = { type: "Muscle", thickness: 2.0 };
      setTissueLayers([...tissueLayers, newLayer]);
    }
  };

  // Remove tissue layer
  const removeTissueLayer = (index: number) => {
    if (tissueLayers.length > 1) {
      const newLayers = [...tissueLayers];
      newLayers.splice(index, 1);
      setTissueLayers(newLayers);
    }
  };

  // Update tissue layer
  const updateTissueLayer = (
    index: number,
    property: keyof TissueLayer,
    value: TissueType | number
  ) => {
    const newLayers = [...tissueLayers];
    newLayers[index] = {
      ...newLayers[index],
      [property]: value,
    };
    setTissueLayers(newLayers);
  };

  return (
    <div className="h-screen flex flex-col p-4 max-w-6xl mx-auto overflow-hidden">
      <h1 className="text-2xl font-bold mb-4">
        Interactive Ultrasound Simulator
      </h1>
      <div className="grid grid-cols-2 gap-6 flex-grow overflow-hidden">
        {/* Parameters Section - Left Side */}
        <div className="h-full overflow-y-auto flex flex-col pr-4 border-r">
          <Card className="flex-grow flex flex-col">
            <div className="p-4 flex flex-col h-full justify-between overflow-y-auto">
              <div className="space-y-6 flex-grow">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-3 block">Frequency (MHz)</Label>
                    <Slider
                      min={1}
                      max={15}
                      step={0.5}
                      value={[frequency]}
                      onValueChange={([val]) => setFrequency(val)}
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      {frequency} MHz
                    </p>
                  </div>

                  <div>
                    <Label className="mb-3 block">Power (%)</Label>
                    <Slider
                      min={10}
                      max={100}
                      step={5}
                      value={[power]}
                      onValueChange={([val]) => setPower(val)}
                    />
                    <p className="text-sm text-gray-500 mt-2">{power}%</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between items-center">
                      <Label>Tissue Layers</Label>
                      <button
                        className="text-xs bg-blue-100 hover:bg-blue-200 py-1 px-2 rounded"
                        onClick={() => setShowLayerControls(!showLayerControls)}
                      >
                        {showLayerControls ? "Hide Controls" : "Edit Layers"}
                      </button>
                    </div>
                    <div className="mt-2 border rounded p-2 bg-gray-50 min-h-[80px]">
                      {tissueLayers.map((layer, i) => (
                        <div key={i} className="flex items-center mb-1 text-xs">
                          <div
                            className="w-3 h-3 mr-2 rounded-sm"
                            style={{
                              backgroundColor: tissues[layer.type].color,
                            }}
                          ></div>
                          <span>
                            {layer.type} ({layer.thickness.toFixed(1)} cm)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Max Penetration Depth</Label>
                    <div className="mt-2 border rounded p-2 bg-gray-50 min-h-[60px] flex items-center justify-center">
                      <p className="text-xl font-mono">
                        {displayDepth.toFixed(1)} cm
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Based on frequency, tissue, and power
                    </p>
                  </div>
                </div>

                {showLayerControls && (
                  <div className="border rounded p-2 bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-sm">Layer Controls</h3>
                      <button
                        className="text-xs bg-green-100 hover:bg-green-200 py-1 px-2 rounded"
                        onClick={addTissueLayer}
                        disabled={tissueLayers.length >= 5}
                      >
                        + Add Layer
                      </button>
                    </div>
                    <div className="max-h-[200px] overflow-y-auto">
                      {tissueLayers.map((layer, i) => (
                        <div
                          key={i}
                          className="mb-3 pb-2 border-b last:border-b-0"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium">
                              Layer {i + 1}
                            </span>
                            <button
                              className="text-xs text-red-500 hover:text-red-700"
                              onClick={() => removeTissueLayer(i)}
                              disabled={tissueLayers.length <= 1}
                            >
                              Remove
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs">Type</Label>
                              <select
                                className="w-full text-xs border rounded px-1 py-1 bg-white"
                                value={layer.type}
                                onChange={(e) =>
                                  updateTissueLayer(
                                    i,
                                    "type",
                                    e.target.value as TissueType
                                  )
                                }
                              >
                                {Object.keys(tissues).map((t) => (
                                  <option key={t} value={t}>
                                    {t}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <Label className="text-xs">Thickness (cm)</Label>
                              <Slider
                                min={0.1}
                                max={10}
                                step={0.1}
                                value={[layer.thickness]}
                                className="mt-1"
                                onValueChange={(val) =>
                                  updateTissueLayer(i, "thickness", val[0])
                                }
                              />
                              <p className="text-xs text-gray-500">
                                {layer.thickness.toFixed(1)} cm
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm mt-8">
                  <div>
                    <Label className="font-semibold">Wavelength</Label>
                    <p className="font-mono">{wavelengthMm} mm</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Axial Resolution</Label>
                    <p className="font-mono">{resolution} mm</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Sound Speed</Label>
                    <p className="font-mono">{weightedSpeed.toFixed(0)} m/s</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Round-trip Time</Label>
                    <p className="font-mono">{roundTrip} μs</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-center mt-8">
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={toggleSimulation}
                >
                  {isRunning ? "Pause" : "Start"} Simulation
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Simulation Section - Right Side */}
        <div className="h-full flex flex-col overflow-hidden">
          <Tabs
            defaultValue="simulation"
            className="flex-grow flex flex-col overflow-hidden"
          >
            <TabsList className="grid grid-cols-5">
              <TabsTrigger value="simulation">Simulation</TabsTrigger>
              <TabsTrigger value="reflection">Tissue Interfaces</TabsTrigger>
              <TabsTrigger value="tissues">Tissues</TabsTrigger>
              <TabsTrigger value="formulas">Formulas</TabsTrigger>
              <TabsTrigger value="info">Concepts</TabsTrigger>
            </TabsList>

            <TabsContent value="simulation" className="flex-grow overflow-auto">
              <Card className="h-full">
                <CardContent className="h-full relative overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100 rounded-md p-4">
                  {/* Tissue layers */}
                  <div className="absolute top-0 left-0 w-full h-full flex flex-col">
                    {tissueLayers.map((layer, i) => {
                      // Calculate top position as percentage based on previous layers
                      const prevLayersHeight = tissueLayers
                        .slice(0, i)
                        .reduce((sum, l) => sum + l.thickness, 0);
                      const topPercent =
                        (prevLayersHeight / displayDepth) * 100;
                      const heightPercent =
                        (layer.thickness / displayDepth) * 100;

                      return (
                        <div
                          key={i}
                          className="absolute w-full left-0"
                          style={{
                            top: `${topPercent}%`,
                            height: `${heightPercent}%`,
                            maxHeight: "100%",
                            background: `${tissues[layer.type].color}60`,
                            borderBottom:
                              i < tissueLayers.length - 1
                                ? "1px dashed #666"
                                : "none",
                          }}
                        >
                          <div className="absolute left-2 top-1 text-xs font-semibold bg-white/70 px-1 rounded flex items-center">
                            <span>{layer.type}</span>
                            <span className="ml-2 text-gray-500 text-[10px]">
                              {prevLayersHeight.toFixed(1)} cm
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Depth markers */}
                  <div className="absolute right-2 h-full top-0 flex flex-col justify-between py-4 text-xs">
                    <div className="flex items-center">
                      <span className="mr-1 bg-white/70 px-1 rounded">
                        0 cm
                      </span>
                      <div className="w-2 h-1 bg-black"></div>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-1 bg-white/70 px-1 rounded">
                        {(displayDepth / 2).toFixed(1)} cm
                      </span>
                      <div className="w-2 h-1 bg-black"></div>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-1 bg-white/70 px-1 rounded">
                        {displayDepth.toFixed(1)} cm
                      </span>
                      <div className="w-2 h-1 bg-black"></div>
                    </div>
                  </div>

                  {/* Ultrasound probe indicator */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-8 bg-blue-500 rounded-b-xl flex items-center justify-center text-white text-xs font-bold">
                    {frequency} MHz
                  </div>

                  {/* Interface reflections */}
                  {isRunning &&
                    tissueLayers.slice(0, -1).map((layer, i) => {
                      const nextLayer = tissueLayers[i + 1];
                      const reflectionStrength = calculateReflection(
                        layer.type,
                        nextLayer.type
                      );
                      const prevLayersHeight = tissueLayers
                        .slice(0, i + 1)
                        .reduce((sum, l) => sum + l.thickness, 0);
                      const topPercent =
                        (prevLayersHeight / displayDepth) * 100;

                      return parseFloat(reflectionStrength) > 1 ? (
                        <div
                          key={i}
                          className="absolute left-0 w-full h-px"
                          style={{
                            top: `${topPercent}%`,
                            background: `rgba(255, 255, 255, ${Math.min(
                              0.8,
                              parseFloat(reflectionStrength) / 30
                            )})`,
                            boxShadow: `0 0 ${
                              parseFloat(reflectionStrength) / 5
                            }px ${
                              parseFloat(reflectionStrength) / 10
                            }px rgba(255, 255, 255, 0.8)`,
                            animation: "reflection-pulse 2s infinite",
                          }}
                        >
                          <div className="absolute right-14 top-0 transform -translate-y-1/2 text-xs bg-white/70 px-1 rounded">
                            {reflectionStrength}% refl.
                          </div>
                        </div>
                      ) : null;
                    })}

                  {/* Wave animation */}
                  {isRunning &&
                    [...Array(waveCount)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute left-0 w-full h-full overflow-hidden"
                        style={{
                          animation: `wave-${i} ${
                            7 / frequency
                          }s infinite ease-in-out`,
                          animationDelay: `${
                            (i * (5 / frequency)) / waveCount
                          }s`,
                          opacity: 0,
                        }}
                      >
                        <div
                          className="w-full h-2 absolute"
                          style={{
                            top: "50px",
                            background: `radial-gradient(ellipse at center, rgba(59, 130, 246, ${
                              0.8 * amplitude
                            }) 0%, transparent 70%)`,
                            boxShadow: `0 0 ${2 * amplitude}px ${
                              3 * amplitude
                            }px rgba(59, 130, 246, ${0.5 * amplitude})`,
                          }}
                        />
                      </div>
                    ))}

                  <style>
                    {`
                @keyframes wave-0 {
                  0% {
                          transform: translateY(0%);
                    opacity: ${amplitude};
                  }
                  50% {
                          transform: translateY(${100}%);
                    opacity: ${amplitude * 0.5};
                  }
                  100% {
                          transform: translateY(0%);
                    opacity: 0;
                  }
                }
                @keyframes wave-1 {
                  0% {
                          transform: translateY(0%);
                    opacity: ${amplitude};
                  }
                  50% {
                          transform: translateY(${95}%);
                    opacity: ${amplitude * 0.4};
                  }
                  100% {
                          transform: translateY(0%);
                    opacity: 0;
                  }
                }
                @keyframes wave-2 {
                  0% {
                          transform: translateY(0%);
                    opacity: ${amplitude};
                  }
                  50% {
                          transform: translateY(${90}%);
                    opacity: ${amplitude * 0.3};
                  }
                  100% {
                          transform: translateY(0%);
                    opacity: 0;
                  }
                }
                @keyframes wave-3 {
                  0% {
                          transform: translateY(0%);
                    opacity: ${amplitude};
                  }
                  50% {
                          transform: translateY(${85}%);
                    opacity: ${amplitude * 0.2};
                  }
                  100% {
                          transform: translateY(0%);
                    opacity: 0;
                  }
                }
                @keyframes wave-4 {
                  0% {
                          transform: translateY(0%);
                    opacity: ${amplitude};
                  }
                  50% {
                          transform: translateY(${80}%);
                    opacity: ${amplitude * 0.1};
                  }
                  100% {
                          transform: translateY(0%);
                    opacity: 0;
                  }
                }
                      @keyframes reflection-pulse {
                        0% {
                          opacity: 0.7;
                        }
                        50% {
                          opacity: 1;
                        }
                        100% {
                          opacity: 0.7;
                        }
                      }
                    `}
                  </style>

                  <div className="absolute bottom-2 w-full flex justify-between px-4">
                    <div className="bg-white/80 px-3 py-1 rounded-lg text-xs">
                      Speed: {weightedSpeed.toFixed(0)} m/s
                    </div>
                    <div className="bg-white/80 px-3 py-1 rounded-lg text-xs">
                      Max Penetration: ~{displayDepth.toFixed(1)} cm
                    </div>
                    <div className="bg-white/80 px-3 py-1 rounded-lg text-xs">
                      Power: {power}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reflection" className="flex-grow overflow-auto">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">
                    Layer Interface Reflection
                  </h3>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="font-semibold">Interface</div>
                    <div className="font-semibold">Impedance Difference</div>
                    <div className="font-semibold">Reflection %</div>

                    {tissueLayers.slice(0, -1).map((layer, i) => {
                      const nextLayer = tissueLayers[i + 1];
                      return (
                        <React.Fragment key={i}>
                          <div>
                            {layer.type} → {nextLayer.type}
                          </div>
                          <div>
                            {Math.abs(
                              tissues[layer.type].speed *
                                tissues[layer.type].density -
                                tissues[nextLayer.type].speed *
                                  tissues[nextLayer.type].density
                            ).toLocaleString()}{" "}
                            kg/(m²·s)
                          </div>
                          <div>
                            {calculateReflection(layer.type, nextLayer.type)}%
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tissues" className="flex-grow overflow-auto">
              <Card className="h-full">
                <CardContent className="p-6 h-full overflow-y-auto">
                  <h2 className="text-lg font-semibold mb-3">
                    Tissue Properties
                  </h2>
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-100 text-left">
                            <th className="p-2 font-semibold">Tissue</th>
                            <th className="p-2 font-semibold">Speed (m/s)</th>
                            <th className="p-2 font-semibold">
                              Attenuation (dB/cm/MHz)
                            </th>
                            <th className="p-2 font-semibold">
                              Density (kg/m³)
                            </th>
                            <th className="p-2 font-semibold">
                              Impedance (kg/m²·s)
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(tissues).map(([type, props], i) => (
                            <tr
                              key={type}
                              className={i % 2 === 0 ? "bg-gray-50" : ""}
                            >
                              <td className="p-2 border-t flex items-center">
                                <div
                                  className="w-3 h-3 mr-2 rounded-sm"
                                  style={{ backgroundColor: props.color }}
                                ></div>
                                {type}
                              </td>
                              <td className="p-2 border-t">{props.speed}</td>
                              <td className="p-2 border-t">
                                {props.attenuation}
                              </td>
                              <td className="p-2 border-t">{props.density}</td>
                              <td className="p-2 border-t">
                                {(props.speed * props.density).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                        <h3 className="font-semibold text-sm">Sound Speed</h3>
                        <p className="mt-1 text-xs">
                          Sound travels at different speeds through different
                          tissues. This variation is primarily due to the
                          differences in tissue density and elasticity. Note how
                          bone has a much higher speed (4080 m/s) compared to
                          soft tissues (~1500 m/s).
                        </p>
                      </div>

                      <div className="bg-green-50 p-3 rounded-md border border-green-100">
                        <h3 className="font-semibold text-sm">
                          Acoustic Impedance
                        </h3>
                        <p className="mt-1 text-xs">
                          Acoustic impedance (Z) is the product of tissue
                          density and sound speed. The difference in impedance
                          at tissue interfaces determines how much ultrasound is
                          reflected versus transmitted. Large impedance
                          differences (like soft tissue/bone interfaces) cause
                          strong reflections.
                        </p>
                      </div>

                      <div className="bg-yellow-50 p-3 rounded-md border border-yellow-100">
                        <h3 className="font-semibold text-sm">Attenuation</h3>
                        <p className="mt-1 text-xs">
                          Attenuation measures how quickly ultrasound energy is
                          lost in tissue. Higher values mean the tissue absorbs
                          more ultrasound energy. Note that bone has the highest
                          attenuation (10.0), which is why ultrasound typically
                          cannot image beyond bone structures.
                        </p>
                      </div>

                      <div className="bg-purple-50 p-3 rounded-md border border-purple-100">
                        <h3 className="font-semibold text-sm">
                          Clinical Relevance
                        </h3>
                        <p className="mt-1 text-xs">
                          Different transducer frequencies are chosen based on
                          the target tissue. Higher frequencies (7-15 MHz) are
                          used for superficial structures like the thyroid or
                          breast. Lower frequencies (2-5 MHz) are used for
                          deeper structures like abdominal organs. Blood has the
                          lowest attenuation, making it ideal for Doppler
                          imaging of blood flow.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="formulas" className="flex-grow overflow-auto">
              <Card className="h-full">
                <CardContent className="p-6 h-full overflow-y-auto">
                  <h2 className="text-lg font-semibold mb-3">
                    Ultrasound Formulas
                  </h2>
                  <div className="text-sm space-y-5">
                    <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                      <h3 className="font-semibold">Penetration Depth</h3>
                      <div className="mt-2 font-mono bg-white p-2 rounded border border-gray-200">
                        Penetration Depth = (100 / Attenuation) × (1 /
                        Frequency) × (Power / 100)
                      </div>
                      <p className="mt-2 text-xs">
                        Where:
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          <li>
                            <strong>Attenuation</strong>: Weighted average of
                            tissue attenuation coefficients (dB/cm/MHz)
                          </li>
                          <li>
                            <strong>Frequency</strong>: Ultrasound frequency in
                            MHz
                          </li>
                          <li>
                            <strong>Power</strong>: Percentage of maximum power
                            (0-100%)
                          </li>
                        </ul>
                      </p>
                      <p className="mt-2 text-xs text-gray-600">
                        This formula reflects how higher frequencies and higher
                        attenuation reduce penetration depth, while higher power
                        settings increase it.
                      </p>
                    </div>

                    <div className="bg-green-50 p-3 rounded-md border border-green-100">
                      <h3 className="font-semibold">Acoustic Impedance</h3>
                      <div className="mt-2 font-mono bg-white p-2 rounded border border-gray-200">
                        Z = ρ × v
                      </div>
                      <p className="mt-2 text-xs">
                        Where:
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          <li>
                            <strong>Z</strong>: Acoustic impedance (kg/m²·s)
                          </li>
                          <li>
                            <strong>ρ</strong>: Tissue density (kg/m³)
                          </li>
                          <li>
                            <strong>v</strong>: Speed of sound in the tissue
                            (m/s)
                          </li>
                        </ul>
                      </p>
                    </div>

                    <div className="bg-purple-50 p-3 rounded-md border border-purple-100">
                      <h3 className="font-semibold">Reflection Coefficient</h3>
                      <div className="mt-2 font-mono bg-white p-2 rounded border border-gray-200">
                        R = ((Z₂ - Z₁) / (Z₂ + Z₁))²
                      </div>
                      <p className="mt-2 text-xs">
                        Where:
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          <li>
                            <strong>R</strong>: Reflection coefficient
                            (percentage when multiplied by 100)
                          </li>
                          <li>
                            <strong>Z₁</strong>: Acoustic impedance of first
                            tissue
                          </li>
                          <li>
                            <strong>Z₂</strong>: Acoustic impedance of second
                            tissue
                          </li>
                        </ul>
                      </p>
                      <p className="mt-2 text-xs text-gray-600">
                        The greater the difference in acoustic impedance between
                        tissues, the stronger the reflection at the boundary.
                      </p>
                    </div>

                    <div className="bg-amber-50 p-3 rounded-md border border-amber-100">
                      <h3 className="font-semibold">Wavelength</h3>
                      <div className="mt-2 font-mono bg-white p-2 rounded border border-gray-200">
                        λ = v / f
                      </div>
                      <p className="mt-2 text-xs">
                        Where:
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          <li>
                            <strong>λ</strong>: Wavelength (m)
                          </li>
                          <li>
                            <strong>v</strong>: Speed of sound in the tissue
                            (m/s)
                          </li>
                          <li>
                            <strong>f</strong>: Frequency (Hz)
                          </li>
                        </ul>
                      </p>
                    </div>

                    <div className="bg-red-50 p-3 rounded-md border border-red-100">
                      <h3 className="font-semibold">Axial Resolution</h3>
                      <div className="mt-2 font-mono bg-white p-2 rounded border border-gray-200">
                        Axial Resolution = λ / 2
                      </div>
                      <p className="mt-2 text-xs">
                        Where:
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          <li>
                            <strong>λ</strong>: Wavelength (mm)
                          </li>
                        </ul>
                      </p>
                      <p className="mt-2 text-xs text-gray-600">
                        Higher frequencies provide better resolution (smaller
                        values) because they have shorter wavelengths.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="info" className="flex-grow overflow-auto">
              <Card className="h-full">
                <CardContent className="p-6 h-full overflow-y-auto">
                  <h2 className="text-lg font-semibold mb-3">
                    Ultrasound Physics
                  </h2>
                  <div className="text-sm space-y-3">
                    <p>
                      <strong>Frequency:</strong> Higher frequencies provide
                      better resolution but less penetration depth. The
                      frequency of an ultrasound wave determines how many cycles
                      occur per second, measured in Hertz (Hz) or more commonly
                      in megahertz (MHz) for medical applications.
                    </p>
                    <p>
                      <strong>Wavelength:</strong> Calculated as Speed of Sound
                      ÷ Frequency. Smaller wavelengths allow detection of
                      smaller objects. The wavelength is the distance between
                      consecutive peaks or troughs in a wave.
                    </p>
                    <p>
                      <strong>Resolution:</strong> The smallest detail that can
                      be distinguished, approximately half the wavelength.
                      Higher frequencies provide better resolution because they
                      have shorter wavelengths.
                    </p>
                    <p>
                      <strong>Acoustic Impedance:</strong> Different tissues
                      have different sound transmission properties, causing
                      reflections at interfaces. Acoustic impedance is a product
                      of the tissue density and the speed of sound through the
                      tissue (Z = ρ × v). The greater the impedance difference
                      between two tissues, the stronger the reflection at their
                      boundary.
                    </p>
                    <p>
                      <strong>Attenuation:</strong> Ultrasound waves lose energy
                      as they travel through tissue. Higher frequencies
                      attenuate more quickly, limiting their penetration depth.
                      Attenuation occurs due to absorption, reflection, and
                      scattering of the sound waves.
                    </p>
                    <p>
                      <strong>HIFU (High-Intensity Focused Ultrasound):</strong>{" "}
                      A therapeutic application of ultrasound that uses focused
                      beams to generate heat at a precise focal point within
                      tissue. This allows for non-invasive ablation of targeted
                      tissue while sparing surrounding areas. The acoustic
                      energy concentrates at the focal point, raising the
                      temperature to 65-85°C, causing coagulative necrosis.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
