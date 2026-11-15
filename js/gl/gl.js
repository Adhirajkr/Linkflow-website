// Tiny WebGL2 renderer: lit metal meshes, textured screens, additive glow points.
import { buildTube } from './geo.js';

const VS_MESH = `#version 300 es
layout(location=0) in vec3 aP; layout(location=1) in vec3 aN; layout(location=2) in vec2 aUV;
uniform mat4 uVP, uM; out vec3 vW; out vec3 vN; out vec2 vUV;
void main(){ vec4 w=uM*vec4(aP,1.); vW=w.xyz; vN=mat3(uM)*aN; vUV=aUV; gl_Position=uVP*w; }`;

const FS_LIT = `#version 300 es
precision highp float;
in vec3 vW; in vec3 vN; uniform vec3 uCam, uC, uEm; uniform float uMetal, uRough, uA; out vec4 o;
vec3 envc(vec3 r,float w){
  float y=r.y*.5+.5;
  vec3 c=mix(vec3(.02,.035,.07),vec3(.08,.14,.24),y);
  c+=vec3(.85,.92,1.)*smoothstep(.5-w,.92,r.y)*1.0;
  c+=vec3(.08,.72,.85)*smoothstep(.25-w,.8,r.x)*1.25;
  c+=vec3(.5,.35,.95)*smoothstep(.25-w,.8,-r.x)*1.1;
  c+=vec3(.9,.95,1.)*smoothstep(.75-w,.97,r.z)*.4;
  return c; }
void main(){
  vec3 N=normalize(vN),V=normalize(uCam-vW),R=reflect(-V,N);
  float fr=pow(1.-clamp(dot(N,V),0.,1.),3.);
  float df=max(dot(N,normalize(vec3(.4,.9,.6))),0.);
  float d2=max(dot(N,normalize(vec3(-.8,.2,.5))),0.);
  vec3 base=uC*(.2+.6*df)+vec3(.5,.35,.95)*uC*.3*d2;
  vec3 refl=envc(R,uRough*.35)*mix(vec3(1.),uC*5.,.45);
  vec3 col=base*(1.-uMetal*.45)+refl*(uMetal*.5+fr*.45)+uEm;
  o=vec4(col*uA,uA); }`;

const FS_TEX = `#version 300 es
precision highp float;
in vec2 vUV; uniform sampler2D uT; uniform vec4 uTint; uniform float uSheen; out vec4 o;
void main(){
  vec4 t=texture(uT,vUV); float a=t.a*uTint.a; if(a<.01) discard;
  vec3 c=t.rgb*uTint.rgb;
  c+=vec3(.7,.9,1.)*uSheen*pow(max(0.,1.-abs(vUV.x*.8+vUV.y*.9-.95-uSheen*.6+.3)*3.2),3.)*.07;
  o=vec4(c*a,a); }`;

const VS_PTS = `#version 300 es
layout(location=0) in vec3 aP; layout(location=1) in vec4 aC; layout(location=2) in float aS;
uniform mat4 uVP, uM; uniform float uPx; out vec4 vC;
void main(){ vec4 p=uVP*(uM*vec4(aP,1.)); gl_Position=p; gl_PointSize=max(1.,aS*uPx/p.w); vC=aC; }`;
const FS_PTS = `#version 300 es
precision highp float; in vec4 vC; out vec4 o;
void main(){ float r=length(gl_PointCoord-.5)*2.; float a=clamp(1.-r,0.,1.); a*=a; o=vec4(vC.rgb*vC.a*a,vC.a*a); }`;

function compile(gl, vs, fs) {
  const mk = (t, s) => { const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)); return sh; };
  const p = gl.createProgram();
  gl.attachShader(p, mk(gl.VERTEX_SHADER, vs)); gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  const u = {};
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) { const nm = gl.getActiveUniform(p, i).name; u[nm] = gl.getUniformLocation(p, nm); }
  return { p, u };
}

