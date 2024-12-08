const express = require('express');
const path = require('path');
const faceapi = require('face-api.js');
const canvas = require('canvas');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

faceapi.env.monkeyPatch({ Canvas: canvas.Canvas, Image: canvas.Image, ImageData: canvas.ImageData });

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); 

// Load models
async function loadModels() {
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(path.join(__dirname, 'models'));
  await faceapi.nets.faceLandmark68Net.loadFromDisk(path.join(__dirname, 'models'));
  await faceapi.nets.faceRecognitionNet.loadFromDisk(path.join(__dirname, 'models'));
  console.log('Models loaded');
}

loadModels();

async function compareFaces(image1, image2) {
  const img1 = await canvas.loadImage(image1);
  const img2 = await canvas.loadImage(image2);

  const descriptor1 = await faceapi.computeFaceDescriptor(img1);
  const descriptor2 = await faceapi.computeFaceDescriptor(img2);

  return faceapi.utils.round(faceapi.euclideanDistance(descriptor1, descriptor2));
}

app.post('/compare', async (req, res) => {
  const { image1, image2 } = req.body;

  try {
    const distance = await compareFaces(image1, image2);
    if (distance < 0.45) {
       res.json({ distance, message: 'Match found!' });
    }
  else {
    res.json({ distance,message: 'Match not found!' });

  }  
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing images');
  }
});

app.post('/detect-and-compare', async (req, res) => {
  const { imageToCompare } = req.body; 

  try {
    const newImage = await canvas.loadImage(imageToCompare);
    
    const detections = await faceapi.detectAllFaces(newImage).withFaceLandmarks().withFaceDescriptors();

    if (detections.length === 0) {
      return res.status(400).send('No faces detected in the uploaded image');
    }

    const storedImagesDir = path.join(__dirname, 'data');
    const files = fs.readdirSync(storedImagesDir);
    
    let bestMatch = { image: null, distance: Infinity };

    for (let file of files) {
      const storedImagePath = path.join(storedImagesDir, file);
      const storedImage = await canvas.loadImage(storedImagePath);
      const storedDescriptor = await faceapi.computeFaceDescriptor(storedImage);

      const distance = faceapi.utils.round(faceapi.euclideanDistance(detections[0].descriptor, storedDescriptor));

      if (distance < bestMatch.distance) {
        bestMatch = { image: file, distance };
      }
    }

    if (bestMatch.distance < 0.6) {
      res.json({
        match: bestMatch.image,
        distance: bestMatch.distance,
        message: 'Match found!'
      });
    } else {
      res.json({
        match: null,
        distance: bestMatch.distance,
        message: 'No match found'
      });
    }

  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing images');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
