import { Injectable } from '@nestjs/common';

@Injectable()
export class Config {
  public readonly ose = {
    endpoints: [
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-appinstallservice/',
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-bootmanager/',
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-media/',
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-notification/',
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-service-activitymanager/',
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-service-ai-voice/',
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-service-alarm/',
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-service-applicationmanager/',
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-service-audio/',
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-service-audiofocusmanager/',
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-service-audiooutput/',
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-service-bluetooth2/',
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-service-bugreport/',
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-service-camera2/',
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-service-cec/',
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-service-config/',
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-service-configurator/',
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-service-connectionmanager/',
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-service-contextintentmgr/',
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-service-db/',
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-service-devmode/',
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-service-downloadmanager/',
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-service-filecache/',
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-service-hfp/',
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-service-intent/',
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-service-location/',
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-service-mediacontroller/',
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-service-mediaindexer/',
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-service-memorymanager/',
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-service-nettools/',
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-service-pdm/',
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-service-peripheralmanager/',
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-service-power2/',
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-service-preferences/',
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-service-rosbridge/',
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-service-settings/',
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-service-sleep/',
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-service-storageaccess/',
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-service-swupdater/',
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-service-systemservice/',
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-service-tempdb/',
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-service-tts/',
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-service-unifiedsearch/',
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-service-uwb/',
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-service-webappmanager/',
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-service-wifi/',
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-surfacemanager/',
    ],
  };

  public readonly lg = {
    endpoints: [
      'https://webostv.developer.lge.com/api/webos-service-api/activity-manager/',
      'https://webostv.developer.lge.com/api/webos-service-api/application-manager/',
      'https://webostv.developer.lge.com/api/webos-service-api/audio/',
      'https://webostv.developer.lge.com/api/webos-service-api/camera/',
      'https://webostv.developer.lge.com/api/webos-service-api/connection-manager/',
      'https://webostv.developer.lge.com/api/webos-service-api/db/',
      'https://webostv.developer.lge.com/api/webos-service-api/device-unique-id/',
      'https://webostv.developer.lge.com/api/webos-service-api/drm/',
      'https://webostv.developer.lge.com/api/webos-service-api/magic-remote/',
      'https://webostv.developer.lge.com/api/webos-service-api/media-database/',
      'https://webostv.developer.lge.com/api/webos-service-api/settings-service/',
      'https://webostv.developer.lge.com/api/webos-service-api/system-service/',
      'https://webostv.developer.lge.com/api/webos-service-api/tv-device-information/',
    ],
  };
}
