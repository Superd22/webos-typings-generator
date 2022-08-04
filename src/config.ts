import { Injectable } from '@nestjs/common';

@Injectable()
export class Config {
  public readonly ose = {
    endpoints: [
      'https://www.webosose.org/docs/reference/ls2-api/com-webos-service-bluetooth2',
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
