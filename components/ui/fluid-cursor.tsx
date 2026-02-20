"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type ColorRGB = {
  r: number
  g: number
  b: number
}

type Pointer = {
  id: number
  texcoordX: number
  texcoordY: number
  prevTexcoordX: number
  prevTexcoordY: number
  deltaX: number
  deltaY: number
  down: boolean
  moved: boolean
  color: ColorRGB
}

type SupportedFormat = {
  internalFormat: number
  format: number
}

type FBO = {
  texture: WebGLTexture
  fbo: WebGLFramebuffer
  width: number
  height: number
  texelSizeX: number
  texelSizeY: number
  attach: (id: number) => number
}

type DoubleFBO = {
  width: number
  height: number
  texelSizeX: number
  texelSizeY: number
  read: FBO
  write: FBO
  swap: () => void
}

type WebGLContextResult = {
  gl: WebGLRenderingContext | WebGL2RenderingContext
  ext: {
    formatRGBA: SupportedFormat | null
    formatRG: SupportedFormat | null
    formatR: SupportedFormat | null
    halfFloatTexType: number
    supportLinearFiltering: boolean
  }
  isWebGL2: boolean
}

type FluidCursorProps = Omit<React.ComponentProps<"div">, "color"> & {
  simResolution?: number
  dyeResolution?: number
  captureResolution?: number
  densityDissipation?: number
  velocityDissipation?: number
  pressure?: number
  pressureIterations?: number
  curl?: number
  splatRadius?: number
  splatForce?: number
  shading?: boolean
  colorUpdateSpeed?: number
  backColor?: ColorRGB
  transparent?: boolean
  enabled?: boolean
  class?: string
}

const DEFAULT_BACK_COLOR: ColorRGB = { r: 0.5, g: 0, b: 0 }

function pointerPrototype(): Pointer {
  return {
    id: -1,
    texcoordX: 0,
    texcoordY: 0,
    prevTexcoordX: 0,
    prevTexcoordY: 0,
    deltaX: 0,
    deltaY: 0,
    down: false,
    moved: false,
    color: { r: 0, g: 0, b: 0 },
  }
}

function HSVtoRGB(h: number, s: number, v: number): ColorRGB {
  let r = 0
  let g = 0
  let b = 0
  const i = Math.floor(h * 6)
  const f = h * 6 - i
  const p = v * (1 - s)
  const q = v * (1 - f * s)
  const t = v * (1 - (1 - f) * s)

  switch (i % 6) {
    case 0:
      r = v
      g = t
      b = p
      break
    case 1:
      r = q
      g = v
      b = p
      break
    case 2:
      r = p
      g = v
      b = t
      break
    case 3:
      r = p
      g = q
      b = v
      break
    case 4:
      r = t
      g = p
      b = v
      break
    case 5:
      r = v
      g = p
      b = q
      break
  }

  return { r, g, b }
}

function generateColor(): ColorRGB {
  const color = HSVtoRGB(Math.random(), 1, 1)
  color.r *= 0.15
  color.g *= 0.15
  color.b *= 0.15
  return color
}

