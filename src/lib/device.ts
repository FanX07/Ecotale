import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';

export async function captureObservationPhoto() {
  return Camera.getPhoto({
    quality: 85,
    allowEditing: false,
    resultType: CameraResultType.Uri,
    source: CameraSource.Prompt
  });
}

export async function getObservationLocation() {
  const permission = await Geolocation.requestPermissions();
  if (permission.location !== 'granted' && permission.coarseLocation !== 'granted') {
    throw new Error('Location permission was not granted.');
  }
  const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15_000 });
  return { latitude: position.coords.latitude, longitude: position.coords.longitude };
}
