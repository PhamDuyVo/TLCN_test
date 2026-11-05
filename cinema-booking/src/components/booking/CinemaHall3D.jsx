import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { canSelectSeat } from '../../utils/booking';
import { formatCurrency } from '../../utils/format';

export default function CinemaHall3D({ seats, selectedIds, onToggle, disabled }) {
  const host = useRef(null);
  const sceneState = useRef(null);
  const [focusedId, setFocusedId] = useState(null);
  const [failed, setFailed] = useState(false);
  const [pov, setPov] = useState(false);
  const focused = seats.find(s => s.id === focusedId);
  // Only geometry changes rebuild the scene; polling and selection keep the camera intact.
  const layout = JSON.stringify(seats.map(({ id, seatRow, seatCol }) => ({ id, seatRow, seatCol })));
  useEffect(() => {
    const container = host.current;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true }); }
    catch { queueMicrotask(() => setFailed(true)); return; }
    const scene = new THREE.Scene(); scene.background = new THREE.Color('#181818');
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 500);
    const positions = JSON.parse(layout);
    const rows = [...new Set(positions.map(s => s.seatRow))].sort();
    const columns = Math.max(1, ...positions.map(s => s.seatCol));
    const width = columns * 1.25;
    const depth = Math.max(6, rows.length * 1.65);
    camera.position.set(width * .6, depth * .9, depth + 5);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, depth / 2); controls.maxPolarAngle = Math.PI / 2; controls.minDistance = .5; controls.maxDistance = depth * 4; controls.update();
    const overview = camera.position.clone();
    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 3));
    const screen = new THREE.Mesh(new THREE.BoxGeometry(width + 2, 4, .15), new THREE.MeshBasicMaterial({ color: '#dddddd' }));
    screen.position.set(0, 3, -2); scene.add(screen);
    const floor = new THREE.Mesh(new THREE.BoxGeometry(width + 4, .15, depth + 5), new THREE.MeshStandardMaterial({ color: '#292929' }));
    floor.position.set(0, -.25, depth / 2); scene.add(floor);
    const meshes = [];
    positions.forEach(seat => {
      const row = rows.indexOf(seat.seatRow);
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(.85, .85, .75), new THREE.MeshStandardMaterial({ color: '#a16207' }));
      mesh.position.set((seat.seatCol - (columns + 1) / 2) * 1.25, .45 + row * .12, row * 1.65 + 1);
      mesh.userData.seatId = seat.id; scene.add(mesh); meshes.push(mesh);
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); container.appendChild(renderer.domElement);
    const render = () => renderer.render(scene, camera);
    const resize = new ResizeObserver(() => { const w = container.clientWidth; renderer.setSize(w, 380); camera.aspect = w / 380; camera.updateProjectionMatrix(); render(); });
    resize.observe(container); controls.addEventListener('change', render);
    let down;
    const onDown = e => { down = [e.clientX, e.clientY]; };
    const onClick = e => {
      if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) return;
      const rect = renderer.domElement.getBoundingClientRect();
      const ray = new THREE.Raycaster(); ray.setFromCamera(new THREE.Vector2((e.clientX - rect.left) / rect.width * 2 - 1, -(e.clientY - rect.top) / rect.height * 2 + 1), camera);
      const hit = ray.intersectObjects(meshes)[0]; if (hit) setFocusedId(hit.object.userData.seatId);
    };
    renderer.domElement.addEventListener('pointerdown', onDown); renderer.domElement.addEventListener('pointerup', onClick);
    sceneState.current = { camera, controls, meshes, render, overview, depth };
    render();
    return () => {
      sceneState.current = null; resize.disconnect(); controls.dispose();
      renderer.domElement.removeEventListener('pointerdown', onDown); renderer.domElement.removeEventListener('pointerup', onClick);
      scene.traverse(object => { object.geometry?.dispose(); if (object.material) object.material.dispose(); });
      renderer.dispose(); renderer.domElement.remove();
    };
  }, [layout]);
  useEffect(() => {
    const state = sceneState.current; if (!state) return;
    state.meshes.forEach(mesh => { const seat = seats.find(s => s.id === mesh.userData.seatId); mesh.material.color.set(selectedIds.includes(seat.id) ? '#e71a0f' : canSelectSeat(seat, selectedIds) ? '#a16207' : '#444444'); mesh.material.emissive.set(seat.id === focusedId ? '#333333' : '#000000'); });
    state.render();
  }, [seats, selectedIds, focusedId, layout]);
  function viewFromSeat() {
    const state = sceneState.current; const mesh = state?.meshes.find(m => m.userData.seatId === focusedId); if (!mesh) return;
    state.camera.position.copy(mesh.position).add(new THREE.Vector3(0, .8, .1)); state.controls.target.set(0, 3, -2); state.controls.enablePan = false; state.controls.enableZoom = false; state.controls.update(); state.render(); setPov(true);
  }
  function resetView() { const s = sceneState.current; if (!s) return; s.camera.position.copy(s.overview); s.controls.target.set(0, 0, s.depth / 2); s.controls.enablePan = true; s.controls.enableZoom = true; s.controls.update(); s.render(); setPov(false); }
  return <div><div ref={host} className="w-full h-[380px] rounded-lg overflow-hidden" aria-label="Mô phỏng phòng chiếu 3D" />{failed && <p role="alert" className="text-amber-400">Thiết bị không hỗ trợ WebGL. Vui lòng chuyển sang sơ đồ 2D.</p>}
    <p className="text-xs text-zinc-400 mt-3">Mô phỏng theo hàng/cột ghế, góc nhìn chỉ mang tính tham khảo. Bấm ghế để xem thông tin; kéo để xoay, cuộn để phóng to.</p>
    <label className="block mt-4 text-sm">Ghế xem trước <select value={focusedId ?? ''} onChange={e => setFocusedId(Number(e.target.value))} className="bg-zinc-900 border border-zinc-700 rounded p-2 ml-2"><option value="" disabled>Chọn ghế</option>{seats.map(s => <option key={s.id} value={s.id}>{s.seatNumber}</option>)}</select></label>
    {focused && <p className="my-3 text-sm">{focused.seatNumber} · {focused.seatType} · {formatCurrency(focused.finalPrice)} · {focused.status}</p>}
    <div className="flex flex-wrap gap-3 mt-3"><button disabled={!focused || failed} onClick={viewFromSeat} className="bg-zinc-700 px-4 py-2 rounded disabled:opacity-40">Xem POV</button><button disabled={!focused || disabled || !canSelectSeat(focused, selectedIds)} onClick={() => onToggle(focused)} className="bg-[#e71a0f] px-4 py-2 rounded disabled:opacity-40">{selectedIds.includes(focusedId) ? 'Bỏ chọn ghế' : 'Chọn ghế'}</button><button onClick={resetView} className="border border-zinc-600 px-4 py-2 rounded">{pov ? 'Thoát POV' : 'Toàn cảnh'}</button></div>
  </div>;
}
