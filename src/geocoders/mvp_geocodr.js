import L from 'leaflet';
import { getJSON } from '../util';

export default {
  class: L.Class.extend({
    options: {
      serviceUrl: 'http://your-server.com:8080/',
      nameProperties: ['_title_'],
      geocodingQueryParams: {},
      reverseQueryParams: {}
    },

    initialize: function(key, options) {
      L.setOptions(this, options);
      this._key = key;
    },

    geocode: function(query, cb, context) {
      var params = L.extend(
        {
          type: 'search',
          api_key: this._key,
          query: query
        },
        this.options.geocodingQueryParams
      );

      getJSON(
        this.options.serviceUrl,
        params,
        L.bind(function(data) {
          cb.call(context, this._decodeFeatures(data));
        }, this)
      );
    },

    suggest: function(query, cb, context) {
      return this.geocode(query, cb, context);
    },

    reverse: function(latLng, scale, cb, context) {
      var params = L.extend(
        {
          type: 'reverse',
          api_key: this._key,
          lat: latLng.lat,
          lon: latLng.lng,
        },
        this.options.reverseQueryParams
      );

      getJSON(
        this.options.serviceUrl,
        params,
        L.bind(function(data) {
          cb.call(context, this._decodeFeatures(data));
        }, this)
      );
    },

    _decodeFeatures: function(data) {
      var results = [],
        i,
        f,
        c,
        latLng,
        extent,
        bbox;

      if (data && data.features) {
        for (i = 0; i < data.features.length; i++) {
          f = data.features[i];
          c = f.geometry.coordinates;
          if (typeof(c[0]) === 'number') {
            latLng = L.latLng(c[1], c[0]);
          } else {
            latLng = L.latLng(c[0][0][1], c[0][0][0]);
            continue;
          }
          bbox = L.latLngBounds(latLng, latLng);

          results.push({
            name: this._deocodeFeatureName(f),
            html: this.options.htmlTemplate ? this.options.htmlTemplate(f) : undefined,
            center: latLng,
            bbox: bbox,
            properties: f.properties
          });
        }
      }

      return results;
    },

    _deocodeFeatureName: function(f) {
      var j, name;
      for (j = 0; !name && j < this.options.nameProperties.length; j++) {
        name = f.properties[this.options.nameProperties[j]];
      }

      return name;
    }
  }),

  factory: function(key, options) {
    return new L.Control.Geocoder.MVPGeocodr(key, options);
  }
};
