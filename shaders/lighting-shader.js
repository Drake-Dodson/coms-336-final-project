// vertex shader for lighting
const vWaterShader = `

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// fragment shader for lighting
const fWaterShader = `

void main() {
  gl_FragColor = vec4( 0.0, 0.0, 1.0, 1.0 );
}
`;

const vSkyboxShader = `

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fSkyboxShader = `
uniform vec3 color;

void main() {
  gl_FragColor = vec4(color, 1.0);
}
`