import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

interface SpaceSceneProps {
  isWarping: boolean;
}

export function SpaceScene({ isWarping }: SpaceSceneProps) {
  const starsContainerRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (starsContainerRef.current) {
      // Very slight roll instead of spinning
      starsContainerRef.current.rotation.z -= delta * 0.05;
      
      // Speed adjustments: smoother and slower than before for comfort
      const targetSpeed = isWarping ? 150 : 15;
      starsContainerRef.current.position.z += delta * targetSpeed;
      
      // Seamless infinite loop!
      // When the group moves forward 200 units, we snap it back by 200.
      if (starsContainerRef.current.position.z >= 200) {
        starsContainerRef.current.position.z -= 200;
      }
    }
    
    // Smooth transition between static and warping FOV
    const camera = state.camera as THREE.PerspectiveCamera;
    const targetFov = isWarping ? 110 : 75; // reduced max FOV to avoid distortion
    camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 0.05);
    camera.updateProjectionMatrix();

    // Fix camera position so it doesn't jerk around
    camera.position.lerp(new THREE.Vector3(0, 0, 10), 0.1);
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      {/* Primary scheme colors for mykite theme */}
      <pointLight position={[10, 10, 10]} intensity={1} color="#0ea5e9" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#38bdf8" />
      
      <group ref={starsContainerRef}>
        {/* We use TWO identical star clusters to create a seamless infinite tunnel */}
        <group position={[0, 0, 0]}>
          <Stars radius={50} depth={50} count={2500} factor={4} saturation={0.5} fade speed={isWarping ? 3 : 1} />
        </group>
        <group position={[0, 0, -200]}>
          <Stars radius={50} depth={50} count={2500} factor={4} saturation={0.5} fade speed={isWarping ? 3 : 1} />
        </group>
      </group>
    </>
  );
}
