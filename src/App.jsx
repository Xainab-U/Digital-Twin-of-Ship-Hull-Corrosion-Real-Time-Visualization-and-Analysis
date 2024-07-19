import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Stats, OrbitControls } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Raycaster, Vector2, AnimationMixer, Color } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';
import Hotspot from './components/Hotspot.jsx';
import './App.css';
import * as THREE from 'three';

const loadTexture = (url) => {
  return new Promise((resolve, reject) => {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      url,
      (texture) => {
        resolve(texture);
      },
      undefined,
      (err) => {
        console.error('Error loading texture:', err);
        reject(err);
      }
    );
  });
};

const loadTextures = async (imagePaths) => {
  try {
    const promises = imagePaths.map((path) => loadTexture(path));
    const textures = await Promise.all(promises);
    return textures.map((texture, index) => ({
      timestamp: new Date(Date.now() - index * 10 * 1000),
      texture,
      path: imagePaths[index]
    }));
  } catch (error) {
    console.error('Error loading textures:', error);
    return [];
  }
};

const imagePaths = [
  '/147_Jan_img1.jpg',
  '/288_Feb_img2.png',
  '/321_Mar_img3.png',
  '/456_Apr_img4.png',
  '/591_May_img5.png',
  '/694_June_img6.png',
  '/738_July_img7.png',
  '/834_Aug_img8.png',
  '/915_Sept_img9.png',
  '/999_Oct_img10.png'
];


