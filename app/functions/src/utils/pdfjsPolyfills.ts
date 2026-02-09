/**
 * Polyfills for browser globals required by pdfjs-dist (bundled in pdf-parse v2).
 * Must be called before requiring pdf-parse.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

let applied = false

export function applyPdfjsPolyfills(): void {
  if (applied) return
  applied = true

  const g = globalThis as any

  if (typeof g.DOMMatrix === 'undefined') {
    g.DOMMatrix = class DOMMatrix {
      m11 = 1; m12 = 0; m13 = 0; m14 = 0
      m21 = 0; m22 = 1; m23 = 0; m24 = 0
      m31 = 0; m32 = 0; m33 = 1; m34 = 0
      m41 = 0; m42 = 0; m43 = 0; m44 = 1
      a = 1; b = 0; c = 0; d = 1; e = 0; f = 0
      is2D = true
      isIdentity = true
      inverse() { return new DOMMatrix() }
      multiply() { return new DOMMatrix() }
      translate() { return new DOMMatrix() }
      scale() { return new DOMMatrix() }
      rotate() { return new DOMMatrix() }
      transformPoint(p: any) { return p || { x: 0, y: 0, z: 0, w: 1 } }
    }
  }

  if (typeof g.Path2D === 'undefined') {
    g.Path2D = class Path2D {
      moveTo() {}
      lineTo() {}
      bezierCurveTo() {}
      quadraticCurveTo() {}
      arc() {}
      arcTo() {}
      closePath() {}
      rect() {}
      ellipse() {}
      addPath() {}
    }
  }

  if (typeof g.ImageData === 'undefined') {
    g.ImageData = class ImageData {
      width: number
      height: number
      data: Uint8ClampedArray
      constructor(sw: number, sh: number) {
        this.width = sw
        this.height = sh
        this.data = new Uint8ClampedArray(sw * sh * 4)
      }
    }
  }
}
