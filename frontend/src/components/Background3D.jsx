import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// Monochrome 3D backdrop: drifting particle field + slow wireframe solid.
// Pointer-transparent, pauses when tab hidden, cleans up on unmount.
export default function Background3D({ density = 650 }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100)
    camera.position.z = 9

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // --- particle field ---
    const count = Math.min(density, window.innerWidth < 640 ? 300 : density)
    const pos = new Float32Array(count * 3)
    const speed = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 22
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10
      speed[i] = 0.15 + Math.random() * 0.5
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const mat = new THREE.PointsMaterial({
      color: 0xffffff, size: 0.035, transparent: true, opacity: 0.55,
      sizeAttenuation: true, depthWrite: false,
    })
    const points = new THREE.Points(geo, mat)
    scene.add(points)

    // --- wireframe solid, off-center right ---
    const solid = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.6, 1),
      new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.10 })
    )
    solid.position.set(4.6, 0.4, -2)
    scene.add(solid)
    const solid2 = new THREE.Mesh(
      new THREE.TorusGeometry(1.6, 0.02, 8, 64),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.08 })
    )
    solid2.position.set(-5.2, -1.6, -3)
    solid2.rotation.x = Math.PI / 2.6
    scene.add(solid2)

    const mouse = { x: 0, y: 0 }
    const onMouse = (e) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouse)

    const resize = () => {
      const w = mount.clientWidth || window.innerWidth
      const h = mount.clientHeight || window.innerHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()
    window.addEventListener('resize', resize)

    let raf = 0
    const clock = new THREE.Clock()
    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (document.hidden) return
      const t = clock.getElapsedTime()
      const p = geo.attributes.position.array
      for (let i = 0; i < count; i++) {
        p[i * 3 + 1] += speed[i] * 0.008
        p[i * 3] += Math.sin(t * 0.4 + i) * 0.0012
        if (p[i * 3 + 1] > 7) p[i * 3 + 1] = -7
      }
      geo.attributes.position.needsUpdate = true
      solid.rotation.x = t * 0.08
      solid.rotation.y = t * 0.11
      solid2.rotation.z = t * 0.06
      camera.position.x += (mouse.x * 0.5 - camera.position.x) * 0.03
      camera.position.y += (-mouse.y * 0.35 - camera.position.y) * 0.03
      camera.lookAt(0, 0, 0)
      renderer.render(scene, camera)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('resize', resize)
      geo.dispose()
      mat.dispose()
      renderer.dispose()
      mount.removeChild(renderer.domElement)
    }
  }, [density])

  return <div ref={mountRef} className="absolute inset-0 pointer-events-none" aria-hidden="true" />
}
