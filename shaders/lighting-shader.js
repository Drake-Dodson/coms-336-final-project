// vertex shader for water
const vWaterShader = `
precision mediump float;

uniform vec4 lightPosition;
uniform vec4 direction;
uniform vec3 cameraPos;

varying vec3 fL;
varying vec3 fN;
varying vec3 fV;
varying vec2 textureCoords;
varying vec3 toCameraVector;
varying vec4 clipSpace;

const float tiling = 100.0;

void main() {
  vec4 positionEye = modelViewMatrix * vec4(position, 1.0);
  vec4 lightEye = viewMatrix * lightPosition;

  fL = (lightEye - positionEye).xyz;
  fN = normalMatrix * position;
  fV = normalize(-(position).xyz);
  
  toCameraVector = cameraPos - positionEye.xyz;
  clipSpace = projectionMatrix * positionEye;
  gl_Position = clipSpace;
  textureCoords = vec2(uv.x/2.0 * 0.5, uv.y / 2.0 * 0.5)  * tiling;
}
`;

// fragment shader for water
const fWaterShader = `
precision mediump float;

//textures and maps
uniform sampler2D reflectionTexture;
uniform sampler2D refractionTexture;
uniform sampler2D dudvMap;
uniform sampler2D normalMap;
uniform sampler2D depthMap;

//light properties
uniform mat3 lightProperties;
uniform float shininess;
uniform float lightFocus;
uniform float reflectionFactor;
uniform float moveFactor;
uniform vec3 fD;

//varying properties
varying vec3 fL;
varying vec3 fN;
varying vec3 fV;
varying vec3 toCameraVector; 
varying vec2 textureCoords;
varying vec4 clipSpace;

//consts
const float waveStrength = 0.02;

void main() {
//reflection and refraction tex coords
  vec2 ndc = (clipSpace.xy/clipSpace.w)/2.0 + 0.5;
  vec2 reflectTexCoords = vec2(ndc.x, -ndc.y);
  vec2 refractTexCoords = vec2(ndc.x, ndc.y);

//soft texturing
  float depth = texture(depthMap, refractTexCoords).r;
  float far = 10000.0;
  float near = 0.1;
  float floorDistance = 2.0 * near * far / (far + near - (2.0 * depth - 1.0) * (far - near));
  depth = -gl_FragCoord.z;
  float waterDistance = 2.0 * near * far / (far + near - (2.0 * depth - 1.0) * (far - near));
  float waterDepth = floorDistance - waterDistance;
  
//dudv distortion
  vec2 distortedTexCoords = texture(dudvMap, vec2(textureCoords.x + moveFactor, textureCoords.y)).rg*0.1;
  distortedTexCoords = textureCoords + vec2(distortedTexCoords.x, distortedTexCoords.y+moveFactor);
  vec2 totalDistortion = (texture(dudvMap, distortedTexCoords).rg * 2.0 - 1.0) * waveStrength;

  refractTexCoords += totalDistortion;
  refractTexCoords = clamp(refractTexCoords, 0.001, 0.999);
  
  reflectTexCoords += totalDistortion;
  reflectTexCoords.x = clamp(reflectTexCoords.x, 0.001, 0.999);
  reflectTexCoords.y = clamp(reflectTexCoords.y, -0.999, -0.001);
  
//normal map
  vec4 normalMapColor = texture(normalMap, distortedTexCoords);
  vec3 normal = vec3(normalMapColor.r, normalMapColor.b, normalMapColor.g);
  vec3 N = normalize(normal);

//fresnel effect
  vec3 viewVector = normalize(toCameraVector);
  float refractiveFactor = dot(viewVector, vec3(0.0, 1.0, 0.0));
  refractiveFactor = pow(refractiveFactor, 1.0);
  
//grab the colors from the reflection and refraction textures and mix them
  vec4 refColor = texture2D(reflectionTexture, reflectTexCoords);
  vec4 fracColor = texture2D(refractionTexture, refractTexCoords);
  vec4 waterSurface = mix(refColor, fracColor, refractiveFactor);

//increases the green value of the surface to give distinction between sky and water
  waterSurface = vec4(waterSurface.x, waterSurface.y + 0.10, waterSurface.z,  1.0);

//basic lighting
  vec3 L = normalize(fL);
  vec3 V = normalize(fV);
  vec3 R = reflect(-L, N);

  vec4 ambientLight = vec4(lightProperties[0], 1.0);
  vec4 diffuseLight = vec4(lightProperties[1], 1.0);
  vec4 specularLight = vec4(lightProperties[2], 1.0);

  float diffuseFactor = max(0.0, dot(L, N));
  float specularFactor = pow(max(0.0, dot(V, R)), shininess);

  vec4 ambient = ambientLight * waterSurface;
  vec4 diffuse = diffuseFactor * diffuseLight * waterSurface;
  vec4 specular = specularFactor * specularLight * waterSurface;
  
  gl_FragColor = ambient + diffuse + specular;
  gl_FragColor.a = 1.0;
  
//experimentation for soft edges
   // gl_FragColor = waterSurface;
 //gl_FragColor.a = clamp(waterDepth / 5.0, 0.0, 1.0);
// gl_FragColor.a = waterDepth + 100.0;
// gl_FragColor = vec4(waterDepth/50.0);
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