export class GL {
  constructor(canvas) {
    const gl = canvas.getContext('webgl2', { alpha: true, antialias: true, premultipliedAlpha: true, powerPreference: 'high-performance' });
    if (!gl) throw new Error('WebGL2 unavailable');
    this.gl = gl; this.canvas = canvas;
    this.lit = compile(gl, VS_MESH, FS_LIT);
    this.tx = compile(gl, VS_MESH, FS_TEX);
    this.pts = compile(gl, VS_PTS, FS_PTS);
    this.aniso = gl.getExtension('EXT_texture_filter_anisotropic');
    this.VP = null; this.cam = [0, 0, 13]; this.dpr = 1;
    // dynamic point buffer
    this.ptsVAO = gl.createVertexArray(); this.ptsBuf = gl.createBuffer();
    gl.bindVertexArray(this.ptsVAO); gl.bindBuffer(gl.ARRAY_BUFFER, this.ptsBuf);
    gl.bufferData(gl.ARRAY_BUFFER, 4096 * 8 * 4, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 32, 0);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 32, 12);
    gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 1, gl.FLOAT, false, 32, 28);
    // dynamic tube mesh
    this.tube = { v: new Float32Array(80 * 10 * 8), i: new Uint16Array(79 * 10 * 6) };
    this.tubeMesh = this._dyn(this.tube.v.byteLength, this.tube.i.byteLength);
    gl.bindVertexArray(null);
  }
  _dyn(vb, ib) {
    const gl = this.gl, vao = gl.createVertexArray(), vbo = gl.createBuffer(), ibo = gl.createBuffer();
    gl.bindVertexArray(vao); gl.bindBuffer(gl.ARRAY_BUFFER, vbo); gl.bufferData(gl.ARRAY_BUFFER, vb, gl.DYNAMIC_DRAW);
    this._attrs(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, ib, gl.DYNAMIC_DRAW);
    gl.bindVertexArray(null);
    return { vao, vbo, ibo, count: 0 };
  }
  _attrs() {
    const gl = this.gl;
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 32, 0);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 32, 12);
    gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 32, 24);
  }
  mesh(g) {
    const gl = this.gl, n = g.pos.length / 3, v = new Float32Array(n * 8);
    for (let i = 0; i < n; i++) v.set([g.pos[i * 3], g.pos[i * 3 + 1], g.pos[i * 3 + 2], g.nor[i * 3], g.nor[i * 3 + 1], g.nor[i * 3 + 2], g.uv[i * 2], g.uv[i * 2 + 1]], i * 8);
    const m = this._dyn(v.byteLength, g.idx.length * 2);
    gl.bindVertexArray(m.vao); gl.bindBuffer(gl.ARRAY_BUFFER, m.vbo); gl.bufferData(gl.ARRAY_BUFFER, v, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m.ibo); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(g.idx), gl.STATIC_DRAW);
    gl.bindVertexArray(null); m.count = g.idx.length;
    return m;
  }
  texture(canvas) {
    const gl = this.gl, t = gl.createTexture(), self = this;
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    if (this.aniso) gl.texParameterf(gl.TEXTURE_2D, this.aniso.TEXTURE_MAX_ANISOTROPY_EXT, 4);
    const tex = { t, update() {
      gl.bindTexture(gl.TEXTURE_2D, t); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas); gl.generateMipmap(gl.TEXTURE_2D);
    } };
    tex.update();
    return tex;
  }
  resize(w, h, dpr) {
    const c = this.canvas; this.dpr = dpr;
    c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
    this.gl.viewport(0, 0, c.width, c.height);
  }
  begin() {
    const gl = this.gl;
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.disable(gl.CULL_FACE);
  }
  opaque() { const gl = this.gl; gl.disable(gl.BLEND); gl.depthMask(true); }
  alpha() { const gl = this.gl; gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(true); }
  additive() { const gl = this.gl; gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE); gl.depthMask(false); }
  drawLit(m, M, o = {}) {
    const gl = this.gl, P = this.lit;
    gl.useProgram(P.p);
    gl.uniformMatrix4fv(P.u.uVP, false, this.VP); gl.uniformMatrix4fv(P.u.uM, false, M);
    gl.uniform3fv(P.u.uCam, this.cam); gl.uniform3fv(P.u.uC, o.c || [0.1, 0.14, 0.2]);
    gl.uniform3fv(P.u.uEm, o.em || [0, 0, 0]);
    gl.uniform1f(P.u.uMetal, o.metal ?? 0.8); gl.uniform1f(P.u.uRough, o.rough ?? 0.4); gl.uniform1f(P.u.uA, o.a ?? 1);
    gl.bindVertexArray(m.vao); gl.drawElements(gl.TRIANGLES, m.count, gl.UNSIGNED_SHORT, 0);
  }
  drawTex(m, M, tex, o = {}) {
    const gl = this.gl, P = this.tx;
    gl.useProgram(P.p);
    gl.uniformMatrix4fv(P.u.uVP, false, this.VP); gl.uniformMatrix4fv(P.u.uM, false, M);
    const t = o.tint || [1, 1, 1, 1];
    gl.uniform4f(P.u.uTint, t[0], t[1], t[2], t[3] ?? 1); gl.uniform1f(P.u.uSheen, o.sheen || 0);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex.t); gl.uniform1i(P.u.uT, 0);
    gl.bindVertexArray(m.vao); gl.drawElements(gl.TRIANGLES, m.count, gl.UNSIGNED_SHORT, 0);
  }
  // pts: Float32Array of [x,y,z,r,g,b,a,size]*n
  drawPoints(data, n, M) {
    if (!n) return;
    const gl = this.gl, P = this.pts;
    gl.useProgram(P.p);
    gl.uniformMatrix4fv(P.u.uVP, false, this.VP); gl.uniformMatrix4fv(P.u.uM, false, M);
    gl.uniform1f(P.u.uPx, this.canvas.height * 0.5 / Math.tan(this.fov / 2) * 0.01);
    gl.bindVertexArray(this.ptsVAO); gl.bindBuffer(gl.ARRAY_BUFFER, this.ptsBuf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, data, 0, n * 8);
    gl.drawArrays(gl.POINTS, 0, n);
  }
  drawTube(points, r, sides, M, o) {
    const m = this.tubeMesh, gl = this.gl;
    m.count = buildTube(points, r, sides, this.tube);
    gl.bindVertexArray(m.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, m.vbo); gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.tube.v, 0, points.length * sides * 8);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m.ibo); gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, this.tube.i, 0, m.count);
    this.drawLit(m, M, o);
  }
}
