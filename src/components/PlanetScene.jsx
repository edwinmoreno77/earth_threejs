import React from "react";
import usePlanetScene from "../hooks/usePlanetScene";

const PlanetScene = () => {
  const mountRef = usePlanetScene();

  return <div ref={mountRef} style={{ width: "100%", height: "100vh" }} />;
};

export default PlanetScene;
