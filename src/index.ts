import * as makerjs from 'makerjs';

class HalfRodClip {
    public paths: makerjs.IPathMap;
    constructor(radius: number, angle: number, thickness: number, tipPct: number, fillet: number, bottom: number, mirror: boolean) {

        //0 = thickness / 2
        //1 = thickness
        var tipRadius = (thickness / 2) * (1 + tipPct);

        var tipCenter = makerjs.point.rotate([radius + tipRadius, 0], angle);
        var tipArc = new makerjs.paths.Arc(tipCenter, tipRadius, tipPct ? angle - 180 : angle, angle + 180);

        var outerRadius = radius + thickness;
        var bandOuter = new makerjs.paths.Arc([0, 0], outerRadius, 270, angle);

        if (tipPct) {
            var int = makerjs.path.intersection(bandOuter, tipArc)
            if (int) {
                bandOuter.endAngle = int.path1Angles[0]
                tipArc.startAngle = int.path2Angles[0]
            }
        }

        var base = new makerjs.paths.Line([0, -outerRadius], [outerRadius, -outerRadius]);
        var baseFillet = makerjs.path.fillet(base, bandOuter, fillet);

        var bottomY = -(outerRadius + bottom);

        this.paths = {
            bandInner: new makerjs.paths.Arc([0, 0], radius, 270, angle),
            bandOuter,
            ttip: tipArc,
            base,
            baseFillet,
            bottomLine: new makerjs.paths.Line([0, bottomY], [outerRadius, bottomY]),
            bottomRight: new makerjs.paths.Line([outerRadius, -outerRadius], [outerRadius, bottomY]),
        };

        var tipFillet = makerjs.path.fillet(bandOuter, tipArc, thickness)
        if (tipFillet && tipFillet.radius) {
            this.paths.tipFillet = tipFillet
        }

        var tipHoleRadius = tipRadius - thickness;
        if (tipHoleRadius > 0) {
            this.paths.tipHole = new makerjs.paths.Circle(tipCenter, tipHoleRadius)
        }

        if (!mirror) {
            this.paths.bottomLeft = new makerjs.paths.Line([0, -radius], [0, bottomY]);
        }
    }
}

class RodClip implements makerjs.IModel {
    public models: makerjs.IModelMap;
    constructor(radius: number, angle: number, thickness: number, tipPct: number, fillet: number, bottom: number, mirror: boolean) {
        this.models = {
            right: new HalfRodClip(radius, angle, thickness, tipPct, fillet, bottom, mirror)
        };
        if (mirror) {
            this.models.left = makerjs.model.mirror(this.models.right, true, false);
        }
    }
}

(<makerjs.IKit>RodClip).metaParameters = [
    { title: "radius", type: "range", min: 10, max: 100, step: 1, value: 25 },
    { title: "angle", type: "range", min: 0, max: 60, step: 1, value: 45 },
    { title: "thickness", type: "range", min: 0.1, max: 5, step: 0.1, value: 2 },
    { title: "tip", type: "range", min: 0, max: 5, step: 0.1, value: 2 },
    { title: "baseFillet", type: "range", min: 1, max: 5, step: 1, value: 2 },
    { title: "bottom", type: "range", min: 1, max: 10, step: 1, value: 4 },
    { title: "mirror", type: "bool", value: true },
];

module.exports = RodClip;
