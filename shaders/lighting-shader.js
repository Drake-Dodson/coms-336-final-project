// vertex shader for water
const vWaterShader = `
precision mediump float;

uniform vec4 lightPosition;
uniform vec4 direction;

varying vec3 fL;
varying vec3 fN;
varying vec3 fV;
varying vec2 textureCoords;

varying vec4 clipSpace;

const float tiling = 100.0;

void main() {

  vec4 positionEye = modelViewMatrix * vec4(position, 1.0);
  
  vec4 lightEye = viewMatrix * lightPosition;

  fL = (lightEye - positionEye).xyz;

  fN = normalMatrix * position;

  fV = normalize(-(position).xyz);

  clipSpace = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = clipSpace;
  textureCoords = vec2(uv.x/2.0 * 0.5, uv.y / 2.0 * 0.5)  * tiling;
}
`;

// fragment shader for water
const fWaterShader = `
precision mediump float;

uniform sampler2D reflectionTexture;
uniform sampler2D refractionTexture;
uniform sampler2D dudvMap;
uniform sampler2D normalMap;

uniform mat3 materialProperties;
uniform mat3 lightProperties;
uniform float shininess;
uniform float lightFocus;

uniform float moveFactor;

uniform vec3 fD;

varying vec3 fL;
varying vec3 fN;
varying vec3 fV;

varying vec2 textureCoords;

const float waveStrength = 0.02;

varying vec4 clipSpace;

void main()
{

  vec2 ndc = (clipSpace.xy/clipSpace.w)/2.0 + 0.5;
  vec2 reflectTexCoords = vec2(ndc.x, 1.0-ndc.y);
  vec2 refractTexCoords = vec2(ndc.x, ndc.y);

  vec2 distortedTexCoords = texture(dudvMap, vec2(textureCoords.x + moveFactor, textureCoords.y)).rg*0.1;
	distortedTexCoords = textureCoords + vec2(distortedTexCoords.x, distortedTexCoords.y+moveFactor);
	vec2 totalDistortion = (texture(dudvMap, distortedTexCoords).rg * 2.0 - 1.0) * waveStrength;

  refractTexCoords += totalDistortion;
  refractTexCoords = clamp(refractTexCoords, 0.001, 0.999);
  
  reflectTexCoords += totalDistortion;
  // reflectTexCoords.x = clamp(refractTexCoords.x, 0.001, 0.999);
  // reflectTexCoords.y = clamp(refractTexCoords.y, 0.001, 0.999);
  


  //grab the colors from the reflection and refraction textures and mix them to get the color of the water
  vec4 refColor = texture2D(reflectionTexture, reflectTexCoords);
  vec4 fracColor = texture2D(refractionTexture, refractTexCoords);

  vec4 normalMapColor = texture(normalMap, distortedTexCoords);
  vec3 normal = vec3(normalMapColor.r * 2.0 - 1.0, normalMapColor.b, normalMapColor.g * 2.0 - 1.0);

  vec3 N = normalize(normal);
  vec3 L = normalize(fL);
  vec3 V = normalize(fV);

  vec3 R = reflect(-L, N);

  vec4 waterSurface = mix(refColor, fracColor, 0.5);

  //increases the green value of the surface 
  // waterSurface = vec4(waterSurface.x, waterSurface.y, waterSurface.z + 0.05,  1.0);

  vec4 ambientSurface = vec4(materialProperties[0], 1.0);
  vec4 diffuseSurface = vec4(materialProperties[1], 1.0);
  vec4 specularSurface = vec4(materialProperties[2], 1.0);

  vec4 ambientLight = vec4(lightProperties[0], 1.0);
  vec4 diffuseLight = vec4(lightProperties[1], 1.0);
  vec4 specularLight = vec4(lightProperties[2], 1.0);

  float m = waterSurface.a;
  ambientSurface = (1.0 - m) * ambientSurface + m * waterSurface;
  diffuseSurface = (1.0 - m) * diffuseSurface + m * waterSurface;
  specularSurface = (1.0 - m) * specularSurface + m * waterSurface;

  float diffuseFactor = max(0.0, dot(L, N));

  float specularFactor = pow(max(0.0, dot(V, R)), shininess);

  vec4 ambient = ambientLight * ambientSurface;
  vec4 diffuse = diffuseFactor * diffuseLight * diffuseSurface;
  vec4 specular = specularFactor * specularLight * specularSurface;
  
  gl_FragColor = ambient + diffuse + specular;
  //gl_FragColor = waterSurface;
  gl_FragColor.a = 1.0;
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