export function FluidCursor({
  className,
  class: classProp,
  simResolution = 128,
  dyeResolution = 1440,
  captureResolution = 512,
  densityDissipation = 3.5,
  velocityDissipation = 2,
  pressure = 0.1,
  pressureIterations = 20,
  curl = 3,
  splatRadius = 0.2,
  splatForce = 6000,
  shading = true,
  colorUpdateSpeed = 10,
  backColor = DEFAULT_BACK_COLOR,
  transparent = true,
  enabled = true,
  ...props
}: FluidCursorProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!enabled) return

    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const targetCanvas = canvas
    const pointers: Pointer[] = [pointerPrototype()]
    let animationFrameId = 0

    const config = {
      SIM_RESOLUTION: simResolution,
      DYE_RESOLUTION: dyeResolution,
      CAPTURE_RESOLUTION: captureResolution,
      DENSITY_DISSIPATION: densityDissipation,
      VELOCITY_DISSIPATION: velocityDissipation,
      PRESSURE: pressure,
      PRESSURE_ITERATIONS: pressureIterations,
      CURL: curl,
      SPLAT_RADIUS: splatRadius,
      SPLAT_FORCE: splatForce,
      SHADING: shading,
      COLOR_UPDATE_SPEED: colorUpdateSpeed,
      PAUSED: false,
      BACK_COLOR: backColor,
      TRANSPARENT: transparent,
    }

    const webgl = getWebGLContext(targetCanvas)
    if (!webgl) return

    const { gl, ext, isWebGL2 } = webgl
    if (!ext.formatRGBA || !ext.formatRG || !ext.formatR) return

    if (!ext.supportLinearFiltering) {
      config.DYE_RESOLUTION = 256
      config.SHADING = false
    }

    if (config.TRANSPARENT) {
      gl.clearColor(0, 0, 0, 0)
    } else {
      gl.clearColor(config.BACK_COLOR.r, config.BACK_COLOR.g, config.BACK_COLOR.b, 1)
    }

    const baseVertexShader = compileShader(
      gl,
      gl.VERTEX_SHADER,
      `
        precision highp float;
        attribute vec2 aPosition;
        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform vec2 texelSize;

        void main () {
          vUv = aPosition * 0.5 + 0.5;
          vL = vUv - vec2(texelSize.x, 0.0);
          vR = vUv + vec2(texelSize.x, 0.0);
          vT = vUv + vec2(0.0, texelSize.y);
          vB = vUv - vec2(0.0, texelSize.y);
          gl_Position = vec4(aPosition, 0.0, 1.0);
        }
      `
    )

    const copyShader = compileShader(
      gl,
      gl.FRAGMENT_SHADER,
      `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        uniform sampler2D uTexture;

        void main () {
          gl_FragColor = texture2D(uTexture, vUv);
        }
      `
    )

    const clearShader = compileShader(
      gl,
      gl.FRAGMENT_SHADER,
      `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        uniform sampler2D uTexture;
        uniform float value;

        void main () {
          gl_FragColor = value * texture2D(uTexture, vUv);
        }
      `
    )

    const displayShaderSource = `
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform sampler2D uTexture;
        uniform vec2 texelSize;

        vec3 linearToGamma (vec3 color) {
          color = max(color, vec3(0));
          return max(1.055 * pow(color, vec3(0.416666667)) - 0.055, vec3(0));
        }

        void main () {
          vec3 c = texture2D(uTexture, vUv).rgb;
          #ifdef SHADING
            vec3 lc = texture2D(uTexture, vL).rgb;
            vec3 rc = texture2D(uTexture, vR).rgb;
            vec3 tc = texture2D(uTexture, vT).rgb;
            vec3 bc = texture2D(uTexture, vB).rgb;

            float dx = length(rc) - length(lc);
            float dy = length(tc) - length(bc);

            vec3 n = normalize(vec3(dx, dy, length(texelSize)));
            vec3 l = vec3(0.0, 0.0, 1.0);

            float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
            c *= diffuse;
          #endif

          float a = max(c.r, max(c.g, c.b));
          gl_FragColor = vec4(c, a);
        }
      `

    const splatShader = compileShader(
      gl,
      gl.FRAGMENT_SHADER,
      `
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        uniform sampler2D uTarget;
        uniform float aspectRatio;
        uniform vec3 color;
        uniform vec2 point;
        uniform float radius;

        void main () {
          vec2 p = vUv - point.xy;
          p.x *= aspectRatio;
          vec3 splat = exp(-dot(p, p) / radius) * color;
          vec3 base = texture2D(uTarget, vUv).xyz;
          gl_FragColor = vec4(base + splat, 1.0);
        }
      `
    )

    const advectionShader = compileShader(
      gl,
      gl.FRAGMENT_SHADER,
      `
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        uniform sampler2D uVelocity;
        uniform sampler2D uSource;
        uniform vec2 texelSize;
        uniform vec2 dyeTexelSize;
        uniform float dt;
        uniform float dissipation;

        vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
          vec2 st = uv / tsize - 0.5;
          vec2 iuv = floor(st);
          vec2 fuv = fract(st);

          vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
          vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
          vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
          vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);

          return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
        }

        void main () {
          #ifdef MANUAL_FILTERING
            vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
            vec4 result = bilerp(uSource, coord, dyeTexelSize);
          #else
            vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
            vec4 result = texture2D(uSource, coord);
          #endif
          float decay = 1.0 + dissipation * dt;
          gl_FragColor = result / decay;
        }
      `,
      ext.supportLinearFiltering ? null : ["MANUAL_FILTERING"]
    )

    const divergenceShader = compileShader(
      gl,
      gl.FRAGMENT_SHADER,
      `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uVelocity;

        void main () {
          float L = texture2D(uVelocity, vL).x;
          float R = texture2D(uVelocity, vR).x;
          float T = texture2D(uVelocity, vT).y;
          float B = texture2D(uVelocity, vB).y;

          vec2 C = texture2D(uVelocity, vUv).xy;
          if (vL.x < 0.0) { L = -C.x; }
          if (vR.x > 1.0) { R = -C.x; }
          if (vT.y > 1.0) { T = -C.y; }
          if (vB.y < 0.0) { B = -C.y; }

          float div = 0.5 * (R - L + T - B);
          gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
        }
      `
    )

    const curlShader = compileShader(
      gl,
      gl.FRAGMENT_SHADER,
      `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uVelocity;

        void main () {
          float L = texture2D(uVelocity, vL).y;
          float R = texture2D(uVelocity, vR).y;
          float T = texture2D(uVelocity, vT).x;
          float B = texture2D(uVelocity, vB).x;
          float vorticity = R - L - T + B;
          gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
        }
      `
    )

    const vorticityShader = compileShader(
      gl,
      gl.FRAGMENT_SHADER,
      `
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform sampler2D uVelocity;
        uniform sampler2D uCurl;
        uniform float curl;
        uniform float dt;

        void main () {
          float L = texture2D(uCurl, vL).x;
          float R = texture2D(uCurl, vR).x;
          float T = texture2D(uCurl, vT).x;
          float B = texture2D(uCurl, vB).x;
          float C = texture2D(uCurl, vUv).x;

          vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
          force /= length(force) + 0.0001;
          force *= curl * C;
          force.y *= -1.0;

          vec2 velocity = texture2D(uVelocity, vUv).xy;
          velocity += force * dt;
          velocity = min(max(velocity, -1000.0), 1000.0);
          gl_FragColor = vec4(velocity, 0.0, 1.0);
        }
      `
    )

    const pressureShader = compileShader(
      gl,
      gl.FRAGMENT_SHADER,
      `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uPressure;
        uniform sampler2D uDivergence;

        void main () {
          float L = texture2D(uPressure, vL).x;
          float R = texture2D(uPressure, vR).x;
          float T = texture2D(uPressure, vT).x;
          float B = texture2D(uPressure, vB).x;
          float divergence = texture2D(uDivergence, vUv).x;
          float pressure = (L + R + B + T - divergence) * 0.25;
          gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
        }
      `
    )

    const gradientSubtractShader = compileShader(
      gl,
      gl.FRAGMENT_SHADER,
      `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uPressure;
        uniform sampler2D uVelocity;

        void main () {
          float L = texture2D(uPressure, vL).x;
          float R = texture2D(uPressure, vR).x;
          float T = texture2D(uPressure, vT).x;
          float B = texture2D(uPressure, vB).x;
          vec2 velocity = texture2D(uVelocity, vUv).xy;
          velocity.xy -= vec2(R - L, T - B);
          gl_FragColor = vec4(velocity, 0.0, 1.0);
        }
      `
    )

    const copyProgram = new Program(gl, baseVertexShader, copyShader)
    const clearProgram = new Program(gl, baseVertexShader, clearShader)
    const splatProgram = new Program(gl, baseVertexShader, splatShader)
    const advectionProgram = new Program(gl, baseVertexShader, advectionShader)
    const divergenceProgram = new Program(gl, baseVertexShader, divergenceShader)
    const curlProgram = new Program(gl, baseVertexShader, curlShader)
    const vorticityProgram = new Program(gl, baseVertexShader, vorticityShader)
    const pressureProgram = new Program(gl, baseVertexShader, pressureShader)
    const gradientSubtractProgram = new Program(gl, baseVertexShader, gradientSubtractShader)
    const displayMaterial = new Material(gl, baseVertexShader, displayShaderSource)

    const blit = (() => {
      const buffer = gl.createBuffer()
      const elementBuffer = gl.createBuffer()
      if (!buffer || !elementBuffer) {
        return (_target: FBO | null, _clear = false) => undefined
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW)

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementBuffer)
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW)

      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
      gl.enableVertexAttribArray(0)

      return (target: FBO | null, clear = false) => {
        if (!target) {
          gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
          gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        } else {
          gl.viewport(0, 0, target.width, target.height)
          gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo)
        }

        if (clear) gl.clear(gl.COLOR_BUFFER_BIT)
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
      }
    })()

    let dye: DoubleFBO
    let velocity: DoubleFBO
    let divergence: FBO
    let curlTexture: FBO
    let pressureTexture: DoubleFBO

    function getResolution(resolution: number) {
      const aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight
      const aspect = aspectRatio < 1 ? 1 / aspectRatio : aspectRatio
      const min = Math.round(resolution)
      const max = Math.round(resolution * aspect)

      if (gl.drawingBufferWidth > gl.drawingBufferHeight) {
        return { width: max, height: min }
      }

      return { width: min, height: max }
    }

    function createFBO(
      width: number,
      height: number,
      internalFormat: number,
      format: number,
      type: number,
      param: number
    ): FBO {
      gl.activeTexture(gl.TEXTURE0)
      const texture = gl.createTexture()
      const fbo = gl.createFramebuffer()
      if (!texture || !fbo) {
        throw new Error("Failed to create framebuffer resources.")
      }

      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, type, null)

      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
      gl.viewport(0, 0, width, height)
      gl.clear(gl.COLOR_BUFFER_BIT)

      const texelSizeX = 1 / width
      const texelSizeY = 1 / height

      return {
        texture,
        fbo,
        width,
        height,
        texelSizeX,
        texelSizeY,
        attach(id: number) {
          gl.activeTexture(gl.TEXTURE0 + id)
          gl.bindTexture(gl.TEXTURE_2D, texture)
          return id
        },
      }
    }

    function createDoubleFBO(
      width: number,
      height: number,
      internalFormat: number,
      format: number,
      type: number,
      param: number
    ): DoubleFBO {
      let fbo1 = createFBO(width, height, internalFormat, format, type, param)
      let fbo2 = createFBO(width, height, internalFormat, format, type, param)
      return {
        width,
        height,
        texelSizeX: fbo1.texelSizeX,
        texelSizeY: fbo1.texelSizeY,
        read: fbo1,
        write: fbo2,
        swap() {
          const temp = fbo1
          fbo1 = fbo2
          fbo2 = temp
          this.read = fbo1
          this.write = fbo2
        },
      }
    }

    function resizeFBO(
      target: FBO,
      width: number,
      height: number,
      internalFormat: number,
      format: number,
      type: number,
      param: number
    ): FBO {
      const newFBO = createFBO(width, height, internalFormat, format, type, param)
      copyProgram.bind()
      if (copyProgram.uniforms.uTexture) {
        gl.uniform1i(copyProgram.uniforms.uTexture, target.attach(0))
      }
      blit(newFBO, false)
      return newFBO
    }

    function resizeDoubleFBO(
      target: DoubleFBO,
      width: number,
      height: number,
      internalFormat: number,
      format: number,
      type: number,
      param: number
    ): DoubleFBO {
      if (target.width === width && target.height === height) return target
      target.read = resizeFBO(target.read, width, height, internalFormat, format, type, param)
      target.write = createFBO(width, height, internalFormat, format, type, param)
      target.width = width
      target.height = height
      target.texelSizeX = 1 / width
      target.texelSizeY = 1 / height
      return target
    }

    function initFramebuffers() {
      const simRes = getResolution(config.SIM_RESOLUTION)
      const dyeRes = getResolution(config.DYE_RESOLUTION)

      const texType = ext.halfFloatTexType
      const rgba = ext.formatRGBA
      const rg = ext.formatRG
      const r = ext.formatR
      if (!rgba || !rg || !r) return

      const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST
      gl.disable(gl.BLEND)

      if (!dye) {
        dye = createDoubleFBO(
          dyeRes.width,
          dyeRes.height,
          rgba.internalFormat,
          rgba.format,
          texType,
          filtering
        )
      } else {
        dye = resizeDoubleFBO(
          dye,
          dyeRes.width,
          dyeRes.height,
          rgba.internalFormat,
          rgba.format,
          texType,
          filtering
        )
      }

      if (!velocity) {
        velocity = createDoubleFBO(
          simRes.width,
          simRes.height,
          rg.internalFormat,
          rg.format,
          texType,
          filtering
        )
      } else {
        velocity = resizeDoubleFBO(
          velocity,
          simRes.width,
          simRes.height,
          rg.internalFormat,
          rg.format,
          texType,
          filtering
        )
      }

      divergence = createFBO(
        simRes.width,
        simRes.height,
        r.internalFormat,
        r.format,
        texType,
        gl.NEAREST
      )

      curlTexture = createFBO(
        simRes.width,
        simRes.height,
        r.internalFormat,
        r.format,
        texType,
        gl.NEAREST
      )

      pressureTexture = createDoubleFBO(
        simRes.width,
        simRes.height,
        r.internalFormat,
        r.format,
        texType,
        gl.NEAREST
      )
    }

    function updateKeywords() {
      const displayKeywords: string[] = []
      if (config.SHADING) displayKeywords.push("SHADING")
      displayMaterial.setKeywords(displayKeywords)
    }

    function scaleByPixelRatio(input: number) {
      const pixelRatio = window.devicePixelRatio || 1
      return Math.floor(input * pixelRatio)
    }

    function resizeCanvas() {
      const width = scaleByPixelRatio(targetCanvas.clientWidth)
      const height = scaleByPixelRatio(targetCanvas.clientHeight)
      if (targetCanvas.width !== width || targetCanvas.height !== height) {
        targetCanvas.width = width
        targetCanvas.height = height
        return true
      }
      return false
    }

    function calcDeltaTime(lastUpdateTimeRef: { value: number }) {
      const now = Date.now()
      let dt = (now - lastUpdateTimeRef.value) / 1000
      dt = Math.min(dt, 0.016666)
      lastUpdateTimeRef.value = now
      return dt
    }

    function wrap(value: number, min: number, max: number) {
      const range = max - min
      if (range === 0) return min
      return ((value - min) % range) + min
    }

    function updatePointerDownData(pointer: Pointer, id: number, posX: number, posY: number) {
      pointer.id = id
      pointer.down = true
      pointer.moved = false
      pointer.texcoordX = posX / targetCanvas.width
      pointer.texcoordY = 1 - posY / targetCanvas.height
      pointer.prevTexcoordX = pointer.texcoordX
      pointer.prevTexcoordY = pointer.texcoordY
      pointer.deltaX = 0
      pointer.deltaY = 0
      pointer.color = generateColor()
    }

    function correctDeltaX(delta: number) {
      const aspectRatio = targetCanvas.width / targetCanvas.height
      if (aspectRatio < 1) delta *= aspectRatio
      return delta
    }

    function correctDeltaY(delta: number) {
      const aspectRatio = targetCanvas.width / targetCanvas.height
      if (aspectRatio > 1) delta /= aspectRatio
      return delta
    }

    function updatePointerMoveData(pointer: Pointer, posX: number, posY: number, color: ColorRGB) {
      pointer.prevTexcoordX = pointer.texcoordX
      pointer.prevTexcoordY = pointer.texcoordY
      pointer.texcoordX = posX / targetCanvas.width
      pointer.texcoordY = 1 - posY / targetCanvas.height
      pointer.deltaX = correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX)
      pointer.deltaY = correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY)
      pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0
      pointer.color = color
    }

    function updatePointerUpData(pointer: Pointer) {
      pointer.down = false
    }

    function correctRadius(radius: number) {
      const aspectRatio = targetCanvas.width / targetCanvas.height
      if (aspectRatio > 1) radius *= aspectRatio
      return radius
    }

    function splat(x: number, y: number, dx: number, dy: number, color: ColorRGB) {
      splatProgram.bind()
      if (splatProgram.uniforms.uTarget) {
        gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0))
      }
      if (splatProgram.uniforms.aspectRatio) {
        gl.uniform1f(splatProgram.uniforms.aspectRatio, targetCanvas.width / targetCanvas.height)
      }
      if (splatProgram.uniforms.point) {
        gl.uniform2f(splatProgram.uniforms.point, x, y)
      }
      if (splatProgram.uniforms.color) {
        gl.uniform3f(splatProgram.uniforms.color, dx, dy, 0)
      }
      if (splatProgram.uniforms.radius) {
        gl.uniform1f(splatProgram.uniforms.radius, correctRadius(config.SPLAT_RADIUS / 100))
      }
      blit(velocity.write)
      velocity.swap()

      if (splatProgram.uniforms.uTarget) {
        gl.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0))
      }
      if (splatProgram.uniforms.color) {
        gl.uniform3f(splatProgram.uniforms.color, color.r, color.g, color.b)
      }
      blit(dye.write)
      dye.swap()
    }

    function splatPointer(pointer: Pointer) {
      const dx = pointer.deltaX * config.SPLAT_FORCE
      const dy = pointer.deltaY * config.SPLAT_FORCE
      splat(pointer.texcoordX, pointer.texcoordY, dx, dy, pointer.color)
    }

    function clickSplat(pointer: Pointer) {
      const color = generateColor()
      color.r *= 10
      color.g *= 10
      color.b *= 10
      const dx = 10 * (Math.random() - 0.5)
      const dy = 30 * (Math.random() - 0.5)
      splat(pointer.texcoordX, pointer.texcoordY, dx, dy, color)
    }

    function applyInputs() {
      pointers.forEach((pointer) => {
        if (pointer.moved) {
          pointer.moved = false
          splatPointer(pointer)
        }
      })
    }

    function drawDisplay(target: FBO | null) {
      const width = target ? target.width : gl.drawingBufferWidth
      const height = target ? target.height : gl.drawingBufferHeight
      displayMaterial.bind()
      if (config.SHADING && displayMaterial.uniforms.texelSize) {
        gl.uniform2f(displayMaterial.uniforms.texelSize, 1 / width, 1 / height)
      }
      if (displayMaterial.uniforms.uTexture) {
        gl.uniform1i(displayMaterial.uniforms.uTexture, dye.read.attach(0))
      }
      blit(target, false)
    }

    function render(target: FBO | null) {
      if (config.TRANSPARENT) {
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
        gl.enable(gl.BLEND)
      } else {
        gl.disable(gl.BLEND)
        gl.clearColor(config.BACK_COLOR.r, config.BACK_COLOR.g, config.BACK_COLOR.b, 1)
        gl.clear(gl.COLOR_BUFFER_BIT)
      }
      drawDisplay(target)
    }

    function step(dt: number) {
      gl.disable(gl.BLEND)

      curlProgram.bind()
      if (curlProgram.uniforms.texelSize) {
        gl.uniform2f(curlProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
      }
      if (curlProgram.uniforms.uVelocity) {
        gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0))
      }
      blit(curlTexture)

      vorticityProgram.bind()
      if (vorticityProgram.uniforms.texelSize) {
        gl.uniform2f(vorticityProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
      }
      if (vorticityProgram.uniforms.uVelocity) {
        gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0))
      }
      if (vorticityProgram.uniforms.uCurl) {
        gl.uniform1i(vorticityProgram.uniforms.uCurl, curlTexture.attach(1))
      }
      if (vorticityProgram.uniforms.curl) {
        gl.uniform1f(vorticityProgram.uniforms.curl, config.CURL)
      }
      if (vorticityProgram.uniforms.dt) {
        gl.uniform1f(vorticityProgram.uniforms.dt, dt)
      }
      blit(velocity.write)
      velocity.swap()

      divergenceProgram.bind()
      if (divergenceProgram.uniforms.texelSize) {
        gl.uniform2f(divergenceProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
      }
      if (divergenceProgram.uniforms.uVelocity) {
        gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0))
      }
      blit(divergence)

      clearProgram.bind()
      if (clearProgram.uniforms.uTexture) {
        gl.uniform1i(clearProgram.uniforms.uTexture, pressureTexture.read.attach(0))
      }
      if (clearProgram.uniforms.value) {
        gl.uniform1f(clearProgram.uniforms.value, config.PRESSURE)
      }
      blit(pressureTexture.write)
      pressureTexture.swap()

      pressureProgram.bind()
      if (pressureProgram.uniforms.texelSize) {
        gl.uniform2f(pressureProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
      }
      if (pressureProgram.uniforms.uDivergence) {
        gl.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0))
      }
      for (let i = 0; i < config.PRESSURE_ITERATIONS; i += 1) {
        if (pressureProgram.uniforms.uPressure) {
          gl.uniform1i(pressureProgram.uniforms.uPressure, pressureTexture.read.attach(1))
        }
        blit(pressureTexture.write)
        pressureTexture.swap()
      }

      gradientSubtractProgram.bind()
      if (gradientSubtractProgram.uniforms.texelSize) {
        gl.uniform2f(
          gradientSubtractProgram.uniforms.texelSize,
          velocity.texelSizeX,
          velocity.texelSizeY
        )
      }
      if (gradientSubtractProgram.uniforms.uPressure) {
        gl.uniform1i(gradientSubtractProgram.uniforms.uPressure, pressureTexture.read.attach(0))
      }
      if (gradientSubtractProgram.uniforms.uVelocity) {
        gl.uniform1i(gradientSubtractProgram.uniforms.uVelocity, velocity.read.attach(1))
      }
      blit(velocity.write)
      velocity.swap()

      advectionProgram.bind()
      if (advectionProgram.uniforms.texelSize) {
        gl.uniform2f(advectionProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
      }
      if (!ext.supportLinearFiltering && advectionProgram.uniforms.dyeTexelSize) {
        gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY)
      }
      const velocityId = velocity.read.attach(0)
      if (advectionProgram.uniforms.uVelocity) {
        gl.uniform1i(advectionProgram.uniforms.uVelocity, velocityId)
      }
      if (advectionProgram.uniforms.uSource) {
        gl.uniform1i(advectionProgram.uniforms.uSource, velocityId)
      }
      if (advectionProgram.uniforms.dt) {
        gl.uniform1f(advectionProgram.uniforms.dt, dt)
      }
      if (advectionProgram.uniforms.dissipation) {
        gl.uniform1f(advectionProgram.uniforms.dissipation, config.VELOCITY_DISSIPATION)
      }
      blit(velocity.write)
      velocity.swap()

      if (!ext.supportLinearFiltering && advectionProgram.uniforms.dyeTexelSize) {
        gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY)
      }
      if (advectionProgram.uniforms.uVelocity) {
        gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0))
      }
      if (advectionProgram.uniforms.uSource) {
        gl.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1))
      }
      if (advectionProgram.uniforms.dissipation) {
        gl.uniform1f(advectionProgram.uniforms.dissipation, config.DENSITY_DISSIPATION)
      }
      blit(dye.write)
      dye.swap()
    }

    function getColorUpdateTimerRef() {
      return { value: 0 }
    }

    function updateColors(dt: number, colorUpdateTimerRef: { value: number }) {
      colorUpdateTimerRef.value += dt * config.COLOR_UPDATE_SPEED
      if (colorUpdateTimerRef.value >= 1) {
        colorUpdateTimerRef.value = wrap(colorUpdateTimerRef.value, 0, 1)
        pointers.forEach((pointer) => {
          pointer.color = generateColor()
        })
      }
    }

    const lastUpdateTimeRef = { value: Date.now() }
    const colorUpdateTimerRef = getColorUpdateTimerRef()

    function updateFrame() {
      const dt = calcDeltaTime(lastUpdateTimeRef)
      if (resizeCanvas()) initFramebuffers()
      updateColors(dt, colorUpdateTimerRef)
      applyInputs()
      if (!config.PAUSED) step(dt)
      render(null)
      animationFrameId = window.requestAnimationFrame(updateFrame)
    }

    updateKeywords()
    initFramebuffers()
    updateFrame()

    const handleMouseDown = (event: MouseEvent) => {
      const pointer = pointers[0]
      if (!pointer) return
      const posX = scaleByPixelRatio(event.clientX)
      const posY = scaleByPixelRatio(event.clientY)
      updatePointerDownData(pointer, -1, posX, posY)
      clickSplat(pointer)
    }

    const handleMouseMove = (event: MouseEvent) => {
      const pointer = pointers[0]
      if (!pointer) return
      const posX = scaleByPixelRatio(event.clientX)
      const posY = scaleByPixelRatio(event.clientY)
      updatePointerMoveData(pointer, posX, posY, pointer.color)
    }

    const handleMouseUp = () => {
      const pointer = pointers[0]
      if (!pointer) return
      updatePointerUpData(pointer)
    }

    const handleTouchStart = (event: TouchEvent) => {
      const pointer = pointers[0]
      if (!pointer) return
      const touches = event.touches
      for (let i = 0; i < touches.length; i += 1) {
        const touch = touches[i]
        if (!touch) continue
        const posX = scaleByPixelRatio(touch.clientX)
        const posY = scaleByPixelRatio(touch.clientY)
        updatePointerDownData(pointer, touch.identifier, posX, posY)
        clickSplat(pointer)
      }
    }

    const handleTouchMove = (event: TouchEvent) => {
      const pointer = pointers[0]
      if (!pointer) return
      const touches = event.touches
      for (let i = 0; i < touches.length; i += 1) {
        const touch = touches[i]
        if (!touch) continue
        const posX = scaleByPixelRatio(touch.clientX)
        const posY = scaleByPixelRatio(touch.clientY)
        updatePointerMoveData(pointer, posX, posY, pointer.color)
      }
    }

    const handleTouchEnd = () => {
      const pointer = pointers[0]
      if (!pointer) return
      updatePointerUpData(pointer)
    }

    const handleResize = () => {
      resizeCanvas()
      initFramebuffers()
    }

    window.addEventListener("resize", handleResize)
    window.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
    window.addEventListener("touchstart", handleTouchStart, { passive: true })
    window.addEventListener("touchmove", handleTouchMove, { passive: true })
    window.addEventListener("touchend", handleTouchEnd)

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
      window.removeEventListener("touchstart", handleTouchStart)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("touchend", handleTouchEnd)
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId)
    }

    function getWebGLContext(targetCanvas: HTMLCanvasElement): WebGLContextResult | null {
      const params = {
        alpha: true,
        depth: false,
        stencil: false,
        antialias: false,
        preserveDrawingBuffer: false,
      }

      let context = targetCanvas.getContext("webgl2", params) as WebGL2RenderingContext | null
      if (!context) {
        context =
          (targetCanvas.getContext("webgl", params) as WebGL2RenderingContext | null) ||
          (targetCanvas.getContext("experimental-webgl", params) as WebGL2RenderingContext | null)
      }
      if (!context) return null

      const webgl2 = typeof WebGL2RenderingContext !== "undefined" && context instanceof WebGL2RenderingContext

      let supportLinearFiltering = false
      let halfFloatTexType = 0

      if (webgl2) {
        context.getExtension("EXT_color_buffer_float")
        supportLinearFiltering = !!context.getExtension("OES_texture_float_linear")
        halfFloatTexType = context.HALF_FLOAT
      } else {
        const halfFloat = context.getExtension("OES_texture_half_float")
        supportLinearFiltering = !!context.getExtension("OES_texture_half_float_linear")
        halfFloatTexType = halfFloat?.HALF_FLOAT_OES ?? 0
      }

      let formatRGBA: SupportedFormat | null
      let formatRG: SupportedFormat | null
      let formatR: SupportedFormat | null

      if (webgl2) {
        formatRGBA = getSupportedFormat(context, context.RGBA16F, context.RGBA, halfFloatTexType, webgl2)
        formatRG = getSupportedFormat(context, context.RG16F, context.RG, halfFloatTexType, webgl2)
        formatR = getSupportedFormat(context, context.R16F, context.RED, halfFloatTexType, webgl2)
      } else {
        formatRGBA = getSupportedFormat(context, context.RGBA, context.RGBA, halfFloatTexType, webgl2)
        formatRG = getSupportedFormat(context, context.RGBA, context.RGBA, halfFloatTexType, webgl2)
        formatR = getSupportedFormat(context, context.RGBA, context.RGBA, halfFloatTexType, webgl2)
      }

      return {
        gl: context,
        ext: {
          formatRGBA,
          formatRG,
          formatR,
          halfFloatTexType,
          supportLinearFiltering,
        },
        isWebGL2: webgl2,
      }
    }

    function getSupportedFormat(
      context: WebGLRenderingContext | WebGL2RenderingContext,
      internalFormat: number,
      format: number,
      type: number,
      webgl2: boolean
    ): SupportedFormat | null {
      if (!supportRenderTextureFormat(context, internalFormat, format, type)) {
        if (webgl2) {
          const gl2 = context as WebGL2RenderingContext
          switch (internalFormat) {
            case gl2.R16F:
              return getSupportedFormat(gl2, gl2.RG16F, gl2.RG, type, webgl2)
            case gl2.RG16F:
              return getSupportedFormat(gl2, gl2.RGBA16F, gl2.RGBA, type, webgl2)
            default:
              return null
          }
        }
        return null
      }

      return { internalFormat, format }
    }

    function supportRenderTextureFormat(
      context: WebGLRenderingContext | WebGL2RenderingContext,
      internalFormat: number,
      format: number,
      type: number
    ) {
      const texture = context.createTexture()
      const fbo = context.createFramebuffer()
      if (!texture || !fbo) return false

      context.bindTexture(context.TEXTURE_2D, texture)
      context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.NEAREST)
      context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.NEAREST)
      context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE)
      context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE)
      context.texImage2D(context.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null)

      context.bindFramebuffer(context.FRAMEBUFFER, fbo)
      context.framebufferTexture2D(context.FRAMEBUFFER, context.COLOR_ATTACHMENT0, context.TEXTURE_2D, texture, 0)

      const status = context.checkFramebufferStatus(context.FRAMEBUFFER)
      return status === context.FRAMEBUFFER_COMPLETE
    }
  }, [
    backColor.b,
    backColor.g,
    backColor.r,
    captureResolution,
    colorUpdateSpeed,
    curl,
    densityDissipation,
    dyeResolution,
    enabled,
    pressure,
    pressureIterations,
    shading,
    simResolution,
    splatForce,
    splatRadius,
    transparent,
    velocityDissipation,
  ])

  if (!enabled) return null

  return (
    <div
      ref={containerRef}
      data-slot="fluid-cursor"
      className={cn("pointer-events-none fixed top-0 left-0 z-50 size-full", classProp, className)}
      {...props}
    >
      <canvas ref={canvasRef} id="fluid" className="block h-screen w-screen" />
    </div>
  )
}

