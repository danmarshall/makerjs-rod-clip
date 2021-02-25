const makerjs = require('makerjs');
const RodClip = require('../dist/es5');

const rodClip = new RodClip(25, 45, 2, 2, 2, 4, true);

process.stdout.write(makerjs.exporter.toSVG(rodClip, { units: makerjs.unitType.Millimeter }));