export default function App() {
  const [model, setModel] = useState(null);
  const [animations, setAnimations] = useState(null);
  const [selectedMesh, setSelectedMesh] = useState(null);
  const [showMeshProperties, setShowMeshProperties] = useState(false);
  const [showMeshHierarchy, setShowMeshHierarchy] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null); // Changed initial state to null
  const [lightProperties, setLightProperties] = useState({
    type: 'ambientLight',
    color: '#ffffff',
    intensity: 5,
    position: { x: 10, y: 10, z: 10 },
  });
  const [sceneProperties, setSceneProperties] = useState({
    wireframe: false,
    backgroundColor: '#ffffff',
    showGrid: true,
    gridSize: 50,
    gridDivisions: 50,
  });
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(false);
  const toggleDescriptionVisibility = () => {
    setIsDescriptionVisible(!isDescriptionVisible);
  };
  const handleWireframeChange = (event) => {
    if (selectedMesh) {
      selectedMesh.material.wireframe = event.target.checked;
      setSelectedMesh({ ...selectedMesh });
    }
  };
  const [textures, setTextures] = useState([]);
  const [currentTextureIndex, setCurrentTextureIndex] = useState(0);
  const [isCorrosionVisible, setIsCorrosionVisible] = useState(false);
  
  useEffect(() => {
    const loadInitialTextures = async () => {
      const loadedTextures = await loadTextures(imagePaths);
      setTextures(loadedTextures);
    };
  
    loadInitialTextures();
  }, []);
  
  useEffect(() => {
    let interval;
    if (isCorrosionVisible && textures.length > 0) {
      interval = setInterval(() => {
        setCurrentTextureIndex(prevIndex => {
          const newIndex = (prevIndex + 1) % textures.length;
          return newIndex;
        });
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isCorrosionVisible, textures]);
  
  useEffect(() => {
    if (textures.length > 0) {
      console.log(`Image texture changed at ${new Date().toISOString()} to: ${textures[currentTextureIndex]?.path}`);
    }
  }, [currentTextureIndex, textures]);
  
  const loadModel = (url) => {
    const loader = new GLTFLoader();
    loader.load(url, (gltf) => {
      gltf.scene.traverse((child) => {
      });
      setModel(gltf.scene);
      setAnimations(gltf.animations);
    });
  };
  
  useEffect(() => {
    if (model) {
      model.traverse((child) => {
        if (child.isMesh && child.name === 'Hull_3') {
          child.material.map = textures[currentTextureIndex]?.texture || null;
          child.material.needsUpdate = true;
        }
      });
    }
  }, [currentTextureIndex, model, textures]);
  
  useEffect(() => {
    loadModel('/shipp.glb');
  }, []);

  const toggleMeshProperties = () => {
    setShowMeshProperties(!showMeshProperties);
  };

  const toggleMeshHierarchy = () => {
    setShowMeshHierarchy(!showMeshHierarchy);
  };

  const printMeshHierarchy = (object) => {
    if (!object) return [];
    let hierarchy = [];
    const traverse = (obj, path = '') => {
      const currentPath = path ? `${path} > ${obj.name || 'Unnamed'}` : obj.name || 'Unnamed';
      hierarchy.push(currentPath);
      if (obj.children) {
        obj.children.forEach((child) => traverse(child, currentPath));
      }
    };
    traverse(object);
    return hierarchy;
  };

  return (
    <div className="app-container">
      <div className="controls">

      <div className="title-description">
      <h3 onClick={toggleDescriptionVisibility} style={{ cursor: 'pointer' }}>Digital Twin of Ship Hull Corrosion</h3>
      {isDescriptionVisible && <p>Experience the future of maritime maintenance with our digital twin technology, showcasing real-time progressive corrosion on a ship hull. The project combines advanced 3D modeling to visualize and monitor corrosion, enabling proactive maintenance and extending vessel lifespan.</p>}
    </div>
        <h3>Controls</h3>
        <div className="icon-container">
  <div
    className={`icon ${showMeshProperties ? 'active' : ''}`}
    onClick={toggleMeshProperties}
    title="Mesh Properties">
    <img src="/MeshProperties.png" alt="Mesh Properties" />
  </div>
  <div
    className={`icon ${showMeshHierarchy ? 'active' : ''}`}
    onClick={toggleMeshHierarchy}
    title="Mesh Hierarchy">
    <img src="/MeshHeirarchy.png" alt="Mesh Hierarchy" />
  </div>
  <div
    className={`icon ${selectedProperty === 'scene' ? 'active' : ''}`}
    onClick={() => setSelectedProperty(selectedProperty === 'scene' ? null : 'scene')}
    title="Scene and light Properties">
    <img src="/Camera.png" alt="Scene Properties" />
  </div>
</div>
        {showMeshProperties && selectedMesh && (
          <div id="mesh-properties">
            <h4>Mesh Properties</h4>
            <h4>Selected Mesh: {selectedMesh.name || 'Unnamed'}</h4>
            <div>
              <label>
                Color:
                <input
                  type="color"
                  value={selectedMesh.material.color.getStyle()}
                  onChange={(e) => selectedMesh.material.color.set(e.target.value)}
                />
              </label>
            </div>
            <div>
              <label>
                Wireframe:
                <input
                  type="checkbox"
                  checked={selectedMesh.material.wireframe}
                  onChange={handleWireframeChange}
                />
              </label>
            </div>
            <div>
              <p>Vertices: {selectedMesh.geometry.attributes.position.count}</p>
              <p>Edges: {selectedMesh.geometry.attributes.position.count}</p>
              <p>Triangles: {selectedMesh.geometry.index ? selectedMesh.geometry.index.count / 3 : selectedMesh.geometry.attributes.position.count / 3}</p>
            </div>
          </div>
        )}
        <div className="controls">      
  <button className="fancy-button" onClick={() => setIsCorrosionVisible(!isCorrosionVisible)}>
    {isCorrosionVisible ? 'Hide Progressive Corrosion' : 'Show Progressive Corrosion'}
  </button>
</div>
        {showMeshHierarchy && model && (
          <div id="mesh-hierarchy">
            <h4>Mesh Hierarchy</h4>
            <ul>
              {printMeshHierarchy(model).map((path, index) => (
                <li key={index}>{path}</li>
              ))}
            </ul>
          </div>
        )}

        {selectedProperty === 'scene' && (
          <>
          <h4>Scene Properties</h4>
            <label>
              Wireframe:
              <input
                type="checkbox"
                checked={sceneProperties.wireframe}
                onChange={(e) => setSceneProperties({ ...sceneProperties, wireframe: e.target.checked })}
              />
            </label>
            <label>
              Show Grid:
              <input
                type="checkbox"
                checked={sceneProperties.showGrid}
                onChange={(e) => setSceneProperties({ ...sceneProperties, showGrid: e.target.checked })}
              />
            </label>
            <h4>Light Properties</h4>
            <label>
              Light Type:
              <select
                value={lightProperties.type}
                onChange={(e) => setLightProperties({ ...lightProperties, type: e.target.value })}
              >
                <option value="ambientLight">Ambient Light</option>
                <option value="directionalLight">Directional Light</option>
                <option value="pointLight">Point Light</option>
              </select>
            </label>
            <label>
              Intensity:
              <input
                type="range"
                min="0"
                max="10"
                value={lightProperties.intensity}
                onChange={(e) => setLightProperties({ ...lightProperties, intensity: Number(e.target.value) })}
              />
            </label>
          </>
        )}
      </div>

      <div className="canvas-container">
        <Canvas camera={{ position: [-8, 5, 8] }} style={{ background: sceneProperties.backgroundColor }}>
          <Scene
            model={model}
            animations={animations}
            lightProperties={lightProperties}
            sceneProperties={sceneProperties}
            setSelectedMesh={setSelectedMesh}
          />
          <OrbitControls autoRotate={sceneProperties.autoRotate} />
        </Canvas>
      </div>
    </div>
  );
}

function HoverHighlight({ setSelectedObject, lightType, setLightPosition, outlinePass }) {
  const { gl, scene, camera } = useThree();
  const raycaster = useMemo(() => new Raycaster(), []);
  const mouse = useRef(new Vector2());
  const canvasRef = useRef(gl.domElement);

  const onMouseMove = useCallback(
    (event) => {
      const rect = canvasRef.current.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      if (lightType === 'directionalLight') {
        setLightPosition({
          x: (event.clientX / window.innerWidth) * 2 - 1,
          y: -(event.clientY / window.innerHeight) * 2 + 1,
          z: 1,
        });
      }
    },
    [lightType, setLightPosition]
  );

  const onClick = useCallback(() => {
    raycaster.setFromCamera(mouse.current, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      const object = intersects[0].object;
      if (object.isMesh) {
        setSelectedObject(object);
        outlinePass.selectedObjects = [object];
        console.log('Clicked Mesh:', object.name);
      }
    }
  }, [setSelectedObject, outlinePass]);

  useEffect(() => {
    canvasRef.current.addEventListener('mousemove', onMouseMove);
    canvasRef.current.addEventListener('click', onClick);
    return () => {
      canvasRef.current.removeEventListener('mousemove', onMouseMove);
      canvasRef.current.removeEventListener('click', onClick);
    };
  }, [onMouseMove, onClick]);

  return null;
}

function Scene({ model, animations, lightProperties, sceneProperties, setSelectedMesh }) {
  const { gl, scene, camera } = useThree();
  const mixer = useMemo(() => (animations && animations.length > 0 ? new AnimationMixer(model) : null), [model, animations]);
  const [outlinePass] = useState(() => new OutlinePass(new Vector2(window.innerWidth, window.innerHeight), scene, camera));
  const hotspots = [
    { position: [-4.8, -1, 0], text: 'Keel' },
    { position: [-4.9, 0.5, 5], text: 'Waterline' },
    { position: [-4, -2, 17], text: 'Propeller' },
    { position: [-1.5, -1, -14.5], text: 'Bow Thruster' },
    { position: [-4.5, -1, 12], text: 'Engine' },
  ];

  useEffect(() => {
    const composer = new EffectComposer(gl);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(outlinePass);
    gl.setAnimationLoop(() => {
      composer.render();
    });
    return () => {
      gl.setAnimationLoop(null);
    };
  }, [gl, scene, camera, outlinePass]);

  useFrame((delta) => {
    if (mixer) mixer.update(delta);
  });

  useEffect(() => {
    if (model) scene.add(model);
    return () => {
      if (model) scene.remove(model);
    };
  }, [model, scene]);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material.wireframe = sceneProperties.wireframe;
      }
    });
  }, [scene, sceneProperties.wireframe]);

  return (
    <>
      {lightProperties.type === 'ambientLight' && (
        <ambientLight color={lightProperties.color} intensity={lightProperties.intensity} />
      )}
      {lightProperties.type === 'directionalLight' && (
        <directionalLight
         intensity={lightProperties.intensity}
          position={[lightProperties.position.x, lightProperties.position.y, lightProperties.position.z]}
        />
      )}
      {lightProperties.type === 'pointLight' && (
        <pointLight/>
      )}
      {sceneProperties.showGrid && <gridHelper args={[sceneProperties.gridSize, sceneProperties.gridDivisions]} />}
      <HoverHighlight
        setSelectedObject={setSelectedMesh}
        lightType={lightProperties.type}
        setLightPosition={(position) =>
          setLightProperties((prev) => ({ ...prev, position }))
        }
        outlinePass={outlinePass}
      />
      {hotspots.map((hotspot, index) => (
        <Hotspot
          key={index}
          position={hotspot.position}
          text={hotspot.text}
          onClick={() => handleHotspotClick(index)}
        />
      ))}
    </>
  );
}
