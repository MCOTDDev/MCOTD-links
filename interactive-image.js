document.addEventListener('scroll', () => {
    const screenImage = document.querySelector('.interactive-image img');
    const imageContainer = document.querySelector('.interactive-image');

    // Get the distance from the top of the viewport to the top and bottom of the image
    const imageTop = imageContainer.getBoundingClientRect().top;
    const imageBottom = imageContainer.getBoundingClientRect().bottom;

    // Define the start and end points for rotation
    const windowHeight = window.innerHeight;
    const startScroll = windowHeight * 0.2; // Start leaning when image top is visible near the bottom of viewport
    const endScroll = windowHeight * 0.6; // Stop leaning when the image reaches the middle of the viewport

    // Check if the image is within the scroll range
    if (imageBottom >= startScroll && imageTop <= endScroll) {
        // Map the scroll position to a rotation value
        let progress = (endScroll - imageTop) / (endScroll - startScroll); // Normalized progress (0 to 1)
        progress = Math.max(Math.min(progress, 1), 0); // Clamp progress between 0 and 1

        // Calculate the rotation based on progress
        const maxTilt = 30; // Maximum tilt angle
        const rotation = maxTilt - progress * maxTilt; // Start leaned back and straighten as you scroll

        // Apply the calculated rotation to the image
        screenImage.style.transform = `rotateX(${rotation}deg)`;
    }
});
