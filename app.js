console.log("soundwalk starting...");

let canPlaySound = false;

document.getElementById('overlay').addEventListener('click', () => {
    canPlaySound = true;
    document.getElementById('overlay').style.display = 'none';
});

const map = L.map('map').setView([39.93382, 18.32412],22);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
   attribution: ' @ OpenStreetMap contributors',
}).addTo(map);

const zones = [
  { 
    center: [39.93385, 18.32410],
    radius: 100,
    file: 'sound1.wav',
    label: 'Time',
    color: '#2e6cff',
    type: 'human',
    howl: null,
    isInsideZone: false
  },
  {
    center: [39.933990, 18.32425],
    radius: 50,
    file: 'sound2.wav',
    label: 'Mimicry',
    color: '#ff6600',
    type: 'nature',
    howl: null,
    isInsideZone: false
  }
];

zones.forEach(zone => {
    L.circle(zone.center, {
        radius: zone.radius,
        color: 'transparent'
        weight: 0,
        fillColor: zone.color,
        fillOpacity: 0.5,
    })
    .bindPopup(`<b>${zone.label}</b>`) 
    .addTo(map);

    zone.howl = new Howl({
        src: [zone.file],
        loop: true,
        volume: 0
    });
});

let userMarker = null;


if ("geolocation" in navigator) {
    navigator.geolocation.watchPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            console.log("Geolocation position:", lat, lng);

            map.setView([lat, lng], 22);

            if (userMarker) {
                userMarker.setLatLng([lat, lng]);
            } else {
                userMarker = L.marker([lat, lng], {
                    icon: L.divIcon({
                        className: 'pulse-marker',
                        iconSize: [16, 16]
                    }),
                    interactive: false,
                }).addTo(map);
            }
        
        zones.forEach(zone => {
    const userPoint = turf.point([lng, lat]);
    const zonePoint = turf.point([zone.center[1], zone.center[0]]);
    const distance = turf.distance(userPoint, zonePoint, { units: 'meters' });

    if (canPlaySound && distance < zone.radius) {
        if (!zone.isInsideZone) {
            console.log(`Entered zone: ${zone.file}`);
            zone.isInsideZone = true;

            if (!zone.howl.playing()) {
                zone.howl.play();
            }

            zone.howl.fade(zone.howl.volume(), 1, 2000);
        }
    } else {
        if (zone.isInsideZone) {
            console.log(`Exited zone: ${zone.file}`);
            zone.isInsideZone = false;

            const currentVolume = zone.howl.volume();
            zone.howl.fade(currentVolume, 0, 2000);

            setTimeout(() => {
                if (!zone.isInsideZone) {
                    zone.howl.pause();
                    zone.howl.volume(1);
                }
              }, 2100);
                    }
                }
            });
        },
        (error) => {
            console.error("Geolocation error:", error);
        },
        {
            enableHighAccuracy: true,
            maximumAge: 1000
        }
    );
} else {
    alert("Geolocation is not supported by this browser.");
}
