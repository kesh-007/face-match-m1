const compareFaces = async (image1, image2) => {
    const response = await fetch('http://localhost:3000/compare', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image1: image1,
        image2: image2,
      }),
    });
  
    const data = await response.json();
    console.log(data); 
  };
  

  const compareFaces2 = async (image1) => {
    const response = await fetch('http://localhost:3000/detect-and-compare', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image1: image1,
      }),
    });
  
    const data = await response.json();
    console.log(data); 
  };
  


  compareFaces('data/1.jpg','data/girl.jpg');
  