function hashCode(source: string) {
  if (!source.length) return 0
  let hash = 0
  for (let i = 0; i < source.length; i += 1) {
    hash = (hash << 5) - hash + source.charCodeAt(i)
    hash |= 0
  }
  return hash
}

function addKeywords(source: string, keywords: string[] | null) {
  if (!keywords) return source
  let keywordsString = ""
  keywords.forEach((keyword) => {
    keywordsString += `#define ${keyword}\n`
  })
  return keywordsString + source
}

function compileShader(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  type: number,
  source: string,
  keywords: string[] | null = null
) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, addKeywords(source, keywords))
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function createProgram(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  vertexShader: WebGLShader | null,
  fragmentShader: WebGLShader | null
) {
  if (!vertexShader || !fragmentShader) return null
  const program = gl.createProgram()
  if (!program) return null
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.bindAttribLocation(program, 0, "aPosition")
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program)
    return null
  }
  return program
}

function getUniforms(gl: WebGLRenderingContext | WebGL2RenderingContext, program: WebGLProgram | null) {
  const uniforms: Record<string, WebGLUniformLocation | null> = {}
  if (!program) return uniforms
  const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)
  for (let i = 0; i < uniformCount; i += 1) {
    const uniformInfo = gl.getActiveUniform(program, i)
    if (!uniformInfo) continue
    uniforms[uniformInfo.name] = gl.getUniformLocation(program, uniformInfo.name)
  }
  return uniforms
}

