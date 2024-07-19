import React, { useEffect, useState, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import { useSpring } from '@react-spring/three';
import * as THREE from 'three';
import '/src/App.css';

function Hotspot({ position, text, onCameraFocus }) {
  const [isInfoVisible, setIsInfoVisible] = useState(false);
  const { camera } = useThree();
  const [targetPosition, setTargetPosition] = useState(null);
  const [resistance, setResistance] = useState([]);
  const [corrosion, setCorrosion] = useState([]);
  const [description, setDescription] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  const descriptions = {
    "Bow Thruster": "Corrosion due to constant exposure and electrochemical reactions with metals.",
    "Waterline": "Susceptible to corrosion from constant wet-dry cycles and marine growth.",
    "Engine": "Exposed to corrosive gases and high temperatures, accelerating metal deterioration.",
    "Propeller": "Vulnerable to galvanic corrosion from differing metals in seawater.",
    "Keel": "Corrosion occurs due to prolonged seawater exposure and mechanical stress."
  };

  const handleClick = () => {
    const newTargetPosition = new THREE.Vector3(...position);
    setTargetPosition(newTargetPosition);
    setIsInfoVisible(!isInfoVisible); // Toggle the visibility of the info
    if (onCameraFocus) {
      onCameraFocus(position);
    }
    setDescription(descriptions[text] || '');
  };

  const fetchCSVData = useCallback(() => {
    return new Promise((resolve, reject) => {
      fetch('http://localhost:5001/api/data')
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => resolve(data))
        .catch(error => reject(error));
    });
  }, []);

  useEffect(() => {
    if (isInfoVisible) {
      fetchCSVData()
        .then((data) => {
          const hotspotData = data.find((item) => item.text === text);
          if (hotspotData) {
            setResistance([
              hotspotData.resistance1,
              hotspotData.resistance2,
              hotspotData.resistance3,
              hotspotData.resistance4,
              hotspotData.resistance5,
              hotspotData.resistance6,
              hotspotData.resistance7,
              hotspotData.resistance8,
              hotspotData.resistance9,
              hotspotData.resistance10
            ]);
            setCorrosion([
              hotspotData.corrosion1,
              hotspotData.corrosion2,
              hotspotData.corrosion3,
              hotspotData.corrosion4,
              hotspotData.corrosion5,
              hotspotData.corrosion6,
              hotspotData.corrosion7,
              hotspotData.corrosion8,
              hotspotData.corrosion9,
              hotspotData.corrosion10
            ]);
          } else {
            setResistance(['N/A']);
            setCorrosion(['N/A']);
          }
        })
        .catch((error) => {
          console.error('Error fetching CSV data:', error);
          setResistance(['Error']);
          setCorrosion(['Error']);
        });
    }
  }, [isInfoVisible, text, fetchCSVData]);

  useEffect(() => {
    let intervalId;
    if (isInfoVisible) {
      intervalId = setInterval(() => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % resistance.length);
      }, 5000); // Update every 5 seconds
    }
    return () => clearInterval(intervalId);
  }, [isInfoVisible, resistance]);

  const [springProps, api] = useSpring(() => ({
    cameraPosition: camera.position,
    lookAtPosition: camera.position,
    config: { mass: 1, tension: 170, friction: 26 },
    onChange: ({ value }) => {
      camera.position.copy(value.cameraPosition);
      camera.lookAt(value.lookAtPosition);
    },
    onRest: () => {
      setTargetPosition(null); // Reset targetPosition to allow re-clicking the same hotspot
    }
  }));

  useEffect(() => {
    if (targetPosition) {
      api.start({
        cameraPosition: targetPosition.clone().add(new THREE.Vector3(-5, 3, 6)),
        lookAtPosition: targetPosition
      });
    }
  }, [targetPosition, api]);

  return (
    <group position={position} onClick={handleClick}>
      <mesh>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color="red" />
      </mesh>
      {isInfoVisible && (
        <Billboard>
          <group position={[-1.5, -1.25, 0]}>
            <mesh position={[1.5, 0, -0.01]} className="billboard">
              <planeGeometry args={[3, 3]} /> {/* Adjust height to fit text */}
              <meshBasicMaterial color="black" transparent opacity={0.6} />
            </mesh>
            <Text
              color="white"
              fontSize={0.3}
              fontWeight="bold"
              anchorX="left"
              anchorY="top"
              position={[0.1, 1.35, 0]}
              maxWidth={2.8} // Set max width for wrapping
              lineHeight={1.2} // Adjust line height for better readability
              className="text"
            >
              {text}
            </Text>
            <Text
              color="white"
              fontSize={0.25}
              fontWeight="normal"
              anchorX="left"
              anchorY="top"
              position={[0.1, 1, 0]}
              maxWidth={2.8} // Set max width for wrapping
              lineHeight={1.2} // Adjust line height for better readability
              className="text--description"
            >
              {description}
            </Text>
            {resistance.length > 0 && (
              <Text
                color="yellow"
                fontSize={0.25}
                anchorX="left"
                anchorY="top"
                position={[0.1, -0.7, 0]}
                className="text--highlight"
              >
                Resistance: {resistance[currentIndex]} kΩ
              </Text>
            )}
            {corrosion.length > 0 && (
              <Text
                color="yellow"
                fontSize={0.25}
                anchorX="left"
                anchorY="top"
                position={[0.1, -1, 0]}
                className="text--highlight"
              >
                Corrosion: {corrosion[currentIndex]}
              </Text>
            )}
          </group>
        </Billboard>
      )}
    </group>
  );
}

export default Hotspot;
