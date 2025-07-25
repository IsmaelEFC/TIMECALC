Autodesfase
Autodesfase is a Progressive Web App (PWA) designed to capture photos with official Chile time (CLT/CLST) and GPS coordinates, storing them locally using IndexedDB. It supports offline use and is installable on mobile devices.
Features

Capture photos with the rear camera.
Record official Chile time and GPS coordinates.
Store captures locally in IndexedDB.
View capture history with a modal showing details and Google Maps links.
Offline support via service worker.
Responsive design with light/dark mode.

Setup

Clone the repository:git clone https://github.com/your-username/autodesfase.git
cd autodesfase


Create icons (icons/icon-192x192.png, icons/icon-512x512.png) using a tool like Favicon.io.
Serve locally with HTTPS (required for camera access and service worker):npx http-server -S -C cert.pem -K key.pem

To generate cert.pem and key.pem:openssl req -x509 -newkey rsa:2048 -nodes -days 365 -keyout key.pem -out cert.pem

Then access at https://localhost:8080.
Deploy to GitHub Pages:
Push the repository to GitHub.
Enable GitHub Pages in the repository settings, selecting the main branch and / (root) folder.
Access the app at https://your-username.github.io/autodesfase.



Usage

Open in a mobile browser (Chrome/Safari).
Grant camera and location permissions.
Tap "Capturar" to take a photo.
View captures in the "Historial" tab.
Tap a capture to see details or view its location on Google Maps.

Requirements

Modern browser (Chrome, Safari, Firefox).
HTTPS for camera access (use https://localhost:8080 locally or GitHub Pages).
Device with camera and GPS.

License
Open source under the MIT License.