class Program {
  private gl: WebGLRenderingContext | WebGL2RenderingContext
  private program: WebGLProgram | null
  public uniforms: Record<string, WebGLUniformLocation | null>

  constructor(
    gl: WebGLRenderingContext | WebGL2RenderingContext,
    vertexShader: WebGLShader | null,
    fragmentShader: WebGLShader | null
  ) {
    this.gl = gl
    this.program = createProgram(gl, vertexShader, fragmentShader)
    this.uniforms = getUniforms(gl, this.program)
  }

  bind() {
    if (this.program) this.gl.useProgram(this.program)
  }
}

class Material {
  private gl: WebGLRenderingContext | WebGL2RenderingContext
  private vertexShader: WebGLShader | null
  private fragmentShaderSource: string
  private programs: Record<number, WebGLProgram | null>
  private activeProgram: WebGLProgram | null
  public uniforms: Record<string, WebGLUniformLocation | null>

  constructor(
    gl: WebGLRenderingContext | WebGL2RenderingContext,
    vertexShader: WebGLShader | null,
    fragmentShaderSource: string
  ) {
    this.gl = gl
    this.vertexShader = vertexShader
    this.fragmentShaderSource = fragmentShaderSource
    this.programs = {}
    this.activeProgram = null
    this.uniforms = {}
  }

  setKeywords(keywords: string[]) {
    let hash = 0
    keywords.forEach((keyword) => {
      hash += hashCode(keyword)
    })

    let program = this.programs[hash]
    if (program == null) {
      const fragmentShader = compileShader(this.gl, this.gl.FRAGMENT_SHADER, this.fragmentShaderSource, keywords)
      program = createProgram(this.gl, this.vertexShader, fragmentShader)
      this.programs[hash] = program
    }

    if (program === this.activeProgram) return
    this.activeProgram = program
    this.uniforms = getUniforms(this.gl, this.activeProgram)
  }

  bind() {
    if (this.activeProgram) this.gl.useProgram(this.activeProgram)
  }
}
