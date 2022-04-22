# 367-Term-Project
Josh Knibbe\
4/21/2022

## Instructions
This project is currently hosted on github pages.\
You can run it at the following link: [Go To Project](https://jkknibbe99.github.io/367-Term-Project/)\
If you would like to run this on your own machine, download the code zip file from [Github](https://github.com/jkknibbe99/367-Term-Project)\
I have found that the easiest way to run it locally is on Visual Studio Code using Ritwick Dey's "Live Server" extension.

## Summary
This Project was created using a combination of Blender and Three.js.\
Blender was used to create the boat model, as well as the island terrain. The island terrain specifically used the TXA ANT Landscape addon to create noise generated terrain and textures. All these models were then exported as gltf's and imported into the Three.js script using a GLTFLoader module.\
The water, sky, and sun were created using Three.js shaders and waternormals.\
The UI was created using basic HTML and CSS.

## Controls
### Viewing Controls
When in View mode, you can orbit the scene by holding down the left mouse button. To pan, hold down the right mouse button. To zoom in and out, use the scroll wheel.
### Boat Controls
When in Drive mode, you can increase the throttle using the 'W' or up arrow key and you can decrease throttle using the 'S' or down arrow key.
Steer left and right using 'A' and 'D' respectively. The left and right arrow keys work as well.

## Future Work
This project is still a work on progress. There are a few items that I would like to eventually see implemented.
- Boat/Land Collision
- Map boundaries
- More realistic boat acceleration and turning physics
- Waves
- Boat motor and person models
- More realistic nightime shaders
