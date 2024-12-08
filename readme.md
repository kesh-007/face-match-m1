# Face Comparison and Detection API

This API allows you to detect faces in images and compare them based on face descriptors. It uses TensorFlow.js and `face-api.js` to perform face recognition and compare distances between facial descriptors to check if two faces are similar.

## Endpoints

### 1. `POST /compare`
Compares two images and returns the distance between the faces with matching message.

#### Request Body:
- `image1`: The URI or path to the first image (base64 encoded or URL).
- `image2`: The URI or path to the second image (base64 encoded or URL).

#### Example Request:
```json
{
  "image1": "path_to_image1.jpg",
  "image2": "path_to_image2.jpg"
}
```
### Response
```json
{
  "distance": 0.4,
  "message": "Match found"
}
```
