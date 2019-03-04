// Pass 3 fragment shader
//
// Output fragment colour based using
//    (a) Cel shaded diffuse surface
//    (b) wide silhouette in black

#version 300 es

uniform mediump vec3 lightDir;     // direction toward the light in the VCS
uniform mediump vec2 texCoordInc;  // texture coord difference between adjacent texels

in mediump vec2 texCoords;              // texture coordinates at this fragment

// The following four textures are now available and can be sampled
// using 'texCoords'

uniform sampler2D colourSampler;
uniform sampler2D normalSampler;
uniform sampler2D depthSampler;
uniform sampler2D laplacianSampler;

out mediump vec4 outputColour;          // the output fragment colour as RGBA with A=1


void main()

{
  // [0 marks] Look up values for the depth and Laplacian.  Use only
  // the R component of the texture as texture2D( ... ).r

  // YOUR CODE HERE

  mediump float depth = texture2D( depthSampler, texCoords).r;
  mediump float Laplacian = texture2D( laplacianSampler, texCoords).r;

  // [1 mark] Discard the fragment if it is a background pixel not
  // near the silhouette of the object.

  // YOUR CODE HERE

  if (depth == 1.0)
    discard;
  
  // [0 marks] Look up value for the colour and normal.  Use the RGB
  // components of the texture as texture2D( ... ).rgb or texture2D( ... ).xyz.

  // YOUR CODE HERE

  mediump vec3 colour = texture2D(colourSampler, texCoords).rgb;
  mediump vec3 normal = texture2D(normalSampler, texCoords).xyz;

  // [2 marks] Compute Cel shading, in which the diffusely shaded
  // colour is quantized into four possible values.  Do not allow the
  // diffuse component, N dot L, to be below 0.2.  That will provide
  // some ambient shading.  Your code should use the 'numQuata' below
  // to have that many divisions of quanta of colour.  Your code
  // should be very efficient.

  const int numQuanta = 3;

  // YOUR CODE HERE

  mediump float NdotL = dot( normalize(normal), lightDir );
  
  if (NdotL < 0.2)
    NdotL = 0.2;

  NdotL = round(float(numQuanta + 1) * NdotL) / 4.0;
  colour = NdotL * colour;
  
  
  // [2 marks] Count number of fragments in the 3x3 neighbourhood of
  // this fragment with a Laplacian that is less than -0.1.  These are
  // the edge fragments.  Your code should use the 'kernelRadius'
  // below and check all fragments in the range
  //
  //    [-kernelRadius,+kernelRadius] x [-kernelRadius,+kernelRadius]
  //
  // around this fragment.

  const int kernelRadius = 1;
  mediump int count = 0;

  for(mediump int i = -kernelRadius; i<kernelRadius; i++){
    for(mediump int j = -kernelRadius; j<kernelRadius; j++){
      if(texture2D( 
          laplacianSampler, vec2((texCoords.x + float(i)*texCoordInc.x), (texCoords.y + float(j)*texCoordInc.y))
        ).x < -0.1
      )
        count++;
    }
  }

  // YOUR CODE HERE

  // [0 marks] Output the fragment colour.  If there is an edge
  // fragment in the 3x3 neighbourhood of this fragment, output a
  // black colour.  Otherwise, output the cel-shaded colour.
  //
  // Since we're making this black is there is any edge in the 3x3
  // neighbourhood of the fragment, the silhouette will be wider
  // than if we test only the fragment.

  // YOUR CODE HERE

  if(count > 0)
    outputColour = vec4(0.0, 0.0, 0.0, 1.0);
  else
    outputColour = vec4( colour, 1.0 );
}
