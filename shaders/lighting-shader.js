// vertex shader for water
const vWaterShader = `
varying vec4 clipSpace;
void main() {
  clipSpace = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = clipSpace;
}
`;

// fragment shader for water
const fWaterShader = `
precision mediump float;
uniform sampler2D reflectionTexture;
uniform sampler2D refractionTexture;
varying vec4 clipSpace;
void main()
{
  vec2 ndc = (clipSpace.xy/clipSpace.w)/2.0 + 0.5;
  vec2 reflectTexCoords = vec2(ndc.x, 1.0-ndc.y);
  vec2 refractTexCoords = vec2(ndc.x, ndc.y);
  //grab the colors from the reflection and refraction textures and mix them to get the color of the water
  vec4 refColor = texture2D(reflectionTexture, reflectTexCoords);
  vec4 fracColor = texture2D(refractionTexture, refractTexCoords);
  gl_FragColor = mix(refColor, fracColor, 0.5);
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