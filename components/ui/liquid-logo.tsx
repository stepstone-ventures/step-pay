'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { parseLogoImage } from './parse-logo-image';
import { liquidFragSource, vertexShaderSource } from './liquid-logo-shader';

type LiquidLogoCaptureApi = {
  id: string;
  isReady: () => boolean;
  renderAtMs: (elapsedMs: number) => string;
  size: () => { width: number; height: number };
};

declare global {
  interface Window {
    __liquidLogoCapture?: LiquidLogoCaptureApi;
  }
}

type LiquidLogoProps = {
  className?: string;
  imageUrl: string;
  patternScale?: number;
  refraction?: number;
  edge?: number;
  patternBlur?: number;
  liquid?: number;
  speed?: number;
  showProcessing?: boolean;
  autoAnimate?: boolean;
  captureId?: string;
};

function LiquidLogo({
  className,
  imageUrl,
  patternScale = 2,
  refraction = 0.015,
  edge = 0.4,
  patternBlur = 0.005,
  liquid = 0.07,
  speed = 0.3,
  showProcessing = true,
  autoAnimate = true,
  captureId,
}: LiquidLogoProps) {
  const [processing, setProcessing] = React.useState(false);

  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const imageDataRef = React.useRef<ImageData | null>(null);
  const glRef = React.useRef<WebGL2RenderingContext | null>(null);
  const uniformsRef = React.useRef<Record<string, WebGLUniformLocation>>({});

  const animationFrameRef = React.useRef<number>();
  const totalAnimationTimeRef = React.useRef(0);
  const lastRenderTimeRef = React.useRef(0);
  const textureCleanupRef = React.useRef<(() => void) | null>(null);
  const speedRef = React.useRef(speed);

  React.useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const drawAtTime = React.useCallback((timeValue: number) => {
    const gl = glRef.current;
    const uniforms = uniformsRef.current;
    const timeUniform = uniforms.u_time;

    if (!gl || !timeUniform) {
      return;
    }

    gl.uniform1f(timeUniform, timeValue);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }, []);

  const updateUniforms = React.useCallback(() => {
    const gl = glRef.current;
    const uniforms = uniformsRef.current;
    if (!gl) {
      return;
    }

    if (uniforms.u_edge) gl.uniform1f(uniforms.u_edge, edge);
    if (uniforms.u_patternBlur) gl.uniform1f(uniforms.u_patternBlur, patternBlur);
    if (uniforms.u_time) gl.uniform1f(uniforms.u_time, 0);
    if (uniforms.u_patternScale) gl.uniform1f(uniforms.u_patternScale, patternScale);
    if (uniforms.u_refraction) gl.uniform1f(uniforms.u_refraction, refraction);
    if (uniforms.u_liquid) gl.uniform1f(uniforms.u_liquid, liquid);
  }, [edge, patternBlur, patternScale, refraction, liquid]);

  const resizeCanvas = React.useCallback(() => {
    const canvasEl = canvasRef.current;
    const gl = glRef.current;
    const uniforms = uniformsRef.current;

    if (!canvasEl || !gl) {
      return;
    }

    const imgData = imageDataRef.current;
    const imgRatio = imgData ? imgData.width / imgData.height : 1;

    if (uniforms.u_img_ratio) {
      gl.uniform1f(uniforms.u_img_ratio, imgRatio);
    }

    const side = 1000;
    canvasEl.width = side * devicePixelRatio;
    canvasEl.height = side * devicePixelRatio;

    gl.viewport(0, 0, canvasEl.height, canvasEl.height);

    if (uniforms.u_ratio) {
      gl.uniform1f(uniforms.u_ratio, 1);
    }

    if (uniforms.u_img_ratio) {
      gl.uniform1f(uniforms.u_img_ratio, imgRatio);
    }
  }, []);

  const initShader = React.useCallback(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext('webgl2', {
      antialias: true,
      alpha: true,
    });

    if (!canvas || !gl) {
      return;
    }

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const createShader = (glContext: WebGL2RenderingContext, sourceCode: string, type: number) => {
      const shader = glContext.createShader(type);
      if (!shader) {
        return null;
      }

      glContext.shaderSource(shader, sourceCode);
      glContext.compileShader(shader);

      if (!glContext.getShaderParameter(shader, glContext.COMPILE_STATUS)) {
        glContext.deleteShader(shader);
        return null;
      }

      return shader;
    };

    const vertexShader = createShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = createShader(gl, liquidFragSource, gl.FRAGMENT_SHADER);
    const program = gl.createProgram();

    if (!program || !vertexShader || !fragmentShader) {
      return;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      return;
    }

    const uniforms: Record<string, WebGLUniformLocation> = {};
    const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

    for (let i = 0; i < uniformCount; i += 1) {
      const uniformName = gl.getActiveUniform(program, i)?.name;
      if (!uniformName) continue;

      const location = gl.getUniformLocation(program, uniformName);
      if (location) {
        uniforms[uniformName] = location;
      }
    }

    uniformsRef.current = uniforms;

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const vertexBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    glRef.current = gl;
  }, []);

  const processImage = React.useCallback(async () => {
    const { imageData } = await parseLogoImage(imageUrl);
    imageDataRef.current = imageData;
  }, [imageUrl]);

  const cleanTexture = React.useCallback(async () => {
    const gl = glRef.current;
    const uniforms = uniformsRef.current;
    const imageData = imageDataRef.current;

    if (!gl || !imageData) {
      return undefined;
    }

    const existingTexture = gl.getParameter(gl.TEXTURE_BINDING_2D) as WebGLTexture | null;
    if (existingTexture) {
      gl.deleteTexture(existingTexture);
    }

    const imageTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, imageTexture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      imageData.width,
      imageData.height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      imageData.data,
    );

    if (uniforms.u_image_texture) {
      gl.uniform1i(uniforms.u_image_texture, 0);
    }

    return () => {
      if (imageTexture) {
        gl.deleteTexture(imageTexture);
      }
    };
  }, []);

  const render = React.useCallback(
    (currentTime: number) => {
      const deltaTime = currentTime - lastRenderTimeRef.current;
      lastRenderTimeRef.current = currentTime;

      totalAnimationTimeRef.current += deltaTime * speedRef.current;
      drawAtTime(totalAnimationTimeRef.current);

      animationFrameRef.current = requestAnimationFrame(render);
    },
    [drawAtTime],
  );

  const animate = React.useCallback(() => {
    lastRenderTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(render);
  }, [render]);

  React.useEffect(() => {
    let cancelled = false;

    const setup = async () => {
      setProcessing(true);

      try {
        await processImage();
        if (cancelled) return;

        initShader();
        updateUniforms();

        textureCleanupRef.current?.();
        textureCleanupRef.current = (await cleanTexture()) ?? null;
        if (cancelled) return;

        resizeCanvas();

        if (autoAnimate) {
          animate();
        } else {
          totalAnimationTimeRef.current = 0;
          drawAtTime(0);
        }
      } finally {
        if (!cancelled) {
          setProcessing(false);
        }
      }
    };

    setup();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      cancelled = true;
      window.removeEventListener('resize', resizeCanvas);

      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      textureCleanupRef.current?.();
      textureCleanupRef.current = null;
    };
  }, [animate, autoAnimate, cleanTexture, drawAtTime, initShader, processImage, resizeCanvas, updateUniforms]);

  React.useEffect(() => {
    updateUniforms();
  }, [updateUniforms]);

  React.useEffect(() => {
    if (!captureId) {
      return;
    }

    window.__liquidLogoCapture = {
      id: captureId,
      isReady: () => {
        const hasCanvas = Boolean(canvasRef.current);
        const hasGL = Boolean(glRef.current);
        const hasUniform = Boolean(uniformsRef.current.u_time);
        const hasImage = Boolean(imageDataRef.current);

        return hasCanvas && hasGL && hasUniform && hasImage;
      },
      renderAtMs: (elapsedMs: number) => {
        drawAtTime(elapsedMs * speedRef.current);
        return canvasRef.current?.toDataURL('image/png') ?? '';
      },
      size: () => ({
        width: canvasRef.current?.width ?? 0,
        height: canvasRef.current?.height ?? 0,
      }),
    };

    return () => {
      if (window.__liquidLogoCapture?.id === captureId) {
        delete window.__liquidLogoCapture;
      }
    };
  }, [captureId, drawAtTime]);

  return (
    <>
      {processing && showProcessing ? (
        <div className="text-primary/50 flex size-full items-center justify-center text-2xl font-bold">
          <span>Processing Logo</span>
        </div>
      ) : null}
      <canvas
        ref={canvasRef}
        className={cn('block size-full object-contain', className, processing ? 'hidden' : '')}
      />
    </>
  );
}

export { LiquidLogo, type LiquidLogoProps };
