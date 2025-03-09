import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const PlanetScene = () => {
  const mountRef = useRef(null); // Referencia al contenedor del canvas

  useEffect(() => {
    // Escena y cámara
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      20,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    // Renderizador
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    const mount = mountRef.current;
    mount.appendChild(renderer.domElement); // Agregar el canvas al contenedor

    // Cargar texturas
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load(
      "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg"
    );
    const earthBumpMap = textureLoader.load(
      "https://threejs.org/examples/textures/planets/earth_bump_2048.jpg"
    );
    const earthSpecMap = textureLoader.load(
      "https://threejs.org/examples/textures/planets/earth_specular_2048.jpg"
    );
    const moonTexture = textureLoader.load(
      "https://threejs.org/examples/textures/planets/moon_1024.jpg"
    );

    // Crear la esfera (Tierra)
    const earthGeometry = new THREE.SphereGeometry(0.35, 64, 64);
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: earthTexture,
      bumpMap: earthBumpMap,
      bumpScale: 0.05,
      specularMap: earthSpecMap,
      shininess: 50,
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // Crear la esfera (Luna)
    const moonGeometry = new THREE.SphereGeometry(0.05, 32, 32);
    const moonMaterial = new THREE.MeshStandardMaterial({ map: moonTexture });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    scene.add(moon);

    // Iluminación (Sol)
    const light = new THREE.DirectionalLight(0xffffff, 6.3);
    light.position.set(5, 2, 5);
    scene.add(light);

    // Posicionar la cámara
    camera.position.z = 2.5;

    let angle = 0; // Ángulo de órbita de la Luna
    let rotationDirection = 1; // Dirección de rotación de la Tierra

    // Crear estrellas más lejanas
    function createStars() {
      const starGeometry = new THREE.BufferGeometry();
      const starCount = 2000;
      const positions = new Float32Array(starCount * 3);
      const distance = 5; // Radio de la esfera de estrellas

      for (let i = 0; i < starCount; i++) {
        const theta = Math.random() * Math.PI * 2; // Ángulo horizontal
        const phi = Math.acos(Math.random() * 2 - 1); // Ángulo vertical

        const x = distance * Math.sin(phi) * Math.cos(theta);
        const y = distance * Math.sin(phi) * Math.sin(theta);
        const z = distance * Math.cos(phi);

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
      }

      starGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );
      const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.005,
      }); // Estrellas pequeñas y realistas
      const stars = new THREE.Points(starGeometry, starMaterial);
      scene.add(stars);
    }

    createStars(); // Agregar estrellas realistas a la escena

    // Variables para interacción
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDragging = false;
    let previousMouseX = 0;
    let previousMouseY = 0;

    // Eventos del mouse
    const onMouseMove = (event) => {
      if (isDragging) {
        // Calcular movimiento
        const deltaX = event.clientX - previousMouseX;
        const deltaY = event.clientY - previousMouseY;

        // Rotar la Tierra
        const rotationSpeed = 0.006;
        earth.rotation.y += deltaX * rotationSpeed;
        earth.rotation.x += deltaY * rotationSpeed;

        // Actualizar posición previa
        previousMouseX = event.clientX;
        previousMouseY = event.clientY;
      } else {
        // Detectar hover
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(earth);

        document.body.style.cursor = intersects.length ? "pointer" : "default";
      }
    };

    const onMouseDown = (event) => {
      // Verificar click en la Tierra
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(earth);

      if (intersects.length) {
        isDragging = true;
        previousMouseX = event.clientX;
        previousMouseY = event.clientY;
        document.body.style.cursor = "grabbing";
      }
    };

    const onMouseUp = () => {
      isDragging = false;
      document.body.style.cursor = "default";
    };

    const onMouseClick = (event) => {
      // Verificar click en la Tierra
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(earth);

      if (intersects.length) {
        // Cambiar la dirección de rotación de la Tierra
        rotationDirection *= -1;
      }
    };

    const onWheel = (event) => {
      // Verificar si el mouse está sobre la Tierra
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(earth);

      if (intersects.length) {
        // Rotar la Tierra en el eje X
        const rotationSpeed = 0.001;
        earth.rotation.x += event.deltaY * rotationSpeed;
      }
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("click", onMouseClick);
    document.addEventListener("wheel", onWheel);
    document.addEventListener("mouseleave", onMouseUp);

    // Ajustar tamaño del renderizador y la cámara al cambiar el tamaño de la ventana
    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", onWindowResize);

    // Animación
    const animate = () => {
      earth.rotation.y += 0.0004 * rotationDirection; // Rotación de la Tierra

      // Movimiento orbital de la Luna
      angle += 0.005; // Velocidad de la órbita
      const moonDistance = 1; // Distancia de la Luna a la Tierra
      moon.position.x = earth.position.x + Math.cos(angle) * moonDistance;
      moon.position.z = earth.position.z + Math.sin(angle) * moonDistance;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // Limpieza al desmontar el componente
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("click", onMouseClick);
      document.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", onWindowResize);
      if (mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "100vh" }} />;
};

export default PlanetScene;
