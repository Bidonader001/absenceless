import { Suspense, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Center, ContactShadows, Float, Html, PresentationControls, useGLTF, useProgress } from "@react-three/drei";
function TabletModel() {
  const gltf = useGLTF("/tablet.glb");
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);

  useMemo(() => {
    scene.traverse((node) => {
      if (!node.isMesh) return;
      node.castShadow = true;
      node.receiveShadow = true;
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      for (const material of materials) {
        if (!material) continue;
        if (material.transmission) {
          material.transmission = 0;
          material.needsUpdate = true;
        }
        if (material.name === "Screen_Emissive") {
          material.emissiveIntensity = 1.15;
          material.toneMapped = false;
        }
      }
    });
    return null;
  }, [scene]);

  return (
    <Center>
      <primitive object={scene} />
    </Center>
  );
}

const UPLIGHT_SCALE = 0.46;
const APERTURE = [0, 0.166, -0.02];

function Uplight() {
  const gltf = useGLTF("/uplight.glb");
  const scene = useMemo(() => {
    const clone = gltf.scene.clone(true);
    clone.traverse((node) => {
      if (!node.isMesh) return;
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      const next = materials.map((material) => {
        if (!material || material.name !== "Warm opal luminous diffuser") return material;
        const glowMaterial = material.clone();
        glowMaterial.map = null;
        glowMaterial.color.set("#ffffff");
        glowMaterial.emissive.set("#ffffff");
        glowMaterial.emissiveIntensity = 6;
        glowMaterial.toneMapped = false;
        return glowMaterial;
      });
      node.material = next.length === 1 ? next[0] : next;
    });
    return clone;
  }, [gltf.scene]);

  const y = -0.1 - APERTURE[1] * UPLIGHT_SCALE;

  return (
    <group position={[0, y, 0.012]} scale={UPLIGHT_SCALE}>
      <primitive object={scene} />
      <pointLight position={APERTURE} color="#ffffff" intensity={6} distance={0.9} decay={2} />
      <spotLight
        position={APERTURE}
        color="#ffffff"
        intensity={12}
        angle={0.55}
        penumbra={0.85}
        distance={0.7}
        decay={2}
      />
    </group>
  );
}

function HoverTurn({ enabled, children }) {
  const ref = useRef(null);
  useFrame((_, delta) => {
    if (!enabled || !ref.current) return;
    ref.current.rotation.y += delta * 0.45;
  });
  return <group ref={ref}>{children}</group>;
}

function ClearBackdrop() {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  useLayoutEffect(() => {
    scene.background = null;
    gl.setClearColor(0x000000, 0);
  }, [gl, scene]);
  useFrame(() => {
    gl.setClearColor(0x000000, 0);
  });
  return null;
}

function Loader({ label }) {
  const { active, progress } = useProgress();
  if (!active) return null;
  return (
    <Html center>
      <span className="stage-pending">
        {label} {Math.round(progress)}%
      </span>
    </Html>
  );
}

export default function TabletStage({ hint, loadingLabel, label }) {
  const reduce =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const narrow = typeof window !== "undefined" && window.matchMedia("(max-width: 800px)").matches;

  return (
    <div className="stage">
      <Canvas
        camera={{ position: [0, 0.01, narrow ? 0.82 : 0.68], fov: narrow ? 32 : 30 }}
        dpr={[1, 1.75]}
        gl={{ alpha: true, antialias: true, premultipliedAlpha: false }}
        onCreated={({ camera, gl, scene }) => {
          scene.background = null;
          gl.setClearColor(0x000000, 0);
          gl.domElement.style.background = "transparent";
          camera.lookAt(0, -0.05, 0);
        }}
        aria-label={label}
      >
        <ClearBackdrop />
        <ambientLight intensity={0.42} />
        <hemisphereLight args={["#f5f5f7", "#1d1d1f", 0.35]} />
        <directionalLight position={[0.55, 1.15, 1.5]} intensity={2.15} color="#ffffff" />
        <directionalLight position={[-0.9, 0.35, 0.7]} intensity={0.28} color="#f5f5f7" />
        <Suspense fallback={null}>
          <Loader label={loadingLabel} />
          <PresentationControls
            snap
            global
            rotation={narrow ? [0.1, 0, 0] : [0.12, -0.08, 0]}
            polar={[-0.22, 0.28]}
            azimuth={[-0.65, 0.65]}
          >
            <Float
              speed={reduce ? 0 : 0.8}
              rotationIntensity={0}
              floatIntensity={reduce ? 0 : 0.6}
              floatingRange={[-0.008, 0.008]}
            >
              <HoverTurn enabled={!reduce}>
                <TabletModel />
                <Uplight />
              </HoverTurn>
            </Float>
          </PresentationControls>
          <ContactShadows
            position={[0, -0.188, 0]}
            opacity={0.16}
            scale={0.42}
            blur={2.8}
            far={0.22}
            color="#000000"
          />
        </Suspense>
      </Canvas>
      <p className="stage-hint">{hint}</p>
    </div>
  );
}

useGLTF.preload("/tablet.glb");
useGLTF.preload("/uplight.glb");
