"""Bouwt site/js/vliegtuig.js: de gedeelde weergave (licht, materialen, hulpjes, inktlijnen) uit site/js/app.js
plus het vliegtuig uit scripts/vliegtuig_deel.js en scripts/vliegtuig_deel2.js. Draai opnieuw na wijzigingen.
Gebruik: python3 scripts/maak_vliegtuig.py"""
import pathlib, re
R = pathlib.Path(__file__).resolve().parent.parent
app = (R / "site/js/app.js").read_text()
def tussen(a, b):
    i, j = app.index(a), app.index(b)
    return app[i:j]
weergave = tussen("// ================= Renderer, licht", "// ================= De fiets")
lijnen = tussen("// ================= Inktlijnen en weergave", "// ================= Weetjes en gezien")
# groter dan een fiets: schaduw en camera
weergave = weergave.replace("left: -1.6, right: 1.6, top: 1.6, bottom: -1.6, near: 0.5, far: 10", "left: -3.2, right: 3.2, top: 3.2, bottom: -3.2, near: 0.5, far: 16")
weergave = weergave.replace("zon.position.set(1.2, 4.5, 2.2)", "zon.position.set(2.4, 9, 4.4)")
weergave = weergave.replace("new THREE.PerspectiveCamera(24, 1, 0.05, 40)", "new THREE.PerspectiveCamera(32, 1, 0.1, 60)")
weergave = weergave.replace("new THREE.PlaneGeometry(30, 30)", "new THREE.PlaneGeometry(60, 60)")
extra = """  romp: [0xfbfbf9, { color: 0x2a2b2d, roughness: 0.4, metalness: 0.15, clearcoat: 0.7, clearcoatRoughness: 0.2 }],
  klep: [0xe4e4e1, { color: 0x3a3c3f, roughness: 0.45, metalness: 0.3 }],
  raam: [0x55575a, { color: 0x0d0f11, roughness: 0.1, metalness: 0.4, clearcoat: 1 }],
  naad: [0xd2d2cf, { color: 0x1f2022, roughness: 0.5, metalness: 0.1 }],
  stoel: [0xc4c9d1, { color: 0x3c4658, roughness: 0.8, metalness: 0 }],
  vloer: [0xe6e6e3, { color: 0x2a2b2d, roughness: 0.8, metalness: 0 }],
  roodlicht: [0xff8a8a, { color: 0xc8102e, roughness: 0.2, metalness: 0, emissive: 0xff2030, emissiveIntensity: 0 }],
  groenlicht: [0x8fe0a6, { color: 0x1d8a3a, roughness: 0.2, metalness: 0, emissive: 0x20ff60, emissiveIntensity: 0 }],
  witlicht: [0xffffff, { color: 0xffffff, roughness: 0.2, metalness: 0, emissive: 0xffffff, emissiveIntensity: 0 }],
"""
weergave = weergave.replace("const SOORT = {\n", "const SOORT = {\n" + extra, 1)
weergave = weergave.replace('["metaal", "schijf", "ketting", "zwartmetaal"].includes(k)', '["metaal", "schijf", "ketting", "zwartmetaal", "klep"].includes(k)')
assert "left: -3.2" in weergave and "roodlicht" in weergave
kop = '''// Het vliegtuig: een algemeen tweemotorig passagiersvliegtuig, in code getekend (schaal 1:10). Geen bestaand type, geen merk.
// GEMAAKT door scripts/maak_vliegtuig.py: niet met de hand bewerken. De weergave is gedeeld met app.js (de fiets).
import * as THREE from "/js/vendor/three.module.min.js";
import { mergeGeometries } from "/js/vendor/BufferGeometryUtils.js";
import { HDRLoader } from "/js/vendor/HDRLoader.js";
import * as STEM from "/js/stem.js";
import * as MIJN from "/js/mijn.js";
const KINDMODUS = location.pathname.replace(/\\/$/, "") === "/kinderen/vliegtuig";
const params = new URLSearchParams(location.search);
const TAU = Math.PI * 2;
const HDR = "/modellen/studio_small_09_1k.hdr";
const V = (x, y, z = 0) => new THREE.Vector3(x, y, z);

'''
deel1 = (R / "scripts/vliegtuig_deel.js").read_text()
deel2 = (R / "scripts/vliegtuig_deel2.js").read_text()
(R / "site/js/vliegtuig.js").write_text(kop + weergave + deel1 + "\n" + lijnen + deel2)
print("site/js/vliegtuig.js", len(kop + weergave + deel1 + lijnen + deel2))
