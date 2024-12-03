/*
    This implementation in its entirety was taken from: 
    https://codesandbox.io/p/sandbox/leaflettimedimensionchoropleth-r3edo?file=%2Fsrc%2Findex.js
*/

L.TimeDimension.Layer.Choropleth = L.TimeDimension.Layer.extend({
    initialize: function(layer, options) {
      L.TimeDimension.Layer.prototype.initialize.call(this, layer, options);
      if (!this._baseLayer) {
        console.error('Base layer is not defined. Check the initialization logic.');
        return;
      }
      this._loaded = false;
      if (this._baseLayer.getLayers().length === 0) {
        this._baseLayer.on("ready", this._onReadyBaseLayer, this);
      } else {
        this._onReadyBaseLayer();
      }
    },
  
    _onReadyBaseLayer: function() {
      this._loaded = true;
      this._update();
    },
  
    onAdd: function(map) {
      L.TimeDimension.Layer.prototype.onAdd.call(this, map);
      map.addLayer(this._baseLayer);
    },
  
    isReady: function(time) {
      return this._loaded;
    },
  
    _update: function() {
      if (!this._map) return;
      if (!this._loaded) return;
  
      // Dynamically reset style for all features in the layer
      this._baseLayer.eachLayer(layer => {
        if (layer.feature) {
          const newStyle = this._baseLayer.options.style(layer.feature);
          layer.setStyle(newStyle);
        }
      });
    },
  
    _onNewTimeLoading: function(ev) {
      this._update(); // Update the layer styles when the time changes
    }
  });
  
  L.timeDimension.layer.choropleth = function(layer, options) {
    return new L.TimeDimension.Layer.Choropleth(layer, options);
  };