# webgl ocean

demo: https://youtu.be/QWyzJpj3o-4
[![Watch the demo](https://img.youtube.com/vi/QWyzJpj3o-4/maxresdefault.jpg)](https://youtu.be/QWyzJpj3o-4)

presentation: https://docs.google.com/presentation/d/191-s38ZqngLdXMKwgxefm_NvkjEgMfr3Q5YsW5ctb1M/edit?usp=sharing

This was our final project for COM S 336 at ISU. For this, we made a realistic ocean in WebGl, using other extensions like THREE.JS (of course, excluding the THREE.JS water module - our project was to make the water). We included an island model from https://sketchfab.com/3d-models/lowpoly-island-26c3f2f271ab41a5a0c9178ac5304df8 to make it more fun to look at (and to have more interesting reflections and things to deal with). We implemented a variety of effects, including Normal maps, DUDV maps, the fresnel effect, and more. Most of the objects use THREE.JS to display themselves, but the water uses an entirely custom shader rigged to a custom THREE.JS material. Watch the demo to see what the final iteration looks like, and the pesentation to see exactly what we did.
