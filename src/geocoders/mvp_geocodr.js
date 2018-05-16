import L from 'leaflet';
import { getJSON } from '../util';

export default {
  class: L.Class.extend({
    options: {
      serviceUrl: '',
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
          key: this._key,
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
          key: this._key,
          query: latLng.lng + ',' + latLng.lat
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
        f;

      if (data && data.features) {
        for (i = 0; i < data.features.length; i++) {
          f = data.features[i];
          results.push({
            name: this._deocodeFeatureName(f),
            html: this.options.htmlTemplate ? this.options.htmlTemplate(f) : undefined,
            feature: f,
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
