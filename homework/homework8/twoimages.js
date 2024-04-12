var year2010 = '2010'
var year2011 = '2011'
var year2021 = '2021'
var year2016 = '2016'

var dataset2011 = ee.ImageCollection('USDA/NAIP/DOQQ').
filter(ee.Filter.bounds(geometry)).
filter(ee.Filter.date(year2010 + '-01-01', year2011 + '-12-31'))

var dataset2016 = ee.ImageCollection('USDA/NAIP/DOQQ').
filter(ee.Filter.bounds(geometry)).
filter(ee.Filter.date(year2016 + '-01-01', year2016 + '-12-31'))

var dataset2021 = ee.ImageCollection('USDA/NAIP/DOQQ').
filter(ee.Filter.bounds(geometry)).
filter(ee.Filter.date(year2021 + '-01-01', year2021 + '-12-31'))


var img2011 = dataset2011.select(['R','G','B'])
img2011 = img2011.median().clip(geometry);

var img2021 = dataset2021.select(['R','G','B'])
img2021 = img2021.median().clip(geometry);

var img2016 = dataset2016.select(['R','G','B'])
img2016 = img2016.median().clip(geometry);

var trueColorVis = {
    min: 0,
    max: 255,
};

// Code from:
// https://medium.com/google-earth/histogram-matching-c7153c85066d
// Create a lookup table to make sourceHist match targetHist.
var lookup = function(sourceHist, targetHist) {
    // Split the histograms by column and normalize the counts.
    var sourceValues = sourceHist.slice(1, 0, 1).project([0])
    var sourceCounts = sourceHist.slice(1, 1, 2).project([0])
    sourceCounts = sourceCounts.divide(sourceCounts.get([-1]))
  
    var targetValues = targetHist.slice(1, 0, 1).project([0])
    var targetCounts = targetHist.slice(1, 1, 2).project([0])
    targetCounts = targetCounts.divide(targetCounts.get([-1]))
  
    // Find first position in target where targetCount >= srcCount[i], for each i.
    var lookup = sourceCounts.toList().map(function(n) {
      var index = targetCounts.gte(n).argmax()
      return targetValues.get(index)
    })
    return {x: sourceValues.toList(), y: lookup}
  }
  
  // Make the histogram of sourceImg match targetImg.
  var histogramMatch = function(sourceImg, targetImg) {
    var geom = sourceImg.geometry()
    var args = {
      reducer: ee.Reducer.autoHistogram({maxBuckets: 256, cumulative: true}), 
      geometry: geom,
      scale: 30, // Need to specify a scale, but it doesn't matter what it is because bestEffort is true.
      maxPixels: 65536 * 4 - 1,
      bestEffort: true
    }
    
    // Only use pixels in target that have a value in source
    // (inside the footprint and unmasked).
    var source = sourceImg.reduceRegion(args)
    var target = targetImg.updateMask(sourceImg.mask()).reduceRegion(args)
  
    return ee.Image.cat(
      sourceImg.select(['R'])
        .interpolate(lookup(source.getArray('R'), target.getArray('R'))),
      sourceImg.select(['G'])
        .interpolate(lookup(source.getArray('G'), target.getArray('G'))),
      sourceImg.select(['B'])
        .interpolate(lookup(source.getArray('B'), target.getArray('B')))
    )
  }
  
  
  var result = histogramMatch(img2021,img2011)
  var result2 = histogramMatch(img2016,img2021)

Map.setCenter(-86.88035647024142, 35.94307403605276, 16.5);
Map.addLayer(img2011, trueColorVis, year2011);
Map.addLayer(img2016, trueColorVis, year2016);
Map.addLayer(img2021, trueColorVis, year2021);
Map.addLayer(result, trueColorVis, 'Histogram Matched' + year2011);
Map.addLayer(result2, trueColorVis, 'Histogram Matched' + year2016);





